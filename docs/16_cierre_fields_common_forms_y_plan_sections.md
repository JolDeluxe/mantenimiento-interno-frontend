# Cierre de fields comunes y plan de sections

## 1. Resumen ejecutivo

La etapa de fields simples de `common/forms/tareas` quedó estabilizada. Entre las fases 2B y 2F se extrajeron los controles visuales que tenían suficiente homogeneidad entre formularios de tickets y mantenimientos, manteniendo intactas las reglas de negocio, los payloads, los endpoints, los permisos y las validaciones existentes.

El resultado deja una base común útil para formularios grandes y móviles sin forzar abstracciones sobre bloques que todavía combinan lógica de negocio, estado local y variantes por módulo. A partir de este punto conviene pasar de fields aislados a una fase de auditoría de sections.

## 2. Commits incluidos

- `2cc906f docs(frontend): add fields and sections audit for common forms`
- `15e7e03 refactor(frontend): extract common priority field`
- `30e911d refactor(frontend): use common priority field in desktop forms`
- `92d51ad refactor(frontend): extract common title and description fields`
- `c98ed3a refactor(frontend): extract common due date field`
- `f4d0cb2 refactor(frontend): extract common duration picker`

## 3. Fields/componentes comunes creados

| Componente | Archivo | Tipo | Formularios consumidores | Riesgo actual | Observaciones |
| --- | --- | --- | --- | --- | --- |
| `PrioridadField` | `src/features/common/forms/tareas/fields/PrioridadField.jsx` | Field controlado | Ticket desktop/mobile, Mantenimientos desktop/mobile | Bajo | Conserva `PRIORIDADES`, label, placeholder, `value`, `onChange` y `disabled`. |
| `TituloField` | `src/features/common/forms/tareas/fields/TituloField.jsx` | Field controlado | Ticket desktop/mobile, Mantenimientos desktop/mobile | Bajo | Conserva contador, `maxLength`, slice, errores, placeholders por formulario y disabled. |
| `DescripcionField` | `src/features/common/forms/tareas/fields/DescripcionField.jsx` | Field controlado | Ticket desktop/mobile, Mantenimientos desktop/mobile | Bajo | Extrae solo el bloque expandido; el boton "Mas detalles" y `mostrarDescripcion` quedan fuera. |
| `FechaVencimientoField` | `src/features/common/forms/tareas/fields/FechaVencimientoField.jsx` | Field controlado | Ticket desktop/mobile, Mantenimientos desktop/mobile | Bajo/medio | Conserva clamp contra `hoyLocal`, botones Hoy/Manana, `min`, `style`, errores y texto recurrente. |
| `DurationPicker` | `src/features/common/forms/tareas/fields/DurationPicker.jsx` | Componente visual controlado | Ticket desktop/mobile, Mantenimientos desktop/mobile | Bajo/medio | Mantiene diferencias desktop/mobile mediante props: horas 0-11 desktop, 0-23 mobile, error visual solo donde existia. |

## 4. Formularios migrados

| Formulario | Archivo | PrioridadField | TituloField | DescripcionField | FechaVencimientoField | DurationPicker |
| --- | --- | --- | --- | --- | --- | --- |
| `TicketFormModal` | `src/features/tickets/components/historico/ticket-form-modal.jsx` | Si | Si | Si | Si | Si |
| `MobileTicketFormModal` | `src/features/tickets/components/historico/mobile-ticket-form-modal.jsx` | Si | Si | Si | Si | Si |
| `MantenimientosFormModal` | `src/features/mantenimientos/components/common/mantenimientos-form-modal.jsx` | Si | Si | Si | Si | Si |
| `MobileMantenimientosFormModal` | `src/features/mantenimientos/components/common/mobile-mantenimientos-form-modal.jsx` | Si | Si | Si | Si | Si |

## 5. Decisiones tomadas

- No se extrajo `TiempoEstimadoField` porque en mantenimientos esta acoplado a Rango Horario, `horaInicio`, `horaFin`, toggle y errores combinados.
- `DurationPicker` si se extrajo porque es un componente visual reusable y no cambia por si mismo reglas de negocio.
- Mobile conserva 0-23 horas.
- Desktop conserva 0-11 horas.
- Mobile conserva clases sin estilo de error visual.
- Desktop conserva soporte visual de error.
- La logica de submit, payloads, validaciones y permisos no cambio.

## 6. Que NO conviene extraer como field simple

- `TiempoEstimadoField`: no es un field simple en mantenimientos; comparte superficie con Rango Horario y errores de horas programadas.
- `RangoHorario`: combina toggle, horas, duracion calculada, restricciones visuales y validacion indirecta.
- `Maquinaria`: depende de categoria, seleccion de maquina, bloqueo de planta/area y datos derivados.
- `Responsables`: mezcla busqueda, asignacion, cargas de trabajo, chips, permisos y variantes por formulario.
- `Recurrencia`: contiene reglas de programacion, fechas de inicio, resumen, frecuencia y payload especifico.
- `PlantaArea`: tiene deduccion automatica de planta por area, bloqueos por maquinaria y variantes segun catalogos.
- `Categoria/Clasificacion/Tipo`: esta conectado a permisos, scope, admin/cliente y transiciones que alteran otros campos.

## 7. Siguiente fase recomendada

Conviene pasar de fields a sections con una auditoria corta antes de implementar. Opciones:

| Opcion | Section propuesta | Riesgo | Prioridad | Comentario |
| --- | --- | --- | --- | --- |
| A | `MaquinariaSection` | Medio | Alta | Buena candidata para auditar primero; tiene duplicacion clara, pero toca bloqueos de planta/area. |
| B | `ResponsablesSection` | Medio | Alta | Buena candidata para auditar primero; es visible y repetida, pero tiene estados y workloads. |
| C | `TiempoYHorarioSection` | Alto | Media | No iniciar aqui; esta acoplada a Rango Horario y validaciones de tiempo. |
| D | `RecurrenciaSection` | Alto | Baja inicial | No iniciar aqui; concentra logica de negocio y payload recurrente. |
| E | `PlantaAreaSection` | Medio/alto | Media | Puede esperar; se cruza con maquinaria y deduccion automatica. |

Recomendacion inicial: no empezar por `RecurrenciaSection` ni por `TiempoYHorarioSection`. Empezar con una auditoria corta de `MaquinariaSection` o `ResponsablesSection` antes de implementar.

## 8. Warnings pendientes

Persisten warnings preexistentes de ESLint relacionados con `hoyLocal`:

- `hoyLocal` en `src/features/mantenimientos/components/common/mantenimientos-form-modal.jsx`
- `hoyLocal` en `src/features/mantenimientos/components/common/mobile-mantenimientos-form-modal.jsx`
- `hoyLocal` en `src/features/tickets/components/historico/ticket-form-modal.jsx`

No fueron introducidos por esta fase documental ni por la extraccion de fields comunes. Deben tratarse en una fase separada para evitar mezclar refactors visuales con ajustes de hooks.

## 9. Criterios para avanzar a sections

Una section solo se debe extraer si:

- no cambia payload;
- no cambia endpoint;
- no cambia permisos;
- no cambia validacion;
- conserva desktop/mobile;
- conserva estados locales;
- build y lint pasan;
- el diff solo toca archivos permitidos.

## 10. Recomendacion final

El proximo paso recomendado es:

**Fase 3A: Auditoria de sections duplicadas, empezando por `MaquinariaSection` y `ResponsablesSection`, sin implementar codigo todavia.**

El objetivo de esa fase debe ser comparar estructura, props, estados, dependencias y riesgos antes de decidir cual section conviene extraer primero.
