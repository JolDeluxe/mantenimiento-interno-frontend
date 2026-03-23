// src/features/tickets/components/historico/ticket-card.jsx
import { Icon } from '@/components/ui/z_index';
import { TicketStatusBadge, TicketPriorityBadge } from './ticket-status-badge';
import { cn } from '@/utils/cn';

const ROLES_ADMIN = new Set(['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO']);
const ROLES_SUPERVISOR = new Set(['SUPER_ADMIN', 'JEFE_MTTO']);
const ESTADOS_FINALES = ['CERRADO', 'CANCELADA', 'RECHAZADO'];

const formatFecha = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isVencida = (ticket) => {
    if (ESTADOS_FINALES.includes(ticket.estado)) return false;
    if (!ticket.fechaVencimiento) return false;
    return new Date(ticket.fechaVencimiento) < new Date();
};

export const TicketCard = ({
    ticket,
    currentUser,
    onViewDetail,
    onEdit,
    onAssign,
    onChangeStatus,
    onReview,
    onCancel,
}) => {
    const { rol, id: userId } = currentUser ?? {};
    const esAdmin = ROLES_ADMIN.has(rol);
    const esSupervisor = ROLES_SUPERVISOR.has(rol);
    const esTecnico = rol === 'TECNICO';
    const esCliente = rol === 'CLIENTE_INTERNO';
    const esCreador = ticket.creadorId === userId;
    const esResponsable = ticket.responsables?.some((r) => r.id === userId);
    const vencida = isVencida(ticket);

    const puedeEditar =
        esAdmin ||
        (esCliente && esCreador && ticket.estado === 'PENDIENTE');

    const puedeCambiarEstado =
        esAdmin ||
        (esTecnico && esResponsable);

    const puedeRevisar =
        ticket.estado === 'RESUELTO' &&
        (esSupervisor || (esCliente && esCreador));

    const puedeCancelar =
        !ESTADOS_FINALES.includes(ticket.estado) &&
        (esSupervisor || (esCliente && esCreador && ticket.estado === 'PENDIENTE'));

    return (
        <div className={cn(
            'bg-white border rounded-2xl p-4 shadow-sm',
            vencida ? 'border-estado-rechazado/30 bg-red-50/30' : 'border-slate-200'
        )}>

            {/* ── Cabecera ── */}
            <div
                className="flex items-start justify-between gap-2 mb-2 active:opacity-70 transition-opacity cursor-pointer"
                onClick={() => onViewDetail?.(ticket)}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-400">#{ticket.id}</span>
                        {vencida && (
                            <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-estado-rechazado bg-estado-rechazado/10 border border-estado-rechazado/30 px-1.5 py-0.5 rounded-md uppercase">
                                <Icon name="warning" size="xs" /> Vencida
                            </span>
                        )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {ticket.titulo}
                    </h3>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <TicketStatusBadge estado={ticket.estado} />
                    <TicketPriorityBadge prioridad={ticket.prioridad} />
                </div>
            </div>

            {/* ── Datos secundarios ── */}
            <div className="space-y-1.5 mb-3 ml-1">
                {ticket.planta && (
                    <p className="flex items-center gap-2">
                        <Icon name="factory" size="xs" className="text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-500">
                            {ticket.planta}{ticket.area ? ` — ${ticket.area}` : ''}
                        </span>
                    </p>
                )}
                {ticket.creador && (
                    <p className="flex items-center gap-2">
                        <Icon name="person" size="xs" className="text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-500 truncate">{ticket.creador.nombre}</span>
                    </p>
                )}
                {ticket.responsables?.length > 0 && (
                    <p className="flex items-center gap-2">
                        <Icon name="engineering" size="xs" className="text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-500 truncate">
                            {ticket.responsables.map((r) => r.nombre).join(', ')}
                        </span>
                    </p>
                )}
                {ticket.fechaVencimiento && (
                    <p className="flex items-center gap-2">
                        <Icon name="event" size="xs" className="text-slate-300 shrink-0" />
                        <span className={cn('text-xs font-medium', vencida ? 'text-estado-rechazado' : 'text-slate-500')}>
                            {formatFecha(ticket.fechaVencimiento)}
                        </span>
                    </p>
                )}
            </div>

            {/* ── Acciones ── */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap">

                {/* Ver */}
                <button
                    onClick={() => onViewDetail?.(ticket)}
                    className="flex items-center justify-center p-1.5 rounded-md text-slate-600 hover:bg-slate-600/10 transition-colors"
                >
                    <Icon name="visibility" size="sm" />
                </button>

                {/* Revisar (acción prioritaria: resaltada) */}
                {puedeRevisar && (
                    <button
                        onClick={() => onReview?.(ticket)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-estado-resuelto active:scale-95 transition-all shadow-sm"
                    >
                        <Icon name="fact_check" size="xs" />
                        <span className="hidden min-[360px]:inline">Revisar</span>
                    </button>
                )}

                {/* Editar */}
                {puedeEditar && (
                    <button
                        onClick={() => onEdit?.(ticket)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-prioridad-media active:scale-95 transition-all shadow-sm"
                    >
                        <Icon name="edit" size="xs" />
                        <span className="hidden min-[360px]:inline">Editar</span>
                    </button>
                )}

                {/* Asignar */}
                {esAdmin && (
                    <button
                        onClick={() => onAssign?.(ticket)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-estado-asignada bg-estado-asignada/10 hover:bg-estado-asignada/20 active:scale-95 transition-all"
                    >
                        <Icon name="engineering" size="xs" />
                    </button>
                )}

                {/* Cambiar estado */}
                {puedeCambiarEstado && (
                    <button
                        onClick={() => onChangeStatus?.(ticket)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-estado-en-progreso bg-estado-en-progreso/10 hover:bg-estado-en-progreso/20 active:scale-95 transition-all"
                    >
                        <Icon name="swap_horiz" size="xs" />
                    </button>
                )}

                {/* Cancelar */}
                {puedeCancelar && (
                    <button
                        onClick={() => onCancel?.(ticket)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-estado-cancelada bg-estado-cancelada/10 hover:bg-estado-cancelada/20 active:scale-95 transition-all ml-auto"
                    >
                        <Icon name="cancel" size="xs" />
                    </button>
                )}

            </div>
        </div>
    );
};