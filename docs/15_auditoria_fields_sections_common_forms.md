# Auditoria de Fields y Sections duplicados para `common/forms`

## 1. Resumen ejecutivo

Los formularios de creacion y edicion de tareas tienen una duplicacion alta en controles atomicos y una duplicacion media-alta en secciones completas. `TicketFormModal`, `MobileTicketFormModal`, `MantenimientosFormModal` y `MobileMantenimientosFormModal` comparten el mismo modelo mental: titulo, descripcion, categoria, clasificacion, prioridad, fecha, tiempo estimado, responsables, maquina, planta/area y payload `FormData`. La diferencia real no esta en los fields simples, sino en las reglas condicionales: mantenimiento recurrente, maquinaria obligatoria, paro de produccion, rango horario, carrito/lote y permisos por rol.

El riesgo de extraer fields simples es bajo si se empieza por controles puramente presentacionales y controlados por props, especialmente `PrioridadField`. El riesgo sube al extraer fields que hoy mezclan UI, correccion de valor, validacion, defaults, permisos, payload y side effects; esto afecta principalmente fecha, responsables, maquinaria, recurrencia y horario programado. La recomendacion es iniciar Fase 2 con una extraccion minima, sin adapters ni sections complejas todavia.

## 2. Inventario de formularios

| Formulario | Archivo | Desktop/Mobile | Modulo | Proposito | Usa FormData/JSON | Riesgo de migracion |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TicketFormModal | `src/features/tickets/components/historico/ticket-form-modal.jsx` | Desktop | Tickets / Calendario actividades | Crear y editar tickets generales, con soporte de carrito/lote y campos admin | `FormData`; lote como arreglo de payloads | Medio: combina desktop, carrito, validaciones, maquina opcional y payload |
| MobileTicketFormModal | `src/features/tickets/components/historico/mobile-ticket-form-modal.jsx` | Mobile | Tickets / Calendario actividades | Crear y editar tickets generales en layout movil | `FormData` | Bajo-medio: mas simple que desktop, pero comparte maquina opcional y permisos admin |
| MantenimientosFormModal | `src/features/mantenimientos/components/common/mantenimientos-form-modal.jsx` | Desktop | Mantenimientos / Hoy / Calendario | Crear, editar y crear recurrencias de mantenimiento | `FormData`; JSON directo a `/api/recurrencias`; lote como arreglo | Alto: concentra recurrencia, carrito, rango horario, maquinaria obligatoria y paro |
| MobileMantenimientosFormModal | `src/features/mantenimientos/components/common/mobile-mantenimientos-form-modal.jsx` | Mobile | Mantenimientos / Hoy / Calendario | Crear, editar y crear recurrencias en layout movil | `FormData`; JSON directo a `/api/recurrencias` | Medio-alto: menos carrito que desktop, pero tiene recurrencia y rango horario |
| HoyFormModal | `src/features/hoy/components/common/hoy-form-modal.jsx` | Desktop wrapper | Hoy | Enrutador que decide entre `MantenimientosFormModal` y `HoyActividadesForm` | No construye payload | Bajo como wrapper; alto si se cambia el criterio de ruteo |
| HoyActividadesForm | `src/features/hoy/components/hoy-actividades/hoy-actividades-form.jsx` | Ambos por prop `isMobile` | Hoy Actividades / Tickets Actividades | Crear y editar actividades generales; tambien soporta carrito/lote | `FormData`; lote como arreglo de payloads | Alto: archivo grande con estado persistido, carrito, horario, maquinas y payload |
| CalendarioPage | `src/features/calendario/pages/calendario-page.jsx` | Ambos como page/orquestador | Calendario | Enruta creacion/edicion/revision a modales de tickets o mantenimientos segun scope/item | Delega `FormData`/JSON a formularios y APIs | Medio: no tiene fields propios, pero decide modal, endpoint y callback |
| MaquinaRecurrenciaFormModal | `src/features/maquinaria/components/maquina-recurrencia-form-modal.jsx` | Desktop | Maquinaria | Crear/editar regla recurrente desde ficha de maquina | JSON para recurrencias | Medio: simple visualmente, pero pertenece a flujo de reglas de maquina |

## 3. Inventario de fields duplicados

| Field | Archivos donde aparece | Diferencias visuales | Diferencias de estado | Diferencias de validacion | Puede extraerse ahora | Riesgo | Observaciones |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| TituloField | Tickets desktop/mobile, Mantenimientos desktop/mobile, HoyActividades, MaquinaRecurrencia | Label varia: `Titulo *`, `Titulo de la actividad *`, `Titulo de Tarea *`; contador en varios formularios, no en MaquinaRecurrencia | `titulo`, `setTitulo`; max 255 en formularios grandes | Minimo 3 caracteres; MaquinaRecurrencia usa mensaje global diferente | No | Medio | Mejor despues de `PrioridadField`; las variaciones de label y contador pueden causar cambios visuales |
| DescripcionField | Tickets desktop/mobile, Mantenimientos desktop/mobile, HoyActividades, MaquinaRecurrencia | En formularios grandes es colapsable con boton `Mas detalles`; en MaquinaRecurrencia siempre textarea | `descripcion`, `mostrarDescripcion`; MaquinaRecurrencia no usa toggle | Minimo 3 si se captura; default `Sin descripcion.` en payload; MaquinaRecurrencia manda `null` | No | Medio | Esta acoplado al comportamiento de mostrar/quitar y al default de payload |
| PrioridadField | Todos los formularios auditados excepto wrappers | Select visual muy parecido; MaquinaRecurrencia usa `select` nativo con clases locales | `prioridad`, `setPrioridad`; defaults varian entre `''` y `MEDIA` | Requerida en varios flujos; mensaje `Selecciona la prioridad.` cuando aplica | Si | Bajo | Primer candidato recomendado; no toca payload si solo reemplaza JSX controlado |
| FechaVencimientoField | Tickets desktop/mobile, Mantenimientos desktop/mobile, HoyActividades, MaquinaRecurrencia como fecha inicial | En tickets/mantenimientos incluye botones Hoy/Manana; labels cambian por recurrencia; MaquinaRecurrencia no tiene botones | `fechaVencimiento` o `proximaFechaEjecucion`; usa `hoyLocal`, defaultDate y clamp | Validaciones ya centralizadas parcialmente; edicion permite conservar fecha pasada | Parcialmente | Medio | Conviene despues de `PrioridadField`; necesita API flexible para label, min, quick actions y mensajes |
| ResponsablesField | Tickets desktop/mobile, Mantenimientos desktop/mobile, HoyActividades, MaquinaRecurrencia como tecnico unico | Desktop usa selectores/chips mas ricos; mobile usa select nativo/chips; recurrente permite un solo tecnico principal | `responsables`, `tecnicoCartId`, `tecnicoResponsableId`; maps y filtros locales | Obligatorio en mantenimientos/recurrentes/actividades, opcional en tickets generales | No | Alto | Mezcla multi-select, tecnico principal, carrito, carga de trabajo y permisos |
| MaquinaField | Tickets desktop/mobile, Mantenimientos desktop/mobile, HoyActividades, Calendario por delegacion | `SearchableSelect` repetido; mensajes de maquina validada varian | `maquinaId`, `maquinaInfo`, `validatingMaquina`, `opcionesMaquinas`, `maquinasRaw`; autocompleta planta/area | Obligatoria solo en mantenimientos/recurrentes; opcional o bloqueada en otros | No | Alto | Tiene side effects API y autocompletado; debe extraerse como section/hook mas adelante |
| PlantaAreaField | Tickets desktop/mobile, Mantenimientos desktop/mobile, HoyActividades | Dos selects en grid; deshabilitados si hay maquina; labels muy parecidos | `planta`, `area`, `areasOptions`; helper `deducirPlantaDeArea` duplicado | Planta/area obligatorias; mensajes varian levemente (`El area es obligatoria.` vs `Selecciona el area.`) | No | Medio | Candidato posterior; primero normalizar mensajes/props sin cambiar UI |
| EvidenciasField | No aparece como field activo en los formularios de captura auditados | N/A | N/A | N/A | No | Bajo | Evidencias existen en flujos de revision/detalle, fuera del alcance de estos formularios de creacion |
| TiempoEstimadoField | Tickets desktop/mobile, Mantenimientos desktop/mobile, HoyActividades, MaquinaRecurrencia | Formularios grandes usan `DurationPicker`; MaquinaRecurrencia usa input numerico simple | `tiempoEstimadoMins` vs `tiempoEstimado`; minutos en number/string | Obligatorio segun tipo/categoria/modo horario; opcional en MaquinaRecurrencia | Parcialmente | Medio | Buen candidato solo en variantes con `DurationPicker`; no incluir MaquinaRecurrencia al inicio |
| HorarioProgramadoField | Mantenimientos desktop/mobile, HoyActividades | Toggle `Rango Horario`, inputs `time`, resumen de duracion | `modoRangoHoras`, `horaInicio`, `horaFin`; defaults inteligentes | Valida rango 08:00-17:30 y fin posterior a inicio | No | Alto | Muy acoplado a conflictos de agenda, payload `horaInicioProgramada`/`horaFinProgramada` y defaults |

## 4. Inventario de sections duplicadas

| Section | Archivos donde aparece | Dependencias | Diferencias Desktop/Mobile | Puede extraerse ahora | Riesgo | Observaciones |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| MaquinariaSection | Tickets desktop/mobile, Mantenimientos desktop/mobile, HoyActividades | `getMaquinas`, `getMaquinaById`, `SearchableSelect`, planta/area, clasificacion, `validatingMaquina` | Desktop incluye layouts y mensajes mas amplios; mobile usa bloque vertical | No | Alto | Extraer field suelto seria fragil; requiere hook comun y contrato claro |
| RecurrenciaSection | Mantenimientos desktop/mobile, MaquinaRecurrenciaFormModal | `esRecurrente`, `frecuencia`, `intervaloDias`, tecnico responsable, fecha inicial, endpoint `/api/recurrencias` | Desktop tiene switch, resumen y carrito; mobile version compacta; MaquinaRecurrencia es modal especializado | No | Alto | No tocar hasta separar adapters de submit y reglas de preventivo |
| ParoProduccionSection | Tickets desktop/mobile, Mantenimientos desktop/mobile | `paroProduccion`, `impactoProduccionMins`, categoria, maquina, clasificacion correctiva | Visual casi igual, pero habilitacion depende del scope/clasificacion | No | Medio | Puede agruparse luego con ImpactoProduccionSection |
| ImpactoProduccionSection | Tickets desktop/mobile, Mantenimientos desktop/mobile | `DurationPicker`, `impactoProduccionMins`, `paroProduccion` | Similar entre desktop/mobile | No | Medio | Es simple visualmente, pero no debe separarse de `paroProduccion` |
| ResponsablesSection | Tickets desktop/mobile, Mantenimientos desktop/mobile, HoyActividades, MaquinaRecurrencia | `tecnicos`, `responsables`, `tecnicoCartId`, `tecnicoResponsableId`, chips, workload/cart | Desktop tiene selector de tecnico principal y chips; mobile select nativo; MaquinaRecurrencia tecnico unico | No | Alto | Alto riesgo por multi/single, lote, permisos y validaciones |
| EvidenciasSection | No aparece en los formularios de captura auditados | N/A | N/A | No | Bajo | Mantener fuera de Fase 2 inicial |
| HorarioProgramadoSection | Mantenimientos desktop/mobile, HoyActividades | `modoRangoHoras`, `horaInicio`, `horaFin`, `localMXTimeToISO`, conflictos backend | Desktop/mobile comparten idea, con diferencias de densidad | No | Alto | No extraer hasta aislar payload y validaciones de agenda |

## 5. Fields que NO conviene extraer todavia

- `RecurrenciaSection`: concentra el cambio de payload de `FormData` a JSON, llamada directa a `/api/recurrencias`, reglas de tecnico unico, frecuencia, intervalo y fecha inicial. Tocar esto ahora puede romper el flujo preventivo.
- `MaquinariaSection` / `MaquinaField`: hace llamadas API, valida existencia, autocompleta planta/area y cambia reglas de clasificacion. Necesita un hook comun antes de ser field seguro.
- `ResponsablesField`: cambia entre multi-responsable, tecnico principal, tecnico de carrito y tecnico responsable unico de recurrencia. Tambien impacta validaciones y payload.
- `HoyActividadesForm`: aunque duplica muchos fields, esta acoplado a carrito/lote, localStorage, horarios programados, conflictos de agenda y un layout responsive unico. No debe ser primer consumidor de fields nuevos.
- `MaquinaRecurrenciaFormModal`: visualmente simple, pero pertenece a reglas recurrentes de maquina y usa payload JSON distinto. Solo conviene usarlo como referencia, no como primer migrado.
- `HorarioProgramadoField`: su UI parece reusable, pero esta pegada a conversiones `localMXTimeToISO`, rango operativo y mensajes de conflicto devueltos por backend.
- `DescripcionField`: el toggle `Mas detalles`, contador, rows y default `Sin descripcion.` lo hacen menos atomico de lo que parece.

## 6. Primeros fields seguros para Fase 2

### 1. `PrioridadField`

- Por que es seguro: es un `Select` controlado, con opciones estaticas `PRIORIDADES`, no dispara side effects, no transforma payload y ya existe en todos los formularios grandes con labels casi iguales.
- Props necesarias: `id`, `value`, `onChange`, `options`, `error`, `helperText`, `disabled`, `required`, `label`, `className`.
- Formularios consumidores primero: `MobileTicketFormModal` y `MobileMantenimientosFormModal`, porque son mas chicos que los desktop y no tienen carrito/lote.
- Pruebas: crear ticket mobile, editar ticket mobile, crear mantenimiento mobile, verificar que `prioridad` viaja igual en `FormData`, ejecutar build y ESLint de archivos tocados.
- Rollback: revertir el nuevo field y reemplazos en los dos formularios mobile.

### 2. `FechaVencimientoField`

- Por que podria ser seguro: las validaciones core ya estan centralizadas y el input es controlado.
- Condicion: no cambiar labels, botones Hoy/Manana, `min`, clamp ni reglas de edicion.
- Props necesarias: `id`, `value`, `onChange`, `min`, `label`, `error`, `helperText`, `disabled`, `required`, `showQuickActions`, `onSetToday`, `onSetTomorrow`, `isToday`, `isTomorrow`, `description`.
- Formularios consumidores primero: solo uno o dos formularios mobile despues de `PrioridadField`.
- Pruebas: fecha pasada en creacion, conservar fecha pasada original en edicion, fecha recurrente, build/ESLint.
- Rollback: volver al bloque JSX local de fecha.

### 3. `TiempoEstimadoField`

- Por que podria ser seguro: `DurationPicker` esta duplicado y no modifica payload por si mismo.
- Condicion: extraer primero solo el picker de duracion simple, no el modo rango horario.
- Props necesarias: `valueMins`, `onChange`, `disabled`, `error`, `label`, `helperText`, `required`.
- Formularios consumidores primero: `MobileTicketFormModal` y `MobileMantenimientosFormModal` para el tiempo estimado simple.
- Pruebas: seleccionar horas/minutos, verificar `tiempoEstimado` en `FormData`, probar sin tiempo cuando es opcional.
- Rollback: restaurar `DurationPicker` local.

## 7. Props sugeridas por field

### `PrioridadField`

```jsx
<PrioridadField
  id="tf-pri"
  value={prioridad}
  onChange={setPrioridad}
  options={PRIORIDADES}
  error={fe.prioridad}
  disabled={isSubmitting}
  required
/>
```

### `FechaVencimientoField`

```jsx
<FechaVencimientoField
  id="tf-fecha"
  value={fechaVencimiento}
  onChange={setFechaVencimiento}
  min={hoyLocal}
  label={esRecurrente ? 'Fecha de inicio del mantenimiento recurrente *' : 'Fecha de vencimiento *'}
  error={fe.fechaVencimiento}
  disabled={isSubmitting}
  showQuickActions
  onSetToday={setToday}
  onSetTomorrow={setTomorrow}
  isToday={isHoy}
  isTomorrow={isManana}
/>
```

### `TiempoEstimadoField`

```jsx
<TiempoEstimadoField
  valueMins={tiempoEstimadoMins}
  onChange={setTiempoEstimadoMins}
  error={fe.tiempoEstimado}
  disabled={isSubmitting}
  label="Tiempo estimado"
/>
```

## 8. Riesgos principales

ID: R-01  
Severidad: Alta  
Descripcion: Extraer `MaquinariaSection` sin aislar primero efectos API y autocompletado de planta/area.  
Archivos: `ticket-form-modal.jsx`, `mobile-ticket-form-modal.jsx`, `mantenimientos-form-modal.jsx`, `mobile-mantenimientos-form-modal.jsx`, `hoy-actividades-form.jsx`.  
Impacto: Maquinas no validadas, planta/area incorrectas o bloqueo de submit.  
Mitigacion: Crear primero hook/documento de contrato; no tocar en Fase 2 inicial.  
Corregir ahora: No.

ID: R-02  
Severidad: Alta  
Descripcion: Extraer `RecurrenciaSection` antes de separar adapters de submit.  
Archivos: `mantenimientos-form-modal.jsx`, `mobile-mantenimientos-form-modal.jsx`, `maquina-recurrencia-form-modal.jsx`.  
Impacto: Payload JSON incorrecto, recurrencias duplicadas o callback `payload === null` roto.  
Mitigacion: Mantener recurrencia local hasta tener adapter y pruebas manuales.  
Corregir ahora: No.

ID: R-03  
Severidad: Alta  
Descripcion: Migrar `HoyActividadesForm` demasiado pronto.  
Archivos: `hoy-actividades-form.jsx`.  
Impacto: Regresiones en carrito/lote, localStorage, horario programado o conflictos de agenda.  
Mitigacion: Excluirlo de los primeros PRs de fields; usarlo solo como comparativo.  
Corregir ahora: No.

ID: R-04  
Severidad: Media  
Descripcion: Unificar labels y mensajes por accidente al extraer fields.  
Archivos: Todos los formularios de captura.  
Impacto: Cambio visual no deseado o perdida de mensajes exactos.  
Mitigacion: Props explicitas `label`, `helperText`, `required`; snapshots/manual QA de labels.  
Corregir ahora: No.

ID: R-05  
Severidad: Media  
Descripcion: Extraer `FechaVencimientoField` cambiando clamp, min o excepcion de edicion.  
Archivos: Tickets, Mantenimientos, HoyActividades, MaquinaRecurrencia.  
Impacto: Bloqueo de edicion historica o fechas incorrectas.  
Mitigacion: Mantener validadores comunes y probar edicion con fecha pasada original.  
Corregir ahora: No.

ID: R-06  
Severidad: Baja  
Descripcion: Empezar por `PrioridadField` puede crear diferencias visuales menores si no replica `Select` local.  
Archivos: Formularios mobile/desktop.  
Impacto: Inconsistencia visual leve.  
Mitigacion: Reusar `Label` y `Select` existentes, pasar `id` y `label` exactos.  
Corregir ahora: Si, en Fase 2 real.

## 9. Plan recomendado de Fase 2 real

Objetivo: extraer un unico field atomico y migrarlo en el alcance mas pequeno posible, sin cambiar comportamiento ni payload.

Archivos a tocar:

- Nuevo: `src/features/common/forms/tareas/fields/PrioridadField.jsx`
- Nuevo: `src/features/common/forms/tareas/fields/index.js`
- Migrar primero: `src/features/tickets/components/historico/mobile-ticket-form-modal.jsx`
- Migrar segundo, si el primero queda limpio en el mismo PR: `src/features/mantenimientos/components/common/mobile-mantenimientos-form-modal.jsx`

Field a extraer primero: `PrioridadField`.

Pruebas:

- `npm run build`
- `npx eslint src/features/common/forms/tareas/fields/PrioridadField.jsx src/features/common/forms/tareas/fields/index.js src/features/tickets/components/historico/mobile-ticket-form-modal.jsx src/features/mantenimientos/components/common/mobile-mantenimientos-form-modal.jsx`
- QA manual: abrir creacion/edicion mobile de ticket y mantenimiento, cambiar prioridad y confirmar que el valor queda en payload.

Rollback:

- Revertir el commit de Fase 2.
- O eliminar `PrioridadField.jsx`/`index.js` y restaurar los bloques locales de `<Label>` + `<Select>`.

Commit sugerido:

```text
refactor(frontend): extract common prioridad field for task forms
```

## 10. Decision final recomendada

Recomendacion: iniciar Fase 2 con **A) `PrioridadField`**.

`PrioridadField` es el candidato con mejor relacion valor/riesgo: no tiene llamadas API, no corrige fechas, no decide visibilidad, no cambia endpoints y no altera payload. `FechaVencimientoField` y `TiempoEstimadoField` son candidatos razonables, pero ambos tienen mas riesgo por quick actions, validaciones, modo recurrente, modo rango horario y obligatoriedad condicional. `Ninguno todavia` no parece necesario porque ya hay suficiente evidencia para una extraccion pequena y controlada.
