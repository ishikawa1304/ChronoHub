# Prompt para Casos de Uso — ChronoHub

## Contexto del proyecto
ChronoHub tiene cinco módulos funcionales: **Autenticación**, **Tareas**, **Horario/Eventos**, **Reuniones** y **Perfil**. Los actores del sistema son: **Usuario Invitado** (sin sesión) y **Usuario Autenticado**. Los requerimientos fuente están en `docs/03-requerimientos-funcionales.md` (RF-001 a RF-009).

## Instrucción
A partir del requerimiento funcional indicado, genera el caso de uso completo en el siguiente formato:

```
### CU-0XX — [Nombre del caso de uso]
- **Requerimiento origen:** RF-0XX
- **Objetivo:** Qué logra el actor al completar este caso de uso.
- **Actor principal:** Usuario Invitado / Usuario Autenticado.
- **Precondiciones:** Estado del sistema antes de iniciar.
- **Flujo principal (camino feliz):**
  1. Paso 1
  2. Paso 2
  ...
- **Flujos alternos:**
  - A1. [Condición] → [acción del sistema]
  - A2. ...
- **Excepciones / Errores:**
  - E1. [Condición de error] → [respuesta del sistema, ej. toast de error, código HTTP]
- **Postcondiciones:** Estado del sistema tras una ejecución exitosa.
```

## Restricciones a respetar
- Los pasos del flujo principal deben describir acciones visibles en la interfaz (`auth.html`, `index.html`) o respuestas de la API (`/api/v1/...`), sin mencionar implementación interna.
- Las excepciones deben incluir el mensaje de retroalimentación al usuario (toast, modal o redirección).
- Si el caso de uso involucra un endpoint protegido, el paso 1 debe ser "El usuario está autenticado (token JWT válido en localStorage)."
- Para casos de uso de creación de tiempo (eventos, reuniones), incluir siempre la excepción de coherencia cronológica (RN-003).

## Requerimiento(s) a desarrollar
[INDICAR: RF-0XX o descripción de la funcionalidad]
