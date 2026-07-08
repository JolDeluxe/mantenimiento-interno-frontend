# Auditoria de sections: Maquinaria y Responsables

## 1. Resumen ejecutivo

Esta fase compara sections duplicadas candidatas para extraccion comun. No implementa componentes, no modifica formularios y no cambia `common/forms`.

Las dos candidatas principales son `MaquinariaSection` y `ResponsablesSection`. La auditoria muestra que `MaquinariaSection` tiene duplicacion clara, pero tambien mayor acoplamiento: categoria, clasificacion, planta, area, validacion remota de maquina, recurrencia y paro de produccion. `ResponsablesSection` tambien tiene variantes desktop/mobile y modo carrito, pero su superficie esta mas contenida alrededor de tecnicos, responsables y workload.

## 2. Estado base

- Ultimo commit base: `fb00c3b docs(frontend): document common fields closure and sections plan`
- Frontend: limpio antes de crear este documento.
- Backend: limpio antes de crear este documento.
- Archivo creado: `docs/17_auditoria_sections_maquinaria_responsables.md`
- Confirmacion: no se toco codigo.

## 3. Section candidata: MaquinariaSection

| Formulario | Archivo | Condicion de render | Estados usados | Handlers usados | Componentes usados | Errores mostrados | Side effects | Diferencias relevantes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ticket desktop | `src/features/tickets/components/historico/ticket-form-modal.jsx` | `categoria === 'MAQUINARIA' && scope !== 'actividades'` | `categoria`, `maquinaId`, `maquinaInfo`, `validatingMaquina`, `opcionesMaquinas`, `maquinasRaw`, `clasificacion`, `planta`, `area` | inline `onChange` de categoria y `SearchableSelect`, `setMaquinaId`, `setMaquinaInfo`, `setPlanta`, `setArea`, `setClasificacion` | `Label`, `Select`, `SearchableSelect`, `Icon` | `fe.maquinaId`, `fe.clasificacion` | seleccion limpia/asigna planta y area; limpiar maquina limpia ubicacion; categoria no maquinaria limpia maquina/ubicacion; puede activar paro | Usa `lockBaseFields`; clasificacion solo aparece en maquinaria no actividades con condicion extra por edicion/clasificacion previa. |
| Ticket mobile | `src/features/tickets/components/historico/mobile-ticket-form-modal.jsx` | `categoria === 'MAQUINARIA' && scope !== 'actividades'` | mismos estados principales | mismos handlers inline | `Label`, `Select`, `SearchableSelect`, `Icon` | `fe.maquinaId`, `fe.clasificacion` | mismos side effects de maquina/planta/area | No usa `lockBaseFields`; layout mobile; clasificacion condicionada como desktop ticket. |
| Mantenimientos desktop | `src/features/mantenimientos/components/common/mantenimientos-form-modal.jsx` | `categoria === 'MAQUINARIA' && scope !== 'actividades'`; en scope mantenimientos categoria inicia como `MAQUINARIA` | mismos estados, mas `esRecurrente` y estados relacionados alrededor del bloque | mismos handlers inline; tambien cambios por categoria inicial de mantenimientos | `Label`, `Select`, `SearchableSelect`, `Icon` | `fe.maquinaId`, `fe.clasificacion` | seleccion de maquina bloquea planta/area; maquina habilita recurrencia; maquina puede ser requerida por scope mantenimientos | Para `scope === 'mantenimientos'` oculta selector de categoria y marca maquinaria/clasificacion como requerida. |
| Mantenimientos mobile | `src/features/mantenimientos/components/common/mobile-mantenimientos-form-modal.jsx` | `categoria === 'MAQUINARIA'`; scope mantenimientos parte en maquinaria | mismos estados principales | mismos handlers inline | `Label`, `Select`, `SearchableSelect`, `Icon` | `fe.maquinaId`, `fe.clasificacion` | mismos side effects; maquina habilita recurrencia | No usa `lockBaseFields`; en mobile mantenimientos la condicion no repite `scope !== 'actividades'`; label de maquinaria no agrega asterisco aunque la validacion puede requerirla. |

Respuestas clave:

1. La section aparece en los 4 formularios.
2. Usa `SearchableSelect` con la misma idea: `options`, `value`, `onChange`, `placeholder`, `searchPlaceholder`, `allOptionText={null}` e icono `precision_manufacturing`.
3. Se muestra cuando la categoria es `MAQUINARIA`; en tickets se excluye `scope === 'actividades'`; en mantenimientos el scope suele iniciar ya en maquinaria.
4. Es requerida cuando `scope === 'mantenimientos'` y tambien para mantenimiento recurrente; en tickets generales puede ser opcional si la categoria no exige mantenimiento.
5. Se valida con `fe.maquinaId` y reglas de existencia: si hay `maquinaId` sin `maquinaInfo` y no esta validando, aparece "La maquina ingresada no existe."; en mantenimientos tambien se exige maquina.
6. Al seleccionar maquina se setea `maquinaId`, se busca en `maquinasRaw`, se setea `maquinaInfo`, `planta` y `area`.
7. Al limpiar maquina se limpian `maquinaId`, `maquinaInfo`, `planta` y `area`.
8. Toca campos derivados: planta, area, clasificacion, paro de produccion y recurrencia.
9. Si, toca planta/area y tambien bloquea sus selects cuando hay `maquinaInfo`.
10. Si, toca clasificacion al cambiar categoria y renderiza el selector de clasificacion cerca del bloque.
11. Si, depende de `scope`, especialmente `mantenimientos` y `actividades`.
12. Si, en tickets la clasificacion tiene condicion extra con `esEdicion` y `ticketAEditar?.clasificacion`.
13. Si, desktop usa `lockBaseFields`; mobile no.
14. Desktop/mobile difieren en layout, bloqueo por `lockBaseFields` y algunas condiciones/labels.
15. Riesgo de extraccion: medio/alto. La section no es solo visual; concentra side effects sobre ubicacion y estados de negocio.

## 4. Section candidata: ResponsablesSection

| Formulario | Archivo | Condicion de render | Estados usados | Handlers usados | Componentes usados | Errores mostrados | Side effects | Diferencias relevantes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ticket desktop | `src/features/tickets/components/historico/ticket-form-modal.jsx` | `esAdmin && tecnicos.length > 0`; variante segun `modoCarrito` | `responsables`, `tecnicoCartId`, `carrito`, `tecnicos`, `tecnicoMapEdit`, `opcionesDisponiblesEdit`, `isDropdownOpen` | `handleAddTecnicoEdit`, `handleRemoveTecnicoEdit`, handlers de carrito | `TecnicoDropdown`, `TecnicoChip`, `TecnicoCartSelector`, `Icon`, `Label` | `fe.responsables` | agrega/quita responsables; en carrito sincroniza tecnico principal con items | Desktop tiene dropdown custom con workload y modo carrito con tecnico principal. |
| Ticket mobile | `src/features/tickets/components/historico/mobile-ticket-form-modal.jsx` | `esAdmin && tecnicos.length > 0` | `responsables`, `tecnicos`, `tecnicoMap`, `opcionesDisponibles` | `handleAddTecnico`, `handleRemoveTecnico`, `buildOptionLabel` | `Select` nativo, `TecnicoChip`, `Icon`, `Label` | no muestra `fe.responsables` en el bloque mobile auditado | agrega/quita ids en `responsables` | Mobile es mucho mas simple: select nativo y chips compactos. |
| Mantenimientos desktop | `src/features/mantenimientos/components/common/mantenimientos-form-modal.jsx` | `esAdmin && tecnicos.length > 0`; variante segun `modoCarrito` | mismos estados que ticket desktop | mismos handlers de edicion y carrito | mismos componentes locales: `TecnicoDropdown`, `TecnicoChip`, `TecnicoCartSelector`, `Icon`, `Label` | `fe.responsables` | agrega/quita responsables; carrito mantiene tecnico principal; recurrente puede requerir responsable | Muy parecido a ticket desktop, pero validacion en mantenimientos es mas estricta para recurrente/mantenimiento. |
| Mantenimientos mobile | `src/features/mantenimientos/components/common/mobile-mantenimientos-form-modal.jsx` | `esAdmin && tecnicos.length > 0` | `responsables`, `tecnicos`, `tecnicoMap`, `opcionesDisponibles` | `handleAddTecnico`, `handleRemoveTecnico`, `buildOptionLabel` | `Select` nativo, `TecnicoChip`, `Icon`, `Label` | no se observa `fe.responsables` renderizado en el bloque mobile simple | agrega/quita ids en `responsables` | Mobile mantenimientos replica mobile ticket casi igual, con diferencia de validacion externa. |

Respuestas clave:

1. La section aparece en los 4 formularios.
2. Si, se muestra solo para admin (`esAdmin`) y cuando hay tecnicos.
3. Si, depende de `tecnicos.length > 0`.
4. Desktop usa componentes locales custom (`TecnicoDropdown`, `TecnicoCartSelector`); mobile usa `Select` nativo.
5. Agrega tecnicos con `handleAddTecnico*`, evitando duplicados.
6. Quita tecnicos filtrando `responsables`.
7. Calcula disponibles filtrando tecnicos no incluidos en `responsables`.
8. Muestra chips con `TecnicoChip`; desktop usa chip mas grande, mobile chip compacto.
9. Si, desktop usa workload de forma rica; mobile lo incluye en `buildOptionLabel`.
10. Si, desktop/mobile difieren bastante en control de seleccion.
11. Tickets y mantenimientos son muy parecidos visualmente, pero mantenimientos tiene reglas de validacion mas estrictas alrededor de responsables.
12. Depende de admin/roles mediante `esAdmin`; no se ve dependencia directa de permisos adicionales en la section.
13. Riesgo de extraccion: medio. Menor que maquinaria, pero no trivial por desktop carrito y componentes internos.

## 5. Componentes internos relacionados

| Componente/helper | Donde aparece | Es identico | Se puede extraer primero | Riesgo |
| --- | --- | --- | --- | --- |
| `TecnicoChip` | Los 4 formularios | No. Desktop usa chip mas grande; mobile usa chip compacto. Tickets/mantenimientos son similares por plataforma. | Si, con variante `size` o dos componentes. | Bajo/medio por diferencias visuales. |
| `TecnicoRow` | Desktop ticket y desktop mantenimientos | Casi identico. | Si, antes de `ResponsablesSection`. | Bajo, es visual y encapsula workload. |
| `WorkloadBadge` | Desktop ticket y desktop mantenimientos | Identico. | Si. | Bajo. |
| `buildOptionLabel` | Mobile ticket y mobile mantenimientos | Compatible; genera texto para opcion nativa con workload/cargo. | Si, como helper. | Bajo. |
| `deducirPlantaDeArea` | Los 4 formularios | Dos variantes: desktop ticket/mantenimientos asumen mapa; mobile usa validaciones mas defensivas. | Si, pero fuera de Responsables; conviene hacerlo antes de `PlantaAreaSection`. | Bajo/medio por diferencias defensivas. |
| `TecnicoDropdown` | Desktop ticket y desktop mantenimientos | Practicamente identico. | Si, pero arrastra workload y estado de apertura. | Medio. |
| `TecnicoCartSelector` | Desktop ticket y desktop mantenimientos | Muy parecido; una variante usa `queueMicrotask` para limpiar busqueda. | Si, despues de `TecnicoRow`/`WorkloadBadge`. | Medio. |

## 6. Recomendacion de orden

Comparacion:

- `MaquinariaSection` reduce duplicacion visible, pero tiene side effects sobre `planta`, `area`, `clasificacion`, `maquinaInfo`, recurrencia y paro de produccion. Tiene mayor probabilidad de alterar comportamiento.
- `ResponsablesSection` reduce duplicacion fuerte, especialmente entre desktop ticket/mantenimientos y mobile ticket/mantenimientos. Esta mas acotada a `responsables` y `tecnicos`, aunque desktop tiene modo carrito.

Decision: conviene empezar por `ResponsablesSection`, pero no como section completa en el primer commit. El paso mas seguro es extraer primero componentes internos visuales (`WorkloadBadge`, `TecnicoRow`, y posiblemente `TecnicoChip`) para reducir duplicacion sin tocar payloads ni validaciones.

## 7. Propuesta de API para MaquinariaSection

Propuesta conceptual:

```jsx
<MaquinariaSection
  categoria={categoria}
  scope={scope}
  esEdicion={esEdicion}
  ticketAEditar={ticketAEditar}
  maquinaId={maquinaId}
  maquinaInfo={maquinaInfo}
  maquinasRaw={maquinasRaw}
  opcionesMaquinas={opcionesMaquinas}
  validatingMaquina={validatingMaquina}
  fe={fe}
  disabled={isSubmitting || lockBaseFields}
  onSelectMaquina={...}
  onClearMaquina={...}
  onSetPlanta={setPlanta}
  onSetArea={setArea}
/>
```

Esta API es grande y todavia incompleta porque la section real tambien roza `clasificacion`, `setClasificacion`, `paroProduccion`, `esRecurrente`, `scope`, `planta`, `area` y bloqueos de ubicacion. Antes de implementarla conviene extraer handlers puros como `selectMaquina`, `clearMaquina` o helpers de ubicacion, y definir si clasificacion vive dentro o fuera de la section.

## 8. Propuesta de API para ResponsablesSection

Propuesta conceptual para modo simple:

```jsx
<ResponsablesSection
  esAdmin={esAdmin}
  tecnicos={tecnicos}
  responsables={responsables}
  opcionesDisponibles={opcionesDisponibles}
  tecnicoMap={tecnicoMap}
  disabled={isSubmitting}
  error={fe.responsables}
  onAddTecnico={handleAddTecnico}
  onRemoveTecnico={handleRemoveTecnico}
/>
```

Esta API es razonable para mobile/simple. Para desktop completo harian falta props adicionales: `modoCarrito`, `tecnicoCartId`, `onChangeTecnicoCart`, `carrito`, `onSyncCarrito`, `isDropdownOpen`, `onDropdownToggle`, y tal vez componentes internos. Por eso conviene una fase lite de componentes internos antes de una `ResponsablesSection` total.

## 9. Riesgos

- Riesgo visual: medio. Responsables tiene desktop custom y mobile nativo; maquinaria tiene animaciones y bloques de informacion.
- Riesgo de payload: bajo si solo se extraen componentes visuales; medio si se mueve section completa porque responsables y maquina alimentan payload.
- Riesgo de permisos: bajo/medio. Responsables depende de `esAdmin`; maquinaria depende mas de `scope`.
- Riesgo de validacion: medio. Maquinaria y responsables tienen errores especificos por scope y modo.
- Riesgo de estado local: medio/alto. Maquinaria cambia planta/area/clasificacion; responsables cambia arrays y carrito.
- Riesgo desktop/mobile: medio. Las variantes son reales, no solo CSS.
- Riesgo tickets/mantenimientos: medio. Visualmente son similares, pero mantenimientos agrega recurrencia, obligatoriedad y reglas mas estrictas.

## 10. Decision final

Recomendacion clara: **Opcion C: extraer primero componentes internos como `WorkloadBadge`, `TecnicoRow`, `TecnicoChip` y/o `buildOptionLabel` antes de la section completa.**

Luego, con esos componentes estabilizados, avanzar a `ResponsablesSection` antes que `MaquinariaSection`. `MaquinariaSection` debe esperar porque es mas acoplada a planta/area, clasificacion, recurrencia y paro de produccion.

## 11. Proxima fase sugerida

**Fase 3B-lite: Extraer componentes internos de responsables sin crear todavia `ResponsablesSection`.**

Alcance sugerido:

- Crear `WorkloadBadge` comun.
- Crear `TecnicoRow` comun para desktop.
- Evaluar `TecnicoChip` con variante desktop/mobile.
- Evaluar helper `buildOptionLabel` para mobile.
- No tocar payloads, validaciones, permisos ni handlers de negocio.

Si esa fase queda limpia, la siguiente podria ser:

**Fase 3C: Extraer `ResponsablesSection` en modo controlado para variantes simples, dejando modo carrito desktop para una fase posterior si resulta necesario.**
