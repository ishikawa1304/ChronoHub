# Manual Técnico - ChronoHub

Este manual detalla los requerimientos, instalación, configuración y arquitectura de despliegue para desarrolladores que deseen configurar o extender el proyecto ChronoHub.

---

## 1. Requerimientos del Sistema

Para asegurar la ejecución y el desarrollo del proyecto, se requiere contar con las siguientes herramientas instaladas:

*   **Lenguaje:** Python 3.10 o superior.
*   **Base de Datos:** PostgreSQL (alojado en la nube mediante Neon DB o en local).
*   **Dependencias principales del Backend:**
    *   `fastapi` y `uvicorn` (servidor de aplicaciones web).
    *   `sqlalchemy` (ORM para la persistencia).
    *   `pydantic` (validación de esquemas).
    *   `slowapi` (rate limiting de endpoints).
    *   `passlib[bcrypt]` (hashing de contraseñas).
    *   `python-jose` (generación y decodificación de tokens JWT).
    *   `python-dotenv` (carga de variables de entorno).
*   **Frontend:** Navegador web moderno (Chrome, Firefox, Edge, Safari) compatible con HTML5, CSS3 y ES6+ JavaScript.

---

## 2. Guía de Instalación y Ejecución

ChronoHub está configurado para un arranque ágil y automatizado en Windows. Sigue estos pasos para levantar el entorno de desarrollo:

### Paso 1: Obtener el Código Fuente
Clona el repositorio o extrae el código en una carpeta local de tu computadora:
```bash
git clone https://github.com/tu-usuario/ChronoHub.git
cd ChronoHub
```

### Paso 2: Configurar las Variables de Entorno
1. Dirígete a la carpeta del backend en `src/backend/`.
2. Duplica el archivo `.env.example` y renómbralo como `.env`.
3. Abre el archivo `.env` y rellena las credenciales de la base de datos PostgreSQL remota (Neon DB) y los parámetros SMTP para el envío de correos de verificación:
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@host/base_datos?sslmode=require"
   SECRET_KEY="tu_clave_secreta_jwt"
   SMTP_USERNAME="tu-email@gmail.com"
   SMTP_PASSWORD="tu-contraseña-de-aplicacion"
   ```

### Paso 3: Arrancar el Proyecto de Forma Automática
1. Regresa a la raíz del proyecto.
2. Haz doble clic en el archivo **`iniciar_proyecto.bat`** (o ejecútalo desde la consola).
3. Este script ejecutará automáticamente las siguientes acciones:
   * Creará el entorno virtual de Python (`venv`) dentro de `src/backend/` si no existe.
   * Activará el entorno virtual y actualizará `pip`.
   * Instalará todas las dependencias del archivo `requirements.txt`.
   * Ejecutará el servidor Uvicorn apuntando a `app.main:app`.
   * Creará las tablas en la base de datos relacional si no existen (a través de SQLAlchemy).
   * Levantará la SPA (Single Page Application) sirviendo los archivos estáticos en la raíz `/`.
   * Abrirá tu navegador predeterminado en `http://127.0.0.1:8000/`.

---

## 3. Configuración del Archivo `.env`

A continuación se describen las variables de configuración clave del archivo `src/backend/.env`:

*   **`DATABASE_URL`**: Cadena de conexión para PostgreSQL con soporte SSL obligatorio para Neon DB.
*   **`SECRET_KEY`**: Clave criptográfica utilizada para firmar los tokens JWT (debe ser compleja en producción).
*   **`ALGORITHM`**: Algoritmo de encriptación para JWT (por defecto: `HS256`).
*   **`ACCESS_TOKEN_EXPIRE_MINUTES`**: Tiempo de validez del token de sesión (ej. `60` minutos).
*   **`SMTP_SERVER`**: Servidor de correo saliente (ej. `smtp.gmail.com`).
*   **`SMTP_PORT`**: Puerto SMTP seguro (ej. `587` o `465`).
*   **`SMTP_USERNAME` / `SMTP_PASSWORD`**: Credenciales de la cuenta emisora para enviar correos de verificación.
*   **`ALLOWED_ORIGINS`**: Lista de dominios permitidos para solicitudes CORS (ej. `http://127.0.0.1:8000`).

---

## 4. Estructura de Puertos y Servicios

*   **Servidor Web Integrado (FastAPI + Uvicorn):** Escucha en el puerto **8000** (`http://127.0.0.1:8000`).
*   **Frontend SPA:** Servido de forma estática en la raíz del servidor (`http://127.0.0.1:8000/`).
*   **Documentación Interactiva de la API:**
    *   Swagger UI: `http://127.0.0.1:8000/docs`
    *   ReDoc: `http://127.0.0.1:8000/redoc`
*   **Base de Datos Relacional (PostgreSQL):** Puerto por defecto `5432` en el servidor remoto de Neon DB.
*   **Tareas de Segundo Plano (BackgroundTasks):** Ejecutadas en hilos independientes por FastAPI para procesar el envío de correos de verificación sin retrasar la respuesta al usuario.
