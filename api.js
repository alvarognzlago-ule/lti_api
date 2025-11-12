// 1. Cargar dotenv AL PRINCIPIO de todo
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const https = require('https');

// Configurar axios para aceptar certificados SSL auto-firmados (solo para desarrollo)
// ¡Esto es necesario para https://localhost:8443!
const httpsAgent = new https.Agent({ 
  rejectUnauthorized: false
});

// Configurar axios globalmente
axios.defaults.httpsAgent = httpsAgent;

const app = express();

// Middleware para manejar CORS
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

// Middleware para parsear JSON
app.use(express.json());
// Middleware para parsear datos de formularios (necesario para LTI)
app.use(express.urlencoded({ extended: true }));

// Lee el puerto desde el archivo .env, con un valor por defecto
const port = process.env.PORT || 3000;

// --- Configuración de Moodle (Leída desde .env) ---
const MOODLE_URL = process.env.MOODLE_URL;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN;

// Comprobación de seguridad
if (!MOODLE_URL || !MOODLE_TOKEN) {
  console.error("Error: Faltan variables de entorno MOODLE_URL o MOODLE_TOKEN.");
  console.error("Asegúrate de tener un archivo .env con estos valores.");
  process.exit(1); // Detiene la aplicación si faltan
}

const MOODLE_REST_ENDPOINT = `${MOODLE_URL}/webservice/rest/server.php`;

/**
 * Función genérica para llamar a la API de Moodle
 */
async function callMoodleAPI(wsfunction, params = {}) {
  const requestParams = {
    wstoken: MOODLE_TOKEN,
    wsfunction: wsfunction,
    moodlewsrestformat: 'json',
    ...params // Argumentos específicos de la función
  };
  
  console.log(`Llamando a Moodle API: ${wsfunction}`);
  console.log('URL completa:', `${MOODLE_REST_ENDPOINT}?${new URLSearchParams(requestParams).toString()}`);
  
  try {
    const response = await axios.get(MOODLE_REST_ENDPOINT, {
      params: requestParams,
      timeout: 10000 // 10 segundos de timeout
    });

    console.log('Respuesta recibida:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    // Moodle a veces devuelve errores dentro de una respuesta 200 OK
    if (response.data.exception) {
      console.error('Error de Moodle API:', response.data);
      throw new Error(`Moodle Error: ${response.data.message} (${response.data.exception})`);
    }

    return response.data;

  } catch (error) {
    console.error('Error en la llamada a Axios:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    throw error;
  }
}

// --- Definición de Rutas de tu API ---

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API de Moodle funcionando correctamente',
    timestamp: new Date().toISOString(),
    endpoints: {
      login: 'POST /login',
      get_tasks_by_course: '/api/gettasks/:courseid',
      submissions: '/api/submissions/:assignmentid'
    }
  });
});

// Ruta POST /login - Para autenticación LTI desde Moodle
app.post('/login', async (req, res) => {
  console.log('=== LOGIN REQUEST ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  
  // Extraer datos LTI (puede venir en diferentes formatos)
  const allData = { ...req.body, ...req.query };
  
  // Extraer el cmid (course module id) del lti_message_hint
  let courseModuleId = null;
  let userId = allData.login_hint || allData.user_id || allData.sub || 'desconocido';
  
  if (allData.lti_message_hint) {
    try {
      const hint = JSON.parse(allData.lti_message_hint);
      courseModuleId = hint.cmid;
      console.log('Course Module ID:', courseModuleId);
    } catch (e) {
      console.log('Could not parse message hint');
    }
  }
  
  const assignmentId = allData.custom_assignment_id || '3'; // ID por defecto
  
  // Obtener el rol del usuario - puede venir en diferentes formatos
  const userRole = allData.custom_user_role || 
                   allData.user_role || 
                   allData['custom_role'] ||
                   allData.roles ||
                   '';
  
  console.log('User ID:', userId);
  console.log('Assignment ID:', assignmentId);
  console.log('User Role from LTI:', userRole);
  console.log('All custom params:', Object.keys(allData).filter(k => k.includes('custom') || k.includes('role')));
  
  // Detectar si es profesor basándose en el rol
  let isInstructor = false;
  
  if (userRole && typeof userRole === 'string' && userRole.length > 0) {
    // Si hay rol en LTI, usarlo
    const roleLower = userRole.toLowerCase();
    isInstructor = roleLower.includes('instructor') ||
                   roleLower.includes('teacher') ||
                   roleLower.includes('editingteacher') ||
                   roleLower.includes('administrator') ||
                   roleLower.includes('manager') ||
                   roleLower.includes('professor') ||
                   roleLower.includes('staff');
    
    console.log('Role detected from LTI parameter');
  } else {
    // Fallback: detectar por ID de usuario
    console.log('WARNING: No role found in LTI, using user ID fallback');
    const teacherIds = ['2']; 
    isInstructor = teacherIds.includes(userId.toString());
  }
  
  console.log('Is Instructor:', isInstructor);
  
  if (isInstructor) {
    // Vista para profesores: mostrar entregas
    try {
      const submissions = await getSubmissions(assignmentId);
      
      res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Entregas de Estudiantes</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            h1 { color: #333; }
            table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #4CAF50;
              color: white;
            }
            tr:hover { background-color: #f5f5f5; }
            .status-submitted { color: green; font-weight: bold; }
            .status-new { color: orange; }
            a { color: #2196F3; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1>📋 Entregas de Estudiantes</h1>
          <p><strong>Tarea ID:</strong> ${assignmentId}</p>
          <p><strong>Total de entregas:</strong> ${submissions.length}</p>
          
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Estudiante</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Calificación</th>
                <th>Archivos</th>
              </tr>
            </thead>
            <tbody>
              ${submissions.map(sub => `
                <tr>
                  <td>${sub.user_id}</td>
                  <td>${sub.user_fullname}</td>
                  <td>${sub.user_email}</td>
                  <td class="status-${sub.status}">${sub.status}</td>
                  <td>${sub.grade || 'Sin calificar'}</td>
                  <td>
                    ${sub.files.map(file => `
                      <a href="${file.fileurl}" target="_blank">${file.filename}</a><br>
                    `).join('')}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `);
    } catch (error) {
      res.status(500).send(`
        <h1>Error al obtener entregas</h1>
        <p>${error.message}</p>
        <pre>${JSON.stringify(req.body, null, 2)}</pre>
      `);
    }
  } else {
    // Vista para alumnos: formulario de entrega
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Entregar Tarea</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 { color: #333; }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
          }
          input[type="file"], textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          button {
            background-color: #4CAF50;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          }
          button:hover { background-color: #45a049; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📤 Entregar Tarea</h1>
          <p><strong>Estudiante:</strong> Usuario ${userId || 'desconocido'}</p>
          
          <form id="uploadForm" enctype="multipart/form-data">
            <div class="form-group">
              <label for="file">Archivo a entregar:</label>
              <input type="file" id="file" name="file" required>
            </div>
            
            <div class="form-group">
              <label for="comments">Comentarios (opcional):</label>
              <textarea id="comments" name="comments" rows="4"></textarea>
            </div>
            
            <button type="submit">Entregar Tarea</button>
          </form>
          
          <div id="result"></div>
          
          <hr style="margin: 30px 0;">
          <h2>📊 Datos recibidos de Moodle (debug):</h2>
          <pre>${JSON.stringify(req.body, null, 2)}</pre>
        </div>
        
        <script>
          document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<p>Enviando...</p>';
            
            // Aquí implementarías la lógica de envío
            // Por ahora solo mostramos un mensaje
            setTimeout(() => {
              resultDiv.innerHTML = '<p style="color: green;">✅ Tarea entregada correctamente. Ahora procederemos con el cuestionario...</p>';
              
              // Redirigir al cuestionario después de 2 segundos
              setTimeout(() => {
                window.location.href = '/cuestionario';
              }, 2000);
            }, 1000);
          });
        </script>
      </body>
      </html>
    `);
  }
});

// Función auxiliar para obtener entregas
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
    return submissions.map(submission => ({
      submission_id: submission.id,
      user_id: submission.userid,
      user_fullname: 'Usuario no encontrado',
      user_email: 'N/A',
      status: submission.status,
      grade: submission.grade,
      files: []
    }));
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

// Ruta de prueba para verificar conexión con Moodle
app.get('/api/test', async (req, res) => {
  console.log('=== PRUEBA DE CONEXIÓN MOODLE ===');
  console.log('MOODLE_URL:', MOODLE_URL);
  console.log('MOODLE_TOKEN:', MOODLE_TOKEN ? `${MOODLE_TOKEN.substring(0, 8)}...` : 'NO DEFINIDO');
  console.log('ENDPOINT:', MOODLE_REST_ENDPOINT);
  
  try {
    // Usamos una función que probablemente sí tengas:
    console.log('Intentando conectar con Moodle usando core_webservice_get_site_info...');
    const testData = await callMoodleAPI('core_webservice_get_site_info');
    console.log('Conexión exitosa:', testData);
    
    res.json({
      status: 'success',
      message: 'Conexión con Moodle exitosa',
      data: testData
    });
  } catch (error) {
    console.error('Error completo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error conectando con Moodle',
      error: error.message,
      details: error.response?.data || 'Sin detalles adicionales',
      solution: 'Verifica que el token tenga la función core_webservice_get_site_info en Moodle'
    });
  }
});

// Ruta para verificar configuración (sin llamar a Moodle)
app.get('/api/config', (req, res) => {
  res.json({
    status: 'success',
    message: 'API configurada correctamente',
    config: {
      moodle_url: MOODLE_URL,
      token_configured: !!MOODLE_TOKEN,
      token_preview: MOODLE_TOKEN ? `${MOODLE_TOKEN.substring(0, 8)}...` : 'NO CONFIGURADO',
      endpoint: MOODLE_REST_ENDPOINT
    }
  });
});

// Ruta para listar todas las tareas disponibles
app.get('/api/assignments', async (req, res) => {
  try {
    const assignments = await callMoodleAPI('mod_assign_get_assignments');
    
    res.json({
      status: 'success',
      message: 'Lista de tareas obtenida correctamente',
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error obteniendo las tareas',
      error: error.message
    });
  }
});


// ===================================================================
// === ¡¡RUTA AÑADIDA!! ===
// Esta es la ruta que faltaba y que te daba el error 404
// ===================================================================
/**
 * Endpoint para OBTENER las tareas de un curso
 * y descubrir el 'assignmentid' correcto.
 */
app.get('/api/gettasks/:courseid', async (req, res) => {
  const { courseid } = req.params;

  try {
    console.log(`Llamando a Moodle API: mod_assign_get_assignments para el curso ${courseid}`);
    const tasksData = await callMoodleAPI('mod_assign_get_assignments', {
      'courseids[0]': courseid
    });

    if (!tasksData.courses || tasksData.courses.length === 0) {
      return res.status(404).send({ error: 'Curso no encontrado o sin tareas' });
    }

    // Devolvemos solo la información útil
    const assignments = tasksData.courses[0].assignments.map(task => ({
      id: task.id, // <--- ¡ESTE ES EL ID QUE BUSCAS!
      cmid: task.cmid, // <-- Este es el ID de la URL
      name: task.name
    }));

    res.json(assignments);

  } catch (error) {
    console.error('Error en /api/gettasks:', error.message);
    res.status(500).send({ error: error.message });
  }
});


/**
 * Endpoint para obtener las entregas de una tarea específica
 */
app.get('/api/submissions/:assignmentid', async (req, res) => {
  const { assignmentid } = req.params;

  try {
    // 1. Llamar a Moodle para obtener las entregas
    const submissionsData = await callMoodleAPI('mod_assign_get_submissions', {
      'assignmentids[0]': assignmentid
    });

    // 'submissionsData' ahora contiene un objeto, probablemente en .assignments[0].submissions
    if (!submissionsData.assignments || submissionsData.assignments.length === 0) {
      return res.status(404).send({ error: 'Tarea no encontrada o sin entregas' });
    }

    const submissions = submissionsData.assignments[0].submissions;

    // 2. Extraer los IDs de los usuarios que han entregado
    const userIds = submissions.map(sub => sub.userid).filter(id => id > 0); // Filtra usuarios invitados o nulos si los hubiera

    // Si no hay usuarios válidos, devolver lo que tenemos
    if (userIds.length === 0) {
      return res.json(submissions.map(submission => ({
        submission_id: submission.id,
        user_id: submission.userid,
        user_fullname: 'Usuario no encontrado',
        user_email: 'N/A',
        status: submission.status,
        grade: submission.grade,
        files: []
      })));
    }
    
    // 3. Obtener los detalles de esos usuarios
    const userParams = {
      field: 'id'
    };
    userIds.forEach((id, index) => {
      userParams[`values[${index}]`] = id;
    });

    const usersData = await callMoodleAPI('core_user_get_users_by_field', userParams);

    // 4. Combinar los datos para una respuesta más útil
    const combinedData = submissions.map(submission => {
      const user = usersData.find(u => u.id === submission.userid);
      
      // Extraer info de los archivos (plugins)
      const files = (submission.plugins || [])
        .filter(p => p.type === 'file') // Nos interesan los plugins de tipo 'file'
        .flatMap(p => p.fileareas || [])
        .flatMap(fa => fa.files || [])
        .map(file => ({
          filename: file.filename,
          // Asegúrate de que fileurl existe antes de intentar añadir el token
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

    res.json(combinedData);

  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`API de Node.js escuchando en http://localhost:${port}`);
});
