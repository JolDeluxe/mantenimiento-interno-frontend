# CAPA DE SERVICIOS API Y COMUNICACIÓN DE RED

Este documento detalla la estructura y el comportamiento de la capa de API REST, los parámetros de consulta admitidos y los mecanismos de validación implementados en el monorepo.

---

## 1. Validación de Entrada Estricta (Zod en Backend)

Toda petición de entrada (body, query o params) es sanitizada y validada a través del middleware `validate` utilizando contratos estrictos de Zod:
* **Fuerza de Schema**: Se implementa `.strict()` para rechazar cualquier parámetro no esperado que intente inyectar datos calculados (como `duracionReal` o `creadorId`).
* **Coerción de Datos**: Zod convierte de forma transparente tipos de datos de string recibidos en FormData o URL Query a tipos nativos (boolean, number o Date).

---

## 2. Parámetros de Filtro Soportados por `/api/tickets`

La ruta principal de obtención de tickets `GET /api/tickets` consume el esquema de filtros definido en [zod/index.ts](file:///C:/App/Joel/04_Proyecto_Mantenimiento/backend/src/modules/tickets/zod/index.ts#L49) y procesado en `getTicketFilters`.

### Query Params Disponibles:

| Parámetro | Tipo | Descripción |
| :--- | :--- | :--- |
| `q` | `string` | Búsqueda por texto libre en el título, área, planta o ID numérico. |
| `page` | `number` | Número de página para la paginación (por defecto `1`). |
| `limit` | `number` | Límite de elementos por página (por defecto `50`). |
| `estado` | `EstadoTarea` | Filtra por el estado operativo de la tarea. |
| `prioridad` | `Prioridad` | Filtra por el nivel de urgencia de la tarea. |
| `tipo` | `TipoTarea` | Filtra por el origen o naturaleza (TICKET, PLANEADA, EXTRAORDINARIA). |
| `clasificacion` | `ClasificacionTarea` | Filtra por el tipo de trabajo (PREVENTIVO, CORRECTIVO, AUTONOMO). |
| `categoria` | `string` | Filtra por la categoría del ticket (MAQUINARIA, INFRAESTRUCTURA, etc.). |
| `responsableId` | `number` | Filtra por el ID del técnico asignado a la tarea. |
| `planta` | `string` | Filtra por el nombre de la planta industrial. |
| `area` | `string` | Filtra por el área específica. |
| `maquinaId` | `number` | Filtra por el ID de la máquina afectada. |
| `year` | `number` | Año de creación (Filtro Macro Histórico). |
| `month` | `number` | Mes de creación (0 a 12, Filtro Macro Histórico). |
| `vencimientoDesde` | `ISO Date/String` | Fecha inicial de vencimiento (`YYYY-MM-DD`). |
| `vencimientoHasta` | `ISO Date/String` | Fecha final de vencimiento (`YYYY-MM-DD`). |
| `finalizadoDesde` | `ISO Date/String` | Rango inicial de fecha de conclusión. |
| `finalizadoHasta` | `ISO Date/String` | Rango final de fecha de conclusión. |
| `huerfanos` | `boolean` | `true` filtra tareas pendientes sin responsable asignado. |
| `vencidos` | `boolean` | `true` filtra tareas activas cuya fecha límite ya pasó. |
| `perteneceAHoy` | `boolean` | `true` activa el filtro y ordenamiento jerárquico operativo de la vista "HOY". |
| `venceManana` | `boolean` | `true` filtra tareas activas que vencen el día de mañana en CDMX. |
| `sort` | `JSON string` | Arreglo de ordenamiento dinámico, ej. `[{"createdAt":"desc"}]`. |

---

## 3. Seguridad y Autorización (RBAC)

Las peticiones HTTP son interceptadas de forma transparente por middlewares de autenticación:
1. **`authenticate`**: Valida la firma del token JWT recibido en el encabezado `Authorization: Bearer <token>` e inyecta la información del usuario en `req.user`.
2. **`authorize`**: Compara el rol del usuario (`req.user.rol`) con los roles declarados en la ruta Express y restringe el acceso retornando un código **HTTP 403 Forbidden** si no coincide.
3. **Decodificación Híbrida en Rutas Públicas**: Para permitir que el Super Admin interactúe con endpoints compartidos con procesos anónimos (como el selector de departamentos en la pantalla de registro), el middleware de autenticación detecta opcionalmente la presencia de tokens válidos sin interrumpir la petición si no se envían.
