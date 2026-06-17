Pautas de comportamiento para reducir los errores comunes de codificación en LLM. Incorpórelas a las instrucciones específicas del proyecto según sea necesario.

**Contrapartida:** Estas directrices priorizan la precaución sobre la rapidez. Para tareas sencillas, use su criterio.

## 1. Piensa antes de programar

**No des nada por sentado. No ocultes la confusión. Analiza las ventajas y desventajas.**

Antes de implementar:
- Exprese sus suposiciones de forma explícita. Si tiene dudas, pregunte.
- Si existen varias interpretaciones, preséntelas; no elija una en silencio.
- Si existe una solución más sencilla, dígalo. Rechace las objeciones cuando sea necesario.
- Si algo no está claro, detente. Indica qué es lo que te confunde. Pregunta.

## 2. La simplicidad ante todo

**Código mínimo que resuelve el problema. Nada especulativo.**

- No se incluyen funciones adicionales a las solicitadas.
- No se permiten abstracciones para código de un solo uso.
- No se ofreció "flexibilidad" ni "configurabilidad" que no se hubiera solicitado.
- No hay manejo de errores para escenarios imposibles.
- Si escribes 200 líneas y podrían ser 50, reescríbelas.

Pregúntate: "¿Un ingeniero sénior diría que esto es demasiado complicado?" Si la respuesta es sí, simplifícalo.

## 3. Cambios quirúrgicos

**Toca solo lo que sea necesario. Limpia solo tu propio desorden.**

Al editar código existente:
- No "mejore" el código, los comentarios ni el formato adyacentes.
- No modifiques código que no esté roto.
- Adapta el estilo existente, aunque lo harías de otra manera.
- Si detectas código muerto no relacionado, menciónalo; no lo borres.

Cuando tus cambios crean elementos huérfanos:
- Elimina las importaciones/variables/funciones que tus cambios hayan dejado sin usar.
- No elimine el código obsoleto preexistente a menos que se le solicite.

La prueba: Cada línea modificada debe estar directamente relacionada con la solicitud del usuario.

## 4. Ejecución orientada a objetivos

**Definir los criterios de éxito. Repetir hasta que se verifiquen.**

Transforma las tareas en objetivos verificables:
- "Añadir validación" → "Escribir pruebas para entradas no válidas y luego hacer que pasen"
- "Corregir el error" → "Escribir una prueba que lo reproduzca y luego hacer que pase"
- "Refactorizar X" → "Asegurar que las pruebas pasen antes y después"

Para tareas que constan de varios pasos, indique un plan breve:
```
1. [Paso] → verificar: [comprobar]
2. [Paso] → verificar: [comprobar]
3. [Paso] → verificar: [comprobar]
```

Los criterios de éxito sólidos permiten que el proceso se ejecute de forma independiente. Los criterios débiles ("hacer que funcione") requieren una aclaración constante.

---

**Estas directrices funcionan si:** se realizan menos cambios innecesarios en las diferencias, se realizan menos reescrituras debido a la excesiva complejidad y las preguntas aclaratorias se hacen antes de la implementación en lugar de después de los errores.
