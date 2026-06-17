Modelo de Datos
1. Descripción General
El modelo de datos está diseñado bajo un enfoque relacional, centralizado en la entidad Usuario. El sistema gestiona tres flujos principales:

Gestión de Pendientes (Tasks): Tareas individuales con estados y prioridades.

Planificación Temporal (Events): Bloques de tiempo definidos en una agenda.

Colaboración (Meetings): Entidad extendida de eventos que gestiona participantes y recursos externos (enlaces o ubicaciones).

2. Entidades
Entidad: User (Usuario)
Propósito: Representa a la persona que utiliza la aplicación y es el dueño de la información.

Campos principales: id (UUID), name (string), email (string, único), password (string, hashed), avatar_url (string, opcional), is_verified (boolean).

Relaciones: Uno a muchos con Tasks, Events e EmailVerifications.

Entidad: EmailVerification (Verificación de Correo)
Propósito: Guarda códigos temporales para verificar las cuentas de usuario registradas.

Campos principales: id (integer, PK), user_id (UUID, FK), code (string), expires_at (datetime), used (boolean), created_at (datetime).

Relaciones: Pertenece a un User.

Entidad: Task (Tarea)
Propósito: Representa una acción específica que el usuario debe realizar.

Campos principales: id, user_id (FK), title, description, priority (enum: low, medium, high), due_date, status (enum: pending, completed), completed_at.

Relaciones: Pertenece a un User.

Entidad: Event (Evento / Horario)
Propósito: Representa un bloque de tiempo ocupado en el calendario del usuario.

Campos principales: id, user_id (FK), title, start_time, end_time, is_all_day (boolean), color_code.

Relaciones: Pertenece a un User. Puede estar vinculado a una Meeting.

Entidad: Meeting (Reunión)
Propósito: Extensión de un evento que incluye coordinación con terceros.

Campos principales: id, event_id (FK), location (física o URL), meeting_notes (text), reminder_sent (boolean).

Relaciones: Vinculada 1:1 con Event. Tiene muchos Participants.

Entidad: Participant (Participante)
Propósito: Registro de personas invitadas a una reunión.

Campos principales: id, meeting_id (FK), email, status (enum: invited, accepted, declined).

Relaciones: Pertenece a una Meeting.

3. Reglas de Integridad
Campos Obligatorios: Todos los registros deben tener sus identificadores primarios y creadores. En Tasks, el título es obligatorio; en Events, las fechas/horas de inicio y fin son requeridas.

Unicidad: El campo email en la entidad User debe ser único globalmente para evitar duplicidad de cuentas.

Relaciones (Referencial): Se aplica ON DELETE CASCADE en las tareas, eventos y verificaciones de email cuando un usuario sea eliminado, para evitar registros huérfanos. Al eliminar un Evento, la Meeting asociada y sus Participants se eliminan en cascada.

Borrado Físico: En la versión actual, las tareas, eventos y reuniones se eliminan físicamente de la base de datos para mantener el almacenamiento optimizado y simplificar la lógica de negocio.

Validación de Fechas: La end_time de un evento nunca puede ser menor o igual a la start_time.

4. Diagrama ER
El siguiente diagrama ilustra la normalización de las tablas y cómo las reuniones se integran con el calendario general mediante una relación de extensión con los eventos.

(Referencia de archivo: assets/diagramas/chrono-hub-er-v1.png)