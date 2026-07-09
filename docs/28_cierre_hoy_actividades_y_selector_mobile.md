# Cierre del Refactor de Formularios de Hoy y Corrección del Selector Mobile

## 1. Resumen de Objetivos
- **Bug Mobile de SearchableSelect**: Corregir el truncamiento de texto largo en el input/trigger y evitar que el dropdown rompa el ancho del modal de visualización en dispositivos móviles.
- **Inconsistencia Visual en Hoy**: Unificar el formulario de "Hoy Actividades" (`HoyActividadesForm`) con los componentes comunes controlados (`common/forms/tareas`).

---

## 2. Cambios Aplicados

### A) `src/components/ui/searchable-select.jsx`
- **Trigger**: Se cambió el contenedor de texto de `whitespace-nowrap` a `min-w-0 flex-1` y se añadió `truncate min-w-0 overflow-hidden` en el elemento span para recortar nombres largos de manera segura.
- **Dropdown**: Se eliminó `w-max max-w-sm` sustituyéndolo por `w-full max-w-full` para que no empuje el modal hacia afuera en pantallas pequeñas.
- **Opciones**: Se envolvió el label en un span con la clase `truncate min-w-0` previniendo desbordamientos horizontales por opción.

### B) `src/features/hoy/components/hoy-actividades/hoy-actividades-form.jsx`
- Se removieron componentes de visualización e interfaces inline duplicados (`WorkloadBadge`, `TecnicoRow`, etc.), mientras que `Label` e `Input` permanecen importados para dar soporte a los campos inline no migrados (ej. Fecha y Rango de Horario).
- Se reemplazaron campos visuales inline viejos por sus equivalentes del módulo común:
  - `<PrioridadField>` (Prioridad de tarea)
  - `<TituloField>` (Título)
  - `<DescripcionField>` (Descripción con contador de caracteres y botón de remoción)
  - `<MaquinaSelectField>` (Selector de máquina controlado)
  - `<PlantaAreaFields>` (Gestión común de planta y área/línea)
- Se preservó de manera exacta la lógica de estado del padre, los drafts locales en `localStorage`, la estructura y persistencia del "modo carrito" / en lote, y la firma de submits de payloads al backend.

---

## 3. Validaciones Ejecutadas

### A) Compilación (Production Build)
```bash
npm run build
```
- **Resultado**: Exitoso. Generó todos los chunks de producción sin errores de empaquetado.

### B) Análisis Estático (ESLint)
```bash
npx eslint src/components/ui/searchable-select.jsx src/features/hoy/components/hoy-actividades/hoy-actividades-form.jsx
```
- **Resultado**: `searchable-select.jsx` pasa completamente limpio.
- **HoyActividadesForm**: No se agregaron errores nuevos. Se observan únicamente 6 errores y 2 warnings de variables/callbacks antiguos no utilizados o dependencias de hooks, idénticos a los del estado baseline previo al cambio.

---

## 4. Gestión de Riesgos y Próximos Pasos
- **Riesgo**: Nulo. El refactor fue visual e in-place. No alteró llamadas de API, validaciones de negocio, permisos, endpoints ni estructuras de base de datos.
- **Siguiente Fase Recomendada (Fase 12)**: QA visual real en entorno móvil y de escritorio de ambos flujos (Mantenimientos y Actividades) en el módulo Hoy.
