# Diseño Frontend - ChronoHub

Este documento detalla la estrategia de interfaz de usuario, la organización de vistas y los componentes visuales que garantizan una experiencia de usuario (UX) fluida y profesional.

## 1. Objetivo del frontend
El frontend de ChronoHub tiene como misión principal servir de **centro de control visual** para el usuario. Debe transformar datos complejos (fechas, prioridades, estados) en una interfaz clara que minimice la carga cognitiva. Su rol es gestionar la interactividad en tiempo real (como el temporizador de enfoque y la navegación del carrusel de reuniones) y asegurar que la aplicación sea accesible desde cualquier dispositivo (Responsive Design).

## 2. Estructura de pantallas
- **Login / Registro / Verificación (`auth.html`):** Interfaz unificada y moderna que permite registrarse, verificar la cuenta mediante un código de 6 dígitos enviado al correo e iniciar sesión.
- **Dashboard Principal (`index.html` - SPA):** Vista consolidada ("Mi Día") que muestra tareas prioritarias, el temporizador Pomodoro interactivo y el carrusel dinámico de reuniones.
- **Listado Completo de Tareas:** Vista "Tareas" en la SPA que enumera todos los pendientes con prioridades, fechas de entrega y acciones rápidas (editar, eliminar, purgar completadas).
- **Horario / Agenda:** Vista semanal interactiva que permite navegar entre días de la semana y ver/añadir eventos específicos para cada día.
- **Reuniones:** Tablero con las reuniones agendadas que muestra detalles de ubicación, enlaces de videoconferencia, notas y chips con los correos de los participantes.
- **Analíticas:** Dashboard con estadísticas (tareas completadas, horas de enfoque, eventos y reuniones totales), gráfico de donut SVG interactivo de tasa de completitud y barras de distribución de prioridad.
- **Perfil de Usuario (Modal):** Ajustes integrados para cambiar el nombre, email, y elegir o subir un avatar premium.

## 3. Navegación
La navegación se basa en un esquema de **Single Page Application (SPA)** para evitar recargas de página mediante el ocultamiento de secciones (`hidden` class):
- **Navegación Lateral (Sidebar):** El eje principal para saltar entre Mi Día, Tareas, Horario, Reuniones y Analíticas. Colapsable automáticamente en hover en pantallas grandes y tipo cajón (drawer) en móvil.
- **Navegación Superior (Top Bar):** Contiene buscador global, botón de purga de tareas completadas, dropdown de notificaciones internas y acceso directo al perfil del usuario.
- **Botones de Creación Rápida:** Acceso rápido ("Crear...") en el dashboard para desplegar el modal correspondiente (tarea, evento, reunión).

## 4. Componentes clave
- **Sidebar Colapsable:** Se contrae a 78px por defecto y se expande en hover a 250px en pantallas de escritorio, sincronizándose dinámicamente con el espacio principal.
- **Temporizador Pomodoro:** Incluye preset de minutos (15/25/45/60), controles interactivos (+/-) y barra de progreso circular SVG con actualización segundo a segundo.
- **Carrusel de Reuniones:** Un carrusel táctil y responsivo que agrupa las próximas reuniones en tarjetas de 3 en 3, controlable por flechas e indicadores de paginación.
- **Selector de Fecha Premium:** Un componente de calendario personalizado (`CustomDateTimePicker`) desarrollado desde cero para reemplazar selectores nativos, proporcionando cuadrícula de selección de días del mes, selectores de hora y botón AM/PM.
- **Modales de Creación/Edición:** Overlays con formularios validados para gestionar tareas, eventos, reuniones y edición de perfil.