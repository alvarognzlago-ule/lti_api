# 📘 GUÍA COMPLETA: Despliegue de Sistema LTI 1.3 en Producción

## 🎯 Objetivo de esta Guía

Esta guía te llevará paso a paso desde cero hasta tener un sistema completo de entregas con LTI 1.3 funcionando en Moodle en un entorno de producción real.

---

## 📋 Índice

1. [Requisitos Previos](#1-requisitos-previos)
2. [Preparación del Servidor](#2-preparación-del-servidor)
3. [Instalación y Configuración del Código](#3-instalación-y-configuración-del-código)
4. [Configuración de Seguridad](#4-configuración-de-seguridad)
5. [Configuración de Moodle](#5-configuración-de-moodle)
6. [Creación de la Actividad en Moodle](#6-creación-de-la-actividad-en-moodle)
7. [Pruebas y Verificación](#7-pruebas-y-verificación)
8. [Monitoreo y Mantenimiento](#8-monitoreo-y-mantenimiento)
9. [Solución de Problemas Comunes](#9-solución-de-problemas-comunes)

---

## 1. Requisitos Previos

### 1.1 Hardware y Software

**Servidor Linux (Recomendado: Ubuntu 22.04 LTS o superior)**
- Mínimo 2 GB RAM
- 20 GB de espacio en disco
- Conexión a internet estable
- Dirección IP pública o acceso a un dominio

**Software necesario:**
- Node.js v14 o superior
- npm (viene con Node.js)
- Git
- Nginx (como proxy inverso)
- Certbot (para certificados SSL)
- PM2 (para gestión de procesos)

### 1.2 Acceso a Moodle

- Moodle 3.9 o superior
- Permisos de administrador en Moodle
- Plugin LTI 1.3 habilitado (viene por defecto en Moodle moderno)

### 1.3 Dominio y SSL

- Un dominio propio (ejemplo: `lti.tuuniversidad.edu`)
- Acceso a configuración DNS del dominio

---

## 2. Preparación del Servidor

### 2.1 Actualizar el Sistema

```bash
# Conectarse al servidor vía SSH
ssh usuario@tu-servidor.com

# Actualizar paquetes
sudo apt update
sudo apt upgrade -y
```

### 2.2 Instalar Node.js y npm

```bash
# Instalar Node.js LTS (versión 18)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v18.x.x
npm --version   # Debe mostrar 9.x.x o superior
```

### 2.3 Instalar PM2 (Gestor de Procesos)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar instalación
pm2 --version
```

### 2.4 Instalar Nginx

```bash
# Instalar Nginx
sudo apt install -y nginx

# Verificar que esté corriendo
sudo systemctl status nginx

# Habilitar inicio automático
sudo systemctl enable nginx
```

### 2.5 Instalar Certbot (para SSL)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx
```

---

## 3. Instalación y Configuración del Código

### 3.1 Crear Usuario del Sistema

```bash
# Crear usuario dedicado (buena práctica de seguridad)
sudo adduser ltiapp

# Añadir al grupo www-data
sudo usermod -aG www-data ltiapp

# Cambiar a ese usuario
sudo su - ltiapp
```

### 3.2 Clonar o Subir el Código

**Opción A: Si tienes Git configurado**

```bash
# Ir al directorio home
cd /home/ltiapp

# Clonar repositorio
git clone https://tu-repositorio.git lti-server
cd lti-server
```

**Opción B: Subir archivos manualmente**

```bash
# En tu máquina local, comprimir archivos
# (Excluir node_modules y archivos de backup)
tar -czf lti-server.tar.gz \
  --exclude=node_modules \
  --exclude=backups \
  --exclude=uploads \
  api.js lti-server.js package.json \
  generate-keys.js verificar-entregas.js \
  submissions.json README.md

# Subir al servidor
scp lti-server.tar.gz ltiapp@tu-servidor.com:/home/ltiapp/

# En el servidor, descomprimir
cd /home/ltiapp
tar -xzf lti-server.tar.gz
mv lti-server.tar.gz /tmp/  # Mover archivo comprimido
```

### 3.3 Instalar Dependencias

```bash
# Asegurarse de estar en el directorio correcto
cd /home/ltiapp/lti-server

# Instalar dependencias de Node.js
npm install

# Verificar que no haya errores
```

### 3.4 Generar Claves Criptográficas

```bash
# Ejecutar el script de generación de claves
node generate-keys.js

# Verificar que se creó keys.json
ls -la keys.json
cat keys.json  # Verificar contenido (verás el JSON con las claves)
```

**⚠️ IMPORTANTE:** Guarda una copia de `keys.json` en un lugar seguro. Si pierdes este archivo, tendrás que reconfigurar todo en Moodle.

### 3.5 Crear Directorios Necesarios

```bash
# Crear directorios para archivos
mkdir -p /home/ltiapp/lti-server/uploads
mkdir -p /home/ltiapp/lti-server/backups

# Establecer permisos correctos
chmod 755 /home/ltiapp/lti-server/uploads
chmod 755 /home/ltiapp/lti-server/backups
```

### 3.6 Configurar Variables de Entorno

```bash
# Crear archivo .env
nano /home/ltiapp/lti-server/.env
```

**Contenido del archivo `.env`:**

```env
# Puerto del servidor (usaremos 3000 internamente)
PORT=3000

# URL pública de tu servidor (CAMBIAR POR TU DOMINIO)
PUBLIC_URL=https://lti.tuuniversidad.edu

# Entorno de producción
NODE_ENV=production

# Directorio de uploads
UPLOAD_DIR=/home/ltiapp/lti-server/uploads

# Directorio de backups
BACKUP_DIR=/home/ltiapp/lti-server/backups

# Archivo de datos
SUBMISSIONS_FILE=/home/ltiapp/lti-server/submissions.json

# Límite de tamaño de archivo (50MB)
MAX_FILE_SIZE=52428800
```

**Guardar:** `Ctrl + O`, Enter, `Ctrl + X`

### 3.7 Modificar el Código para Usar Variables de Entorno

Editar `lti-server.js`:

```bash
nano lti-server.js
```

**Al inicio del archivo, después de los `require`, añadir:**

```javascript
// Cargar variables de entorno
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3000';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
```

**Instalar dotenv:**

```bash
npm install dotenv
```

---

## 4. Configuración de Seguridad

### 4.1 Configurar Firewall

```bash
# Salir del usuario ltiapp
exit

# Como usuario con sudo, configurar UFW
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# Verificar estado
sudo ufw status
```

### 4.2 Configurar Nginx como Proxy Inverso

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/lti-server
```

**Contenido del archivo:**

```nginx
server {
    listen 80;
    server_name lti.tuuniversidad.edu;  # CAMBIAR POR TU DOMINIO

    # Logs
    access_log /var/log/nginx/lti-access.log;
    error_log /var/log/nginx/lti-error.log;

    # Límite de tamaño de carga (50MB para archivos)
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts para subida de archivos grandes
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
}
```

**Activar el sitio:**

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/lti-server /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Si todo está OK, reiniciar Nginx
sudo systemctl restart nginx
```

### 4.3 Configurar SSL con Let's Encrypt

```bash
# Obtener certificado SSL (CAMBIAR lti.tuuniversidad.edu por tu dominio)
sudo certbot --nginx -d lti.tuuniversidad.edu

# Seguir las instrucciones:
# 1. Ingresar email
# 2. Aceptar términos
# 3. Seleccionar "2" para redireccionar HTTP a HTTPS

# Verificar renovación automática
sudo certbot renew --dry-run
```

**Certbot automáticamente modificará el archivo de Nginx para incluir SSL.**

### 4.4 Configurar PM2 para Iniciar el Servidor

```bash
# Volver al usuario ltiapp
sudo su - ltiapp
cd /home/ltiapp/lti-server

# Iniciar aplicación con PM2
pm2 start lti-server.js --name lti-app

# Guardar configuración de PM2
pm2 save

# Salir del usuario ltiapp
exit

# Como usuario con sudo, configurar inicio automático
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ltiapp --hp /home/ltiapp
```

**Comandos útiles de PM2:**

```bash
sudo su - ltiapp
pm2 status          # Ver estado de la aplicación
pm2 logs lti-app    # Ver logs en tiempo real
pm2 restart lti-app # Reiniciar aplicación
pm2 stop lti-app    # Detener aplicación
```

---

## 5. Configuración de Moodle

### 5.1 Habilitar LTI 1.3 en Moodle

1. **Iniciar sesión como administrador** en Moodle

2. **Ir a:** `Administración del sitio > Plugins > Actividades > Herramienta externa`

3. **Verificar que LTI 1.3 esté habilitado**

### 5.2 Registrar la Herramienta Externa

1. **Ir a:** `Administración del sitio > Plugins > Actividades > Herramienta externa > Gestionar herramientas`

2. **Click en:** "Configurar una herramienta manualmente"

3. **Rellenar el formulario:**

   | Campo | Valor |
   |-------|-------|
   | **Nombre de la herramienta** | Sistema de Entregas Avanzado |
   | **URL de la herramienta** | `https://lti.tuuniversidad.edu/launch` |
   | **Versión de LTI** | LTI 1.3 |
   | **URL de inicio de sesión** | `https://lti.tuuniversidad.edu/login` |
   | **URL de redirección(es)** | `https://lti.tuuniversidad.edu/launch` |
   | **Conjunto de claves públicas** | `https://lti.tuuniversidad.edu/jwks` |

4. **Configurar servicios IMS LTI:**

   - ✅ **IMS LTI Assignment and Grade Services** (Activar)
   - ✅ **IMS LTI Names and Role Provisioning** (Activar)
   - Permisos: **Usar este servicio para recuperar información de miembros según la configuración de privacidad**

5. **Configurar privacidad:**

   - ✅ Compartir nombre del lanzador con la herramienta
   - ✅ Compartir apellido del lanzador con la herramienta
   - ✅ Compartir correo electrónico del lanzador con la herramienta

6. **Click en "Guardar cambios"**

### 5.3 Obtener Credenciales de Moodle

Después de guardar, Moodle te mostrará:

- **Platform ID** (ejemplo: `https://moodle.tuuniversidad.edu`)
- **Client ID** (ejemplo: `8dG3k2mP9x`)
- **Deployment ID** (ejemplo: `1`)
- **Public keyset URL** (ejemplo: `https://moodle.tuuniversidad.edu/mod/lti/certs.php`)
- **Access token URL** (ejemplo: `https://moodle.tuuniversidad.edu/mod/lti/token.php`)
- **Authentication request URL** (ejemplo: `https://moodle.tuuniversidad.edu/mod/lti/auth.php`)

**⚠️ COPIA ESTOS VALORES** - Los necesitarás en el siguiente paso.

### 5.4 Configurar el Cliente en el Servidor

```bash
# Conectarse al servidor
ssh usuario@tu-servidor.com
sudo su - ltiapp
cd /home/ltiapp/lti-server

# Editar keys.json
nano keys.json
```

**Añadir la configuración del cliente** (dentro del objeto `clients`):

```json
{
  "platform": "https://moodle.tuuniversidad.edu",
  "clientId": "8dG3k2mP9x",
  "authenticationEndpoint": "https://moodle.tuuniversidad.edu/mod/lti/auth.php",
  "accesstokenEndpoint": "https://moodle.tuuniversidad.edu/mod/lti/token.php",
  "authConfig": {
    "method": "JWK_SET",
    "key": "https://moodle.tuuniversidad.edu/mod/lti/certs.php"
  }
}
```

**Ejemplo completo de `keys.json`:**

```json
{
  "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...",
  "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADAN...",
  "clients": [
    {
      "platform": "https://moodle.tuuniversidad.edu",
      "clientId": "8dG3k2mP9x",
      "authenticationEndpoint": "https://moodle.tuuniversidad.edu/mod/lti/auth.php",
      "accesstokenEndpoint": "https://moodle.tuuniversidad.edu/mod/lti/token.php",
      "authConfig": {
        "method": "JWK_SET",
        "key": "https://moodle.tuuniversidad.edu/mod/lti/certs.php"
      }
    }
  ]
}
```

**Guardar y reiniciar el servidor:**

```bash
# Reiniciar con PM2
pm2 restart lti-app

# Verificar logs
pm2 logs lti-app --lines 50
```

---

## 6. Creación de la Actividad en Moodle

### 6.1 Crear un Curso de Prueba

1. **Ir a:** Panel de administración > Cursos > Gestionar cursos y categorías

2. **Crear un curso nuevo:**
   - Nombre: "Curso de Prueba LTI"
   - Nombre corto: "TEST-LTI"

3. **Matricular un estudiante de prueba**

### 6.2 Añadir la Actividad LTI

1. **Entrar al curso** como profesor

2. **Activar edición** (botón arriba a la derecha)

3. **Click en "Añadir una actividad o recurso"**

4. **Seleccionar:** "Herramienta externa"

5. **Configurar la actividad:**

   | Campo | Valor |
   |-------|-------|
   | **Nombre de la actividad** | Tarea: Entrega de Proyecto Final |
   | **Herramienta preconfigurada** | Seleccionar "Sistema de Entregas Avanzado" |
   | **URL de lanzamiento** | `https://lti.tuuniversidad.edu/launch` |
   | **Contenedor de lanzamiento** | Nueva ventana |

6. **Configuración de calificación:**

   - Tipo: Puntuación (0-10)
   - Calificación máxima: 10
   - Calificación para aprobar: 5
   - Método de calificación: **Calificación más alta**

7. **Privacidad:**

   - ✅ Aceptar calificaciones desde la herramienta
   - ✅ Compartir nombre del lanzador con la herramienta
   - ✅ Compartir apellido del lanzador con la herramienta
   - ✅ Compartir correo electrónico del lanzador con la herramienta

8. **Click en "Guardar cambios y mostrar"**

---

## 7. Pruebas y Verificación

### 7.1 Prueba como Estudiante

1. **Iniciar sesión en Moodle** como estudiante de prueba

2. **Entrar al curso** y **click en la actividad**

3. **Verificar que se abre** la interfaz de entrega

4. **Subir un archivo de prueba:**
   - Seleccionar un PDF o documento
   - Añadir comentarios
   - Click en "Subir Archivo"

5. **Completar el cuestionario:**
   - Responder todas las preguntas
   - Click en "Enviar Respuestas"

6. **Verificar que aparece:**
   - ✅ Mensaje de éxito
   - ✅ Badge de "Entrega Completa"
   - ✅ Información del archivo subido
   - ✅ Respuestas del cuestionario
   - ✅ Botón de descarga del archivo

### 7.2 Prueba como Profesor

1. **Iniciar sesión en Moodle** como profesor

2. **Entrar al curso** y **click en la actividad**

3. **Verificar la lista de estudiantes:**
   - Debe aparecer el estudiante de prueba
   - Estado: "Entrega Completa" con badge verde

4. **Click en "Ver Detalles"** de la entrega

5. **Verificar que se muestra:**
   - ✅ Información completa del estudiante
   - ✅ Archivo subido con opción de descarga
   - ✅ Respuestas del cuestionario
   - ✅ Formulario de calificación

6. **Asignar una calificación:**
   - Ingresar nombre del profesor
   - Poner nota (ejemplo: 9)
   - Añadir feedback
   - Click en "Asignar Calificación"

7. **Verificar sincronización con Moodle:**
   - Ir al libro de calificaciones del curso
   - Verificar que la nota aparece correctamente

### 7.3 Verificar Sincronización de Calificaciones

1. **Como profesor en Moodle:**
   - Ir a: Calificaciones > Ver > Informe del calificador
   - Verificar que la nota del estudiante aparece en la columna de la actividad LTI

2. **Como estudiante:**
   - Volver a abrir la actividad LTI
   - Verificar que aparece la sección de calificación con:
     - ✅ Nota recibida
     - ✅ Nombre del profesor que calificó
     - ✅ Fecha y hora de calificación
     - ✅ Feedback del profesor

### 7.4 Verificar Persistencia de Datos

```bash
# Conectarse al servidor
sudo su - ltiapp
cd /home/ltiapp/lti-server

# Verificar que existe submissions.json con datos
cat submissions.json | jq .

# Verificar que se crearon backups
ls -lh backups/

# Verificar que se subió el archivo
ls -lh uploads/
```

---

## 8. Monitoreo y Mantenimiento

### 8.1 Monitoreo de Logs

**Ver logs de la aplicación:**

```bash
sudo su - ltiapp
pm2 logs lti-app
```

**Ver logs de Nginx:**

```bash
sudo tail -f /var/log/nginx/lti-access.log
sudo tail -f /var/log/nginx/lti-error.log
```

**Ver logs del sistema:**

```bash
sudo journalctl -u nginx -f
```

### 8.2 Copias de Seguridad

**Script de backup automático:**

```bash
# Crear script de backup
sudo nano /home/ltiapp/backup-lti.sh
```

**Contenido:**

```bash
#!/bin/bash

# Variables
BACKUP_DIR="/home/ltiapp/backups-sistema"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
LTI_DIR="/home/ltiapp/lti-server"

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

# Crear backup completo
tar -czf $BACKUP_DIR/lti-backup-$DATE.tar.gz \
  -C /home/ltiapp lti-server

# Mantener solo los últimos 30 backups
cd $BACKUP_DIR
ls -t | tail -n +31 | xargs -r rm

echo "Backup completado: lti-backup-$DATE.tar.gz"
```

**Hacer ejecutable:**

```bash
chmod +x /home/ltiapp/backup-lti.sh
```

**Configurar cron para backup diario:**

```bash
# Editar crontab
crontab -e

# Añadir línea (backup diario a las 2 AM)
0 2 * * * /home/ltiapp/backup-lti.sh >> /home/ltiapp/backup.log 2>&1
```

### 8.3 Actualización del Código

**Cuando necesites actualizar:**

```bash
# Conectarse al servidor
sudo su - ltiapp
cd /home/ltiapp/lti-server

# Hacer backup antes de actualizar
cp submissions.json submissions.json.backup
cp keys.json keys.json.backup

# Si usas Git
git pull origin main

# Si subes archivos manualmente
# (sube los nuevos archivos vía SCP)

# Instalar nuevas dependencias (si las hay)
npm install

# Reiniciar aplicación
pm2 restart lti-app

# Verificar que funciona
pm2 logs lti-app --lines 50
```

### 8.4 Limpieza de Archivos Antiguos

**Script para limpiar uploads antiguos (opcional):**

```bash
# Crear script
nano /home/ltiapp/lti-server/cleanup-old-files.js
```

**Contenido:**

```javascript
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = './uploads';
const DAYS_TO_KEEP = 90; // Mantener archivos de los últimos 90 días

const submissions = JSON.parse(fs.readFileSync('./submissions.json', 'utf8'));
const activeFiles = new Set(submissions.map(s => path.basename(s.filePath)));

const files = fs.readdirSync(UPLOADS_DIR);
const now = Date.now();
const maxAge = DAYS_TO_KEEP * 24 * 60 * 60 * 1000;

files.forEach(file => {
  const filePath = path.join(UPLOADS_DIR, file);
  const stats = fs.statSync(filePath);
  const age = now - stats.mtimeMs;
  
  // Solo eliminar si no está en submissions.json Y es antiguo
  if (!activeFiles.has(file) && age > maxAge) {
    fs.unlinkSync(filePath);
    console.log(`Eliminado: ${file}`);
  }
});

console.log('Limpieza completada');
```

---

## 9. Solución de Problemas Comunes

### 9.1 Error: "Invalid State" al hacer Login

**Causa:** El servidor no pudo validar el state de la petición.

**Solución:**

1. Verificar que la URL pública sea correcta en `.env`
2. Limpiar cookies del navegador
3. Verificar logs: `pm2 logs lti-app`

### 9.2 Error: "Not Registered" 

**Causa:** Moodle no está configurado en `keys.json`

**Solución:**

```bash
sudo su - ltiapp
cd /home/ltiapp/lti-server
nano keys.json

# Verificar que el clientId coincida con el de Moodle
# Reiniciar
pm2 restart lti-app
```

### 9.3 Las Calificaciones no se Sincronizan

**Causa:** Servicios de calificación no habilitados en Moodle.

**Solución:**

1. En Moodle, ir a la configuración de la herramienta externa
2. Verificar que "IMS LTI Assignment and Grade Services" esté activado
3. En la actividad, verificar que "Aceptar calificaciones desde la herramienta" esté activado

### 9.4 Error 502 Bad Gateway

**Causa:** El servidor Node.js no está corriendo.

**Solución:**

```bash
sudo su - ltiapp
pm2 status

# Si no está corriendo
pm2 start lti-app

# Ver logs para identificar error
pm2 logs lti-app
```

### 9.5 Error al Subir Archivos Grandes

**Causa:** Límite de tamaño en Nginx o Node.js.

**Solución:**

**En Nginx:**

```bash
sudo nano /etc/nginx/sites-available/lti-server

# Verificar/añadir:
client_max_body_size 50M;

# Reiniciar Nginx
sudo systemctl restart nginx
```

**En el código:**

```javascript
// En lti-server.js, verificar:
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

### 9.6 Certificado SSL Expirado

**Causa:** Let's Encrypt no renovó automáticamente.

**Solución:**

```bash
# Renovar manualmente
sudo certbot renew

# Verificar renovación automática
sudo certbot renew --dry-run

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 9.7 Archivos de Estudiantes no Aparecen

**Causa:** Permisos incorrectos en directorio `uploads`.

**Solución:**

```bash
sudo su - ltiapp
cd /home/ltiapp/lti-server

# Verificar permisos
ls -la uploads/

# Corregir permisos
chmod 755 uploads/
chmod 644 uploads/*

# Verificar propiedad
sudo chown -R ltiapp:www-data uploads/
```

---

## 10. Checklist Final de Producción

### ✅ Seguridad

- [ ] Firewall configurado (solo puertos 22, 80, 443)
- [ ] SSL/TLS configurado con Let's Encrypt
- [ ] Renovación automática de certificados configurada
- [ ] `keys.json` con permisos restrictivos (600)
- [ ] Variables sensibles en `.env` (no en el código)
- [ ] Usuario dedicado `ltiapp` (no root)

### ✅ Servidor

- [ ] Node.js y npm instalados
- [ ] PM2 configurado con inicio automático
- [ ] Nginx como proxy inverso
- [ ] Logs configurados y rotados
- [ ] Backup automático configurado
- [ ] Límites de carga de archivos configurados

### ✅ Moodle

- [ ] Herramienta externa registrada
- [ ] Servicios IMS LTI habilitados
- [ ] Cliente configurado en `keys.json`
- [ ] Actividad de prueba creada
- [ ] Sincronización de calificaciones funcionando

### ✅ Funcionalidad

- [ ] Estudiantes pueden subir archivos
- [ ] Cuestionario post-entrega funciona
- [ ] Profesores pueden ver todas las entregas
- [ ] Sistema de calificación funciona
- [ ] Calificaciones se sincronizan con Moodle
- [ ] Descarga de archivos funciona
- [ ] Edición de calificaciones funciona
- [ ] Datos persisten en `submissions.json`
- [ ] Backups automáticos funcionan

### ✅ Monitoreo

- [ ] PM2 logs accesibles
- [ ] Nginx logs configurados
- [ ] Script de monitoreo de espacio en disco
- [ ] Alertas configuradas (opcional)

---

## 11. Comandos de Referencia Rápida

### Gestión del Servidor

```bash
# Ver estado del servidor
sudo su - ltiapp
pm2 status

# Ver logs en tiempo real
pm2 logs lti-app

# Reiniciar servidor
pm2 restart lti-app

# Detener servidor
pm2 stop lti-app

# Iniciar servidor
pm2 start lti-app
```

### Gestión de Nginx

```bash
# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/lti-error.log
```

### Verificar Datos

```bash
# Ver submissions
cat /home/ltiapp/lti-server/submissions.json | jq .

# Contar entregas
cat /home/ltiapp/lti-server/submissions.json | jq '. | length'

# Ver backups
ls -lh /home/ltiapp/lti-server/backups/
```

### Backups Manuales

```bash
# Backup completo
tar -czf lti-backup-$(date +%Y%m%d).tar.gz \
  -C /home/ltiapp lti-server

# Backup solo de datos
cp submissions.json submissions-backup-$(date +%Y%m%d).json
```

---

## 12. Recursos Adicionales

### Documentación Oficial

- **LTI 1.3 Spec:** https://www.imsglobal.org/spec/lti/v1p3/
- **Moodle LTI:** https://docs.moodle.org/en/External_tool
- **PM2 Docs:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx Docs:** https://nginx.org/en/docs/

### Contacto y Soporte

Para problemas específicos con esta implementación, revisar:

1. `README.md` - Documentación técnica completa
2. `CHANGELOG.md` - Historial de cambios y versiones
3. Logs del servidor: `pm2 logs lti-app`

---

## 📝 Notas Finales

Esta guía asume un servidor limpio con Ubuntu 22.04. Si usas otra distribución o ya tienes servicios corriendo, puede que necesites adaptar algunos comandos.

**Recuerda:**

- 🔒 **Seguridad primero:** Nunca expongas `keys.json` públicamente
- 💾 **Backups regulares:** Configura backups automáticos desde el día 1
- 📊 **Monitoreo constante:** Revisa los logs regularmente
- 🔄 **Actualizaciones:** Mantén Node.js, npm y dependencias actualizadas

**¡Buena suerte con tu despliegue!** 🚀

---

**Última actualización:** 11 de noviembre de 2025  
**Versión:** 1.0.0
