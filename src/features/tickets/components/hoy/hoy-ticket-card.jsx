// src/features/tickets/components/hoy/hoy-ticket-card.jsx
import { useState } from 'react';
import { Icon, Tooltip } from '@/components/ui/z_index';
import { TicketStatusBadge, TicketPriorityBadge } from '../historico/ticket-status-badge';
import { isPastDate, formatFechaHora } from '@/lib/date';
import { cn } from '@/utils/cn';
import { Button } from '../../../../components/ui/button';

const ROLES_ADMIN = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];
const ROLES_SUPERVISOR = ['SUPER_ADMIN', 'JEFE_MTTO'];
const ESTADOS_FINALES = ['CERRADO', 'CANCELADA'];

const isVencida = (ticket) => {
    if (!ticket.fechaVencimiento) return false;
    if (ESTADOS_FINALES.includes(ticket.estado)) return false;
    return isPastDate(ticket.fechaVencimiento);
};

const calcElapsedLabel = (ticket) => {
    if (ticket.estado !== 'EN_PROGRESO') return null;
    const abierto = ticket.intervalos?.find((i) => !i.fin);
    if (!abierto) return null;
    const mins = Math.max(0, Math.floor((Date.now() - new Date(abierto.inicio).getTime()) / 60000));
    const acum = (ticket.duracionReal || 0) + mins;
    if (acum < 60) return `${acum} min`;
    const h = Math.floor(acum / 60);
    const m = acum % 60;
    return m > 0 ? `${h} h ${m} min` : `${h} h`;
};

const getEstadoActionMeta = (estado) => {
    switch (estado) {
        case 'ASIGNADA': return { text: 'Iniciar', icon: 'play_arrow' };
        case 'EN_PROGRESO': return { text: 'Finalizar', icon: 'check_circle' };
        case 'EN_PAUSA': return { text: 'Reanudar', icon: 'play_arrow' };
        case 'RECHAZADO': return { text: 'Reiniciar', icon: 'replay' };
        default: return { text: 'Estado', icon: 'swap_horiz' };
    }
};

export const HoyTicketCard = ({
    ticket,
    currentUser,
    onViewDetail,
    onEdit,
    onAssign,
    onChangeStatus,
    onReview,
    onCancel,
    className,
}) => {
    const { rol, id: userId } = currentUser ?? {};
    const [responsablesExpanded, setResponsablesExpanded] = useState(false);

    const esAdmin = ROLES_ADMIN.includes(rol);
    const esSupervisor = ROLES_SUPERVISOR.includes(rol);
    const esTecnico = rol === 'TECNICO';
    const esCliente = rol === 'CLIENTE_INTERNO';
    const esCreador = ticket.creadorId === userId;
    const esResponsable = ticket.responsables?.some((r) => r.id === userId);
    const tieneResponsables = ticket.responsables?.length > 0;
    const vencida = isVencida(ticket);
    const elapsedLabel = calcElapsedLabel(ticket);
    const actionMeta = getEstadoActionMeta(ticket.estado);

    const puedeEditar =
        !['EN_PROGRESO', 'RESUELTO', ...ESTADOS_FINALES].includes(ticket.estado) &&
        (esAdmin || (esCliente && esCreador && ticket.estado === 'PENDIENTE'));

    const puedeAsignar =
        esAdmin &&
        !['EN_PROGRESO', 'EN_PROCESO', 'RESUELTO', ...ESTADOS_FINALES].includes(ticket.estado);

    const puedeCambiarEstado =
        tieneResponsables &&
        !['RESUELTO', ...ESTADOS_FINALES].includes(ticket.estado) &&
        (esAdmin || (esTecnico && esResponsable));

    const puedeRevisar =
        ticket.estado === 'RESUELTO' &&
        (esSupervisor || (esCliente && esCreador));

    const puedeCancelar =
        !ESTADOS_FINALES.includes(ticket.estado) &&
        ticket.estado !== 'RESUELTO' &&
        (esSupervisor || (esCliente && esCreador && ticket.estado === 'PENDIENTE'));

    const esAsignarPrimario = ticket.estado === 'PENDIENTE';
    const esEstadoPrimario = ['ASIGNADA', 'EN_PROGRESO', 'EN_PAUSA', 'RECHAZADO'].includes(ticket.estado);

    const responsablesExtra = (ticket.responsables?.length || 0) - 2;
    const responsablesMostrar = responsablesExpanded
        ? ticket.responsables
        : ticket.responsables?.slice(0, 2);

    return (
        <div className={cn(
            'bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-3 h-full',
            vencida ? 'border-estado-rechazado/30 bg-red-50/30' : 'border-slate-200',
            className
        )}>
            {/* ── Cabecera: título + badges ── */}
            <div
                className="flex items-start justify-between gap-2 cursor-pointer active:opacity-70 transition-opacity"
                onClick={() => onViewDetail?.(ticket)}
            >
                <div className="flex-1 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-400 block mb-1">
                        #{ticket.id}
                        {ticket.tipo && (
                            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                {ticket.tipo}
                            </span>
                        )}
                    </span>
                    <div className="flex items-start gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 flex-1">
                            {ticket.titulo}
                        </h3>
                        {vencida && (
                            <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-estado-rechazado bg-estado-rechazado/10 border border-estado-rechazado/20 px-1.5 py-0.5 rounded-md uppercase shrink-0">
                                <Icon name="warning" size="xs" /> ATRASADA
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <TicketStatusBadge estado={ticket.estado} />
                    <TicketPriorityBadge prioridad={ticket.prioridad} />
                </div>
            </div>

            {/* ── Cronómetro activo ── */}
            {elapsedLabel && (
                <div className="flex items-center gap-2 px-3 py-2 bg-estado-en-progreso/10 border border-estado-en-progreso/20 rounded-lg">
                    <Icon name="timer" size="xs" className="text-estado-en-progreso animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-estado-en-progreso font-mono">
                        {elapsedLabel} en progreso
                    </span>
                </div>
            )}

            {/* ── Info contextual ── */}
            <div className="flex flex-col gap-1.5 ml-1 flex-1">
                {ticket.planta && (
                    <p className="flex items-center gap-2">
                        <Icon name="factory" size="xs" className="text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-500">
                            {ticket.planta}{ticket.area ? ` — ${ticket.area}` : ''}
                        </span>
                    </p>
                )}
                {ticket.clasificacion && (
                    <p className="flex items-center gap-2">
                        <Icon name="label" size="xs" className="text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-500 capitalize">{ticket.clasificacion.toLowerCase()}</span>
                    </p>
                )}
                {ticket.responsables?.length > 0 && (
                    <div className="flex items-start gap-2">
                        <Icon name="engineering" size="xs" className="text-slate-300 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1.5 min-w-0">
                            {responsablesMostrar.map((r) => (
                                <div key={r.id} className="flex items-center gap-1.5">
                                    {r.imagen ? (
                                        <img
                                            src={r.imagen}
                                            alt={r.nombre}
                                            className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/img/perfil-no-foto.webp'; }}
                                        />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-marca-primario/10 flex items-center justify-center text-[9px] font-bold text-marca-primario shrink-0">
                                            {r.nombre?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-xs text-slate-500 truncate">{r.nombre}</span>
                                </div>
                            ))}
                            {responsablesExtra > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setResponsablesExpanded(!responsablesExpanded); }}
                                    className="text-[10px] font-bold text-marca-primario hover:underline self-start cursor-pointer"
                                >
                                    {responsablesExpanded ? 'Ver menos' : `+ ${responsablesExtra} más`}
                                </button>
                            )}
                        </div>
                    </div>
                )}
                {ticket.fechaVencimiento && (
                    <p className="flex items-center gap-2">
                        <Icon name="event" size="xs" className={cn('shrink-0', vencida ? 'text-estado-rechazado/70' : 'text-slate-300')} />
                        <span className={cn('text-xs font-medium', vencida ? 'text-estado-rechazado' : 'text-slate-500')}>
                            {formatFechaHora(ticket.fechaVencimiento)}
                        </span>
                    </p>
                )}
            </div>

            {/* ── Barra de acciones ── mt-auto empuja los botones hacia el fondo de la card */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap w-full mt-auto">
                {puedeCancelar && (
                    <Tooltip text="Cancelar" variant="error">
                        <button
                            onClick={() => onCancel?.(ticket)}
                            className="flex items-center justify-center p-1.5 rounded-lg text-estado-rechazado bg-estado-rechazado/10 hover:bg-estado-rechazado/20 active:scale-95 transition-all cursor-pointer"
                        >
                            <Icon name="cancel" size="xs" />
                        </button>
                    </Tooltip>
                )}

                <Tooltip text="Ver detalle" variant="dark">
                    <button
                        onClick={() => onViewDetail?.(ticket)}
                        className="flex items-center justify-center p-1.5 rounded-md text-slate-600 hover:bg-slate-600/10 transition-colors cursor-pointer"
                    >
                        <Icon name="visibility" size="sm" />
                    </button>
                </Tooltip>

                <div className="flex-1 min-w-[8px]" />

                {puedeEditar && (
                    <Tooltip text="Editar" variant="dark">
                        <button
                            onClick={() => onEdit?.(ticket)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-prioridad-media bg-prioridad-media/10 hover:bg-prioridad-media/20 active:scale-95 transition-all cursor-pointer"
                        >
                            <Icon name="edit" size="xs" />
                        </button>
                    </Tooltip>
                )}

                {puedeCambiarEstado && (
                    <button
                        onClick={() => onChangeStatus?.(ticket)}
                        className={cn(
                            'flex items-center gap-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer',
                            esEstadoPrimario
                                ? 'px-3 py-1.5 text-white bg-estado-en-progreso shadow-sm'
                                : 'px-2.5 py-1.5 text-estado-en-progreso bg-estado-en-progreso/10 hover:bg-estado-en-progreso/20'
                        )}
                    >
                        <Icon name={actionMeta.icon} size="xs" />
                        {esEstadoPrimario && <span className="hidden min-[360px]:inline">{actionMeta.text}</span>}
                    </button>
                )}

                {puedeAsignar && (
                    <Tooltip text="Asignar técnico" variant="dark">
                        <button
                            onClick={() => onAssign?.(ticket)}
                            className={cn(
                                'flex items-center gap-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer',
                                esAsignarPrimario
                                    ? 'px-3 py-1.5 text-white bg-estado-asignada shadow-sm'
                                    : 'px-2.5 py-1.5 text-estado-asignada bg-estado-asignada/10 hover:bg-estado-asignada/20'
                            )}
                        >
                            <Icon name="engineering" size="xs" />
                            {esAsignarPrimario && <span className="hidden min-[360px]:inline">Asignar</span>}
                        </button>
                    </Tooltip>
                )}

                {puedeRevisar && (
                    <button
                        onClick={() => onReview?.(ticket)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-estado-resuelto active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                        <Icon name="fact_check" size="xs" />
                        <span className="hidden min-[360px]:inline">Revisar</span>
                    </button>
                )}
            </div>
        </div >
    );
};