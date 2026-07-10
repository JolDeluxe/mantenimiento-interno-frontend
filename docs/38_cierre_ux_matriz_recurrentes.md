# Cierre UX matriz recurrentes

## Resumen

Se mejoro la usabilidad de la Matriz anual de mantenimientos recurrentes sin tocar backend ni contrato API.

La matriz sigue consumiendo:

```txt
GET /api/recurrencias/matriz?year=YYYY
```

Frontend no calcula recurrencias. Solo muestra filas y ejecuciones que entrega backend.

## Cambios UX/UI

- Desktop agrega selector de vista:
  - Mes
  - Trimestre
  - Año
- La vista default es Trimestre actual.
- Desktop conserva selector de año, busqueda, responsable, estado de regla, filtro baja/desuso y actualizar.
- Desktop reduce scroll inicial mostrando solo meses visibles segun modo.
- Desktop agrega columnas sticky:
  - Codigo
  - Maquina / area
  - Responsable / frecuencia
- Desktop mantiene header sticky dentro del contenedor.
- Mobile conserva cards, sin tabla gigante.
- Mobile muestra resumen por card del mes seleccionado.
- Se agrego leyenda visible para:
  - Real
  - Proyeccion
  - Pendiente generar
  - Pausada
  - Impreso

## Cambios en celdas

Cada celda ahora muestra:

- total de ejecuciones;
- cantidad de reales;
- cantidad de proyecciones;
- cantidad pendiente de generar;
- maximo 3 ejecuciones visibles;
- boton Ver mas / Ver menos cuando hay mas ejecuciones.

Cada ejecucion muestra texto e icono, no solo color:

- fecha;
- estado legible;
- origen Real o Proyeccion;
- Pendiente generar si aplica.

## Acciones

- Generar solo aparece si:
  - el usuario puede administrar;
  - la ejecucion es proyeccion;
  - la ejecucion viene marcada como pendiente de materializar.
- No se envia `confirmarFuturo=true`.
- Si backend rechaza futuro, se muestra el error del hook.
- Ver ticket sigue deshabilitado como integracion pendiente.

## Invariantes

- No se toco backend.
- No se cambio endpoint.
- No se cambio payload.
- No se cambio contrato de matriz.
- No se toco Calendario.
- No se toco Hoy.
- No se toco Tickets.
- No se toco Actividades.
- No se usa `PREVENTIVO` como tipo.
- No se usa `anio` en contrato frontend.

## Validaciones

Comandos esperados:

```bash
npm run build
npx eslint src/features/mantenimientos/pages/mantenimientos-preventivos.jsx src/features/mantenimientos/components/recurrentes src/features/mantenimientos/hooks/use-recurrencias-matriz.js src/features/mantenimientos/api/recurrencias-api.js
git grep -n "anio" src/features/mantenimientos/components/recurrentes src/features/mantenimientos/hooks/use-recurrencias-matriz.js src/features/mantenimientos/api/recurrencias-api.js
git grep -n "tipo.*PREVENTIVO\|PREVENTIVO.*tipo" src/features/mantenimientos
git grep -n "MantenimientosFormModal\|TicketFormModal\|ActividadFormModal" src/features/mantenimientos/components/recurrentes
```

## Pendientes

- Integrar Ver ticket cuando exista navegacion/detalle definido desde matriz.
- Confirmar origen real de etiqueta Impreso.
- Definir si baja/desuso se oculta por default segun contrato final backend.
