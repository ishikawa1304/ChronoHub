# Prompt para Pruebas — ChronoHub

## Contexto del proyecto
ChronoHub tiene los siguientes módulos funcionales: **Autenticación** (RF-001, RF-002), **Tareas** (RF-003, RF-004), **Horario/Eventos** (RF-005, RF-006), **Reuniones** (RF-007, RF-008) y **Perfil** (RF-009). El plan de pruebas base está en `docs/12-plan-de-pruebas.md`. Los casos de prueba se identifican como `TC-[MODULO]-[NNN]` (ej. `TC-AUTH-001`, `TC-TASK-003`).

## Instrucción
A partir del requerimiento o módulo indicado, genera los casos de prueba funcionales con el siguiente formato exacto:

```
### TC-[MODULO]-[NNN] — [Nombre descriptivo del caso]
- **Módulo:** Autenticación / Tareas / Eventos / Reuniones / Perfil
- **Tipo:** Funcional / Integración / Usabilidad
- **RF origen:** RF-0XX
- **Precondición:** Estado del sistema antes de ejecutar el caso.
- **Pasos:**
  1. Acción del usuario.
  2. ...
- **Datos de prueba:** Valores concretos a ingresar (email, contraseña, título, fechas, etc.).
- **Resultado esperado:**
  - Respuesta de la API: método, ruta, código HTTP y estructura JSON de respuesta.
  - Comportamiento visual: toast, actualización de lista, cierre de modal, redirección.
- **Estado:** PASS / FAIL / PENDIENTE
```

## Tipos de prueba a cubrir por módulo
Por cada módulo indicado, genera al menos:
- **1 caso positivo** (flujo exitoso / camino feliz).
- **1 caso negativo** (entrada inválida, sin autenticación, datos faltantes o duplicados).
- **1 caso de error de red** si el módulo involucra un formulario modal (verificar que el modal no se cierra y los datos no se pierden).

## Endpoints de referencia
Los endpoints están documentados en `docs/11-api-e-interfaces.md`. Toda prueba de API debe incluir:
- Header `Authorization: Bearer <token>` si el endpoint lo requiere.
- Swagger UI disponible en `http://127.0.0.1:8000/docs` para ejecución manual.

## Casos especiales obligatorios
- **Rate limiting:** Verificar que `POST /api/v1/auth/register`, `POST /api/v1/auth/login` y `POST /api/v1/auth/verify-email` respondan `429 Too Many Requests` tras múltiples intentos rápidos.
- **Coherencia cronológica (RN-003):** Todo caso de creación/edición de eventos o reuniones debe incluir un caso negativo con `end_time <= start_time`.
- **Expiración de sesión (RN-006):** Verificar que con token expirado el backend responde `401` y el frontend redirige a `auth.html`.

## Módulo(s) a generar
[INDICAR: nombre del módulo o RF-0XX]
