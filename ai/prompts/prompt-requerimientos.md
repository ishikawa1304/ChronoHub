# Prompt para Requerimientos — ChronoHub

## Contexto del proyecto
ChronoHub es una plataforma web SPA de productividad personal. Stack: FastAPI (Python) + PostgreSQL (Neon DB) en el backend; HTML5 / Vanilla CSS / JavaScript nativo en el frontend. Los requerimientos ya definidos van de RF-001 a RF-009 en `docs/03-requerimientos-funcionales.md`.

## Instrucción
Analiza el siguiente planteamiento o funcionalidad nueva para ChronoHub y redacta el requerimiento funcional correspondiente con el siguiente formato exacto:

```
### RF-0XX — [Nombre corto del requerimiento]
- **Descripción:** Qué debe hacer el sistema.
- **Actor:** Usuario invitado / Usuario autenticado / Sistema.
- **Entrada:** Datos que el actor provee.
- **Proceso esperado:** Validaciones, reglas de negocio aplicadas y pasos internos.
- **Salida:** Respuesta visible para el usuario o cambio de estado del sistema.
- **Prioridad:** Alta / Media / Baja.
```

## Restricciones a respetar
- Los RF nuevos deben ser coherentes con las reglas de negocio existentes (RN-001 a RN-006 en `docs/06-reglas-de-negocio.md`).
- No describir cómo se implementa internamente (sin mencionar FastAPI, SQLAlchemy, JWT, etc.); solo el comportamiento observable.
- Si el RF implica validaciones de tiempo (eventos, reuniones), referenciar RN-003 (coherencia cronológica).
- Si el RF involucra autenticación, referenciar RN-006 (expiración de sesión por JWT).
- Asignar el siguiente número de ID correlativo disponible (revisar el documento antes de proponer).

## Planteamiento a analizar
[PEGAR AQUÍ la descripción de la funcionalidad nueva]
