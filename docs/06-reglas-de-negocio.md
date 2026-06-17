 Reglas de Negocio - ChronoHub

Este documento define las políticas y restricciones lógicas que rigen el comportamiento del sistema ChronoHub, asegurando la integridad de la información y la coherencia en la gestión del tiempo.

---

### RN-001 — Unicidad de Cuenta de Usuario
- **Descripción:** No pueden existir dos usuarios registrados con el mismo correo electrónico.
- **Condición:** Aplica durante el proceso de registro (RF-001).
- **Resultado esperado:** El sistema debe rechazar la creación de la cuenta y notificar al usuario que el correo ya está en uso.
- **Tipo:** Restricción / Validación.
- **Fuente:** Decisión del proyecto (Seguridad y consistencia de datos).

---

### RN-002 — Jerarquía de Prioridades en Tareas
- **Descripción:** Toda tarea debe tener asignada una prioridad obligatoria para su visualización.
- **Condición:** Al crear o editar una tarea (RF-003).
- **Resultado esperado:** Si el usuario no selecciona una, el sistema debe asignar por defecto la prioridad "Media".
- **Tipo:** Validación / Flujo.
- **Fuente:** Necesidad del usuario (Organización garantizada).

---

### RN-003 — Coherencia Cronológica de Eventos
- **Descripción:** La fecha y hora de finalización de un evento o reunión debe ser estrictamente posterior a la fecha y hora de inicio.
- **Condición:** Al crear o editar un evento o reunión.
- **Resultado esperado:** El sistema valida los datos en el frontend antes de realizar el envío; si el rango es inválido, muestra un toast de error y bloquea el guardado.
- **Tipo:** Restricción / Validación.
- **Fuente:** Lógica de negocio (Tiempo coherente).

---

### RN-004 — Duración Flexible de Reuniones
- **Descripción:** Las reuniones no cuentan con restricciones de tiempo mínimas obligatorias para maximizar la flexibilidad del usuario.
- **Condición:** Al programar o editar una reunión.
- **Resultado esperado:** El sistema acepta cualquier rango de tiempo que cumpla con la coherencia cronológica (fin posterior a inicio), sin imponer un límite de duración preestablecido.
- **Tipo:** Flexibilidad de negocio.
- **Fuente:** Decisión del proyecto (Adaptabilidad al usuario).

---

### RN-005 — Ordenación de Tareas por Estado y Recientes First
- **Descripción:** La lista de tareas organiza primero los pendientes activos y relega las completadas, ordenando cada grupo por ID descendente.
- **Condición:** Al renderizar la lista de tareas en el dashboard o en la vista completa.
- **Resultado esperado:** Las tareas completadas se muestran al final y con una opacidad reducida. Dentro de las pendientes y las completadas, se ordenan mostrando las creadas más recientemente en primer lugar.
- **Tipo:** Flujo / Visualización.
- **Fuente:** UX de la aplicación (Foco en lo pendiente y reciente).

---

### RN-006 — Expiración y Cierre de Sesión por Token
- **Descripción:** La sesión de usuario depende de la validez del token JWT enviado en las cabeceras HTTP.
- **Condición:** Al realizar peticiones a la API del backend.
- **Resultado esperado:** Si el token ha expirado o es inválido, el backend responde con estado HTTP 401 y el frontend elimina automáticamente las credenciales locales de `localStorage`, redirigiendo al usuario al login tras notificarle.
- **Tipo:** Restricción / Seguridad.
- **Fuente:** Arquitectura de seguridad (RNF-003).