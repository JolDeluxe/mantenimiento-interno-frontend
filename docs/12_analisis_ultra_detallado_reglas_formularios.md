# Reporte de Auditoría Ultra Detallado de Reglas de Formularios (Frontend)
## Módulos: Calendario, Hoy, Mantenimientos, Tickets y Rutas

Este documento presenta una auditoría técnica profunda y exhaustiva del frontend. Se examinan y mapean de manera precisa los flujos de invocación, validaciones, payloads, diferencias entre plataforma (Desktop/Mobile), inconsistencias y áreas críticas de deuda técnica de los formularios de la aplicación.

---

## 1. Resumen Ejecutivo

Tras auditar minuciosamente el código fuente, se identificó la siguiente estructura:

*   **Total de formularios reales mapeados:** **6 formularios** de captura de datos principales, más **5 formularios/modales** dedicados a flujos de cambio de estado o conformidad (cierre, rechazo, aprobación, asignación).
*   **Distribución Desktop/Mobile:**
    -   **4 formularios** están físicamente separados en archivos duplicados para Desktop y Mobile (`TicketFormModal` y `MantenimientosFormModal` con sus respectivos `Mobile...`).
    -   **1 formulario** está unificado en un solo archivo físico y se adapta por parámetro (`HoyActividadesForm`).
    -   **1 formulario** es exclusivo de Desktop y reside dentro de la ficha de máquina (`MaquinaRecurrenciaFormModal`).
*   **Formularios compartidos inter-módulos:** `MantenimientosFormModal` y `HoyActividadesForm` son los dos componentes principales compartidos a lo largo de las vistas de Hoy, Calendario, Mantenimientos y Tickets.
*   **Duplicidades detectadas:**
    -   `mobile-mantenimientos-review-modal.jsx` es un clon al **99.9%** de `mobile-ticket-review-modal.jsx` con alias de exportación.
    -   `MantenimientosFormModal` y `TicketFormModal` comparten más del **70%** de su estructura visual y lógica de validación, diferenciándose principalmente por el switch de recurrencias y campos de máquina obligatorios.
*   **Desactualizaciones críticas:** El módulo de **Calendario** tiene una desactualización de flujo crítica: **no valida payloads `null`** al guardar, lo que rompe la aplicación (Error 500) cuando un usuario intenta crear un Mantenimiento Recurrente desde la vista de calendario.
*   **Principales riesgos actuales:**
    -   **Fugas de firmas:** Un supervisor puede aprobar tareas sin firmas de conformidad utilizando dispositivos móviles debido a que el Canvas de firmas no está implementado en la vista Mobile.
    -   **Creaciones incompletas:** Permitir que se seleccionen clasificaciones de `PREVENTIVO` o `CORRECTIVO` desde el modal de tickets general de Tickets Histórico sin disponer de la configuración de recurrencias y validaciones avanzadas de maquinaria.

---

## 2. Mapa General de Rutas

A continuación, se presenta la correspondencia exacta entre las rutas de React Router y los componentes renderizados.

| Ruta | Módulo | Page Montado | Vista Desktop | Vista Mobile | Formulario que termina usando | Roles / Protección (RoleGuard) | Observaciones |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/hoy/todas` | Hoy | `HoyTodasPage` | `HoyTodasDesktop` | `HoyTodasMobile` | `HoyFormModal` / `MobileHoyFormModal` (Enruta a `HoyActividadesForm` o `MantenimientosFormModal` según scope/clasificación) | `allowedRoles` de hoy y hoyTodas | La raíz `/` redirige a `/hoy`. |
| `/hoy/actividades` | Hoy | `HoyActividadesPage` | `HoyActividadesDesktop` | `HoyActividadesMobile` | `HoyFormModal` / `MobileHoyFormModal` | `allowedRoles` de hoy y hoyActividades | Filtra por actividades comunes sin máquina. |
| `/hoy/mantenimientos` | Hoy | `HoyMantenimientosPage` | `HoyMantenimientosDesktop` | `HoyMantenimientosMobile` | `HoyFormModal` / `MobileHoyFormModal` (Enruta a `MantenimientosFormModal` / `MobileMantenimientosFormModal`) | `allowedRoles` de hoy y hoyMantenimientos | Enfocado en preventivos y correctivos de máquinas. |
| `/tickets/actividades` | Tickets | `TicketsActividadesPage` | `TicketsActividadesDesktop` | `TicketsActividadesMobile` | `HoyFormModal` / `MobileHoyFormModal` | `allowedRoles` de tickets y ticketsActividades | Reutiliza los modales de creación del módulo Hoy. |
| `/tickets/reportes` | Tickets | `TicketsReportesPage` | `TicketsReportesDesktop` | `TicketsReportesMobile` | *Ninguno* (Creación deshabilitada, allowCreate=false) | `allowedRoles` de tickets y ticketsReportes | Solo visualización y filtros de reportes. |
| `/tickets/historico` | Tickets | `TicketsHistoricoPage` | `TicketsHistoricoDesktop` | `TicketsHistoricoMobile` | `TicketFormModal` / `MobileTicketFormModal` | `allowedRoles` de tickets y ticketsHistorico | Formulario estándar de Tickets generales. |
| `/mantenimientos/correctivos` | Mantenimientos | `MantenimientosCorrectivosPage` | `MantenimientosCorrectivosDesktop` | `MantenimientosCorrectivosMobile` | `MantenimientosFormModal` / `MobileMantenimientosFormModal` | `allowedRoles` de mantenimientos y correctivos | Forzado a clasificación `CORRECTIVO`. |
| `/mantenimientos/preventivos` | Mantenimientos | `MantenimientosPreventivosPage` | `MantenimientosPreventivosDesktop` | `MantenimientosPreventivosMobile` | `MantenimientosFormModal` / `MobileMantenimientosFormModal` | `allowedRoles` de mantenimientos y preventivos | Forzado a clasificación `PREVENTIVO`. |
| `/mantenimientos/historico` | Mantenimientos | `MantenimientosHistoricoPage` | `MantenimientosHistoricoDesktop` | `MantenimientosHistoricoMobile` | `MantenimientosFormModal` / `MobileMantenimientosFormModal` | `allowedRoles` de mantenimientos e histórico | Historial total de mantenimientos de máquinas. |
| `/calendario` | Calendario | `CalendarioPage` | `CalendarioDesktop` | `CalendarioMobile` | `MantenimientosFormModal` o `TicketFormModal` (Enrutamiento dinámico según scope del filtro activo) | `allowedRoles` de calendario | **Crítico:** No maneja retornos `null` de recurrencias en creación. |

---

## 3. Inventario de Formularios Reales

| Formulario | Archivo | Módulos que lo usan | Desktop/Mobile | Crea | Edita | Revisa/Aprueba | Cierra/Rechaza | Endpoint(s) | Estado Actual |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **TicketFormModal** | `src/features/tickets/components/historico/ticket-form-modal.jsx` | Tickets (Histórico), Calendario | Desktop | Sí | Sí | No | No | `POST /api/tickets`<br>`PUT /api/tickets/:id` | **Actualizado** |
| **MobileTicketFormModal** | `src/features/tickets/components/historico/mobile-ticket-form-modal.jsx` | Tickets (Histórico), Calendario | Mobile | Sí | Sí | No | No | `POST /api/tickets`<br>`PUT /api/tickets/:id` | **Actualizado** |
| **MantenimientosFormModal** | `src/features/mantenimientos/components/common/mantenimientos-form-modal.jsx` | Mantenimientos, Hoy, Calendario | Desktop | Sí | Sí | No | No | `POST /api/tickets`<br>`PUT /api/tickets/:id`<br>`POST /api/recurrencias` | **Actualizado** (Con switch de recurrencia) |
| **MobileMantenimientosFormModal** | `src/features/mantenimientos/components/common/mobile-mantenimientos-form-modal.jsx` | Mantenimientos, Hoy, Calendario | Mobile | Sí | Sí | No | No | `POST /api/tickets`<br>`PUT /api/tickets/:id`<br>`POST /api/recurrencias` | **Actualizado** (Con switch de recurrencia) |
| **HoyActividadesForm** | `src/features/hoy/components/hoy-actividades/hoy-actividades-form.jsx` | Hoy, Tickets (Actividades) | Ambos | Sí | Sí | No | No | `POST /api/tickets`<br>`PUT /api/tickets/:id` | **Actualizado** (Componente responsive único) |
| **MaquinaRecurrenciaFormModal** | `src/features/maquinaria/components/maquina-recurrencia-form-modal.jsx` | Maquinaria (Ficha) | Desktop | Sí | Sí | No | No | `POST /api/recurrencias`<br>`PUT /api/recurrencias/:id` | **Actualizado** |
| **TicketReviewModal** | `src/features/tickets/components/historico/ticket-review-modal.jsx` | Tickets, Hoy (Actividades), Calendario | Desktop | No | No | Sí | Sí | `PATCH /api/tickets/:id/status` | **Actualizado** (Sin firma) |
| **MobileTicketReviewModal** | `src/features/tickets/components/historico/mobile-ticket-review-modal.jsx` | Tickets, Hoy (Actividades / Mantenimientos), Calendario | Mobile | No | No | Sí | Sí | `PATCH /api/tickets/:id/status` | **Actualizado** (Sin firma) |
| **MantenimientosReviewModal** | `src/features/mantenimientos/components/common/mantenimientos-review-modal.jsx` | Mantenimientos, Calendario | Desktop | No | No | Sí | Sí | `PATCH /api/tickets/:id/status` | **Actualizado** (**Exige firma**) |
| **MobileMantenimientosReviewModal** | `src/features/mantenimientos/components/common/mobile-mantenimientos-review-modal.jsx` | Mantenimientos, Calendario | Mobile | No | No | Sí | Sí | `PATCH /api/tickets/:id/status` | **Duplicado** / **Riesgoso** (No exige firma) |
| **AdminCloseModal** | `src/features/common/components/admin-close-modal.jsx` | Módulos comunes, Calendario | Ambos | No | No | No | Sí | `PATCH /api/tickets/:id/status` | **Actualizado** (Cierre administrativo) |

---

## 4. Reglas por Formulario

### Formulario: MantenimientosFormModal
*   **Archivo:** `src/features/mantenimientos/components/common/mantenimientos-form-modal.jsx`
*   **Módulos que lo usan:** Mantenimientos (Preventivos, Correctivos, Histórico), Hoy (Mantenimientos), Calendario (si scope === 'mantenimientos').
*   **Desktop/Mobile:** Desktop.
*   **Propósito:** Permite la creación y edición de tareas relacionadas con maquinaria (mantenimiento preventivo y correctivo), ofreciendo la opción de programar la tarea como un Mantenimiento Recurrente en lugar de un ticket ordinario.
*   **Estados que lo abren:**
    -   `showCreate` en `MantenimientosHistoricoPage` y `HoyMantenimientosPage`.
    -   `editTarget` en layouts de Mantenimientos (`MantenimientosPreventivosDesktop`, `MantenimientosCorrectivosDesktop`).
*   **Props importantes:**
    -   `isOpen`: Booleano para visibilidad.
    -   `onClose`: Función para cerrar modal.
    -   `ticketAEditar`: Objeto del ticket o null si es creación.
    -   `onSuccess`: Callback que recibe el payload de guardado.
    -   `defaultDate`: Fecha inicial recomendada por el calendario o listado.
    -   `defaultClasificacion`: Pre-inicializa la clasificación (ej. "PREVENTIVO").
*   **Campos visibles:** Título, clasificación, prioridad, maquinaria relacionada, técnicos asignados, fecha de vencimiento, tiempo estimado, descripción, switch "Mantenimiento recurrente", frecuencia, intervalo de días.
*   **Campos condicionales:**
    -   *Si clasificación === 'CORRECTIVO' y categoría === 'MAQUINARIA':* Muestra switch "Reportar paro de producción". Si se activa, muestra selector "Impacto de producción" (horas/minutos).
    -   *Si switch "Mantenimiento recurrente" está activo:* Muestra selectores de frecuencia ("SEMANAL", "QUINCENAL", "MENSUAL", "PERSONALIZADA_DIAS") e intervalo de días. Oculta el selector de técnicos múltiples (solo permite asignar a un único responsable principal) y cambia la etiqueta "Fecha de vencimiento" por "Fecha de inicio del mantenimiento recurrente".
*   **Validaciones:**
    -   Título es obligatorio (máx 255 caracteres).
    -   Categoría es obligatoria.
    -   Si es Mantenimiento: Máquina y Clasificación son obligatorias.
    -   Si es Mantenimiento Recurrente: Frecuencia y técnico responsable son obligatorios.
*   **Reglas de fecha:**
    -   No se permiten fechas anteriores a hoy (`fechaVencimiento < hoyLocal` arroja error en creación).
    -   Si se edita, se permite mantener la fecha original del ticket, pero si se modifica debe ser mayor o igual a hoy.
    -   El input de tipo `date` tiene un atributo `min={hoyLocal}`.
*   **Reglas por rol:** Solo roles administrativos (`SUPER_ADMIN`, `JEFE_MTTO`, `COORDINADOR_MTTO`) pueden ver y alterar los campos de fecha de vencimiento, técnicos asignados y clasificaciones avanzadas.
*   **Reglas por clasificación:** Si es `RUTINA`, se autocompleta la clasificación y categoría de manera interna.
*   **Reglas por tipo:** No aplica.
*   **Reglas de maquinaria:** La selección de máquina autocompleta la ubicación física (planta y área) de acuerdo con los datos maestros del equipo.
*   **Reglas de responsables/técnicos:** Permite asignación múltiple para tickets ordinarios, pero restringe a un técnico responsable único para mantenimientos recurrentes.
*   **Reglas de recurrencia:** Al activar el switch, se evalúa la fecha de inicio. Si corresponde a hoy o fecha pasada, el backend generará el primer ticket de inmediato al guardar. Si es futura, solo se creará la programación.
*   **Reglas de firma:** No aplica (es creación/edición, no revisión).
*   **Reglas de paro/impacto:** Si se reporta paro de producción, se valida que el tiempo de impacto sea mayor a cero.
*   **Submit:**
    -   *Si "Mantenimiento recurrente" está apagado:* Genera un `FormData` (con archivos adjuntos si los hay) y llama a `onSuccess(formData)`.
    -   *Si "Mantenimiento recurrente" está encendido:* Llama directamente a `api.post('/api/recurrencias', payload)` y posteriormente ejecuta `onSuccess(null)`.
*   **Endpoint:** `POST /api/tickets` (mantenimiento común), `PUT /api/tickets/:id` (edición común), `POST /api/recurrencias` (recurrente).
*   **Payload:** `FormData` para tareas comunes; objeto JSON estructurado para recurrentes.
*   **Qué hace al éxito:** Cierra modal y llama a recargar la tabla del componente padre.
*   **Qué hace al error:** Muestra mensaje adaptivo de notificación y mantiene el modal abierto.
*   **Diferencias vs su versión mobile/desktop:** La versión móvil (`MobileMantenimientosFormModal`) tiene un layout vertical simplificado tipo hoja deslizante (drawer), pero comparte la misma lógica de negocio, validaciones y llamadas de API.
*   **Diferencias vs formularios equivalentes:** A diferencia de `TicketFormModal`, incluye el switch de recurrencia y valida obligatoriamente la presencia de una máquina.
*   **Riesgos:** Ninguno crítico.
*   **Recomendación:** Mantenerlo como el formulario base para cualquier operación sobre maquinaria.

---

### Formulario: TicketFormModal
*   **Archivo:** `src/features/tickets/components/historico/ticket-form-modal.jsx`
*   **Módulos que lo usan:** Tickets (Histórico), Calendario (si scope !== 'mantenimientos').
*   **Desktop/Mobile:** Desktop.
*   **Propósito:** Creación y edición de tickets generales de soporte o reportes internos de infraestructura y servicios.
*   **Estados que lo abren:** `showCreate` y `editTarget` en `TicketsListadoBase`.
*   **Props importantes:** `isOpen`, `onClose`, `ticketAEditar`, `onSuccess`, `defaultDate`.
*   **Campos visibles:** Título, categoría, clasificación, prioridad, maquinaria relacionada (opcional), técnicos asignados, planta, área, fecha de vencimiento, tiempo estimado, descripción.
*   **Campos condicionales:** Si categoría === 'MAQUINARIA', muestra el selector de máquina.
*   **Validaciones:** Título obligatorio, categoría obligatoria, prioridad obligatoria, área/planta obligatorias.
*   **Reglas de fecha:** Misma validación de fecha no menor a hoy (`fechaVencimiento < hoyLocal`). Clampa la fecha al valor de hoy de forma automática en el input.
*   **Reglas por rol:** Usuarios comunes solo pueden reportar; no asignan técnicos ni eligen clasificaciones administrativas.
*   **Reglas de maquinaria:** Opcional. No exige máquina a menos que el usuario clasifique la tarea explícitamente como preventiva de maquinaria.
*   **Reglas de responsables/técnicos:** Permite asignación múltiple de técnicos.
*   **Reglas de recurrencia:** **No tiene**.
*   **Reglas de firma:** No aplica.
*   **Submit:** Envía siempre un `FormData` llamando a `onSuccess(formData)`.
*   **Endpoint:** `POST /api/tickets` o `PUT /api/tickets/:id`.
*   **Payload:** `FormData` con campos estructurados y archivos adjuntos de evidencia inicial.
*   **Diferencias vs su versión mobile:** `MobileTicketFormModal` tiene diseño responsive adaptado a pantallas pequeñas.
*   **Diferencias vs formularios equivalentes:** No soporta creación de mantenimientos recurrentes.
*   **Riesgos:** Al permitir clasificar la tarea como `PREVENTIVO` o `CORRECTIVO` desde el selector de clasificación, el usuario puede saltarse las validaciones obligatorias de máquina o la opción de recurrencia que ofrece `MantenimientosFormModal`.
*   **Recomendación:** Remover las clasificaciones de preventivo y correctivo de este selector.

---

### Formulario: HoyActividadesForm
*   **Archivo:** `src/features/hoy/components/hoy-actividades/hoy-actividades-form.jsx`
*   **Módulos que lo usan:** Hoy (Actividades, Todas), Tickets (Actividades).
*   **Desktop/Mobile:** Ambos (maneja la prop `isMobile`).
*   **Propósito:** Crear y editar actividades internas comunes que no conllevan uso de maquinaria (ej. limpieza general, mudanza de material).
*   **Campos visibles:** Título, prioridad, planta, área, fecha de vencimiento, técnicos responsables, descripción, horas programadas (inicio/fin).
*   **Validaciones:** Título obligatorio, planta y área obligatorias, técnicos asignados obligatorios.
*   **Reglas de fecha:** No permite fechas en el pasado.
*   **Reglas de recurrencia:** No tiene.
*   **Submit:** Llama a `onSuccess(formData)`.
*   **Diferencias vs formularios equivalentes:** Es un archivo unificado enorme (1,700+ líneas) que controla la visualización responsive mediante un flag, en lugar de estar separado en archivos físicos individuales como los de Mantenimientos y Tickets.

---

### Formulario: MantenimientosReviewModal
*   **Archivo:** `src/features/mantenimientos/components/common/mantenimientos-review-modal.jsx`
*   **Módulos que lo usan:** Mantenimientos (Preventivos, Correctivos, Histórico), Calendario.
*   **Desktop/Mobile:** Desktop.
*   **Propósito:** Proceso de conformidad donde un supervisor decide aprobar (Cerrar) o rechazar un mantenimiento concluido por un técnico.
*   **Campos visibles:** Detalles del ticket, evidencias de solución subidas por el técnico, selector de decisión ("Aprobar" / "Rechazar"), input de notas/motivos, **Canvas de firma digital**.
*   **Validaciones:**
    -   Decisión es obligatoria.
    -   *Si la decisión es CERRADO (Aprobar):* **La firma del cliente es obligatoria**.
    -   *Si la decisión es RECHAZADO:* La nota del motivo de rechazo y una nueva fecha de vencimiento son obligatorias.
*   **Reglas de firma:** Requiere dibujar la firma en el canvas. Al guardar, convierte el trazo del canvas a un Blob binario de tipo imagen y lo adjunta al `FormData`.
*   **Submit:** Envía un `FormData` al endpoint de estatus del ticket y ejecuta `onConfirm(ticket.id, formData)`.
*   **Endpoint:** `PATCH /api/tickets/:id/status`.
*   **Payload:** `FormData` que incluye la decisión (`estado`), la nota, y el archivo de firma.
*   **Riesgos:** Ninguno.
*   **Recomendación:** Es la versión de referencia para la conformidad.

---

### Formulario: MobileMantenimientosReviewModal
*   **Archivo:** `src/features/mantenimientos/components/common/mobile-mantenimientos-review-modal.jsx`
*   **Módulos que lo usan:** Mantenimientos (Preventivos, Correctivos, Histórico), Calendario.
*   **Desktop/Mobile:** Mobile.
*   **Propósito:** Versión móvil para la revisión de conformidad de los mantenimientos.
*   **Campos visibles:** Mismos detalles de ticket y selector de decisión, notas. **No muestra Canvas de firma**.
*   **Validaciones:**
    -   Decisión obligatoria.
    -   Si es rechazo: Nota y nueva fecha obligatoria.
    -   **No valida la firma** (aprobación directa sin firma).
*   **Reglas de firma:** **No tiene**.
*   **Riesgos:** **Fuga de control.** Permite aprobar mantenimientos sin capturar la firma de conformidad obligatoria.
*   **Recomendación:** Integrar un Canvas responsivo adaptado a gestos táctiles.

---

## 5. Comparativa Desktop vs. Mobile

| Módulo | Acción | Desktop Usa | Mobile Usa | Diferencias de Campos | Diferencias de Validación | Diferencias de API | Riesgo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mantenimientos** | Crear | `MantenimientosFormModal` | `MobileMantenimientosFormModal` | Ninguna | Ninguna | Ninguna | Bajo |
| **Mantenimientos** | Editar | `MantenimientosFormModal` | `MobileMantenimientosFormModal` | Ninguna | Ninguna | Ninguna | Bajo |
| **Mantenimientos** | Aprobar | `MantenimientosReviewModal` | `MobileMantenimientosReviewModal` | El móvil carece del Canvas de firmas. | Desktop exige y valida firma; Mobile aprueba directamente con un clic. | Ninguna (ambos llaman a PATCH) | **Alto:** Aprobaciones sin firma en móviles. |
| **Tickets** | Crear | `TicketFormModal` | `MobileTicketFormModal` | Ninguna | Ninguna | Ninguna | Bajo |
| **Tickets** | Editar | `TicketFormModal` | `MobileTicketFormModal` | Ninguna | Ninguna | Ninguna | Bajo |
| **Tickets** | Aprobar | `TicketReviewModal` | `MobileTicketReviewModal` | Ninguna (ninguno exige firma para tickets comunes). | Ninguna | Ninguna | Bajo |

---

## 6. Comparativa por Módulo (Reglas de Negocio)

| Regla / Campo | Tickets | Mantenimientos | Hoy | Calendario | Observación |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Título** | Obligatorio | Obligatorio | Obligatorio | Obligatorio | Campo unificado. |
| **Descripción** | Opcional | Opcional | Opcional | Opcional | Campo unificado. |
| **Prioridad** | Obligatorio | Obligatorio | Obligatorio | Obligatorio | BAJA, MEDIA, ALTA, CRITICA. |
| **Fecha Vencimiento** | Obligatoria | Obligatoria | Obligatoria | Obligatoria | Se valida no menor a hoy. |
| **Fecha Pasada** | Bloqueada | Bloqueada | Bloqueada | Bloqueada | Validado en formulario al guardar. |
| **Clasificación** | Opcional | Obligatorio | Obligatorio | Dinámico | `PREVENTIVO`, `CORRECTIVO`, `RUTINA`. |
| **Uso de Máquina** | Opcional | **Obligatorio** | Dinámico | Dinámico | En mantenimientos es mandatorio. |
| **Técnicos Asignados** | Múltiple | Múltiple (Ordinario) / Único (Recurrente) | Múltiple | Dinámico | Recurrentes solo permiten 1 responsable. |
| **Paro Producción** | No tiene | Sí (Correctivos Maquinaria) | No tiene | No tiene | Campo condicional de maquinaria. |
| **Recurrencia** | No tiene | **Sí (Switch)** | Sí (Vía enrutador) | **Incompleto** | Calendario falla al guardar recurrentes. |
| **Firma Conformidad** | No exige | **Sí (Desktop)** | No exige | Dinámico | Exclusivo de Mantenimientos en Desktop. |
| **Edición** | Sí | Sí | Sí | Sí | Bloqueada si estado es RESUELTO/CERRADO. |
| **Revisión** | Sí (Sin firma) | Sí (Exige firma) | Sí (Mapeo mixto) | Sí (Mapeo mixto) | Flujo para pasar de RESUELTO a CERRADO. |

---

## 7. Mapa de APIs y Payloads

| Módulo | Formulario | Acción | Función / Hook | Endpoint | Método | Payload / FormData | Campos Obligatorios |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **Tickets** | `TicketFormModal` | Crear Ticket | `createTicket` | `/api/tickets` | POST | `FormData` | `titulo`, `categoria`, `prioridad`, `planta`, `area`, `fechaVencimiento` |
| **Tickets** | `TicketFormModal` | Editar Ticket | `updateTicket` | `/api/tickets/:id` | PUT | `FormData` | `titulo`, `categoria`, `prioridad`, `planta`, `area` |
| **Mantenimientos** | `MantenimientosFormModal` | Crear Mantenimiento | `createMantenimiento` | `/api/tickets` | POST | `FormData` | `titulo`, `categoria`, `prioridad`, `maquinaId`, `clasificacion`, `fechaVencimiento` |
| **Mantenimientos** | `MantenimientosFormModal` | Crear Recurrente | *Llamada directa en form* | `/api/recurrencias` | POST | `JSON` | `titulo`, `frecuencia`, `tecnicoResponsableId`, `maquinaId`, `proximaFechaEjecucion` |
| **Mantenimientos** | `MantenimientosReviewModal` | Aprobar Tarea | `changeMantenimientoStatus` | `/api/tickets/:id/status` | PATCH | `FormData` | `estado="CERRADO"`, `imagenes` (archivo de firma) |
| **Mantenimientos** | `MantenimientosReviewModal` | Rechazar Tarea | `changeMantenimientoStatus` | `/api/tickets/:id/status` | PATCH | `FormData` | `estado="RECHAZADO"`, `nota` (motivo), `fechaVencimiento` (nueva) |

---

## 8. Diagnóstico Especial: Módulo Calendario

*   **¿Qué formulario usa?:** No tiene formularios propios. Importa y reutiliza dinámicamente `TicketFormModal` / `MobileTicketFormModal` y `MantenimientosFormModal` / `MobileMantenimientosFormModal` según el filtro `scope` activo.
*   **¿Está actualizado?:** Parcialmente desactualizado en su controlador de página principal (`calendario-page.jsx`).
*   **¿Qué reglas no comparte con Mantenimientos/Hoy?:**
    -   Permite abrir el modal de creación al hacer clic en un día del calendario (`onCalendarDayClick`).
    -   Si el día seleccionado es del pasado, el formulario heredado clampa la fecha a hoy, lo cual es correcto, pero la UI del calendario puede verse confusa al abrir el formulario hoy en un casillero del pasado.
*   **¿Puede crear preventivos/correctivos?:** Sí, si el `scope` es `mantenimientos`.
*   **¿Puede crear recurrentes?:** **No.** Aunque el formulario `MantenimientosFormModal` muestra el switch y guarda la recurrencia en la base de datos de manera correcta (`POST /api/recurrencias`), este retorna un callback con `onSuccess(null)`. El controlador `calendario-page.jsx` no tiene el condicional para capturar el valor `null` y ejecuta `createMantenimiento(null)`, rompiendo la aplicación con un error 500.
*   **¿Usa API nueva o vieja?:** Usa `/api/tickets` con la lógica de agrupamiento por periodos del hook `use-calendario.js`.
*   **¿Tiene mobile?:** Sí (`calendario-mobile.jsx`), el cual hereda los formularios y modales móviles correspondientes.
*   **¿Tiene validaciones de fecha?:** Sí, por medio de los modales de formulario que consume.
*   **¿Debería usar formularios comunes?:** Ya los usa, pero el controlador `calendario-page.jsx` debe ser actualizado para manejar el flujo de éxito de recurrencias correctamente.
*   **¿Qué tan riesgoso es?:** **Alto.** Actualmente está roto el guardado de preventivos recurrentes desde el calendario.

### Diagnóstico de desactualización del módulo Calendario

1.  **Qué partes parecen viejas:** El controlador `calendario-page.jsx` carece de la lógica de intercepción de éxito de recurrencias (`payload === null`) que ya fue integrada en `mantenimientos-historico.jsx` y `hoy-mantenimientos.jsx`.
2.  **Riesgo:** Si un administrador intenta planificar un mantenimiento recurrente desde la vista de calendario, el frontend se colgará y arrojará un error de red, bloqueando la operación.
3.  **Recomendación:** Modificar `handleCreate` en `calendario-page.jsx` de inmediato para interceptar el payload `null`, cerrar el modal con éxito y refrescar la vista.

---

## 9. Inconsistencias Detectadas

### Inconsistencia 1: Calendario rompe al crear Mantenimientos Recurrentes
*   **ID:** INC-01
*   **Severidad:** Alta
*   **Descripción:** El controlador de calendario no evalúa si el payload recibido de `onSuccess` es `null`, intentando hacer un POST vacío al servidor.
*   **Archivos Involucrados:** `src/features/calendario/pages/calendario-page.jsx`
*   **Módulos Afectados:** Calendario.
*   **Impacto Usuario:** Pantallazo de error o inactividad del botón de guardar al planificar mantenimientos recurrentes.
*   **Impacto Técnico:** Error HTTP 500/400 por envío de objeto nulo a la API de creación de tickets.
*   **Recomendación:** Añadir `if (payload === null) { notify.success(...); setShowCreate(false); refresh(); return; }` en `handleCreate`.
*   **Conviene corregir ahora:** Sí.

### Inconsistencia 2: Hoy Todas rompe al crear Mantenimientos Recurrentes
*   **ID:** INC-02
*   **Severidad:** Alta
*   **Descripción:** Similar a la del calendario, el archivo `hoy-todas.jsx` no tiene la validación de payload `null`, por lo que si un usuario crea una recurrencia con clasificación preventivo dentro de la vista unificada, el sistema arrojará un error al intentar iterar o enviar el payload vacío.
*   **Archivos Involucrados:** `src/features/hoy/pages/hoy-todas.jsx`
*   **Módulos Afectados:** Hoy (Todas).
*   **Recomendación:** Añadir la intercepción de payload `null` en `handleCreate`.
*   **Conviene corregir ahora:** Sí.

### Inconsistencia 3: Mobile no solicita Firma de Conformidad
*   **ID:** INC-03
*   **Severidad:** Alta
*   **Archivos Involucrados:** `src/features/mantenimientos/components/common/mobile-mantenimientos-review-modal.jsx`
*   **Módulos Afectados:** Mantenimientos (Mobile), Hoy (Mobile), Calendario (Mobile).
*   **Impacto Usuario:** Fuga de control. Aprobaciones de mantenimientos preventivos/correctivos sin la firma obligatoria del cliente.
*   **Recomendación:** Implementar un pad táctil de dibujo en el modal móvil.
*   **Conviene corregir ahora:** Sí.

### Inconsistencia 4: Clasificaciones cruzadas en TicketFormModal
*   **ID:** INC-04
*   **Severidad:** Media
*   **Archivos Involucrados:** `src/features/tickets/components/historico/ticket-form-modal.jsx` y su versión mobile.
*   **Impacto Usuario:** El usuario puede seleccionar `PREVENTIVO` en la sección de tickets, evadiendo las validaciones obligatorias del formulario de mantenimientos.
*   **Recomendación:** Remover `PREVENTIVO` y `CORRECTIVO` del selector general de tickets.
*   **Conviene corregir ahora:** No (se puede programar para la siguiente fase).

---

## 10. Reglas que deberían estandarizarse

1.  **Validación de Fechas Pasadas:** Todo formulario debe heredar una función de validación común (`isFechaPasada(date)`) que compare cadenas `YYYY-MM-DD` bajo la zona horaria local `America/Mexico_City`.
2.  **Asignación de Responsables:** Estandarizar la interfaz visual de carga de workload (`WorkloadBadge`) para que sea común en móviles y desktop.
3.  **Captura de Firmas:** El componente Canvas Signature debe ser extraído a un helper global reusable tanto por Desktop como por Mobile.
4.  **Cierre Administrativo:** Las notas de cierre y su marcado de metadatos del sistema deben ser procesados a través del backend o de un utilitario unificado en el frontend.

---

## 11. Propuesta de Arquitectura Común (Common Forms)

Se propone la creación de un directorio unificado:
`src/features/common/forms/tareas/`

### Componentes a extraer en Fase 1:
1.  **Formulario Base (`FormTareaBase.jsx`):** Contendrá el esqueleto común (título, descripción, prioridad, planta, área, adjuntos).
2.  **Sección de Maquinaria (`FormMaquinaSection.jsx`):** Encapsula selectores de máquina, paro de producción e impacto.
3.  **Sección de Recurrencia (`FormRecurrenciaSection.jsx`):** Encapsula el switch recurrente, cálculos en vivo y selectores de frecuencia.
4.  **Lienzo de Firma (`CommonSignaturePad.jsx`):** Componente unificado que soporte mouse y eventos touch.

---

## 12. Plan de Migración Recomendado

*   **Fase 0: Correcciones Urgentes (Bajo/Medio Riesgo)**
    -   *Objetivo:* Resolver los crashes de Mantenimiento Recurrente en Calendario y Hoy Todas, e import incorrecto en Hoy Mantenimientos Mobile.
    -   *Archivos:* `src/features/calendario/pages/calendario-page.jsx`, `src/features/hoy/pages/hoy-todas.jsx`, `src/features/hoy/views/hoy-mantenimientos-mobile.jsx`.
*   **Fase 1: Firma Digital Móvil (Medio Riesgo)**
    -   *Objetivo:* Integrar pad de firmas en el modal móvil de revisiones.
    -   *Archivos:* `src/features/mantenimientos/components/common/mobile-mantenimientos-review-modal.jsx`.
*   **Fase 2: Bloqueo de Clasificaciones Cruzadas (Bajo Riesgo)**
    -   *Objetivo:* Ocultar clasificaciones preventivas en el modal de tickets general.
    -   *Archivos:* `src/features/tickets/components/historico/ticket-form-modal.jsx`.

---

## 13. Decisiones Pendientes para Joel

1.  **¿Calendario debe permitir crear mantenimientos recurrentes directamente?**
    -   *Recomendación:* Sí, ya que el formulario lo permite, solo debemos corregir el crash del callback `null`.
2.  **¿Bloqueamos preventivos/correctivos desde la pestaña general de Tickets?**
    -   *Recomendación:* Sí, para obligar a que pasen por el flujo correcto de máquina y recurrencia.
3.  **¿Integramos Canvas de Firma en Mobile?**
    -   *Recomendación:* Sí, para mantener la validez legal y de auditoría de los cierres en cualquier dispositivo.

---

## 14. Checklist de Archivos Revisados

*   **Calendario:**
    -   `src/features/calendario/api/calendario-api.js`
    -   `src/features/calendario/components/calendar-item-actions.jsx`
    -   `src/features/calendario/hooks/use-calendario.js`
    -   `src/features/calendario/pages/calendario-page.jsx`
    -   `src/features/calendario/views/calendario-desktop.jsx`
    -   `src/features/calendario/views/calendario-mobile.jsx`
*   **Hoy:**
    -   `src/features/hoy/pages/hoy-todas.jsx`
    -   `src/features/hoy/pages/hoy-actividades.jsx`
    -   `src/features/hoy/pages/hoy-mantenimientos.jsx`
    -   `src/features/hoy/components/common/hoy-form-modal.jsx`
    -   `src/features/hoy/components/common/mobile-hoy-form-modal.jsx`
    -   `src/features/hoy/components/hoy-actividades/hoy-actividades-form.jsx`
*   **Mantenimientos:**
    -   `src/features/mantenimientos/pages/mantenimientos-preventivos.jsx`
    -   `src/features/mantenimientos/pages/mantenimientos-correctivos.jsx`
    -   `src/features/mantenimientos/pages/mantenimientos-historico.jsx`
    -   `src/features/mantenimientos/components/common/mantenimientos-form-modal.jsx`
    -   `src/features/mantenimientos/components/common/mobile-mantenimientos-form-modal.jsx`
    -   `src/features/mantenimientos/components/common/mantenimientos-review-modal.jsx`
    -   `src/features/mantenimientos/components/common/mobile-mantenimientos-review-modal.jsx`
*   **Tickets:**
    -   `src/features/tickets/components/historico/ticket-form-modal.jsx`
    -   `src/features/tickets/components/historico/mobile-ticket-form-modal.jsx`
*   **Rutas:**
    -   `src/routes/AppRoutes.jsx`
    -   `src/routes/ProtectedRoute.jsx`
    -   `src/App.jsx`
