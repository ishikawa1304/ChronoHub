# Objetivos y Alcance - ChronoHub

## 1. Objetivo general
Desarrollar una plataforma integral de gestión de productividad que centralice la administración de tareas, la planificación de horarios y la organización de reuniones, optimizando el flujo de trabajo personal mediante una interfaz intuitiva, accesible y de alta respuesta.

## 2. Objetivos específicos
- **Implementar un sistema de gestión de tareas (Task Manager):** Permitir la creación, priorización y seguimiento de actividades con estados de cumplimiento claros.
- **Desarrollar una agenda semanal interactiva:** Facilitar la visualización y reprogramación de eventos mediante una barra de selección de días y formularios dinámicos.
- **Establecer un módulo de coordinación de reuniones:** Integrar la programación de sesiones con enlaces virtuales (videoconferencias) y notas de texto para mejorar la preparación previa.
- **Garantizar la adaptabilidad y accesibilidad:** Asegurar que la aplicación sea funcional en dispositivos móviles y de escritorio, cumpliendo con estándares de legibilidad y usabilidad.

## 3. Alcance funcional
El sistema permitirá realizar las siguientes acciones:
- **Gestión de Tareas:** Creación, edición, eliminación (CRUD) y marcado de completado. Clasificación por importancia (Alta/Media/Baja).
- **Planificación de Horarios:** Vista de eventos diarios mediante una barra semanal interactiva.
- **Control de Reuniones:** Registro de invitados (participantes), asignación de lugares físicos o virtuales (enlaces de videoconferencia) y notas de texto asociadas.
- **Personalización de Interfaz:** Diseño responsivo premium optimizado para diferentes resoluciones de pantalla.

## 4. Alcance técnico
Para la consecución del proyecto se construirán los siguientes componentes técnicos:
- **Frontend:** Interfaz de usuario de tipo Single Page Application (SPA) desarrollada con HTML5, CSS3 (Vanilla CSS) y JavaScript nativo.
- **Backend:** Lógica de negocio basada en FastAPI (Python) y SQLAlchemy (ORM) para procesar peticiones y reglas de negocio.
- **Base de Datos:** Modelo relacional (PostgreSQL en Neon DB) para asegurar la integridad de las relaciones entre tareas, usuarios y eventos de calendario.
- **Sistema de Autenticación:** Implementación de inicio de sesión seguro, verificación de email mediante código de 6 dígitos y gestión de perfiles de usuario con avatares.
- **Servicio de Notificaciones:** Sistema interno de notificaciones y alertas en la interfaz para tareas y reuniones.

## 5. Fuera de alcance
En esta fase inicial del proyecto semestral, **no** se desarrollarán los siguientes elementos:
- Integración nativa con APIs de terceros (Sincronización bidireccional con Google Calendar u Outlook).
- Desarrollo de aplicaciones móviles nativas (Android/iOS); el enfoque será Web Responsive.
- Procesamiento de pagos o suscripciones.
- Inteligencia Artificial para la auto-programación de tareas.

## 6. Criterios de éxito
Para considerar el proyecto como finalizado con éxito, se deberán cumplir los siguientes puntos:
- **Funcionalidad Operativa:** El núcleo del sistema (tareas, calendario y reuniones) debe funcionar sin errores críticos de lógica.
- **Documentación Consistente:** Entrega de manuales técnicos, de usuario y diagramas de arquitectura actualizados.
- **Pruebas Mínimas Completadas:** Ejecución exitosa de pruebas unitarias y de integración para las funciones principales.
- **Uso de Rules y Agents Definido:** Implementación de reglas de negocio claras para la validación de choques de horarios y roles de usuario definidos.