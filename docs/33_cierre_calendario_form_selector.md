# Cierre Calendario: selector de formulario

## Problema

Calendario estaba usando `TicketFormModal` y `MobileTicketFormModal` para crear y editar actividades con `scope="actividades"`. Eso dejaba el flujo de Calendario fuera del refactor común de actividades.

## Decisión

Al crear desde Calendario ahora se muestra un selector:

- Actividad
- Mantenimiento

Al editar no se pregunta. Calendario detecta el item real y abre el formulario correcto.

## Nueva arquitectura

- `CalendarioActividadFormModal`
- `calendarioActividadesRules`
- `ActividadFormModal` compartido

`calendarioActividadesRules` usa `localStoragePrefix: 'calendario_actividades'` para no compartir drafts con Hoy ni Tickets.

## Create

- Actividad -> `CalendarioActividadFormModal`
- Mantenimiento -> `MantenimientosFormModal` / `MobileMantenimientosFormModal`

## Edit

- Actividad `PLANEADA` / `EXTRAORDINARIA` -> `CalendarioActividadFormModal`
- Mantenimiento -> `MantenimientosFormModal` / `MobileMantenimientosFormModal`
- `TICKET` o desconocido -> `TicketFormModal` / `MobileTicketFormModal` como fallback

## Invariantes

- No se tocó backend.
- No se cambiaron endpoints.
- No se cambió payload funcional.
- Actividades mantienen `tipo` como `PLANEADA` o `EXTRAORDINARIA`.
- Actividades mantienen `clasificacion` como `null` o vacío.
- Actividades mantienen `maquinaId` como `null` o vacío.
- Actividades no usan recurrencia.
- `PREVENTIVO` y `CORRECTIVO` siguen siendo clasificación de mantenimiento, no tipo de actividad.
- Mantenimientos conservan su flujo con maquinaria, clasificación y recurrencia existente.

## Ajuste mantenimiento

- Calendario no muestra Categoría al crear/editar mantenimiento porque abre los modales con `scope="mantenimientos"`.
- Categoría queda fija como `MAQUINARIA`.
- Al crear mantenimiento desde Calendario se elige primero la clasificación:
  - `PREVENTIVO`
  - `CORRECTIVO`
- Esa clasificación se pasa como `defaultClasificacion` al modal de mantenimientos.
- Al editar mantenimiento se conserva `ticketAEditar.clasificacion`; si viene vacía, se usa fallback `PREVENTIVO`.
- Se replica el patrón usado por las vistas reales de mantenimientos.

## Ajuste fecha desde Calendario

- Al hacer click en un día del Calendario, la fecha seleccionada se pasa al formulario.
- Actividad recibe `defaultDate` en `CalendarioActividadFormModal`.
- Mantenimiento ya recibía `defaultDate`; se conserva.
- Cuando la fecha viene desde Calendario, los botones rápidos `Hoy` y `Mañana` no quedan visualmente seleccionados.
- El input de fecha queda con el día elegido en Calendario, salvo que sea anterior a hoy; en ese caso se conserva el clamp existente a hoy.

## Validaciones

- `npm run build`
- ESLint sobre `calendario-page.jsx` y archivos de actividades common.
- ESLint sobre modales de mantenimientos.

## QA manual pendiente

Desktop:

- Click crear -> muestra selector Actividad/Mantenimiento.
- Actividad -> abre `CalendarioActividadFormModal`.
- Mantenimiento -> abre `MantenimientosFormModal`.
- Editar actividad -> abre `CalendarioActividadFormModal`.
- Editar mantenimiento -> abre `MantenimientosFormModal`.
- Editar `TICKET` -> abre `TicketFormModal`.

Mobile:

- Click crear -> muestra selector Actividad/Mantenimiento.
- Actividad -> abre `CalendarioActividadFormModal` con `isMobile`.
- Mantenimiento -> abre `MobileMantenimientosFormModal`.
- Editar actividad -> abre `CalendarioActividadFormModal` con `isMobile`.
- Editar mantenimiento -> abre `MobileMantenimientosFormModal`.
- Editar `TICKET` -> abre `MobileTicketFormModal`.
