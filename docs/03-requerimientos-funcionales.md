# Requerimientos Funcionales - ChronoHub

Este documento detalla las funciones específicas que el sistema ChronoHub debe ejecutar para satisfacer las necesidades del usuario final, basándose en un diseño modular de tareas, horarios y reuniones.

## Gestión de Usuarios y Sesión

### RF-001 — Registro de Usuario
- **Descripción:** Permitir a nuevos usuarios crear una cuenta en la plataforma.
- **Actor:** Usuario invitado.
- **Entrada:** Nombre, correo electrónico, contraseña.
- **Proceso esperado:** El sistema valida que el correo sea único y que la contraseña cumpla con los estándares de seguridad. Se crea el registro en la base de datos.
- **Salida:** Confirmación de registro exitoso y redirección al login.
- **Prioridad:** Alta.

### RF-002 — Autenticación de Usuario (Login)
- **Descripción:** Validar la identidad del usuario para acceder a sus datos personales.
- **Actor:** Usuario registrado.
- **Entrada:** Correo electrónico y contraseña.
- **Proceso esperado:** Verificación de credenciales contra la base de datos. Inicio de sesión y generación de token de acceso.
- **Salida:** Acceso al Dashboard principal.
- **Prioridad:** Alta.

## Módulo de Tareas

### RF-003 — Gestión CRUD de Tareas
- **Descripción:** El sistema debe permitir crear, leer, actualizar y eliminar tareas personales.
- **Actor:** Usuario autenticado.
- **Entrada:** Título de tarea, descripción (opcional), fecha límite, prioridad.
- **Proceso esperado:** El sistema guarda los cambios y los asocia al ID del usuario actual.
- **Salida:** Lista de tareas actualizada visualmente.
- **Prioridad:** Alta.

### RF-004 — Clasificación por Prioridad
- **Descripción:** Permitir asignar niveles de urgencia a las tareas.
- **Actor:** Usuario autenticado.
- **Entrada:** Selección de etiqueta (Alta, Media, Baja).
- **Proceso esperado:** El sistema aplica un código de color o marcador visual según la selección.
- **Salida:** Tarea visualmente diferenciada en la lista.
- **Prioridad:** Media.

## Módulo de Horarios (Calendario)

### RF-005 — Visualización de Agenda
- **Descripción:** Mostrar las actividades programadas día a día.
- **Actor:** Usuario autenticado.
- **Entrada:** Selección de fecha mediante la barra de calendario semanal.
- **Proceso esperado:** El sistema consulta todos los eventos creados por el usuario y los filtra por el día seleccionado.
- **Salida:** Lista de eventos programados para la fecha seleccionada.
- **Prioridad:** Alta.

### RF-006 — Edición de Eventos mediante Formulario
- **Descripción:** Permitir cambiar los detalles (título, fecha, hora, color) de un evento o tarea.
- **Actor:** Usuario autenticado.
- **Entrada:** Clic en el botón "Editar" en un elemento y modificación de campos en el formulario modal.
- **Proceso esperado:** El sistema actualiza los registros correspondientes en la base de datos al enviar el formulario.
- **Salida:** Lista actualizada con los nuevos detalles del evento y confirmación (toast).
- **Prioridad:** Media.

## Módulo de Reuniones

### RF-007 — Programación de Reuniones
- **Descripción:** Crear eventos de reunión con detalles específicos de ubicación.
- **Actor:** Usuario autenticado.
- **Entrada:** Título, invitados (emails), lugar (físico o URL virtual), hora de inicio y fin.
- **Proceso esperado:** Registro del evento y validación de que no haya traslapes críticos en el horario del organizador.
- **Salida:** Registro de reunión en el calendario.
- **Prioridad:** Alta.

### RF-008 — Vinculación de Enlaces y Notas a Reunión
- **Descripción:** Asociar enlaces virtuales (videollamadas) o notas informativas a una reunión programada.
- **Actor:** Usuario autenticado.
- **Entrada:** URL (enlace) o texto explicativo (notas).
- **Proceso esperado:** Guardado de la ubicación/enlace y notas textuales asociadas en el registro de la reunión.
- **Salida:** Enlaces interactivos y notas textuales visibles en el carrusel del dashboard y en la vista detallada de reuniones.
- **Prioridad:** Media.

## Configuración y Accesibilidad

### RF-009 — Gestión de Perfil de Usuario
- **Descripción:** Permitir al usuario ver y actualizar la información de su perfil, incluyendo nombre, correo y avatar personalizado.
- **Actor:** Usuario autenticado.
- **Entrada:** Nombre, correo electrónico, selección de avatar predefinido, URL de avatar personalizado o archivo de imagen local.
- **Proceso esperado:** El sistema valida la información, sube la imagen (si corresponde) y guarda los cambios en la base de datos.
- **Salida:** Perfil actualizado visualmente en la barra superior, barra lateral y confirmación de cambios.
- **Prioridad:** Media.