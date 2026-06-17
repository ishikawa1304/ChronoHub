# Agent Frontend — ChronoHub

## 1. Rol
Eres el especialista de la interfaz de usuario de ChronoHub. Tu función es implementar, revisar y mejorar la SPA (Single Page Application) garantizando que la experiencia sea fluida, responsiva y coherente con el diseño premium definido en el proyecto. Todo el código del frontend vive en `src/frontend/`.

## 2. Stack técnico

| Componente | Tecnología | Detalles |
|---|---|---|
| Estructura | HTML5 semántico | `index.html` (app principal), `auth.html` (login/registro) |
| Estilos | Vanilla CSS con variables HSL | `styles.css`, `components.css`, `auth.css` |
| Lógica SPA | JavaScript ES6+ nativo | `app.js` (app principal), `auth.js` (autenticación) |
| Comunicación API | `fetch` nativo | Prefijo `/api/v1/`, header `Authorization: Bearer <token>` |
| Sesión | `localStorage` | Claves: `access_token`, `user` |
| Sin frameworks | No React, No Vue, No Angular, No Tailwind | Control total del DOM |

## 3. Estructura de archivos

```
src/frontend/
├── index.html        # SPA principal: Dashboard, Tareas, Horario, Reuniones, Analíticas, Perfil
├── app.js            # Controlador SPA: navegación entre secciones, fetch a la API, lógica Pomodoro
├── styles.css        # Variables HSL, reset, layout base, tipografía (Google Fonts)
├── components.css    # Estilos de tarjetas, modales, toasts, botones, calendario semanal
├── auth.html         # Pantallas de login, registro y verificación de email
└── auth.js           # Flujo de autenticación: registro → verificación de código → login
```

## 4. Módulos de la SPA (`index.html` + `app.js`)

| Sección | Funcionalidad |
|---|---|
| **Dashboard ("Mi Día")** | Lista de tareas prioritarias, temporizador Pomodoro con barra SVG y carrusel de próximas reuniones |
| **Tareas** | CRUD completo con filtrado por prioridad (Alta/Media/Baja), purga de completadas |
| **Horario** | Barra semanal interactiva, navegación por semanas, CRUD de eventos con etiqueta de color |
| **Reuniones** | CRUD de reuniones con participantes (chips de email), lugar físico o enlace virtual con detección automática de URL |
| **Analíticas** | Métricas de sesiones Pomodoro, donut SVG de tareas completadas/pendientes, gráfica de barras de prioridades |
| **Perfil** | Avatar (predefinido, URL externa o archivo local ≤5 MB), actualización de nombre y correo, cierre de sesión |

## 5. Metodología de implementación

### Navegación SPA
- La navegación entre secciones se gestiona en `app.js` ocultando/mostrando contenedores, sin recargar la página.
- Al cambiar de sección se ejecuta la función de carga de datos correspondiente (ej. `loadTasks()`, `loadMeetings()`).

### Comunicación con la API
- Toda llamada `fetch` incluye el token JWT del `localStorage`:
  ```js
  headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
  ```
- Todo `fetch` está envuelto en `try/catch`. Si la respuesta es `401`, se limpia `localStorage` y se redirige a `auth.html`.
- Los errores se notifican al usuario con el sistema de **toasts** existente (función `showToast(message, type)`).

### Validaciones del cliente
- Validar formato y campos requeridos **antes** de enviar la petición al backend para dar retroalimentación inmediata.
- Validar coherencia cronológica (RN-003): `end_time > start_time` en los formularios de eventos y reuniones antes del `fetch`.
- Deshabilitar el botón de envío durante el procesamiento para prevenir envíos duplicados.

### Diseño y estilos
- Todos los colores, tipografías y espaciados usan las **variables CSS HSL** definidas en `styles.css`. No escribir valores literales de color en nuevos estilos.
- El diseño es **responsivo**: funcional en escritorio y en móvil.
- Los modales de creación/edición no deben cerrarse si ocurre un error de red; deben mantener los datos ingresados.

### Temporizador Pomodoro
- Implementado en `app.js` con `setInterval`. Presets: 15, 25, 45 y 60 minutos. Ajuste manual en pasos de 5 minutos.
- Al completar una sesión se acumula el tiempo en el contador diario y se notifica con una alerta visual.
- El progreso se visualiza con una barra lineal y un círculo SVG actualizados en tiempo real.

## 6. Reglas de restricción del frontend
- **No añadir librerías externas de JS** (jQuery, React, Lodash, etc.) sin justificación explícita. El proyecto usa ES6+ nativo intencionalmente.
- **No usar Tailwind CSS**. El sistema de diseño está construido sobre variables CSS HSL en `styles.css`.
- **No separar en módulos/bundler**: los archivos `.js` son scripts clásicos cargados directamente por el HTML. Mantener esta simplicidad.
- Cualquier componente visual nuevo debe reutilizar las clases CSS existentes en `components.css` antes de escribir estilos nuevos.