# Reglas de Arquitectura — ChronoHub

## Estilo arquitectónico
ChronoHub sigue el patrón **Cliente-Servidor con API REST + SPA (Single Page Application)**.
El frontend y el backend están completamente desacoplados: el frontend consume la API mediante `fetch` y nunca accede directamente a la base de datos.

## Capas del sistema

| Capa | Tecnología | Ruta |
|---|---|---|
| Frontend (SPA) | HTML5 / Vanilla CSS / JavaScript ES6+ | `src/frontend/` |
| Backend (API) | Python + FastAPI + Uvicorn | `src/backend/app/` |
| ORM / Modelos | SQLAlchemy | `src/backend/app/models.py` |
| Esquemas de validación | Pydantic | `src/backend/app/schemas.py` |
| Lógica de negocio | Servicios Python | `src/backend/app/services/` |
| Endpoints REST | Routers FastAPI | `src/backend/app/routes/` |
| Base de datos | PostgreSQL (Neon DB) | Remoto vía `DATABASE_URL` |

## Reglas

1. **Respetar la separación de capas:** La lógica de negocio va en `services/`, nunca directamente en los routers de `routes/`. Los routers solo orquestan: validan con Pydantic, llaman al servicio y devuelven la respuesta.
2. **Todo componente nuevo en la capa correcta:** Si se añade una funcionalidad, seguir el patrón existente: crear el modelo en `models.py`, el esquema en `schemas.py`, el servicio en `services/`, y el router en `routes/` registrado en `main.py`.
3. **El frontend es puro SPA:** No se usan frameworks de frontend (React, Vue, etc.). Toda la navegación se gestiona desde `app.js` mediante lógica de secciones. No añadir dependencias externas de JS sin justificación explícita.
4. **Autenticación exclusivamente por JWT:** Toda ruta protegida del backend debe verificar el token Bearer mediante `auth.py`. El frontend almacena el token en `localStorage` y lo adjunta en el header `Authorization`.
5. **Los cambios estructurales actualizan la documentación:** Cualquier cambio en capas, módulos o decisiones técnicas debe reflejarse en `docs/07-arquitectura-general.md`.
6. **Toda integración o endpoint nuevo se documenta en** `docs/11-api-e-interfaces.md`.
7. **El modelo de datos se mantiene sincronizado:** Los modelos de SQLAlchemy en `models.py` y los esquemas de Pydantic en `schemas.py` deben reflejar siempre la estructura real de la base de datos.
8. **Variables de entorno para toda configuración sensible:** URLs de base de datos, claves JWT, credenciales SMTP y orígenes CORS se leen desde `.env`. Nunca hardcodear valores sensibles.
9. **Manejo de zonas horarias consistente:** Usar objetos `Date` nativos en JavaScript y campos `TIMESTAMP WITH TIME ZONE` en PostgreSQL para evitar desfases horarios.
10. **El servicio de correo electrónico es asíncrono:** El envío de correos de verificación se procesa como `BackgroundTask` de FastAPI; nunca bloquear la respuesta HTTP esperando el envío.
