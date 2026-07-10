# Cierre frontend matriz recurrentes

## Que se agrego

Se reemplazo el placeholder de `Matriz anual` en:

```txt
src/features/mantenimientos/pages/mantenimientos-preventivos.jsx
```

La tab ahora renderiza matriz real basada en backend.

## Endpoint consumido

```txt
GET /api/recurrencias/matriz?year=YYYY
```

Se usa `year`.
No se usa `anio`.

## Hook creado

```txt
src/features/mantenimientos/hooks/use-recurrencias-matriz.js
```

Responsabilidades:

- cargar matriz desde backend;
- manejar `year`;
- manejar `rows`, `total`, `loading`, `error`;
- aplicar filtros locales sobre filas recibidas;
- refrescar datos;
- materializar ciclo mediante API existente sin forzar `confirmarFuturo=true`.

No calcula recurrencias.
No genera fechas.
No agrupa ciclos nuevos.

## Componentes creados

```txt
src/features/mantenimientos/components/recurrentes/recurrentes-matriz-desktop.jsx
src/features/mantenimientos/components/recurrentes/recurrentes-matriz-mobile.jsx
src/features/mantenimientos/components/recurrentes/matriz-cell.jsx
src/features/mantenimientos/components/recurrentes/matriz-month-column.jsx
src/features/mantenimientos/components/recurrentes/matriz-utils.js
```

## Desktop UX

- toolbar con year, busqueda, responsable, estado regla, baja/desuso y refrescar;
- tabla con scroll horizontal;
- columnas fijas de maquina/regla;
- columnas Enero-Diciembre;
- cada celda mensual puede mostrar varias ejecuciones;
- estados visuales por ejecucion;
- baja/desuso se muestra gris si backend devuelve estado.

## Mobile UX

- no usa tabla gigante;
- selector year;
- selector mes;
- filtros basicos;
- cards por regla;
- lista de ejecuciones del mes seleccionado.

## Acciones desde celdas

Si ejecucion tiene `ticketId`, se muestra `Ver ticket` deshabilitado porque no hay mecanismo claro conectado en esta fase.

Si ejecucion viene de `proyeccion` y `pendienteMaterializar=true`, usuarios admin pueden usar `Generar`.

La accion llama API existente sin mandar fecha futura ni `confirmarFuturo=true`.
Si backend rechaza por futuro, se muestra error.

## Que no se toco

- Backend.
- Calendario.
- Hoy.
- Tickets.
- Actividades.
- Formularios common.
- `MantenimientosFormModal`.
- `TicketFormModal`.
- `ActividadFormModal`.
- `use-preventivos-matriz.js`.

## Validaciones

```bash
npm run build
npx eslint src/features/mantenimientos/pages/mantenimientos-preventivos.jsx src/features/mantenimientos/components/recurrentes src/features/mantenimientos/hooks/use-recurrencias-matriz.js src/features/mantenimientos/api/recurrencias-api.js
```

Resultado: OK.

## Riesgos pendientes

- QA real con datos/token.
- Performance con muchas reglas semanales.
- Origen real de `IMPRESO`.
- Integrar accion real para ver ticket desde celda.
