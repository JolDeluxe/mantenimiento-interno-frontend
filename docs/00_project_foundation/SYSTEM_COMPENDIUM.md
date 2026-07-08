# SYSTEM COMPENDIUM

## ARCHITECTURE OVERVIEW

### Path: backend/
* **Thin Frontend / Fat Backend**: Backend (Bun + Express + Prisma ORM + MySQL) holds 100% of business logic; Frontend (React 19 + JS ES6+) acts as a declarative rendering client.
* **Server-Driven Flags**: Dynamic states (`isOverdue`, `isLate`, `perteneceAHoy`) calculated at DTO level in [helper.ts](file:///C:/App/Joel/04_Proyecto_Mantenimiento/backend/src/modules/tickets/helper.ts) instead of DB persistence or UI logic.
* **Single Huso Horario**: Enforcement of `America/Mexico_City` timezone globally. All DB range calculations, date filters, and comparison tasks occur relative to Mexico City local time.
* **RBAC Security**: Access restricted dynamically by roles (`SUPER_ADMIN`, `JEFE_MTTO`, `COORDINADOR_MTTO`, `TECNICO`, `CLIENTE_INTERNO`) using authentication middlewares.

### Path: mantenimiento-interno-frontend/
* **JavaScript Client**: Frontend uses pure JS ES6+ (no TypeScript) for rapid Vite-based bundling.
* **Declarative Badges**: Renders task priority and status colors cleanly mapping backend DTO properties directly.
* **Offline Synchronization**: Implements CustomEvent `cuadra-sync-complete` to reload local state when offline mutation queue finishes syncing.
* **Liquid Glass Theme**: Styled using backdrop filters and responsive mobile fabs adapting dynamically using z-indices.
* **Hoy Module Feature Split**: Separated `src/features/hoy/components/` into `hoy-actividades/` and `hoy-mantenimientos/`:
  * `hoy-actividades`: General task views without machinery context or dynamic criticality background highlighting.
  * `hoy-mantenimientos`: Tailored views for machinery tasks. Includes a dedicated table column for "Máquina" showing only the internal code and a clean, borderless pill badge for criticidad (`Crit. A/B/C`). The machine name is omitted to prevent horizontal truncation in mobile cards and table headers.
  * **Dynamic Highlighting**: Table rows and card backgrounds display criticality colors (red for `A`, amber for `B`, slate for `C`) exclusively when the task type is a breakdown report (`TICKET`). Scheduled/extraordinary tasks remain neutral.
  * **Classification Colors**: Corrective = red (`text-red-700 font-semibold`, `report_problem` icon); Preventivo = blue (`text-blue-700 font-semibold`, `build_circle` icon); Autónomo/others = neutral slate.
  * **Sorting Rule**: Sorts daily list sequentially: Reportes (`TICKET`) -> Planeadas (`PLANEADA`) -> Extraordinarias (`EXTRAORDINARIA`), sub-ordered by machine criticality (`A` > `B` > `C` > none), and finally by ID descending.

---

## WORKFLOW LOGIC

### Path: backend/src/modules/tickets/create
* **Ticket Request Generation**: Initialized via [create_cliente.ts](file:///C:/App/Joel/04_Proyecto_Mantenimiento/backend/src/modules/tickets/create/create_cliente.ts) or `create_admin.ts`.
* **TPM Flag Exemption**: If `esMantenimientoAutonomo === true`, the ticket status starts directly as `RESUELTO`, classification defaults to `AUTONOMO`, priority defaults to `BAJA`, and it bypasses technical backlogs.
* **Snapshot Location**: In [create_cliente.ts](file:///C:/App/Joel/04_Proyecto_Mantenimiento/backend/src/modules/tickets/create/create_cliente.ts#L32-L42), if `maquinaId` is specified, `planta` and `area` are fetched from `Maquina` DB model, overriding whatever details the frontend client sends.

### Path: backend/src/modules/tickets/05_status.ts
* **Transition Validation**: State progression checked against strict map via [isValidTransition](file:///C:/App/Joel/04_Proyecto_Mantenimiento/backend/src/modules/tickets/helper.ts#L193).
* **Automatic Closing Interlock**: Tickets categorized under `INSPECCION` that get transitioned to `RESUELTO` are automatically promoted to `CERRADO` by the server.
* **Active Timing Intervals**: Change to `EN_PROGRESO` creates a new open record in `IntervaloTiempo` table. Transition away from `EN_PROGRESO` closes the open interval, computing duration in minutes and incrementing ticket `duracionReal`.
* **Manual Time Logs**: If `registroTiempoManual` is sent, it allows modifying the completion time (`finManual`) and overrides the accumulated minutes in `duracionReal`.
* **Machine Interlock Control**: Machine status is updated to `EN_REPARACION` if ticket is in `EN_PROGRESO`/`RECHAZADO` state and has `paroProduccion === true`. Reverts back to `OPERATIVA` once all active tickets with `paroProduccion === true` for that machine reach `RESUELTO` or `CERRADO`.

### Path: backend/src/modules/tickets/automations.ts
* **Cron Cierre Automático (01:00 AM)**: Automatically closes resolved tickets (`RESUELTO` -> `CERRADO`) after 2 days of inactivity.
* **Cron Auto-Pausa and Trim (19:00 Mon-Sat)**: Automatically shifts active tickets (`EN_PROGRESO` -> `EN_PAUSA`). Trim logic truncates interval durations to the end of official shifts (17:30 weekdays, 14:00 Saturdays) to prevent "ghost time" logs, or trims duration to zero if started after official shift hours.

---

## KEY DEPENDENCIES

### Path: mantenimiento-interno-frontend/src/lib/axios.js
* **Offline Request Interception**: Intercepts network failure errors, serializes `FormData` structures, and pushes queries to the local `CuadraSyncDB` in IndexedDB store `failed_requests`.
* **Secuential Queue Sync**: When connection is restored, processes cursor queries sequentially. Deletes successfully updated actions or permanent HTTP errors. Pauses synchronization if network is still down.

### Path: mantenimiento-interno-frontend/src/lib/idb.js
* **Local PWA Caching**: Stores snapshot cache of requests (`tickets`, `tecnicos`, `perfil`, `notificaciones`, `metricas`) under `CuadraPWA` IndexedDB to hydrate the UI immediately. Uses `STALE_TIME` variables to identify stale records.

### Path: mantenimiento-interno-frontend/src/lib/date-format.js
* **Timezone Lock Interface**: Centralizes date formatting exclusively using `America/Mexico_City`. Bypasses local client clock logic.
* **Normalizer**: Functions like `fechaInputToISOLocal()` force inputs to noon UTC (`T12:00:00.000Z`) to prevent date shifting in MySQL database representation.

### Path: mantenimiento-interno-frontend/src/utils/format.js
* **Corporate ID prefixing**: Extends ticket identification in the UI by mapping prefix codes by task type (`TICKET` -> `TK-`, `PLANEADA` -> `PL-`, `EXTRAORDINARIA` -> `EXT-`).

### Path: mantenimiento-interno-frontend/src/utils/hard-reload.js
* **Service Worker Purge**: Force-updates client assets by clearing service worker waiting registrations, deleting browser cache stores, and reloading window.

---

## DATA MAP

### Path: backend/prisma/schema.prisma
* **Restrict Rules**:
  * `creadorId` on `Tarea` -> `onDelete: Restrict`.
  * `usuarioId` on `HistorialTarea` -> `onDelete: Restrict`.
  * Prevents deleting any user that has created a ticket or participated in its history.
* **Cascade Rules**:
  * `HistorialTarea` -> `onDelete: Cascade`.
  * `IntervaloTiempo` -> `onDelete: Cascade`.
  * Cascades removal of child records if their parent `Tarea` is deleted.
* **SetNull Rules**:
  * `departamentoId` on `Usuario` -> `onDelete: SetNull`.
  * `departamentoId` on `Tarea` -> `onDelete: SetNull`.
  * Deleting a department clears the foreign key references on associated records instead of blocking or deleting.
* **DB Performance Indexes**:
  * `@@index([departamentoId, estado])`
  * `@@index([creadorId, createdAt])`
  * `@@index([maquinaId, estado])`
  * Accelerates dashboard aggregation and list queries.
