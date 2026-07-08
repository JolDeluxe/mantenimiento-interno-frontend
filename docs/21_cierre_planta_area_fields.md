# Cierre de Extracción de PlantaAreaFields

## 1. Resumen Ejecutivo

Como parte de la reorganización de los formularios de tarea y mantenimientos para mejorar la cohesión visual del sistema, se extrajo el componente controlado y puramente visual **`PlantaAreaFields`**. Este componente unifica los campos de selección de "Planta" y "Área / Línea" en un contenedor estructurado tipo tarjeta con cabecera descriptiva e ícono de localización. 

Esta abstracción reduce la duplicación de código en los modales principales del sistema y asegura que los formularios abiertos desde la vista de Calendario se visualicen de forma moderna, consistente y limpia.

---

## 2. Commit Incluido

Los cambios de esta extracción se consolidaron en el siguiente commit:

*   **Fase 6B:** `99bf297 refactor(frontend): extract plant area form fields`

---

## 3. Archivos Modificados

| Archivo | Cambio |
| :--- | :--- |
| [`PlantaAreaFields.jsx`](file:///C:/App/Joel/04_Proyecto_Mantenimiento/mantenimiento-interno-frontend/src/features/common/forms/tareas/fields/PlantaAreaFields.jsx) | **Creado.** Componente visual puro que renderiza el contenedor tipo card con borde suave, cabecera de ubicación e inputs de Planta y Área. |
| [`fields/index.js`](file:///C:/App/Joel/04_Proyecto_Mantenimiento/mantenimiento-interno-frontend/src/features/common/forms/tareas/fields/index.js) | **Modificado.** Se agregó la exportación del componente `PlantaAreaFields` para su consumo global en la carpeta de fields. |
| [`ticket-form-modal.jsx`](file:///C:/App/Joel/04_Proyecto_Mantenimiento/mantenimiento-interno-frontend/src/features/tickets/components/historico/ticket-form-modal.jsx) | **Modificado.** Integración de `PlantaAreaFields` delegando los onChange e inputs deshabilitados. |
| [`mobile-ticket-form-modal.jsx`](file:///C:/App/Joel/04_Proyecto_Mantenimiento/mantenimiento-interno-frontend/src/features/tickets/components/historico/mobile-ticket-form-modal.jsx) | **Modificado.** Integración de `PlantaAreaFields` adaptado al layout responsive móvil. |
| [`mantenimientos-form-modal.jsx`](file:///C:/App/Joel/04_Proyecto_Mantenimiento/mantenimiento-interno-frontend/src/features/mantenimientos/components/common/mantenimientos-form-modal.jsx) | **Modificado.** Integración de `PlantaAreaFields` en la vista de escritorio del creador de recurrencias. |
| [`mobile-mantenimientos-form-modal.jsx`](file:///C:/App/Joel/04_Proyecto_Mantenimiento/mantenimiento-interno-frontend/src/features/mantenimientos/components/common/mobile-mantenimientos-form-modal.jsx) | **Modificado.** Integración de `PlantaAreaFields` en la vista responsive móvil de recurrencias. |

---

## 4. API del Componente

`PlantaAreaFields` expone la siguiente interfaz controlada:

```jsx
export function PlantaAreaFields({
    planta,
    area,
    plantas = [],
    areasOptions = [],
    errorPlanta,
    errorArea,
    disabledPlanta = false,
    disabledArea = false,
    onPlantaChange,
    onAreaChange,
    layoutClassName = 'grid grid-cols-1 md:grid-cols-2 gap-3',
    sectionTitle = 'Ubicación de Atención',
    sectionDescription = 'Especifica la planta y área/línea donde se requiere la intervención.',
    showSectionHeader = true,
})
```

---

## 5. Lógica Preservada en los Padres

Para asegurar la pureza del componente visual y evitar riesgos de regresión, toda la lógica operativa del formulario permanece en los modales padres:
*   Las variables de estado `planta` y `area`.
*   Los setters `setPlanta` y `setArea`.
*   El cálculo del array de opciones válidas para área (`areasOptions`) mediante `useMemo` reactivo.
*   Las constantes y fallbacks locales (`AREAS_POR_PLANTA`, `AREAS`).
*   La lógica de negocio de autoselección de área si solo existe una disponible.
*   La lógica de deducción inversa de planta al cambiar el área seleccionada (`deducirPlantaDeArea`).
*   Los cálculos para deshabilitar inputs por submits activos (`isSubmitting`), bloqueos de edición de campos base (`lockBaseFields`) o por maquinaria validada asignada (`shouldLockLocationByMachine(maquinaInfo)`).

---

## 6. Qué NO se tocó

*   **Backend:** Sin cambios.
*   **Payloads de API:** Los datos enviados en las solicitudes HTTP se mantienen idénticos.
*   **Validaciones y Permisos:** Reglas de obligatoriedad y roles intactos.
*   **maquinaria-utils.js & calendario-page.jsx:** Sin intervenciones.
*   **Otros campos comunes:** Ningún cambio funcional en `MaquinaSelectField`, `PrioridadField` o la lógica de técnicos asignados.

---

## 7. Impacto Visual

Planta y Área dejan de verse como dos selectores flotantes aislados en la grilla y ahora se presentan agrupados dentro de una sección enmarcada con el ícono `location_on`, mejorando notablemente la experiencia de usuario y la coherencia visual con los bloques de maquinaria del formulario.

---

## 8. Riesgos Mitigados

*   **Verificación Post-Extracción (Fase 6C):** Se comprobó mediante análisis de código que no quedaron declaraciones de labels antiguos (`tf-planta` o `tf-area`) en los formularios padres y que las funciones de mutación permanecen exclusivamente en los padres.
*   **Validación de Compilación:** Pipeline exitoso en producción (`npm run build`) y ESLint libre de warnings/errores en las integraciones.

---

## 9. Siguiente Recomendación

Se recomienda iniciar la **Fase 7A: Auditoría de TiempoHorarioSection** para evaluar la viabilidad de agrupar visualmente la fecha de vencimiento, el selector de duración (tiempo estimado) y las franjas horarias de mantenimientos preventivos en una sección visual coordinada.
