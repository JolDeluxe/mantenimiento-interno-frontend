# Cierre frontend ajustes preventivos

## Alcance

Se implemento la Fase 2 frontend para ajustes por ocurrencia de preventivos recurrentes.

No se toco backend.

## Entregado

- API frontend para consultar, mover, omitir y quitar ajustes de ocurrencias.
- Modales de usuario para:
  - Mover este mes.
  - Omitir este mes.
  - Quitar ajuste.
- Acciones por ocurrencia en la matriz anual.
- Estados visuales en matriz:
  - Movido este mes.
  - Omitido este mes.
  - Ajuste operativo.
- Calendario actualizado para respetar programaciones movidas y ocultar omitidas.
- Dedupe de calendario usando la fecha original de la ocurrencia.

## Reglas respetadas

- La matriz identifica la ocurrencia por fecha original.
- Calendario muestra la fecha programada efectiva cuando existe.
- Omitido no se muestra como descuido.
- HOY no fue modificado.
- No se agregaron acciones operativas a programaciones virtuales del calendario.

## Archivos principales

```txt
src/features/mantenimientos/api/recurrencias-api.js
src/features/mantenimientos/hooks/use-recurrencias-matriz.js
src/features/mantenimientos/components/recurrentes
src/features/mantenimientos/pages/mantenimientos-preventivos.jsx
src/features/calendario
```

## Validacion esperada

```bash
npm run build
npx eslint src/features/mantenimientos/components/recurrentes src/features/mantenimientos/hooks src/features/mantenimientos/api src/features/calendario src/components/ui/interactive-calendar.jsx
```

## Riesgos pendientes

- QA manual con datos reales de ajustes movidos/omitidos.
- Confirmar permisos visuales contra permisos backend en usuarios reales.
- Confirmar que el backend tenga migracion aplicada en el ambiente destino.
