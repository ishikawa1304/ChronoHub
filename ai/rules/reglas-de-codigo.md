# Reglas de Código — ChronoHub

## Stack tecnológico de referencia
- **Backend:** Python 3.10+, FastAPI, SQLAlchemy, Pydantic, `python-jose` (JWT), `passlib[bcrypt]`, `slowapi`, `python-dotenv`.
- **Frontend:** HTML5, CSS3 (Vanilla CSS con variables HSL), JavaScript ES6+ nativo. Sin frameworks.

## Reglas generales

1. **Nombres claros y descriptivos:** Variables, funciones y clases deben comunicar su propósito sin necesidad de comentario adicional.
   - Backend: `snake_case` para variables y funciones, `PascalCase` para clases.
   - Frontend: `camelCase` para funciones y variables, `kebab-case` para clases CSS e IDs HTML.
2. **Separación estricta de responsabilidades:**
   - Backend: los routers en `routes/` solo reciben la petición y delegan; la lógica va en `services/`.
   - Frontend: `app.js` gestiona la SPA y la comunicación con la API; `auth.js` maneja exclusivamente el flujo de autenticación (`auth.html`). No mezclar lógica de módulos en el controlador de otro.
3. **Sin duplicación de código:** Si la misma lógica aparece en dos servicios o dos secciones del frontend, extraerla a una función reutilizable.
4. **Documentar decisiones no obvias:** Si una implementación requiere una solución no estándar (ej. manejo manual de CORS, parseo de fechas con zona horaria), agregar un comentario explicando el *por qué*, no el *qué*.
5. **Manejo de errores controlado:**
   - Backend: usar `HTTPException` con código HTTP semántico (`400`, `401`, `403`, `404`, `409`, `500`). Nunca dejar que las excepciones de SQLAlchemy lleguen al cliente sin capturar.
   - Frontend: toda llamada `fetch` debe incluir un bloque `try/catch` y mostrar retroalimentación al usuario mediante el sistema de notificaciones toast existente.
6. **Validación en ambas capas:** El frontend valida formato antes de enviar la petición; el backend valida nuevamente con los esquemas de Pydantic. No asumir que los datos llegaron bien.
7. **Contraseñas siempre hasheadas:** Usar `passlib[bcrypt]` para hashear antes de persistir. Nunca almacenar ni registrar contraseñas en texto plano.
8. **Rate limiting en endpoints críticos:** Los endpoints de registro, login y verificación deben tener limitación de peticiones con `slowapi`.
9. **El proyecto debe permanecer ejecutable:** Después de cualquier cambio, el proyecto debe poder iniciarse con `iniciar_proyecto.bat` desde la raíz sin pasos manuales adicionales.
10. **Variables CSS para diseño:** Todos los colores, tamaños y espaciados en el frontend deben usar las variables CSS definidas (HSL) en `styles.css`. No escribir valores de color literales en nuevos estilos.
11. **No especulación ni código muerto:** No implementar funcionalidades que no hayan sido solicitadas. Eliminar las importaciones y variables que queden sin uso al hacer un cambio.
