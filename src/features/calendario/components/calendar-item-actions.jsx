// src/features/calendario/components/calendar-item-actions.jsx
import { Icon } from '@/components/ui/z_index';
import {
    puedeCerrarAdministrativamente,
    puedeOperarComoTecnico,
} from '@/features/common/utils/ticket-permissions';

const ROLES_ADMIN_LIST = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];
const ROLES_SUPERVISOR_LIST = ['SUPER_ADMIN', 'JEFE_MTTO'];
const ESTADOS_FINALES_LIST = ['CERRADO', 'CANCELADA'];

const getStatusConfig = (estado) => {
    switch (estado) {
        case 'ASIGNADA':
            return {
                icon: 'play_arrow',
                title: 'Iniciar tarea',
                className: 'text-estado-asignada hover:bg-estado-asignada/10'
            };
        case 'EN_PROGRESO':
        case 'EN_PROCESO':
            return {
                icon: 'check_circle',
                title: 'Finalizar tarea',
                className: 'text-estado-resuelto hover:bg-estado-resuelto/10'
            };
        case 'EN_PAUSA':
            return {
                icon: 'play_arrow',
                title: 'Reanudar tarea',
                className: 'text-estado-asignada hover:bg-estado-asignada/10'
            };
        case 'RECHAZADO':
            return {
                icon: 'replay',
                title: 'Reiniciar tarea',
                className: 'text-estado-rechazado hover:bg-estado-rechazado/10'
            };
        default:
            return {
                icon: 'swap_horiz',
                title: 'Cambiar estado',
                className: 'text-estado-en-progreso hover:bg-estado-en-progreso/10'
            };
    }
};

export const CalendarItemActions = ({
    ticket,
    currentUser,
    onEdit,
    onAssign,
    onChangeStatus,
    onAdminClose,
    onReview,
    onCancel
}) => {
    const { rol, id: userId } = currentUser ?? {};

    const esAdmin = ROLES_ADMIN_LIST.includes(rol);
    const esSupervisor = ROLES_SUPERVISOR_LIST.includes(rol);
    const esCliente = rol === 'CLIENTE_INTERNO';
    const esCreador = ticket.creadorId === userId;

    const puedeEditar =
        !['EN_PROGRESO', 'RESUELTO', ...ESTADOS_FINALES_LIST].includes(ticket.estado) &&
        (esAdmin || (esCliente && esCreador && ticket.estado === 'PENDIENTE'));

    const puedeAsignar =
        esAdmin &&
        !['EN_PROGRESO', 'EN_PROCESO', 'RESUELTO', ...ESTADOS_FINALES_LIST].includes(ticket.estado);

    const puedeCambiarEstado = puedeOperarComoTecnico(currentUser, ticket);
    const puedeCerrarAdmin = puedeCerrarAdministrativamente(currentUser, ticket);

    const puedeRevisar =
        ticket.estado === 'RESUELTO' &&
        (esSupervisor || (esCliente && esCreador));

    const puedeCancelar =
        !ESTADOS_FINALES_LIST.includes(ticket.estado) &&
        (esSupervisor || (esCliente && esCreador && ticket.estado === 'PENDIENTE'));

    const statusConfig = getStatusConfig(ticket.estado);

    return (
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {puedeAsignar && (
                <button
                    type="button"
                    onClick={() => onAssign(ticket)}
                    className="p-1 rounded transition-colors cursor-pointer border-none bg-transparent text-estado-asignada hover:bg-estado-asignada/10"
                    title="Asignar técnico"
                >
                    <Icon name="engineering" size="xs" />
                </button>
            )}
            {puedeCambiarEstado && (
                <button
                    type="button"
                    onClick={() => onChangeStatus(ticket)}
                    className={`p-1 rounded transition-colors cursor-pointer border-none bg-transparent ${statusConfig.className}`}
                    title={statusConfig.title}
                >
                    <Icon name={statusConfig.icon} size="xs" />
                </button>
            )}
            {puedeCerrarAdmin && (
                <button
                    type="button"
                    onClick={() => onAdminClose(ticket)}
                    className="p-1 rounded transition-colors cursor-pointer border-none bg-transparent text-slate-700 hover:bg-slate-700/10"
                    title="Cerrar administrativo"
                >
                    <Icon name="rule" size="xs" />
                </button>
            )}
            {puedeRevisar && (
                <button
                    type="button"
                    onClick={() => onReview(ticket)}
                    className="p-1 rounded transition-colors cursor-pointer border-none bg-transparent text-estado-resuelto hover:bg-estado-resuelto/10"
                    title="Revisar"
                >
                    <Icon name="fact_check" size="xs" />
                </button>
            )}
            {puedeEditar && (
                <button
                    type="button"
                    onClick={() => onEdit(ticket)}
                    className="p-1 rounded transition-colors cursor-pointer border-none bg-transparent text-amber-500 hover:bg-amber-500/10"
                    title="Editar"
                >
                    <Icon name="edit" size="xs" />
                </button>
            )}
            {puedeCancelar && (
                <button
                    type="button"
                    onClick={() => onCancel(ticket)}
                    className="p-1 rounded transition-colors cursor-pointer border-none bg-transparent text-red-700 hover:bg-red-500/10"
                    title="Cancelar reporte"
                >
                    <Icon name="cancel" size="xs" />
                </button>
            )}
        </div>
    );
};

export { CalendarItemActions as MantenimientosCalendarItemActions };
