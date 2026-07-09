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

## Validaciones

- `npm run build`
- ESLint sobre `calendario-page.jsx` y archivos de actividades common.

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
