# ChronoHub 🕐

**ChronoHub** es tu centro de control personal para organizar el día a día. Desde una sola pantalla puedes gestionar tus tareas pendientes, planificar tu horario semanal, coordinar reuniones y medir tu productividad con sesiones de enfoque estilo Pomodoro.

---

## ✅ Requisito previo: instalar Python

Antes de ejecutar el proyecto por primera vez necesitas tener **Python 3.14** instalado en tu computadora.

1. Descárgalo desde el sitio oficial: **https://www.python.org/downloads**
2. Ejecuta el instalador.
3. **Importante:** durante la instalación marca la casilla **"Add Python to PATH"** antes de hacer clic en *Install Now*.

   ![Casilla Add Python to PATH](https://www.python.org/static/img/python-logo.png)

4. Una vez instalado, puedes verificarlo abriendo una terminal y escribiendo:
   ```
   python --version
   ```
   Debe mostrar algo como `Python 3.14.x`.

---

## 🚀 Cómo ejecutar ChronoHub

### Primera vez
1. Abre la carpeta del proyecto `ChronoHub`.
2. Haz **doble clic** en el archivo **`iniciar_proyecto.bat`**.
3. La primera vez el script tardará unos minutos porque descarga e instala automáticamente todo lo necesario. Verás mensajes como:
   ```
   [SETUP] Primera ejecucion detectada.
   [SETUP] Creando entorno virtual de Python...
   [SETUP] Instalando dependencias (puede tardar un momento)...
   [OK] Dependencias instaladas correctamente.
   ```
4. Cuando termine, se abrirá automáticamente la aplicación en tu navegador.

5. Cuando te registres se enviará un código de verificación a tu correo (si configuraste Gmail en tu archivo `.env`). Si estás en desarrollo local y no has configurado Gmail, podrás ver el código de verificación impreso directamente en la consola/terminal del backend para copiarlo y pegarlo en la pantalla de verificación.

### A partir de la segunda vez
Simplemente haz doble clic en **`iniciar_proyecto.bat`** — el arranque es inmediato.

---

## ⚙️ Qué hace el archivo `iniciar_proyecto.bat`

Al ejecutarlo, el script realiza los siguientes pasos de forma automática, sin que tengas que hacer nada:

| Paso | Qué hace |
|---|---|
| **1** | Verifica que Python esté instalado en tu sistema. |
| **2** | Crea el entorno virtual de Python (`venv`) dentro de `src/backend/` si no existe. |
| **3** | Instala todas las dependencias del backend desde `requirements.txt`. |
| **4** | Inicia el servidor de la aplicación (Uvicorn) en una ventana separada. |
| **5** | Abre la interfaz de usuario en tu navegador predeterminado. |

---

## 🌐 URLs del sistema (una vez iniciado)

| Dirección | Para qué sirve |
|---|---|
| `http://127.0.0.1:8080/` | Interfaz principal de ChronoHub |
| `http://127.0.0.1:8080/docs` | Documentación interactiva de la API (Swagger) |
| `http://127.0.0.1:8080/redoc` | Documentación alternativa de la API (ReDoc) |

---

## 🔑 Configurar variables de entorno y base de datos (Opcional)

Por defecto, ChronoHub creará una base de datos local SQLite para que puedas ejecutar el proyecto sin configurar nada. Sin embargo, si deseas usar una base de datos externa (como PostgreSQL) o activar el envío de correos, puedes hacerlo usando el archivo `.env`:

1. Dentro de la carpeta `src/backend/` encontrarás un archivo llamado **`.env.example`**.
2. El script `iniciar_proyecto.bat` ya crea automáticamente tu archivo **`.env`** a partir de este ejemplo al ejecutarse por primera vez.
3. Abre el archivo `src/backend/.env` con el Bloc de notas y rellena o descomenta las credenciales que desees:
   ```
   DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@HOST/NOMBRE_BD?sslmode=require"
   SECRET_KEY="tu_clave_secreta"
   GMAIL_USER="tu-correo@gmail.com"
   GMAIL_APP_PASSWORD="tu-contrasena-de-aplicacion-de-gmail"
   ```

> ⚠️ **El archivo `.env` contiene datos privados y credenciales de acceso. Nunca lo compartas ni lo subas al repositorio.**


---

## 📋 Qué puedes hacer en ChronoHub

| Módulo | Funcionalidad |
|---|---|
| **Mis Tareas** | Crear, editar, eliminar y marcar tareas como completadas. Clasificarlas por prioridad (Alta, Media, Baja). |
| **Horario** | Ver y gestionar tu agenda día a día con una barra de calendario semanal. |
| **Reuniones** | Programar reuniones con participantes, lugar físico o enlace virtual (Zoom, Meet, Teams, etc.) y notas. |
| **Sesiones de Enfoque** | Temporizador Pomodoro con presets de 15, 25, 45 y 60 minutos para concentrarte sin distracciones. |
| **Analíticas** | Ver tus métricas de productividad: tareas completadas, horas de enfoque y distribución por prioridad. |
| **Perfil** | Actualizar tu nombre, correo y foto de perfil. |

---

## ❓ Solución de problemas comunes

**El script dice "Python no está instalado"**
→ Asegúrate de haber marcado "Add Python to PATH" durante la instalación. Si no lo hiciste, desinstala Python y vuelve a instalarlo marcando esa casilla.

**La ventana del backend se cierra sola**
→ El servidor encontró un error al arrancar. Revisa que el archivo `src/backend/.env` exista y tenga las credenciales correctas de la base de datos.

**La página no carga en el navegador**
→ Espera unos segundos y recarga. Si el problema persiste, verifica que la ventana del backend siga abierta y no muestre errores en rojo.
"# ChronoHub" 
