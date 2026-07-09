# Auditoría Técnica Profunda — Módulo Hoy y Bug Visual Mobile

**Fase 11A | Solo auditoría | Sin modificaciones de código**

---

## 1. Estado Inicial Confirmado

*   **Rama:** `feature/mantenimientos-recurrentes`
*   **Commit:** `0bdc3d1 docs(frontend): add release readiness report`
*   **Frontend:** Limpio.
*   **Backend:** Limpio.

---

## 2. Árbol de Archivos del Módulo Hoy Auditados

```text
src/features/hoy/
├── components/
│   ├── common/
│   │   ├── hoy-form-modal.jsx          ← Router de modal (17 líneas)
│   │   ├── mobile-hoy-form-modal.jsx   ← Router mobile de modal (17 líneas)
│   │   └── ...otros comunes
│   ├── hoy-actividades/
│   │   └── hoy-actividades-form.jsx    ← Formulario PROPIO VIEJO (1755 líneas)
│   └── hoy-mantenimientos/
│       └── ...filtros y tarjetas
├── views/
│   ├── hoy-mantenimientos-desktop.jsx  ← Vista de listado, usa HoyFormModal
│   ├── hoy-mantenimientos-mobile.jsx   ← Vista de listado, usa MobileHoyFormModal
│   ├── hoy-actividades-desktop.jsx     ← Vista de listado
│   └── hoy-actividades-mobile.jsx      ← Vista de listado
└── pages/
    ├── hoy-actividades.jsx             ← Importa HoyFormModal y MobileHoyFormModal
    └── hoy-mantenimientos.jsx          ← Importa HoyFormModal y MobileHoyFormModal
```

---

## 3. Tabla: Vistas de Hoy y Formularios Reales Usados

| Vista | Archivo | Formulario/Modal Que Usa | ¿Usa `common/forms`? | Observaciones |
| :--- | :--- | :--- | :---: | :--- |
| **Hoy Mantenimientos Desktop** | `hoy-mantenimientos-desktop.jsx` | `HoyFormModal → MantenimientosFormModal` | ✅ Sí | El modal router detecta `PREVENTIVO`/`CORRECTIVO` y abre `MantenimientosFormModal` que ya usa todos los componentes comunes refactorizados |
| **Hoy Mantenimientos Mobile** | `hoy-mantenimientos-mobile.jsx` | `MobileHoyFormModal → MobileMantenimientosFormModal` | ✅ Sí | Igual que desktop, pero con el variant mobile del modal refactorizado |
| **Hoy Actividades Desktop** | `hoy-actividades-desktop.jsx` | `HoyFormModal → HoyActividadesForm` | ❌ No | Para clasificaciones que no son PREVENTIVO/CORRECTIVO, el router deriva a `HoyActividadesForm`, formulario propio de 1755 líneas que NO usa ningún componente de `common/forms/tareas` |
| **Hoy Actividades Mobile** | `hoy-actividades-mobile.jsx` | `MobileHoyFormModal → HoyActividadesForm` con `isMobile={true}` | ❌ No | Misma situación que desktop, mismo formulario viejo en modo mobile |

---

## 4. ¿Hoy Mantenimientos Usa los Formularios Refactorizados?

**SÍ — Completamente.**

El flujo es:
```
HoyMantenimientosMobile (vista)
  → MobileHoyFormModal (router)
    → MobileMantenimientosFormModal (si esMantenimiento)
       → Usa: MaquinaSelectField, PlantaAreaFields, PrioridadField, TituloField,
               DescripcionField, FechaVencimientoField, DurationPicker,
               ResponsablesDesktopSection / ResponsablesMobileSection
```

El bug visual del selector de máquina mobile ocurre dentro de `MobileMantenimientosFormModal`, el cual consume `MaquinaSelectField`, que a su vez usa `SearchableSelect`.

---

## 5. ¿Hoy Actividades Usa los Formularios Refactorizados?

**NO — Para nada.**

El flujo es:
```
HoyActividadesMobile (vista)
  → MobileHoyFormModal (router)
    → HoyActividadesForm (si NO esMantenimiento)
       → Usa: SearchableSelect (importado pero sin usar en JSX)
               Select/Input nativos propios
               WorkloadBadge, TecnicoRow, TecnicoCartSelector,
               TecnicoDropdown definidos INLINE (1755 líneas)
               localStorage draft local único
               Modo carrito (lista de tareas en lote) — lógica compleja exclusiva
```

La auditoría de `git grep` confirma: **cero importaciones de `common/forms/tareas`** en `hoy-actividades-form.jsx`.

---

## 6. Causa Raíz de la Inconsistencia Visual

La inconsistencia existe porque el **router de modales** (`hoy-form-modal.jsx` / `mobile-hoy-form-modal.jsx`) dirige a dos destinos completamente distintos:

*   `PREVENTIVO` o `CORRECTIVO` → `MantenimientosFormModal` (refactorizado en Fases 5–8)
*   Todo lo demás (actividades, tickets, rutinas) → `HoyActividadesForm` (**nunca tocado por el refactor**)

`HoyActividadesForm` tiene:
*   **Prioridad:** `<Select>` nativo, no `<PrioridadField>` con dot de color.
*   **Título:** `<Input>` inline, no `<TituloField>`.
*   **Planta/Área:** dos `<Select>` inline sueltos, no `<PlantaAreaFields>` tarjeta.
*   **Responsables:** `WorkloadBadge`, `TecnicoRow`, `TecnicoDropdown`, `TecnicoCartSelector` definidos inline dentro del mismo archivo.
*   **Máquina:** Carga `getMaquinas` directamente, genera `opcionesMaquinas`, pero NO usa `<MaquinaSelectField>` del common; usa `<SearchableSelect>` directamente del `z_index`. (Nota: `SearchableSelect` aparece importado pero el bloque de renderizado de máquina usa `opcionesMaquinas` de forma directa a través de un `SearchableSelect` dentro del JSX que no se pudo ubicar porque es condicional por `categoria === 'MAQUINARIA'`).

En resumen: **Hoy Actividades nunca recibió las Fases 5–8** porque el refactor se aplicó sobre los 4 modales principales consumidos desde Calendario e Histórico, pero no sobre `hoy-actividades-form.jsx` que es un componente propio del módulo Hoy.

---

## 7. Bug Visual del Selector de Máquina Mobile

### Archivo exacto del bug
El bug ocurre en:
```
src/components/ui/searchable-select.jsx
```

Y se manifiesta cuando se consume desde:
```
src/features/common/forms/tareas/fields/MaquinaSelectField.jsx
→ SearchableSelect
```
Que a su vez es usado en:
```
src/features/mantenimientos/components/common/mobile-mantenimientos-form-modal.jsx
```

### Causa técnica exacta del bug

En `searchable-select.jsx` hay **dos problemas**:

#### Problema A: El texto del botón trigger no tiene `truncate`

**Línea 77-82:**
```jsx
<span className="flex items-center whitespace-nowrap">
    {icon && <Icon name={icon} size="sm" className="mr-2 opacity-70 flex-shrink-0" />}
    <span>
        {value ? selectedOption?.label : placeholder}
    </span>
</span>
```

*   La clase `whitespace-nowrap` en el contenedor hace que el texto se expanda sin límite horizontal.
*   El `<span>` interior que renderiza el label no tiene `truncate`, `overflow-hidden` ni `max-w`.
*   En desktop hay espacio suficiente; en mobile el modal es estrecho y el nombre largo (`MBC0022 - MAQUINA DE TROQUELAR ETIQUETA...`) desborda el botón.

#### Problema B: El dropdown no respeta el ancho del contenedor padre

**Línea 111:**
```jsx
<div className={cn("absolute top-full left-0 mt-1 min-w-full w-max max-w-sm ...")}>
```

*   `w-max` hace que el contenedor del dropdown tome el ancho máximo del contenido, ignorando el ancho del modal.
*   `max-w-sm` pone un tope de `384px`, que puede exceder el ancho del viewport mobile.
*   `min-w-full` garantiza que sea al menos tan ancho como el trigger, pero `w-max` lo puede ampliar más.
*   En mobile, si la lista de opciones tiene nombres largos, el dropdown puede sobresalir del modal creando overflow horizontal.

#### El contenedor del trigger sí tiene `w-full`

**Línea 57:** `<div className="relative w-full" ...>`

**Línea 69:** `... w-full` en el botón trigger.

El trigger en sí es `w-full`, pero el texto interno no tiene `truncate` para respetar ese ancho.

---

## 8. ¿El Fix del Selector Debe Hacerse en `MaquinaSelectField` o `SearchableSelect`?

### Análisis de riesgo

`SearchableSelect` se usa en **14 archivos** del proyecto (filtros de búsqueda, formularios, barras de filtrado). Modificarlo globalmente es una corrección de bajo riesgo si el fix solo añade `truncate` y cambia `w-max` a `w-full` en el dropdown, ya que ambas correcciones son mejoras universales que no afectan comportamiento lógico.

### Recomendación: **Fix global en `SearchableSelect` con ajuste menor adicional en `MaquinaSelectField`**

**Combinación mínima recomendada:**

*   **En `searchable-select.jsx`:**
    1. Agregar `truncate min-w-0 flex-1` al `<span>` interior del texto seleccionado (línea ~80).
    2. Cambiar `w-max` a `w-full` en el div del dropdown (línea 111), o usar `max-w-full` en lugar de `max-w-sm`.

*   **En `MaquinaSelectField.jsx`:** El contenedor `div` raíz no necesita cambios, ya que el ancho se hereda correctamente del grid padre.

**Riesgo global:** Bajo. El `truncate` solo afecta la visualización del texto sin cambiar el comportamiento del componente. El cambio de `w-max` a `w-full` en el dropdown puede mejorar todos los selectores en mobile.

---

## 9. Plan Recomendado de Corrección por Fases

### Fase 11B — Fix visual mobile del selector de máquina

*   **Alcance:** `src/components/ui/searchable-select.jsx`
*   **Cambios:** Añadir `truncate min-w-0 flex-1` en el span del valor seleccionado; cambiar el dropdown de `w-max max-w-sm` a `w-full max-w-full` o solución equivalente que respete el ancho del contenedor modal.
*   **Riesgo:** Bajo. El componente es visual puro.
*   **Validación:** Build + ESLint + commit.

### Fase 11C — Auditoría técnica profunda de `hoy-actividades-form.jsx`

*   **Alcance:** Solo lectura y análisis.
*   **Objetivos:** Determinar si el formulario puede migrar a los componentes comunes refactorizados o si su modo carrito y localStorage draft hacen imposible una migración simple.
*   **Decisión a tomar:** ¿Migración total a `TicketFormModal`? ¿Migración parcial? ¿Mantener separado con mejoras mínimas internas?

### Fase 11D — Integración de campos comunes en desktop `hoy-actividades-form.jsx`

*   **Alcance:** Reemplazar campos inline de desktop por componentes comunes (si es seguro según Fase 11C).
*   **Riesgo:** Medio. El formulario tiene lógica de modo carrito y localStorage draft que no tiene ningún otro formulario del sistema.

### Fase 11E — Integración de campos comunes en mobile `hoy-actividades-form.jsx`

*   **Alcance:** Ajustes del modo `isMobile={true}` para que los componentes comunes se adapten al formulario mobile.
*   **Riesgo:** Medio.

### Fase 11F — QA visual de Hoy completo

*   **Alcance:** Validación técnica de Hoy Actividades y Hoy Mantenimientos en desktop y mobile.
*   **Validación:** Build + ESLint + commit de cierre.

---

## 10. Clasificación de Riesgos

| Corrección | Riesgo | Motivo |
| :--- | :---: | :--- |
| Bug selector máquina mobile (Fase 11B) | **Bajo** | Solo añade clases CSS a un componente visual puro; `SearchableSelect` no tiene estado de negocio |
| Unificar Hoy Actividades (Fases 11C-E) | **Medio** | El formulario tiene lógica propia única: modo carrito, localStorage draft, modo lista en lote, validaciones de horario. La migración requiere preservar todos estos flujos |

---

## 11. Confirmación de No-Modificación

No se modificó ningún archivo durante esta auditoría. Solo se realizaron lecturas y búsquedas de código.
