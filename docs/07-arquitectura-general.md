# Arquitectura General - ChronoHub

Este documento describe la estructura técnica, los componentes y las decisiones de ingeniería que sostienen a ChronoHub, garantizando un sistema escalable, seguro y eficiente.

## 1. Vista general
La aplicación se concibe como una solución web moderna dividida en capas claramente diferenciadas:
- **Frontend:** Interfaz de usuario rica (Rich UI) que gestiona el estado local y la interactividad a través de un diseño SPA de alto rendimiento.
- **Backend:** Una capa de servicios encargada de procesar la lógica de negocio, validaciones y comunicación con la base de datos mediante FastAPI.
- **Base de Datos:** Motor relacional para gestionar la persistencia de usuarios, tareas y eventos (PostgreSQL en Neon DB).
- **Autenticación:** Implementación basada en tokens (JWT) y verificación de correo por código de 6 dígitos para asegurar las sesiones.
- **Servicios Externos:** Integración de un servicio de envío de correos electrónicos para la verificación de cuentas.
- **Despliegue:** Preparada para hosting en la nube o ejecución local unificada (ej. mediante `iniciar_proyecto.bat`).

## 2. Estilo arquitectónico
Se ha seleccionado el estilo **Cliente-Servidor basado en API REST + SPA (Single Page Application)**.
- **Justificación:** Esta arquitectura desacopla el frontend del backend, permitiendo que la interfaz sea altamente dinámica y reactiva sin recargar la página, lo cual es vital para una experiencia de calendario fluida.

## 3. Componentes principales
- **API Routes (`app/routes/`):** Define los endpoints de la API REST, maneja validaciones de Pydantic y autorización por JWT.
- **Service Layer (`app/services/`):** Contiene la lógica de negocio del sistema, interactuando con la sesión de la base de datos.
- **ORM / Models (`app/models.py`):** Modelos relacionales con SQLAlchemy para representar las entidades de base de datos.
- **Validation Schemas (`app/schemas.py`):** Esquemas de Pydantic para validar entradas y formatear las respuestas JSON de salida.
- **Frontend Controller (`app.js`):** Gestiona la navegación SPA, la comunicación asíncrona mediante Fetch API, la lógica del temporizador Pomodoro y la actualización dinámica del DOM.

## 4. Flujo general de datos
1. El **Usuario** interactúa con la interfaz (ej. crea una tarea).
2. El **Frontend** valida el formato localmente y envía una petición JSON vía HTTP/REST al backend.
3. El **Backend** recibe la petición, valida el Token de sesión y aplica las Reglas de Negocio (RN).
4. La información se envía al **ORM** para ser persistida en la **Base de Datos**.
5. El **Backend** responde con un código de éxito (201 Created).
6. El **Frontend** actualiza la vista dinámicamente sin necesidad de refrescar el navegador.

## 5. Diagrama de Arquitectura
Se sugiere la implementación de un diagrama de bloques que represente la conexión entre el navegador, el servidor de aplicaciones y el servidor de datos.
*(Referencia: assets/diagramas/arquitectura_general.png)*

## 6. Decisiones técnicas relevantes
- **Lenguaje/Framework Backend:** Python (FastAPI). *Razón:* Excelente rendimiento asíncrono, generación automática de documentación interactiva (OpenAPI/Swagger) y facilidad de uso.
- **Frontend:** HTML5 / CSS3 (Vanilla CSS con variables HSL) / JavaScript nativo (SPA). *Razón:* Control absoluto del diseño visual, eliminación de dependencias pesadas y máxima ligereza en la carga del cliente.
- **Base de Datos:** PostgreSQL (Neon DB). *Razón:* Integridad referencial (ACID) y confiabilidad en la nube para la gestión de relaciones entre usuarios, tareas y reuniones.
- **Manejo de Tiempos:** Uso de objetos `Date` nativos de JavaScript en frontend y zonas horarias en PostgreSQL para evitar desfases.