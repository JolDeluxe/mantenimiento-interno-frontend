# Cierre de Extracción de TiempoHorarioSection

## 1. Resumen Ejecutivo

Como parte de la Fase 7 del refactor incremental de formularios comunes de tareas, se creó el componente visual controlado **`TiempoHorarioSection`**. Este componente agrupa visualmente los campos de "Fecha de vencimiento" (`FechaVencimientoField`) y "Tiempo estimado / Duración" (`DurationPicker`) en un contenedor tipo tarjeta unificado que cuenta con un encabezado descriptivo y el ícono de `schedule`.

Por motivos de seguridad y de control de riesgos, dado el alto acoplamiento y la lógica condicional que asocia los rangos de horas laborables a la recurrencia y preventivos dentro del flujo de mantenimientos preventivos, **se decidió conservar temporalmente la visualización de horarios programados y su switch reactivo en los modales de mantenimientos**. La extracción de `TiempoHorarioSection` se aplicó de manera segura sobre los modales de tickets (desktop y mobile), los cuales ya son consumidos desde Calendario.

---

## 2. Commit Incluido

Los cambios de esta fase fueron consolidados en:

*   **Fase 7B-lite:** `8d8ca3a refactor(frontend): extract time schedule form section`

---

## 3. Archivos Modificados

| Archivo | Cambio |
| :--- | :--- |
| [`TiempoHorarioSection.jsx`](file:///C:/App/Joel/04_Proyecto_Mantenimiento/mantenimiento-interno-frontend/src/features/common/forms/tareas/fields/TiempoHorarioSection.jsx) | **Creado.** Componente común visual que encapsula a `FechaVencimientoField`, `DurationPicker`, y de forma opcional los campos de tipo `time` de rango programado. |
| [`fields/index.js`](file:///C:/App/Joel/04_Proyecto_Mantenimiento/mantenimiento-interno-frontend/src/features/common/forms/tareas/fields/index.js) | **Modificado.** Registro y exportación de `TiempoHorarioSection` en el índice de campos. |
| [`ticket-form-modal.jsx`](file:///C:/App/Joel/04_Proyecto_Mantenimiento/mantenimiento-interno-frontend/src/features/tickets/components/historico/ticket-form-modal.jsx) | **Modificado.** Integración de `TiempoHorarioSection` reemplazando los campos sueltos de fecha y estimación de duración en desktop. |
| [`mobile-ticket-form-modal.jsx`](file:///C:/App/Joel/04_Proyecto_Mantenimiento/mantenimiento-interno-frontend/src/features/tickets/components/historico/mobile-ticket-form-modal.jsx) | **Modificado.** Integración de `TiempoHorarioSection` adaptada a la visual responsive móvil con sus parámetros específicos. |

---

## 4. API del Componente

`TiempoHorarioSection` se diseñó con las siguientes propiedades controladas:

```jsx
export function TiempoHorarioSection({
    fechaVencimiento,
    onFechaVencimientoChange,
    fechaMin,
    fechaLabel = 'Fecha vencimiento',
    fechaError,
    fechaDisabled = false,
    isToday = false,
    isTomorrow = false,
    onSetToday,
    onSetTomorrow,
    quickButtonBaseClassName,
    quickButtonInactiveClassName,
    tiempoEstimadoMins,
    onTiempoEstimadoChange,
    tiempoLabel = 'Tiempo estimado',
    tiempoError,
    tiempoDisabled = false,
    durationHoursCount,
    durationSelectBaseClassName,
    showHorario = false,
    horaInicio,
    horaFin,
    onHoraInicioChange,
    onHoraFinChange,
    horarioDisabled = false,
    layoutClassName = 'grid grid-cols-1 md:grid-cols-2 gap-3',
    durationColSpanClassName = '',
    sectionTitle = 'Tiempo y Programación',
    sectionDescription = 'Define la fecha límite, la duración estimada y las ventanas de atención.',
    showSectionHeader = true,
})
```

---

## 5. Lógica Preservada en los Padres

*   Las variables de estado de control y sus setters (`fechaVencimiento`, `tiempoEstimadoMins`, `horaInicio`, `horaFin`, `modoRangoHoras`).
*   Los callbacks de validación de fecha y de cálculo de horas de inicio/fin de servicio.
*   Las validaciones de negocio en el envío del formulario.
*   La lógica y los interruptores de activación del modo de rango de horas y su interruptor de alternancia en los formularios de mantenimientos.

---

## 6. Qué NO se tocó

*   **Backend:** No se alteró ningún archivo ni endpoint del backend.
*   **Payloads de API:** Los contratos de datos enviados permanecen idénticos.
*   **Otros campos comunes:** Intactos (`MaquinaSelectField`, `PlantaAreaFields`, `PrioridadField`, `ResponsablesMobileSection`, `ResponsablesDesktopSection`).
*   **calendario-page.jsx:** Sin modificaciones.

---

## 7. Impacto Visual

La fecha límite y el tiempo estimado se visualizan de manera integrada en una tarjeta estética que sigue el mismo patrón espacial e identificador de `PlantaAreaFields`, logrando un diseño más estructurado y elegante en los flujos principales que abre la cuadrícula de Calendario.

---

## 8. Riesgos Mitigados

*   **Verificación Post-Extracción (Fase 7C):** Se auditaron mediante búsquedas y comprobó que no hay duplicación obsoleta de campos de fecha y estimación de tiempo, y que los setters y funciones de negocio siguen residiendo exclusivamente en el ámbito del formulario padre.
*   **Aislamiento de la Complejidad Horaria:** Dejar los campos `time` y la alternancia de rango dentro de los formularios de mantenimientos previene regresiones asociadas al horario comercial (`08:00 - 17:30`) y al modo de recurrencia preventiva.

---

## 9. Siguiente Recomendación

Se recomienda proceder con la **Fase 8A: Auditoría final de consistencia y componentes duplicados en formularios de tareas**, con el objetivo de evaluar si resta algún campo básico susceptible de ser consolidado (como Título o Descripción) y dar el cierre técnico definitivo al bloque visual de creación.
