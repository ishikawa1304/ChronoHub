# Planteamiento del Proyecto: ChronoHub

## 1. Título del proyecto
**ChronoHub: Ecosistema Integrado de Gestión de Tiempo y Productividad Personal.**

## 2. Descripción del problema
En la actualidad, los usuarios sufren de **fragmentación de herramientas**. Para organizar un solo día, una persona promedio debe saltar entre una aplicación de notas, un calendario digital y un gestor de tareas independiente. Esta dispersión causa una pérdida de contexto, falta de visibilidad sobre la carga de trabajo real y aumenta la fricción cognitiva, lo que deriva en tareas olvidadas y reuniones solapadas. El problema afecta especialmente a estudiantes y profesionales que operan en entornos multimodales (presencial y virtual).

## 3. Justificación
* **Académica:** El proyecto permite aplicar patrones de diseño de software, gestión de bases de datos relacionales y principios de arquitectura orientada a servicios (SOA).
* **Técnica:** La implementación de una interfaz *responsive* con sincronización en tiempo real y manejo de estados complejos representa un reto de ingeniería de frontend y backend significativo.
* **Práctica:** Centralizar la gestión de vida diaria en una sola "fuente de verdad" reduce el estrés del usuario y optimiza el uso del recurso más valioso: el tiempo.

## 4. Público objetivo
* **Tipo de usuario:** Estudiantes universitarios y profesionales independientes (freelancers).
* **Necesidades:** Visualizar plazos académicos/entregas, bloquear tiempos de estudio y coordinar sesiones grupales.
* **Limitaciones:** Usuarios con poco tiempo para configuraciones complejas; requieren una curva de aprendizaje casi nula.
* **Contexto de uso:** Principalmente desde navegadores de escritorio durante el trabajo/estudio, y consultas rápidas en dispositivos móviles.

## 5. Idea general de la solución
ChronoHub propone una **plataforma centralizada** que unifica la gestión de tareas por prioridad con una visualización de horario semanal interactivo que lista y filtra eventos día a día. La solución integra un módulo de reuniones que permite añadir enlaces virtuales y notas de texto detalladas, facilitando la centralización de la agenda personal sin necesidad de recurrir a herramientas externas. Todo bajo una arquitectura moderna que garantiza fluidez y accesibilidad.

## 6. Alcance inicial del proyecto
Para esta versión de ciclo semestral, el sistema cubrirá:
* Módulo de autenticación de usuarios.
* CRUD completo de tareas con sistema de priorización.
* Visualización de horario semanal interactivo.
* Gestión básica de reuniones (creación y enlace virtual).
* Persistencia de datos en base de datos centralizada.
* Interfaz responsiva con diseño premium.

## 7. Restricciones
* **Temporales:** El desarrollo debe completarse dentro del cronograma del semestre académico vigente.
* **Tecnológicas:** Uso de herramientas estandarizadas y limitaciones de hosting gratuito para el despliegue.
* **Normativas:** Cumplimiento con estándares básicos de accesibilidad web (WCAG).

## 8. Riesgos iniciales
* **Curva de aprendizaje:** El tiempo invertido en dominar nuevos frameworks o librerías de calendario podría retrasar el desarrollo del backend.
* **Alcance excesivo (Scope Creep):** Intentar implementar sincronizaciones con APIs externas (Google/Outlook) antes de tener el núcleo estable.
* **Integridad de datos:** Riesgo de conflictos de horarios en la base de datos si no se implementa una lógica de validación estricta.