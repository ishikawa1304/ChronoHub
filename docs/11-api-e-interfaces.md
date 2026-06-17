# API e Interfaces - ChronoHub

Este documento especifica todos los endpoints de la API REST expuestos por el backend de ChronoHub (prefijo base: `/api/v1`), requeridos para la comunicación asíncrona de la SPA.

---

## 1. Módulo de Autenticación & Usuarios

### 1.1 Registro de Usuario
* **Método:** `POST`
* **Ruta:** `/api/v1/auth/register`
* **Entrada (Body):**
  ```json
  {
    "name": "Juan Perez",
    "email": "juan@example.com",
    "password": "secretpassword"
  }
  ```
* **Salida (201 Created):**
  ```json
  {
    "message": "Cuenta creada. Revisa tu correo para verificar tu cuenta.",
    "email": "juan@example.com",
    "verification_required": true
  }
  ```

### 1.2 Verificación de Email
* **Método:** `POST`
* **Ruta:** `/api/v1/auth/verify-email`
* **Entrada (Body):**
  ```json
  {
    "email": "juan@example.com",
    "code": "123456"
  }
  ```
* **Salida (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": "uuid-1234-5678...",
      "name": "Juan Perez",
      "email": "juan@example.com",
      "avatar_url": "https://..."
    }
  }
  ```

### 1.3 Reenvío de Código
* **Método:** `POST`
* **Ruta:** `/api/v1/auth/resend-code`
* **Entrada (Body):**
  ```json
  {
    "email": "juan@example.com"
  }
  ```
* **Salida (200 OK):**
  ```json
  {
    "message": "Nuevo código enviado. Revisa tu correo."
  }
  ```

### 1.4 Inicio de Sesión (Login)
* **Método:** `POST`
* **Ruta:** `/api/v1/auth/login`
* **Entrada (Body):**
  ```json
  {
    "email": "juan@example.com",
    "password": "secretpassword"
  }
  ```
* **Salida (200 OK):** Retorna el token de acceso JWT y los datos del perfil (igual que en verificación).

### 1.5 Cierre de Sesión (Logout)
* **Método:** `POST`
* **Ruta:** `/api/v1/auth/logout`
* **Autenticación:** Requerida (Header `Authorization: Bearer <token>`).
* **Salida (200 OK):**
  ```json
  {
    "message": "Sesión cerrada exitosamente."
  }
  ```

### 1.6 Cambiar Contraseña
* **Método:** `POST`
* **Ruta:** `/api/v1/auth/change-password`
* **Autenticación:** Requerida.
* **Entrada (Body):**
  ```json
  {
    "current_password": "oldpassword",
    "new_password": "newpassword123"
  }
  ```
* **Salida (200 OK):**
  ```json
  {
    "message": "Contraseña actualizada exitosamente."
  }
  ```

---

## 2. Módulo de Perfil de Usuario

### 2.1 Obtener Perfil
* **Método:** `GET`
* **Ruta:** `/api/v1/user`
* **Autenticación:** Requerida.
* **Salida (200 OK):** Datos del usuario (`id`, `name`, `email`, `avatar_url`).

### 2.2 Actualizar Perfil
* **Método:** `PUT`
* **Ruta:** `/api/v1/user`
* **Autenticación:** Requerida.
* **Entrada (Body):**
  ```json
  {
    "name": "Juan Perez Editado",
    "email": "juan.editado@example.com",
    "avatar_url": "https://..."
  }
  ```
* **Salida (200 OK):** Perfil actualizado.

### 2.3 Subir Archivo de Avatar
* **Método:** `POST`
* **Ruta:** `/api/v1/user/avatar`
* **Autenticación:** Requerida.
* **Entrada (Multipart/Form-Data):** `file` (archivo de imagen, máx. 5 MB).
* **Salida (200 OK):**
  ```json
  {
    "avatar_url": "http://127.0.0.1:8000/uploads/avatars/randomfilename.png",
    "message": "Avatar subido exitosamente."
  }
  ```

### 2.4 Eliminar Cuenta de Usuario
* **Método:** `DELETE`
* **Ruta:** `/api/v1/user`
* **Autenticación:** Requerida.
* **Salida:** `204 No Content`.

---

## 3. Módulo de Tareas (Tasks)

### 3.1 Listar Tareas del Usuario
* **Método:** `GET`
* **Ruta:** `/api/v1/tasks`
* **Autenticación:** Requerida.
* **Salida (200 OK):** Lista de objetos de tareas.

### 3.2 Crear Tarea
* **Método:** `POST`
* **Ruta:** `/api/v1/tasks`
* **Autenticación:** Requerida.
* **Entrada (Body):**
  ```json
  {
    "title": "Aprender FastAPI",
    "description": "Revisar la documentación oficial",
    "priority": "high",
    "due_date": "2026-06-20T18:00:00.000Z"
  }
  ```
* **Salida (201 Created):** Objeto de tarea creado con su identificador numérico y estado `pending`.

### 3.3 Actualizar Tarea
* **Método:** `PUT`
* **Ruta:** `/api/v1/tasks/{task_id}`
* **Autenticación:** Requerida.
* **Entrada (Body):** Campos opcionales a modificar (título, descripción, prioridad, due_date).
* **Salida (200 OK):** Objeto de tarea modificado.

### 3.4 Cambiar Estado de Tarea
* **Método:** `PATCH`
* **Ruta:** `/api/v1/tasks/{task_id}/status?status=completed`
* **Autenticación:** Requerida.
* **Salida (200 OK):** Objeto de tarea con estado actualizado (`completed` / `pending`).

### 3.5 Eliminar Tarea
* **Método:** `DELETE`
* **Ruta:** `/api/v1/tasks/{task_id}`
* **Autenticación:** Requerida.
* **Salida:** `200 OK` (retorna respuesta básica de confirmación).

---

## 4. Módulo de Eventos (Calendar Events)

### 4.1 Listar Eventos del Usuario
* **Método:** `GET`
* **Ruta:** `/api/v1/events`
* **Autenticación:** Requerida.
* **Salida (200 OK):** Lista completa de eventos programados del usuario.

### 4.2 Crear Evento
* **Método:** `POST`
* **Ruta:** `/api/v1/events`
* **Autenticación:** Requerida.
* **Entrada (Body):**
  ```json
  {
    "title": "Estudio Autónomo de Redes",
    "start_time": "2026-06-14T21:00:00.000Z",
    "end_time": "2026-06-14T23:00:00.000Z",
    "is_all_day": false,
    "color_code": "#4A6CF7"
  }
  ```
* **Salida (201 Created):** Objeto de evento creado.

### 4.3 Actualizar Evento
* **Método:** `PUT`
* **Ruta:** `/api/v1/events/{event_id}`
* **Autenticación:** Requerida.
* **Entrada (Body):** Campos a modificar.
* **Salida (200 OK):** Objeto de evento modificado.

### 4.4 Eliminar Evento
* **Método:** `DELETE`
* **Ruta:** `/api/v1/events/{event_id}`
* **Autenticación:** Requerida.
* **Salida:** `204 No Content`.

---

## 5. Módulo de Reuniones (Meetings)

### 5.1 Listar Reuniones
* **Método:** `GET`
* **Ruta:** `/api/v1/meetings`
* **Autenticación:** Requerida.
* **Salida (200 OK):** Lista de reuniones (incluye evento anidado y lista de participantes).

### 5.2 Agendar Reunión
* **Método:** `POST`
* **Ruta:** `/api/v1/meetings`
* **Autenticación:** Requerida.
* **Entrada (Body):**
  ```json
  {
    "location": "https://meet.google.com/abc-defg-hij",
    "meeting_notes": "Notas preliminares",
    "event": {
      "title": "Diseño de Base de Datos",
      "start_time": "2026-06-15T15:00:00.000Z",
      "end_time": "2026-06-15T16:30:00.000Z",
      "is_all_day": false,
      "color_code": "#8B5CF6"
    },
    "participants": [
      {
        "email": "compañero@universidad.edu"
      }
    ]
  }
  ```
* **Salida (201 Created):** Objeto de la reunión creada.

### 5.3 Actualizar Reunión
* **Método:** `PUT`
* **Ruta:** `/api/v1/meetings/{meeting_id}`
* **Autenticación:** Requerida.
* **Entrada (Body):** Estructura similar a la creación con campos modificados.
* **Salida (200 OK):** Objeto de la reunión modificado.

### 5.4 Eliminar Reunión
* **Método:** `DELETE`
* **Ruta:** `/api/v1/meetings/{meeting_id}`
* **Autenticación:** Requerida.
* **Salida:** `204 No Content`.
