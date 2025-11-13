# 🎓 Sistema de Entregas LTI 1.3 con Cuestionario Post-Entrega



> Sistema de gestión de entregas de tareas con cuestionario metacognitivo, integrado con Moodle mediante LTI 1.3.



[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)> Plataforma de gestión de entregas de tareas con cuestionario metacognitivo, integrada con Moodle mediante LTI 1.3.Sistema completo de entregas integrado con Moodle mediante LTI 1.3 que permite a los estudiantes subir archivos y completar un cuestionario post-entrega, mientras los profesores pueden revisar todas las entregas con detalles completos. Incluye persistencia de datos robusta con sistema de backups automáticos y recuperación ante fallos.

[![LTI 1.3](https://img.shields.io/badge/LTI-1.3-orange)](https://www.imsglobal.org/spec/lti/v1p3/)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)



---[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)---



## ✨ Características[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)



**Estudiantes:**[![LTI](https://img.shields.io/badge/LTI-1.3-orange)](https://www.imsglobal.org/spec/lti/v1p3/)## 📋 Tabla de Contenidos

- 📤 Subir archivos de tareas

- 📝 Completar cuestionario metacognitivo

- ✏️ Editar entregas

- 📊 Ver calificaciones---1. [¿Qué es esto?](#-qué-es-esto)



**Profesores:**2. [Características Principales](#-características-principales)

- 📋 Ver todas las entregas

- ⬇️ Descargar archivos## 🎯 ¿Qué es esto?3. [Requisitos del Sistema](#-requisitos-del-sistema)

- ⭐ Calificar con feedback

- ✏️ Editar calificaciones4. [Instalación Rápida](#-instalación-rápida)



---Una **herramienta externa LTI 1.3** para Moodle que permite gestionar entregas de tareas de forma completa, con un cuestionario metacognitivo post-entrega que ayuda a los estudiantes a reflexionar sobre su proceso de aprendizaje.5. [Configuración Detallada](#-configuración-detallada)



## 🚀 Inicio Rápido6. [Cómo Funciona](#-cómo-funciona)



```bash### ✨ Características Principales7. [Arquitectura del Sistema](#-arquitectura-del-sistema)

# Clonar repositorio

git clone https://github.com/alvarongzlgo-ule/lti_api.git8. [Estructura del Proyecto](#-estructura-del-proyecto)

cd lti_api

**Para Estudiantes:**9. [API y Endpoints](#-api-y-endpoints)

# Instalar dependencias

npm install- 📤 Subida de archivos (PDF, DOCX, ZIP, etc.) hasta 10MB10. [Sistema de Persistencia](#-sistema-de-persistencia)



# Generar claves- 📝 Cuestionario post-entrega obligatorio (5 preguntas metacognitivas)11. [Scripts Utilitarios](#-scripts-utilitarios)

node generate-keys.js

- ✏️ Edición y reemplazo de entregas antes de la fecha límite12. [Resolución de Problemas](#-resolución-de-problemas)

# Configurar .env

cp .env.example .env- 📊 Visualización de calificaciones y retroalimentación del profesor13. [Seguridad](#-seguridad)



# Iniciar servidor- 💬 Comentarios opcionales sobre la entrega14. [Migración a Producción](#-migración-a-producción)

node lti-server.js

```



---**Para Profesores:**---



## 📖 Documentación Completa- 📋 Panel con lista de todas las entregas y estadísticas



### Guías de Despliegue en Producción- 👁️ Vista detallada de cada entrega (archivo + cuestionario)## 🎯 ¿Qué es esto?



Elige el método que prefieras:- ⬇️ Descarga de archivos entregados



- **[📘 Guía con PM2](GUIA_DESPLIEGUE_PM2.md)** - Gestor de procesos moderno (recomendado)- ⭐ Sistema de calificación integrado (0-10)Una **herramienta externa LTI 1.3** para Moodle que permite gestionar entregas de tareas de forma completa e integrada.

- **[📗 Guía con Systemd](GUIA_DESPLIEGUE_SYSTEMD.md)** - Servicio nativo de Linux

- ✏️ Edición de calificaciones ya asignadas

Ambas incluyen:

- Configuración completa del servidor- 📝 Retroalimentación personalizada para cada estudiante### Funcionalidad Principal

- Instalación de Nginx y SSL

- Configuración paso a paso de Moodle

- Solución de problemas

**Integración:****Para Estudiantes:**

### Otros Documentos

- 🔐 Autenticación segura mediante LTI 1.3 + OIDC- Subir archivos de tareas con validación automática

- **[✅ Checklist de Configuración](CHECKLIST_CONFIGURACION.md)** - Lista de verificación

- 🔄 Sin necesidad de credenciales adicionales- Completar cuestionario post-entrega obligatorio

---

- 👥 Roles automáticos desde Moodle- Editar y reemplazar entregas existentes

## 🏗️ Stack Tecnológico

- 💾 Persistencia de datos con backups automáticos- Ver historial de entregas propias

- Node.js + Express.js

- LTI 1.3 + OIDC

- Nginx (proxy)

- Let's Encrypt (SSL)---**Para Profesores:**



---- Ver lista completa de todas las entregas



## 📁 Estructura## 🚀 Inicio Rápido- Acceder a detalles completos de cada entrega



```- Descargar archivos entregados

lti_api/

├── lti-server.js          # Servidor principal### Prerrequisitos- Ver estadísticas y respuestas del cuestionario

├── generate-keys.js       # Generador de claves

├── package.json           # Dependencias

├── .env.example           # Config template

└── keys.json              # Claves JWKS (generado)- **Node.js** v14 o superior**Integración:**

```

- **Moodle** 3.9 o superior con LTI 1.3 habilitado- Autenticación segura mediante LTI 1.3 + OIDC

---

- **Dominio** con SSL/TLS configurado (Let's Encrypt recomendado)- Sin necesidad de credenciales adicionales

## 🔐 Seguridad

- Roles automáticos desde Moodle

- Autenticación LTI 1.3 con OIDC

- Validación JWT### Instalación- Cuestionario metacognitivo de 5 preguntas

- HTTPS obligatorio

- Backups automáticos



---```bash---



## 🐛 Problemas Comunes# 1. Clonar el repositorio



| Error | Solución |git clone https://github.com/alvarongzlgo-ule/lti_api.git## ✨ Características Principales

|-------|----------|

| "Invalid State" | Verificar `PUBLIC_URL` en `.env` |cd lti_api

| "Not Registered" | Verificar `keys.json` con Moodle |

| Archivos no se suben | Permisos en `/uploads` |### 👨‍🎓 Vista Estudiante



Ver guías de despliegue para más detalles.# 2. Instalar dependencias



---npm install- ✅ **Subida de archivos** con validación de tipo y tamaño



## 👥 Autor  - Formatos: PDF, DOC, DOCX, ZIP, RAR, TXT, JPG, PNG



**Álvaro González Lago** - [alvarongzlgo-ule](https://github.com/alvarongzlgo-ule)# 3. Generar claves JWKS  - Límite: 10MB por archivo



---node generate-keys.js- ✅ **Cuestionario post-entrega** obligatorio con 5 preguntas:



## 📚 Referencias  - ⏱️ Tiempo dedicado a la tarea



- [LTI 1.3 Spec](https://www.imsglobal.org/spec/lti/v1p3/)# 4. Configurar variables de entorno  - 📊 Nivel de dificultad percibido

- [Moodle External Tool](https://docs.moodle.org/en/External_tool)

cp .env.example .env  - 📚 Recursos utilizados (múltiple selección)

---

nano .env  # Editar con tus valores  - 💭 Principales desafíos encontrados

**⭐ Si te resulta útil, dale una estrella!**

  - 🎓 Aprendizajes clave obtenidos

# 5. Iniciar servidor- ✅ **Comentarios opcionales** sobre la entrega

node lti-server.js- ✅ **Visualización de entregas previas** con toda la información

```- ✅ **Editar entregas** - reemplazar archivo y actualizar cuestionario

- ✅ **Visualización de calificaciones** asignadas por el profesor:

El servidor estará corriendo en `http://localhost:3000`  - Nota numérica (0-10)

  - Nombre del profesor que calificó

---  - Fecha de calificación

  - Retroalimentación del profesor

## 📖 Documentación- ✅ **Confirmación visual** al completar la entrega



### Guías de Despliegue### 👨‍🏫 Vista Profesor



Tenemos dos guías completas según tu preferencia de gestión de procesos:- ✅ **Panel de estadísticas** en tiempo real:

  - Total de entregas recibidas

- **[GUIA_DESPLIEGUE_PM2.md](GUIA_DESPLIEGUE_PM2.md)** - Despliegue con PM2 (recomendado para producción moderna)  - Entregas completas (con cuestionario)

- **[GUIA_DESPLIEGUE_SYSTEMD.md](GUIA_DESPLIEGUE_SYSTEMD.md)** - Despliegue con systemd (enfoque tradicional)  - Entregas pendientes de cuestionario

- ✅ **Lista de entregas** con información resumida:

Ambas guías incluyen:  - Nombre del estudiante

- ✅ Configuración completa del servidor Linux  - Archivo entregado y tamaño

- ✅ Instalación de Node.js, Nginx y certificados SSL  - Estado del cuestionario

- ✅ Configuración de Moodle paso a paso  - **Calificación asignada** (si existe)

- ✅ Creación de la actividad LTI en un curso  - Fecha y hora de entrega

- ✅ Pruebas y verificación- ✅ **Vista detallada individual** de cada entrega:

- ✅ Monitoreo y mantenimiento  - Información completa del estudiante

- ✅ Solución de problemas comunes  - Archivo con opción de descarga

  - Respuestas completas del cuestionario

### Documentación Adicional  - Comentarios del estudiante

  - Timestamps de todas las acciones

- **[CHECKLIST_CONFIGURACION.md](CHECKLIST_CONFIGURACION.md)** - Lista de verificación para despliegue- ✅ **Sistema de calificación integrado**:

  - Asignar nota de 0 a 10 (con decimales)

---  - Añadir retroalimentación personalizada

  - **Editar calificaciones** ya asignadas

## 🏗️ Arquitectura  - Registro automático del nombre del profesor

  - Fecha y hora de calificación

```  - Validación para evitar datos vacíos

┌─────────────┐         ┌──────────────┐         ┌─────────────┐- ✅ **Interfaz moderna y responsive** compatible con móviles

│   Moodle    │         │  Servidor    │         │  Archivos   │

│   (LMS)     │◄────────┤  Node.js     │────────►│  + Datos    │### 💾 Persistencia y Seguridad de Datos

│             │  LTI 1.3│  Express.js  │         │  JSON       │

└─────────────┘         └──────────────┘         └─────────────┘- ✅ **Almacenamiento persistente** en archivo JSON

      │                        │- ✅ **Sistema de backups automáticos**:

      │                        │  - Backup antes de cada escritura

      ▼                        ▼  - Mantiene los últimos 5 backups

  Profesor                Estudiante  - Rotación automática de backups antiguos

  - Ver entregas         - Subir archivo- ✅ **Protección contra escrituras simultáneas** con flag de bloqueo

  - Calificar            - Cuestionario- ✅ **Validación de integridad** al cargar y guardar:

  - Descargar            - Ver calificación  - Verificación de JSON válido

```  - Validación de estructura de datos

  - Comprobación de campos requeridos

### Stack Tecnológico- ✅ **Recuperación automática** desde backups en caso de corrupción

- ✅ **Escritura atómica** con archivos temporales

- **Backend**: Node.js + Express.js- ✅ **Gestión de archivos** en directorio `uploads/`

- **Autenticación**: LTI 1.3 + OIDC

- **Persistencia**: JSON con sistema de backups### 🔐 Seguridad y Autenticación

- **Frontend**: HTML5 + CSS3 (Server-side rendering)

- **Proxy**: Nginx (producción)- ✅ **LTI 1.3** con flujo OIDC completo

- **SSL**: Let's Encrypt / Certbot- ✅ **Verificación JWT** con JWKS

- ✅ **Protección CSRF** con state y nonce

---- ✅ **Validación de tipos de archivo** en servidor

- ✅ **Límites de tamaño** para prevenir ataques

## 📁 Estructura del Proyecto- ✅ **CORS** configurado correctamente

- ✅ **Sesiones seguras** con express-session

```

lti_api/---

├── lti-server.js              # Servidor principal

├── generate-keys.js           # Generador de claves JWKS## 📦 Requisitos del Sistema

├── package.json               # Dependencias

├── .env.example               # Plantilla de configuración### Software Requerido

├── .gitignore                 # Archivos ignorados

├── keys.json                  # Claves JWKS (generado, no en git)- **Node.js**: v14.0 o superior (recomendado v18+)

├── submissions.json           # Datos de entregas (generado)- **npm**: v6.0 o superior

├── uploads/                   # Archivos subidos (generado)- **Moodle**: v3.9 o superior (recomendado v4.0+)

├── backups/                   # Backups automáticos (generado)- **Sistema Operativo**: Windows, Linux o macOS

├── README.md                  # Este archivo

├── GUIA_DESPLIEGUE_PM2.md    # Guía de despliegue con PM2### Para Desarrollo Local

├── GUIA_DESPLIEGUE_SYSTEMD.md # Guía de despliegue con systemd

└── CHECKLIST_CONFIGURACION.md # Lista de verificación- **ngrok** o túnel similar para exponer servidor local

```- Navegador moderno (Chrome, Firefox, Edge, Safari)



---### Para Producción



## 🔧 Configuración- Servidor con Node.js instalado

- Dominio con certificado SSL/TLS válido

### Variables de Entorno- Acceso SSH al servidor

- Acceso administrativo a Moodle

Crea un archivo `.env` basado en `.env.example`:

---

```env

# Puerto del servidor## 🚀 Instalación Rápida

PORT=3000

### 1. Clonar/Descargar el Proyecto

# URL pública (producción)

PUBLIC_URL=https://entregas.tuuniversidad.edu```bash

# Navegar al directorio

# Entornocd c:\API

NODE_ENV=production

# O clonar desde repositorio

# Directoriosgit clone <tu-repositorio> c:\API

UPLOAD_DIR=./uploadscd c:\API

BACKUP_DIR=./backups```

SUBMISSIONS_FILE=./submissions.json

### 2. Instalar Dependencias

# Límite de tamaño de archivo (bytes)

MAX_FILE_SIZE=10485760```bash

```npm install

```

### Configuración en Moodle

**Dependencias instaladas:**

1. **Habilitar LTI 1.3** en Moodle- `express@5.1.0` - Framework de servidor web

2. **Registrar herramienta externa**:- `express-session@1.18.2` - Gestión de sesiones

   - URL de inicio: `https://tu-dominio.edu/login`- `dotenv@17.2.3` - Variables de entorno

   - URL de lanzamiento: `https://tu-dominio.edu/launch`- `jsonwebtoken@9.0.2` - Verificación y firma JWT

   - URL JWKS: `https://tu-dominio.edu/jwks`- `node-jose@2.2.0` - Criptografía JWKS

3. **Habilitar servicios**:- `axios@1.13.0` - Cliente HTTP

   - ✅ IMS LTI Assignment and Grade Services- `multer@2.0.2` - Gestión de subida de archivos

   - ✅ IMS LTI Names and Role Provisioning- `node-fetch@2.7.0` - Cliente fetch para Node.js

4. **Crear actividad** en un curso usando la herramienta configurada

### 3. Generar Claves JWKS

Ver guías de despliegue para instrucciones detalladas paso a paso.

```bash

---node generate-keys.js

```

## 🔐 Seguridad

Este script crea el archivo `keys.json` con las claves RSA-2048 públicas/privadas necesarias para LTI 1.3.

- ✅ Autenticación LTI 1.3 con OIDC

- ✅ Validación de JWT tokens**Salida esperada:**

- ✅ Claves RSA para firma de tokens```

- ✅ HTTPS obligatorio en producción✅ Claves generadas y guardadas en keys.json

- ✅ Validación de tipos de archivo```

- ✅ Límites de tamaño de carga

- ✅ Sanitización de inputs### 4. Configurar Variables de Entorno

- ✅ Headers de seguridad (CSP, HSTS, etc.)

Crea un archivo `.env` en la raíz del proyecto:

---

```env

## 🐛 Solución de Problemas# URL de tu instancia Moodle

MOODLE_URL=https://localhost:8443

### Error: "Invalid State"

- Verificar URL pública en `.env`# Token de servicios web de Moodle

- Limpiar cookies del navegadorMOODLE_TOKEN=tu_token_aqui



### Error: "Not Registered"# Puerto del servidor LTI

- Verificar configuración de cliente en `keys.json`PORT=3000

- Verificar Client ID de Moodle

# URL pública del servidor (usar ngrok para desarrollo)

### Archivos no se subenBASE_URL=https://tu-subdominio.ngrok-free.app

- Verificar permisos del directorio `uploads/`

- Verificar límite de tamaño en Nginx: `client_max_body_size`# Secreto para sesiones (cambiar en producción)

SESSION_SECRET=un-secreto-muy-seguro-y-largo-aqui

Ver las guías de despliegue para más soluciones.```



---### 5. Iniciar el Servidor



## 📊 Estado del Proyecto```bash

node lti-server.js

- ✅ Autenticación LTI 1.3 completa```

- ✅ Sistema de entregas funcional

- ✅ Cuestionario metacognitivo**Salida esperada:**

- ✅ Sistema de calificación```

- ✅ Edición de entregas y calificaciones📁 Directorio de backups creado

- ✅ Persistencia con backups📦 Cargadas 0 entregas desde disco

- ✅ Vista de estudiante y profesor📁 Directorio de uploads verificado

- ✅ Responsive design🚀 Servidor LTI escuchando en puerto 3000

- ✅ Documentación completa🔗 Base URL configurada: https://tu-subdominio.ngrok-free.app

```

---

### 6. Exponer Servidor con ngrok (solo desarrollo)

## 🤝 Contribuir

En otra terminal:

Las contribuciones son bienvenidas. Por favor:

```bash

1. Fork el proyectongrok http 3000

2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)```

3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)

4. Push a la rama (`git push origin feature/AmazingFeature`)Copia la URL HTTPS que proporciona ngrok (ej: `https://abc123.ngrok-free.app`) y actualízala en el archivo `.env`

5. Abre un Pull Request

---

---

## 🔧 Configuración Detallada

## 📝 Licencia

### 1. Obtener Token de Moodle

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

#### Paso 1: Habilitar servicios web en Moodle

---

1. Accede como administrador a tu Moodle

## 👥 Autores2. Ve a: **Administración del sitio** → **Funciones avanzadas**

3. Marca la casilla **"Habilitar servicios web"**

- **Álvaro González Lago** - [alvarongzlgo-ule](https://github.com/alvarongzlgo-ule)4. Guarda los cambios



---#### Paso 2: Crear un servicio web personalizado



## 🙏 Agradecimientos1. Ve a: **Administración del sitio** → **Servidor** → **Servicios web** → **Servicios externos**

2. Haz clic en **"Agregar"**

- [IMS Global Learning Consortium](https://www.imsglobal.org/) - Especificación LTI 1.33. Completa:

- [Cvmcosta's ltijs](https://github.com/Cvmcosta/ltijs) - Inspiración para la implementación LTI   - **Nombre**: "Sistema de Entregas API"

- Comunidad de Moodle   - **Nombre corto**: "entregas_api"

   - **Habilitado**: ✅ Sí

---4. Guarda



## 📚 Referencias#### Paso 3: Agregar funciones al servicio



- [LTI 1.3 Specification](https://www.imsglobal.org/spec/lti/v1p3/)1. Haz clic en **"Agregar funciones"** en el servicio que acabas de crear

- [Moodle External Tool Documentation](https://docs.moodle.org/en/External_tool)2. Busca y agrega estas funciones:

- [Node.js Documentation](https://nodejs.org/docs/)   - `core_user_get_users_by_field`

- [Express.js Guide](https://expressjs.com/en/guide/routing.html)   - `mod_assign_get_submissions`

   - `mod_assign_save_submission`

---   - `mod_assign_submit_for_grading`

3. Guarda

**⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub!**

#### Paso 4: Autorizar usuario

1. En el servicio, haz clic en **"Usuarios autorizados"**
2. Agrega tu usuario administrador
3. Guarda

#### Paso 5: Crear token

1. Ve a: **Administración del sitio** → **Servidor** → **Servicios web** → **Gestionar tokens**
2. Haz clic en **"Crear token"**
3. Selecciona:
   - **Usuario**: Tu usuario administrador
   - **Servicio**: "Sistema de Entregas API"
4. Guarda y **copia el token generado**
5. Pégalo en tu archivo `.env` como valor de `MOODLE_TOKEN`

### 2. Configurar Herramienta LTI 1.3 en Moodle

#### Paso A: Configurar la herramienta externa

1. Ve a: **Administración del sitio** → **Plugins** → **Módulos de actividades** → **Herramienta externa**
2. Haz clic en **"Gestionar herramientas"**
3. Haz clic en **"Configurar una herramienta manualmente"**
4. Completa los campos:

| Campo | Valor |
|-------|-------|
| **Nombre de la herramienta** | Sistema de Entregas con Cuestionario |
| **URL de la herramienta** | `https://tu-subdominio.ngrok-free.app` |
| **Versión de LTI** | LTI 1.3 |
| **URL de inicio de sesión (login initiation URL)** | `https://tu-subdominio.ngrok-free.app/login` |
| **URL de redireccionamiento** | `https://tu-subdominio.ngrok-free.app/launch` |

5. En la sección **"Conjunto de claves públicas"**:
   - Selecciona: **"URL del conjunto de claves"**
   - **URL de keyset**: `https://tu-subdominio.ngrok-free.app/jwks.json`

6. En **"Servicios"** marca:
   - ✅ IMS LTI Names and Role Provisioning
   - ✅ IMS LTI Assignment and Grade Services

7. **Configuración de privacidad** - selecciona:
   - ✅ Compartir el nombre del iniciador con la herramienta
   - ✅ Compartir el correo electrónico del iniciador con la herramienta

8. Haz clic en **"Guardar cambios"**

9. **IMPORTANTE**: Anota el **ID de cliente** (Client ID) que aparece en la lista
   - **Ejemplo**: `6RzTL5tcDzzDoxc`
   - **Ubicación**: Aparece en la columna "Client ID" junto al nombre de tu herramienta
   
   **¿Para qué sirve?**
   El Client ID es el identificador único de tu herramienta en Moodle. Aunque **no necesitas configurarlo manualmente en el servidor** (se maneja automáticamente), es útil tenerlo anotado para:
   - Debugging y revisión de logs
   - Documentación de la configuración
   - Identificación en caso de problemas técnicos
   - Configuración avanzada con múltiples instancias Moodle
   
   **Nota**: El Client ID viene en el JWT token que Moodle envía automáticamente durante la autenticación, por lo que el servidor lo recibe y valida sin necesidad de configuración adicional.

#### Paso B: Agregar la herramienta a un curso

1. Entra a tu curso en Moodle
2. Activa el modo de edición (botón "Activar edición")
3. En la sección donde quieres agregar la herramienta, haz clic en **"Añadir una actividad o recurso"**
4. Selecciona **"Herramienta externa"** y haz clic en "Agregar"
5. Configura:
   - **Nombre de la actividad**: "Entrega de Tarea con Cuestionario"
   - **Herramienta preconfigurada**: Selecciona la herramienta que creaste ("Sistema de Entregas con Cuestionario")
   - **Lanzar contenedor**: "Nueva ventana" o "Ventana existente" (a tu elección)
6. En **"Privacidad"** verifica:
   - ✅ Aceptar calificaciones desde la herramienta
   - ✅ Compartir el nombre del iniciador con la herramienta
   - ✅ Compartir el correo electrónico del iniciador con la herramienta
7. Haz clic en **"Guardar cambios y regresar al curso"**

#### Paso C: Probar la integración

1. Como estudiante, haz clic en la actividad que acabas de crear
2. Deberías ver el formulario de entrega
3. Como profesor, deberías ver la lista de entregas

---

## 🎯 Cómo Funciona

### Arquitectura del Sistema

```
┌─────────────┐
│   MOODLE    │
│  (Curso)    │
└──────┬──────┘
       │ 1. Usuario hace clic en herramienta
       ↓
┌─────────────────────────────────────────────┐
│          SERVIDOR LTI 1.3                   │
│  (lti-server.js en localhost:3000)          │
└──────┬──────────────────────────────────────┘
       │ 2. OIDC Login (/login)
       │    - Genera state y nonce
       │    - Redirige a Moodle auth
       ↓
┌─────────────┐
│   MOODLE    │
│  (Auth)     │
└──────┬──────┘
       │ 3. Usuario autoriza
       │    - Genera JWT token
       │    - Redirige a /launch
       ↓
┌─────────────────────────────────────────────┐
│          SERVIDOR LTI 1.3                   │
│                                             │
│  4. Valida JWT:                             │
│     - Verifica firma con JWKS               │
│     - Verifica state/nonce                  │
│     - Extrae roles del usuario              │
│                                             │
│  5. Detecta rol:                            │
│     ┌──────────┬──────────┐                │
│     │ Profesor │ Estudiante│                │
│     └────┬─────┴─────┬────┘                │
│          ↓           ↓                      │
│     Vista Lista  Formulario                │
│     Entregas     de Entrega                │
└─────────────────────────────────────────────┘
```

### Flujo del Estudiante

```
1. Estudiante entra desde Moodle
   ↓
2. Ve formulario de entrega
   ↓
3. Selecciona archivo + comentarios
   ↓
4. Hace clic en "Entregar Tarea"
   ↓
5. POST /upload → Archivo guardado en servidor
   ↓
6. Redirección automática a /cuestionario
   ↓
7. Responde 5 preguntas:
   - ⏱️  Tiempo dedicado
   - 📊 Nivel de dificultad
   - 📚 Recursos externos usados
   - 💭 Principales desafíos
   - 🎓 Aprendizajes obtenidos
   ↓
8. POST /submit-questionnaire → Datos guardados
   ↓
9. ✅ Mensaje de confirmación
```

### Flujo del Profesor

```
1. Profesor entra desde Moodle
   ↓
2. Ve panel con estadísticas:
   ┌────────────────────────────┐
   │ Total: 2 | Completas: 1    │
   │ Pendientes: 1              │
   └────────────────────────────┘
   ↓
3. Ve tabla con lista de entregas:
   ┌─────────────────────────────────────────┐
   │ Estudiante | Archivo | Fecha | Estado  │
   │ Álvaro G.  | doc.pdf | 6/11  | ✅ Completa│
   │ Juan P.    | img.jpg | 6/11  | ⏳ Pendiente│
   └─────────────────────────────────────────┘
   ↓
4. Hace clic en "👁️ Ver detalles"
   ↓
5. Ve página completa con:
   - 👤 Info del estudiante
   - 📎 Detalles del archivo + botón descargar
   - 💬 Comentarios del estudiante
   - 📝 Todas las respuestas del cuestionario
   ↓
6. Puede descargar archivo: GET /download/:submissionId
   ↓
7. Vuelve a la lista: botón "← Volver"
```

---

## 💻 Uso

### Iniciar el servidor

```bash
node lti-server.js
```

Salida esperada:
```
✅ Servidor LTI 1.3 escuchando en http://localhost:3000
🔗 JWKS disponible en http://localhost:3000/jwks.json
🔗 Login URL: http://localhost:3000/login
🔗 Launch URL: http://localhost:3000/launch
```

### Verificar entregas (DEBUG)

```bash
# Usando curl
curl http://localhost:3000/debug/submissions

# Usando el script incluido
node verificar-entregas.js
```

### Detener el servidor

```bash
# Windows
Ctrl + C

# O forzar cierre de todos los procesos node
taskkill /f /im node.exe
```

---

## 📁 Estructura del Proyecto

```
c:\API\
│
├── lti-server.js              # Servidor principal LTI 1.3
├── generate-keys.js           # Generador de claves JWKS
├── verificar-entregas.js      # Script de verificación
├── package.json               # Dependencias npm
├── .env                       # Variables de entorno (NO subir a git)
├── .gitignore                 # Archivos ignorados por git
├── keys.json                  # Claves JWKS (NO subir a git)
├── submissions.json           # Datos de entregas (NO subir a git)
├── README.md                  # Esta documentación
│
├── backups/                   # Backups automáticos (últimos 5)
│   ├── submissions_backup_2025-11-06T10-30-15.json
│   ├── submissions_backup_2025-11-06T11-45-22.json
│   └── ...
│
└── uploads/                   # Archivos subidos por estudiantes
    ├── uploads/file1.pdf
    ├── uploads/file2.docx
    └── ...
```

### Archivos Importantes

#### `lti-server.js` (~1800 líneas)
Servidor principal con:
- **Sistema de persistencia**: `loadSubmissions()`, `saveSubmissions()`, `createBackup()`
- **Endpoints LTI 1.3**: `/login`, `/launch`, `/jwks.json`
- **Endpoint de subida**: `POST /upload` (con soporte para reemplazo de entregas)
- **Endpoint de cuestionario**: `GET /cuestionario`
- **Endpoint de envío de cuestionario**: `POST /submit-questionnaire`
- **Endpoint de detalles**: `GET /ver-entrega/:id`
- **Endpoint de descarga**: `GET /download/:id`
- Funciones de vista para profesores y estudiantes
- Integración con Moodle API

#### `submissions.json`
Archivo JSON que almacena todas las entregas de forma persistente:
```json
{
  "sub_1730890000000_3": {
    "submissionId": "sub_1730890000000_3",
    "userId": "3",
    "userName": "Álvaro González Lago",
    "fileName": "tarea.pdf",
    "filePath": "uploads/abc123.pdf",
    "fileSize": 1234567,
    "comments": "Entrega completada",
    "uploadedAt": "2025-11-06T10:30:00.000Z",
    "questionnaire": {
      "timeSpent": "2 horas",
      "difficulty": "Media",
      "resourcesUsed": "Documentación oficial",
      "challenges": "Configuración inicial",
      "learnings": "LTI 1.3 protocol",
      "completedAt": "2025-11-06T10:35:00.000Z"
    },
    "isReplacement": false
  }
}
```

#### `backups/`
Directorio con backups automáticos:
- Se crea un backup **antes de cada escritura** en `submissions.json`
- Mantiene solo los **últimos 5 backups**
- Formato: `submissions_backup_YYYY-MM-DDTHH-MM-SS.json`
- Recuperación automática si el archivo principal se corrompe

#### `generate-keys.js`
Genera claves RSA-2048 para JWKS:
```javascript
const keystore = jose.JWK.createKeyStore();
await keystore.generate('RSA', 2048, {alg: 'RS256', use: 'sig'});
```

#### `verificar-entregas.js`
Script para ver todas las entregas guardadas en memoria con formato legible.

#### `.env`
Variables de configuración:
- `MOODLE_URL`: URL de tu instancia Moodle
- `MOODLE_TOKEN`: Token de acceso a web services
- `PORT`: Puerto del servidor (default: 3000)
- `BASE_URL`: URL pública con ngrok

---

## 🌐 API Endpoints

### Endpoints LTI 1.3

#### `GET /`
Página de inicio con información de la herramienta.

#### `GET /.well-known/openid-configuration`
Configuración OpenID Connect (opcional).

#### `GET /jwks.json`
Conjunto de claves públicas JWKS para verificación de firmas.

**Respuesta:**
```json
{
  "keys": [
    {
      "kty": "RSA",
      "e": "AQAB",
      "use": "sig",
      "kid": "...",
      "alg": "RS256",
      "n": "..."
    }
  ]
}
```

#### `ALL /login`
Inicia el flujo OIDC de LTI 1.3.

**Parámetros (query):**
- `iss`: Issuer (URL de Moodle)
- `login_hint`: ID del usuario
- `target_link_uri`: URI de destino
- `client_id`: ID del cliente LTI
- `lti_deployment_id`: ID de deployment

**Respuesta:** Redirección a Moodle auth.

#### `POST /launch`
Procesa el token JWT y redirige según el rol.

**Parámetros (form):**
- `id_token`: Token JWT firmado
- `state`: State de CSRF

**Respuesta:** HTML de vista de profesor o estudiante.

### Endpoints de Entregas

#### `POST /upload`
Sube un archivo y guarda la información.

**Content-Type:** `multipart/form-data`

**Parámetros:**
- `file`: Archivo (required)
- `userId`: ID del usuario
- `userName`: Nombre del usuario
- `comments`: Comentarios opcionales

**Respuesta:**
```json
{
  "success": true,
  "submissionId": "sub_1762423100000_3",
  "message": "Archivo subido correctamente"
}
```

#### `GET /cuestionario?submissionId=xxx`
Muestra el formulario de cuestionario.

**Respuesta:** HTML con 5 preguntas.

#### `POST /submit-questionnaire`
Guarda las respuestas del cuestionario.

**Content-Type:** `application/json`

**Body:**
```json
{
  "submissionId": "sub_...",
  "q1": "1-2h",
  "q2": "moderada",
  "q3": ["documentacion", "tutoriales"],
  "q4": "Lo más difícil fue...",
  "q5": "Aprendí que..."
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Cuestionario enviado correctamente",
  "submission": { ... }
}
```

#### `GET /ver-entrega/:submissionId`
Muestra los detalles completos de una entrega (solo profesores).

**Respuesta:** HTML con toda la información de la entrega.

#### `POST /grade-submission`
Asigna o edita la calificación de una entrega (solo profesores).

**Content-Type:** `application/json`

**Body:**
```json
{
  "submissionId": "sub_1762423100000_3",
  "score": 8.5,
  "feedback": "Excelente trabajo. Buen análisis de seguridad.",
  "teacherName": "Dr. Álvaro González"
}
```

**Validaciones:**
- `score`: Número entre 0 y 10 (decimales permitidos)
- `teacherName`: Requerido, no puede estar vacío
- `feedback`: Opcional

**Respuesta:**
```json
{
  "success": true,
  "message": "Calificación guardada correctamente",
  "grade": {
    "aiScore": null,
    "teacherScore": 8.5,
    "feedback": "Excelente trabajo. Buen análisis de seguridad.",
    "gradedAt": "2025-11-10T10:30:00.000Z",
    "gradedBy": "Dr. Álvaro González"
  }
}
```

**Características:**
- Permite editar calificaciones ya asignadas
- Guarda automáticamente el nombre del profesor que califica
- Registra fecha y hora de calificación
- Validación en frontend para evitar campos vacíos
- Uso de localStorage para recordar nombre del profesor

#### `GET /download/:submissionId`
Descarga el archivo de una entrega.

**Respuesta:** Archivo descargable.

#### `GET /debug/submissions`
Lista todas las entregas en formato JSON (desarrollo).

**Respuesta:**
```json
{
  "total": 2,
  "submissions": [
    {
      "submissionId": "sub_1762423100000_3",
      "userId": "3",
      "userName": "Álvaro González Lago",
      "fileName": "MITM_MQTT.pdf",
      "filePath": "uploads/hash...",
      "fileSize": 234567,
      "comments": "Adjunto mi trabajo",
      "uploadedAt": "2025-11-06T10:57:11.000Z",
      "questionnaire": {
        "timeSpent": "1-2h",
        "difficulty": "moderada",
        "resourcesUsed": ["documentacion"],
        "challenges": "...",
        "learnings": "...",
        "completedAt": "2025-11-06T10:58:00.000Z"
      }
    }
  ]
}
```

---

## 💾 Sistema de Persistencia

### Descripción General

El sistema utiliza archivos JSON para almacenar datos de forma persistente, complementado con un sistema robusto de backups automáticos y mecanismos de recuperación ante fallos.

### Arquitectura de Almacenamiento

```
┌──────────────────────────────────────────┐
│   Memoria RAM (Map)                      │
│   submissionsStore                       │
│   - Acceso rápido                        │
│   - Operaciones en memoria               │
└────────────┬─────────────────────────────┘
             │
             │ saveSubmissions()
             ↓
┌──────────────────────────────────────────┐
│   submissions.json                       │
│   - Almacenamiento persistente           │
│   - Sobrevive a reinicios                │
└────────────┬─────────────────────────────┘
             │
             │ createBackup() (antes de cada escritura)
             ↓
┌──────────────────────────────────────────┐
│   backups/                               │
│   - submissions_backup_2025-11-06...json │
│   - submissions_backup_2025-11-06...json │
│   - (últimos 5 backups)                  │
└──────────────────────────────────────────┘
```

### Flujo de Guardado

```javascript
// 1. Usuario sube archivo o completa cuestionario
submissionsStore.set(id, data);

// 2. Se llama a saveSubmissions()
saveSubmissions();
  
  // 3. Crear backup del archivo actual
  createBackup(); // → backups/submissions_backup_*.json
  
  // 4. Escribir a archivo temporal
  fs.writeFileSync('submissions.json.tmp', JSON.stringify(data));
  
  // 5. Validar que el JSON sea correcto
  JSON.parse(fs.readFileSync('submissions.json.tmp'));
  
  // 6. Renombrar (operación atómica)
  fs.renameSync('submissions.json.tmp', 'submissions.json');
  
  // 7. Limpiar backups antiguos (mantener solo 5)
```

### Flujo de Carga

```javascript
// Al iniciar el servidor
loadSubmissions();

  // 1. Verificar si existe submissions.json
  if (fs.existsSync('submissions.json')) {
    
    // 2. Leer y parsear JSON
    try {
      data = JSON.parse(fs.readFileSync('submissions.json'));
      
      // 3. Validar estructura
      if (válido) {
        // Cargar a memoria
        submissionsStore = new Map(data);
      }
    } catch (error) {
      // 4. Si falla, recuperar desde backup
      loadFromBackup();
    }
  }
```

### Características de Seguridad

#### 1. **Escritura Atómica**
- Escribe primero a `.tmp`
- Valida el contenido
- Renombra solo si es válido
- **Resultado:** Nunca queda corrupto a medias

#### 2. **Protección contra Escrituras Simultáneas**
```javascript
if (isWriting) {
  // Espera 100ms y reintenta
  setTimeout(() => saveSubmissions(), 100);
  return;
}
```

#### 3. **Validación de Integridad**
- Verifica JSON válido
- Valida campos requeridos (`submissionId`, `userId`)
- Omite registros corruptos (registra warning)
- Continúa cargando registros válidos

#### 4. **Sistema de Backups**
- Backup automático antes de cada escritura
- Mantiene últimos 5 backups (elimina antiguos)
- Formato con timestamp: `submissions_backup_2025-11-06T10-30-15.json`
- Recuperación automática si el archivo principal falla

### Mensajes de Consola

```bash
# Al iniciar servidor
📁 Directorio de backups creado
📦 Cargadas 3 entregas desde disco

# Al guardar entrega
💾 Backup creado: submissions_backup_2025-11-06T10-30-15.json
💾 Entregas guardadas en disco (3 entregas)

# Si hay backup antiguo
🗑️  Backup antiguo eliminado: submissions_backup_2025-11-05T08-15-30.json

# En caso de error
⚠️  JSON corrupto, intentando recuperar desde backup...
✅ Recuperadas 3 entregas desde backup: submissions_backup_2025-11-06T10-30-15.json
```

### Limitaciones y Recomendaciones

#### **Cuándo usar JSON (actual):**
- ✅ Hasta 50-100 estudiantes
- ✅ Desarrollo y pruebas
- ✅ Cursos pequeños
- ✅ Facilidad de debugging

#### **Cuándo migrar a base de datos:**
- ❌ Más de 100 estudiantes activos
- ❌ Necesidad de búsquedas complejas
- ❌ Múltiples cursos simultáneos
- ❌ Requerimientos de auditoría avanzada

#### **Alternativas recomendadas para producción:**
```javascript
// MongoDB
const mongoose = require('mongoose');
const SubmissionSchema = new mongoose.Schema({...});

// PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({...});

// Redis (para cache + DB para persistencia)
const redis = require('redis');
const client = redis.createClient();
```

---

## 🎨 Interfaz de Usuario

### Vista del Estudiante

**Formulario de Entrega:**
```
┌─────────────────────────────────────┐
│   📤 Entregar Tarea                 │
│                                     │
│   👤 Estudiante: Álvaro González    │
│   📚 Curso: Ciberseguridad IoT-5G   │
│                                     │
│   📎 Archivo a entregar:            │
│   [Seleccionar archivo]             │
│                                     │
│   💬 Comentarios (opcional):        │
│   [________________________]        │
│   [________________________]        │
│                                     │
│   [  Entregar Tarea  ]              │
└─────────────────────────────────────┘
```

**Cuestionario Post-Entrega:**
```
┌─────────────────────────────────────┐
│   📝 Cuestionario Post-Entrega      │
│                                     │
│   👤 Estudiante: Álvaro González    │
│   📎 Archivo: documento.pdf         │
│   ⏰ Entregado: 6/11/2025 10:57     │
│                                     │
│   1. ¿Cuánto tiempo dedicaste?      │
│   ( ) Menos de 1 hora               │
│   (•) Entre 1 y 2 horas             │
│   ( ) Entre 2 y 4 horas             │
│   ( ) Más de 4 horas                │
│                                     │
│   2. ¿Nivel de dificultad?          │
│   ( ) Muy fácil                     │
│   ( ) Fácil                         │
│   (•) Moderada                      │
│   ( ) Difícil                       │
│   ( ) Muy difícil                   │
│                                     │
│   3. ¿Recursos externos?            │
│   [✓] Documentación oficial         │
│   [ ] Tutoriales en línea           │
│   [ ] Foros/Stack Overflow          │
│   [ ] Ayuda de compañeros           │
│   [ ] Consulta con el profesor      │
│                                     │
│   4. ¿Principales desafíos?         │
│   [____________________________]    │
│                                     │
│   5. ¿Qué aprendiste?               │
│   [____________________________]    │
│                                     │
│   [Enviar Cuestionario y Finalizar] │
└─────────────────────────────────────┘
```

### Vista del Profesor

**Lista de Entregas:**
```
┌─────────────────────────────────────────────────────────┐
│   📋 Entregas de Estudiantes                            │
│                                                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│   │    3     │  │    1     │  │    0     │           │
│   │  Total   │  │  Completa│  │ Pendiente│           │
│   └──────────┘  └──────────┘  └──────────┘           │
│                                                         │
│   ┌─────────────────────────────────────────────────┐ │
│   │ Estudiante│Archivo│Fecha│Estado│Acciones       │ │
│   ├─────────────────────────────────────────────────┤ │
│   │ Álvaro G. │doc.pdf│6/11 │✅ Completa│👁️ Ver   │ │
│   │ ID: 3     │234 KB │10:57│          │detalles   │ │
│   └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Vista Detallada:**
```
┌─────────────────────────────────────────────────────────┐
│   ← Volver a la lista                                   │
│                                                         │
│   📋 Detalle de Entrega  [✅ Entrega Completa]         │
│                                                         │
│   👤 Información del Estudiante                         │
│   ┌───────────────────────────────────────────────┐   │
│   │ Nombre: Álvaro González Lago                  │   │
│   │ ID de Usuario: 3                              │   │
│   │ Fecha: 6/11/2025, 10:57:11                   │   │
│   └───────────────────────────────────────────────┘   │
│                                                         │
│   📎 Archivo Entregado                                  │
│   ┌───────────────────────────────────────────────┐   │
│   │ Nombre: MITM_MQTT.pdf                         │   │
│   │ Tamaño: 234.56 KB                            │   │
│   │ [⬇️ Descargar Archivo]                        │   │
│   │                                               │   │
│   │ 💬 Comentarios del estudiante:                │   │
│   │ "Adjunto mi trabajo final sobre MITM"        │   │
│   └───────────────────────────────────────────────┘   │
│                                                         │
│   📝 Cuestionario Post-Entrega                          │
│   ┌───────────────────────────────────────────────┐   │
│   │ ⏱️ 1. Tiempo dedicado                          │   │
│   │ Entre 1 y 2 horas                             │   │
│   │                                               │   │
│   │ 📊 2. Nivel de dificultad                     │   │
│   │ Moderada                                      │   │
│   │                                               │   │
│   │ 📚 3. Recursos externos utilizados            │   │
│   │ • Documentación oficial                       │   │
│   │                                               │   │
│   │ 💭 4. Principales desafíos                    │   │
│   │ Lo más difícil fue entender el protocolo...   │   │
│   │                                               │   │
│   │ 🎓 5. Aprendizajes obtenidos                  │   │
│   │ Aprendí a capturar paquetes MQTT y...        │   │
│   │                                               │   │
│   │ Completado: 6/11/2025, 10:58:29             │   │
│   └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Sistema de Persistencia de Datos

### Cómo Funciona

El sistema utiliza un **archivo JSON** (`submissions.json`) como base de datos local con un robusto sistema de backups y recuperación ante fallos.

#### Componentes Principales

1. **Archivo Principal: `submissions.json`**
   - Almacena todas las entregas en formato JSON
   - Estructura: Map convertido a objeto `{ id: submission, ... }`
   - Se carga automáticamente al iniciar el servidor
   - Se guarda automáticamente después de cada cambio

2. **Directorio de Backups: `backups/`**
   - Mantiene los últimos 5 backups automáticos
   - Se crea un backup antes de cada escritura
   - Formato: `submissions_backup_YYYY-MM-DDTHH-MM-SS.json`
   - Rotación automática de backups antiguos

3. **Directorio de Archivos: `uploads/`**
   - Almacena los archivos subidos por estudiantes
   - Nombres únicos (hash) para evitar colisiones
   - Relación con submissions mediante `filePath`

### Funciones Principales

#### `loadSubmissions()`
Carga las entregas desde el archivo JSON al iniciar el servidor.

```javascript
function loadSubmissions() {
  // 1. Lee submissions.json
  // 2. Valida que sea JSON válido
  // 3. Valida estructura de datos
  // 4. Carga entregas válidas al Map
  // 5. Si hay error, intenta recuperar desde backup
}
```

**Validaciones:**
- ✅ JSON bien formado
- ✅ Estructura de objeto válida
- ✅ Cada entrega tiene campos requeridos (`submissionId`, `userId`)
- ✅ Omite entregas corruptas e informa en consola

#### `saveSubmissions()`
Guarda las entregas del Map al archivo JSON con seguridad.

```javascript
function saveSubmissions() {
  // 1. Evita escrituras simultáneas (flag isWriting)
  // 2. Crea backup del archivo actual
  // 3. Convierte Map a objeto JSON
  // 4. Escribe a archivo temporal (.tmp)
  // 5. Valida que el archivo temporal sea JSON válido
  // 6. Renombra archivo temporal al definitivo (operación atómica)
  // 7. En caso de error, elimina archivo temporal
}
```

**Seguridad:**
- ✅ Escritura atómica (nunca corrompe el archivo principal)
- ✅ Protección contra escrituras concurrentes
- ✅ Validación antes de sobrescribir
- ✅ Backup automático antes de cada cambio

#### `createBackup()`
Crea una copia de seguridad del archivo actual.

```javascript
function createBackup() {
  // 1. Copia submissions.json a backups/
  // 2. Añade timestamp al nombre
  // 3. Mantiene solo últimos 5 backups
  // 4. Elimina backups antiguos automáticamente
}
```

#### `loadFromBackup()`
Recupera datos desde el backup más reciente en caso de corrupción.

```javascript
function loadFromBackup() {
  // 1. Lista todos los backups disponibles
  // 2. Ordena por fecha (más reciente primero)
  // 3. Carga el backup más reciente
  // 4. Valida e importa entregas válidas
  // 5. Registra éxito o fallo en consola
}
```

### Flujo de Persistencia

```
┌─────────────────────────────────────────────────────────────┐
│                   INICIO DEL SERVIDOR                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
           ┌─────────────────────────┐
           │  loadSubmissions()      │
           │  Lee submissions.json   │
           └────────┬────────────────┘
                    │
       ┌────────────┴───────────┐
       │                        │
    ✅ OK                    ❌ ERROR
       │                        │
       ↓                        ↓
   Cargar datos        loadFromBackup()
   al Map              Recuperar backup
       │                        │
       │                        ↓
       │                Cargar datos válidos
       │                        │
       └────────┬───────────────┘
                │
                ↓
    ┌────────────────────────────┐
    │  SERVIDOR LISTO            │
    │  Map: submissionsStore     │
    └────────────────────────────┘
                │
    ┌───────────┴──────────────┐
    │   OPERACIONES             │
    │   - POST /upload          │
    │   - POST /submit-quest... │
    └───────────┬──────────────┘
                │
                ↓
    ┌────────────────────────────┐
    │  saveSubmissions()         │
    └────────┬───────────────────┘
             │
             ↓
    ┌────────────────────────────┐
    │  createBackup()            │
    │  Backup automático         │
    └────────┬───────────────────┘
             │
             ↓
    ┌────────────────────────────┐
    │  Escritura atómica         │
    │  1. Escribir .tmp          │
    │  2. Validar JSON           │
    │  3. Renombrar a definitivo │
    └────────────────────────────┘
```

### Estructura de Datos

#### `submissions.json`

```json
{
  "sub_1730890000000_3": {
    "submissionId": "sub_1730890000000_3",
    "userId": "3",
    "userName": "Álvaro González Lago",
    "fileName": "tarea.pdf",
    "filePath": "uploads/091df4b93b2c05330a7b7409d188477f",
    "fileSize": 1234567,
    "comments": "Adjunto mi trabajo completo",
    "uploadedAt": "2025-11-06T10:30:00.000Z",
    "questionnaire": {
      "timeSpent": "Entre 1 y 2 horas",
      "difficulty": "Moderada",
      "resourcesUsed": ["Documentación oficial", "Tutoriales en línea"],
      "challenges": "Lo más difícil fue entender el protocolo MQTT...",
      "learnings": "Aprendí a capturar y analizar paquetes...",
      "completedAt": "2025-11-06T10:35:00.000Z"
    },
    "isReplacement": false,
    "grade": {
      "aiScore": null,
      "teacherScore": 8.5,
      "feedback": "Excelente trabajo. Buen análisis de seguridad.",
      "gradedAt": "2025-11-10T10:30:00.000Z",
      "gradedBy": "Dr. Álvaro González"
    }
  }
}
```

#### Campos de una Entrega

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `submissionId` | String | ID único: `sub_<timestamp>_<userId>` |
| `userId` | String | ID del usuario en Moodle |
| `userName` | String | Nombre completo del estudiante |
| `fileName` | String | Nombre original del archivo |
| `filePath` | String | Ruta relativa del archivo guardado |
| `fileSize` | Number | Tamaño en bytes |
| `comments` | String | Comentarios opcionales del estudiante |
| `uploadedAt` | String | Timestamp ISO 8601 de la subida |
| `questionnaire` | Object/null | Respuestas del cuestionario (null si pendiente) |
| `isReplacement` | Boolean | Si es reemplazo de entrega anterior |
| `grade` | Object/null | Calificación asignada por el profesor (null si sin calificar) |

#### Campos del Cuestionario

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `timeSpent` | String | Tiempo dedicado seleccionado |
| `difficulty` | String | Nivel de dificultad percibido |
| `resourcesUsed` | Array | Lista de recursos utilizados |
| `challenges` | String | Texto libre sobre desafíos |
| `learnings` | String | Texto libre sobre aprendizajes |
| `completedAt` | String | Timestamp ISO 8601 del cuestionario |

#### Campos de Calificación

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `aiScore` | Number/null | Puntuación automática de IA (reservado para futuro) |
| `teacherScore` | Number/null | Nota del profesor (0-10, con decimales) |
| `feedback` | String | Retroalimentación personalizada del profesor |
| `gradedAt` | String | Timestamp ISO 8601 de cuándo se calificó |
| `gradedBy` | String | Nombre del profesor que asignó la calificación |

### Ventajas del Sistema

✅ **Simplicidad**: No requiere servidor de base de datos  
✅ **Portabilidad**: Fácil de mover entre servidores  
✅ **Backups automáticos**: Protección contra pérdida de datos  
✅ **Recuperación ante fallos**: Restauración automática desde backups  
✅ **Escritura segura**: Operaciones atómicas previenen corrupción  
✅ **Sin dependencias**: Solo usa Node.js y sistema de archivos  

### Limitaciones y Consideraciones

⚠️ **Escalabilidad limitada**: Para >1000 estudiantes considerar base de datos real  
⚠️ **Concurrencia básica**: Flag simple, no apto para alta concurrencia  
⚠️ **Sin transacciones**: No hay rollback automático de operaciones complejas  
⚠️ **Backups locales**: Para producción, considerar backups remotos  

### Migración a Base de Datos (Futuro)

Si necesitas escalar, puedes migrar a:

- **MongoDB**: Ideal para documentos JSON
- **PostgreSQL**: Para consultas complejas y relaciones
- **Redis**: Para cache y acceso ultrarrápido
- **SQLite**: Alternativa simple con SQL

El diseño actual facilita la migración ya que toda la lógica está encapsulada en funciones específicas.

---

## 🛠️ Scripts Utilitarios

### `generate-keys.js`

Genera las claves RSA-2048 necesarias para JWKS.

```bash
node generate-keys.js
```

**¿Cuándo usarlo?**
- Primera instalación del sistema
- Después de eliminar `keys.json`
- Para rotar claves por seguridad (cada 6-12 meses)

**Nota**: Después de regenerar claves, debes actualizar la configuración LTI en Moodle.

### `verificar-entregas.js`

Muestra todas las entregas guardadas en formato legible.

```bash
node verificar-entregas.js
```

**Salida:**

```
🔍 Verificando entregas guardadas...

📊 Total de entregas: 2

📦 Entrega 1:
   ID: sub_1730890000000_3
   👤 Estudiante: Álvaro González Lago (ID: 3)
   📎 Archivo: tarea.pdf (1.18 MB)
   📁 Ruta: uploads/091df4b93b2c05330a7b7409d188477f
   💬 Comentarios: Adjunto mi trabajo
   ⏰ Subido: 6/11/2025, 10:30:00

   📝 Cuestionario completado:
      ⏱️  Tiempo dedicado: Entre 1 y 2 horas
      📊 Dificultad: Moderada
      📚 Recursos: Documentación oficial, Tutoriales
      💭 Desafíos: Lo más difícil fue entender...
      🎓 Aprendizajes: Aprendí a capturar paquetes...
      ✅ Completado: 6/11/2025, 10:35:00
   ────────────────────────────────────────────────

✅ Verificación completada
```

**Funciones útiles incluidas:**
- `formatBytes()`: Convierte bytes a formato legible (KB, MB)
- Muestra solo los primeros 50 caracteres de respuestas largas

### `api.js` (Archivo Separado - Opcional)

API REST independiente para interactuar con Moodle.

```bash
node api.js
```

**Endpoints disponibles:**

- `GET /` - Info de la API
- `GET /cursos` - Lista todos los cursos
- `GET /usuarios` - Lista todos los usuarios
- `GET /curso/:id` - Detalles de un curso específico
- `GET /usuario/:id` - Detalles de un usuario específico

**Uso:**

```bash
# Listar cursos
curl http://localhost:3000/cursos

# Info de usuario
curl http://localhost:3000/usuario/2
```

---

## 🔧 Resolución de Problemas

### Problema 1: "Invalid state - posible ataque CSRF"

**Síntoma**: Error al hacer clic en la herramienta desde Moodle.

**Causas posibles:**
- El state expiró (>10 minutos)
- El servidor se reinició y perdió el state en memoria
- Navegador bloqueó cookies de terceros

**Soluciones:**

```bash
# 1. Verificar logs del servidor
sudo journalctl -u entregas-lti -f

# 2. Verificar que el stateStore funcione
# En lti-server.js, agregar temporalmente:
console.log('States almacenados:', stateStore.size);

# 3. Para producción, migrar stateStore a Redis
# Instalar: npm install redis
# Configurar conexión a Redis
```

**Workaround temporal**: Refrescar la página en Moodle e intentar de nuevo.

### Problema 2: "Token JWT inválido o expirado"

**Síntoma**: Error al verificar la firma del JWT.

**Causas posibles:**
- Claves JWKS no coinciden con las configuradas en Moodle
- URL de JWKS no accesible desde Moodle
- Certificado SSL autofirmado bloquea la verificación

**Soluciones:**

```bash
# 1. Verificar que JWKS sea accesible públicamente
curl https://tu-subdominio.ngrok-free.app/jwks.json

# Debe responder con:
# {"keys":[{"kty":"RSA","e":"AQAB",...}]}

# 2. Regenerar claves si es necesario
node generate-keys.js

# 3. En Moodle, verificar URL de keyset:
# Administración → Herramientas externas → Editar herramienta
# URL de keyset: https://tu-subdominio.ngrok-free.app/jwks.json

# 4. Verificar logs durante el lanzamiento
sudo journalctl -u entregas-lti -f
# Hacer clic en la herramienta desde Moodle y ver error específico
```

### Problema 3: No aparecen entregas en vista profesor

**Síntoma**: Profesor ve lista vacía aunque hay entregas.

**Causas posibles:**
- El archivo `submissions.json` está vacío o no existe
- Rol de profesor no se detecta correctamente
- Entregas no se guardaron por error

**Soluciones:**

```bash
# 1. Verificar que haya entregas guardadas
cat /opt/entregas-lti/submissions.json

# 2. Usar el script de verificación
node verificar-entregas.js

# 3. Probar endpoint de debug
curl http://localhost:3000/debug/submissions

# 4. Verificar detección de rol en logs
sudo journalctl -u entregas-lti -f
# Buscar líneas como: "Rol detectado: Instructor"

# 5. Verificar roles en JWT desde Moodle
# El JWT debe incluir:
# "https://purl.imsglobal.org/spec/lti/claim/roles": [
#   "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"
# ]
```

### Problema 4: Error al subir archivo

**Síntoma**: "Tipo de archivo no permitido" o "Archivo muy grande".

**Causas posibles:**
- Extensión no está en la lista permitida
- Archivo supera 10MB
- Permisos incorrectos en directorio `uploads/`
- Límite de Nginx/proxy más restrictivo

**Soluciones:**

```bash
# 1. Verificar extensión permitida
# Editar lti-server.js línea ~200:
const allowedTypes = /pdf|doc|docx|zip|rar|txt|jpg|jpeg|png/;
# Agregar extensión necesaria

# 2. Cambiar límite de tamaño
# En lti-server.js línea ~195:
limits: { fileSize: 20 * 1024 * 1024 }, // Cambiar a 20MB

# 3. Verificar permisos de uploads/
ls -la /opt/entregas-lti/
sudo chown -R entregas:entregas /opt/entregas-lti/uploads
sudo chmod 755 /opt/entregas-lti/uploads

# 4. Si usas Nginx, verificar client_max_body_size
sudo nano /etc/nginx/sites-available/entregas-lti
# Agregar o aumentar:
client_max_body_size 20M;
sudo nginx -t
sudo systemctl reload nginx

# 5. Ver error específico en logs durante subida
sudo journalctl -u entregas-lti -f
# Intentar subir y ver error exacto
```

### Problema 5: Datos perdidos después de reiniciar

**Síntoma**: Al reiniciar el servidor, las entregas desaparecen.

**Causa**: `submissions.json` no existe o está vacío, y no hay backups.

**Soluciones:**

```bash
# 1. Verificar si existe el archivo
ls -lah /opt/entregas-lti/submissions.json

# 2. Verificar backups disponibles
ls -lah /opt/entregas-lti/backups/

# 3. Si hay backups, restaurar el más reciente
cd /opt/entregas-lti
sudo systemctl stop entregas-lti
cp backups/submissions_backup_YYYY-MM-DDTHH-MM-SS.json submissions.json
sudo systemctl start entregas-lti

# 4. Verificar permisos del archivo
sudo chown entregas:entregas /opt/entregas-lti/submissions.json
sudo chmod 644 /opt/entregas-lti/submissions.json

# 5. Si no hay backups, las entregas se perdieron
# Implementar backups remotos para prevenir:
# - Backup diario a otro servidor
# - Sincronización con servicio cloud
# - Sistema de replicación
```

### Problema 6: Error de conexión con Moodle API

**Síntoma**: No se pueden obtener datos de usuarios desde Moodle.

**Causas posibles:**
- Token inválido o expirado
- Servicios web deshabilitados en Moodle
- Funciones no agregadas al servicio web
- URL de Moodle incorrecta

**Soluciones:**

```bash
# 1. Verificar variables de entorno
cat /opt/entregas-lti/.env
# Verificar MOODLE_URL y MOODLE_TOKEN

# 2. Probar token manualmente
curl "https://moodle.tu-universidad.edu/webservice/rest/server.php?wstoken=TU_TOKEN&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json"

# Debe responder con info del sitio, no con error

# 3. En Moodle, verificar:
# - Servicios web habilitados (Funciones avanzadas)
# - Servicio web creado y habilitado
# - Funciones agregadas al servicio
# - Usuario autorizado en el servicio
# - Token válido y no expirado

# 4. Verificar logs durante llamada a API
sudo journalctl -u entregas-lti -f
# Buscar errores de axios o Moodle API
```

### Problema 7: ngrok "ERR_NGROK_6024"

**Síntoma**: ngrok muestra error de límite de conexiones.

**Causa**: Cuenta gratuita de ngrok tiene límites.

**Soluciones:**

```bash
# 1. Actualizar a plan de pago de ngrok
# O usar alternativa gratuita:

# 2. localtunnel
npm install -g localtunnel
lt --port 3000

# 3. serveo.net
ssh -R 80:localhost:3000 serveo.net

# 4. Para producción, usar dominio propio con SSL
# Ver: GUIA_MIGRACION_PRODUCCION.md
```

### Comandos Útiles de Diagnóstico

```bash
# Ver estado completo del servidor
sudo systemctl status entregas-lti

# Ver últimos 50 logs
sudo journalctl -u entregas-lti -n 50

# Ver logs en tiempo real
sudo journalctl -u entregas-lti -f

# Ver solo errores
sudo journalctl -u entregas-lti -p err

# Verificar puerto 3000 en uso
sudo lsof -i :3000
sudo ss -tulpn | grep 3000

# Probar servidor localmente
curl http://localhost:3000

# Verificar archivos y tamaños
du -sh /opt/entregas-lti/*
ls -lah /opt/entregas-lti/

# Verificar permisos
ls -la /opt/entregas-lti/

# Reiniciar servicio
sudo systemctl restart entregas-lti

# Ver configuración del servicio
cat /etc/systemd/system/entregas-lti.service
```

---

## 🔐 Consideraciones de Seguridad

### En Desarrollo

El sistema actual está configurado para **entorno de desarrollo** con:

- ✅ Certificados SSL autofirmados aceptados (`rejectUnauthorized: false`)
- ✅ Cookies con `secure: false`
- ✅ CORS abierto (`*`)
- ✅ Datos en memoria/archivo local

**⚠️ NO usar estas configuraciones en producción**

### En Producción

Para despliegue en producción, implementar:

#### 1. HTTPS Obligatorio

```javascript
// Forzar HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Cookies seguras
cookie: {
  secure: true,       // Solo HTTPS
  httpOnly: true,     // No accesible desde JavaScript
  sameSite: 'none',   // Permite uso en iframe
  maxAge: 24*60*60*1000 // 24 horas
}
```

#### 2. Validación Estricta de SSL

```javascript
// Eliminar
axios.defaults.httpsAgent = new https.Agent({ 
  rejectUnauthorized: false 
});

// Usar validación real
axios.defaults.httpsAgent = new https.Agent({ 
  rejectUnauthorized: true 
});
```

#### 3. CORS Restrictivo

```javascript
// En lugar de '*', especificar origen
const cors = require('cors');
app.use(cors({
  origin: 'https://moodle.tu-universidad.edu',
  credentials: true
}));
```

#### 4. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// Limitar subidas de archivos
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 subidas máximo
  message: 'Demasiadas subidas, intenta más tarde'
});

app.post('/upload', uploadLimiter, upload.single('file'), ...);
```

#### 5. Validación de Archivos Mejorada

```javascript
// Validar contenido real del archivo, no solo extensión
const FileType = require('file-type');

async function validateFile(filepath) {
  const type = await FileType.fromFile(filepath);
  
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/zip',
    // ...
  ];
  
  if (!type || !allowedMimes.includes(type.mime)) {
    throw new Error('Tipo de archivo no válido');
  }
}
```

#### 6. Escaneo de Virus

```javascript
const NodeClam = require('clamscan');

const clamscan = new NodeClam().init({
  clamdscan: {
    path: '/usr/bin/clamdscan'
  }
});

// Después de subir archivo
const {isInfected} = await clamscan.isInfected(filepath);
if (isInfected) {
  fs.unlinkSync(filepath);
  throw new Error('Archivo contiene malware');
}
```

#### 7. Base de Datos en Producción

```javascript
// Migrar de archivos JSON a base de datos
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  submissionId: String,
  userId: String,
  userName: String,
  fileName: String,
  filePath: String,
  fileSize: Number,
  comments: String,
  uploadedAt: Date,
  questionnaire: {
    timeSpent: String,
    difficulty: String,
    resourcesUsed: [String],
    challenges: String,
    learnings: String,
    completedAt: Date
  }
});

const Submission = mongoose.model('Submission', submissionSchema);
```

#### 8. Logging Profesional

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usar logger en lugar de console.log
logger.info('Usuario subió archivo', { userId, fileName });
logger.error('Error al guardar entrega', { error: err.message });
```

#### 9. Variables de Entorno Seguras

```javascript
// Validar variables requeridas al inicio
const requiredEnvVars = [
  'MOODLE_URL',
  'MOODLE_TOKEN',
  'SESSION_SECRET',
  'BASE_URL'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Error: Falta variable de entorno ${varName}`);
    process.exit(1);
  }
});

// Usar secretos aleatorios y largos
// SESSION_SECRET debe tener al menos 32 caracteres
if (process.env.SESSION_SECRET.length < 32) {
  console.error('SESSION_SECRET debe tener al menos 32 caracteres');
  process.exit(1);
}
```

#### 10. Headers de Seguridad

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  frameguard: { action: 'deny' } // Prevenir clickjacking
}));
```

### Checklist de Seguridad para Producción

- [ ] HTTPS con certificado válido (Let's Encrypt/comercial)
- [ ] SSL/TLS con validación completa activada
- [ ] Cookies con flags `secure`, `httpOnly`, `sameSite`
- [ ] CORS restringido a dominio de Moodle
- [ ] Rate limiting en endpoints críticos
- [ ] Validación de tipo de archivo por contenido (magic bytes)
- [ ] Escaneo antivirus de archivos subidos
- [ ] Base de datos persistente (MongoDB/PostgreSQL)
- [ ] Sistema de backups automáticos remotos
- [ ] Logging profesional (Winston/Bunyan)
- [ ] Monitoreo y alertas (PM2/Datadog/New Relic)
- [ ] Variables de entorno con secretos fuertes
- [ ] Headers de seguridad (Helmet.js)
- [ ] Auditoría de dependencias (`npm audit`)
- [ ] Firewall configurado (UFW/iptables)
- [ ] Usuario sin privilegios para ejecutar Node.js
- [ ] SELinux/AppArmor configurado
- [ ] Límites de recursos del sistema (systemd)

---

## 📈 Mejoras Futuras

### Funcionalidades Planeadas

1. **Calificaciones Automáticas**
   - Enviar calificación de vuelta a Moodle
   - Calificación basada en completitud del cuestionario
   - Integración con LTI Assignment and Grade Services

2. **Rúbricas Personalizadas**
   - Definir criterios de evaluación
   - Calificación detallada por apartados
   - Comentarios específicos por criterio

3. **Múltiples Archivos**
   - Permitir subir varios archivos en una entrega
   - Límite configurable de archivos
   - Visualización en galería

4. **Preview de Archivos**
   - Vista previa de PDFs en el navegador
   - Visualización de imágenes
   - Viewer de documentos office

5. **Notificaciones**
   - Email al estudiante cuando profesor califica
   - Email al profesor cuando hay nueva entrega
   - Recordatorios de entregas pendientes

6. **Estadísticas Avanzadas**
   - Dashboard con gráficos
   - Análisis de respuestas del cuestionario
   - Exportación a CSV/Excel

7. **Comentarios del Profesor**
   - Permitir al profesor dejar comentarios en cada entrega
   - Sistema de chat bidireccional
   - Historial de conversaciones

8. **Entregas en Grupo**
   - Permitir entregas colaborativas
   - Gestión de equipos
   - Un archivo por grupo

9. **Versionado de Entregas**
   - Historial completo de versiones
   - Comparación entre versiones
   - Restaurar versión anterior

10. **Plagiarism Detection**
    - Integración con Turnitin/Unicheck
    - Análisis de similitud
    - Reporte de originalidad

### Optimizaciones Técnicas

1. **Cache con Redis**
   ```javascript
   const redis = require('redis');
   const client = redis.createClient();
   
   // Cache de entregas para consultas rápidas
   app.get('/ver-entrega/:id', async (req, res) => {
     const cached = await client.get(`submission:${id}`);
     if (cached) return res.json(JSON.parse(cached));
     // ... obtener de BD y guardar en cache
   });
   ```

2. **Compresión de Respuestas**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

3. **CDN para Assets**
   - Servir archivos estáticos desde CDN
   - Reducir carga del servidor
   - Mejorar tiempos de carga

4. **Lazy Loading**
   - Cargar entregas paginadas
   - Scroll infinito en lista de entregas
   - Mejora de rendimiento

5. **WebSockets para Actualizaciones en Tiempo Real**
   ```javascript
   const io = require('socket.io')(server);
   
   io.on('connection', (socket) => {
     socket.on('new-submission', (data) => {
       io.emit('submission-update', data);
     });
   });
   ```

---

## 📚 Referencias y Recursos

### Documentación Oficial

- **LTI 1.3**: [https://www.imsglobal.org/spec/lti/v1p3/](https://www.imsglobal.org/spec/lti/v1p3/)
- **LTI Security**: [https://www.imsglobal.org/spec/security/v1p0/](https://www.imsglobal.org/spec/security/v1p0/)
- **Moodle LTI**: [https://docs.moodle.org/en/LTI_and_Moodle](https://docs.moodle.org/en/LTI_and_Moodle)
- **Moodle Web Services**: [https://docs.moodle.org/dev/Web_services](https://docs.moodle.org/dev/Web_services)
- **Express.js**: [https://expressjs.com/](https://expressjs.com/)
- **Multer**: [https://github.com/expressjs/multer](https://github.com/expressjs/multer)
- **node-jose**: [https://github.com/cisco/node-jose](https://github.com/cisco/node-jose)
- **jsonwebtoken**: [https://github.com/auth0/node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

### Herramientas Útiles

- **ngrok**: [https://ngrok.com/](https://ngrok.com/) - Túneles HTTPS para desarrollo
- **Postman**: [https://www.postman.com/](https://www.postman.com/) - Testing de APIs
- **JWT.io**: [https://jwt.io/](https://jwt.io/) - Decodificador y debugger de JWT
- **JSON Formatter**: [https://jsonformatter.org/](https://jsonformatter.org/) - Validar y formatear JSON
- **Certbot**: [https://certbot.eff.org/](https://certbot.eff.org/) - Certificados SSL gratuitos

### Tutoriales y Guías

- [LTI 1.3 Advantage Complete Guide](https://www.imsglobal.org/lti-advantage-overview)
- [Building LTI Tools with Node.js](https://github.com/topics/lti)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Production Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Comunidad y Soporte

- **IMS Global Learning Consortium**: [https://www.imsglobal.org/](https://www.imsglobal.org/)
- **Moodle Community**: [https://moodle.org/community/](https://moodle.org/community/)
- **Stack Overflow**: Tag `lti` y `moodle`
- **GitHub**: Buscar proyectos `lti-nodejs`

---

## 🎯 Guía de Inicio Rápido

### Para Desarrollo Local (5 minutos)

```bash
# 1. Clonar o descargar proyecto
cd c:\API

# 2. Instalar dependencias
npm install

# 3. Generar claves JWKS
node generate-keys.js

# 4. Crear archivo .env
# Copiar y editar con tus valores
cp .env.example .env

# 5. Iniciar ngrok (nueva terminal)
ngrok http 3000

# 6. Actualizar BASE_URL en .env con URL de ngrok

# 7. Iniciar servidor
node lti-server.js

# 8. Configurar en Moodle (ver sección "Configuración Detallada")

# 9. Probar desde Moodle
```

### Para Producción

Ver guía completa: **[GUIA_MIGRACION_PRODUCCION.md](./GUIA_MIGRACION_PRODUCCION.md)**

Incluye:
- ✅ Configuración de servidor Linux
- ✅ Instalación de Node.js
- ✅ Configuración de Nginx como proxy
- ✅ Certificado SSL con Let's Encrypt
- ✅ Servicio systemd para auto-inicio
- ✅ Configuración detallada de Moodle
- ✅ Scripts de monitoreo y backups
- ✅ Troubleshooting avanzado

---

## 📞 Soporte y Contacto

### Reportar Problemas

Si encuentras un bug o tienes una sugerencia:

1. Revisa la sección **[Resolución de Problemas](#-resolución-de-problemas)**
2. Busca en issues existentes del repositorio
3. Crea un nuevo issue con:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Logs relevantes
   - Versión de Node.js y dependencias
   - Sistema operativo

### Contribuir

Las contribuciones son bienvenidas:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Licencia

Este proyecto está bajo licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

- **IMS Global Learning Consortium** por el estándar LTI 1.3
- **Moodle Community** por la documentación y soporte
- **Node.js Community** por las excelentes librerías
- Todos los contribuidores y usuarios del proyecto

---

**Última actualización**: 7 de noviembre de 2025  
**Versión del sistema**: 1.0.0  
**Autor**: [Tu nombre/organización]

---

¿Necesitas ayuda? Consulta:
- 📖 Esta documentación
- 🚀 [GUIA_MIGRACION_PRODUCCION.md](./GUIA_MIGRACION_PRODUCCION.md)
- 🐛 [Issues en GitHub](https://github.com/tu-repo/issues)
- 💬 [Moodle Community Forums](https://moodle.org/community/)

**¡Feliz enseñanza! 🎓**

### Características principales del sistema:

✅ **LTI 1.3** - Autenticación segura con Moodle  
✅ **Subida de archivos** - Hasta 10MB, múltiples formatos  
✅ **Cuestionario post-entrega** - 5 preguntas sobre el proceso  
✅ **Panel de profesores** - Lista y detalles de entregas  
✅ **Edición de entregas** - Estudiantes pueden reemplazar archivos  
✅ **Persistencia de datos** - Archivo JSON con backups automáticos  
✅ **Sistema de backups** - Últimos 5 guardados automáticamente  
✅ **Recuperación ante fallos** - Validación y recuperación automática  
✅ **Protección de escrituras** - Evita conflictos con múltiples usuarios  

---

## 📝 Notas Finales

### Limitaciones actuales
- Almacenamiento en JSON (adecuado para <100 estudiantes)
- Sin calificaciones automáticas
- Sin integración directa con libro de calificaciones de Moodle

### Futuras mejoras planificadas
- Migración a base de datos (MongoDB/PostgreSQL)
- Sistema de calificaciones integrado con Moodle
- Compresión de backups antiguos
- Panel de estadísticas avanzadas para profesores
- Notificaciones por email

### Soporte
Para reportar problemas o sugerencias, revisa:
- Los logs de la consola del servidor
- El archivo `submissions.json` para verificar datos
- Los backups en `backups/` si hay problemas de corrupción

---

## 📜 Licencia

Este proyecto es de código abierto y puede ser modificado según necesidades específicas.

---

**Última actualización:** 6 de noviembre de 2025  
**Versión del sistema:** 2.0 (con persistencia y backups)
ngrok http 3000

# 5. Iniciar servidor
node lti-server.js
```

### Configurar en Moodle:
1. Crear herramienta LTI 1.3 con las URLs de ngrok
2. Copiar Client ID
3. Agregar herramienta a un curso
4. ¡Listo! Prueba con usuario estudiante y profesor

### Verificar funcionamiento:
```bash
# Ver entregas guardadas
node verificar-entregas.js

# O con curl
curl http://localhost:3000/debug/submissions
```

---

## 📝 Licencia

Este proyecto es de código abierto. Puedes modificarlo y usarlo libremente.

---

## 🤝 Contribuir

Mejoras sugeridas:
- [ ] Implementar persistencia en base de datos
- [x] **Agregar sistema de calificación** ✅ (Implementado)
- [ ] Exportar cuestionarios a Excel/PDF
- [ ] Enviar entregas a Moodle API
- [ ] Notificaciones por email
- [ ] Filtros y búsqueda en lista de entregas
- [ ] Soporte para múltiples tareas
- [ ] Dashboard con gráficos estadísticos

---

**Creado con ❤️ para facilitar las entregas de tareas en Moodle**

