# ESTÁNDARES TÉCNICOS Y REGLAS DE CODIFICACIÓN

Este documento formaliza los estándares obligatorios de desarrollo para asegurar la consistencia y mantenibilidad del monorepo.

---

## 1. División de Lenguajes y Entornos

* **Backend: TypeScript en Bun**
  * Toda la lógica de servidor, controladores, servicios y modelos relacionales se implementa en **TypeScript** estricto bajo el runtime de **Bun**.
  * Se prohíbe el uso de `any` para evitar la pérdida del tipado estático en la interacción con Prisma Client.
* **Frontend: JavaScript Estricto (React 19)**
  * Todo el código cliente se escribe en **JavaScript ES6+**.
  * **Queda estrictamente prohibido utilizar TypeScript en el frontend** (`mantenimiento-interno-frontend` y `mantenimiento-publico-frontend`) para agilizar el bundling de desarrollo de Vite.

---

## 2. Estándar de Oro: Manejo de Fechas y Zonas Horarias

Para prevenir desajustes por desfases horarios y garantizar consistencia de almacenamiento:
* **Huso Horario Único**: La aplicación opera exclusivamente bajo la zona horaria de la Ciudad de México (`America/Mexico_City`).
* **Estandarización del Frontend**:
  * **Único Origen de Formateo**: La única librería permitida para formatear y manipular fechas en las vistas de React es [@/lib/date-format.js](file:///C:/App/Joel/04_Proyecto_Mantenimiento/mantenimiento-interno-frontend/src/lib/date-format.js).
  * **Prohibición de Duplicidad**: Queda estrictamente prohibido crear o importar utilidades alternativas de fechas como `utils/date-format.js`, `utils/date.js` o librerías externas pesadas (moment, date-fns) si no es a través del archivo centralizado.
  * **Uso Obligatorio de `fechaInputToISOLocal()`**: Al enviar un input tipo fecha desde formularios hacia la API, se debe sanitizar mediante `fechaInputToISOLocal()` para que viaje como cadena normalizada a mediodía UTC (`T12:00:00.000Z`), previniendo desvíos de día al guardar en MySQL.
* **Validación en Backend**:
  * Todas las comparaciones lógicas de inicio/fin de día se calculan dinámicamente en el servidor en base a la hora actual local en CDMX, proyectando los rangos correspondientes a UTC para la ejecución de queries en Prisma.

---

## 3. Validación y Middleware Zod Centralizado

* **Esquemas Estrictos (`.strict()`)**: Todos los esquemas de validación Zod en el backend deben rechazar peticiones que contengan propiedades adicionales no definidas en el contrato.
* **Gestión de Errores ZodError**: El middleware de validación procesa las discrepancias de datos y responde al cliente de manera estructurada con un código **HTTP 400 Bad Request**, evitando la inyección de excepciones no controladas hacia el cliente.
