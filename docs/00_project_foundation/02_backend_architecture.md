# ARQUITECTURA DEL BACKEND Y ESTÁNDARES TÉCNICOS

El backend del sistema de mantenimiento está construido sobre un diseño modular por dominios, implementando una arquitectura de capas enfocada en la robustez y rendimiento a nivel base de datos.

---

## 1. Estructura del Código Core

El backend se organiza en micro-dominios encapsulados dentro de `src/modules/`:
* `src/db/`: Instancia única (Singleton) de Prisma. Queda estrictamente prohibido instanciar Prisma en otros módulos.
* `src/routes/`: Declaración central de rutas Express y mapeo hacia los módulos.
* `src/modules/tickets/`: Dominio principal de tickets. Contiene:
  * [zod/index.ts](file:///C:/App/Joel/04_Proyecto_Mantenimiento/backend/src/modules/tickets/zod/index.ts): Esquemas estrictos de validación con `.strict()` y coerción.
  * [helper.ts](file:///C:/App/Joel/04_Proyecto_Mantenimiento/backend/src/modules/tickets/helper.ts): Abstracción lógica, filtros de Prisma e inyección de banderas temporales DTO.
  * `create/`: Lógica de creación aislada por roles (`create_admin.ts`, `create_cliente.ts`, `create_batch.ts`).
  * `01_list.ts` a `06_reschedule.ts`: Controladores secuenciales desacoplados por responsabilidades.

---

## 2. Abstracción de Filtros: `getTicketFilters`

La función `getTicketFilters` en [helper.ts](file:///C:/App/Joel/04_Proyecto_Mantenimiento/backend/src/modules/tickets/helper.ts#L22) centraliza la lógica de conversión de query params a cláusulas `where` de Prisma. 

### Características del Motor de Filtros:
* **Seguridad de Rol**: Restringe automáticamente los resultados si el usuario es `TECNICO` (solo ve sus asignaciones directas) o `CLIENTE_INTERNO` (solo ve tickets creados por él).
* **Filtros Temporales Estandarizados**:
  * `perteneceAHoy === true`: Mapea a base de datos la exclusión de estados terminales (`RESUELTO`, `CERRADO`, `CANCELADA`) y la inclusión de tareas cuya fecha de vencimiento sea hoy o anterior (atrasadas) O cuyo estado sea `RECHAZADO`.
  * `venceManana === true`: Limita la consulta a tareas activas cuya fecha de vencimiento esté dentro del rango del día de mañana en la Ciudad de México.
  * Las fechas límite son calculadas al vuelo en el servidor bajo la zona horaria `America/Mexico_City`, garantizando que no haya desfases de días provocados por la zona horaria del cliente.

---

## 3. Comportamiento Dual de Ordenamiento en `01_list.ts`

El listado de tickets en [01_list.ts](file:///C:/App/Joel/04_Proyecto_Mantenimiento/backend/src/modules/tickets/01_list.ts) implementa una estrategia híbrida de ordenamiento según el canal de consumo:

### A. Vista Operativa "HOY" (`perteneceAHoy === true`)
Cuando la petición proviene de la vista diaria, se ejecuta un **ordenamiento jerárquico operativo en memoria (RAM)** una vez inyectadas las banderas temporales. El orden estricto de arriba a abajo es:
1. **Rechazados**: Estados `RECHAZADO` primero.
2. **Atrasadas**: `isOverdue === true`, ordenadas internamente por prioridad (`CRITICA` ➔ `BAJA`).
3. **A tiempo**: Activas de hoy, ordenadas internamente por prioridad (`CRITICA` ➔ `BAJA`).
4. **Historial de creación**: Como criterio de desempate secundario, las de creación más reciente (`createdAt desc`).

### B. Vista de "Historial" (General / Filtros)
Cuando no es una petición del día actual, el ordenamiento es **nativo y delegado 100% a Base de Datos (Prisma `orderBy`)** usando las claves de ordenación provistas por el cliente (`sortConfig` de la tabla, ej. ordenar por fecha de vencimiento, prioridad, creador, etc.). Esto permite realizar paginación eficiente de bases de datos (`skip`/`take`) con miles de registros sin penalizaciones de rendimiento en memoria.

---

## 4. Patrón DTO y Estados Temporales Transitorios

Los atributos `isOverdue` (vencida), `isLate` (conclusión tardía) y `perteneceAHoy` son **estados transitorios calculados al vuelo**. 

### Razón del Diseño (No persistencia física):
1. **Dependencia del Tiempo**: Si una tarea vence el 26 de junio, a las 11:59 PM del 26 de junio no está vencida. Al primer segundo del 27 de junio, pasa a estar vencida. Guardar este estado físicamente en una columna de base de datos obligaría a correr jobs scheduler cada segundo para actualizar banderas.
2. **Consultas de Solo Lectura**: Calcular estas banderas al mapear la entidad hacia el DTO en `computeTicketTemporalState` asegura consistencia en tiempo real a costo computacional despreciable, protegiendo la integridad y normalización de la base de datos MySQL.