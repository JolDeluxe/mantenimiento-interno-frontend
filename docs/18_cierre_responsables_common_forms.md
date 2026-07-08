# Cierre de la Migración de Responsables a Common Forms

## 1. Resumen Ejecutivo

El bloque de responsables ha sido migrado exitosamente hacia el directorio modular de frontend `src/features/common/forms/tareas/responsables`. Este refactor unifica y centraliza la lógica visual de selección de técnicos y visualización de cargas de trabajo tanto en mobile como en desktop para los módulos de **Tickets** e **Historico de Mantenimientos**.

La extracción se completó preservando estrictamente la arquitectura del sistema:
- **Sin cambios en payloads:** La estructura del JSON enviado o del `FormData` de cada formulario no se modificó.
- **Sin cambios en handlers de negocio:** Las funciones manipuladoras del estado (`handleAddTecnicoEdit`, `handleRemoveTecnicoEdit`, etc.) se conservaron intactas en los modales padres y se inyectan como callbacks.
- **Sin cambios en validaciones y permisos:** El flujo y las reglas de negocio del backend y frontend permanecen intactos.

---

## 2. Commits Incluidos

El proceso de migración de responsables se compone de los siguientes commits consecutivos:

*   `41245ec` - *refactor(frontend): extract common assignee internals*
*   `b4e4d53` - *refactor(frontend): extract mobile assignees section*
*   `23174d3` - *refactor(frontend): extract common technician dropdown*
*   `dc059df` - *refactor(frontend): extract common technician cart selector*
*   `e467006` - *refactor(frontend): extract desktop assignees section*

---

## 3. Componentes y Helpers Creados

| Componente/Helper | Archivo | Tipo | Usado por | Observaciones |
| :--- | :--- | :--- | :--- | :--- |
| **`WorkloadBadge`** | `WorkloadBadge.jsx` | Componente UI | `TecnicoRow`, modales padres | Muestra visualmente las tareas activas de un técnico. |
| **`TecnicoRow`** | `TecnicoRow.jsx` | Componente UI | `TecnicoCartSelector` | Renderiza un técnico con avatar, nombre y su indicador de carga de trabajo. |
| **`buildOptionLabel`** | `helpers.js` | Helper | `ResponsablesMobileSection` | Helper de formato para búsquedas y selectores móviles. |
| **`ResponsablesMobileSection`** | `ResponsablesMobileSection.jsx` | Sección UI | Modales móviles de tareas | Orquesta el bloque de asignación móvil. Usa select nativo, `buildOptionLabel` y chip mobile privado. |
| **`TecnicoDropdown`** | `TecnicoDropdown.jsx` | Componente UI | `ResponsablesDesktopSection` | Desplegable de técnicos para el modo de edición normal. Conserva su fila interna propia y NO usa `TecnicoRow` para evitar cambios visuales. |
| **`TecnicoCartSelector`** | `TecnicoCartSelector.jsx` | Componente UI | `ResponsablesDesktopSection` | Selector del técnico principal para el modo carrito. Internamente usa `TecnicoRow` para listar los técnicos en el selector. |
| **`ResponsablesDesktopSection`** | `ResponsablesDesktopSection.jsx` | Sección UI | Modales desktop de tareas | Orquesta el bloque de asignación desktop. Usa `TecnicoDropdown`, `TecnicoCartSelector` y chip desktop privado. |

---

## 4. Formularios Migrados

| Formulario | Archivo | Mobile/Desktop | Estado |
| :--- | :--- | :--- | :--- |
| **`MobileTicketFormModal`** | `mobile-ticket-form-modal.jsx` | Mobile | Migrado a `ResponsablesMobileSection` |
| **`MobileMantenimientosFormModal`** | `mobile-mantenimientos-form-modal.jsx` | Mobile | Migrado a `ResponsablesMobileSection` |
| **`TicketFormModal`** | `ticket-form-modal.jsx` | Desktop | Migrado a `ResponsablesDesktopSection` |
| **`MantenimientosFormModal`** | `mantenimientos-form-modal.jsx` | Desktop | Migrado a `ResponsablesDesktopSection` |

---

## 5. Decisiones Importantes

*   **Chips Privados por Entorno:** No se extrajo `TecnicoChip` de manera global porque el entorno desktop y mobile presentaban diferencias estéticas significativas (bordes, avatares e interacciones). `ResponsablesMobileSection` y `ResponsablesDesktopSection` implementan chips de técnico internos y privados (`MobileTecnicoChip` y `DesktopTecnicoChip` respectivamente) para salvaguardar la fidelidad visual.
*   **Encapsulamiento Limpio de Dropdown:** El componente `TecnicoDropdown` conserva su fila de renderizado interna propia y no consume `TecnicoRow` para prevenir desalineaciones visuales en los márgenes de los dropdowns desktop.
*   **Preservación de `deferClearSearch`:** `TecnicoCartSelector` expone la propiedad `deferClearSearch`, y `ResponsablesDesktopSection` recibe la prop `deferCartClearSearch` para preservar el comportamiento diferenciado que ya existía en `MantenimientosFormModal`.
*   **Handlers en Formularios Padres:** Toda la lógica de mutación de arreglos y estados (como la inyección al carrito de preventivos en lote) se mantiene en el componente raíz del modal para no trasladar la lógica pesada a las secciones comunes.
*   **No afectación de Permisos:** No se alteraron los guardias `esAdmin` ni validaciones funcionales.

---

## 6. Riesgos Mitigados

*   **Aislamiento Móvil/Desktop:** Se limitó la edición de modales móviles durante las fases desktop, y viceversa, reduciendo drásticamente el riesgo de romper la responsividad.
*   **Separación Dropdown/Carrito:** Se aislaron `TecnicoDropdown` y `TecnicoCartSelector` antes de armar las secciones compuestas para evitar colisiones lógicas.
*   **Preservación de Propiedades Críticas:** El mapeo explícito de `deferClearSearch` evitó romper la experiencia de usuario del buscador de maquinaria en el carrito.
*   **Condición Externa Intacta:** Se preservó el control del renderizado del bloque en el componente padre mediante `{esAdmin && tecnicos.length > 0 && ...}`.
*   **Deuda Técnica Controlada:** Se identificó la advertencia de `react-hooks/exhaustive-deps` con `hoyLocal` en los modales como deuda pre-existente para abordarla por separado de este refactor.

---

## 7. Estado Final de Responsables

El módulo de asignación de responsables ha quedado 100% componentizado y refactorizado bajo `common/forms/tareas/responsables`. Su arquitectura es ahora robusta, limpia y libre de duplicidades. No requiere ninguna intervención adicional a corto plazo.

---

## 8. Pendientes Fuera del Módulo Responsables

Quedan pendientes de evaluar y unificar las siguientes secciones lógicas del formulario de tareas:
*   Warnings de hook con `hoyLocal`.
*   `MaquinariaSection`.
*   `PlantaAreaSection`.
*   `TiempoYHorarioSection`.
*   `RecurrenciaSection`.

---

## 9. Recomendación Siguiente

Se recomienda iniciar la **Fase 4A: Auditar MaquinariaSection**.
> [!NOTE]
> Esta fase debe limitarse a una auditoría estricta sin implementar código. La unificación de `MaquinariaSection` posee un riesgo elevado dado que interactúa directamente con el estado de la planta, el área, la clasificación de la tarea, el selector autocompletable de máquina, las reglas de recurrencia y el reporte de paro de producción.
