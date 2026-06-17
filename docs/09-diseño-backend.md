1. Responsabilidades del Backend
El backend de ChronoHub actuará como el núcleo inteligente del sistema, encargándose de:

Gestión de la Persistencia: Garantizar que las tareas y eventos se guarden de forma íntegra y eficiente.

Seguridad y Autenticación: Validar la identidad de los usuarios y proteger sus datos privados (especialmente en integraciones externas).

Orquestación de Integraciones: Manejar el envío asíncrono de correos electrónicos de verificación al registrar usuarios o reenviar códigos (BackgroundTasks de FastAPI).

Validación de Reglas de Negocio: Asegurar que los datos de entrada cumplan con los esquemas definidos en Pydantic (ej. contraseñas de al menos 6 caracteres, correos válidos) y persistencia íntegra.

2. Módulos o Capas
Implementaremos una Arquitectura desacoplada en el Backend organizada de la siguiente manera:

Rutas (`app/routes/`): Son el punto de entrada de las peticiones HTTP/REST. Reciben las solicitudes, ejecutan middlewares de rate limiting (slowapi) o autenticación (JWT) y derivan el procesamiento a la capa de servicios.

Servicios (`app/services/`): Contienen la lógica de negocio y las consultas SQLAlchemy para interactuar con los modelos ORM de la base de datos.

Modelos (`app/models.py`): Clases declarativas de SQLAlchemy que definen las tablas de base de datos y sus relaciones (CASCADE on delete).

Esquemas (`app/schemas.py`): Modelos de validación de Pydantic que aseguran la correctitud de las entradas y formatean la serialización de salida JSON.

Seguridad (`app/auth.py`): Gestiona el hash y verificación de contraseñas (passlib/bcrypt), creación y decodificación de tokens de acceso JWT (jose).

3. Lógica del Negocio
Para evitar el antipatrón de "Endpoints Gordos", la lógica se implementa en la Capa de Servicios (`app/services/`).

Estado de Tareas: Transición de estado (`status`) de "pending" a "completed" registrando la marca de tiempo `completed_at` automáticamente al marcar como completada.

Verificación de Email: Envío asíncrono en segundo plano (BackgroundTasks) del código de 6 dígitos autogenerado con expiración de 10 minutos para asegurar la validez de las cuentas nuevas.

4. Manejo de Errores
Adoptamos el estándar de manejo de excepciones de FastAPI:

Estandarización de Respuestas: Los errores de validación y excepciones de negocio devuelven respuestas JSON estructuradas de forma consistente mediante `HTTPException`:

```json
{
  "detail": "Descripción del error (ej. El correo electrónico ya está registrado)"
}
```

Niveles de Error:

4xx (Cliente): Errores de validación o permisos.

5xx (Servidor): Fallos inesperados que se registrarán en un log interno para su revisión técnica, sin exponer detalles sensibles al usuario.