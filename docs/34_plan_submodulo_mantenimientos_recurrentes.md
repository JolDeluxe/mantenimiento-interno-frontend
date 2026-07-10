# Plan submodulo mantenimientos recurrentes

## 1. Resumen ejecutivo

Se agregara un submodulo dentro de `Mantenimientos > Preventivos` para administrar mantenimientos preventivos recurrentes.

No reemplaza el listado actual de tickets preventivos. La vista quedara organizada con tabs internas dentro de:

```txt
src/features/mantenimientos/pages/mantenimientos-preventivos.jsx
```

Tabs aprobadas:

- Tickets preventivos
- Plan recurrente
- Matriz anual

Regla de negocio obligatoria:

```txt
categoria = MAQUINARIA
clasificacion = PREVENTIVO
tipo = PLANEADA
```

`PREVENTIVO` y `CORRECTIVO` son clasificacion, nunca `tipo`.

## 2. Decisiones cerradas

- Navegacion: tabs internas en `mantenimientos-preventivos.jsx`; no crear ruta hija todavia.
- Matriz anual: una fila por regla recurrente, no por maquina.
- Maquinas sin regla: no mostrarlas por default en Plan recurrente.
- Maquinas sin regla en Matriz: filtro opcional "Mostrar maquinas sin programacion"; no incluir en primera version si complica.
- Maquinas baja/desuso: mostrar en gris/bloqueadas solo si vienen desde backend; documentar filtro mostrar/ocultar.
- `IMPRESO`: no crear enum nuevo; tratarlo como etiqueta visual/estado derivado hasta confirmar origen.
- Materializar desde matriz: permitir ciclo vencido o actual; futuro requiere confirmacion explicita o queda fuera de primera version.
- Pausar regla: no cancela tickets vivos ya creados; solo evita nuevos ciclos.
- Permisos: `SUPER_ADMIN`, `JEFE_MTTO`, `COORDINADOR_MTTO` pueden crear/editar/pausar/activar/materializar; tecnicos solo consultan si aplica.
- API usa `year`, no `anio`.
- Frontend API: no duplicar logica; reusar/mover/re-exportar `src/features/maquinaria/api/recurrencias-api.js`.

## 3. Estado actual detectado

### Backend recurrencias

Existe modelo `ReglaRecurrencia` en `backend/prisma/schema.prisma`.

Campos principales:

```txt
id
maquinaId
titulo
descripcion
categoria default MAQUINARIA
prioridad
tiempoEstimado
frecuencia
intervaloDias
tecnicoResponsableId
proximaFechaEjecucion
activo
tareas[]
createdAt
updatedAt
```

Frecuencias:

```txt
SEMANAL
QUINCENAL
MENSUAL
PERSONALIZADA_DIAS
```

Relaciones:

```txt
ReglaRecurrencia -> Maquina
ReglaRecurrencia -> Usuario tecnicoResponsable
Tarea -> reglaRecurrenciaId
```

Endpoints existentes:

```txt
GET    /api/maquinas/:id/recurrencias
GET    /api/recurrencias/:id
POST   /api/recurrencias
PUT    /api/recurrencias/:id
DELETE /api/recurrencias/:id
POST   /api/recurrencias/:id/materialize
GET    /api/recurrencias/proyecciones?year=2026
GET    /api/recurrencias/:id/proyeccion?year=2026
```

Cron existente:

```txt
procesarRecurrenciasProgramadas()
```

Comportamiento detectado:

- Busca reglas activas vencidas.
- Omite maquinas en baja.
- Materializa un ciclo por ejecucion.
- Evita duplicados por `reglaRecurrenciaId + fechaCicloLogica`.
- Avanza `proximaFechaEjecucion`.
- Crea tickets con `tipo=PLANEADA`, `clasificacion=PREVENTIVO`, `maquinaId` y `reglaRecurrenciaId`.

Faltante backend recomendado:

```txt
GET /api/recurrencias?activo=true&q=&maquinaId=&tecnicoId=&page=&limit=
GET /api/recurrencias/matriz?year=2026
```

### Frontend preventivos

Preventivos actual:

```txt
src/features/mantenimientos/pages/mantenimientos-preventivos.jsx
```

Actualmente renderiza:

```jsx
<MantenimientosHistoricoPage
  forcedClasificacion="PREVENTIVO"
  DesktopView={MantenimientosPreventivosDesktop}
  MobileView={MantenimientosPreventivosMobile}
/>
```

El listado actual muestra tickets reales preventivos. Debe conservarse.

Ya existe hook parcial:

```txt
src/features/mantenimientos/hooks/use-preventivos-matriz.js
```

Ese hook combina:

- `getProyeccionesGlobales`
- tickets reales de mantenimiento
- cache IndexedDB
- mapa por `maquinaId-mes`

Debe revisarse antes de reusarlo porque la nueva matriz sera una fila por regla recurrente.

API frontend existente:

```txt
src/features/maquinaria/api/recurrencias-api.js
```

Contiene funciones para listar, crear, actualizar, desactivar, materializar y consultar proyecciones.

Opciones aprobables para frontend API:

- A) mover a common/shared si aplica.
- B) re-exportar desde mantenimientos.
- C) crear wrapper en mantenimientos que consuma el mismo contrato.

No duplicar logica.

### Datos tipo Excel

El Excel sirve como referencia funcional, no como copia literal.

La matriz debe mostrar por regla:

```txt
Codigo maquina
Nombre maquina
Categoria/tipo maquinaria
Area/ubicacion
Responsable
Frecuencia
Enero ... Diciembre
```

Cada mes puede tener multiples ciclos:

```txt
10/01 Cerrado
17/01 Cerrado
24/01 Impreso
31/01 Pendiente
```

## 4. Arquitectura propuesta

Montar tabs internas dentro de:

```txt
src/features/mantenimientos/pages/mantenimientos-preventivos.jsx
```

Estructura propuesta:

```txt
src/features/mantenimientos/components/recurrentes/
  recurrentes-tabs.jsx
  recurrentes-toolbar.jsx
  recurrentes-listado.jsx
  recurrentes-listado-mobile.jsx
  recurrentes-matriz-desktop.jsx
  recurrentes-matriz-mobile.jsx
  recurrente-form-modal.jsx
  recurrente-detail-modal.jsx
  recurrente-actions.jsx
  recurrente-status-badge.jsx
  matriz-cell.jsx
  matriz-month-column.jsx
```

Hooks:

```txt
src/features/mantenimientos/hooks/use-recurrencias.js
src/features/mantenimientos/hooks/use-recurrencias-matriz.js
```

API:

```txt
src/features/mantenimientos/api/recurrencias-api.js
```

Este archivo debe envolver/re-exportar/reusar `src/features/maquinaria/api/recurrencias-api.js`, no duplicar logica.

## 5. UX propuesta

### Desktop

Tabs:

```txt
[ Tickets preventivos ] [ Plan recurrente ] [ Matriz anual ]
```

`Tickets preventivos`:

- Igual que hoy.
- Mantiene listado real preventivo.
- Mantiene create/edit/status actual.

`Plan recurrente`:

Tabla por regla recurrente.

Columnas sugeridas:

```txt
Codigo maquina
Maquina/equipo
Area/ubicacion
Responsable
Frecuencia
Proxima ejecucion
Tiempo estimado
Estado regla
Ticket pendiente actual
Acciones
```

Acciones:

- Crear regla.
- Editar regla.
- Pausar/activar.
- Materializar/generar ciclo actual o vencido.
- Ver historial.
- Ver en matriz.
- Desactivar regla.

`Matriz anual`:

- Una fila por regla recurrente.
- Si una maquina tiene dos reglas, aparecen dos filas con la misma maquina y distinta regla/frecuencia/responsable.
- Scroll horizontal.
- Meses Enero-Diciembre.
- Celdas con multiples ejecuciones por mes.

Estados visuales:

- Cerrado/resuelto.
- Asignado.
- En progreso.
- En pausa.
- Impreso como etiqueta derivada.
- Pendiente.
- Atrasado.
- Sin programar.
- Baja/desuso.

### Mobile

`Plan recurrente`:

- Cards por regla.
- Mostrar maquina, responsable, frecuencia, proxima fecha, estado.
- Acciones rapidas.

`Matriz anual`:

- No copiar tabla Excel completa.
- Vista recomendada: selector de regla/maquina + selector mes/year + lista de ejecuciones.

Ejemplo:

```txt
MBC0691 - Preventivo semanal - Enero 2026
10/01 Cerrado
17/01 Cerrado
24/01 Impreso
31/01 Pendiente
```

## 6. Contratos API propuestos

### Listado global de reglas

```txt
GET /api/recurrencias?activo=true&q=&maquinaId=&tecnicoId=&page=&limit=
```

Respuesta sugerida:

```json
{
  "data": [
    {
      "id": 10,
      "maquinaId": 1,
      "titulo": "Preventivo semanal",
      "categoria": "MAQUINARIA",
      "prioridad": "MEDIA",
      "tiempoEstimado": 60,
      "frecuencia": "SEMANAL",
      "intervaloDias": null,
      "proximaFechaEjecucion": "2026-01-10T00:00:00.000Z",
      "activo": true,
      "maquina": {
        "id": 1,
        "codigo": "MBC0691",
        "nombre": "Centro robotizado",
        "planta": "Planta Baja",
        "area": "Billeteras Lambda",
        "estado": "ACTIVA"
      },
      "tecnicoResponsable": {
        "id": 5,
        "nombre": "Emmanuel"
      }
    }
  ],
  "total": 1
}
```

### Matriz anual

```txt
GET /api/recurrencias/matriz?year=2026
```

Respuesta ideal:

```json
{
  "year": 2026,
  "rows": [
    {
      "maquina": {
        "id": 1,
        "codigo": "MBC0691",
        "nombre": "Centro de montaje robotizado",
        "categoria": "MAQUINARIA",
        "tipoMaquinaria": "Robot",
        "area": "Billeteras Lambda",
        "planta": "Planta Baja Mezannine ACC",
        "estado": "ACTIVA"
      },
      "regla": {
        "id": 10,
        "titulo": "Preventivo semanal",
        "frecuencia": "SEMANAL",
        "intervaloDias": null,
        "proximaFechaEjecucion": "2026-01-10",
        "activo": true,
        "tecnicoResponsable": {
          "id": 5,
          "nombre": "Emmanuel"
        }
      },
      "meses": {
        "1": [
          {
            "fechaInicio": "2026-01-10",
            "fechaFin": "2026-01-10",
            "estado": "RESUELTO",
            "ticketId": 123,
            "origen": "ticket"
          },
          {
            "fechaInicio": "2026-01-17",
            "fechaFin": null,
            "estado": "IMPRESO",
            "ticketId": 124,
            "origen": "ticket",
            "estadoDerivado": true
          }
        ],
        "2": []
      }
    }
  ]
}
```

Reglas contrato:

- Usar `year`, no `anio`.
- Una fila por regla.
- Backend calcula proyecciones.
- Frontend no recalcula recurrencias.
- Backend mezcla tickets reales + proyecciones.
- `IMPRESO` queda derivado, no enum nuevo.

## 7. Componentes frontend propuestos

Crear:

```txt
src/features/mantenimientos/components/recurrentes/recurrentes-tabs.jsx
src/features/mantenimientos/components/recurrentes/recurrentes-toolbar.jsx
src/features/mantenimientos/components/recurrentes/recurrentes-listado.jsx
src/features/mantenimientos/components/recurrentes/recurrentes-listado-mobile.jsx
src/features/mantenimientos/components/recurrentes/recurrentes-matriz-desktop.jsx
src/features/mantenimientos/components/recurrentes/recurrentes-matriz-mobile.jsx
src/features/mantenimientos/components/recurrentes/recurrente-form-modal.jsx
src/features/mantenimientos/components/recurrentes/recurrente-detail-modal.jsx
src/features/mantenimientos/components/recurrentes/recurrente-actions.jsx
src/features/mantenimientos/components/recurrentes/recurrente-status-badge.jsx
src/features/mantenimientos/components/recurrentes/matriz-cell.jsx
src/features/mantenimientos/components/recurrentes/matriz-month-column.jsx
```

Crear o adaptar:

```txt
src/features/mantenimientos/api/recurrencias-api.js
src/features/mantenimientos/hooks/use-recurrencias.js
src/features/mantenimientos/hooks/use-recurrencias-matriz.js
```

Revisar antes de usar:

```txt
src/features/mantenimientos/hooks/use-preventivos-matriz.js
```

## 8. Fases de implementacion

## Fase 1: Auditoria y diseno de contrato

Objetivo:

- Confirmar contrato final backend.
- Documentar matriz por regla.
- Confirmar tabs internas.
- No implementar funcionalidad.

Archivos a tocar:

```txt
docs/34_plan_submodulo_mantenimientos_recurrentes.md
```

Archivos a crear:

```txt
docs/34_plan_submodulo_mantenimientos_recurrentes.md
```

Criterios de aceptacion:

- Documento aprobado.
- Contrato matriz aprobado.
- Permisos aprobados.
- `IMPRESO` queda como decision pendiente tecnica.
- Se confirma no ruta hija.

Riesgos:

- Contrato incompleto puede forzar logica en frontend.
- Matriz por regla puede necesitar mas datos que proyecciones actuales.

Comandos validacion:

```bash
git status --short
git diff --stat
```

## Fase 2: Backend recurrencias y matriz

Objetivo:

- Agregar listado global de reglas.
- Agregar endpoint matriz anual.
- Mantener proyeccion en backend.
- Mantener idempotencia de materializacion.

Archivos a tocar:

```txt
backend/src/modules/recurrencias/01_list.ts
backend/src/modules/recurrencias/05_proyecciones.ts
backend/src/modules/recurrencias/zod/index.ts
backend/src/routes/recurrencias_rutas.ts
```

Archivos a crear:

```txt
backend/src/modules/recurrencias/07_matriz.ts
```

Criterios de aceptacion:

- `GET /api/recurrencias` funciona con filtros.
- `GET /api/recurrencias/matriz?year=2026` devuelve filas por regla.
- No se duplican tickets.
- Materializar solo permite ciclo actual/vencido por default.
- Futuro queda fuera o pide confirmacion explicita.
- Pausar regla no cancela tickets vivos.
- Maquinas baja/desuso se devuelven segun contrato y con estado claro.

Riesgos:

- Performance por muchas reglas y ciclos semanales.
- Diferencias de zona horaria en `fechaCicloLogica`.
- Estado derivado `IMPRESO` sin fuente clara.

Comandos validacion:

```bash
cd backend
npm run typecheck
```

## Fase 3: Frontend Plan recurrente

Objetivo:

- Agregar tabs internas.
- Mantener tickets preventivos intactos.
- Crear vista Plan recurrente desktop/mobile.
- Crear formulario de regla recurrente.

Archivos a tocar:

```txt
src/features/mantenimientos/pages/mantenimientos-preventivos.jsx
src/features/mantenimientos/views/mantenimientos-preventivos-desktop.jsx
src/features/mantenimientos/views/mantenimientos-preventivos-mobile.jsx
```

Archivos a crear:

```txt
src/features/mantenimientos/api/recurrencias-api.js
src/features/mantenimientos/hooks/use-recurrencias.js
src/features/mantenimientos/components/recurrentes/recurrentes-tabs.jsx
src/features/mantenimientos/components/recurrentes/recurrentes-toolbar.jsx
src/features/mantenimientos/components/recurrentes/recurrentes-listado.jsx
src/features/mantenimientos/components/recurrentes/recurrentes-listado-mobile.jsx
src/features/mantenimientos/components/recurrentes/recurrente-form-modal.jsx
src/features/mantenimientos/components/recurrentes/recurrente-detail-modal.jsx
src/features/mantenimientos/components/recurrentes/recurrente-actions.jsx
src/features/mantenimientos/components/recurrentes/recurrente-status-badge.jsx
```

Criterios de aceptacion:

- Tab Tickets preventivos queda igual.
- Tab Plan recurrente lista reglas.
- Crear/editar regla usa permisos admin.
- Tecnicos solo consultan si aplica.
- Pausar/activar funciona.
- Materializar actual/vencido funciona.
- Correctivos, Hoy Mantenimientos y Calendario Mantenimiento no cambian.

Riesgos:

- Reusar formulario de ticket para reglas seria error: regla no es ticket.
- API duplicada si se copia `recurrencias-api.js`.
- Permisos inconsistentes con otros modulos.

Comandos validacion:

```bash
cd mantenimiento-interno-frontend
npm run build
npx eslint src/features/mantenimientos/pages/mantenimientos-preventivos.jsx src/features/mantenimientos/components/recurrentes src/features/mantenimientos/hooks/use-recurrencias.js src/features/mantenimientos/api/recurrencias-api.js
```

## Fase 4: Matriz anual, QA y cierre

Objetivo:

- Crear matriz anual desktop/mobile.
- Conectar acciones desde celdas.
- Documentar cierre.

Archivos a tocar:

```txt
src/features/mantenimientos/pages/mantenimientos-preventivos.jsx
src/features/mantenimientos/hooks/use-preventivos-matriz.js
```

Archivos a crear:

```txt
src/features/mantenimientos/hooks/use-recurrencias-matriz.js
src/features/mantenimientos/components/recurrentes/recurrentes-matriz-desktop.jsx
src/features/mantenimientos/components/recurrentes/recurrentes-matriz-mobile.jsx
src/features/mantenimientos/components/recurrentes/matriz-cell.jsx
src/features/mantenimientos/components/recurrentes/matriz-month-column.jsx
docs/35_cierre_submodulo_mantenimientos_recurrentes.md
```

Criterios de aceptacion:

- Matriz desktop muestra una fila por regla.
- Mobile muestra vista usable por regla/mes.
- Celdas soportan multiples ejecuciones por mes.
- Click ticket real abre detalle.
- Click ciclo actual/vencido permite materializar.
- Futuro queda bloqueado o con confirmacion explicita.
- Maquinas baja/desuso se ven gris/bloqueadas si backend las envia.
- Build/lint OK.

Riesgos:

- Scroll horizontal pesado.
- Muchas reglas semanales pueden saturar UI.
- Cache IndexedDB puede quedar obsoleta si no se invalida por `year`.

Comandos validacion:

```bash
cd mantenimiento-interno-frontend
npm run build
npx eslint src/features/mantenimientos/components/recurrentes src/features/mantenimientos/hooks/use-recurrencias-matriz.js
```

## 9. Riesgos y decisiones pendientes

Riesgos:

- Endpoint matriz sin suficientes datos obliga frontend a recomponer demasiado.
- `IMPRESO` aun no tiene origen tecnico cerrado.
- Materializar futuros puede generar exceso de tickets.
- Maquinas de baja pueden confundir si no hay filtro claro.
- Varias reglas por maquina requieren UI clara.
- Permisos deben aplicarse igual en frontend y backend.

Decisiones pendientes:

- Origen real de `IMPRESO`.
- Mostrar u ocultar baja/desuso por default.
- Incluir maquinas sin regla en primera version o dejarlo fuera.
- Permitir materializar futuro con confirmacion o bloquearlo.
- Si pausa regla debe ofrecer aviso sobre tickets vivos.

## 10. Criterios de aceptacion globales

- Preventivos actual sigue funcionando.
- Correctivos no se rompe.
- Hoy Mantenimientos no se rompe.
- Calendario Mantenimiento no se rompe.
- Actividades no se mezclan.
- Recurrentes solo usan `MAQUINARIA/PREVENTIVO/PLANEADA`.
- Nunca se usa `PREVENTIVO` como `tipo`.
- No se generan tickets duplicados.
- Proyeccion calculada por backend.
- Matriz anual soporta semanal/quincenal/mensual/personalizada.
- Matriz usa una fila por regla.
- Mobile tiene vista usable.
- Build OK.
- ESLint OK.
- Backend typecheck OK.

## 11. Preguntas para aprobacion

1. Confirmar si maquinas baja/desuso se muestran ocultas por default.
2. Confirmar origen de `IMPRESO`.
3. Confirmar si materializar futuro queda fuera de primera version.
4. Confirmar si tecnicos pueden ver todas las reglas o solo asignadas.
5. Confirmar si maquinas sin regla quedan fuera de primera version.

## 12. Recomendacion final

Avanzar primero con backend matriz. La UI debe consumir contrato ya agrupado por regla y mes.

No implementar submodulo visual hasta tener:

- listado global de reglas;
- matriz anual por regla;
- permisos backend confirmados;
- politica de materializacion futura definida.
