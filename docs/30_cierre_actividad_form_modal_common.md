# Cierre: ActividadFormModal comun

## 1. Resumen

Se extrajo el formulario completo de Hoy Actividades hacia `common/forms/tareas/actividades`, dejando `HoyActividadesForm` como wrapper minimo.

El objetivo fue alinear Hoy Actividades con el patron ya usado por Hoy Mantenimientos: las vistas y routers de Hoy conservan su responsabilidad, mientras el formulario real vive en una ubicacion comun.

## 2. Nueva arquitectura

- `src/features/common/forms/tareas/actividades/ActividadFormModal.jsx`: contiene la logica movida desde `HoyActividadesForm`.
- `src/features/common/forms/tareas/actividades/hoy-actividades-rules.js`: define el preset de reglas de Hoy Actividades.
- `src/features/common/forms/tareas/actividades/index.js`: barrel export del modulo.
- `src/features/hoy/components/hoy-actividades/hoy-actividades-form.jsx`: wrapper temporal hacia `ActividadFormModal`.

## 3. Por que HoyActividadesForm ya no contiene el formulario completo

`HoyActividadesForm` era un formulario de mas de 1400 lineas dentro de `features/hoy`, aunque ya consumia varias piezas de `common/forms/tareas`.

La nueva estructura conserva el punto de entrada historico para no tocar routers, pero mueve el formulario real a common. Esto permite seguir reduciendo duplicacion sin mezclar la logica de actividades con mantenimientos.

## 4. Comportamiento preservado

Se preservo:

- borrador en `localStorage` con prefijo `hoy_actividades`;
- modo lista;
- modo carrito desktop;
- creacion batch con `batchPayloads`;
- submit individual con `FormData`;
- submit de edicion con `FormData`;
- `tipo` de actividad;
- `clasificacion` vacia o `null`;
- maquina excluida;
- `defaultModoLista`;
- `isMobile`;
- reglas de fecha;
- reglas de duracion y rango horario;
- tecnicos/responsables;
- llamadas a `onSuccess`.

## 5. Reglas de Hoy Actividades

El preset `hoyActividadesRules` documenta:

- `source: 'hoy'`;
- `scope: 'actividades'`;
- `allowedTipos: ['PLANEADA', 'EXTRAORDINARIA']`;
- `defaultTipo: 'PLANEADA'`;
- `clasificacion: null`;
- `enableMaquinaria: false`;
- `enableRecurrencia: false`;
- `enableBatch: true`;
- `enableModoListaDesktop: true`;
- `enableModoListaMobile: false`;
- `localStoragePrefix: 'hoy_actividades'`.

Estas reglas se pasan desde el wrapper, pero no se forzo una abstraccion mayor para evitar cambios funcionales.

## 6. Que NO se toco

No se toco:

- backend;
- endpoints;
- permisos;
- recurrencias;
- mantenimiento;
- calendario;
- routers de Hoy;
- payloads funcionales;
- llamadas de API.

## 7. Invariantes verificadas

- Actividades de Hoy no son mantenimientos.
- No se usa `PREVENTIVO` ni `CORRECTIVO` como `tipo`.
- No se renderiza `MaquinaSelectField`.
- No se importa `SearchableSelect` en el formulario de actividades.
- No se importa `getMaquinas`.
- `maquinaId` solo permanece como valor vacio/null en payloads.
- `tipo` sigue usando `PLANEADA` / `EXTRAORDINARIA`.
- `defaultModoLista={true}` sigue aplicado en creacion desktop desde `hoy-actividades.jsx`.
- Mobile no activa carrito porque `modoCarrito` conserva la condicion `!isMobile`.
- Edicion conserva `modoLista` en `false`.

## 8. Validaciones

Build:

```bash
npm run build
```

Resultado: exitoso.

ESLint:

```bash
npx eslint src/features/common/forms/tareas/actividades/ActividadFormModal.jsx src/features/common/forms/tareas/actividades/hoy-actividades-rules.js src/features/common/forms/tareas/actividades/index.js src/features/hoy/components/hoy-actividades/hoy-actividades-form.jsx src/features/hoy/pages/hoy-actividades.jsx src/features/hoy/components/common/hoy-form-modal.jsx src/features/hoy/components/common/mobile-hoy-form-modal.jsx
```

Resultado: exitoso.

## 9. Ajustes de lint incluidos

Se eliminaron handlers y variables no usadas heredadas del formulario original.

Tambien se agrego una excepcion local para `Date.now()` en `hoy-actividades.jsx`, porque el calculo ya existia y cambiarlo en esta fase podria alterar la semantica de filtros por fecha. La excepcion no cambia comportamiento.

## 10. Riesgos

- `hoyActividadesRules` todavia documenta reglas mas de lo que las gobierna. Convertirlas en motor real debe hacerse en una fase posterior.
- `ActividadFormModal` conserva mucha logica propia. La extraccion fue arquitectonica, no una simplificacion interna profunda.
- El formulario mantiene `maquinaId` como vacio/null para compatibilidad. Si backend exige normalizacion unica, debe auditarse aparte.

## 11. Pendientes

- Convertir gradualmente reglas hardcodeadas a uso real de `hoyActividadesRules`.
- Evaluar reemplazar el `DurationPicker` local por el comun.
- Evaluar extraer la seccion fecha/rango horario si no cambia comportamiento.
- Revisar si el wrapper `HoyActividadesForm` puede eliminarse cuando los routers consuman directamente `ActividadFormModal`.
