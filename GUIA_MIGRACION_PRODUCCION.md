# 🚀 Guía Completa de Migración a Producción

Esta guía te llevará paso a paso desde el entorno de desarrollo local hasta un servidor de producción real, incluyendo la configuración completa de Moodle.

**🎯 ¿Tienes un Moodle ya funcionando?** ¡Perfecto! Esta guía te permitirá desplegar el Sistema de Entregas LTI 1.3 sin problemas siguiendo todos los pasos.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#-requisitos-previos)
2. [Preparación del Servidor](#-preparación-del-servidor)
3. [Instalación en el Servidor](#-instalación-en-el-servidor)
4. [Configuración de Dominio y SSL](#-configuración-de-dominio-y-ssl)
5. [Configuración del Servicio](#-configuración-del-servicio)
6. [Configuración en Moodle](#-configuración-en-moodle)
7. [Configuración de la Tarea](#-configuración-de-la-tarea)
8. [Pruebas y Verificación](#-pruebas-y-verificación)
9. [Monitoreo y Mantenimiento](#-monitoreo-y-mantenimiento)
10. [Solución de Problemas](#-solución-de-problemas)

---

## ✅ Requisitos Previos

### ⚠️ IMPORTANTE: ¿Qué necesitas tener listo?

Esta guía asume que **YA TIENES**:

#### ✅ Moodle en Producción
- **Moodle instalado y funcionando** (versión 3.9 o superior)
- **URL accesible**: Por ejemplo `https://moodle.tu-universidad.edu`
- **Acceso administrativo**: Usuario con permisos de administrador del sitio
- **HTTPS configurado**: Moodle debe estar funcionando con SSL/TLS válido
- **Servicios web disponibles**: Capacidad de habilitar servicios web (viene por defecto)

**Si NO tienes Moodle instalado**, deberás instalarlo primero. Ver:
- [Documentación oficial de instalación de Moodle](https://docs.moodle.org/es/Instalaci%C3%B3n)
- Esto está fuera del alcance de esta guía

#### ✅ Servidor Separado para la Herramienta LTI

**Opción A: Servidor Separado (Recomendado)**
- Servidor Linux diferente al de Moodle
- Mejor rendimiento y aislamiento
- Facilita mantenimiento independiente

**Opción B: Mismo Servidor que Moodle**
- Puedes instalar en el mismo servidor que Moodle
- Usar puerto diferente (3000) con Nginx como proxy
- Asegurar que hay recursos suficientes (RAM, CPU)

### Servidor para la Herramienta LTI

- **Sistema Operativo**: Ubuntu 20.04+ o similar (Debian, CentOS)
- **RAM**: Mínimo 1GB, recomendado 2GB+
- **Disco**: Mínimo 10GB libres
- **CPU**: 1 core mínimo, 2+ recomendado
- **Acceso**: SSH con permisos sudo

### Dominio y Red

- **Dominio/Subdominio**: Para la herramienta LTI
  - Ejemplo: `entregas.tu-universidad.edu`
  - Puede ser diferente del dominio de Moodle
- **IP pública fija**: Del servidor de la herramienta LTI
- **Puertos abiertos**: 80 (HTTP) y 443 (HTTPS)
- **Firewall**: Configurado para permitir tráfico web
- **DNS configurado**: Dominio apuntando a la IP del servidor

### Certificado SSL

- **Let's Encrypt** (gratis, recomendado) - cubierto en esta guía
- **Certificado comercial** (si tu organización lo requiere)
- **HTTPS obligatorio**: LTI 1.3 requiere conexiones seguras

### Conocimientos Necesarios

- ✅ Comandos básicos de Linux
- ✅ SSH y gestión remota de servidores
- ✅ Configuración DNS básica
- ✅ Administración de Moodle
- ✅ Conceptos básicos de Nginx y certificados SSL

### ⏱️ Tiempo Estimado de Implementación

- **Preparación del servidor**: 1-2 horas
- **Configuración de la herramienta**: 1-2 horas
- **Configuración de Moodle**: 30-60 minutos
- **Pruebas**: 30 minutos
- **Total**: 3-5 horas (dependiendo de tu experiencia)

---

## 📝 Resumen del Proceso

```
┌─────────────────────────────────────────────────┐
│  1. YA TIENES MOODLE FUNCIONANDO               │
│     https://moodle.tu-universidad.edu          │
└─────────────────────┬───────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────┐
│  2. PREPARAR SERVIDOR PARA HERRAMIENTA LTI     │
│     - Instalar Node.js                         │
│     - Configurar Nginx                         │
│     - Obtener certificado SSL                  │
└─────────────────────┬───────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────┐
│  3. INSTALAR HERRAMIENTA LTI                   │
│     https://entregas.tu-universidad.edu        │
│     - Subir archivos                           │
│     - Configurar variables                     │
│     - Iniciar servicio                         │
└─────────────────────┬───────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────┐
│  4. CONECTAR MOODLE CON HERRAMIENTA            │
│     - Habilitar servicios web en Moodle       │
│     - Configurar herramienta externa LTI      │
│     - Agregar actividad al curso              │
└─────────────────────┬───────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────┐
│  5. PROBAR Y VERIFICAR                         │
│     - Pruebas como estudiante                  │
│     - Pruebas como profesor                    │
│     - Verificar persistencia                   │
└─────────────────────────────────────────────────┘
                      │
                      ↓
                  ✅ LISTO
```

---

## 🖥️ Preparación del Servidor

### 1. Conectar al Servidor vía SSH

```bash
# Desde tu máquina local
ssh usuario@tu-servidor.com

# O usando IP directamente
ssh usuario@123.456.789.012
```

### 2. Actualizar el Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Instalar Node.js y npm

#### Opción A: Usando NodeSource (Recomendado)

```bash
# Instalar Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debería mostrar v18.x.x
npm --version   # Debería mostrar 9.x.x o superior
```

#### Opción B: Usando nvm

```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recargar configuración
source ~/.bashrc

# Instalar Node.js
nvm install 18
nvm use 18
nvm alias default 18
```

### 4. Instalar Git

```bash
sudo apt install -y git
```

### 5. Crear Usuario para la Aplicación

```bash
# Crear usuario sin privilegios para ejecutar la aplicación
sudo adduser --system --group --no-create-home entregas

# Verificar
id entregas
```

### 6. Configurar Firewall

```bash
# Permitir SSH, HTTP y HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable

# Verificar estado
sudo ufw status
```

---

## 📦 Instalación en el Servidor

### 1. Crear Directorio de Aplicación

```bash
# Crear directorio
sudo mkdir -p /opt/entregas-lti
sudo chown $USER:$USER /opt/entregas-lti

# Navegar al directorio
cd /opt/entregas-lti
```

### 2. Clonar o Subir el Proyecto

#### Opción A: Usando Git

```bash
# Si tienes el proyecto en un repositorio
git clone https://github.com/tu-usuario/sistema-entregas-lti.git .
```

#### Opción B: Subir archivos manualmente

```bash
# Desde tu máquina local
scp -r c:\API/* usuario@tu-servidor.com:/opt/entregas-lti/

# O usando SFTP/FileZilla/WinSCP
```

### 3. Instalar Dependencias

```bash
cd /opt/entregas-lti
npm install --production
```

**Salida esperada:**
```
added 150 packages in 30s
```

### 4. Generar Claves JWKS

```bash
node generate-keys.js
```

**Salida esperada:**
```
✅ Claves generadas y guardadas en keys.json
```

### 5. Configurar Variables de Entorno

```bash
# Crear archivo .env
nano .env
```

**Contenido del archivo `.env`:**

```env
# URL de tu Moodle (sin barra al final)
MOODLE_URL=https://moodle.tu-universidad.edu

# Token de servicios web de Moodle
MOODLE_TOKEN=abc123def456ghi789jkl012mno345pqr678

# Puerto del servidor (3000 para desarrollo, usar con proxy reverso)
PORT=3000

# URL pública de tu aplicación
BASE_URL=https://entregas.tu-universidad.edu

# Secreto para sesiones (generar uno aleatorio y seguro)
SESSION_SECRET=GeneraUnSecretoMuyLargoYAleatorioAqui123456789

# Entorno de producción
NODE_ENV=production
```

**Para generar un secreto seguro:**

```bash
# Opción 1: Usando OpenSSL
openssl rand -base64 32

# Opción 2: Usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Crear Directorios Necesarios

```bash
# Crear directorios con permisos correctos
mkdir -p uploads backups
chmod 755 uploads backups
```

### 7. Ajustar Permisos

```bash
# Cambiar propietario de archivos
sudo chown -R entregas:entregas /opt/entregas-lti

# Asegurar que solo el usuario entregas pueda leer archivos sensibles
chmod 600 .env keys.json
chmod 644 submissions.json
```

---

## 🌐 Configuración de Dominio y SSL

### 1. Configurar DNS

En tu proveedor de dominio (Namecheap, GoDaddy, etc.):

```
Tipo: A
Nombre: entregas (o el subdominio que quieras)
Valor: 123.456.789.012 (IP de tu servidor)
TTL: 3600 (1 hora)
```

**Verificar propagación DNS:**

```bash
# Esperar unos minutos y verificar
nslookup entregas.tu-universidad.edu

# O usando dig
dig entregas.tu-universidad.edu
```

### 2. Instalar Nginx

```bash
sudo apt install -y nginx

# Iniciar y habilitar
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar estado
sudo systemctl status nginx
```

### 3. Configurar Nginx como Proxy Reverso

```bash
# Crear configuración para el sitio
sudo nano /etc/nginx/sites-available/entregas-lti
```

**Contenido inicial (sin SSL):**

```nginx
server {
    listen 80;
    server_name entregas.tu-universidad.edu;

    # Logs
    access_log /var/log/nginx/entregas-lti-access.log;
    error_log /var/log/nginx/entregas-lti-error.log;

    # Proxy hacia Node.js
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
        
        # Timeouts para subidas de archivos grandes
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }

    # Límite de tamaño de archivo (10MB + margen)
    client_max_body_size 15M;
}
```

**Activar la configuración:**

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/entregas-lti /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### 4. Instalar Certificado SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado (interactivo)
sudo certbot --nginx -d entregas.tu-universidad.edu

# Seguir las instrucciones en pantalla:
# 1. Ingresa tu email
# 2. Acepta términos
# 3. Selecciona redirección HTTPS (opción 2)
```

**Certbot actualizará automáticamente tu configuración de Nginx para incluir:**

- Redirección automática de HTTP a HTTPS
- Configuración SSL/TLS
- Certificados en `/etc/letsencrypt/`

**Verificar renovación automática:**

```bash
# Probar renovación
sudo certbot renew --dry-run

# Certbot crea un cron job automáticamente
sudo systemctl status certbot.timer
```

### 5. Configuración Final de Nginx con SSL

Después de Certbot, tu archivo debería verse así:

```bash
sudo nano /etc/nginx/sites-available/entregas-lti
```

```nginx
# Redirección HTTP a HTTPS
server {
    listen 80;
    server_name entregas.tu-universidad.edu;
    return 301 https://$server_name$request_uri;
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    server_name entregas.tu-universidad.edu;

    # Certificados SSL (gestionados por Certbot)
    ssl_certificate /etc/letsencrypt/live/entregas.tu-universidad.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/entregas.tu-universidad.edu/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Logs
    access_log /var/log/nginx/entregas-lti-access.log;
    error_log /var/log/nginx/entregas-lti-error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy hacia Node.js
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
        
        # Timeouts
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }

    # Límite de tamaño de archivo
    client_max_body_size 15M;
}
```

```bash
# Probar configuración
sudo nginx -t

# Recargar
sudo systemctl reload nginx
```

---

## ⚙️ Configuración del Servicio

### 1. Crear Servicio Systemd

```bash
sudo nano /etc/systemd/system/entregas-lti.service
```

**Contenido:**

```ini
[Unit]
Description=Sistema de Entregas LTI 1.3
Documentation=https://github.com/tu-usuario/sistema-entregas-lti
After=network.target

[Service]
Type=simple
User=entregas
Group=entregas
WorkingDirectory=/opt/entregas-lti
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /opt/entregas-lti/lti-server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=entregas-lti

# Límites de recursos
LimitNOFILE=65536

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/entregas-lti/uploads /opt/entregas-lti/backups /opt/entregas-lti/submissions.json

[Install]
WantedBy=multi-user.target
```

### 2. Habilitar e Iniciar el Servicio

```bash
# Recargar systemd
sudo systemctl daemon-reload

# Habilitar inicio automático
sudo systemctl enable entregas-lti

# Iniciar servicio
sudo systemctl start entregas-lti

# Verificar estado
sudo systemctl status entregas-lti
```

**Salida esperada:**

```
● entregas-lti.service - Sistema de Entregas LTI 1.3
     Loaded: loaded (/etc/systemd/system/entregas-lti.service; enabled)
     Active: active (running) since Thu 2025-11-07 10:00:00 UTC; 5s ago
   Main PID: 12345 (node)
      Tasks: 11 (limit: 4915)
     Memory: 45.2M
        CPU: 1.234s
     CGroup: /system.slice/entregas-lti.service
             └─12345 /usr/bin/node /opt/entregas-lti/lti-server.js
```

### 3. Ver Logs del Servicio

```bash
# Ver logs en tiempo real
sudo journalctl -u entregas-lti -f

# Ver últimos 100 logs
sudo journalctl -u entregas-lti -n 100

# Ver logs desde hoy
sudo journalctl -u entregas-lti --since today
```

### 4. Comandos Útiles del Servicio

```bash
# Iniciar
sudo systemctl start entregas-lti

# Detener
sudo systemctl stop entregas-lti

# Reiniciar
sudo systemctl restart entregas-lti

# Recargar configuración (si aplica)
sudo systemctl reload entregas-lti

# Ver estado
sudo systemctl status entregas-lti

# Deshabilitar inicio automático
sudo systemctl disable entregas-lti
```

---

## 🎓 Configuración en Moodle

### 1. Habilitar Servicios Web

#### Paso 1: Activar servicios web globalmente

1. Accede a Moodle como **administrador**
2. Ve a: **Administración del sitio** → **Funciones avanzadas**
3. Marca: ✅ **"Habilitar servicios web"**
4. Haz clic en **"Guardar cambios"**

#### Paso 2: Habilitar protocolos

1. Ve a: **Administración del sitio** → **Servidor** → **Servicios web** → **Gestionar protocolos**
2. Habilita: ✅ **REST protocol**
3. Guarda cambios

### 2. Crear Servicio Web Personalizado

#### Paso 1: Crear el servicio

1. Ve a: **Administración del sitio** → **Servidor** → **Servicios web** → **Servicios externos**
2. Haz clic en **"Agregar"**
3. Configura:
   - **Nombre**: `Sistema de Entregas LTI`
   - **Nombre corto**: `entregas_lti_api`
   - **Habilitado**: ✅ Sí
   - **Usuarios autorizados pueden crear tokens**: ✅ Sí (opcional)
4. Haz clic en **"Agregar servicio"**

#### Paso 2: Agregar funciones al servicio

1. En la lista de servicios, encuentra "Sistema de Entregas LTI"
2. Haz clic en **"Agregar funciones"**
3. Busca y agrega estas funciones:

| Función | Descripción |
|---------|-------------|
| `core_user_get_users_by_field` | Obtener información de usuarios |
| `mod_assign_get_submissions` | Obtener entregas de tareas |
| `mod_assign_save_submission` | Guardar entregas |
| `mod_assign_submit_for_grading` | Enviar tarea para calificación |

4. Haz clic en **"Agregar funciones"**

#### Paso 3: Autorizar usuario

1. En el servicio, haz clic en **"Usuarios autorizados"**
2. Haz clic en **"Agregar"**
3. Selecciona tu **usuario administrador**
4. Guarda

### 3. Generar Token de Acceso

#### Opción A: Token para usuario específico

1. Ve a: **Administración del sitio** → **Servidor** → **Servicios web** → **Gestionar tokens**
2. Haz clic en **"Crear token"**
3. Selecciona:
   - **Usuario**: Tu usuario administrador
   - **Servicio**: "Sistema de Entregas LTI"
   - **Dirección IP válida**: Deja vacío (o especifica IP del servidor para mayor seguridad)
4. Haz clic en **"Guardar cambios"**
5. **Copia el token generado** (ejemplo: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

#### Opción B: Permitir a usuarios generar sus propios tokens

1. Ve a: **Administración del sitio** → **Usuarios** → **Permisos** → **Definir roles**
2. Edita el rol "Profesor" o "Manager"
3. Busca y habilita: `moodle/webservice:createtoken`
4. Los usuarios podrán generar tokens desde: **Preferencias** → **Tokens de seguridad**

### 4. Actualizar `.env` en el Servidor

```bash
# En el servidor
sudo nano /opt/entregas-lti/.env
```

Actualiza `MOODLE_TOKEN` con el token que acabas de generar:

```env
MOODLE_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

```bash
# Reiniciar servicio para aplicar cambios
sudo systemctl restart entregas-lti
```

### 5. Configurar Herramienta Externa LTI 1.3

#### Paso 1: Agregar herramienta externa

1. Ve a: **Administración del sitio** → **Plugins** → **Módulos de actividades** → **Herramienta externa**
2. Haz clic en **"Gestionar herramientas"**
3. Haz clic en **"Configurar una herramienta manualmente"**

#### Paso 2: Configuración básica

| Campo | Valor |
|-------|-------|
| **Nombre de la herramienta** | `Sistema de Entregas con Cuestionario` |
| **URL de la herramienta** | `https://entregas.tu-universidad.edu` |
| **Versión de LTI** | `LTI 1.3` |
| **URL de inicio de sesión (Initiate login URL)** | `https://entregas.tu-universidad.edu/login` |
| **URL de redireccionamiento (Redirection URI)** | `https://entregas.tu-universidad.edu/launch` |

#### Paso 3: Configuración de claves públicas

| Campo | Valor |
|-------|-------|
| **Método de conjunto de claves públicas** | `URL del conjunto de claves` |
| **URL de conjunto de claves públicas** | `https://entregas.tu-universidad.edu/jwks.json` |

#### Paso 4: Configuración de privacidad

Marca las siguientes opciones:

- ✅ **Compartir el nombre del iniciador con la herramienta**
- ✅ **Compartir el correo electrónico del iniciador con la herramienta**
- ✅ **Aceptar calificaciones desde la herramienta** (si planeas enviar calificaciones)

#### Paso 5: Servicios LTI

Habilita:

- ✅ **IMS LTI Names and Role Provisioning**
- ✅ **IMS LTI Assignment and Grade Services** (si vas a calificar)

#### Paso 6: Configuración personalizada adicional

Puedes dejar en blanco o agregar parámetros personalizados si los necesitas.

#### Paso 7: Guardar y Obtener Client ID

1. Haz clic en **"Guardar cambios"**

2. **IMPORTANTE**: Anota el **ID de cliente** (Client ID) que aparece en la lista de herramientas
   - **Ejemplo**: `6RzTL5tcDzzDoxc`
   - **Ubicación**: Aparece en la columna "Client ID" junto al nombre de tu herramienta

3. **¿Para qué sirve el Client ID?**
   
   El Client ID es el identificador único que Moodle asigna a tu herramienta LTI. Aunque **NO necesitas configurarlo manualmente** en el servidor (el sistema lo maneja automáticamente), es útil tenerlo anotado para:
   
   - **Debugging**: Si necesitas revisar logs y ver qué herramienta está generando errores
   - **Múltiples instancias**: Si tienes varias instancias de Moodle conectadas al mismo servidor
   - **Soporte técnico**: Para identificar la herramienta en caso de problemas
   - **Documentación**: Para registrar qué herramientas tienes configuradas

4. **¿Dónde se almacena?**
   
   El Client ID viene incluido en el **JWT token** que Moodle envía durante el proceso de autenticación LTI. El servidor lo recibe automáticamente y lo valida, por lo que **no necesitas agregarlo manualmente a ningún archivo de configuración**.

5. **Opcional - Para configuración avanzada:**
   
   Si en el futuro necesitas restringir el acceso solo a ciertos Client IDs específicos, puedes agregarlo al código en `lti-server.js`:
   
   ```javascript
   // Lista de Client IDs permitidos (opcional)
   const ALLOWED_CLIENT_IDS = [
     '6RzTL5tcDzzDoxc',  // Moodle Producción
     'abc123xyz456',      // Moodle Desarrollo
   ];
   
   // Validar Client ID en el endpoint /launch
   if (!ALLOWED_CLIENT_IDS.includes(decodedToken.aud)) {
     return res.status(403).send('Client ID no autorizado');
   }
   ```

6. **Guardar el Client ID en tu documentación:**
   
   Crea un archivo de registro con esta información:
   
   ```
   Moodle: https://moodle.tu-universidad.edu
   Herramienta: Sistema de Entregas con Cuestionario
   Client ID: 6RzTL5tcDzzDoxc
   Fecha de configuración: 7 de noviembre de 2025
   Configurado por: [Tu nombre]
   ```

---

## 📝 Configuración de la Tarea

### 1. Crear Actividad en un Curso

#### Paso 1: Acceder al curso

1. Ve al curso donde quieres agregar la herramienta
2. Haz clic en **"Activar edición"** (esquina superior derecha)

#### Paso 2: Agregar actividad

1. En la sección deseada, haz clic en **"Añadir una actividad o recurso"**
2. Selecciona **"Herramienta externa"**
3. Haz clic en **"Agregar"**

#### Paso 3: Configuración general

| Campo | Valor Recomendado |
|-------|-------------------|
| **Nombre de la actividad** | `Entrega de Tarea con Cuestionario Metacognitivo` |
| **Descripción** | Descripción clara de la tarea (ver ejemplo abajo) |
| **Mostrar descripción en página del curso** | ✅ Sí |

**Ejemplo de descripción:**

```
Esta actividad te permite entregar tu trabajo y completar un breve cuestionario metacognitivo.

📝 Instrucciones:
1. Prepara tu archivo en formato PDF, DOCX o ZIP
2. El tamaño máximo es de 10MB
3. Una vez subido el archivo, deberás completar un cuestionario corto sobre tu proceso de aprendizaje
4. Puedes editar tu entrega antes de la fecha límite

💡 El cuestionario te ayudará a reflexionar sobre tu proceso de aprendizaje y los desafíos que enfrentaste.
```

#### Paso 4: Configuración de la herramienta

| Campo | Valor |
|-------|-------|
| **Herramienta preconfigurada** | Selecciona "Sistema de Entregas con Cuestionario" |
| **URL de la herramienta** | (Autocompletado) |
| **Lanzar contenedor** | `Nueva ventana` o `Ventana existente` (tu preferencia) |
| **Idioma de la actividad** | Español (o el idioma de tu curso) |

#### Paso 5: Configuración de privacidad

Asegúrate de que estén marcadas:

- ✅ **Aceptar calificaciones desde la herramienta**
- ✅ **Compartir el nombre del iniciador con la herramienta**
- ✅ **Compartir el correo electrónico del iniciador con la herramienta**

#### Paso 6: Calificación

| Campo | Valor |
|-------|-------|
| **Tipo** | `Punto` o `Escala` según prefieras |
| **Calificación máxima** | `100` (o el valor que uses) |
| **Método de calificación** | `Calificación más alta` |
| **Categoría de calificación** | La categoría correspondiente de tu curso |

#### Paso 7: Disponibilidad

| Campo | Valor |
|-------|-------|
| **Permitir entregas desde** | Fecha de inicio de la tarea |
| **Fecha de entrega** | Fecha límite de la tarea |
| **Fecha límite** | Fecha máxima con penalización (opcional) |
| **Impedir entregas tardías** | ✅ o ❌ según tu política |

#### Paso 8: Ajustes comunes del módulo

| Campo | Valor |
|-------|-------|
| **Visible** | `Mostrar` |
| **Número ID** | (Opcional, para identificación interna) |

#### Paso 9: Guardar

1. Haz clic en **"Guardar cambios y regresar al curso"**
2. La actividad aparecerá en el curso

### 2. Configurar Permisos (si es necesario)

Si quieres que solo ciertos roles vean la actividad:

1. Haz clic en la actividad
2. En el engranaje ⚙️, selecciona **"Permisos"**
3. Ajusta los permisos según necesites

### 3. Probar la Actividad

#### Como Estudiante:

1. Ingresa al curso con una cuenta de estudiante (o cambia de rol)
2. Haz clic en la actividad
3. Deberías ver el formulario de entrega

#### Como Profesor:

1. Ingresa al curso con cuenta de profesor
2. Haz clic en la actividad
3. Deberías ver la lista de entregas (vacía si nadie ha entregado)

---

## ✅ Pruebas y Verificación

### 1. Verificar Conexión del Servidor

```bash
# Verificar que el servidor esté corriendo
curl https://entregas.tu-universidad.edu

# Debería responder con HTML de la página principal
```

### 2. Verificar JWKS

```bash
# Ver claves públicas
curl https://entregas.tu-universidad.edu/jwks.json

# Debería responder con JSON:
# {
#   "keys": [...]
# }
```

### 3. Prueba de Flujo Completo como Estudiante

1. **Acceder a Moodle**
   - Inicia sesión con cuenta de estudiante
   - Ve al curso
   - Haz clic en la actividad

2. **Verificar Redirección LTI**
   - Deberías ser redirigido a tu servidor
   - La URL debe cambiar a `https://entregas.tu-universidad.edu/launch`
   - No deberías ver errores de autenticación

3. **Subir Archivo**
   - Selecciona un archivo de prueba (< 10MB)
   - Agrega comentarios opcionales
   - Haz clic en "Entregar Tarea"

4. **Completar Cuestionario**
   - Deberías ser redirigido a `/cuestionario`
   - Responde las 5 preguntas
   - Haz clic en "Enviar Cuestionario"

5. **Verificar Confirmación**
   - Deberías ver un mensaje de éxito
   - ✅ "Cuestionario enviado correctamente"

### 4. Prueba de Flujo Completo como Profesor

1. **Acceder como Profesor**
   - Cambia de rol o inicia sesión como profesor
   - Accede a la misma actividad

2. **Ver Lista de Entregas**
   - Deberías ver una tabla con todas las entregas
   - Verifica estadísticas: Total, Completas, Pendientes

3. **Ver Detalles de Entrega**
   - Haz clic en "👁️ Ver detalles" de una entrega
   - Verifica que se muestren:
     - Información del estudiante
     - Detalles del archivo
     - Respuestas del cuestionario

4. **Descargar Archivo**
   - Haz clic en el botón de descarga
   - El archivo debería descargarse correctamente

### 5. Verificar Persistencia de Datos

```bash
# En el servidor, verificar que se guardan los datos
sudo cat /opt/entregas-lti/submissions.json

# Debería mostrar JSON con las entregas

# Verificar backups
ls -lah /opt/entregas-lti/backups/

# Debería haber archivos backup
```

### 6. Verificar Logs

```bash
# Ver logs del servidor
sudo journalctl -u entregas-lti -n 50

# Buscar errores
sudo journalctl -u entregas-lti -p err

# Ver logs de Nginx
sudo tail -f /var/log/nginx/entregas-lti-error.log
```

### 7. Script de Verificación Completo

Crea este script en el servidor:

```bash
nano /opt/entregas-lti/verificar-sistema.sh
```

```bash
#!/bin/bash

echo "🔍 Verificando Sistema de Entregas LTI..."
echo ""

# Verificar servicio
echo "1. Estado del servicio:"
systemctl is-active entregas-lti && echo "✅ Servicio activo" || echo "❌ Servicio inactivo"
echo ""

# Verificar Nginx
echo "2. Estado de Nginx:"
systemctl is-active nginx && echo "✅ Nginx activo" || echo "❌ Nginx inactivo"
echo ""

# Verificar conexión HTTPS
echo "3. Conexión HTTPS:"
curl -s -o /dev/null -w "%{http_code}" https://entregas.tu-universidad.edu | grep -q "200" && echo "✅ HTTPS OK" || echo "❌ HTTPS error"
echo ""

# Verificar JWKS
echo "4. JWKS disponible:"
curl -s https://entregas.tu-universidad.edu/jwks.json | grep -q "keys" && echo "✅ JWKS OK" || echo "❌ JWKS error"
echo ""

# Verificar archivos
echo "5. Archivos críticos:"
[[ -f /opt/entregas-lti/.env ]] && echo "✅ .env existe" || echo "❌ .env falta"
[[ -f /opt/entregas-lti/keys.json ]] && echo "✅ keys.json existe" || echo "❌ keys.json falta"
[[ -f /opt/entregas-lti/submissions.json ]] && echo "✅ submissions.json existe" || echo "⚠️  submissions.json falta (se creará automáticamente)"
echo ""

# Verificar directorios
echo "6. Directorios:"
[[ -d /opt/entregas-lti/uploads ]] && echo "✅ uploads/ existe" || echo "❌ uploads/ falta"
[[ -d /opt/entregas-lti/backups ]] && echo "✅ backups/ existe" || echo "❌ backups/ falta"
echo ""

# Verificar certificado SSL
echo "7. Certificado SSL:"
echo | openssl s_client -servername entregas.tu-universidad.edu -connect entregas.tu-universidad.edu:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null && echo "✅ Certificado válido" || echo "❌ Certificado inválido"
echo ""

# Contar entregas
echo "8. Entregas guardadas:"
if [[ -f /opt/entregas-lti/submissions.json ]]; then
    COUNT=$(cat /opt/entregas-lti/submissions.json | grep -o "submissionId" | wc -l)
    echo "📦 Total: $COUNT entregas"
else
    echo "📦 Total: 0 entregas"
fi
echo ""

echo "✅ Verificación completada"
```

```bash
# Dar permisos de ejecución
chmod +x /opt/entregas-lti/verificar-sistema.sh

# Ejecutar
./verificar-sistema.sh
```

---

## 📊 Monitoreo y Mantenimiento

### 1. Monitoreo de Logs

#### Configurar Logrotate

```bash
sudo nano /etc/logrotate.d/entregas-lti
```

```
/var/log/nginx/entregas-lti-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        /usr/bin/systemctl reload nginx > /dev/null 2>&1
    endscript
}
```

#### Ver Logs en Tiempo Real

```bash
# Logs del servicio
sudo journalctl -u entregas-lti -f

# Logs de Nginx access
sudo tail -f /var/log/nginx/entregas-lti-access.log

# Logs de Nginx error
sudo tail -f /var/log/nginx/entregas-lti-error.log
```

### 2. Backups

#### Backup Manual

```bash
#!/bin/bash
# Script: backup-entregas.sh

TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/opt/backups-entregas"
SOURCE_DIR="/opt/entregas-lti"

# Crear directorio de backups
mkdir -p $BACKUP_DIR

# Backup de datos
tar -czf $BACKUP_DIR/entregas-backup-$TIMESTAMP.tar.gz \
    -C $SOURCE_DIR \
    submissions.json \
    uploads/ \
    backups/ \
    .env \
    keys.json

echo "✅ Backup creado: entregas-backup-$TIMESTAMP.tar.gz"

# Mantener solo últimos 30 backups
cd $BACKUP_DIR
ls -t entregas-backup-*.tar.gz | tail -n +31 | xargs -r rm

echo "🗑️  Backups antiguos eliminados"
```

```bash
# Hacer ejecutable
chmod +x /opt/entregas-lti/backup-entregas.sh
```

#### Backup Automatizado con Cron

```bash
# Editar crontab
sudo crontab -e

# Agregar línea para backup diario a las 3 AM
0 3 * * * /opt/entregas-lti/backup-entregas.sh >> /var/log/backup-entregas.log 2>&1
```

### 3. Actualización del Sistema

```bash
#!/bin/bash
# Script: actualizar-entregas.sh

echo "🔄 Actualizando Sistema de Entregas LTI..."

# Navegar al directorio
cd /opt/entregas-lti

# Detener servicio
sudo systemctl stop entregas-lti

# Backup antes de actualizar
./backup-entregas.sh

# Actualizar código (si usas git)
git pull origin main

# Instalar/actualizar dependencias
npm install --production

# Iniciar servicio
sudo systemctl start entregas-lti

# Verificar estado
sleep 2
sudo systemctl status entregas-lti

echo "✅ Actualización completada"
```

### 4. Limpieza de Archivos Antiguos

```bash
# Limpiar archivos subidos de hace más de 6 meses
find /opt/entregas-lti/uploads/ -type f -mtime +180 -delete

# Limpiar backups de hace más de 3 meses
find /opt/entregas-lti/backups/ -type f -mtime +90 -delete
```

### 5. Monitoreo de Recursos

```bash
# Ver uso de recursos del servicio
systemctl status entregas-lti

# Ver procesos Node.js
ps aux | grep node

# Ver uso de memoria
free -h

# Ver espacio en disco
df -h

# Ver uso de disco en directorio de entregas
du -sh /opt/entregas-lti/*
```

### 6. Alertas por Email (opcional)

Instalar `mailutils`:

```bash
sudo apt install -y mailutils
```

Script de monitoreo:

```bash
#!/bin/bash
# Script: monitor-entregas.sh

SERVICE="entregas-lti"
EMAIL="admin@tu-universidad.edu"

# Verificar si el servicio está corriendo
if ! systemctl is-active --quiet $SERVICE; then
    echo "El servicio $SERVICE está INACTIVO" | mail -s "ALERTA: $SERVICE caído" $EMAIL
    
    # Intentar reiniciar
    sudo systemctl start $SERVICE
fi
```

Agregar a cron cada 5 minutos:

```bash
*/5 * * * * /opt/entregas-lti/monitor-entregas.sh
```

---

## 🔧 Solución de Problemas

### Problema 1: El servicio no inicia

**Síntomas:**
```bash
sudo systemctl status entregas-lti
● entregas-lti.service - Sistema de Entregas LTI 1.3
     Active: failed (Result: exit-code)
```

**Soluciones:**

```bash
# Ver error específico
sudo journalctl -u entregas-lti -n 50

# Errores comunes:

# 1. Puerto ya en uso
# Buscar proceso usando el puerto 3000
sudo lsof -i :3000
# Matar proceso
sudo kill -9 <PID>

# 2. Permisos incorrectos
sudo chown -R entregas:entregas /opt/entregas-lti
sudo chmod 755 /opt/entregas-lti
sudo chmod 644 /opt/entregas-lti/lti-server.js

# 3. Archivo .env mal configurado
sudo nano /opt/entregas-lti/.env
# Verificar que no haya espacios antes/después de =
# Verificar que las URLs no tengan barra al final

# 4. Dependencias faltantes
cd /opt/entregas-lti
npm install --production
```

### Problema 2: Error 502 Bad Gateway

**Síntomas:**
Al acceder a la URL, Nginx muestra "502 Bad Gateway"

**Soluciones:**

```bash
# 1. Verificar que el servicio Node.js esté corriendo
sudo systemctl status entregas-lti

# Si no está corriendo, iniciar
sudo systemctl start entregas-lti

# 2. Verificar que escuche en el puerto correcto
sudo ss -tulpn | grep 3000
# Debería mostrar: LISTEN 0 511 *:3000

# 3. Ver logs de Nginx
sudo tail -f /var/log/nginx/entregas-lti-error.log

# 4. Probar conexión local
curl http://localhost:3000
# Debería responder con HTML
```

### Problema 3: Error de autenticación LTI

**Síntomas:**
"Error de autenticación" o "Invalid JWT" al lanzar desde Moodle

**Soluciones:**

```bash
# 1. Verificar JWKS accesible
curl https://entregas.tu-universidad.edu/jwks.json
# Debe responder con JSON

# 2. Verificar configuración en Moodle
# - Asegurar que la URL del keyset esté correcta
# - Verificar que la herramienta esté habilitada

# 3. Ver logs del servidor
sudo journalctl -u entregas-lti -f
# Lanzar desde Moodle y ver errores

# 4. Regenerar claves JWKS
cd /opt/entregas-lti
node generate-keys.js
sudo systemctl restart entregas-lti
# IMPORTANTE: Actualizar URL de keyset en Moodle si cambió
```

### Problema 4: No se pueden subir archivos

**Síntomas:**
Error al intentar subir archivo o archivo no se guarda

**Soluciones:**

```bash
# 1. Verificar permisos del directorio uploads
ls -la /opt/entregas-lti/
sudo chown -R entregas:entregas /opt/entregas-lti/uploads
sudo chmod 755 /opt/entregas-lti/uploads

# 2. Verificar espacio en disco
df -h /opt/entregas-lti
# Si está lleno, limpiar archivos viejos

# 3. Verificar límite de Nginx
sudo nano /etc/nginx/sites-available/entregas-lti
# Verificar: client_max_body_size 15M;
sudo nginx -t
sudo systemctl reload nginx

# 4. Ver logs durante subida
sudo journalctl -u entregas-lti -f
# Intentar subir archivo y ver error
```

### Problema 5: Certificado SSL expirado

**Síntomas:**
Advertencia de certificado inseguro en navegador

**Soluciones:**

```bash
# 1. Verificar expiración
echo | openssl s_client -servername entregas.tu-universidad.edu -connect entregas.tu-universidad.edu:443 2>/dev/null | openssl x509 -noout -dates

# 2. Renovar certificado manualmente
sudo certbot renew

# 3. Verificar renovación automática
sudo systemctl status certbot.timer

# 4. Forzar renovación
sudo certbot renew --force-renewal

# 5. Recargar Nginx
sudo systemctl reload nginx
```

### Problema 6: Datos perdidos o corruptos

**Síntomas:**
`submissions.json` vacío o con errores

**Soluciones:**

```bash
# 1. Verificar backups disponibles
ls -lah /opt/entregas-lti/backups/

# 2. Restaurar desde backup más reciente
cd /opt/entregas-lti
sudo systemctl stop entregas-lti
cp backups/submissions_backup_YYYY-MM-DDTHH-MM-SS.json submissions.json
sudo systemctl start entregas-lti

# 3. Verificar integridad del JSON
cat submissions.json | python3 -m json.tool

# 4. Si el JSON está corrupto pero parcialmente recuperable
# Hacer backup del corrupto
cp submissions.json submissions_corrupto_$(date +%Y-%m-%d).json
# Intentar reparar manualmente con editor
nano submissions.json
```

### Problema 7: Alto uso de CPU o memoria

**Síntomas:**
Servidor lento, respuestas tardías

**Soluciones:**

```bash
# 1. Ver recursos del servicio
systemctl status entregas-lti

# 2. Ver procesos Node.js
ps aux | grep node

# 3. Reiniciar servicio
sudo systemctl restart entregas-lti

# 4. Verificar logs para bucles o errores repetidos
sudo journalctl -u entregas-lti -n 200

# 5. Optimizar configuración de Node.js
# Editar servicio para limitar memoria
sudo nano /etc/systemd/system/entregas-lti.service
# Agregar: Environment=NODE_OPTIONS="--max-old-space-size=512"
sudo systemctl daemon-reload
sudo systemctl restart entregas-lti
```

### Problema 8: No se ven entregas en vista profesor

**Síntomas:**
Profesor no ve lista de entregas o ve lista vacía

**Soluciones:**

```bash
# 1. Verificar que hay entregas guardadas
cat /opt/entregas-lti/submissions.json

# 2. Verificar logs durante acceso del profesor
sudo journalctl -u entregas-lti -f
# Profesor accede y ver qué muestra

# 3. Verificar rol detectado
# En lti-server.js, el rol debe detectarse correctamente
# Ver logs para: "Rol detectado: Instructor" o similar

# 4. Probar endpoint de debug
curl https://entregas.tu-universidad.edu/debug/submissions
# Debe listar las entregas
```

### Comandos Útiles de Diagnóstico

```bash
# Ver todo el estado del sistema
sudo systemctl status entregas-lti nginx

# Ver últimos 100 logs
sudo journalctl -u entregas-lti -n 100

# Ver logs desde hace 1 hora
sudo journalctl -u entregas-lti --since "1 hour ago"

# Ver solo errores
sudo journalctl -u entregas-lti -p err

# Probar conectividad
curl -I https://entregas.tu-universidad.edu

# Ver conexiones activas
sudo ss -tulpn | grep -E '(3000|80|443)'

# Ver uso de recursos
htop  # (instalar con: sudo apt install htop)
```

---

## 📚 Recursos Adicionales

### Documentación

- [LTI 1.3 Core Specification](https://www.imsglobal.org/spec/lti/v1p3/)
- [Moodle LTI Documentation](https://docs.moodle.org/en/LTI_and_Moodle)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Herramientas

- [Certbot](https://certbot.eff.org/) - Certificados SSL gratis
- [ngrok](https://ngrok.com/) - Túneles para desarrollo
- [PM2](https://pm2.keymetrics.io/) - Alternativa a systemd
- [Postman](https://www.postman.com/) - Probar APIs

### Seguridad

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Let's Encrypt](https://letsencrypt.org/)

---

## 🎉 Conclusión

Ahora tienes un sistema completo de entregas con LTI 1.3 funcionando en producción. El sistema incluye:

✅ Servidor Node.js configurado como servicio systemd  
✅ Nginx como proxy reverso con SSL  
✅ Moodle configurado con la herramienta externa  
✅ Sistema de backups automáticos  
✅ Monitoreo y logs  
✅ Procedimientos de mantenimiento  

### Próximos Pasos Recomendados

1. **Configurar monitoreo avanzado**: Considerar herramientas como Grafana, Prometheus
2. **Implementar calificaciones automáticas**: Enviar calificaciones de vuelta a Moodle
3. **Agregar analíticas**: Dashboard con estadísticas de entregas
4. **Expandir tipos de archivo**: Agregar soporte para más formatos
5. **Mejorar cuestionario**: Personalizar preguntas por tarea

### Soporte

Si encuentras problemas no cubiertos en esta guía:

1. Revisa los logs: `sudo journalctl -u entregas-lti -f`
2. Verifica la configuración de Moodle
3. Consulta la documentación oficial de LTI 1.3
4. Abre un issue en el repositorio del proyecto

---

**¡Éxito con tu implementación! 🚀**

*Guía creada el: Noviembre 2025*  
*Última actualización: 7 de noviembre de 2025*
