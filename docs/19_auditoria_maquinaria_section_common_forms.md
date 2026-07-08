# Auditoría Profunda: Mapeo y Extracción de MaquinariaSection

## 1. Resumen Ejecutivo

La extracción y unificación de un componente común `MaquinariaSection` en `src/features/common/forms/tareas` es altamente deseable para reducir la duplicación de código en los formularios de la aplicación. Sin embargo, representa un **riesgo significativamente más alto** que la sección de responsables. 

Mientras que el selector de responsables opera principalmente de forma aislada sobre un array de IDs, el bloque de maquinaria está profundamente acoplado a:
- **Estados derivados de ubicación:** La selección de una máquina autocompleta y bloquea Planta y Área.
- **Flujos condicionales de negocio:** El tipo de tarea (`scope`), la categoría (`MAQUINARIA`), la clasificación (`CORRECTIVO`) y la existencia de una máquina determinan si se puede reportar un Paro de Producción e Impacto en minutos.
- **Efectos secundarios de red:** Búsqueda autocompletable reactiva con debouncing de 400ms y validaciones contra la base de datos en tiempo de edición.

Por tanto, no es factible realizar una migración masiva directa sin antes aislar las dependencias y validar por fases.

---

## 2. Alcance de la Auditoría

Se auditaron exhaustivamente los siguientes archivos del frontend:
*   `src/features/tickets/components/historico/ticket-form-modal.jsx` (Desktop)
*   `src/features/tickets/components/historico/mobile-ticket-form-modal.jsx` (Mobile)
*   `src/features/mantenimientos/components/common/mantenimientos-form-modal.jsx` (Desktop)
*   `src/features/mantenimientos/components/common/mobile-mantenimientos-form-modal.jsx` (Mobile)

*Nota: Se revisó además `src/features/maquinaria/components/maquina-recurrencia-form-modal.jsx` para evaluar su relación, confirmando que este último no expone un selector de máquina puesto que es instanciado directamente bajo el contexto de un activo pre-seleccionado.*

**Confirmación:** No se modificó ninguna línea de código productiva en el frontend ni en el backend durante esta fase.

---

## 3. Tabla Comparativa por Formulario

| Formulario | Archivo | Condición de render | Estados usados | Handlers/setters usados | Componentes usados | Errores mostrados | Side effects | Diferencias relevantes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TicketFormModal (Desktop)** | `ticket-form-modal.jsx` | `categoria === 'MAQUINARIA' && scope !== 'actividades'` | `maquinaId`, `maquinaInfo`, `paroProduccion`, `validatingMaquina`, `opcionesMaquinas`, `maquinasRaw`, `planta`, `area` | `setMaquinaId`, `setMaquinaInfo`, `setParoProduccion`, `setPlanta`, `setArea` | `SearchableSelect`, `Label`, `Icon` | `fe.maquinaId` | Sobrescribe y bloquea Planta y Área. Resetea Paro de Producción si cambia la máquina/categoría. | Tiene lógica de carrito/modo masivo. Valida si la máquina existe en base de datos. |
| **MobileTicketFormModal** | `mobile-ticket-form-modal.jsx` | `categoria === 'MAQUINARIA' && scope !== 'actividades'` | `maquinaId`, `maquinaInfo`, `paroProduccion`, `validatingMaquina`, `opcionesMaquinas`, `maquinasRaw`, `planta`, `area` | `setMaquinaId`, `setMaquinaInfo`, `setParoProduccion`, `setPlanta`, `setArea` | `SearchableSelect`, `Label`, `Icon` | `fe.maquinaId` | Sobrescribe y bloquea Planta y Área. Resetea Paro si no es `CORRECTIVO`. | No maneja el carrito del técnico; opera en edición directa. Layout vertical optimizado. |
| **MantenimientosFormModal (Desktop)** | `mantenimientos-form-modal.jsx` | Siempre (la categoría se fuerza a `MAQUINARIA`) | `maquinaId`, `maquinaInfo`, `paroProduccion`, `validatingMaquina`, `opcionesMaquinas`, `maquinasRaw`, `planta`, `area` | `setMaquinaId`, `setMaquinaInfo`, `setParoProduccion`, `setPlanta`, `setArea` | `SearchableSelect`, `Label`, `Icon` | `fe.maquinaId` | Sobrescribe y bloquea Planta y Área. Autocompleta ubicaciones. | El selector de máquina es obligatorio en la validación (`*`). |
| **MobileMantenimientosFormModal** | `mobile-mantenimientos-form-modal.jsx` | Siempre (la categoría se fuerza a `MAQUINARIA`) | `maquinaId`, `maquinaInfo`, `paroProduccion`, `validatingMaquina`, `opcionesMaquinas`, `maquinasRaw`, `planta`, `area` | `setMaquinaId`, `setMaquinaInfo`, `setParoProduccion`, `setPlanta`, `setArea` | `SearchableSelect`, `Label`, `Icon` | `fe.maquinaId` | Sobrescribe y bloquea Planta y Área. | La vista móvil simplifica los márgenes pero mantiene el mismo debounce de red. |

---

## 4. Estados Involucrados

### Estados de Negocio y Lógica de Red (Impacto Mayor)
*   `maquinaId`: ID nominal de la máquina seleccionada. Controla las llamadas a la API.
*   `maquinaInfo`: Detalle completo del objeto máquina (nombre, proceso, planta, área). Si existe, bloquea la edición manual de ubicaciones.
*   `validatingMaquina`: Boolean para mostrar spinners mientras se consulta `/api/maquinaria/:id`.
*   `paroProduccion`: Controla si el correctivo detuvo la línea. Genera campos requeridos adicionales (`impactoProduccion`).
*   `scope`: Define las reglas del formulario (`actividades`, `tickets`, `mantenimientos`).
*   `categoria`: Determina si el bloque de maquinaria es visible (`MAQUINARIA`).
*   `clasificacion`: Si es `CORRECTIVO`, habilita el switch de paro de producción.

### Estados Estrictamente Visuales o Locales (Impacto Menor)
*   `maquinasRaw`: Lista cruda de máquinas obtenida de la API.
*   `opcionesMaquinas`: Array mapeado para el selector buscador (`{ value, label }`).
*   `lockBaseFields`: Deshabilita la edición de campos si el usuario no tiene permisos jerárquicos.
*   `fe.maquinaId`: String de error de la máquina.
*   `fe.clasificacion`: String de error de clasificación.

---

## 5. Side Effects Detectados

1.  **Selección de Máquina:** Al seleccionar un valor en `SearchableSelect`, se dispara `setMaquinaId(selectedId)`. Un `useEffect` de red con debounce de 400ms consulta los datos de la máquina. Al recibirlos, actualiza `maquinaInfo` y ejecuta:
    ```javascript
    setPlanta(maq.planta || '');
    setArea(maq.area || '');
    ```
2.  **Limpieza de Máquina:** Si se limpia el selector, `maquinaId` pasa a `""` y `maquinaInfo` se vuelve `null`. Planta y Área se desbloquean, pero conservan su último valor manual.
3.  **Cambio de Categoría:** Si la categoría cambia a un valor distinto de `MAQUINARIA`, el formulario ejecuta un reset forzado preventivo:
    ```javascript
    setMaquinaId('');
    setMaquinaInfo(null);
    setParoProduccion(false);
    ```
4.  **Paro de Producción Condicional:**
    ```javascript
    const puedeReportarParoProduccion = categoria === 'MAQUINARIA' && scope !== 'actividades' && Boolean(maquinaId) && clasificacion === 'CORRECTIVO';
    ```
    Si esta condición deja de cumplirse en cualquier momento (ej. si se cambia la clasificación a `PREVENTIVO`), un `useEffect` apaga inmediatamente el switch de paro:
    ```javascript
    if (!puedeReportarParoProduccion) setParoProduccion(false);
    ```

---

## 6. Diferencias Desktop / Mobile

*   **Required y Layout:** En Desktop, la etiqueta de maquinaria se renderiza en rejilla al lado de prioridad o tiempos. En Mobile, el layout se apila verticalmente. El asterisco indicador de obligatoriedad (`*`) varía dinámicamente según el `scope` del formulario.
*   **Gestión de Ubicación:** Desktop permite una edición en cascada más visible de Planta/Área si no hay máquina. Mobile tiene validadores manuales y selects nativos separados.
*   **Permiso `lockBaseFields`:** En Desktop, el bloqueo de campos de máquina y paro por privilegios (`lockBaseFields`) está muy acoplado al rol administrativo del ticket, mientras que en Mobile algunas pantallas heredan propiedades directamente del hook de edición.

---

## 7. Diferencias Tickets / Mantenimientos

*   **Obligatoriedad:** En el módulo de Mantenimientos, la máquina es **obligatoria** (clasificaciones `PREVENTIVO` y `CORRECTIVO` heredan esto por regla de negocio). En Tickets generales, asociar una máquina es **opcional** (incluso en la categoría `MAQUINARIA`).
*   **Ubicación de Clasificación:** En Mantenimientos, la clasificación es controlada externamente. En Tickets, la clasificación se despliega dinámicamente dentro del bloque condicional de maquinaria.

---

## 8. Propuesta de Extracción Segura por Fases

Para mitigar riesgos de regresión y asegurar que el frontend siga compilando correctamente, se propone dividir el refactor en las siguientes sub-fases:

### Fase 4B-lite: Extracción de Helpers Puros de Maquinaria
Extraer funciones lógicas puras sin React (sin estado, sin JSX) hacia `src/features/common/forms/tareas/utils/machinery-utils.js`:
- `shouldShowMachineryBlock(categoria, scope)`
- `shouldRequireMachine(scope)`
- `deriveLocationFromMachine(maquina, setPlanta, setArea)`
- `canReportProductionHalt(categoria, scope, maquinaId, clasificacion)`

### Fase 4C: Extracción de MaquinariaSelect Visual
Extraer únicamente el selector `SearchableSelect` de máquina y el badge de "Máquina validada" en un componente visual común `MaquinaSelectField.jsx` bajo `common/forms/tareas/fields`. Este componente solo recibe props visuales (`value`, `options`, `onChange`, `error`, `validating`). Los side-effects y efectos de red se quedan en el padre temporalmente.

### Fase 4D: Evaluación de MaquinariaSection Completa
Evaluar si se puede agrupar el switch de Paro de Producción y los campos derivados en `MaquinariaSection.jsx`, una vez que los campos de Planta/Área también estén componentizados.

---

## 9. API Conceptual Propuesta (Fase 4D)

```jsx
<MaquinariaSection
  scope={scope}
  categoria={categoria}
  clasificacion={clasificacion}
  maquinaId={maquinaId}
  maquinaInfo={maquinaInfo}
  opcionesMaquinas={opcionesMaquinas}
  validatingMaquina={validatingMaquina}
  paroProduccion={paroProduccion}
  errorMaquina={fe.maquinaId}
  disabled={isSubmitting || lockBaseFields}
  onSelectMaquina={handleSelectMaquina}
  onClearMaquina={handleClearMaquina}
  onToggleParo={handleToggleParo}
/>
```

### Elementos Preocupantes de la API:
- **`onSelectMaquina` y `onClearMaquina`:** Tienen que disparar cambios de estado en cascada en el padre (Planta, Área, Carrito masivo). Esto obliga a pasar múltiples setters, haciendo que la sección actúe como un mero "pasapapeles" de props.

---

## 10. Riesgos

*   **Riesgo Alto - Planta y Área Huérfanas:** Si al seleccionar la máquina el componente común no propaga correctamente la actualización de `setPlanta` y `setArea` al estado del padre, se guardarán tareas con ubicaciones erróneas o inconsistentes.
*   **Riesgo Medio - Desfase de Paro de Producción:** El switch de paro y su impacto en minutos (`impactoProduccion`) deben sincronizarse perfectamente con el `FormData` final. Un error aquí causaría fallos de validación en el backend.
*   **Riesgo Medio - Reactividad en Edición:** Durante la edición de un mantenimiento histórico, la máquina ya viene cargada. El componente debe ser capaz de resolver la información de la máquina inicial sin disparar bucles infinitos de red.

---

## 11. Decisión Final

1.  **¿Conviene extraer `MaquinariaSection` completa ahora?**
    *   **No.** El acoplamiento con la lógica de Planta/Área y Paro de Producción hace que sea muy propensa a errores.
2.  **¿Conviene empezar por helpers puros?**
    *   **Sí.** Es el paso más seguro para unificar las condiciones de visualización.
3.  **¿Conviene empezar por el selector visual?**
    *   **Sí, en una fase posterior.** Separar el selector buscador del switch de paro ayuda a aislar las responsabilidades.
4.  **¿Qué fase exacta recomiendas como siguiente?**
    *   **Fase 4B-lite: Extraer helpers puros de maquinaria.**

---

## 12. Recomendación Siguiente

Iniciar la **Fase 4B-lite: Extraer helpers puros de maquinaria**. Esta fase unificará las reglas lógicas que determinan la visualización del bloque de maquinaria y la obligatoriedad de la máquina según el tipo de formulario.
