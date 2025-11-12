# ✅ Checklist Completo de Configuración

## 📋 Uso de este Checklist

Marca cada casilla ✅ a medida que completes los pasos. Esto asegura que no olvides ninguna configuración importante.

---

## 🔧 FASE 1: Instalación Inicial

### 1.1 Preparación del Entorno

- [ ] Node.js 14+ instalado
  ```bash
  node --version  # Debe mostrar v14.0.0 o superior
  ```

- [ ] npm instalado
  ```bash
  npm --version  # Debe mostrar v6.0.0 o superior
  ```

- [ ] Git instalado (opcional pero recomendado)
  ```bash
  git --version
  ```

- [ ] Editor de código instalado (VS Code, Sublime, etc.)

### 1.2 Descarga del Proyecto

- [ ] Proyecto descargado o clonado en `c:\API`
- [ ] Navegado al directorio del proyecto
  ```bash
  cd c:\API
  ```

### 1.3 Instalación de Dependencias

- [ ] Dependencias instaladas correctamente
  ```bash
  npm install
  ```

- [ ] Verificar instalación exitosa (sin errores)
- [ ] Directorio `node_modules` creado

---

## 🔑 FASE 2: Configuración de Seguridad

### 2.1 Generación de Claves JWKS

- [ ] Claves JWKS generadas
  ```bash
  node generate-keys.js
  ```

- [ ] Archivo `keys.json` creado
- [ ] Verificar contenido del archivo (debe tener formato JSON válido)

### 2.2 Configuración de Variables de Entorno

- [ ] Archivo `.env.example` copiado a `.env`
  ```bash
  cp .env.example .env
  ```

- [ ] Variable `MOODLE_URL` configurada
  - Ejemplo: `https://localhost:8443`
  - Sin barra al final

- [ ] Variable `MOODLE_TOKEN` configurada
  - Token válido de servicios web de Moodle
  - Mínimo 32 caracteres

- [ ] Variable `PORT` configurada
  - Desarrollo: `3000`
  - Producción: `3000` (con proxy)

- [ ] Variable `BASE_URL` configurada
  - Desarrollo: URL de ngrok
  - Producción: Tu dominio

- [ ] Variable `SESSION_SECRET` generada y configurada
  - Mínimo 32 caracteres
  - Aleatorio y único

- [ ] Variable `NODE_ENV` configurada
  - `development` para desarrollo
  - `production` para producción

---

## 🌐 FASE 3: Configuración de Moodle

### 3.1 Habilitar Servicios Web

- [ ] Accedido a Moodle como administrador

- [ ] Servicios web habilitados
  - **Administración del sitio** → **Funciones avanzadas**
  - ✅ Habilitar servicios web

- [ ] Protocolo REST habilitado
  - **Servidor** → **Servicios web** → **Gestionar protocolos**
  - ✅ REST protocol

### 3.2 Crear Servicio Web Personalizado

- [ ] Servicio web creado
  - **Servidor** → **Servicios web** → **Servicios externos** → **Agregar**
  - Nombre: "Sistema de Entregas LTI"
  - Nombre corto: "entregas_lti_api"
  - ✅ Habilitado

- [ ] Funciones agregadas al servicio:
  - [ ] `core_user_get_users_by_field`
  - [ ] `mod_assign_get_submissions`
  - [ ] `mod_assign_save_submission`
  - [ ] `mod_assign_submit_for_grading`

- [ ] Usuario autorizado en el servicio
  - Agregar tu usuario administrador

### 3.3 Generar Token de Acceso

- [ ] Token generado
  - **Servidor** → **Servicios web** → **Gestionar tokens** → **Crear token**
  - Usuario: Tu usuario admin
  - Servicio: "Sistema de Entregas LTI"

- [ ] Token copiado al archivo `.env`
  - Verificar que esté completo (sin espacios)

- [ ] Token probado manualmente (opcional)
  ```bash
  curl "https://tu-moodle/webservice/rest/server.php?wstoken=TU_TOKEN&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json"
  ```

### 3.4 Configurar Herramienta Externa LTI 1.3

- [ ] Herramienta externa agregada
  - **Plugins** → **Módulos de actividades** → **Herramienta externa** → **Gestionar herramientas**
  - **Configurar una herramienta manualmente**

- [ ] Campos básicos completados:
  - [ ] Nombre: "Sistema de Entregas con Cuestionario"
  - [ ] URL de la herramienta: Tu `BASE_URL`
  - [ ] Versión de LTI: `LTI 1.3`
  - [ ] URL de inicio de sesión: `{BASE_URL}/login`
  - [ ] URL de redireccionamiento: `{BASE_URL}/launch`

- [ ] Conjunto de claves configurado:
  - [ ] Método: "URL del conjunto de claves"
  - [ ] URL de keyset: `{BASE_URL}/jwks.json`

- [ ] Configuración de privacidad marcada:
  - [ ] ✅ Compartir nombre del iniciador
  - [ ] ✅ Compartir correo del iniciador
  - [ ] ✅ Aceptar calificaciones (opcional)

- [ ] Servicios LTI habilitados:
  - [ ] ✅ IMS LTI Names and Role Provisioning
  - [ ] ✅ IMS LTI Assignment and Grade Services

- [ ] Herramienta guardada

- [ ] **Client ID anotado** en tu documentación
  - **Ejemplo**: `6RzTL5tcDzzDoxc`
  - **Dónde encontrarlo**: Columna "Client ID" en la lista de herramientas
  - **Para qué sirve**: 
    - Identificación única de tu herramienta
    - Debugging y revisión de logs
    - Documentación de configuración
    - **Nota**: Se envía automáticamente en el JWT, no necesitas configurarlo manualmente

---

## 🚀 FASE 4: Iniciar Servidor

### 4.1 Para Desarrollo Local

- [ ] ngrok instalado
  ```bash
  ngrok version
  ```

- [ ] ngrok iniciado en nueva terminal
  ```bash
  ngrok http 3000
  ```

- [ ] URL de ngrok copiada (HTTPS)
  - Ejemplo: `https://abc123.ngrok-free.app`

- [ ] Variable `BASE_URL` actualizada en `.env` con URL de ngrok

- [ ] Archivo `.env` guardado

### 4.2 Iniciar Servidor Node.js

- [ ] Servidor iniciado
  ```bash
  node lti-server.js
  ```

- [ ] Mensajes de éxito visibles:
  - [ ] "📁 Directorio de backups creado" (o verificado)
  - [ ] "📦 Cargadas X entregas desde disco"
  - [ ] "🚀 Servidor LTI escuchando en puerto 3000"
  - [ ] "🔗 Base URL configurada: ..."

- [ ] Sin errores en la consola

### 4.3 Verificar Endpoints

- [ ] Página principal accesible
  ```bash
  curl http://localhost:3000
  ```

- [ ] JWKS accesible públicamente
  ```bash
  curl https://tu-ngrok.ngrok-free.app/jwks.json
  ```
  - Debe responder con JSON de claves

---

## 🎓 FASE 5: Configuración en Curso

### 5.1 Agregar Actividad al Curso

- [ ] Curso seleccionado en Moodle

- [ ] Modo de edición activado

- [ ] Actividad agregada
  - **Añadir actividad o recurso** → **Herramienta externa**

- [ ] Actividad configurada:
  - [ ] Nombre: "Entrega de Tarea con Cuestionario"
  - [ ] Descripción agregada (instrucciones para estudiantes)
  - [ ] Herramienta preconfigurada seleccionada
  - [ ] Lanzar contenedor: "Nueva ventana" o "Ventana existente"

- [ ] Configuración de privacidad verificada:
  - [ ] ✅ Aceptar calificaciones
  - [ ] ✅ Compartir nombre
  - [ ] ✅ Compartir correo

- [ ] Calificación configurada (si aplica):
  - [ ] Tipo de calificación
  - [ ] Calificación máxima
  - [ ] Categoría

- [ ] Disponibilidad configurada:
  - [ ] Fecha de inicio
  - [ ] Fecha de entrega
  - [ ] Fecha límite

- [ ] Actividad guardada

- [ ] Actividad visible en el curso

---

## ✅ FASE 6: Pruebas

### 6.1 Prueba como Estudiante

- [ ] Usuario estudiante creado/disponible

- [ ] Accedido al curso como estudiante

- [ ] Clic en la actividad realizado

- [ ] Redirección LTI exitosa (sin errores)

- [ ] Formulario de entrega visible con:
  - [ ] Campo de selección de archivo
  - [ ] Campo de comentarios
  - [ ] Botón "Entregar Tarea"

- [ ] Archivo de prueba preparado (< 10MB, formato válido)

- [ ] Archivo subido exitosamente

- [ ] Redirección a cuestionario exitosa

- [ ] Cuestionario con 5 preguntas visible:
  - [ ] Pregunta 1: Tiempo dedicado
  - [ ] Pregunta 2: Nivel de dificultad
  - [ ] Pregunta 3: Recursos utilizados
  - [ ] Pregunta 4: Principales desafíos
  - [ ] Pregunta 5: Aprendizajes obtenidos

- [ ] Cuestionario completado y enviado

- [ ] Mensaje de confirmación visible
  - "✅ Cuestionario enviado correctamente"

### 6.2 Prueba como Profesor

- [ ] Usuario profesor/admin disponible

- [ ] Accedido al curso como profesor

- [ ] Clic en la actividad realizado

- [ ] Redirección LTI exitosa

- [ ] Vista de profesor visible con:
  - [ ] Panel de estadísticas (Total, Completas, Pendientes)
  - [ ] Tabla de entregas

- [ ] Entrega del estudiante visible en la tabla

- [ ] Clic en "👁️ Ver detalles" realizado

- [ ] Vista detallada mostrada con:
  - [ ] Información del estudiante
  - [ ] Detalles del archivo
  - [ ] Botón de descarga
  - [ ] Comentarios (si los hay)
  - [ ] Respuestas del cuestionario completas

- [ ] Archivo descargado exitosamente

- [ ] Botón "← Volver" funciona correctamente

### 6.3 Verificación de Persistencia

- [ ] Servidor detenido (Ctrl+C)

- [ ] Archivo `submissions.json` existe

- [ ] Contenido de `submissions.json` válido (JSON bien formado)

- [ ] Directorio `backups/` contiene backups

- [ ] Directorio `uploads/` contiene archivo subido

- [ ] Servidor reiniciado

- [ ] Entregas se cargaron automáticamente desde disco

- [ ] Script de verificación ejecutado
  ```bash
  node verificar-entregas.js
  ```

- [ ] Datos mostrados correctamente

### 6.4 Verificación de Logs

- [ ] Logs del servidor revisados

- [ ] Sin errores críticos visibles

- [ ] Eventos importantes registrados:
  - [ ] Login OIDC
  - [ ] Lanzamiento LTI
  - [ ] Subida de archivo
  - [ ] Guardado de cuestionario
  - [ ] Guardado de datos persistentes

---

## 📊 FASE 7: Monitoreo Inicial

### 7.1 Verificaciones Básicas

- [ ] Endpoint de debug funciona
  ```bash
  curl http://localhost:3000/debug/submissions
  ```

- [ ] Respuesta JSON correcta con entregas

- [ ] Tamaño de archivos en directorio verificado
  ```bash
  du -sh c:\API\uploads
  du -sh c:\API\backups
  ```

- [ ] Espacio en disco suficiente

### 7.2 Documentación

- [ ] README.md revisado y entendido

- [ ] GUIA_MIGRACION_PRODUCCION.md leída (si vas a producción)

- [ ] RESUMEN_EJECUTIVO.md revisado

- [ ] Variables de entorno documentadas

---

## 🔐 FASE 8: Seguridad

### 8.1 Archivos Sensibles

- [ ] Archivo `.gitignore` verificado

- [ ] `.env` NO está en Git

- [ ] `keys.json` NO está en Git

- [ ] `submissions.json` NO está en Git

- [ ] `backups/` NO está en Git

- [ ] `uploads/` NO está en Git

### 8.2 Permisos (Linux/Producción)

- [ ] Permisos de archivos correctos
  ```bash
  chmod 600 .env keys.json
  chmod 644 submissions.json
  chmod 755 uploads backups
  ```

- [ ] Usuario sin privilegios creado (producción)

- [ ] Servicio systemd configurado (producción)

---

## 🚀 FASE 9: Migración a Producción (Opcional)

Ver **GUIA_MIGRACION_PRODUCCION.md** para lista completa.

### Resumen de Verificación

- [ ] Servidor Linux preparado

- [ ] Node.js 18+ instalado en servidor

- [ ] Archivos subidos al servidor

- [ ] Nginx instalado y configurado

- [ ] Dominio apuntando al servidor

- [ ] Certificado SSL instalado (Let's Encrypt)

- [ ] Servicio systemd creado y habilitado

- [ ] Variables de entorno de producción configuradas

- [ ] HTTPS funcionando correctamente

- [ ] Moodle reconfigurado con URL de producción

- [ ] Herramienta LTI actualizada en Moodle

- [ ] Pruebas completas realizadas

- [ ] Backups automáticos configurados

- [ ] Monitoreo implementado

---

## ✅ CHECKLIST FINAL

### Desarrollo

- [ ] ✅ Todas las fases 1-8 completadas
- [ ] ✅ Pruebas como estudiante exitosas
- [ ] ✅ Pruebas como profesor exitosas
- [ ] ✅ Persistencia de datos verificada
- [ ] ✅ Sin errores en logs
- [ ] ✅ Documentación leída y entendida

### Producción

- [ ] ✅ Todas las fases 1-9 completadas
- [ ] ✅ HTTPS con certificado válido
- [ ] ✅ Servicio systemd funcionando
- [ ] ✅ Nginx como proxy configurado
- [ ] ✅ Backups automáticos activos
- [ ] ✅ Monitoreo implementado
- [ ] ✅ Pruebas en producción exitosas
- [ ] ✅ Plan de mantenimiento definido

---

## 📝 Notas Importantes

### Comandos Rápidos de Verificación

```bash
# Ver si el servidor está corriendo
curl http://localhost:3000

# Ver JWKS público
curl https://tu-url/jwks.json

# Ver entregas guardadas
node verificar-entregas.js

# Ver logs (producción)
sudo journalctl -u entregas-lti -f

# Estado del servicio (producción)
sudo systemctl status entregas-lti
```

### Solución de Problemas Rápida

**Si algo no funciona:**

1. ✅ Verificar que el servidor esté corriendo
2. ✅ Revisar logs por errores
3. ✅ Verificar archivo `.env` correctamente configurado
4. ✅ Verificar JWKS accesible públicamente
5. ✅ Verificar configuración en Moodle
6. ✅ Consultar sección Troubleshooting en README.md

---

## 🎉 ¡Felicidades!

Si completaste todos los checkboxes, tu sistema está:

✅ **Instalado correctamente**  
✅ **Configurado completamente**  
✅ **Funcionando correctamente**  
✅ **Listo para usar**

### Próximos Pasos

1. 📚 Familiarizar a profesores con la interfaz
2. 📝 Crear documentación para estudiantes
3. 📊 Configurar analíticas (opcional)
4. 🔄 Planificar backups regulares
5. 🚀 Considerar migración a producción si aplica

---

**Fecha de completación**: _______________  
**Completado por**: _______________  
**Notas adicionales**: 

_______________________________________________
_______________________________________________
_______________________________________________

---

**¿Necesitas ayuda?**
- 📖 README.md - Documentación completa
- 🚀 GUIA_MIGRACION_PRODUCCION.md - Despliegue a producción
- 📋 RESUMEN_EJECUTIVO.md - Vista rápida del sistema
