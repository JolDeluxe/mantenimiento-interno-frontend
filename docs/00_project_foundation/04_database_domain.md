# DOMINIO DE BASE DE DATOS Y REGLAS DE NEGOCIO EN BD

El motor de base de datos MySQL (vía Prisma ORM) actúa como la salvaguarda final de integridad referencial e índices de desempeño.

---

## 1. Integridad Relacional y Eliminación Estricta

El archivo [schema.prisma](file:///C:/App/Joel/04_Proyecto_Mantenimiento/backend/prisma/schema.prisma) modela el comportamiento del sistema ante borrados:

* **Inmutabilidad Operativa (Auditoría Segura)**:
  * `creadorId` en `Tarea` ➔ `onDelete: Restrict`.
  * `usuarioId` en `HistorialTarea` ➔ `onDelete: Restrict`.
  * *Efecto*: Un usuario que haya creado un ticket o participado en la transición de un estado no puede ser borrado de la base de datos bajo ninguna circunstancia.
* **Huérfanos Controlados**:
  * `departamentoId` en `Usuario` y `Tarea` ➔ `onDelete: SetNull`.
  * Si se elimina un departamento, los usuarios e históricos de tareas vinculadas se conservan, quedando con el valor `null` temporal.
* **Borrados en Cascada (Limpieza Técnica)**:
  * `HistorialTarea` e `IntervaloTiempo` se eliminan automáticamente si su `Tarea` padre es eliminada (`onDelete: Cascade`).
  * Los tokens de sesión (`RefreshToken`, `PasswordResetToken`) y suscripciones push (`PushSubscription`) se limpian de inmediato al borrar un `Usuario` (`onDelete: Cascade`).

---

## 2. Coexistencia y Segmentación Operativa: Clientes vs Mantenimiento

Una de las decisiones arquitectónicas clave es que los **Reportes de Clientes Internos** y los **Tickets de Mantenimiento Interno** conviven en la misma tabla `Tarea` sin colisionar en los flujos de trabajo de los operarios técnicos.

### Estrategia de Aislamiento:
1. **Diferenciación por `TipoTarea`**:
   * Las solicitudes generadas por clientes se etiquetan forzosamente con `TipoTarea.TICKET` en [create_cliente.ts](file:///C:/App/Joel/04_Proyecto_Mantenimiento/backend/src/modules/tickets/create/create_cliente.ts#L73).
   * Los mantenimientos planificados por jefatura se etiquetan como `TipoTarea.PLANEADA`.
   * Los incidentes extraordinarios delegados por coordinación se etiquetan como `TipoTarea.EXTRAORDINARIA`.
2. **Diferenciación por `ClasificacionTarea`**:
   * Los clientes reportan fallas que entran como `ClasificacionTarea.CORRECTIVO` o, si ellos mismos las resolvieron en su estación mediante la cultura TPM, se registran como `ClasificacionTarea.AUTONOMO`.
   * El personal de mantenimiento genera preventivos etiquetados como `ClasificacionTarea.PREVENTIVO`.
3. **Filtros de Visibilidad por Rol**:
   * En la consulta de listado, el backend aplica condiciones invisibles para el frontend: un `Rol.CLIENTE_INTERNO` solo recibe tickets donde sea el creador (`where.creadorId = user.id`), aislando su historial por completo del backlog operativo general del taller.

---

## 3. Enums como Fuente de Verdad

Los Enums definidos en la base de datos controlan el flujo lúdico de la aplicación:
* **Roles**: `SUPER_ADMIN`, `JEFE_MTTO`, `COORDINADOR_MTTO`, `TECNICO`, `CLIENTE_INTERNO`.
* **Estados de Tarea**: `PENDIENTE`, `ASIGNADA`, `EN_PROGRESO`, `EN_PAUSA`, `RECHAZADO`, `RESUELTO`, `CERRADO`, `CANCELADA`.
* **Tipos de Tarea**: `TICKET`, `PLANEADA`, `EXTRAORDINARIA`.
* **Clasificación**: `PREVENTIVO`, `CORRECTIVO`, `AUTONOMO`.

---

## 4. Índices y Rendimiento Operativo
Para optimizar los tableros e históricos en producción, se implementan índices explícitos:
* **Búsquedas de UI**: Indices sobre `estado`, `departamentoId`, `creadorId`, `createdAt`, `titulo` y `tipo`.
* **Dashboards y KPIs**: Índices compuestos de alto rendimiento:
  * `@@index([departamentoId, estado])`
  * `@@index([creadorId, createdAt])`
  * `@@index([maquinaId, estado])`