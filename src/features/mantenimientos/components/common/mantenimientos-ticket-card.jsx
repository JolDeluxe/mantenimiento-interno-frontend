import { useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import { TicketStatusBadge, TicketPriorityBadge } from '@/features/common/components/ticket-status-badge';
import { formatFecha, formatFechaRelativa } from '@/lib/date';
import { cn } from '@/utils/cn';
import {
    puedeCerrarAdministrativamente,
    puedeOperarComoTecnico,
} from '@/features/common/utils/ticket-permissions';
const ROLES_ADMIN = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];
const ROLES_SUPERVISOR = ['SUPER_ADMIN', 'JEFE_MTTO'];
const ESTADOS_FINALES = ['CERRADO', 'CANCELADA'];

const isVencida = (ticket) => {
    return !!ticket.isOverdue;
};

const getEstadoActionMeta = (estado) => {
    switch (estado) {
        case 'ASIGNADA':
            return {
                text: 'Iniciar',
                icon: 'play_arrow',
                primaryClass: 'px-3 py-1.5 text-white bg-estado-asignada shadow-sm',
                ghostClass: 'px-2.5 py-1.5 text-estado-asignada bg-estado-asignada/10 hover:bg-estado-asignada/20'
            };
        case 'EN_PROGRESO':
        case 'EN_PROCESO':
            return {
                text: 'Finalizar',
                icon: 'check_circle',
                primaryClass: 'px-3 py-1.5 text-white bg-estado-resuelto shadow-sm',
                ghostClass: 'px-2.5 py-1.5 text-estado-resuelto bg-estado-resuelto/10 hover:bg-estado-resuelto/20'
            };
        case 'EN_PAUSA':
            return {
                text: 'Reanudar',
                icon: 'play_arrow',
                primaryClass: 'px-3 py-1.5 text-white bg-estado-asignada shadow-sm',
                ghostClass: 'px-2.5 py-1.5 text-estado-asignada bg-estado-asignada/10 hover:bg-estado-asignada/20'
            };
        case 'RECHAZADO':
            return {
                text: 'Reiniciar',
                icon: 'replay',
                primaryClass: 'px-3 py-1.5 text-white bg-estado-rechazado shadow-sm',
                ghostClass: 'px-2.5 py-1.5 text-estado-rechazado bg-estado-rechazado/10 hover:bg-estado-rechazado/20'
            };
        default:
            return {
                text: 'Estado',
                icon: 'swap_horiz',
                primaryClass: 'px-3 py-1.5 text-white bg-estado-asignada shadow-sm',
                ghostClass: 'px-2.5 py-1.5 text-estado-asignada bg-estado-asignada/10 hover:bg-estado-asignada/20'
            };
    }
};

export const TicketCard = ({
    ticket,
    currentUser,
    onViewDetail,
    onEdit,
    onAssign,
    onChangeStatus,
    onAdminClose,
    onReview,
    onCancel,
}) => {
    const { rol, id: userId } = currentUser ?? {};

    const esAdmin = ROLES_ADMIN.includes(rol);
    const esSupervisor = ROLES_SUPERVISOR.includes(rol);
    const esTecnico = rol === 'TECNICO';
    const esCliente = rol === 'CLIENTE_INTERNO';
    const esCreador = ticket.creadorId === userId;
    const esResponsable = ticket.responsables?.some((r) => r.id === userId);
    const tieneResponsables = ticket.responsables && ticket.responsables.length > 0;
    const vencida = isVencida(ticket);

    const puedeEditar =
        !['EN_PROGRESO', 'RESUELTO', ...ESTADOS_FINALES].includes(ticket.estado) &&
        (esAdmin || (esCliente && esCreador && ticket.estado === 'PENDIENTE'));

    const puedeAsignar =
        esAdmin &&
        !['EN_PROGRESO', 'EN_PROCESO', 'RESUELTO', ...ESTADOS_FINALES].includes(ticket.estado);

    const puedeCambiarEstado = puedeOperarComoTecnico(currentUser, ticket);
    const puedeCerrarAdmin = puedeCerrarAdministrativamente(currentUser, ticket);

    const puedeRevisar =
        ticket.estado === 'RESUELTO' &&
        (esSupervisor || (esCliente && esCreador));

    const puedeCancelar =
        !ESTADOS_FINALES.includes(ticket.estado) &&
        (esSupervisor || (esCliente && esCreador && ticket.estado === 'PENDIENTE'));

    const esAsignarPrimario = ticket.estado === 'PENDIENTE';
    const esEstadoPrimario = ['ASIGNADA', 'EN_PROGRESO', 'EN_PROCESO', 'EN_PAUSA', 'RECHAZADO'].includes(ticket.estado);

    const actionMeta = getEstadoActionMeta(ticket.estado);
    const [responsablesExpanded, setResponsablesExpanded] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const responsablesExtra = (ticket.responsables?.length || 0) - 3;
    const responsablesMostrar = responsablesExpanded
        ? ticket.responsables
        : ticket.responsables?.slice(0, 3);

    return (
        <div className={cn(
            'bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200',
            vencida ? 'border-estado-rechazado/30 bg-red-50/30' : 'border-slate-200'
        )}>
            <div
                className="flex items-start justify-between gap-2 mb-2 active:opacity-75 transition-opacity cursor-pointer select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-400">#{ticket.id}</span>
                        {ticket.tipo && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                {ticket.tipo}
                            </span>
                        )}
                        {ticket.paroProduccion && (
                            <span className={cn(
                                "inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border leading-none shrink-0",
                                ['RESUELTO', 'CERRADO'].includes(ticket.estado)
                                    ? "text-emerald-700 bg-emerald-50 border-emerald-300"
                                    : "text-red-700 bg-red-50 border-red-300 animate-pulse"
                            )}>
                                <Icon name={['RESUELTO', 'CERRADO'].includes(ticket.estado) ? "task_alt" : "error"} size="xs" style={{ fontSize: '10px' }} className="shrink-0" />
                                <span>{['RESUELTO', 'CERRADO'].includes(ticket.estado) ? "PARO RESUELTO" : "PARO ACTIVO"}</span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                            {ticket.titulo}
                        </h3>
                        {vencida && (
                            <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-estado-rechazado bg-estado-rechazado/10 border border-estado-rechazado/30 px-1.5 py-0.5 rounded-md uppercase shrink-0">
                                <Icon name="warning" size="xs" /> ATRASADA
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1">
                        <TicketStatusBadge estado={ticket.estado} />
                        <Icon 
                            name="keyboard_arrow_down" 
                            size="sm" 
                            className={cn(
                                "text-slate-400 transition-transform duration-300",
                                isExpanded && "rotate-180"
                            )} 
                        />
                    </div>
                    <TicketPriorityBadge prioridad={ticket.prioridad} />
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-1.5 mb-3 ml-1 mt-3 border-t border-slate-100/50 pt-2.5 animate-fadeIn">
                    {ticket.createdAt && (
                        <p className="flex items-center gap-2">
                            <Icon name="calendar_today" size="xs" className="text-slate-300 shrink-0" />
                            <span className="text-xs text-slate-500">
                                Creado: {formatFecha(ticket.createdAt)}
                            </span>
                        </p>
                    )}
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
                        <div className="flex items-start gap-2">
                            <Icon name="engineering" size="xs" className="text-slate-300 shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-2 min-w-0">
                                {responsablesMostrar.map((r) => (
                                    <div key={r.id} className="flex items-center gap-2" title={r.nombre}>
                                        {r.imagen ? (
                                            <img
                                                src={r.imagen}
                                                alt={r.nombre}
                                                className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-50"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/img/perfil-no-foto.webp';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-marca-primario/10 flex items-center justify-center text-marca-primario text-[10px] font-bold border border-marca-primario/20 shrink-0 shadow-sm">
                                                {r.nombre?.charAt(0).toUpperCase() ?? "?"}
                                            </div>
                                        )}
                                        <span className="text-xs text-slate-500 truncate">
                                            {r.nombre}
                                        </span>
                                    </div>
                                ))}
                                {responsablesExtra > 0 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setResponsablesExpanded(!responsablesExpanded); }}
                                        className="text-[10px] font-bold text-marca-primario hover:underline self-start mt-0.5"
                                    >
                                        {responsablesExpanded ? 'Ver menos' : `+ ${responsablesExtra} ver más`}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    {ticket.fechaVencimiento && (
                        <p className="flex items-center gap-2">
                            <Icon name="event" size="xs" className={cn('shrink-0', vencida ? 'text-estado-rechazado/70' : 'text-slate-300')} />
                            <span className={cn('text-xs font-medium', vencida ? 'text-estado-rechazado' : 'text-slate-500')}>
                                Entrega: {formatFechaRelativa(ticket.fechaVencimiento)}
                            </span>
                        </p>
                    )}
                </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap w-full">
                {puedeCancelar && (
                    <button
                        onClick={() => onCancel?.(ticket)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-estado-rechazado bg-estado-rechazado/10 hover:bg-estado-cancelada/20 active:scale-95 transition-all"
                        title="Cancelar ticket"
                    >
                        <Icon name="cancel" size="xs" />
                    </button>
                )}

                <button
                    onClick={() => onViewDetail?.(ticket)}
                    className="flex items-center justify-center p-1.5 rounded-md text-slate-600 hover:bg-slate-600/10 transition-colors"
                    title="Ver detalle"
                >
                    <Icon name="visibility" size="sm" />
                </button>

                {puedeCerrarAdmin && (
                    <button
                        onClick={() => onAdminClose?.(ticket)}
                        className="flex items-center justify-center p-1.5 rounded-md text-slate-700 hover:bg-slate-700/10 transition-colors"
                        title="Cerrar administrativo"
                    >
                        <Icon name="rule" size="sm" />
                    </button>
                )}

                <div className="flex-1 min-w-[8px]"></div>

                {puedeEditar && (
                    <button
                        onClick={() => onEdit?.(ticket)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-prioridad-media bg-prioridad-media/10 hover:bg-prioridad-media/20 active:scale-95 transition-all"
                        title="Editar ticket"
                    >
                        <Icon name="edit" size="xs" />
                    </button>
                )}

                {puedeCambiarEstado && (
                    <button
                        onClick={() => onChangeStatus?.(ticket)}
                        className={cn(
                            "flex items-center gap-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all",
                            esEstadoPrimario
                                ? actionMeta.primaryClass
                                : actionMeta.ghostClass
                        )}
                        title={actionMeta.text}
                    >
                        <Icon name={actionMeta.icon} size="xs" />
                        {esEstadoPrimario && <span className="hidden min-[360px]:inline">{actionMeta.text}</span>}
                    </button>
                )}

                {puedeAsignar && (
                    <button
                        onClick={() => onAssign?.(ticket)}
                        className={cn(
                            "flex items-center gap-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all",
                            esAsignarPrimario
                                ? "px-3 py-1.5 text-white bg-estado-asignada shadow-sm"
                                : "px-2.5 py-1.5 text-estado-asignada bg-estado-asignada/10 hover:bg-estado-asignada/20"
                        )}
                        title="Asignar Técnico"
                    >
                        <Icon name="engineering" size="xs" />
                        {esAsignarPrimario && <span className="hidden min-[360px]:inline">Asignar</span>}
                    </button>
                )}

                {puedeRevisar && (
                    <button
                        onClick={() => onReview?.(ticket)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-estado-resuelto active:scale-95 transition-all shadow-sm"
                    >
                        <Icon name="fact_check" size="xs" />
                        <span className="hidden min-[360px]:inline">Revisar</span>
                    </button>
                )}
            </div>
        </div>
    );
};


export { TicketCard as MantenimientosTicketCard };
