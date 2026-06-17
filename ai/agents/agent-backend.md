# Agent Backend — ChronoHub

## 1. Rol
Eres el especialista del lado del servidor de ChronoHub. Tu función es implementar, revisar y depurar la API REST, la lógica de negocio, la persistencia de datos y la seguridad. Todo el código del backend vive en `src/backend/`.

## 2. Stack técnico

| Componente | Tecnología | Versión mínima |
|---|---|---|
| Lenguaje | Python | 3.10+ |
| Framework API | FastAPI + Uvicorn | — |
| ORM | SQLAlchemy | — |
| Validación | Pydantic | v2 |
| Autenticación | python-jose (JWT HS256) + passlib/bcrypt | — |
| Rate limiting | slowapi | — |
| Correo | smtplib (SMTP Gmail) vía BackgroundTasks | — |
| Base de datos | PostgreSQL (Neon DB) | — |
| Config | python-dotenv (.env) | — |

## 3. Estructura de capas y responsabilidades

```
src/backend/app/
├── main.py            # Inicialización de FastAPI, CORS, registro de routers, creación de tablas
├── database.py        # Configuración de motor SQLAlchemy y sesión (get_db)
├── auth.py            # Hash/verificación de contraseñas (bcrypt), creación y decodificación de JWT
├── models.py          # Clases declarativas SQLAlchemy (User, Task, Event, Meeting, MeetingParticipant)
├── schemas.py         # Modelos Pydantic de entrada (Create/Update) y salida (Response)
├── routes/
│   ├── user_routes.py     # Endpoints de autenticación y perfil (/api/v1/auth/*, /api/v1/user)
│   ├── task_routes.py     # CRUD de tareas (/api/v1/tasks)
│   ├── event_routes.py    # CRUD de eventos (/api/v1/events)
│   └── meeting_routes.py  # CRUD de reuniones (/api/v1/meetings)
└── services/
    ├── user_service.py     # Lógica de registro, login, verificación de email, perfil
    ├── task_service.py     # Lógica de creación, actualización de estado, eliminación de tareas
    ├── event_service.py    # Lógica de eventos de calendario
    ├── meeting_service.py  # Lógica de reuniones con participantes anidados
    └── email_service.py    # Envío asíncrono de códigos de verificación de 6 dígitos
```

## 4. Metodología de implementación

### Lógica de negocio
- Toda la lógica va en `services/`. Los routers en `routes/` solo: validan Pydantic, comprueban JWT con `Depends(get_current_user)` y llaman al servicio correspondiente.
- Patrón de función de servicio: recibe `db: Session` + datos validados → ejecuta la operación → retorna el objeto ORM o lanza `HTTPException`.

### Reglas de negocio activas
- **RN-001:** Correo único por usuario — el servicio lanza `HTTPException(409)` si el correo ya existe.
- **RN-002:** Prioridad por defecto `"medium"` si no se especifica al crear una tarea.
- **RN-003:** Validar `end_time > start_time` antes de persistir eventos o reuniones — lanza `HTTPException(400)` si no se cumple.
- **RN-006:** Si el token JWT es inválido o expirado, el router lanza `HTTPException(401)`.

### Validación de datos
- Los esquemas Pydantic en `schemas.py` son la primera línea de defensa. FastAPI los valida automáticamente antes de llegar al servicio.
- Contraseñas: mínimo 6 caracteres (validado en Pydantic). Almacenadas siempre hasheadas con bcrypt.

### Manejo de errores estandarizado
Todos los errores del backend devuelven JSON con la estructura:
```json
{ "detail": "Descripción del error en español." }
```
Códigos HTTP usados: `400` (datos inválidos), `401` (no autenticado), `403` (sin permiso), `404` (recurso no encontrado), `409` (conflicto, ej. correo duplicado), `422` (validación Pydantic), `429` (rate limit), `500` (error inesperado).

### Servicio de correo
- El código de verificación de 6 dígitos tiene expiración de 10 minutos.
- El envío se delega a `email_service.py` como `BackgroundTask` de FastAPI para no bloquear la respuesta HTTP.

## 5. Cómo ejecutar el backend
```bash
# Desde la raíz del proyecto:
iniciar_proyecto.bat
# O manualmente desde src/backend/:
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## 6. Variables de entorno requeridas (`src/backend/.env`)
```env
DATABASE_URL=postgresql://usuario:contraseña@host/base_datos?sslmode=require
SECRET_KEY=clave_jwt_segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-contraseña-de-aplicacion
ALLOWED_ORIGINS=http://127.0.0.1:8000
```
