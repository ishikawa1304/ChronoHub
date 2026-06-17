# Reglas de Pruebas — ChronoHub

## Módulos funcionales a cubrir
Las pruebas se organizan en torno a los módulos del sistema: **Autenticación**, **Tareas**, **Horario/Eventos**, **Reuniones** y **Perfil de Usuario**.

## Alcance mínimo por módulo

| Módulo | Casos críticos a cubrir |
|---|---|
| Autenticación | Registro con datos válidos, registro con correo duplicado, login correcto, login con credenciales inválidas, verificación con código de 6 dígitos correcto e incorrecto |
| Tareas | Crear tarea con/sin campos obligatorios, editar, eliminar, marcar como completada, filtrado por prioridad |
| Horario / Eventos | Crear evento con fecha/hora válida, solapamiento de horarios, edición, eliminación, navegación semanal |
| Reuniones | Crear reunión con enlace virtual válido (URL), crear con sala física, validación de traslapes, visualización en carrusel del dashboard |
| Perfil | Actualizar nombre y correo, subir avatar por URL y por archivo local, cierre de sesión |

## Reglas

1. **Toda funcionalidad del alcance debe tener al menos un caso de prueba definido:** Antes de considerar un módulo como entregado, debe existir al menos un caso documentado (puede ser manual) por cada acción CRUD expuesta en `docs/03-requerimientos-funcionales.md`.
2. **Los errores reportados se reproducen primero:** Antes de aplicar un fix, documentar los pasos exactos para reproducir el error (ruta de la API, datos de entrada, respuesta obtenida vs. esperada). Esto es la evidencia de que el bug existía.
3. **Formato estándar para cada caso de prueba:**
   - **ID:** (ej. `TC-AUTH-001`)
   - **Módulo:** (ej. `Autenticación`)
   - **Precondición:** estado del sistema antes de ejecutar.
   - **Pasos:** acciones ordenadas paso a paso.
   - **Resultado esperado:** respuesta de la API o comportamiento visual esperado.
   - **Resultado obtenido:** lo que realmente ocurrió.
   - **Estado:** `PASS` / `FAIL` / `BLOQUEADO`.
4. **Pruebas de API documentan el contrato HTTP:** Para cada endpoint probado incluir: método, ruta, headers (especialmente `Authorization: Bearer <token>`), body JSON de entrada y respuesta JSON esperada con código de estado HTTP.
5. **Validar respuestas de error, no solo éxitos:** Cada caso de prueba positivo debe tener al menos un caso negativo (entrada inválida, token expirado, recurso no encontrado, etc.) para verificar que el backend responde con el código HTTP correcto.
6. **Las evidencias se guardan de forma ordenada:** Screenshots, logs de consola o respuestas de Swagger se almacenan en `deliverables/` con nombre descriptivo y fecha (ej. `TC-TASK-003_fail_2026-06-14.png`).
7. **El estado general de pruebas se incluye en la entrega final:** El documento de entrega debe incluir un resumen con el total de casos definidos, ejecutados, aprobados y fallidos, y el porcentaje de cobertura por módulo.
8. **Pruebas del frontend validan el flujo completo:** Para módulos con interfaz gráfica, la prueba debe verificar el comportamiento visible (aparición del toast de confirmación, actualización de la lista, cierre del modal) además de la respuesta de la API.
9. **Rate limiting verificado en endpoints críticos:** Comprobar que los endpoints `/register`, `/login` y `/verify` rechazan peticiones excesivas con el código HTTP `429 Too Many Requests`.
10. **Compatibilidad mínima de navegadores:** Las pruebas de frontend deben ejecutarse al menos en Chrome y Firefox en su versión estable más reciente, que son los navegadores objetivo del proyecto.
