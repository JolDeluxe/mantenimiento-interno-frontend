# Decision tecnica: HoyActividadesForm

## 1. Resumen ejecutivo

Esta auditoria revisa el estado real de `HoyActividadesForm` despues del refactor visual de Hoy y del ajuste mobile de `SearchableSelect`.

La decision recomendada es mantener `HoyActividadesForm` como formulario propio por ahora. No conviene reemplazarlo por `TicketFormModal` ni por `MantenimientosFormModal`, porque administra un flujo exclusivo de actividades: borradores en `localStorage`, modo lista/carrito, creacion en lote, reglas de fecha/hora para actividades y payloads con `clasificacion: null` o `clasificacion` vacia.

El formulario si puede seguir reduciendose por fases, pero solo con extracciones controladas y auditorias previas.

## 2. Estado base

- Rama frontend: `feature/mantenimientos-recurrentes`.
- Commit documental previo: `787de13 docs(frontend): add hoy form refactor reports`.
- Frontend limpio antes de crear este documento.
- Backend limpio antes de iniciar la fase.
- Esta fase no modifica codigo de aplicacion.

## 3. Documentos revisados

- `docs/27_auditoria_hoy_y_bug_selector_mobile.md`
- `docs/28_cierre_hoy_actividades_y_selector_mobile.md`
- `docs/25_auditoria_final_common_forms.md`
- `docs/26_release_readiness_mantenimientos_recurrentes.md`

Los documentos 27 y 28 fueron preservados en Git antes de continuar la auditoria.

## 4. Archivos auditados

- `src/features/hoy/components/common/hoy-form-modal.jsx`
- `src/features/hoy/components/common/mobile-hoy-form-modal.jsx`
- `src/features/hoy/components/hoy-actividades/hoy-actividades-form.jsx`
- `src/features/hoy/pages/hoy-actividades.jsx`
- `src/features/hoy/views/hoy-actividades-desktop.jsx`
- `src/features/hoy/views/hoy-actividades-mobile.jsx`
- `src/features/hoy/views/hoy-mantenimientos-desktop.jsx`
- `src/features/hoy/views/hoy-mantenimientos-mobile.jsx`
- `src/components/ui/searchable-select.jsx`
- `src/features/common/forms/tareas`
- Formularios comparados de tickets y mantenimientos desktop/mobile.

## 5. Routing real de Hoy

`HoyFormModal` y `MobileHoyFormModal` funcionan como routers.

Cuando existe `ticketAEditar`, consideran mantenimiento solo si `ticketAEditar.clasificacion` es `PREVENTIVO` o `CORRECTIVO`. Cuando no hay edicion, consideran mantenimiento si `scope === 'mantenimientos'`.

Resultado:

- Hoy Mantenimientos desktop usa `MantenimientosFormModal`.
- Hoy Mantenimientos mobile usa `MobileMantenimientosFormModal`.
- Hoy Actividades desktop usa `HoyActividadesForm` con `isMobile={false}`.
- Hoy Actividades mobile usa `HoyActividadesForm` con `isMobile={true}`.

Esto es correcto para separar actividades de mantenimientos.

## 6. Estado real de HoyActividadesForm

`HoyActividadesForm` tiene 1418 lineas al momento de la auditoria. Ya no coincide con el diagnostico viejo de "formulario completamente sin common".

Componentes comunes que ya consume:

- `PrioridadField`
- `TituloField`
- `DescripcionField`
- `PlantaAreaFields`
- `WorkloadBadge`
- `TecnicoRow`
- `TecnicoCartSelector`
- `TecnicoDropdown`

Elementos que aun conserva localmente:

- `DurationPicker` local, aunque existe un `DurationPicker` comun exportado desde `common/forms/tareas/fields`.
- Logica de fecha vencimiento inline.
- Logica de rango horario inline.
- `TecnicoChip` local.
- `TecnicoAdicionalChip` local.
- Borradores de actividades en `localStorage`.
- Modo lista/carrito y payload batch.

## 7. Actividades, tipo y clasificacion

Regla de negocio confirmada:

- Actividades de Hoy no son mantenimientos.
- Actividades de Hoy no deben usar `clasificacion` como `PREVENTIVO` o `CORRECTIVO`.
- Actividades de Hoy no deben mostrar recurrencia de mantenimiento.
- Actividades de Hoy no deben activar logica recurrente.
- `tipo` si aplica, pero debe ser tipo de actividad: `PLANEADA` o `EXTRAORDINARIA`.
- `PREVENTIVO` y `CORRECTIVO` son `clasificacion`, no `tipo`.

Estado actual:

- `tipo` inicia como `PLANEADA` en creacion o desde `localStorage`.
- En edicion, `tipo` se carga desde `ticketAEditar.tipo ?? 'PLANEADA'`.
- El selector usa `TIPOS_ADMIN`, que contiene `PLANEADA` y `EXTRAORDINARIA`.
- Si se edita un ticket con `tipo === 'TICKET'`, el selector conserva una opcion `TICKET`.
- La validacion exige `tipo` para usuarios admin.
- El submit individual y de edicion agregan `tipo` al `FormData`.
- El submit batch manda `tipo: item.tipo`.
- `clasificacion` se envia vacia en `FormData` o como `null` en payloads batch/carrito.

Conclusion: el manejo de `tipo` es correcto para actividades admin mientras use `PLANEADA` o `EXTRAORDINARIA`. No se detecta envio de `PREVENTIVO` o `CORRECTIVO` como `tipo` desde `HoyActividadesForm`.

## 8. Maquinaria en actividades

Estado actual:

- No hay import de `MaquinaSelectField` en `HoyActividadesForm`.
- No hay `SearchableSelect` en `HoyActividadesForm`.
- No hay `getMaquinas`, `maquinasRaw`, `maquinaInfo`, `opcionesMaquinas` ni `validatingMaquina` dentro del formulario.
- El bloque de maquina esta marcado como removido para actividades.
- En submit individual/edicion se envia `maquinaId` como cadena vacia.
- En carrito/batch se guarda `maquinaId: null`.

Conclusion: la maquina esta excluida funcionalmente de actividades. Esto es coherente si actividades no deben crear mantenimientos ni tickets de maquinaria.

Riesgo pendiente: verificar con backend si `maquinaId: ''` en `FormData` y `maquinaId: null` en batch son equivalentes aceptados para actividades.

## 9. defaultModoLista

`HoyActividadesForm` recibe `defaultModoLista`.

Comportamiento actual:

- En edicion, `modoLista` siempre inicia en `false`.
- En creacion, si `defaultModoLista` viene definido, se respeta.
- Si no viene definido, se recupera `hoy_actividades_modoLista` de `localStorage`.
- Si no hay valor guardado, inicia en `true`.

`hoy-actividades.jsx` pasa `defaultModoLista={true}` solo al `HoyFormModal` desktop de creacion. Mobile no lo pasa, pero `modoCarrito` ademas queda desactivado por `isMobile`, porque se calcula como `!esEdicion && esAdmin && !isMobile && modoLista`.

Conclusion: el cambio fuerza lista por defecto en desktop de creacion sin activar carrito mobile ni afectar edicion.

## 10. SearchableSelect

`src/components/ui/searchable-select.jsx` ya contiene el ajuste visual esperado:

- Trigger con `min-w-0 flex-1`.
- Texto seleccionado con `truncate min-w-0 overflow-hidden`.
- Dropdown con `w-full max-w-full`.
- Opciones con `truncate`.

No se detecta `w-max max-w-sm` en el dropdown auditado. El fix pertenece al componente base y no cambia payloads ni endpoints.

## 11. Decision tecnica

Decision: **mantener `HoyActividadesForm` como formulario propio y seguir reduciendolo por fases controladas**.

No se recomienda reemplazarlo por `TicketFormModal`, porque `HoyActividadesForm` tiene comportamiento exclusivo:

- Modo lista/carrito.
- Creacion batch.
- Borradores persistidos en `localStorage`.
- `tipo` de actividad (`PLANEADA`/`EXTRAORDINARIA`).
- `clasificacion` nula/vacia.
- Maquinaria excluida.
- Rango horario y conflictos por tecnico/fecha.

Tampoco se recomienda moverlo hacia formularios de mantenimiento, porque actividades no deben usar `PREVENTIVO`, `CORRECTIVO` ni recurrencia.

## 12. Pendientes recomendados

Orden sugerido:

1. Extraer `DurationPicker` local hacia el componente comun ya existente, si las props y opciones son compatibles.
2. Auditar si `FechaVencimientoField` comun puede reemplazar el bloque inline sin cambiar restricciones.
3. Evaluar `TecnicoChip` y `TecnicoAdicionalChip` como componentes comunes o variantes.
4. Auditar si el manejo `maquinaId: ''` vs `maquinaId: null` debe normalizarse para actividades.
5. Atender ESLint de Hoy en una fase separada, sin mezclarlo con cambios visuales.

## 13. Validacion

Build ejecutado:

```bash
npm run build
```

Resultado: exitoso. Vite genero el build de produccion y el service worker. Persisten warnings de tamano de chunk e `inlineDynamicImports` de PWA/Vite.

ESLint ejecutado:

```bash
npx eslint src/components/ui/searchable-select.jsx src/features/hoy/pages/hoy-actividades.jsx src/features/hoy/components/hoy-actividades/hoy-actividades-form.jsx src/features/hoy/components/common/hoy-form-modal.jsx src/features/hoy/components/common/mobile-hoy-form-modal.jsx src/features/hoy/views/hoy-actividades-desktop.jsx src/features/hoy/views/hoy-actividades-mobile.jsx src/features/hoy/views/hoy-mantenimientos-desktop.jsx src/features/hoy/views/hoy-mantenimientos-mobile.jsx
```

Resultado: falla con 10 errores y 2 warnings.

Detalle:

- `searchable-select.jsx`: sin errores reportados.
- `hoy-form-modal.jsx`: sin errores reportados.
- `mobile-hoy-form-modal.jsx`: sin errores reportados.
- `hoy-actividades-form.jsx`: errores/warnings preexistentes de variables `_`, hooks con `setState` en effect, dependencias de hooks y handlers no usados.
- `hoy-actividades.jsx`: error de pureza por `Date.now()` durante render.
- `hoy-actividades-desktop.jsx`: `useMemo` importado sin uso.
- `hoy-actividades-mobile.jsx`: `useMemo` importado sin uso.

## 14. Criterios para seguir

Antes de seguir con cambios funcionales en Hoy:

- No mezclar saneamiento ESLint con refactors visuales.
- No introducir `PREVENTIVO` o `CORRECTIVO` como `tipo` de actividad.
- No activar recurrencia en actividades.
- No reintroducir maquinaria sin decision de negocio explicita.
- No tocar payloads sin confirmar backend.
- Mantener desktop/mobile auditados por separado.

## 15. Recomendacion final

La siguiente fase recomendada es una fase de saneamiento tecnico acotado:

**Fase 12B: limpiar ESLint preexistente de HoyActividadesForm, pagina y vistas, sin cambiar UI, payloads, endpoints ni reglas de negocio.**

Despues de eso, conviene una fase visual pequena para reemplazar el `DurationPicker` local por el componente comun si el diff queda estrictamente equivalente.
