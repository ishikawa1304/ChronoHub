# Manual de Usuario - ChronoHub

Bienvenido a ChronoHub, tu centro de control personal para la productividad y gestión del tiempo. Esta guía te orientará en el uso de todas las herramientas integradas en la aplicación.

---

## 1. Acceso al Sistema

ChronoHub protege tu información personal mediante un flujo de acceso seguro.

### Registro de Nuevo Usuario
1. En la pantalla de acceso (`auth.html`), selecciona la pestaña **Registrarse**.
2. Completa los campos: Nombre, Correo Electrónico y Contraseña (mínimo 6 caracteres).
3. Haz clic en **Crear Cuenta**.
4. El sistema enviará un **código de verificación de 6 dígitos** a tu dirección de correo electrónico y te redirigirá a la pantalla de verificación.
5. Introduce el código de 6 dígitos recibido y pulsa **Verificar Cuenta**.
6. Una vez verificada, tu cuenta estará activa y serás redirigido al Dashboard.

### Inicio de Sesión
1. Si ya tienes una cuenta verificada, ingresa tu Correo Electrónico y Contraseña en la pestaña **Iniciar Sesión**.
2. Haz clic en el botón **Iniciar Sesión**.
3. El sistema almacenará tu sesión y te redirigirá al panel principal (`index.html`).

---

## 2. El Dashboard Principal ("Mi Día")

Al ingresar a la aplicación, verás la pantalla consolidada del panel principal. Esta pantalla agrupa tres componentes clave:

### 2.1 Tus Tareas Prioritarias
* Muestra la lista de tus pendientes activos ordenados para una fácil visualización.
* Puedes marcar una tarea como completada directamente pulsando el checkbox de la izquierda.
* El botón de lápiz te permite **editar** los campos y el botón de basura **elimina** la tarea.

### 2.2 Sesiones de Enfoque (Temporizador Pomodoro)
* Diseñado para bloquear tiempos de concentración sin distracciones.
* **Ajustar duración:** Haz clic en los presets de tiempo (15, 25, 45 o 60 minutos), introduce el tiempo manualmente o usa los botones `+` / `-` para cambiar de 5 en 5 minutos.
* **Control:** Haz clic en **Iniciar** para comenzar el cronómetro. Puedes **Pausar** o **Reiniciar** la sesión en cualquier momento.
* **Barra de Progreso:** Una barra y un círculo SVG visualizan el progreso restante en tiempo real. Al finalizar la sesión, se sumará al contador diario y el sistema te notificará mediante una alerta visual.

### 2.3 Carrusel de Próximas Reuniones
* Muestra de forma horizontal las reuniones que tienes agendadas para hoy o fechas futuras.
* Puedes navegar entre las reuniones usando las flechas laterales o los puntos indicadores inferiores.
* Muestra la hora del encuentro, el título de la reunión y avatares dinámicos de los participantes invitados.

---

## 3. Módulo de Tareas Completo ("Tareas")

En la pestaña **Tareas** de la barra lateral izquierda, accedes al listado completo de actividades:
* **Crear Tarea:** Haz clic en el botón **Nueva Tarea**. Ingresa un título (obligatorio), detalles opcionales en la descripción, selecciona la prioridad (Alta, Media, Baja) y una fecha límite.
* **Purga Rápida:** En la esquina superior derecha del encabezado, el botón de papelera te permite eliminar de una sola vez todas las tareas que ya has completado.

---

## 4. Módulo de Horario ("Horario")

Esta sección te permite planificar tu agenda diaria mediante una barra de calendario semanal.
* **Navegación Semanal:** Haz clic en los días de la barra superior para cambiar la fecha seleccionada. Utiliza las flechas `←` y `→` al lado del título "Horario" para retroceder o avanzar de semana en semana.
* **Nuevo Evento:** Haz clic en **Nuevo Evento** para programar actividades de tu jornada. Rellena el título, fecha y hora de inicio/fin, y selecciona una etiqueta de color para clasificarlo (Trabajo, Personal, Urgente, Crítico, Reunión).
* **Edición/Eliminación:** Los eventos listados en el día seleccionado cuentan con botones de edición y borrado rápido.

---

## 5. Módulo de Reuniones ("Reuniones")

Diseñado para la programación de sesiones con otras personas.
* **Nueva Reunión:** Haz clic en **Nueva Reunión**.
  * **Título, Inicio y Fin:** Define los detalles del evento.
  * **Lugar / Enlace:** Escribe el nombre de la sala física o pega el enlace virtual (Zoom, Meet, Teams, etc.). Si es una URL, el sistema creará automáticamente un enlace directo para unirte con un clic.
  * **Notas:** Añade el orden del día o la agenda de la reunión.
  * **Participantes:** Ingresa los correos electrónicos de los invitados. Puedes añadir múltiples filas haciendo clic en **+ Añadir participante** o eliminarlas con el botón `×`.
* **Visualización:** Las reuniones se muestran en tarjetas completas detallando la fecha, lugar/enlace de acceso directo, agenda de notas y chips individuales con los participantes invitados.

---

## 6. Módulo de Analíticas ("Analíticas")

En la pestaña **Analíticas** puedes auditar tu rendimiento:
* **Métricas Principales:** Muestra contadores de Tareas Completadas, Horas de Enfoque acumuladas (calculadas de tus sesiones Pomodoro finalizadas), Eventos Creados y Reuniones Agendadas.
* **Gráfica de Completitud (Donut SVG):** Muestra el porcentaje y relación exacta de tareas pendientes frente a las completadas.
* **Gráfica de Prioridades:** Muestra la distribución de tus tareas activas divididas en barras visuales de prioridad Alta, Media y Baja.

---

## 7. Configuración de Perfil

Puedes acceder haciendo clic en tu foto/avatar en la barra superior o en la esquina inferior izquierda de la barra lateral.
* **Avatar Premium:** Selecciona uno de los avatares prediseñados de la grilla.
* **Avatar Personalizado:** Pega un enlace URL directo de tu imagen o haz clic en **Seleccionar archivo** para subir una foto en formato JPG, PNG, GIF o WebP desde tu computadora (máx. 5 MB).
* **Datos de Cuenta:** Actualiza tu nombre y tu dirección de correo electrónico en los campos de texto correspondientes.
* **Cerrar Sesión:** Haz clic en **Cerrar Sesión** en la esquina inferior izquierda del modal para salir de tu cuenta de forma segura y borrar las credenciales del dispositivo.