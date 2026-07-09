# Auditoria tickets: formularios actividades vs historico

## 1. Resumen

Auditoria sin cambios de codigo.

Hallazgo central: `tickets-actividades` y `tickets-historico` no usan mismo formulario en todos los caminos. Actividades usa formularios de Hoy para crear y editar, por eso muestra `Rango Horario`. Historico usa `TicketFormModal` / `MobileTicketFormModal`, que usan `TiempoHorarioSection` con solo fecha + duracion, sin toggle de rango horario.

## 2. Estado base

- Frontend: `feature/mantenimientos-recurrentes`
- Backend: `feature/mantenimientos-recurrentes`
- Commit base: `4b5faf4 refactor(frontend): extract common activity form modal`
- Frontend/backend limpios al inicio.

## 3. Routing real tickets

| Vista/Pagina | Abre que modal | Props relevantes | Scope/tipo/clasificacion | Observacion |
| --- | --- | --- | --- | --- |
| `tickets-actividades` create desktop | `TicketsListadoBase` -> `HoyFormModal` -> `ActividadFormModal` | `mode="actividades"`, `scope="actividades"` | filtro `tipoIn: PLANEADA, EXTRAORDINARIA` | Tiene `Rango Horario`. |
| `tickets-actividades` create mobile | `TicketsListadoBase` -> `MobileHoyFormModal` -> `ActividadFormModal` | `mode="actividades"`, `scope="actividades"`, `isMobile` | filtro `tipoIn: PLANEADA, EXTRAORDINARIA` | Tiene `Rango Horario`, sin carrito por mobile. |
| `tickets-actividades` edit desktop | `ActividadesTicketTable` -> `HoyFormModal` -> `ActividadFormModal` | `scope="actividades"` | por ticket editado | Tiene `Rango Horario`. |
| `tickets-actividades` edit mobile | `TicketsActividadesMobile` -> `MobileHoyFormModal` -> `ActividadFormModal` | `scope="actividades"` | por ticket editado | Tiene `Rango Horario`. |
| `tickets-historico` create desktop | `TicketsListadoBase` -> `TicketFormModal` | `mode="historico"`, `scope="actividades"` | sin filtro tipo default | No tiene `Rango Horario`. |
| `tickets-historico` create mobile | `TicketsListadoBase` -> `MobileTicketFormModal` | `mode="historico"`, `scope="actividades"` | sin filtro tipo default | No tiene `Rango Horario`. |
| `tickets-historico` edit desktop | `TicketsHistoricoDesktop` -> `TicketFormModal` | no pasa `scope`; default `general` | por ticket editado | No tiene `Rango Horario`. |
| `tickets-historico` edit mobile | `TicketsHistoricoMobile` -> `MobileTicketFormModal` | `scope="actividades"` | por ticket editado | No tiene `Rango Horario`. |
| `tickets-reportes` create | no crea | `allowCreate={false}` | filtro `tipo: TICKET` | No aplica. |

## 4. Historico vs Actividades

Respuesta: parcial.

Creacion se decide en `TicketsListadoBase`:

- si `mode === 'actividades'`: usa `HoyFormModal` / `MobileHoyFormModal`;
- si no: usa `TicketFormModal` / `MobileTicketFormModal`.

Edicion:

- actividades desktop/mobile usan modales de Hoy;
- historico desktop/mobile usan modales historicos de tickets.

Por eso se comportan distinto aunque ambos vivan bajo `src/features/tickets`.

## 5. Donde vive Rango Horario

`Rango Horario` vive en:

- `src/features/common/forms/tareas/actividades/ActividadFormModal.jsx`

Condicion:

- aparece dentro de `esAdmin`;
- usa estado `modoRangoHoras`;
- no depende de `scope`;
- no depende de `tipo`;
- no depende de prop de pagina salvo llegar a `ActividadFormModal`;
- `isMobile` solo desactiva carrito, no el rango.

`TicketFormModal` y `MobileTicketFormModal` no tienen `modoRangoHoras`. Usan:

- `TiempoHorarioSection`
- `DurationPicker`
- `tiempoEstimadoMins`

Sin toggle de rango horario.

## 6. Causa raiz

Causa raiz: formularios distintos.

`tickets-actividades` usa camino Hoy -> `ActividadFormModal`, con rango horario. `tickets-historico` usa `TicketFormModal` / `MobileTicketFormModal`, donde la seccion comun `TiempoHorarioSection` no incluye rango horario.

No hay ocultamiento explicito por historico. Es diferencia de formulario y capacidad.

## 7. Comparacion con ActividadFormModal

| Formulario | Usa common/forms | Que usa | Que falta | Riesgo |
| --- | --- | --- | --- | --- |
| `ticket-form-modal.jsx` | Si | `TituloField`, `PrioridadField`, `DescripcionField`, `MaquinaSelectField`, `PlantaAreaFields`, `TiempoHorarioSection`, responsables | No tiene `modoRangoHoras` ni batch de actividades | Medio si se agrega rango; toca payload horario. |
| `mobile-ticket-form-modal.jsx` | Si | mismos fields principales + `TiempoHorarioSection` mobile | No tiene `modoRangoHoras`; horas 24 en duration | Medio. |
| `ActividadFormModal.jsx` | Si | fields comunes + responsables comunes + logica propia | Aun tiene `DurationPicker` local y reglas hardcodeadas | Medio si se reutiliza fuera de Hoy. |

## 8. Puede Tickets Actividades usar ActividadFormModal

Ya lo usa para `mode="actividades"` mediante `HoyFormModal` / `MobileHoyFormModal`.

Uso directo posible: si se conecta desde tickets sin pasar por Hoy routers.

Falta si se quiere uso directo:

- rules propias para tickets, no Hoy;
- decidir prefijo `localStorage`;
- decidir `defaultModoLista`;
- decidir si batch aplica;
- decidir si wrapper Hoy sigue o se generaliza;
- confirmar payload batch en `TicketsListadoBase`.

Ganancia: un solo formulario para actividades.

Ruptura potencial: mezclar semantica Hoy con Tickets si se usa `hoyActividadesRules` directo. Riesgo de drafts compartidos y batch/carrito no deseado.

## 9. Debe existir formulario comun para actividades/tickets

Decision recomendada: **B) Crear `TicketActividadFormModal` comun o rules propias para actividades en tickets sobre `ActividadFormModal`.**

Motivo: `ActividadFormModal` ya es el formulario comun de actividades, pero sus rules son de Hoy. Reusar directo con `hoyActividadesRules` en Tickets puede compartir `localStorage` y comportamiento Hoy. Mejor crear preset `ticketsActividadesRules` o wrapper comun especifico.

## 10. Debe Historico tener Rango Horario

Respuesta: depende.

Codigo indica:

- actividades planeadas/extraordinarias tienen rango porque usan `ActividadFormModal`;
- historico es listado general y puede crear/editar mezclas;
- reportes son `TICKET` y no crean desde reportes;
- `TicketFormModal` no implementa rango.

Si el registro editado/creado es actividad `PLANEADA` / `EXTRAORDINARIA`, si podria tener sentido. Si es `TICKET`/reporte, no. Decision debe depender de `tipo` y/o formulario de actividad, no solo de vista historico.

## 11. Riesgos

| Opcion | Riesgo | Motivo |
| --- | --- | --- |
| Meter `ActividadFormModal` directo en tickets actividades | Medio | Puede heredar drafts `hoy_actividades` y comportamiento carrito Hoy. |
| Habilitar rango horario en historico | Medio/alto | Historico mezcla tipos; podria enviar horario a reportes `TICKET`. |
| Crear formulario comun nuevo/wrapper rules | Medio | Mas archivos, pero separa semantica Hoy/Tickets. |
| Mantener duplicacion | Bajo inmediato / alto futuro | No rompe hoy, pero mantiene inconsistencia UI. |

## 12. Plan recomendado

### Fase 13B

- Crear doc decision final si negocio confirma: rango solo para actividades `PLANEADA` / `EXTRAORDINARIA`.
- No tocar historico aun.

### Fase 13C

- Crear `ticketsActividadesRules`.
- Crear wrapper `TicketActividadFormModal` que use `ActividadFormModal` con rules de Tickets.
- Evitar `localStoragePrefix: hoy_actividades`.

### Fase 13D

- Conectar `tickets-actividades` create/edit al wrapper nuevo, quitando dependencia directa de routers Hoy.
- Validar payload batch/individual.

### Fase 13E

- Decidir historico:
  - si crea/edita actividad, usar `TicketActividadFormModal`;
  - si crea/edita reporte `TICKET`, mantener `TicketFormModal`;
  - no activar rango por vista, activarlo por tipo/flujo.

## 13. Validaciones

Build:

```bash
npm run build
```

Resultado: OK.

ESLint acotado:

```bash
npx eslint src/features/tickets/components/historico/ticket-form-modal.jsx src/features/tickets/components/historico/mobile-ticket-form-modal.jsx src/features/tickets/pages/tickets-actividades.jsx src/features/tickets/pages/tickets-historico.jsx src/features/tickets/views/tickets-actividades-desktop.jsx src/features/tickets/views/tickets-actividades-mobile.jsx src/features/tickets/views/tickets-historico-desktop.jsx src/features/tickets/views/tickets-historico-mobile.jsx src/features/common/forms/tareas/actividades/ActividadFormModal.jsx
```

Resultado: falla por issues existentes:

- `ticket-form-modal.jsx`: warning `hoyLocal` dependency.
- `tickets-historico-desktop.jsx`: `cn` unused, `toApproveCount` unused.
- `tickets-historico-mobile.jsx`: `limit`, `sortConfig`, `onSortChange`, `toApproveCount` unused.

No se corrigio. Auditoria solamente.
