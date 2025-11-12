require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const jose = require('node-jose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const https = require('https');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar axios para aceptar certificados SSL auto-firmados
const httpsAgent = new https.Agent({ 
  rejectUnauthorized: false
});
axios.defaults.httpsAgent = httpsAgent;

app.set('trust proxy', 1);

// Cargar claves JWKS
const keystore = jose.JWK.createKeyStore();
const keys = JSON.parse(fs.readFileSync('./keys.json'));
keystore.add(keys.keys[0]);

// Almacenamiento temporal para states (en producción usar Redis)
const stateStore = new Map();

// ============================================
// PERSISTENCIA DE ENTREGAS EN ARCHIVO JSON
// ============================================
const SUBMISSIONS_FILE = './submissions.json';
const BACKUP_DIR = './backups';
let isWriting = false; // Flag para evitar escrituras simultáneas

// Crear directorio de backups si no existe
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('📁 Directorio de backups creado');
}

// Cargar entregas desde archivo al iniciar
function loadSubmissions() {
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
      
      // Validar que sea JSON válido
      let submissions;
      try {
        submissions = JSON.parse(data);
      } catch (parseError) {
        console.error('⚠️  JSON corrupto, intentando recuperar desde backup...');
        return loadFromBackup();
      }
      
      // Validar estructura de datos
      if (typeof submissions !== 'object' || submissions === null) {
        console.error('⚠️  Estructura de datos inválida, intentando recuperar desde backup...');
        return loadFromBackup();
      }
      
      // Cargar cada entrega al Map
      Object.entries(submissions).forEach(([id, submission]) => {
        // Validar que cada entrega tenga los campos mínimos requeridos
        if (submission && submission.submissionId && submission.userId) {
          submissionsStore.set(id, submission);
        } else {
          console.warn(`⚠️  Entrega con ID ${id} tiene datos incompletos, omitiendo`);
        }
      });
      
      console.log(`📦 Cargadas ${submissionsStore.size} entregas desde disco`);
    } else {
      console.log('📭 No hay entregas guardadas previamente');
    }
  } catch (error) {
    console.error('❌ Error al cargar entregas:', error.message);
    console.log('🔄 Intentando recuperar desde backup...');
    loadFromBackup();
  }
}

// Cargar desde el backup más reciente
function loadFromBackup() {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('submissions_backup_'))
      .sort()
      .reverse();
    
    if (backups.length === 0) {
      console.log('📭 No hay backups disponibles');
      return;
    }
    
    const latestBackup = path.join(BACKUP_DIR, backups[0]);
    const data = fs.readFileSync(latestBackup, 'utf8');
    const submissions = JSON.parse(data);
    
    Object.entries(submissions).forEach(([id, submission]) => {
      if (submission && submission.submissionId && submission.userId) {
        submissionsStore.set(id, submission);
      }
    });
    
    console.log(`✅ Recuperadas ${submissionsStore.size} entregas desde backup: ${backups[0]}`);
  } catch (error) {
    console.error('❌ Error al recuperar desde backup:', error.message);
  }
}

// Crear backup antes de sobrescribir
function createBackup() {
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(BACKUP_DIR, `submissions_backup_${timestamp}.json`);
      fs.copyFileSync(SUBMISSIONS_FILE, backupFile);
      
      // Mantener solo los últimos 5 backups
      const backups = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('submissions_backup_'))
        .sort();
      
      while (backups.length > 5) {
        const oldBackup = backups.shift();
        fs.unlinkSync(path.join(BACKUP_DIR, oldBackup));
        console.log(`🗑️  Backup antiguo eliminado: ${oldBackup}`);
      }
      
      console.log(`💾 Backup creado: ${path.basename(backupFile)}`);
    }
  } catch (error) {
    console.error('⚠️  Error al crear backup:', error.message);
  }
}

// Guardar entregas en archivo con protección contra escrituras simultáneas
function saveSubmissions() {
  // Evitar escrituras simultáneas
  if (isWriting) {
    console.log('⏳ Escritura en progreso, esperando...');
    setTimeout(() => saveSubmissions(), 100);
    return;
  }
  
  isWriting = true;
  
  try {
    // Crear backup antes de sobrescribir
    createBackup();
    
    // Convertir Map a objeto
    const submissions = Object.fromEntries(submissionsStore);
    
    // Escribir a archivo temporal primero
    const tempFile = SUBMISSIONS_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(submissions, null, 2), 'utf8');
    
    // Validar que el archivo temporal sea JSON válido
    const testData = fs.readFileSync(tempFile, 'utf8');
    JSON.parse(testData); // Lanza error si no es válido
    
    // Renombrar archivo temporal al definitivo (operación atómica)
    fs.renameSync(tempFile, SUBMISSIONS_FILE);
    
    console.log(`💾 Entregas guardadas en disco (${submissionsStore.size} entregas)`);
  } catch (error) {
    console.error('❌ Error al guardar entregas:', error.message);
    
    // Eliminar archivo temporal si existe
    const tempFile = SUBMISSIONS_FILE + '.tmp';
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  } finally {
    isWriting = false;
  }
}

// Almacenamiento de entregas con persistencia
const submissionsStore = new Map();

// Cargar entregas al iniciar el servidor
loadSubmissions();

// Configurar multer para subida de archivos
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    // Aceptar solo ciertos tipos de archivos
    const allowedTypes = /pdf|doc|docx|zip|rar|txt|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// Crear directorio de uploads si no existe
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Configuración de Moodle desde .env
const MOODLE_URL = process.env.MOODLE_URL;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN;
const MOODLE_REST_ENDPOINT = `${MOODLE_URL}/webservice/rest/server.php`;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'un-secreto-muy-seguro-y-largo-aqui',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Cambiar a true en producción con HTTPS
    sameSite: 'none'
  }
}));

// Middleware CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Función para llamar a Moodle API
async function callMoodleAPI(wsfunction, params = {}) {
  const requestParams = {
    wstoken: MOODLE_TOKEN,
    wsfunction: wsfunction,
    moodlewsrestformat: 'json',
    ...params
  };
  
  console.log(`Llamando a Moodle API: ${wsfunction}`);
  
  try {
    const response = await axios.get(MOODLE_REST_ENDPOINT, {
      params: requestParams,
      timeout: 10000
    });

    if (response.data.exception) {
      console.error('Error de Moodle API:', response.data);
      throw new Error(`Moodle Error: ${response.data.message} (${response.data.exception})`);
    }

    return response.data;
  } catch (error) {
    console.error('Error en la llamada a Axios:', error.message);
    throw error;
  }
}

// ============================================
// ENDPOINTS LTI 1.3
// ============================================

// Página principal
app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  res.send(`
    <h1>🌐 Servidor LTI 1.3 - Herramienta de Entregas</h1>
    <ul>
      <li><a href="/.well-known/openid-configuration">Ver configuración OpenID</a></li>
      <li><a href="/jwks.json">Ver claves públicas (JWKS)</a></li>
    </ul>
    <h2>Configuración para Moodle:</h2>
    <ul>
      <li><strong>Tool URL:</strong> ${baseUrl}</li>
      <li><strong>Initiate login URL:</strong> ${baseUrl}/login</li>
      <li><strong>Redirection URI(s):</strong> ${baseUrl}/launch</li>
      <li><strong>Public keyset URL:</strong> ${baseUrl}/jwks.json</li>
    </ul>
  `);
});

// Configuración OpenID
app.get('/.well-known/openid-configuration', (req, res) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  res.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/login`,
    token_endpoint: `${baseUrl}/token`,
    jwks_uri: `${baseUrl}/jwks.json`,
    response_types_supported: ['id_token'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    scopes_supported: ['openid'],
    claims_supported: ['sub']
  });
});

// JWKS público
app.get('/jwks.json', (req, res) => {
  res.json(keystore.toJSON());
});

// Login OIDC (GET/POST)
app.all('/login', (req, res) => {
  const query = req.method === 'POST' ? req.body : req.query;
  const { iss, login_hint, target_link_uri, client_id, lti_message_hint } = query;

  console.log('📥 Petición a /login con:', query);

  if (!iss || !login_hint || !client_id || !target_link_uri) {
    return res.status(400).send('Faltan parámetros requeridos en /login');
  }

  const state = Math.random().toString(36).substring(2, 15);
  const nonce = Math.random().toString(36).substring(2, 15);

  console.log('🔐 Guardando state en memoria:', state);

  // Guardar en memoria temporal (expira en 5 minutos)
  stateStore.set(state, {
    nonce,
    client_id,
    timestamp: Date.now()
  });

  // Limpiar states antiguos (más de 5 minutos)
  for (const [key, value] of stateStore.entries()) {
    if (Date.now() - value.timestamp > 300000) {
      stateStore.delete(key);
    }
  }

  const authUrl = new URL(`${iss}/mod/lti/auth.php`);
  const params = new URLSearchParams({
    response_type: 'id_token',
    response_mode: 'form_post',
    scope: 'openid',
    client_id,
    redirect_uri: process.env.BASE_URL ? `${process.env.BASE_URL}/launch` : `http://localhost:${PORT}/launch`,
    login_hint,
    state,
    nonce,
    prompt: 'none'
  });

  if (lti_message_hint) {
    params.append('lti_message_hint', lti_message_hint);
  }

  console.log('↪️  Redirigiendo a:', `${authUrl}?${params.toString()}`);
  res.redirect(`${authUrl}?${params.toString()}`);
});

// Lanzamiento (launch)
app.post('/launch', async (req, res) => {
  const { id_token, state } = req.body;

  console.log('🚀 Lanzamiento recibido');
  console.log('🔐 State recibido:', state);

  if (!id_token) return res.status(400).send('Falta el id_token');
  
  // Recuperar datos del state store
  const stateData = stateStore.get(state);
  console.log('🔐 State en memoria:', stateData);

  if (!stateData) {
    return res.status(400).send('Invalid state - posible ataque CSRF o state expirado');
  }

  const { nonce, client_id: expectedClientId } = stateData;

  // Eliminar el state usado (solo válido una vez)
  stateStore.delete(state);

  try {
    const decoded = jwt.decode(id_token, { complete: true });
    if (!decoded) return res.status(400).send('Token JWT inválido');

    const { payload } = decoded;
    console.log('📦 Payload del token:', JSON.stringify(payload, null, 2));

    // Validar issuer y audience
    const expectedIssuer = MOODLE_URL;

    if (payload.iss !== expectedIssuer) {
      return res.status(401).send(`Issuer no válido. Esperado: ${expectedIssuer}, Recibido: ${payload.iss}`);
    }
    
    if (
      (Array.isArray(payload.aud) && !payload.aud.includes(expectedClientId)) ||
      (!Array.isArray(payload.aud) && payload.aud !== expectedClientId)
    ) {
      return res.status(401).send('Client ID no válido');
    }

    if (payload.nonce !== nonce) {
      return res.status(401).send('Nonce no válido');
    }

    // Verificar firma del token
    try {
      const jwksUrl = `${payload.iss}/mod/lti/certs.php`;
      console.log('🔑 Obteniendo JWKS de:', jwksUrl);
      
      const jwksResponse = await axios.get(jwksUrl);
      const jwks = jwksResponse.data;
      const client = await jose.JWK.asKeyStore(jwks);
      await jose.JWS.createVerify(client).verify(id_token);
      
      console.log('✅ Firma del token verificada correctamente');
    } catch (err) {
      console.error('❌ Error al verificar firma:', err.message);
      return res.status(500).send(`Error al verificar firma del token: ${err.message}`);
    }

    // Extraer información del usuario
    const userId = payload.sub;
    const userName = payload.name || payload.email || 'Usuario';
    const userEmail = payload.email || '';
    const roles = payload['https://purl.imsglobal.org/spec/lti/claim/roles'] || [];
    const context = payload['https://purl.imsglobal.org/spec/lti/claim/context'] || {};
    const resourceLink = payload['https://purl.imsglobal.org/spec/lti/claim/resource_link'] || {};
    const deploymentId = payload['https://purl.imsglobal.org/spec/lti/claim/deployment_id'];
    
    // ID único de la tarea/recurso (para diferenciar entre múltiples tareas)
    const resourceLinkId = resourceLink.id || 'unknown';
    const resourceTitle = resourceLink.title || 'Tarea';

    // Detectar si es profesor
    const isInstructor = roles.some(role => 
      role.includes('Instructor') || 
      role.includes('Administrator') ||
      role.includes('TeachingAssistant') ||
      role.includes('ContentDeveloper')
    );

    console.log('👤 Usuario:', userName);
    console.log('📧 Email:', userEmail);
    console.log('🎭 Roles:', roles);
    console.log('� Tarea ID:', resourceLinkId);
    console.log('📝 Tarea Título:', resourceTitle);
    console.log('�👨‍🏫 Es instructor:', isInstructor);

    // Redirigir a la vista correspondiente
    if (isInstructor) {
      // Vista de profesor: mostrar entregas
      return mostrarEntregas(res, userId, userName, context, resourceLinkId, resourceTitle);
    } else {
      // Vista de alumno: formulario de entrega
      return mostrarFormularioEntrega(res, userId, userName, context, resourceLinkId, resourceTitle);
    }

  } catch (err) {
    console.error('❌ Error al procesar el lanzamiento:', err.message);
    res.status(500).send(`<h1>❌ Error al procesar el lanzamiento</h1><p>${err.message}</p>`);
  }
});

// ============================================
// FUNCIONES DE VISTA
// ============================================

async function mostrarEntregas(res, userId, userName, context, resourceLinkId, resourceTitle) {
  // Obtener entregas del nuevo sistema (submissionsStore) FILTRADAS POR ESTA TAREA
  const allSubmissions = Array.from(submissionsStore.values());
  const localSubmissions = allSubmissions.filter(sub => sub.resourceLinkId === resourceLinkId);
  
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Entregas de Estudiantes</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f7fa;
        }
        h1 { color: #2c3e50; margin-bottom: 10px; }
        .user-info {
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stats {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          flex: 1;
          text-align: center;
        }
        .stat-number {
          font-size: 2em;
          color: #3498db;
          font-weight: bold;
        }
        .stat-label {
          color: #7f8c8d;
          margin-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ecf0f1;
        }
        th {
          background-color: #3498db;
          color: white;
          font-weight: 600;
        }
        tr:hover { background-color: #f8f9fa; }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.85em;
          font-weight: 600;
        }
        .badge-complete {
          background: #d4edda;
          color: #155724;
        }
        .badge-pending {
          background: #fff3cd;
          color: #856404;
        }
        .btn {
          display: inline-block;
          padding: 6px 12px;
          background-color: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 0.9em;
        }
        .btn:hover {
          background-color: #2980b9;
          text-decoration: none;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #7f8c8d;
        }
        .empty-state-icon {
          font-size: 4em;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="user-info">
        <strong>👨‍🏫 Profesor:</strong> ${userName}<br>
        <strong>📚 Curso:</strong> ${context.title || 'N/A'}<br>
        <strong>📝 Tarea:</strong> ${resourceTitle}
      </div>
      
      <h1>📋 Entregas de Estudiantes - ${resourceTitle}</h1>
      
      <div class="stats">
        <div class="stat-card">
          <div class="stat-number">${localSubmissions.length}</div>
          <div class="stat-label">Total de entregas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${localSubmissions.filter(s => s.questionnaire).length}</div>
          <div class="stat-label">Con cuestionario</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${localSubmissions.filter(s => !s.questionnaire).length}</div>
          <div class="stat-label">Pendientes</div>
        </div>
      </div>
      
      ${localSubmissions.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h2>No hay entregas aún</h2>
          <p>Los estudiantes aún no han enviado ninguna tarea.</p>
        </div>
      ` : `
        <table>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Archivo</th>
              <th>Fecha de entrega</th>
              <th>Estado</th>
              <th>Calificación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${localSubmissions.map(sub => {
              const uploadDate = new Date(sub.uploadedAt);
              const hasQuestionnaire = !!sub.questionnaire;
              const hasGrade = sub.grade && sub.grade.teacherScore !== null;
              
              return `
                <tr>
                  <td>
                    <strong>${sub.userName}</strong><br>
                    <small style="color: #7f8c8d;">ID: ${sub.userId}</small>
                  </td>
                  <td>
                    📎 ${sub.fileName}<br>
                    <small style="color: #7f8c8d;">${formatBytes(sub.fileSize)}</small>
                  </td>
                  <td>${uploadDate.toLocaleString('es-ES')}</td>
                  <td>
                    ${hasQuestionnaire 
                      ? '<span class="badge badge-complete">✅ Completa</span>' 
                      : '<span class="badge badge-pending">⏳ Sin cuestionario</span>'}
                  </td>
                  <td>
                    ${hasGrade 
                      ? `<strong style="color: #27ae60; font-size: 1.2em;">${sub.grade.teacherScore}/10</strong>` 
                      : '<span style="color: #95a5a6;">Sin calificar</span>'}
                  </td>
                  <td>
                    <a href="/ver-entrega/${sub.submissionId}" class="btn">👁️ Ver detalles</a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `}
      
      <script>
        function formatBytes(bytes) {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }
      </script>
    </body>
    </html>
  `);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function mostrarFormularioEntrega(res, userId, userName, context, resourceLinkId, resourceTitle) {
  // Buscar si el estudiante ya tiene una entrega PARA ESTA TAREA ESPECÍFICA
  const existingSubmission = Array.from(submissionsStore.values())
    .find(sub => sub.userId === userId && sub.resourceLinkId === resourceLinkId);

  // Si ya tiene una entrega, mostrar la vista de revisión/edición
  if (existingSubmission) {
    const uploadDate = new Date(existingSubmission.uploadedAt);
    const hasQuestionnaire = !!existingSubmission.questionnaire;
    
    // DEBUG: Ver qué datos tiene la entrega
    console.log('🔍 DEBUG - Mostrando entrega del estudiante:');
    console.log('  - submissionId:', existingSubmission.submissionId);
    console.log('  - userId:', existingSubmission.userId);
    console.log('  - userName:', existingSubmission.userName);
    console.log('  - grade:', JSON.stringify(existingSubmission.grade, null, 2));

    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tu Entrega</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f7fa;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
          h1 { color: #2c3e50; margin-bottom: 10px; }
          .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 0.9em;
            font-weight: 600;
          }
          .badge-complete {
            background: #d4edda;
            color: #155724;
          }
          .badge-pending {
            background: #fff3cd;
            color: #856404;
          }
          .user-info {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 25px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #3498db;
          }
          .section h2 {
            margin-top: 0;
            color: #2c3e50;
            font-size: 1.3em;
          }
          .info-grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 10px;
            margin-top: 10px;
          }
          .info-label {
            font-weight: 600;
            color: #7f8c8d;
          }
          .info-value {
            color: #2c3e50;
          }
          .comment-box {
            background: white;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #bdc3c7;
            margin-top: 10px;
            font-style: italic;
            color: #555;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 5px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            text-align: center;
          }
          .btn-primary {
            background-color: #3498db;
            color: white;
          }
          .btn-primary:hover { background-color: #2980b9; }
          .btn-warning {
            background-color: #f39c12;
            color: white;
          }
          .btn-warning:hover { background-color: #e67e22; }
          .btn-success {
            background-color: #27ae60;
            color: white;
          }
          .btn-success:hover { background-color: #229954; }
          .questionnaire-summary {
            background: white;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
          }
          .answer-item {
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ecf0f1;
          }
          .answer-item:last-child { border-bottom: none; }
          .answer-label {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          .answer-value {
            color: #555;
          }
          .actions {
            text-align: center;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📋 Tu Entrega ${hasQuestionnaire 
            ? '<span class="badge badge-complete">✅ Entrega Completa</span>' 
            : '<span class="badge badge-pending">⏳ Pendiente de Cuestionario</span>'}</h1>
          
          <div class="user-info">
            <strong>👤 Estudiante:</strong> ${userName}<br>
            <strong>📚 Curso:</strong> ${context.title || 'N/A'}<br>
            <strong>📝 Tarea:</strong> ${resourceTitle}<br>
            <strong>⏰ Entregado:</strong> ${uploadDate.toLocaleString('es-ES')}
          </div>
          
          <hr style="margin: 25px 0; border: none; border-top: 1px solid #ecf0f1;">
          
          <!-- Información del Archivo -->
          <div class="section">
            <h2>📎 Archivo Entregado</h2>
            <div class="info-grid">
              <span class="info-label">Nombre:</span>
              <span class="info-value">${existingSubmission.fileName}</span>
              
              <span class="info-label">Tamaño:</span>
              <span class="info-value">${formatBytes(existingSubmission.fileSize)}</span>
            </div>
            
            <div style="margin-top: 15px;">
              <a href="/download/${existingSubmission.submissionId}" 
                 class="btn btn-primary" 
                 download
                 style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px; font-weight: 600;">
                📥 Descargar mi archivo
              </a>
            </div>
            
            ${existingSubmission.comments ? `
              <h3 style="margin-top: 15px; margin-bottom: 5px;">💬 Tus comentarios:</h3>
              <div class="comment-box">${existingSubmission.comments}</div>
            ` : '<p style="color: #7f8c8d; margin-top: 10px;"><em>No agregaste comentarios.</em></p>'}
          </div>
          
          <hr style="margin: 25px 0; border: none; border-top: 1px solid #ecf0f1;">
          
          <!-- Respuestas del Cuestionario -->
          <div class="section">
            <h2>📝 Cuestionario</h2>
            ${hasQuestionnaire ? `
              <div class="questionnaire-summary">
                <div class="answer-item">
                  <div class="answer-label">⏱️ Tiempo dedicado:</div>
                  <div class="answer-value">${formatTimeSpent(existingSubmission.questionnaire.timeSpent)}</div>
                </div>
                
                <div class="answer-item">
                  <div class="answer-label">� Nivel de dificultad:</div>
                  <div class="answer-value">${formatDifficulty(existingSubmission.questionnaire.difficulty)}</div>
                </div>
                
                <div class="answer-item">
                  <div class="answer-label">📚 Recursos externos utilizados:</div>
                  <div class="answer-value">
                    ${existingSubmission.questionnaire.resourcesUsed.length > 0 
                      ? existingSubmission.questionnaire.resourcesUsed.map(r => `• ${formatResource(r)}`).join('<br>') 
                      : 'No utilizaste recursos externos'}
                  </div>
                </div>
                
                <div class="answer-item">
                  <div class="answer-label">💭 Principales desafíos:</div>
                  <div class="answer-value">${existingSubmission.questionnaire.challenges}</div>
                </div>
                
                <div class="answer-item">
                  <div class="answer-label">🎓 Aprendizajes obtenidos:</div>
                  <div class="answer-value">${existingSubmission.questionnaire.learnings}</div>
                </div>
              </div>
            ` : `
              <p style="color: #e67e22;">⚠️ Aún no has completado el cuestionario.</p>
              <div class="actions">
                <a href="/cuestionario?submissionId=${existingSubmission.submissionId}" class="btn btn-success">
                  📝 Completar Cuestionario Ahora
                </a>
              </div>
            `}
          </div>
          
          <hr style="margin: 25px 0; border: none; border-top: 1px solid #ecf0f1;">
          
          <!-- Acciones -->
          <div class="actions" style="text-align: center;">
            <button onclick="confirmarReemplazo()" class="btn btn-warning">
              🔄 Reemplazar Entrega
            </button>
          </div>
        </div>
        
        <!-- Calificación -->
        ${existingSubmission.grade && existingSubmission.grade.teacherScore !== null ? `
        <div class="container">
          <div class="section" style="border-left-color: #27ae60;">
            <h2>⭐ Calificación</h2>
            <div style="text-align: center; padding: 20px;">
              <div style="font-size: 3em; color: #27ae60; font-weight: bold; margin-bottom: 10px;">
                ${existingSubmission.grade.teacherScore}/10
              </div>
              <div style="color: #7f8c8d; font-size: 0.95em;">
                Calificado por: ${existingSubmission.grade.gradedBy || 'Profesor'}<br>
                ${existingSubmission.grade.gradedAt ? `Fecha: ${new Date(existingSubmission.grade.gradedAt).toLocaleString('es-ES')}` : ''}
              </div>
              ${existingSubmission.grade.feedback ? `
                <div style="margin-top: 20px; text-align: left;">
                  <div class="answer-label">💬 Comentarios del profesor:</div>
                  <div class="comment-box">${existingSubmission.grade.feedback}</div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        ` : `
        <div class="container">
          <div class="section" style="border-left-color: #95a5a6;">
            <h2>⭐ Calificación</h2>
            <div style="text-align: center; padding: 20px; color: #7f8c8d;">
              <div style="font-size: 2em; margin-bottom: 10px;">⏳</div>
              <p>Tu entrega aún no ha sido calificada.</p>
              <p style="font-size: 0.9em;">El profesor revisará tu trabajo y asignará una nota pronto.</p>
            </div>
          </div>
        </div>
        `}

        <!-- Modal de confirmación -->
        <div id="modalReemplazo" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000;">
          <div style="background:white; max-width:500px; margin:100px auto; padding:30px; border-radius:8px; text-align:center;">
            <h2>⚠️ Confirmar Reemplazo</h2>
            <p>¿Estás seguro de que quieres reemplazar tu entrega actual?</p>
            <p style="color:#e74c3c;"><strong>Esto eliminará tu archivo y cuestionario anteriores.</strong></p>
            <br>
            <button onclick="cerrarModal()" class="btn btn-primary">❌ Cancelar</button>
            <button onclick="mostrarFormularioNuevo()" class="btn btn-warning">✅ Sí, Reemplazar</button>
          </div>
        </div>

        <!-- Formulario nuevo (oculto) -->
        <div id="formularioNuevo" style="display:none;">
          <div class="container">
            <h2>📤 Nueva Entrega</h2>
            <form id="uploadForm" enctype="multipart/form-data">
              <input type="hidden" name="userId" value="${userId}">
              <input type="hidden" name="userName" value="${userName}">
              <input type="hidden" name="contextTitle" value="${context.title || 'N/A'}">
              <input type="hidden" name="resourceLinkId" value="${resourceLinkId}">
              <input type="hidden" name="resourceTitle" value="${resourceTitle}">
              <input type="hidden" name="replace" value="true">
              <input type="hidden" name="oldSubmissionId" value="${existingSubmission.submissionId}">
              
              <div class="form-group" style="margin-bottom:20px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">📎 Nuevo archivo:</label>
                <input type="file" name="file" required style="width:100%; padding:10px; border:1px solid #bdc3c7; border-radius:4px;">
              </div>
              
              <div class="form-group" style="margin-bottom:20px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">💬 Comentarios (opcional):</label>
                <textarea name="comments" rows="4" style="width:100%; padding:10px; border:1px solid #bdc3c7; border-radius:4px; box-sizing:border-box;"
                  placeholder="Agrega aquí cualquier comentario sobre tu entrega..."></textarea>
              </div>
              
              <button type="submit" class="btn btn-success">📤 Subir Nueva Entrega</button>
              <button type="button" onclick="cancelarReemplazo()" class="btn btn-primary">❌ Cancelar</button>
            </form>
            <div id="result" style="margin-top:20px;"></div>
          </div>
        </div>

        <script>
          function confirmarReemplazo() {
            document.getElementById('modalReemplazo').style.display = 'block';
          }

          function cerrarModal() {
            document.getElementById('modalReemplazo').style.display = 'none';
          }

          function mostrarFormularioNuevo() {
            cerrarModal();
            document.getElementById('formularioNuevo').style.display = 'block';
            window.scrollTo(0, document.body.scrollHeight);
          }

          function cancelarReemplazo() {
            document.getElementById('formularioNuevo').style.display = 'none';
            window.scrollTo(0, 0);
          }

          // Manejo del formulario de reemplazo
          document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const resultDiv = document.getElementById('result');
            const submitBtn = e.target.querySelector('button[type="submit"]');
            
            submitBtn.disabled = true;
            resultDiv.innerHTML = '<p>📤 Subiendo nuevo archivo...</p>';
            
            const formData = new FormData(e.target);
            
            try {
              const response = await fetch('/upload', {
                method: 'POST',
                body: formData
              });
              
              const data = await response.json();
              
              if (response.ok) {
                resultDiv.innerHTML = \`
                  <div style="color:#27ae60; padding:15px; background:#d4edda; border-radius:4px;">
                    <h3>✅ Entrega reemplazada correctamente</h3>
                    <p>Ahora responde el cuestionario...</p>
                  </div>
                \`;
                
                setTimeout(() => {
                  window.location.href = '/cuestionario?submissionId=' + data.submissionId;
                }, 1500);
              } else {
                resultDiv.innerHTML = \`
                  <div style="color:#c0392b; padding:15px; background:#f8d7da; border-radius:4px;">
                    <h3>❌ Error al subir el archivo</h3>
                    <p>\${data.error || 'Error desconocido'}</p>
                  </div>
                \`;
                submitBtn.disabled = false;
              }
            } catch (error) {
              resultDiv.innerHTML = \`
                <div style="color:#c0392b; padding:15px; background:#f8d7da; border-radius:4px;">
                  <h3>❌ Error de conexión</h3>
                  <p>\${error.message}</p>
                </div>
              \`;
              submitBtn.disabled = false;
            }
          });

          function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
          }
        </script>
      </body>
      </html>
    `);
    return;
  }

  // Si NO tiene entrega previa, mostrar formulario normal
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Entregar Tarea</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f7fa;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #2c3e50; }
        .user-info {
          background: #ecf0f1;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #2c3e50;
        }
        input[type="file"], textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #bdc3c7;
          border-radius: 4px;
          box-sizing: border-box;
        }
        button {
          background-color: #3498db;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
        }
        button:hover { background-color: #2980b9; }
        button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
        .success { 
          color: #27ae60; 
          padding: 15px; 
          background: #d4edda; 
          border-radius: 4px; 
          margin-top: 20px;
        }
        .error {
          color: #c0392b;
          padding: 15px;
          background: #f8d7da;
          border-radius: 4px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📤 Entregar Tarea</h1>
        
        <div class="user-info">
          <strong>👤 Estudiante:</strong> ${userName}<br>
          <strong>📚 Curso:</strong> ${context.title || 'N/A'}<br>
          <strong>📝 Tarea:</strong> ${resourceTitle}<br>
          <strong>🆔 User ID:</strong> ${userId}
        </div>
        
        <form id="uploadForm" enctype="multipart/form-data">
          <input type="hidden" name="userId" value="${userId}">
          <input type="hidden" name="userName" value="${userName}">
          <input type="hidden" name="contextTitle" value="${context.title || 'N/A'}">
          <input type="hidden" name="resourceLinkId" value="${resourceLinkId}">
          <input type="hidden" name="resourceTitle" value="${resourceTitle}">
          
          <div class="form-group">
            <label for="file">📎 Archivo a entregar:</label>
            <input type="file" id="file" name="file" required>
          </div>
          
          <div class="form-group">
            <label for="comments">💬 Comentarios (opcional):</label>
            <textarea id="comments" name="comments" rows="4" 
              placeholder="Agrega aquí cualquier comentario sobre tu entrega..."></textarea>
          </div>
          
          <button type="submit" id="submitBtn">Entregar Tarea</button>
        </form>
        
        <div id="result"></div>
      </div>
      
      <script>
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const resultDiv = document.getElementById('result');
          const submitBtn = document.getElementById('submitBtn');
          
          submitBtn.disabled = true;
          resultDiv.innerHTML = '<p>📤 Enviando archivo...</p>';
          
          const formData = new FormData(e.target);
          
          try {
            const response = await fetch('/upload', {
              method: 'POST',
              body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
              resultDiv.innerHTML = \`
                <div class="success">
                  <h3>✅ Archivo subido correctamente</h3>
                  <p><strong>IMPORTANTE:</strong> Se abrirá una ventana emergente con el cuestionario.</p>
                  <p>Si no se abre automáticamente, haz clic en el botón de abajo.</p>
                  <button onclick="openQuestionnairePopup('\${data.submissionId}')" style="margin-top: 10px; padding: 10px 20px; font-size: 16px; cursor: pointer;">
                    📝 Abrir Cuestionario
                  </button>
                  <p><small>⚠️ No cierres esta ventana hasta completar el cuestionario.</small></p>
                </div>
              \`;
              
              // Abrir cuestionario en popup automáticamente
              setTimeout(() => {
                openQuestionnairePopup(data.submissionId);
              }, 1000);
            } else {
              resultDiv.innerHTML = \`
                <div class="error">
                  <h3>❌ Error al subir el archivo</h3>
                  <p>\${data.error || 'Error desconocido'}</p>
                </div>
              \`;
              submitBtn.disabled = false;
            }
          } catch (error) {
            resultDiv.innerHTML = \`
              <div class="error">
                <h3>❌ Error de conexión</h3>
                <p>\${error.message}</p>
              </div>
            \`;
            submitBtn.disabled = false;
          }
        });
        
        // Función para abrir el cuestionario en popup
        function openQuestionnairePopup(submissionId) {
          const width = 800;
          const height = 700;
          const left = (screen.width / 2) - (width / 2);
          const top = (screen.height / 2) - (height / 2);
          
          // Abrir popup SIN barras de navegación
          const popup = window.open(
            '/cuestionario-popup?submissionId=' + submissionId,
            'cuestionario',
            \`width=\${width},height=\${height},left=\${left},top=\${top},toolbar=no,menubar=no,location=no,status=no,scrollbars=yes,resizable=yes\`
          );
          
          if (!popup) {
            alert('⚠️ Por favor, permite ventanas emergentes para este sitio y haz clic en el botón "Abrir Cuestionario".');
          } else {
            // Monitorear cuando se cierre el popup
            const checkPopup = setInterval(() => {
              if (popup.closed) {
                clearInterval(checkPopup);
                // NO recargar automáticamente para evitar error CSRF
                // En su lugar, mostrar mensaje de éxito
                resultDiv.innerHTML = \`
                  <div class="success">
                    <h3>✅ ¡Cuestionario completado!</h3>
                    <p>Tu tarea ha sido entregada exitosamente.</p>
                    <p>El profesor podrá revisar tu trabajo.</p>
                    <p><small>Puedes cerrar esta ventana.</small></p>
                  </div>
                \`;
                document.getElementById('uploadForm').style.display = 'none';
              }
            }, 500);
          }
        }
      </script>
    </body>
    </html>
  `);
}

// Función para obtener entregas de Moodle
async function getSubmissions(assignmentId) {
  const submissionsData = await callMoodleAPI('mod_assign_get_submissions', {
    'assignmentids[0]': assignmentId
  });

  if (!submissionsData.assignments || submissionsData.assignments.length === 0) {
    return [];
  }

  const submissions = submissionsData.assignments[0].submissions;
  const userIds = submissions.map(sub => sub.userid).filter(id => id > 0);

  if (userIds.length === 0) {
    return [];
  }
  
  const userParams = { field: 'id' };
  userIds.forEach((id, index) => {
    userParams[`values[${index}]`] = id;
  });

  const usersData = await callMoodleAPI('core_user_get_users_by_field', userParams);

  const combinedData = submissions.map(submission => {
    const user = usersData.find(u => u.id === submission.userid);
    
    const files = (submission.plugins || [])
      .filter(p => p.type === 'file')
      .flatMap(p => p.fileareas || [])
      .flatMap(fa => fa.files || [])
      .map(file => ({
        filename: file.filename,
        fileurl: file.fileurl ? `${file.fileurl}?token=${MOODLE_TOKEN}` : 'URL no disponible'
      }));

    return {
      submission_id: submission.id,
      user_id: user ? user.id : submission.userid,
      user_fullname: user ? user.fullname : 'Usuario no encontrado',
      user_email: user ? user.email : 'N/A',
      status: submission.status,
      grade: submission.grade,
      files: files
    };
  });

  return combinedData;
}

// ============================================
// ENDPOINT: SUBIR ARCHIVO
// ============================================
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    const { userId, userName, comments, replace, oldSubmissionId, resourceLinkId, resourceTitle } = req.body;
    
    // Si es un reemplazo, eliminar la entrega anterior
    if (replace === 'true' && oldSubmissionId) {
      const oldSubmission = submissionsStore.get(oldSubmissionId);
      
      if (oldSubmission) {
        // Eliminar archivo antiguo del disco
        const oldFilePath = path.join(__dirname, oldSubmission.filePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log(`🗑️  Archivo antiguo eliminado: ${oldSubmission.fileName}`);
        }
        
        // Eliminar de memoria
        submissionsStore.delete(oldSubmissionId);
        saveSubmissions(); // Guardar después de eliminar entrega antigua
        console.log(`🔄 Entrega anterior eliminada: ${oldSubmissionId}`);
      }
    }
    
    const submissionId = `sub_${Date.now()}_${userId}_${resourceLinkId}`;
    
    // Guardar información de la entrega en memoria
    submissionsStore.set(submissionId, {
      submissionId,
      userId,
      userName,
      resourceLinkId: resourceLinkId || 'unknown',
      resourceTitle: resourceTitle || 'Tarea',
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      comments: comments || '',
      uploadedAt: new Date().toISOString(),
      questionnaire: null, // Se llenará después del cuestionario
      isReplacement: replace === 'true'
    });

    // Guardar en disco
    saveSubmissions();

    console.log(`📤 Archivo subido: ${req.file.originalname} por ${userName} (${userId})`);
    console.log(`📝 Tarea: ${resourceTitle} (ID: ${resourceLinkId})`);
    console.log(`📁 Guardado en: ${req.file.path}`);
    if (replace === 'true') {
      console.log(`♻️  Esta es una entrega de reemplazo`);
    }
    
    res.json({ 
      success: true, 
      submissionId,
      message: replace === 'true' ? 'Entrega reemplazada correctamente' : 'Archivo subido correctamente'
    });

  } catch (error) {
    console.error('❌ Error al subir archivo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ENDPOINT: CUESTIONARIO
// ============================================
app.get('/cuestionario', (req, res) => {
  const { submissionId } = req.query;
  
  if (!submissionId || !submissionsStore.has(submissionId)) {
    return res.status(400).send('<h1>❌ Error: Entrega no encontrada</h1>');
  }

  const submission = submissionsStore.get(submissionId);
  
  // Si ya completó el cuestionario, redirigir a página de confirmación
  if (submission.questionnaire) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cuestionario Completado</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 700px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f7fa;
            text-align: center;
          }
          .success-box {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .success-icon {
            font-size: 4em;
            margin-bottom: 20px;
          }
          h1 { color: #27ae60; }
          p { color: #555; font-size: 1.1em; }
        </style>
      </head>
      <body>
        <div class="success-box">
          <div class="success-icon">✅</div>
          <h1>¡Entrega Completada!</h1>
          <p>Ya has completado el cuestionario.</p>
          <p>Tu entrega está siendo revisada por el profesor.</p>
        </div>
      </body>
      </html>
    `);
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cuestionario Post-Entrega</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f7fa;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #2c3e50; }
        .user-info {
          background: #ecf0f1;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .question {
          margin-bottom: 25px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 5px;
          border-left: 4px solid #3498db;
        }
        .question label {
          display: block;
          margin-bottom: 10px;
          font-weight: 600;
          color: #2c3e50;
        }
        input[type="radio"], input[type="checkbox"] {
          margin-right: 8px;
        }
        .radio-group, .checkbox-group {
          margin-left: 20px;
        }
        .radio-group label, .checkbox-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: normal;
        }
        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #bdc3c7;
          border-radius: 4px;
          box-sizing: border-box;
          margin-top: 10px;
        }
        button {
          background-color: #27ae60;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          margin-top: 20px;
        }
        button:hover { background-color: #229954; }
        button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
        .success {
          color: #27ae60;
          padding: 15px;
          background: #d4edda;
          border-radius: 4px;
          margin-top: 20px;
        }
        .error {
          color: #c0392b;
          padding: 15px;
          background: #f8d7da;
          border-radius: 4px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📝 Cuestionario Post-Entrega</h1>
        
        <div class="user-info">
          <strong>👤 Estudiante:</strong> ${submission.userName}<br>
          <strong>📎 Archivo entregado:</strong> ${submission.fileName}<br>
          <strong>⏰ Fecha de entrega:</strong> ${new Date(submission.uploadedAt).toLocaleString('es-ES')}
        </div>

        <form id="questionnaireForm">
          <input type="hidden" name="submissionId" value="${submissionId}">

          <!-- Pregunta 1 -->
          <div class="question">
            <label>1. ¿Cuánto tiempo dedicaste a completar esta tarea?</label>
            <div class="radio-group">
              <label><input type="radio" name="q1" value="menos-1h" required> Menos de 1 hora</label>
              <label><input type="radio" name="q1" value="1-2h"> Entre 1 y 2 horas</label>
              <label><input type="radio" name="q1" value="2-4h"> Entre 2 y 4 horas</label>
              <label><input type="radio" name="q1" value="mas-4h"> Más de 4 horas</label>
            </div>
          </div>

          <!-- Pregunta 2 -->
          <div class="question">
            <label>2. ¿Qué nivel de dificultad tuvo la tarea para ti?</label>
            <div class="radio-group">
              <label><input type="radio" name="q2" value="muy-facil" required> Muy fácil</label>
              <label><input type="radio" name="q2" value="facil"> Fácil</label>
              <label><input type="radio" name="q2" value="moderada"> Moderada</label>
              <label><input type="radio" name="q2" value="dificil"> Difícil</label>
              <label><input type="radio" name="q2" value="muy-dificil"> Muy difícil</label>
            </div>
          </div>

          <!-- Pregunta 3 -->
          <div class="question">
            <label>3. ¿Utilizaste recursos externos para completar esta tarea?</label>
            <div class="checkbox-group">
              <label><input type="checkbox" name="q3" value="documentacion"> Documentación oficial</label>
              <label><input type="checkbox" name="q3" value="tutoriales"> Tutoriales en línea</label>
              <label><input type="checkbox" name="q3" value="foros"> Foros/Stack Overflow</label>
              <label><input type="checkbox" name="q3" value="companeros"> Ayuda de compañeros</label>
              <label><input type="checkbox" name="q3" value="profesor"> Consulta con el profesor</label>
              <label><input type="checkbox" name="q3" value="ninguno"> No utilicé recursos externos</label>
            </div>
          </div>

          <!-- Pregunta 4 -->
          <div class="question">
            <label>4. ¿Qué fue lo más difícil de esta tarea?</label>
            <textarea name="q4" rows="4" placeholder="Describe los principales desafíos que enfrentaste..." required></textarea>
          </div>

          <!-- Pregunta 5 -->
          <div class="question">
            <label>5. ¿Qué aprendiste al realizar esta tarea?</label>
            <textarea name="q5" rows="4" placeholder="Describe los principales aprendizajes..." required></textarea>
          </div>

          <button type="submit" id="submitBtn">Enviar Cuestionario y Finalizar</button>
        </form>

        <div id="result"></div>
      </div>

      <script>
        // SISTEMA ANTI-RETROCESO ULTRA REFORZADO
        (function() {
          let canNavigateBack = false;
          let currentLocation = window.location.href;
          
          // Método 1: Mantener constantemente estado en el historial
          function maintainHistory() {
            if (!canNavigateBack) {
              window.history.pushState(null, null, currentLocation);
            }
          }
          
          // Ejecutar cada 100ms para mantener el "muro"
          const historyInterval = setInterval(maintainHistory, 100);
          
          // Método 2: Interceptar popstate
          window.addEventListener('popstate', function(e) {
            if (!canNavigateBack) {
              window.history.pushState(null, null, currentLocation);
              alert('⚠️ ATENCIÓN: No puedes usar el botón ATRÁS durante el cuestionario.\n\nSi necesitas salir, cierra la pestaña (se te preguntará si estás seguro).\n\nDebe completar el cuestionario para finalizar.');
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
          }, true);
          
          // Método 3: Reemplazar función back
          const originalBack = window.history.back;
          window.history.back = function() {
            if (!canNavigateBack) {
              alert('⚠️ Botón ATRÁS deshabilitado durante el cuestionario.');
              return false;
            }
            originalBack.call(window.history);
          };
          
          // Método 4: Interceptar hashchange
          window.addEventListener('hashchange', function(e) {
            if (!canNavigateBack) {
              e.preventDefault();
              window.history.pushState(null, null, currentLocation);
            }
          }, true);
          
          // Exportar función para permitir navegación
          window.allowBackNavigation = function() {
            canNavigateBack = true;
            clearInterval(historyInterval);
            window.history.back = originalBack;
          };
          
          // Inicializar
          maintainHistory();
        })();
        
        // Prevenir cierre de pestaña
        let canClosePage = false;
        
        window.addEventListener('beforeunload', function(e) {
          if (!canClosePage) {
            const msg = '⚠️ ADVERTENCIA: No has completado el cuestionario.\n\nSi cierras ahora, tu archivo se quedará sin cuestionario y deberás volver a subirlo.\n\n¿Seguro que quieres salir?';
            e.preventDefault();
            e.returnValue = msg;
            return msg;
          }
        });
        
        window.allowPageClose = function() {
          canClosePage = true;
        };
        
        document.getElementById('questionnaireForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const resultDiv = document.getElementById('result');
          const submitBtn = document.getElementById('submitBtn');
          
          submitBtn.disabled = true;
          resultDiv.innerHTML = '<p>📤 Enviando respuestas...</p>';
          
          const formData = new FormData(e.target);
          const data = {
            submissionId: formData.get('submissionId'),
            q1: formData.get('q1'),
            q2: formData.get('q2'),
            q3: formData.getAll('q3'),
            q4: formData.get('q4'),
            q5: formData.get('q5')
          };
          
          try {
            const response = await fetch('/submit-questionnaire', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
              // Permitir navegación y cierre de página
              window.allowBackNavigation();
              window.allowPageClose();
              window.onbeforeunload = null;
              
              resultDiv.innerHTML = \`
                <div class="success">
                  <h3>✅ ¡Tarea completada exitosamente!</h3>
                  <p>Tu archivo y cuestionario han sido enviados correctamente.</p>
                  <p>El profesor podrá ver tu entrega y asignar una calificación.</p>
                  <p><small>Ya puedes cerrar esta ventana o volver atrás.</small></p>
                </div>
              \`;
              
              // Limpiar formulario
              document.getElementById('questionnaireForm').style.display = 'none';
            } else {
              resultDiv.innerHTML = \`
                <div class="error">
                  <h3>❌ Error al enviar</h3>
                  <p>\${result.error || 'Error desconocido'}</p>
                </div>
              \`;
              submitBtn.disabled = false;
            }
          } catch (error) {
            resultDiv.innerHTML = \`
              <div class="error">
                <h3>❌ Error de conexión</h3>
                <p>\${error.message}</p>
              </div>
            \`;
            submitBtn.disabled = false;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// ============================================
// ENDPOINT: CUESTIONARIO EN POPUP (SIN BOTÓN ATRÁS)
// ============================================
app.get('/cuestionario-popup', (req, res) => {
  const { submissionId } = req.query;
  
  if (!submissionId || !submissionsStore.has(submissionId)) {
    return res.status(400).send('<h1>❌ Error: Entrega no encontrada</h1>');
  }

  const submission = submissionsStore.get(submissionId);
  
  // Si ya completó el cuestionario, mostrar confirmación
  if (submission.questionnaire) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Completado</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
            color: white;
            text-align: center;
          }
          .message {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 12px;
          }
          .icon { font-size: 5em; margin-bottom: 20px; }
          button {
            margin-top: 20px;
            padding: 12px 30px;
            font-size: 16px;
            background: white;
            color: #27ae60;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="message">
          <div class="icon">✅</div>
          <h1>¡Cuestionario ya completado!</h1>
          <button onclick="window.close()">Cerrar</button>
        </div>
      </body>
      </html>
    `);
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Cuestionario</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        .container {
          max-width: 700px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        h1 { color: #2c3e50; margin-bottom: 10px; font-size: 24px; }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .form-group { margin-bottom: 25px; }
        label {
          display: block;
          margin-bottom: 8px;
          color: #34495e;
          font-weight: 600;
        }
        input[type="number"], select, textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #dfe6e9;
          border-radius: 6px;
          font-size: 14px;
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        .checkbox-group { display: flex; flex-direction: column; gap: 10px; }
        .checkbox-group label {
          display: flex;
          align-items: center;
          font-weight: normal;
          cursor: pointer;
        }
        .checkbox-group input[type="checkbox"] {
          width: auto;
          margin-right: 10px;
        }
        button[type="submit"] {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
        }
        button[type="submit"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .success {
          background: #d4edda;
          border-left: 4px solid #28a745;
          padding: 20px;
          border-radius: 6px;
          margin-top: 20px;
          text-align: center;
        }
        .success h3 { color: #155724; margin-bottom: 10px; }
        .success button {
          margin-top: 15px;
          padding: 12px 30px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }
        .error {
          background: #f8d7da;
          border-left: 4px solid #dc3545;
          padding: 15px;
          border-radius: 6px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📝 Cuestionario de Reflexión</h1>
        <p style="color: #7f8c8d; margin-bottom: 20px;">Responde sobre tu proceso de trabajo.</p>
        
        <div class="warning">
          <strong>⚠️ IMPORTANTE:</strong> Una vez enviado, no podrás modificarlo.
        </div>

        <form id="questionnaireForm">
          <input type="hidden" name="submissionId" value="${submissionId}">
          
          <div class="form-group">
            <label for="q1">1. ¿Cuánto tiempo (minutos) dedicaste? *</label>
            <input type="number" id="q1" name="q1" min="1" required placeholder="Ej: 120">
          </div>

          <div class="form-group">
            <label for="q2">2. ¿Dificultad de la tarea? *</label>
            <select id="q2" name="q2" required>
              <option value="">Selecciona</option>
              <option value="Muy fácil">Muy fácil</option>
              <option value="Fácil">Fácil</option>
              <option value="Normal">Normal</option>
              <option value="Difícil">Difícil</option>
              <option value="Muy difícil">Muy difícil</option>
            </select>
          </div>

          <div class="form-group">
            <label>3. ¿Qué recursos utilizaste? *</label>
            <div class="checkbox-group">
              <label><input type="checkbox" name="q3" value="Apuntes de clase"> Apuntes de clase</label>
              <label><input type="checkbox" name="q3" value="Material del curso"> Material del curso</label>
              <label><input type="checkbox" name="q3" value="Internet"> Internet</label>
              <label><input type="checkbox" name="q3" value="Compañeros"> Ayuda de compañeros</label>
              <label><input type="checkbox" name="q3" value="Profesor"> Consulta al profesor</label>
              <label><input type="checkbox" name="q3" value="Otros"> Otros recursos</label>
            </div>
          </div>

          <div class="form-group">
            <label for="q4">4. ¿Qué fue lo más desafiante? *</label>
            <textarea id="q4" name="q4" rows="4" required 
              placeholder="Describe los desafíos..."></textarea>
          </div>

          <div class="form-group">
            <label for="q5">5. ¿Qué aprendiste? *</label>
            <textarea id="q5" name="q5" rows="4" required 
              placeholder="Reflexiona sobre lo aprendido..."></textarea>
          </div>

          <button type="submit" id="submitBtn">✅ Enviar y Finalizar</button>
        </form>

        <div id="result"></div>
      </div>

      <script>
        let canClosePage = false;
        
        window.addEventListener('beforeunload', function(e) {
          if (!canClosePage) {
            e.preventDefault();
            e.returnValue = '¿Seguro? No has completado el cuestionario.';
            return e.returnValue;
          }
        });
        
        document.getElementById('questionnaireForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const resultDiv = document.getElementById('result');
          const submitBtn = document.getElementById('submitBtn');
          
          submitBtn.disabled = true;
          resultDiv.innerHTML = '<p style="text-align:center;">📤 Enviando...</p>';
          
          const formData = new FormData(e.target);
          const data = {
            submissionId: formData.get('submissionId'),
            q1: formData.get('q1'),
            q2: formData.get('q2'),
            q3: formData.getAll('q3'),
            q4: formData.get('q4'),
            q5: formData.get('q5')
          };
          
          try {
            const response = await fetch('/submit-questionnaire', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
              canClosePage = true;
              window.onbeforeunload = null;
              
              resultDiv.innerHTML = \`
                <div class="success">
                  <h3>✅ ¡Completado!</h3>
                  <p>Tarea entregada exitosamente.</p>
                  <button onclick="window.close()">Cerrar ventana</button>
                </div>
              \`;
              
              document.getElementById('questionnaireForm').style.display = 'none';
              
              setTimeout(() => window.close(), 3000);
            } else {
              resultDiv.innerHTML = \`
                <div class="error">
                  <h3>❌ Error</h3>
                  <p>\${result.error || 'Error desconocido'}</p>
                </div>
              \`;
              submitBtn.disabled = false;
            }
          } catch (error) {
            resultDiv.innerHTML = \`
              <div class="error">
                <h3>❌ Error de conexión</h3>
                <p>\${error.message}</p>
              </div>
            \`;
            submitBtn.disabled = false;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// ============================================
// ENDPOINT: ENVIAR CUESTIONARIO
// ============================================
app.post('/submit-questionnaire', async (req, res) => {
  try {
    const { submissionId, q1, q2, q3, q4, q5 } = req.body;
    
    if (!submissionId || !submissionsStore.has(submissionId)) {
      return res.status(400).json({ error: 'Entrega no encontrada' });
    }

    const submission = submissionsStore.get(submissionId);
    
    // Agregar respuestas del cuestionario
    submission.questionnaire = {
      timeSpent: q1,
      difficulty: q2,
      resourcesUsed: q3,
      challenges: q4,
      learnings: q5,
      completedAt: new Date().toISOString(),
      aiEvaluation: null  // Para evaluación futura de IA
    };
    
    submission.grade = {
      aiScore: null,  // Puntuación automática de la IA (futuro)
      teacherScore: null,  // Nota final del profesor
      feedback: '',  // Retroalimentación del profesor
      gradedAt: null,  // Cuándo se calificó
      gradedBy: null  // Quién calificó
    };

    submissionsStore.set(submissionId, submission);
    saveSubmissions(); // Guardar después de completar cuestionario

    console.log(`✅ Cuestionario completado por ${submission.userName}`);
    console.log(`📊 Respuestas:`, submission.questionnaire);

    // AQUÍ SE PODRÍA ENVIAR A MOODLE
    // await enviarEntregaAMoodle(submission);

    res.json({ 
      success: true, 
      message: 'Cuestionario enviado correctamente',
      submission
    });

  } catch (error) {
    console.error('❌ Error al procesar cuestionario:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ENDPOINT: CALIFICAR ENTREGA (PROFESOR)
// ============================================
app.post('/grade-submission', async (req, res) => {
  try {
    const { submissionId, score, feedback, teacherName } = req.body;
    
    if (!submissionId || !submissionsStore.has(submissionId)) {
      return res.status(400).json({ error: 'Entrega no encontrada' });
    }
    
    if (score === undefined || score === null || score < 0 || score > 10) {
      return res.status(400).json({ error: 'La calificación debe estar entre 0 y 10' });
    }

    const submission = submissionsStore.get(submissionId);
    
    // Actualizar calificación
    submission.grade = {
      ...submission.grade,
      teacherScore: parseFloat(score),
      feedback: feedback || '',
      gradedAt: new Date().toISOString(),
      gradedBy: teacherName
    };

    submissionsStore.set(submissionId, submission);
    saveSubmissions();

    console.log(`📝 Calificación asignada: ${score}/10 a ${submission.userName} por ${teacherName}`);

    res.json({ 
      success: true, 
      message: 'Calificación guardada correctamente',
      grade: submission.grade
    });

  } catch (error) {
    console.error('❌ Error al calificar:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ENDPOINT: VER DETALLES DE UNA ENTREGA
// ============================================
app.get('/ver-entrega/:submissionId', (req, res) => {
  const { submissionId } = req.params;
  
  if (!submissionsStore.has(submissionId)) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Entrega no encontrada</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
          }
          .error-icon { font-size: 4em; margin-bottom: 20px; }
          a { color: #3498db; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="error-icon">❌</div>
        <h1>Entrega no encontrada</h1>
        <p>La entrega con ID ${submissionId} no existe.</p>
        <p><a href="javascript:history.back()">← Volver atrás</a></p>
      </body>
      </html>
    `);
  }

  const submission = submissionsStore.get(submissionId);
  const uploadDate = new Date(submission.uploadedAt);
  const hasQuestionnaire = !!submission.questionnaire;

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Detalle de Entrega - ${submission.userName}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f7fa;
        }
        .header {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .back-btn {
          display: inline-block;
          padding: 8px 16px;
          background-color: #95a5a6;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        .back-btn:hover { background-color: #7f8c8d; }
        h1 { color: #2c3e50; margin-bottom: 10px; }
        .badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 0.9em;
          font-weight: 600;
        }
        .badge-complete {
          background: #d4edda;
          color: #155724;
        }
        .badge-pending {
          background: #fff3cd;
          color: #856404;
        }
        .section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
          color: #2c3e50;
          margin-top: 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #3498db;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .info-item {
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
          border-left: 3px solid #3498db;
        }
        .info-label {
          font-weight: 600;
          color: #7f8c8d;
          font-size: 0.85em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .info-value {
          color: #2c3e50;
          font-size: 1.1em;
        }
        .download-btn {
          display: inline-block;
          padding: 10px 20px;
          background-color: #27ae60;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 10px;
        }
        .download-btn:hover { background-color: #229954; }
        .comment-box {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          border-left: 3px solid #3498db;
          margin-top: 10px;
          font-style: italic;
          color: #555;
        }
        .questionnaire-answer {
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 5px;
        }
        .question-title {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
        }
        .answer-text {
          color: #555;
          line-height: 1.6;
        }
        .no-questionnaire {
          text-align: center;
          padding: 30px;
          color: #7f8c8d;
        }
        .grade-form {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 5px;
          border-left: 3px solid #27ae60;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
        }
        .grade-display {
          display: flex;
          align-items: center;
          gap: 30px;
          padding: 20px;
          background: #d4edda;
          border-radius: 5px;
          border-left: 4px solid #27ae60;
        }
        .grade-score {
          font-size: 3em;
          font-weight: bold;
          color: #27ae60;
          min-width: 120px;
          text-align: center;
        }
        .grade-info {
          flex: 1;
        }
        .feedback-box {
          background: white;
          padding: 15px;
          border-radius: 5px;
          margin-top: 10px;
          border: 1px solid #bdc3c7;
          font-style: italic;
          color: #555;
        }
      </style>
    </head>
    <body>
      <a href="javascript:history.back()" class="back-btn">← Volver a la lista</a>
      
      <div class="header">
        <h1>📋 Detalle de Entrega ${hasQuestionnaire 
          ? '<span class="badge badge-complete">✅ Entrega Completa</span>' 
          : '<span class="badge badge-pending">⏳ Sin Cuestionario</span>'}</h1>
      
        <hr style="margin: 25px 0; border: none; border-top: 2px solid #ecf0f1;">
      
        <!-- Información del Estudiante -->
        <div class="section">
          <h2>👤 Información del Estudiante</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Nombre</div>
              <div class="info-value">${submission.userName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">ID de Usuario</div>
              <div class="info-value">${submission.userId}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fecha de entrega</div>
              <div class="info-value">${uploadDate.toLocaleString('es-ES')}</div>
            </div>
          </div>
        </div>
        
        <hr style="margin: 25px 0; border: none; border-top: 1px solid #ecf0f1;">

        <!-- Archivo Entregado -->
        <div class="section">
          <h2>📎 Archivo Entregado</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Nombre del archivo</div>
              <div class="info-value">${submission.fileName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tamaño</div>
              <div class="info-value">${formatBytes(submission.fileSize)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Ruta del archivo</div>
              <div class="info-value"><code>${submission.filePath}</code></div>
            </div>
          </div>
          <a href="/download/${submission.submissionId}" class="download-btn">⬇️ Descargar Archivo</a>
          
          ${submission.comments ? `
            <h3 style="margin-top: 20px;">💬 Comentarios del estudiante:</h3>
            <div class="comment-box">${submission.comments}</div>
          ` : '<p style="color: #7f8c8d; margin-top: 10px;"><em>El estudiante no agregó comentarios.</em></p>'}
        </div>
        
        <hr style="margin: 25px 0; border: none; border-top: 1px solid #ecf0f1;">

        <!-- Respuestas del Cuestionario -->
        <div class="section">
          <h2>📝 Cuestionario Post-Entrega</h2>
          ${hasQuestionnaire ? `
            <div class="questionnaire-answer">
              <div class="question-title">⏱️ 1. Tiempo dedicado a la tarea</div>
              <div class="answer-text">${formatTimeSpent(submission.questionnaire.timeSpent)}</div>
            </div>

            <div class="questionnaire-answer">
              <div class="question-title">📊 2. Nivel de dificultad</div>
              <div class="answer-text">${formatDifficulty(submission.questionnaire.difficulty)}</div>
            </div>

            <div class="questionnaire-answer">
              <div class="question-title">📚 3. Recursos externos utilizados</div>
              <div class="answer-text">
                ${submission.questionnaire.resourcesUsed.length > 0 
                  ? submission.questionnaire.resourcesUsed.map(r => `• ${formatResource(r)}`).join('<br>') 
                  : 'No utilizó recursos externos'}
              </div>
            </div>

            <div class="questionnaire-answer">
              <div class="question-title">💭 4. Principales desafíos</div>
              <div class="answer-text">${submission.questionnaire.challenges}</div>
            </div>

            <div class="questionnaire-answer">
              <div class="question-title">🎓 5. Aprendizajes obtenidos</div>
              <div class="answer-text">${submission.questionnaire.learnings}</div>
            </div>

            <div class="info-item" style="margin-top: 20px;">
              <div class="info-label">Cuestionario completado</div>
              <div class="info-value">${new Date(submission.questionnaire.completedAt).toLocaleString('es-ES')}</div>
            </div>
          ` : `
            <div class="no-questionnaire">
              <p>⏳ El estudiante aún no ha completado el cuestionario.</p>
            </div>
          `}
        </div>
      </div>

      <!-- Sección de Calificación -->
      <div class="section">
        <h2>📊 Calificación</h2>
        ${submission.grade && submission.grade.teacherScore !== null ? `
          <div id="gradeDisplay" class="grade-display">
            <div class="grade-score">${submission.grade.teacherScore}/10</div>
            <div class="grade-info">
              <div class="info-item">
                <div class="info-label">Calificado por</div>
                <div class="info-value">${submission.grade.gradedBy}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Fecha de calificación</div>
                <div class="info-value">${new Date(submission.grade.gradedAt).toLocaleString('es-ES')}</div>
              </div>
              ${submission.grade.feedback ? `
                <div class="info-item">
                  <div class="info-label">Retroalimentación</div>
                  <div class="feedback-box">${submission.grade.feedback}</div>
                </div>
              ` : ''}
            </div>
            <div style="margin-top: 20px; text-align: center;">
              <button onclick="mostrarFormularioEdicion()" style="padding: 10px 20px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 600;">
                ✏️ Editar Calificación
              </button>
            </div>
          </div>
          
          <!-- Formulario de edición (oculto inicialmente) -->
          <div id="editGradeForm" style="display: none;">
            <form id="gradeForm" class="grade-form">
              <input type="hidden" name="submissionId" value="${submissionId}">
              <input type="hidden" name="teacherName" id="teacherName">
              
              <div class="form-group">
                <label for="score">Nueva Calificación (0-10):</label>
                <input type="number" id="score" name="score" min="0" max="10" step="0.1" required 
                  value="${submission.grade.teacherScore}"
                  placeholder="Ej: 8.5" style="width: 150px; padding: 10px; font-size: 1.2em;">
              </div>
              
              <div class="form-group">
                <label for="feedback">Retroalimentación para el estudiante (opcional):</label>
                <textarea id="feedback" name="feedback" rows="4" 
                  placeholder="Escribe tus comentarios sobre la entrega..."
                  style="width: 100%; padding: 10px; box-sizing: border-box;">${submission.grade.feedback || ''}</textarea>
              </div>
              
              <div style="display: flex; gap: 10px;">
                <button type="submit" id="gradeBtn" style="padding: 12px 30px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: 600;">
                  💾 Guardar Cambios
                </button>
                <button type="button" onclick="cancelarEdicion()" style="padding: 12px 30px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: 600;">
                  ❌ Cancelar
                </button>
              </div>
            </form>
            <div id="gradeResult" style="margin-top: 15px;"></div>
          </div>
        ` : `
          <form id="gradeForm" class="grade-form">
            <input type="hidden" name="submissionId" value="${submissionId}">
            <input type="hidden" name="teacherName" id="teacherName">
            
            <div class="form-group">
              <label for="score">Calificación (0-10):</label>
              <input type="number" id="score" name="score" min="0" max="10" step="0.1" required 
                placeholder="Ej: 8.5" style="width: 150px; padding: 10px; font-size: 1.2em;">
            </div>
            
            <div class="form-group">
              <label for="feedback">Retroalimentación para el estudiante (opcional):</label>
              <textarea id="feedback" name="feedback" rows="4" 
                placeholder="Escribe tus comentarios sobre la entrega..."
                style="width: 100%; padding: 10px; box-sizing: border-box;"></textarea>
            </div>
            
            <button type="submit" id="gradeBtn" style="padding: 12px 30px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: 600;">
              💾 Guardar Calificación
            </button>
          </form>
          <div id="gradeResult" style="margin-top: 15px;"></div>
        `}
      </div>

      <script>
        // Funciones para mostrar/ocultar formulario de edición
        function mostrarFormularioEdicion() {
          document.getElementById('gradeDisplay').style.display = 'none';
          document.getElementById('editGradeForm').style.display = 'block';
        }
        
        function cancelarEdicion() {
          document.getElementById('gradeDisplay').style.display = 'block';
          document.getElementById('editGradeForm').style.display = 'none';
          document.getElementById('gradeResult').innerHTML = '';
        }
        
        // Obtener el nombre del profesor del localStorage o pedirlo
        let teacherName = localStorage.getItem('teacherName');
        if (!teacherName || teacherName.trim() === '') {
          // Pedir el nombre hasta que se ingrese uno válido
          while (!teacherName || teacherName.trim() === '') {
            teacherName = prompt('Por favor, ingresa tu nombre para registrar la calificación:');
            if (!teacherName || teacherName.trim() === '') {
              alert('El nombre no puede estar vacío. Por favor, ingresa tu nombre.');
            }
          }
          localStorage.setItem('teacherName', teacherName.trim());
        }
        const teacherNameInput = document.getElementById('teacherName');
        if (teacherNameInput) {
          teacherNameInput.value = teacherName;
        }
        
        // Manejar envío de calificación
        const gradeForm = document.getElementById('gradeForm');
        if (gradeForm) {
          gradeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const gradeBtn = document.getElementById('gradeBtn');
            const resultDiv = document.getElementById('gradeResult');
            
            const formData = new FormData(e.target);
            const teacherNameValue = formData.get('teacherName');
            
            // Validar que el nombre del profesor no esté vacío
            if (!teacherNameValue || teacherNameValue.trim() === '') {
              resultDiv.innerHTML = '<div style="color: #c0392b; background: #f8d7da; padding: 15px; border-radius: 4px;"><strong>❌ Error:</strong> El nombre del profesor es requerido. Recarga la página e ingresa tu nombre.</div>';
              return;
            }
            
            gradeBtn.disabled = true;
            resultDiv.innerHTML = '<p style="color: #3498db;">💾 Guardando calificación...</p>';
            
            const data = {
              submissionId: formData.get('submissionId'),
              score: parseFloat(formData.get('score')),
              feedback: formData.get('feedback'),
              teacherName: teacherNameValue.trim()
            };
            
            try {
              const response = await fetch('/grade-submission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
              
              const result = await response.json();
              
              if (response.ok) {
                resultDiv.innerHTML = \`
                  <div style="color: #27ae60; background: #d4edda; padding: 15px; border-radius: 4px;">
                    <strong>✅ Calificación guardada correctamente</strong><br>
                    Nota: \${data.score}/10
                  </div>
                \`;
                
                // Recargar página después de 2 segundos
                setTimeout(() => location.reload(), 2000);
              } else {
                resultDiv.innerHTML = \`
                  <div style="color: #c0392b; background: #f8d7da; padding: 15px; border-radius: 4px;">
                    <strong>❌ Error:</strong> \${result.error || 'Error desconocido'}
                  </div>
                \`;
                gradeBtn.disabled = false;
              }
            } catch (error) {
              resultDiv.innerHTML = \`
                <div style="color: #c0392b; background: #f8d7da; padding: 15px; border-radius: 4px;">
                  <strong>❌ Error de conexión:</strong> \${error.message}
                </div>
              \`;
              gradeBtn.disabled = false;
            }
          });
        }
        
        function formatBytes(bytes) {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }
      </script>
    </body>
    </html>
  `);
});

// Funciones auxiliares para formatear datos del cuestionario
function formatTimeSpent(value) {
  const labels = {
    'menos-1h': 'Menos de 1 hora',
    '1-2h': 'Entre 1 y 2 horas',
    '2-4h': 'Entre 2 y 4 horas',
    'mas-4h': 'Más de 4 horas'
  };
  return labels[value] || value;
}

function formatDifficulty(value) {
  const labels = {
    'muy-facil': 'Muy fácil',
    'facil': 'Fácil',
    'moderada': 'Moderada',
    'dificil': 'Difícil',
    'muy-dificil': 'Muy difícil'
  };
  return labels[value] || value;
}

function formatResource(value) {
  const labels = {
    'documentacion': 'Documentación oficial',
    'tutoriales': 'Tutoriales en línea',
    'foros': 'Foros/Stack Overflow',
    'companeros': 'Ayuda de compañeros',
    'profesor': 'Consulta con el profesor',
    'ninguno': 'No utilicé recursos externos'
  };
  return labels[value] || value;
}

// ============================================
// ENDPOINT: DESCARGAR ARCHIVO DE ENTREGA
// ============================================
app.get('/download/:submissionId', (req, res) => {
  const { submissionId } = req.params;
  
  if (!submissionsStore.has(submissionId)) {
    return res.status(404).send('Entrega no encontrada');
  }

  const submission = submissionsStore.get(submissionId);
  const filePath = path.join(__dirname, submission.filePath);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Archivo no encontrado en el servidor');
  }

  res.download(filePath, submission.fileName, (err) => {
    if (err) {
      console.error('Error al descargar archivo:', err);
      res.status(500).send('Error al descargar el archivo');
    }
  });
});

// ============================================
// ENDPOINT: VER TODAS LAS ENTREGAS (DEBUG)
// ============================================
app.get('/debug/submissions', (req, res) => {
  const allSubmissions = Array.from(submissionsStore.values());
  res.json({
    total: allSubmissions.length,
    submissions: allSubmissions
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor LTI 1.3 escuchando en http://localhost:${PORT}`);
  console.log(`🔗 JWKS disponible en http://localhost:${PORT}/jwks.json`);
  console.log(`🔗 Login URL: http://localhost:${PORT}/login`);
  console.log(`🔗 Launch URL: http://localhost:${PORT}/launch`);
});
