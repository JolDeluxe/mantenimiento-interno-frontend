# Reporte de Trazabilidad de Formularios (Frontend) - V2 (Accionable)
## Módulos: Tickets, Mantenimientos y Hoy

Este reporte técnico presenta el mapeo exhaustivo y análisis de trazabilidad de los formularios, modales y flujos de datos en el frontend. Se detallan las correspondencias exactas de componentes visuales, estados de React que los controlan, APIs asociadas, inconsistencias críticas y un plan de acción para guiar el desarrollo.

---

## 1. Tabla de Formularios Reales

La siguiente tabla detalla la correspondencia de componentes físicos encargados de la captura y revisión de datos, sus módulos de uso y los endpoints del backend que consumen.

| Formulario | Archivo | Usado por módulos | Desktop/Mobile | Crea | Edita | Revisa/Aprueba | Endpoint | Observaciones |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **TicketFormModal** | `src/features/tickets/components/historico/ticket-form-modal.jsx` | Tickets (Histórico) | Desktop | Sí | Sí | No | `POST /api/tickets`<br>`PUT /api/tickets/:id` | No incluye campos de Mantenimiento Recurrente ni maquinaria obligatoria. Envía como `multipart/form-data`. |
| **MobileTicketFormModal** | `src/features/tickets/components/historico/mobile-ticket-form-modal.jsx` | Tickets (Histórico) | Mobile | Sí | Sí | No | `POST /api/tickets`<br>`PUT /api/tickets/:id` | Adaptación móvil del formulario de tickets. |
| **MantenimientosFormModal** | `src/features/mantenimientos/components/common/mantenimientos-form-modal.jsx` | Mantenimientos (Preventivos, Correctivos, Histórico), Hoy (Mantenimientos) | Desktop | Sí | Sí | No | `POST /api/tickets`<br>`PUT /api/tickets/:id`<br>`POST /api/recurrencias` | Incluye switch de "Mantenimiento recurrente". Si se activa, envía a `/api/recurrencias` en lugar de crear un ticket normal. |
| **MobileMantenimientosFormModal** | `src/features/mantenimientos/components/common/mobile-mantenimientos-form-modal.jsx` | Mantenimientos (Preventivos, Correctivos, Histórico), Hoy (Mantenimientos) | Mobile | Sí | Sí | No | `POST /api/tickets`<br>`PUT /api/tickets/:id`<br>`POST /api/recurrencias` | Adaptación móvil. Incluye lógica de switch recurrente y resumen en vivo. |
| **HoyActividadesForm** | `src/features/hoy/components/hoy-actividades/hoy-actividades-form.jsx` | Hoy (Actividades, Todas), Tickets (Actividades) | Ambos (Desktop / Mobile) | Sí | Sí | No | `POST /api/tickets`<br>`PUT /api/tickets/:id` | Componente unificado para tareas generales y actividades que no involucran maquinaria. Usa prop `isMobile` para alternar diseño. |
| **TicketReviewModal** | `src/features/tickets/components/historico/ticket-review-modal.jsx` | Tickets (Histórico, Actividades), Hoy (Actividades) | Desktop | No | No | Sí | `PATCH /api/tickets/:id/status` | Modal de conformidad. Permite cambiar a `CERRADO` (Aprobar) o `RECHAZADO` (con fecha de re-vencimiento). No exige firma. |
| **MobileTicketReviewModal** | `src/features/tickets/components/historico/mobile-ticket-review-modal.jsx` | Tickets (Histórico, Actividades), Hoy (Actividades, Mantenimientos) | Mobile | No | No | Sí | `PATCH /api/tickets/:id/status` | Equivalente móvil sin firma. Usado incorrectamente por Hoy Mantenimientos Mobile. |
| **MantenimientosReviewModal** | `src/features/mantenimientos/components/common/mantenimientos-review-modal.jsx` | Mantenimientos (Preventivos, Correctivos, Histórico) | Desktop | No | No | Sí | `PATCH /api/tickets/:id/status` | **Exige y valida firma de conformidad** del cliente (`CanvasSignature`) para poder cerrar la tarea en el frontend. |
| **MobileMantenimientosReviewModal** | `src/features/mantenimientos/components/common/mobile-mantenimientos-review-modal.jsx` | Mantenimientos (Preventivos, Correctivos, Histórico) | Mobile | No | No | Sí | `PATCH /api/tickets/:id/status` | Duplicado de `MobileTicketReviewModal` con alias. **No exige firma**. |
| **MaquinaRecurrenciaFormModal** | `src/features/maquinaria/components/maquina-recurrencia-form-modal.jsx` | Maquinaria (Ficha de Máquina / Plan Recurrente) | Desktop | Sí | Sí | No | `POST /api/recurrencias`<br>`PUT /api/recurrencias/:id` | Formulario especializado para reglas recurrentes. Valida fecha mínima. |

---

## 2. Estados y Flujos de Modales (React State Triggers)

A continuación se detallan los estados de React que controlan la visibilidad de los modales, las acciones del usuario que los disparan y la función final de guardado.

| Archivo | Estado de Control | Botón / Acción que lo Dispara | Modal que Abre | Props Importantes Pasadas | Submit Final (API / Callback) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `src/features/tickets/components/common/tickets-listado-base.jsx` | `showCreate` | Clic en `TicketAddButton` u `HoyAddButton` (`onOpenCreate`) | `CreateFormModal` (`HoyFormModal` o `TicketFormModal`) | `isOpen={showCreate}`<br>`ticketAEditar={null}`<br>`scope={scope}`<br>`onSuccess={handleCreate}` | `handleCreate` llama a `createTicket` o `createBatch` de `tickets-api.js`. |
| `src/features/tickets/views/tickets-historico-desktop.jsx`<br>`src/features/tickets/views/tickets-historico-mobile.jsx` | `editTarget` | Acción "Editar" en la tabla o tarjeta de la fila | `TicketFormModal` / `MobileTicketFormModal` | `isOpen={Boolean(editTarget)}`<br>`ticketAEditar={editTarget}`<br>`onSuccess={async (payload) => { await onSave(editTarget.id, payload); setEditTarget(null); }}` | `onSave` (del listado base) llama a `updateTicket`. |
| `src/features/tickets/views/tickets-historico-desktop.jsx`<br>`src/features/tickets/views/tickets-historico-mobile.jsx` | `reviewTarget` | Botón "Revisión" (con ticket en estado `RESUELTO`) | `TicketReviewModal` / `MobileTicketReviewModal` | `isOpen={Boolean(reviewTarget)}`<br>`ticket={reviewTarget}`<br>`onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setReviewTarget(null); }}` | `onChangeStatus` llama a `changeTicketStatus` (`PATCH`). |
| `src/features/mantenimientos/pages/mantenimientos-historico.jsx` | `showCreate` | Clic en `TicketAddButton` (`onOpenCreate`) | `TicketFormModal` (importado de `mantenimientos-form-modal.jsx`) | `isOpen={showCreate}`<br>`ticketAEditar={null}`<br>`scope="mantenimientos"`<br>`onSuccess={handleCreate}` | `handleCreate` llama a `createMantenimiento` o `createBatch` de `mantenimientos-api.js`. |
| `src/features/mantenimientos/views/mantenimientos-preventivos-desktop.jsx`<br>`src/features/mantenimientos/views/mantenimientos-preventivos-mobile.jsx` | `editTarget` | Clic en acción "Editar" en la tabla o tarjeta | `TicketFormModal` / `MobileTicketFormModal` | `isOpen={Boolean(editTarget)}`<br>`ticketAEditar={editTarget}`<br>`onSuccess` (actualiza vía `onSave`) | `onSave` llama a `updateMantenimiento`. |
| `src/features/mantenimientos/views/mantenimientos-preventivos-desktop.jsx`<br>`src/features/mantenimientos/views/mantenimientos-preventivos-mobile.jsx` | `reviewTarget` | Clic en "Revisión" (con ticket en estado `RESUELTO`) | `TicketReviewModal` / `MobileTicketReviewModal` (de mantenimientos) | `isOpen={Boolean(reviewTarget)}`<br>`ticket={reviewTarget}`<br>`onConfirm` (actualiza vía `onChangeStatus`) | `onChangeStatus` llama a `changeMantenimientoStatus` (`PATCH`). |
| `src/features/hoy/pages/hoy-todas.jsx` | `showCreate` | Clic en `HoyAddButton` (`onOpenCreate`) | `HoyFormModal` / `MobileHoyFormModal` | `isOpen={showCreate}`<br>`scope="general"`<br>`onSuccess={handleCreate}` | `handleCreate` llama a `createTicket` en `tickets-api.js`. |
| `src/features/hoy/components/hoy-mantenimientos/mantenimientos-ticket-table.jsx`<br>`src/features/hoy/views/hoy-mantenimientos-mobile.jsx` | `editTarget` | Clic en "Editar" en la fila o tarjeta | `HoyFormModal` / `MobileHoyFormModal` (que enruta a `MantenimientosFormModal`) | `isOpen={Boolean(editTarget)}`<br>`ticketAEditar={editTarget}`<br>`scope="mantenimientos"`<br>`onSuccess` (vía `onSave`) | `onSave` llama a `updateHoyTicket` de `hoy-api.js`. |
| `src/features/hoy/components/hoy-mantenimientos/mantenimientos-ticket-table.jsx`<br>`src/features/hoy/views/hoy-mantenimientos-mobile.jsx` | `reviewTarget` | Clic en "Revisión" (con ticket en estado `RESUELTO`) | `ActiveReviewModal` (Desktop: `MantenimientosReviewModal`<br>Mobile: `MobileTicketReviewModal`) | `isOpen={Boolean(reviewTarget)}`<br>`ticket={reviewTarget}`<br>`onConfirm` (vía `onChangeStatus`) | `onChangeStatus` llama a `changeHoyTicketStatus` (`PATCH`). |

---

## 3. Análisis Profundo de Inconsistencias Detectadas

### Inconsistencia A: Mismatch de Modal de Revisión Móvil en Hoy Mantenimientos
*   **Severidad:** Media
*   **Archivos Involucrados:**
    -   `src/features/hoy/views/hoy-mantenimientos-mobile.jsx` (Línea 11)
    -   `src/features/tickets/components/historico/mobile-ticket-review-modal.jsx`
    -   `src/features/mantenimientos/components/common/mobile-mantenimientos-review-modal.jsx`
*   **Import Exacto en Conflicto:**
    ```javascript
    import { MobileTicketReviewModal } from '@/features/tickets/components/historico/mobile-ticket-review-modal';
    ```
*   **Modal que debería usar:**
    Debería importar `MobileMantenimientosReviewModal` desde `src/features/mantenimientos/components/common/mobile-mantenimientos-review-modal.jsx`.
*   **Impacto real para el usuario:** Si se aprueba un mantenimiento preventivo desde "Hoy Mantenimientos (Móvil)", se renderizan los textos genéricos de Tickets ("Detalles del ticket") en vez de los específicos de maquinaria. Además, si a futuro se agrega la firma al modal de mantenimientos móviles, los mantenimientos aprobados desde la pestaña "Hoy" se saltarán la validación de firma por usar el modal de tickets.
*   **Riesgo técnico:** Muy Bajo. La interfaz de llamadas API (`onConfirm`) es idéntica en ambos modales.
*   **Recomendación concreta:** Corregir el import en `hoy-mantenimientos-mobile.jsx` para que use el componente de Mantenimientos.
*   **¿Conviene corregir ahora o después?:** Corregir ahora (es un cambio de import simple de 1 línea).

---

### Inconsistencia B: Desktop exige firma de conformidad, Mobile no
*   **Severidad:** Alta
*   **Archivos Involucrados:**
    -   `src/features/mantenimientos/components/common/mantenimientos-review-modal.jsx` (Desktop exige)
    -   `src/features/mantenimientos/components/common/mobile-mantenimientos-review-modal.jsx` (Mobile no exige)
*   **Detalle de Exigencia:**
    -   **Desktop:** Bloquea la acción y exige firma en un `CanvasSignature`. Si se intenta enviar sin firma, muestra: `La firma de conformidad del cliente es obligatoria.`. Adjunta la firma en el body bajo el nombre `firma_conformidad.png`.
    -   **Mobile:** No contiene ningún campo de firma ni comprobación de `signatureBlob` en su código.
*   **¿El backend exige firma o solo frontend?:** **Solo el frontend.** El backend procesa las imágenes que vengan en la petición y las sube a Cloudinary (`status_admin.ts`), pero no valida ni la presencia obligatoria de la firma ni su nombre de archivo en la base de datos o en la petición REST de cambio de estatus.
*   **¿Mobile puede aprobar sin firma actualmente?:** **Sí.** En móvil un supervisor puede cambiar el estado de un preventivo de `RESUELTO` a `CERRADO` (Aprobado) haciendo clic directo en "Confirmar", omitiendo la captura de firma completamente.
*   **Riesgo técnico:** Medio. La implementación de firma en móvil requiere integrar un pad táctil de dibujo en la interfaz responsive y validar que el archivo generado se envíe correctamente en el payload.
*   **Recomendación concreta:** Integrar un componente Canvas Signature responsivo en el modal móvil de mantenimientos para alinear el comportamiento del negocio con el de Desktop.
*   **¿Conviene corregir ahora o después?:** Corregir ahora, previo acuerdo de diseño móvil con Joel.

---

### Inconsistencia C: Switch de Mantenimiento Recurrente ausente en TicketFormModal
*   **Severidad:** Media
*   **Archivos Involucrados:**
    -   `src/features/tickets/components/historico/ticket-form-modal.jsx`
    -   `src/features/tickets/components/common/tickets-listado-base.jsx`
*   **Rutas en las que se usa TicketFormModal para preventivos:**
    -   `/tickets/historico` (donde un usuario con rol de administración puede registrar preventivos ordinarios).
    -   `/tickets/actividades` (donde se configuran actividades pero el selector permite clasificar como `PREVENTIVO`).
*   **¿Realmente se puede seleccionar PREVENTIVO ahí?:** **Sí.** El selector del formulario incluye las opciones de `CLASIFICACIONES_ADMIN` (`PREVENTIVO`, `CORRECTIVO`, `RUTINA`). Si el usuario selecciona `PREVENTIVO`, se le obliga a rellenar los datos de máquina, pero no dispone de la opción de hacerlo recurrente.
*   **¿Conviene integrar el switch ahí o bloquear preventivos en Tickets?:**
    -   **Recomendación UX / Arquitectura:** **Bloquear.** Crear preventivos/correctivos desde la lista de tickets generales es mala práctica de flujo de trabajo, ya que Mantenimiento requiere validaciones y flujos complejos (paros de producción, impacto, asignación especializada, y ahora recurrencias). 
    -   Se debe remover `PREVENTIVO` y `CORRECTIVO` de las opciones disponibles en `TicketFormModal`, canalizando a los usuarios a la ruta `/mantenimientos` para cualquier acción de maquinaria.
*   **Riesgo técnico:** Bajo. Requiere ajustar las clasificaciones permitidas en el selector basándose en el módulo o scope.
*   **¿Conviene corregir ahora o después?:** Corregir después (o ahora si se desea simplificar la UX de inmediato).

---

### Inconsistencia D: Duplicidad entre mobile-ticket-review-modal.jsx y mobile-mantenimientos-review-modal.jsx
*   **Severidad:** Baja (Deuda Técnica)
*   **Archivos Involucrados:**
    -   `src/features/tickets/components/historico/mobile-ticket-review-modal.jsx`
    -   `src/features/mantenimientos/components/common/mobile-mantenimientos-review-modal.jsx`
*   **Porcentaje de duplicación:** **99.9%.** Exceptuando la exportación alias al final del archivo de mantenimientos y la palabra "reporte" vs "ticket" en una etiqueta secundaria de información, el código de más de 540 líneas (que incluye el visor de imágenes interactivo `NativeImageStack`, layouts y estados) es idéntico.
*   **Componente Base recomendado:** Se debería extraer a un componente común en `src/features/common/components/mobile-review-base-modal.jsx` y parametrizar las diferencias (ej. exigir firma, mostrar selector de maquinaria) mediante propiedades.
*   **Riesgo de unificar:** Medio. Hay que probar exhaustivamente que los callbacks de guardado no se rompan por el cambio de rutas físicas del componente.
*   **¿Conviene corregir ahora o después?:** Corregir después. Es preferible priorizar la solución del flujo funcional de firmas e imports incorrectos antes de encarar una refactorización de unificación de código.

---

### Inconsistencia E: Exposición de marcadores de metadatos de sistema (||[META:CIERRE_ADMINISTRATIVO]||)
*   **Severidad:** Media (Visual)
*   **Archivos Involucrados:**
    -   `src/features/common/components/ticket-detail-modal.jsx` (Frontend)
    -   `src/features/common/components/ticket-timeline.jsx` (Frontend)
    -   `src/modules/tickets/helper.ts` (Backend)
*   **Impacto real para el usuario:** El usuario ve etiquetas de metadatos crudas del sistema en las notas del historial como `Ya entregado ||[META:CIERRE_ADMINISTRATIVO]||` en el modal de detalle y en la línea de tiempo.
*   **Riesgo técnico:** Mínimo.
*   **Acción realizada (Corregida de inmediato):**
    -   Se implementó lógica de detección y reemplazo para el metadato `||[META:CIERRE_ADMINISTRATIVO]||` tanto en el frontend (`src/features/common/components/ticket-detail-modal.jsx` y `src/features/common/components/ticket-timeline.jsx`) como en el mapper de base del backend (`src/modules/tickets/helper.ts`).
    -   En lugar de solo borrar la etiqueta, el sistema ahora detecta la presencia del marcador de cierre administrativo y añade el sufijo descriptivo aclaratorio: ` (Cerrado manualmente por administrador)`.
    -   Cualquier otra etiqueta de metadatos genérica del formato `||[META:...]||` se remueve de forma segura mediante la expresión regular `metaRegex`.
*   **Estado:** **Corregido.**

---

## 4. Plan de Corrección Recomendado

Propuesta de ejecución por fases para limpiar las inconsistencias sin interrumpir el funcionamiento estable:

### Fase 1: Corrección de Imports y Mapeos de Modales (Bajo Riesgo)
*   **Objetivo:** Asegurar que cada módulo use su modal móvil respectivo.
*   **Acción 1:** Cambiar el import en `src/features/hoy/views/hoy-mantenimientos-mobile.jsx` para que consuma `MobileMantenimientosReviewModal`.
*   **Riesgo:** Ninguno.

### Fase 2: Bloqueo de Clasificaciones Cruzadas (UX Limpia)
*   **Objetivo:** Evitar que se creen preventivos/correctivos desde la pestaña general de Tickets sin pasar por el flujo de recurrencia.
*   **Acción 2:** Filtrar las opciones del selector de clasificación en `src/features/tickets/components/historico/ticket-form-modal.jsx` y su contraparte móvil para que cuando el scope no sea "mantenimientos", se oculten `PREVENTIVO` y `CORRECTIVO`.
*   **Riesgo:** Bajo. Mejora la coherencia del negocio.

### Fase 3: Integración de Firma Digital en Móvil (Alto Valor Operativo)
*   **Objetivo:** Que los supervisores se vean obligados a firmar la aprobación de preventivos tanto en Desktop como en Móvil.
*   **Acción 3:** Implementar un canvas de firmas responsive en `src/features/mantenimientos/components/common/mobile-mantenimientos-review-modal.jsx` (similar al de Desktop) y validar que se cargue la imagen de conformidad antes de llamar al submit.
*   **Riesgo:** Medio. Requiere soporte para eventos touch (`onTouchStart`, `onTouchMove`) del canvas en iOS/Android.

### Qué NO tocar todavía:
-   **No unificar** todavía los archivos físicos `mobile-ticket-review-modal.jsx` y `mobile-mantenimientos-review-modal.jsx`. Si bien son duplicados, unificarlos ahora agrega riesgo de regresión de código antes de la estabilización del Paso 6 (Matriz de Preventivos). Es mejor mantener la duplicidad controlada temporalmente.

---

## 5. Decisiones Pendientes para Joel

Necesitamos tu retroalimentación para avanzar con las correcciones en el código:

1.  **¿Exigimos la firma de conformidad en móvil igual que en Desktop?**
    -   *Opción A (Recomendada):* Sí, es crítico para la auditoría de mantenimiento que la firma se capture siempre, sin importar el dispositivo.
    -   *Opción B:* No, en móvil permitimos cerrar preventivos solo con presionar un botón por agilidad de los supervisores en planta.
2.  **¿Eliminamos la creación de Preventivos/Correctivos de la sección general de Tickets?**
    -   *Opción A (Recomendada):* Sí, forzar a que todo preventivo/correctivo se cree exclusivamente en el módulo de Mantenimientos para garantizar el uso de máquinas y recurrencias.
    -   *Opción B:* No, mantener la opción en la sección de tickets (lo que implicaría tener que replicar la compleja lógica del switch recurrente y listados de máquinas en el formulario de tickets).
3.  **¿Deseas que unifiquemos los modales de revisión móviles duplicados o solo corregimos los imports?**
    -   *Opción A (Recomendada):* Solo corregir los imports en esta etapa para priorizar la estabilidad de cara a la Matriz Anual (Paso 6), y dejar la unificación de código como una tarea de refactorización posterior.
    -   *Opción B:* Hacer la refactorización y unificación completa de los archivos duplicados de una vez.
