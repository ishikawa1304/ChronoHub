# Requerimientos No Funcionales - ChronoHub

Este documento establece las cualidades y restricciones técnicas que garantizan la calidad, eficiencia y sostenibilidad del sistema ChronoHub.

### RNF-001 — Usabilidad
- **Descripción:** La interfaz debe ser intuitiva, permitiendo que un usuario nuevo aprenda las funciones básicas (crear una tarea o evento) en menos de 3 minutos sin asistencia.
- **Criterios:** - Diseño responsivo que se adapte a dispositivos móviles, tablets y escritorio.
  - Implementación de un contraste de colores adecuado según las pautas WCAG (Web Content Accessibility Guidelines) para legibilidad.
  - Navegación coherente con un máximo de 3 clics para acceder a cualquier función principal.

### RNF-002 — Rendimiento
- **Descripción:** El sistema debe responder de manera ágil ante las interacciones del usuario para evitar la percepción de lentitud.
- **Criterios:**
  - El tiempo de carga inicial de la aplicación no debe superar los 3 segundos en condiciones normales de red.
  - Las operaciones de guardado y actualización (CRUD) deben procesarse y mostrar feedback visual en menos de 500ms.
  - Soporte de hasta 50 usuarios concurrentes sin degradación notable del servicio (ajustado a escala académica).

### RNF-003 — Seguridad
- **Descripción:** Protección de la integridad y privacidad de la información del usuario.
- **Criterios:**
  - Encriptación de contraseñas mediante algoritmos de hashing seguros (ej. BCrypt o Argon2).
  - Implementación de tokens de sesión (JWT) con tiempo de expiración definido para prevenir accesos no autorizados.
  - Validación de datos tanto en el cliente como en el servidor para prevenir ataques comunes como SQL Injection o XSS.

### RNF-004 — Disponibilidad
- **Descripción:** El sistema debe estar operativo la mayor parte del tiempo durante el periodo de evaluación y uso.
- **Criterios:**
  - Disponibilidad esperada del 99% durante las horas de actividad académica.
  - Implementación de mecanismos básicos de recuperación ante fallos del servidor para minimizar el tiempo de inactividad.

### RNF-005 — Mantenibilidad
- **Descripción:** El código y la infraestructura deben estar estructurados para facilitar correcciones o mejoras futuras.
- **Criterios:**
  - Código fuente siguiendo convenciones de estilo estandarizadas (ej. PEP 8 para Python, Clean Code para JS).
  - Documentación técnica actualizada que incluya diagramas de arquitectura y diccionarios de datos.
  - Modularidad en el desarrollo para permitir la actualización de componentes individuales sin afectar la estabilidad global del sistema.