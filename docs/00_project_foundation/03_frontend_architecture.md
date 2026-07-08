# ARQUITECTURA DEL FRONTEND Y ESTÁNDARES DE INTERFAZ

El frontend del sistema está desarrollado como una aplicación de renderizado pasivo y declarativo ("Thin Client"), adaptada para funcionar offline y en tiempo real.

---

## 1. Principios de Diseño del Frontend
* **React 19 + Vite**: Uso estricto de componentes de React.
* **JavaScript ES6+ Puro**: Queda prohibido el uso de TypeScript en la capa de frontend para mantener la agilidad del cliente.
* **Zustand**: Gestor de estado ligero. Se almacena únicamente información local y de sesión (como `auth-store.js` o `sync-store.js`), delegando la lógica de negocio al backend.

---

## 2. Erradicación de Descargas Masivas
Bajo la arquitectura "Thin Frontend", el cliente **nunca debe descargar colecciones completas para filtrar en memoria**. 
* **Prohibido `limit: 5000`**: Todas las vistas de listados de tareas (tanto "Hoy" como "Histórico") deben consumir peticiones paginadas y filtradas por la base de datos a través de parámetros de consulta de Axios (`perteneceAHoy`, `venceManana`, `estado`, etc.).
* **Filtros Delegados**: El frontend delega la búsqueda de texto libre, filtrado por máquina, categorías, y asignados, limitando el tamaño máximo de descarga en el payload (ej. `limit: 200` en la vista diaria, o paginado de a `50` en el Histórico).

---

## 3. Manejo de Fechas y Prohibición de `new Date()` en UI
Para erradicar desfases provocados por la zona horaria del cliente y evitar la fuga de lógica temporal hacia el frontend:
* **Prohibido instanciar `new Date()` en UI**: Los componentes de React no deben usar `new Date()` o cálculos matemáticos de milisegundos locales (como `new Date(Date.now() + 86400000)`) para decidir si una tarea está atrasada, entregada con retraso, o si pertenece al día de hoy.
* **Flags del Servidor**: El frontend consumirá de forma declarativa e inmutable las propiedades lógicas precalculadas por el backend en el DTO:
  * `t.perteneceAHoy`: Si la tarea pertenece a la vista diaria.
  * `t.isOverdue`: Si la tarea está vencida y activa.
  * `t.isLate`: Si la tarea se resolvió después de su fecha límite.
* **Formateo Visual Centralizado**: La única importación autorizada para convertir ISOs a cadenas legibles es [@/lib/date-format.js](file:///C:/App/Joel/04_Proyecto_Mantenimiento/mantenimiento-interno-frontend/src/lib/date-format.js). Prohibido duplicar archivos de utilidades de fechas.

---

## 4. Estructura por Capas del Módulo
Cada feature (ej. `src/features/tickets/`) se divide estrictamente en:
1. **Pages (Páginas)**: Controladores lógicos de la vista. Consumen hooks y determinan la renderización de la vista según el dispositivo del usuario utilizando el hook `useIsDesktop()`.
2. **Views (Vistas)**: UI 100% limpia y desacoplada (ej. `tickets-hoy-desktop.jsx`, `tickets-hoy-mobile.jsx`). Reciben propiedades a través de `props` y no realizan llamadas HTTP directas.
3. **Components (Componentes)**: Elementos visuales reutilizables o modales encapsulados.
4. **Hooks**: Controladores de estado asíncrono y caché offline (ej. [use-tickets.js](file:///C:/App/Joel/04_Proyecto_Mantenimiento/mantenimiento-interno-frontend/src/features/tickets/hooks/use-tickets.js)).

---

## 5. Ecosistema de UI y Estilo de Badges
Los estados y prioridades deben mantener una consistencia visual de color a través de clases de Tailwind:
* **Mapeo de Estados de Tarea**:
  * `PENDIENTE`: Gris (`bg-slate-50 text-slate-700 border-slate-200`).
  * `ASIGNADA`: Azul (`bg-blue-50 text-blue-700 border-blue-200`).
  * `EN_PROGRESO` / `EN_PROCESO`: Amarillo/Ámbar (`bg-amber-50 text-amber-700 border-amber-200`).
  * `EN_PAUSA`: Naranja (`bg-orange-50 text-orange-700 border-orange-200`).
  * `RESUELTO`: Esmeralda/Verde (`bg-emerald-50 text-emerald-700 border-emerald-200`).
  * `RECHAZADO`: Rojo (`bg-red-50 text-red-700 border-red-200`).
  * `CANCELADA`: Gris oscuro/Tachado.
* **Ajuste de Diseños Mobile**: La vista móvil ("Liquid Glass") prioriza componentes de refracción y navegación fluida por gestos, manteniendo botones de acción flotantes (`GlassFab`) y paginación pill con z-index alto.

---

## 6. Desacoplamiento de Vistas Diarias (Hoy)
Para optimizar la experiencia de usuario y resolver requerimientos especializados de visualización, la vista diaria se divide en dos secciones:

### A. Hoy - Actividades (`src/features/hoy/components/hoy-actividades/`)
* Diseñada para tareas generales, rutinas e incidencias no asociadas a maquinaria pesada.
* **Estilo**: Conserva un fondo blanco/neutral estándar y badges normales de estado.
* **Sin contexto de máquina**: No muestra códigos ni criticidad de máquinas.

### B. Hoy - Mantenimientos (`src/features/hoy/components/hoy-mantenimientos/`)
* Diseñada específicamente para tareas y reportes de maquinaria e infraestructura crítica.
* **Visualización de Máquina (Ultra-compacta)**:
  * Solo se muestra el **código de máquina** en tipografía monoespaciada junto a su badge de **criticidad** en una sola línea.
  * **Nombre de la máquina**: Omitido tanto en la tabla de escritorio como en las tarjetas móviles para evitar problemas de truncamiento y desborde en pantallas pequeñas.
  * **Indicadores de Criticidad**: Píldoras borderless en color suave y texto en negrita: `Crit. A` (Rojo), `Crit. B` (Amarillo), `Crit. C` (Gris).
* **Filtros de Clasificación Visuales**:
  * **Correctivos**: Texto rojo (`text-red-700 font-semibold`) e icono `report_problem` en rojo (`text-red-500`).
  * **Preventivos**: Texto azul (`text-blue-700 font-semibold`) e icono `build_circle` en azul (`text-blue-500`).
  * **Autónomos y Otros**: Textos e iconos en tonos grises (`text-slate-600` / `text-slate-400`).
* **Resaltado Dinámico de Criticidad**:
  * El coloreado del fondo de filas y tarjetas (Red/Amber/Slate en base a criticidad A/B/C) se aplica **únicamente si el tipo de tarea es Reporte (`TICKET`)**. Las tareas programadas (`PLANEADA` y `EXTRAORDINARIA`) mantienen su fondo e indicadores neutrales.
* **Algoritmo de Ordenamiento Jerárquico**:
  1. **Tipo de Tarea**: Primero Reportes (`TICKET`), luego Planeadas (`PLANEADA`), y al final Extraordinarias (`EXTRAORDINARIA`).
  2. **Criticidad de Máquina**: Dentro de cada grupo, se ordena descendente por criticidad (`A` > `B` > `C` > sin máquina).
  3. **ID de Tarea**: Orden de creación descendente (más nuevas primero).