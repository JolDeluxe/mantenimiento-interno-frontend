# Cierre frontend Plan recurrente

## Que se agrego

Se agrego submodulo visual dentro de:

```txt
src/features/mantenimientos/pages/mantenimientos-preventivos.jsx
```

Tabs internas:

- Tickets preventivos
- Plan recurrente
- Matriz anual

## Tickets preventivos

La tab `Tickets preventivos` conserva el render existente:

```txt
MantenimientosHistoricoPage
forcedClasificacion="PREVENTIVO"
MantenimientosPreventivosDesktop
MantenimientosPreventivosMobile
```

No se cambio comportamiento de listado, filtros, creacion o edicion de tickets preventivos.

## Plan recurrente

Se agrego vista funcional para reglas recurrentes preventivas.

Desktop:

- tabla de reglas;
- codigo maquina;
- maquina/equipo;
- area/ubicacion;
- responsable;
- frecuencia;
- proxima ejecucion;
- tiempo estimado;
- estado regla;
- acciones.

Mobile:

- cards por regla;
- codigo maquina;
- nombre maquina;
- responsable;
- frecuencia;
- proxima ejecucion;
- estado activa/pausada;
- acciones rapidas.

## API y hook

Se creo:

```txt
src/features/mantenimientos/api/recurrencias-api.js
src/features/mantenimientos/hooks/use-recurrencias.js
```

El API de mantenimientos re-exporta mutaciones existentes desde:

```txt
src/features/maquinaria/api/recurrencias-api.js
```

Solo agrega el listado global:

```txt
GET /api/recurrencias
```

No duplica logica de mutaciones.

## Modal regla recurrente

Se creo:

```txt
src/features/mantenimientos/components/recurrentes/recurrente-form-modal.jsx
```

Campos:

- maquina;
- titulo;
- descripcion;
- responsable tecnico;
- frecuencia;
- intervalo dias si frecuencia personalizada;
- proxima ejecucion;
- prioridad;
- tiempo estimado;
- activo.

La regla se muestra como:

```txt
MAQUINARIA / PREVENTIVO / PLANEADA
```

No se muestra `tipo` editable.
No se muestra `clasificacion` editable.
No se envia `tipo=PREVENTIVO`.

## Matriz anual

Tab creada con placeholder:

```txt
Matriz anual estara disponible en Fase 4.
```

No se consume todavia:

```txt
GET /api/recurrencias/matriz?year=2026
```

## No se toco

- Backend.
- Calendario.
- Hoy.
- Tickets.
- Actividades.
- Correctivos.
- Endpoints backend.
- Payloads backend.
- Matriz anual funcional.
- Calculo de recurrencias en React.

## Validaciones

```bash
npm run build
npx eslint src/features/mantenimientos/pages/mantenimientos-preventivos.jsx src/features/mantenimientos/components/recurrentes src/features/mantenimientos/hooks/use-recurrencias.js src/features/mantenimientos/api/recurrencias-api.js
```

Resultado: OK.

## QA manual pendiente

Desktop:

- Tab Tickets preventivos muestra listado actual.
- Tab Plan recurrente muestra reglas.
- Crear regla abre modal propio.
- Editar regla abre modal propio.
- Pausar/activar funciona.
- Materializar funciona si ciclo es actual/vencido.
- Tab Matriz anual muestra placeholder.

Mobile:

- Tabs visibles/usables.
- Tickets preventivos actual sigue.
- Plan recurrente muestra cards.
- Modal regla usable.
- Matriz placeholder.

## Riesgos pendientes

- QA real con datos y token.
- Materializar futuro puede devolver confirmacion requerida desde backend.
- Ticket pendiente actual no viene aun como campo agregado en listado global.
- Matriz anual queda para Fase 4.
