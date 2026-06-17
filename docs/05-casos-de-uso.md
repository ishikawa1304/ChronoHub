# Casos de Uso - ChronoHub

Este documento describe las interacciones detalladas entre los usuarios y el sistema ChronoHub para completar tareas críticas de negocio.

---

### CU-001 — Crear Tarea con Prioridad
- **Objetivo:** Permitir al usuario registrar una nueva actividad pendiente con un nivel de importancia definido.
- **Actor principal:** Usuario autenticado.
- **Precondiciones:** El usuario debe haber iniciado sesión y estar en la vista de "Tareas".
- **Flujo principal:**
  1. El usuario hace clic en el botón "Nueva Tarea".
  2. El sistema despliega un formulario de creación.
  3. El usuario ingresa el título, selecciona la prioridad (Alta, Media, Baja) y define una fecha límite.
  4. El usuario hace clic en "Guardar".
  5. El sistema valida los datos y persiste la información.
  6. El sistema muestra la nueva tarea en la lista principal.
- **Flujos alternos:** - 3a. El usuario no selecciona prioridad: El sistema asigna "Media" por defecto.
- **Excepciones:** - 5a. Título vacío: El sistema muestra un mensaje de error y resalta el campo obligatorio.
- **Postcondiciones:** La tarea queda registrada y es visible para el usuario.
- **Requerimientos asociados:** RF-003, RF-004.

---

### CU-002 — Reprogramar / Editar Evento
- **Objetivo:** Cambiar los detalles (título, fecha, hora, color) de un evento o tarea a través de un formulario interactivo.
- **Actor principal:** Usuario autenticado.
- **Precondiciones:** El usuario debe tener al menos un evento o tarea registrado y visible en la lista de la agenda.
- **Flujo principal:**
  1. El usuario navega a la sección de "Horario".
  2. El usuario identifica el evento en la lista de la fecha correspondiente y hace clic en el botón "Editar".
  3. El sistema despliega un formulario modal con los datos actuales del evento.
  4. El usuario edita los campos deseados (ej. cambia la hora de inicio y fin) y hace clic en "Guardar Cambios".
  5. El sistema valida los datos y actualiza la base de datos a través de una petición PUT.
  6. El sistema muestra una notificación efímera (toast) confirmando la actualización y refresca la lista.
- **Flujos alternos:** N/A.
- **Excepciones:**
  - 5a. Error de validación (Fin anterior a Inicio): El sistema muestra una alerta en el formulario y no permite guardar.
  - 5b. Error de conexión: El sistema muestra un mensaje de error y mantiene el formulario abierto para reintentar.
- **Postcondiciones:** El evento queda actualizado con sus nuevos parámetros en la base de datos.
- **Requerimientos asociados:** RF-005, RF-006.

---

### CU-003 — Agendar Reunión con Enlace Virtual
- **Objetivo:** Organizar una sesión colaborativa vinculando un punto de encuentro digital y participantes.
- **Actor principal:** Usuario autenticado.
- **Precondiciones:** El usuario debe estar en el módulo de "Reuniones" o en el Dashboard.
- **Flujo principal:**
  1. El usuario selecciona "Nueva Reunión" o "Crear -> Nueva Reunión".
  2. El usuario ingresa el nombre de la reunión y los correos de los participantes/invitados en la sección correspondiente.
  3. El usuario escribe el enlace de la videollamada o lugar físico en el campo "Lugar / Enlace *".
  4. El usuario define el intervalo de tiempo (Inicio y Fin).
  5. El usuario guarda la reunión.
  6. El sistema registra el evento y la reunión asociada en la base de datos, y genera un acceso rápido en el carrusel de próximas reuniones en el dashboard.
- **Flujos alternos:**
  - 3a. Lugar físico: El usuario ingresa una dirección física en lugar de un enlace. El sistema lo guarda como texto.
- **Excepciones:**
  - 4a. Choque de horario: El sistema permite el solapamiento de eventos en esta versión para mantener flexibilidad.
- **Postcondiciones:** La reunión queda agendada y vinculada a los participantes y enlace proporcionados.
- **Requerimientos asociados:** RF-007, RF-008.

---

### CU-004 — Iniciar Sesión (Login)
- **Objetivo:** Validar la identidad del usuario para permitir el acceso a su información privada.
- **Actor principal:** Usuario registrado y verificado.
- **Precondiciones:** El usuario debe haber registrado una cuenta y verificado su correo mediante el código de 6 dígitos enviado por email.
- **Flujo principal:**
  1. El usuario accede a la página `auth.html` en la sección de inicio de sesión.
  2. El usuario ingresa su correo electrónico y contraseña.
  3. El usuario pulsa el botón "Iniciar Sesión".
  4. El sistema verifica las credenciales contra el hash almacenado en la base de datos.
  5. El sistema genera un token de acceso (JWT) y lo envía al frontend, que lo almacena en `localStorage`.
  6. El sistema redirige al usuario al Dashboard principal (`index.html`).
- **Flujos alternos:** N/A.
- **Excepciones:**
  - 4a. Credenciales incorrectas: El sistema muestra un mensaje de error y no concede el acceso.
  - 4b. Usuario no verificado: El sistema notifica que la cuenta debe ser verificada primero e instruye al usuario a ingresar el código recibido.
- **Postcondiciones:** El usuario obtiene acceso a sus datos y funciones de ChronoHub.
- **Requerimientos asociados:** RF-002.