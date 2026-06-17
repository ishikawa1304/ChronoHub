Plan de Pruebas
1. Objetivo
El objetivo de este plan es establecer un marco estructurado para verificar y validar que ChronoHub cumple con los requisitos funcionales y técnicos. Buscamos detectar fallos de lógica en la gestión de horarios, asegurar la integridad de los datos del usuario y garantizar una experiencia de usuario fluida en múltiples dispositivos antes de cualquier despliegue a producción.

2. Tipos de Prueba

## 2. Tipos de Prueba

| Tipo de Prueba | Enfoque |
|---|---|
| **Unitarias** | Validación de lógica aislada en el backend (ej: funciones de creación de tokens JWT, hashing de contraseñas) utilizando PyTest. |
| **Integración** | Verificación de la comunicación entre API, ORM (SQLAlchemy) y Base de Datos (Neon DB). Pruebas de integración de endpoints usando FastAPI `TestClient`. |
| **Funcionales** | Pruebas de "caja negra" de flujos de negocio (ej: registro de cuenta, verificación de código por correo, inicio de sesión, creación y marcado de tareas). |
| **Usabilidad** | Evaluación de la interfaz responsiva y navegación de la barra de calendario semanal, carrusel de reuniones y usabilidad del temporizador Pomodoro. |
| **Manuales** | Pruebas exploratorias de registro, flujos de creación en modales y subida de imágenes de avatar en local y mediante URL. |


3. Caso de Prueba Sugerido
### CP-001 — Programación y Flexibilidad de Reuniones
- **Objetivo:** Validar que el usuario pueda programar una reunión ingresando título, participantes, enlace virtual/lugar y fecha.
- **Precondición:** El usuario tiene sesión activa.
- **Pasos:**
  1. Iniciar sesión en ChronoHub.
  2. Ir a "Reuniones" o usar el botón "Crear..." del dashboard y seleccionar "Nueva Reunión".
  3. Rellenar los campos: Título, Lugar/Enlace, Notas, e ingresar correos en el listado de participantes.
  4. Seleccionar las fechas/horas de inicio y fin.
  5. Hacer clic en "Agendar Reunión".
- **Resultado esperado:** La reunión se guarda exitosamente en la base de datos, los participantes quedan asociados, se muestra un toast de éxito y se visualiza en la sección de Reuniones y el carrusel del Dashboard.
- **Estado:** Aprobado.

### CP-002 — Manejo de Pérdida de Conexión en la Creación de Tareas
- **Objetivo:** Verificar que el sistema maneje los errores de red con gracia sin perder los datos ingresados en el formulario.
- **Precondición:** El usuario está autenticado y en la pantalla de creación de tareas.
- **Pasos:**
  1. Llenar los campos de la tarea (título, descripción, prioridad, fecha límite).
  2. Desconectar la conexión de red (o apagar el servidor del backend local).
  3. Hacer clic en "Guardar Tarea".
- **Resultado esperado:** El sistema muestra una alerta de error (toast) informando que la conexión con el servidor falló y mantiene el modal abierto con todos los datos para evitar que el usuario deba reescribirlos.
- **Estado:** Aprobado.

