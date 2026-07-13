# Plan excepciones de preventivos recurrentes

## 1. Diagnostico actual

El sistema ya tiene un flujo base para preventivos recurrentes:

- `ReglaRecurrencia` define la programacion base.
- `procesarRecurrenciasProgramadas()` genera mantenimientos reales del mes actual.
- `fechaCicloLogica` funciona como fecha ancla/programada del ciclo.
- `fechaVencimiento` se calcula como fin del mes de `fechaCicloLogica`.
- `finalizadoAt` guarda la fecha real de cierre.
- Matriz y proyecciones usan `fechaCicloLogica` para ubicar el periodo.
- Calendario muestra programaciones virtuales como `PROGRAMACION_PREVENTIVA`.
- HOY solo muestra tareas reales, incluyendo preventivos recurrentes del mes.

Archivos clave actuales:

```txt
backend/prisma/schema.prisma
backend/src/modules/recurrencias/helper.ts
backend/src/modules/recurrencias/automations.ts
backend/src/modules/recurrencias/02_create.ts
backend/src/modules/recurrencias/05_proyecciones.ts
backend/src/modules/recurrencias/06_materialize.ts
backend/src/modules/recurrencias/07_matriz.ts
backend/src/modules/tickets/helper.ts
mantenimiento-interno-frontend/src/features/mantenimientos/components/recurrentes
mantenimiento-interno-frontend/src/features/calendario
mantenimiento-interno-frontend/src/features/hoy
```

Respuestas puntuales:

- La fecha programada/ancla se calcula en `helper.ts` con `calcularSiguienteFechaLogica()` y `generarProyeccionesPorAno()`.
- El ajuste de fin de semana actual esta en `ajustarPorFinDeSemana()`, pero hoy solo se usa en proyecciones como fecha sugerida. La generacion mensual actual usa fin de mes como limite.
- La tarea real se crea en `materializarCicloInterno()` dentro de `02_create.ts`.
- Las proyecciones futuras se calculan en `05_proyecciones.ts`.
- La matriz se arma en `07_matriz.ts`.
- HOY se decide en `backend/src/modules/tickets/helper.ts` con `perteneceAHoy`.
- Deben respetar ajustes: cron, materializacion manual, proyecciones, matriz, calendario, HOY y cualquier listado que use reglas recurrentes.

## 2. Problema a resolver

Hoy la regla recurrente es rigida. Si una regla dice "dia 11 de cada mes", todos los meses salen con esa fecha base. Operacion necesita decidir por ocurrencia:

- mover solo un mes/periodo a otra fecha;
- omitir solo un mes/periodo;
- quitar el ajuste y volver a la programacion base.

La regla base no debe cambiar. Historicos no deben borrarse. Otros meses no deben moverse.

## 3. Modelo recomendado

Crear un modelo de ajustes por ocurrencia. Nombre recomendado:

```txt
ReglaRecurrenciaAjuste
```

Razon: "ajuste" es lenguaje de usuario y negocio. "Excepcion" suena tecnico.

Principio:

```txt
Regla base = programacion normal.
Ajuste = decision operativa puntual sobre una ocurrencia exacta.
```

Una ocurrencia se debe identificar por:

```txt
reglaRecurrenciaId + fechaOriginal
```

No usar solo `periodoAnio + periodoMes`, porque semanal/quincenal/personalizada pueden tener varias ocurrencias dentro del mismo mes.

Decision adicional aprobada:

```txt
fechaCicloLogica = identidad original de la ocurrencia.
fechaProgramadaPreventiva = fecha efectiva/programada real de la tarea.
```

Cuando una ocurrencia se mueve, la tarea real necesita guardar ambas fechas:

```txt
fechaCicloLogica: 2026-09-11
fechaProgramadaPreventiva: 2026-09-20
fechaVencimiento: 2026-09-30
```

Si no hay movimiento, `fechaProgramadaPreventiva` puede quedar `null` y el sistema usa `fechaCicloLogica` como fecha programada.

## 4. Modelo de datos propuesto

Agregar enum:

```prisma
enum TipoAjusteRecurrencia {
  MOVER
  OMITIR
}
```

Agregar modelo:

```prisma
model ReglaRecurrenciaAjuste {
  id Int @id @default(autoincrement())

  reglaRecurrenciaId Int
  reglaRecurrencia ReglaRecurrencia @relation(fields: [reglaRecurrenciaId], references: [id], onDelete: Cascade)

  fechaOriginal DateTime
  periodoAnio Int
  periodoMes Int

  tipo TipoAjusteRecurrencia
  fechaNueva DateTime?
  motivo String? @db.Text
  activo Boolean @default(true)

  createdById Int
  createdBy Usuario @relation(fields: [createdById], references: [id], onDelete: Restrict)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([reglaRecurrenciaId, fechaOriginal])
  @@index([reglaRecurrenciaId, periodoAnio, periodoMes])
  @@index([tipo, activo])
}
```

Reglas:

- `OMITIR`: no genera mantenimiento para esa ocurrencia.
- `MOVER`: usa `fechaNueva` como fecha programada operativa.
- `fechaOriginal` siempre queda como identidad de la ocurrencia.
- `periodoAnio/periodoMes` son apoyo para consultas y matriz.
- `activo=false` permite conservar historial si se quita ajuste.

Agregar campo nullable en `Tarea`:

```prisma
fechaProgramadaPreventiva DateTime?
```

Nombre recomendado: `fechaProgramadaPreventiva`.

Motivo:

- Es claro para el dominio: solo aplica a preventivos recurrentes.
- Evita confundirlo con programaciones generales de tickets.
- Permite que calendario y UI muestren la fecha operativa real sin romper identidad/dedupe.

Regla de lectura:

```txt
fechaProgramada = fechaProgramadaPreventiva ?? fechaCicloLogica
```

Regla de escritura:

- Ocurrencia normal: `fechaProgramadaPreventiva = null`.
- Ocurrencia movida: `fechaProgramadaPreventiva = fechaNueva`.
- Ocurrencia omitida: no se crea tarea.

## 5. Backend a tocar

Archivos principales:

```txt
backend/prisma/schema.prisma
backend/src/modules/recurrencias/helper.ts
backend/src/modules/recurrencias/automations.ts
backend/src/modules/recurrencias/02_create.ts
backend/src/modules/recurrencias/05_proyecciones.ts
backend/src/modules/recurrencias/06_materialize.ts
backend/src/modules/recurrencias/07_matriz.ts
backend/src/modules/recurrencias/zod/index.ts
backend/src/routes/recurrencias_rutas.ts
backend/src/modules/tickets/helper.ts
```

Crear modulos:

```txt
backend/src/modules/recurrencias/08_ajustes.ts
backend/src/modules/recurrencias/ajustes-helper.ts
```

Helper recomendado:

```txt
resolverOcurrenciaConAjuste(regla, fechaOriginal)
```

Debe devolver:

```txt
fechaOriginal
fechaProgramada
omitida
ajuste
estadoAjuste
```

Impacto en generacion de tarea:

- `materializarCicloInterno()` debe recibir `fechaProgramadaPreventiva`.
- Si la ocurrencia no fue movida, guardar `null`.
- Si fue movida, guardar la fecha efectiva.
- `fechaVencimiento` sigue siendo fin de mes de `fechaCicloLogica`.
- `finalizadoAt` sigue siendo fecha real de cierre.

## 6. Frontend a tocar

Archivos principales:

```txt
src/features/mantenimientos/api/recurrencias-api.js
src/features/mantenimientos/hooks/use-recurrencias.js
src/features/mantenimientos/hooks/use-recurrencias-matriz.js
src/features/mantenimientos/components/recurrentes
src/features/mantenimientos/pages/mantenimientos-preventivos.jsx
src/features/calendario/api/calendario-api.js
src/features/calendario/hooks/use-calendario.js
src/features/calendario/utils/calendarioAdapter.js
src/features/calendario/views/calendario-desktop.jsx
src/features/calendario/views/calendario-mobile.jsx
```

Crear componentes:

```txt
src/features/mantenimientos/components/recurrentes/ajuste-ocurrencia-modal.jsx
src/features/mantenimientos/components/recurrentes/quitar-ajuste-modal.jsx
src/features/mantenimientos/components/recurrentes/ajuste-ocurrencia-actions.jsx
```

Crear API:

```txt
moverOcurrencia
omitirOcurrencia
quitarAjusteOcurrencia
getAjustesRegla
```

## 7. Matriz

La matriz debe ser el lugar principal para ajustar ocurrencias.

Acciones por ocurrencia:

- `Mover este mes`
- `Omitir este mes`
- `Quitar ajuste`
- `Ver programacion`
- `Generar mantenimiento` si aplica

Estados visuales:

- Normal: `Programado`
- Movido: `Movido este mes`
- Omitido: `Omitido este mes`
- Generado: `Mantenimiento generado`
- Realizado: `Realizado en el mes`
- Realizado fuera del mes: `Realizado fuera del mes`

Si una ocurrencia esta omitida, no mostrar:

```txt
Sin mantenimiento registrado este mes
```

Mostrar:

```txt
Omitido este mes
Motivo: ...
Ajuste operativo
```

## 8. Calendario

Calendario debe respetar ajustes en programaciones virtuales:

- Si esta movida: mostrar en `fechaNueva`.
- Si esta movida: indicar `Movido desde DD/MM`.
- Si esta omitida: ocultar por default.
- Opcional futuro: filtro `Mostrar omitidos`.

Click en `PROGRAMACION_PREVENTIVA`:

- Ver detalle.
- Si usuario tiene permiso: mover, omitir, quitar ajuste.
- No iniciar.
- No cerrar.
- No asignar.

Calendario no debe convertir programaciones virtuales en tareas.

## 9. HOY

HOY solo debe ver tareas reales generadas.

Reglas:

- Omitida: no se genera tarea, no aparece en HOY, no aparece atrasada.
- Movida: si se genera tarea real, aparece como preventivo del mes.
- Preventivo mensual no debe marcarse atrasado antes del fin de mes.
- HOY no debe mostrar programaciones virtuales.

El filtro actual de HOY por `reglaRecurrenciaId`, `PREVENTIVO`, `PLANEADA` y `fechaCicloLogica` del mes debe mantenerse, pero respetando que omitidos no crean tarea.

HOY debe seguir usando `fechaCicloLogica` para pertenencia mensual:

```txt
fechaCicloLogica dentro del mes actual
```

La fecha visible al usuario debe ser:

```txt
fechaProgramadaPreventiva ?? fechaCicloLogica
```

## 10. Formularios y modales

Modal `Mover este mes`:

- Fecha programada original.
- Nueva fecha programada.
- Motivo.
- Aviso: `Esta accion solo afecta este periodo. La programacion base no cambia.`

Modal `Omitir este mes`:

- Fecha programada original.
- Motivo.
- Confirmacion: `No se generara mantenimiento para este periodo. No se marcara como incumplimiento.`

Modal `Quitar ajuste`:

- Confirmacion: `Esta ocurrencia volvera a la programacion base.`

Motivo recomendado: obligatorio para `OMITIR`, opcional para `MOVER`.

## 11. Permisos

Pueden mover/omitir/quitar ajuste:

```txt
SUPER_ADMIN
JEFE_MTTO
COORDINADOR_MTTO
```

Tecnico:

- puede consultar si aplica;
- no mueve;
- no omite;
- no quita ajustes.

Backend debe validar permisos. Frontend solo oculta acciones.

## 12. Fines de semana

Opciones analizadas:

A. Regla global simple: sabado/domingo pasan al lunes siguiente.
B. Configuracion por regla: `SIGUIENTE_HABIL`, `ANTERIOR_HABIL`, `MANTENER_FECHA`.
C. Calendario laboral completo con feriados, vacaciones, paros.

Recomendacion primera version:

- Usar fines de semana solamente.
- Default: `SIGUIENTE_HABIL`.
- Vacaciones/paros: manejar con ajustes manuales de mover/omitir.
- No meter calendario laboral completo todavia.

Si usuario mueve manualmente a sabado/domingo:

- Respetar fecha elegida.
- Mostrar advertencia visual: `La fecha elegida cae en fin de semana.`
- No mover automatico una decision manual sin confirmacion.

## 13. Cualquier periodo

No hardcodear meses, vacaciones ni dias.

El sistema debe aceptar:

- cualquier regla;
- cualquier mes;
- cualquier fecha original proyectada;
- cualquier fecha nueva valida;
- semanal/quincenal/mensual/personalizada.

Para `MENSUAL`, `reglaId + fechaOriginal` resuelve el mes.
Para frecuencias con varias ocurrencias por mes, `fechaOriginal` es obligatoria.

## 14. Tareas ya generadas

Caso A: no existe tarea real.

- Mover: guardar ajuste. Cron/proyecciones/matriz/calendario lo respetan.
- Omitir: guardar ajuste. No se genera tarea.

Caso B: tarea real existe en `PENDIENTE` o `ASIGNADA`.

- Mover: permitir con confirmacion. Actualizar fecha programada/limite si corresponde.
- Omitir: permitir solo con confirmacion fuerte. Puede cancelar/eliminar segun politica final, recomendado no borrar; mejor marcar ajuste y pedir accion separada sobre tarea.

Caso C: tarea real existe en `EN_PROGRESO` o `EN_PAUSA`.

- Mover: bloquear o pedir confirmacion fuerte.
- Omitir: bloquear. Ya hay trabajo iniciado.

Caso D: tarea real esta `RESUELTO` o `CERRADO`.

- No permitir mover/omitir.
- Permitir solo observacion si se quiere documentar.

Caso E: quitar ajuste y ya existe tarea.

- Si tarea esta `PENDIENTE` o `ASIGNADA`: permitir volver a fecha base con confirmacion.
- Si tarea esta `EN_PROGRESO`, `EN_PAUSA`, `RESUELTO` o `CERRADO`: bloquear.

## 15. Endpoints propuestos

Contrato recomendado: acciones por ocurrencia + listado.

```txt
GET    /api/recurrencias/:id/ajustes
POST   /api/recurrencias/:id/ocurrencias/mover
POST   /api/recurrencias/:id/ocurrencias/omitir
DELETE /api/recurrencias/:id/ocurrencias/ajuste
```

Payload mover:

```json
{
  "fechaOriginal": "2026-09-11",
  "fechaNueva": "2026-09-20",
  "motivo": "Ajuste por operacion"
}
```

Payload omitir:

```json
{
  "fechaOriginal": "2026-12-11",
  "motivo": "Vacaciones"
}
```

Payload quitar ajuste:

```json
{
  "fechaOriginal": "2026-12-11"
}
```

Tambien se puede agregar CRUD interno para admin, pero UX debe usar acciones claras.

## 16. Riesgos

- Si `fechaCicloLogica` cambia a fecha nueva, se rompe deduplicado e historico por ocurrencia.
- Si se identifica por mes solamente, semanal/quincenal se rompe.
- Si omitido se muestra como `Sin mantenimiento registrado`, usuario lo lee como descuido.
- Si se permite omitir tarea en progreso, se puede perder trabajo real.
- Si calendario no respeta ajustes, muestra fechas viejas.
- Si cron no consulta ajustes antes de crear, genera duplicados o genera omitidos.
- Si frontend oculta botones pero backend no valida roles, permisos quedan incompletos.

## 17. Casos de prueba

Mensual base dia 11:

- Enero sin ajuste: aparece dia 11.
- Marzo movido a dia 18: matriz muestra `Movido este mes`; calendario muestra dia 18.
- Abril omitido: matriz muestra `Omitido este mes`; no aparece en HOY; no genera alerta negativa.
- Mayo sin ajuste: vuelve a dia 11.
- Junio movido: no afecta julio.

Semanal:

- Dos ocurrencias en mismo mes.
- Mover solo una ocurrencia por `fechaOriginal`.
- Omitir solo una ocurrencia.
- La otra ocurrencia sigue normal.

Fin de semana:

- Base cae domingo: default sugerido lunes siguiente.
- Usuario mueve manualmente a domingo: mostrar advertencia, respetar si confirma.

Tarea existente:

- `ASIGNADA` movida: actualiza fecha con confirmacion.
- `EN_PROGRESO` omitida: bloquea.
- `RESUELTO` movida: bloquea.

Calendario:

- Movido aparece en nueva fecha.
- Omitido no aparece por default.
- Tarea real dedupea programacion virtual.

HOY:

- Omitido no aparece.
- Movido generado aparece como tarea real.
- No se marca atrasado antes de fin de mes.

## 18. Plan de implementacion

## Fase 1 Backend

Objetivo:

- agregar modelo de ajustes;
- hacer que cron, proyecciones, matriz y materializacion respeten mover/omitir;
- mantener HOY solo con tareas reales.

Trabajo:

- Crear `ReglaRecurrenciaAjuste`.
- Crear enum `TipoAjusteRecurrencia`.
- Crear helper de resolucion de ocurrencias.
- Aplicar ajuste al generar ciclos.
- Aplicar ajuste en `getProyeccionesGlobal`.
- Aplicar ajuste en `getMatrizRecurrencias`.
- Aplicar ajuste en `materializeRegla`.
- Agregar endpoints de mover/omitir/quitar ajuste.
- Agregar validaciones Zod.
- Mantener dedupe por `reglaRecurrenciaId + fechaOriginal`.
- Para ocurrencia movida, recomendado:
  - `fechaCicloLogica = fechaOriginal`
  - `fechaProgramadaPreventiva = fechaNueva` cuando la ocurrencia fue movida.

Recomendacion tecnica clave:

```txt
Mantener fechaCicloLogica como fecha original.
Guardar fechaNueva en ajuste.
Agregar en Tarea fechaProgramadaPreventiva para la fecha efectiva real.
Agregar en respuestas fechaProgramada = fechaProgramadaPreventiva ?? fechaCicloLogica.
```

Esto protege matriz, calendario, dedupe e historicos.

Por que no basta con `fechaNueva` solo en ajuste:

- La tarea real debe conservar la fecha efectiva aun si luego el ajuste se desactiva o cambia.
- Calendario/listados de tareas no deberian depender de hacer join contra ajustes para saber la fecha programada real.
- Historico queda mas claro: identidad original y fecha operativa quedan dentro de la tarea generada.
- Evita inconsistencias si una tarea fue generada y despues se quita el ajuste.

Validacion:

```bash
cd backend
npm run typecheck
```

## Fase 2 Frontend

Objetivo:

- permitir ajustes desde matriz;
- mostrar movido/omitido sin lenguaje de castigo;
- opcionalmente permitir ajustes desde calendario;
- respetar permisos.

Trabajo:

- Agregar API frontend para ajustes.
- Agregar modales mover/omitir/quitar ajuste.
- Agregar acciones en matriz.
- Mostrar estados `Movido este mes` y `Omitido este mes`.
- Actualizar calendario para proyecciones ajustadas.
- Ocultar omitidos en calendario por default.
- Mantener HOY sin virtuales.
- Agregar textos UX aprobados.

Validacion:

```bash
cd mantenimiento-interno-frontend
npm run build
npx eslint src/features/mantenimientos/components/recurrentes src/features/mantenimientos/hooks src/features/mantenimientos/api src/features/calendario
```

## Decision recomendada final

Usar `ReglaRecurrenciaAjuste` por ocurrencia exacta:

```txt
unique(reglaRecurrenciaId, fechaOriginal)
```

Mantener la regla base intacta. Mantener `fechaCicloLogica` como identidad original. Agregar `fechaProgramadaPreventiva` nullable en `Tarea` para la fecha efectiva real cuando una ocurrencia se mueve.

Regla final:

```txt
Identidad/matriz/dedupe: fechaCicloLogica
Fecha visible/calendario: fechaProgramadaPreventiva ?? fechaCicloLogica
Limite mensual: fechaVencimiento
Cierre real: finalizadoAt
```

`OMITIR` nunca debe contarse como descuido.
