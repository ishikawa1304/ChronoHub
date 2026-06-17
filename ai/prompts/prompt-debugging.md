# Prompt para Debugging — ChronoHub

## Contexto del proyecto
ChronoHub usa la siguiente arquitectura:
- **Backend:** FastAPI + SQLAlchemy + Pydantic + passlib/bcrypt + python-jose (JWT) + slowapi. Punto de entrada: `src/backend/app/main.py`. Servidor en `http://127.0.0.1:8000`.
- **Frontend:** SPA con `app.js` (lógica principal) y `auth.js` (flujo de autenticación). Comunicación via `fetch` con el prefijo `/api/v1/`.
- **Base de datos:** PostgreSQL en Neon DB. ORM en `app/models.py`, esquemas en `app/schemas.py`.
- **Capas:** `routes/` (solo orquesta) → `services/` (lógica de negocio) → `models.py` (ORM).
- **Autenticación:** JWT en `localStorage`. Header `Authorization: Bearer <token>` en todas las rutas protegidas. Errores 401 redirigen a `auth.html`.

## Instrucción
Analiza el siguiente error dentro del contexto de ChronoHub y responde en este orden:

### 1. Diagnóstico
- ¿En qué capa ocurre el error? (Frontend `app.js`/`auth.js` → `fetch` → Backend `routes/` → `services/` → `models.py` / Base de datos)
- Causa probable según el stack de ChronoHub.

### 2. Verificaciones concretas
Lista de comprobaciones paso a paso, indicando exactamente qué revisar y en qué archivo:
- ej. "Verificar en `app/routes/task_routes.py` que el endpoint usa `Depends(get_current_user)`."
- ej. "Abrir `http://127.0.0.1:8000/docs` y ejecutar el endpoint manualmente para aislar si el error es de API o de frontend."

### 3. Solución propuesta
Cambio concreto y mínimo para resolver el error. Incluir:
- Archivo a modificar con su ruta relativa desde la raíz del proyecto.
- El fragmento de código a cambiar (antes / después).
- Si el fix afecta al frontend, indicar si hay que actualizar `app.js` o `auth.js`.

### 4. Documentación afectada
Indicar si el fix implica actualizar alguno de estos documentos:
- `docs/07-arquitectura-general.md` → si cambia alguna capa o tecnología.
- `docs/11-api-e-interfaces.md` → si cambia la firma de un endpoint (ruta, método, body, respuesta).
- `docs/06-reglas-de-negocio.md` → si se modifica una validación o restricción de negocio.
- `docs/12-plan-de-pruebas.md` → si el bug implica añadir un caso de prueba de regresión.

## Error a analizar
```
[PEGAR AQUÍ: mensaje de error, traceback, respuesta HTTP o descripción del comportamiento inesperado]
```

## Archivo / módulo donde ocurre (si se conoce)
[INDICAR: nombre del archivo o ruta, ej. `src/backend/app/services/task_service.py`]
