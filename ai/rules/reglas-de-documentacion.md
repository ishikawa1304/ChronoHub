# Reglas de Documentación — ChronoHub

## Estructura de documentos del proyecto
Toda la documentación vive en la carpeta `docs/` y se organiza por índice numérico. El punto de entrada es `docs/00-index.md`.

## Documentos clave de referencia

| Archivo | Contenido |
|---|---|
| `docs/01-planteamiento-del-proyecto.md` | Descripción del problema, justificación y alcance del semestre |
| `docs/03-requerimientos-funcionales.md` | Casos de uso RF-001 … RF-009 con descripción, actor, entrada, proceso y salida |
| `docs/07-arquitectura-general.md` | Capas, componentes, flujo de datos y decisiones técnicas |
| `docs/11-api-e-interfaces.md` | Especificación de endpoints REST y contratos de la API |
| `docs/13-manual-tecnico.md` | Requerimientos, instalación, variables de entorno y despliegue |
| `docs/14-manual-de-usuario.md` | Guía de uso de cada módulo para el usuario final |

## Reglas

1. **Sin títulos vacíos en entrega:** Toda sección con encabezado debe tener al menos un párrafo o lista con contenido real. No entregar documentos con `*(por definir)*` o similares como único contenido.
2. **Los documentos reflejan el sistema implementado:** Si una funcionalidad cambia o se elimina, el documento correspondiente debe actualizarse en el mismo commit/entrega. La documentación obsoleta es un error, no un pendiente.
3. **Cambios importantes en la bitácora:** Toda decisión de diseño significativa, cambio de tecnología o corrección crítica se registra en el documento de bitácora (`docs/` con prefijo de fecha), incluyendo la fecha, el motivo y el responsable.
4. **Todo diagrama lleva nombre, fecha y descripción breve:** Los archivos de diagrama en `assets/diagramas/` siguen la nomenclatura `<tipo>_<modulo>_<fecha>.png` (ej. `arquitectura_general_2026-06.png`) y se referencian en el documento que los usa con un texto alternativo descriptivo.
5. **El índice `docs/00-index.md` se mantiene actualizado:** Al agregar o renombrar un documento, actualizar el índice para que refleje la tabla de contenidos correcta.
6. **Requerimientos funcionales con formato completo:** Cada RF en `docs/03-requerimientos-funcionales.md` debe incluir: descripción, actor, entrada, proceso esperado, salida y prioridad. No abreviar los campos.
7. **El manual técnico cubre la instalación completa:** `docs/13-manual-tecnico.md` debe permitir que un desarrollador nuevo levante el entorno desde cero sin preguntar: incluye prerrequisitos, configuración de `.env`, ejecución con `iniciar_proyecto.bat` y URLs de servicio.
8. **El manual de usuario describe cada módulo con acciones concretas:** `docs/14-manual-de-usuario.md` describe los módulos Tareas, Horario, Reuniones, Analíticas y Perfil con pasos numerados orientados al usuario final, sin términos técnicos internos.
9. **Propósito claro en cada sección:** Si una sección de un documento no aporta información accionable al lector objetivo (usuario o desarrollador), debe eliminarse o fusionarse.
10. **Idioma consistente:** Toda la documentación del proyecto está en español. Los nombres de archivos y variables de código permanecen en inglés según la convención del stack técnico.
