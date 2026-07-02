// src/features/hoy/components/common/hoy-ticket-card.jsx
import { useState, useRef, useEffect } from 'react';
import { Icon, Tooltip } from '@/components/ui/z_index';
import { TicketStatusBadge, TicketPriorityBadge } from '@/features/common/components/ticket-status-badge';
import { formatFechaHora, formatDurationToDaysHours, isoToLocalMXTime, format12h } from '@/lib/date';
import { cn } from '@/utils/cn';
import { CATEGORIAS_EQUIPO } from '@/features/tickets/constants';

const ROLES_ADMIN = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];
const ROLES_SUPERVISOR = ['SUPER_ADMIN', 'JEFE_MTTO'];
const ESTADOS_FINALES = ['CERRADO', 'CANCELADA'];

const isVencida = (ticket) => {
    return !!ticket.isOverdue;
};

const getStatusLabelData = (ticket) => {
    if (ticket.estado === 'RECHAZADO') {
        return {
            label: 'Tarea rechazada',
            icon: 'warning',
            colorClasses: 'text-estado-rechazado bg-estado-rechazado/10 border-estado-rechazado/20 shadow-none',
            pulse: true,
        };
    }
    if (ticket.estado === 'RESUELTO') {
        return {
            label: 'Espera de aprobación',
            icon: 'hourglass_top',
            colorClasses: 'text-estado-resuelto bg-estado-resuelto/10 border-estado-resuelto/20',
            pulse: false,
        };
    }
    if (ticket.estado === 'EN_PAUSA') {
        let pauseDate = ticket.updatedAt ? new Date(ticket.updatedAt) : new Date();
        if (ticket.intervalos?.length > 0) {
            const lastInterval = ticket.intervalos[ticket.intervalos.length - 1];
            if (lastInterval.fin) pauseDate = new Date(lastInterval.fin);
        }
        const elapsedMins = Math.max(0, Math.floor((Date.now() - pauseDate.getTime()) / 60000));
        const durationStr = formatDurationToDaysHours(elapsedMins);

        return {
            label: `Pausada (${durationStr})`,
            icon: 'pause_circle',
            colorClasses: 'text-slate-500 bg-slate-100 border-slate-200',
            pulse: false,
        };
    }
    if (ticket.estado === 'EN_PROGRESO') {
        let extraMins = 0;
        const abierto = ticket.intervalos?.find((i) => !i.fin);
        if (abierto) {
            const inicioMs = new Date(abierto.inicio).getTime();
            if (!isNaN(inicioMs)) {
                extraMins = Math.max(0, Math.floor((Date.now() - inicioMs) / 60000));
            }
        } else if (ticket.fechaInicio) {
            const inicioMs = new Date(ticket.fechaInicio).getTime();
            if (!isNaN(inicioMs)) {
                extraMins = Math.max(0, Math.floor((Date.now() - inicioMs) / 60000));
            }
        }
        const acum = (ticket.duracionReal || 0) + extraMins;
        const timeString = formatDurationToDaysHours(acum);
        return {
            label: `${timeString} en progreso`,
            icon: 'timer',
            colorClasses: 'text-estado-en-progreso bg-estado-en-progreso/10 border-estado-en-progreso/20',
            pulse: true,
        };
    }
    return null;
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

export const HoyTicketCard = ({
    ticket,
    currentUser,
    onViewDetail,
    onEdit,
    onAssign,
    onChangeStatus,
    onReview,
    onCancel,
    isHighlighted = false,
    className,
}) => {
    const { rol, id: userId } = currentUser ?? {};
    const [responsablesExpanded, setResponsablesExpanded] = useState(false);
    const [showHighlight, setShowHighlight] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        if (!isHighlighted) return;
        showHighlight(true);
        const raf = requestAnimationFrame(() => {
            cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        const timer = setTimeout(() => setShowHighlight(false), 3000);
        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(raf);
        };
    }, [isHighlighted]);

    const esAdmin = ROLES_ADMIN.includes(rol);
    const esSupervisor = ROLES_SUPERVISOR.includes(rol);
    const esTecnico = rol === 'TECNICO';
    const esCliente = rol === 'CLIENTE_INTERNO';
    const esCreador = ticket.creadorId === userId;
    const esResponsable = ticket.responsables?.some((r) => r.id === userId);
    const tieneResponsables = ticket.responsables?.length > 0;

    const vencida = isVencida(ticket);
    const esRechazada = ticket.estado === 'RECHAZADO';
    const statusLabelData = getStatusLabelData(ticket);
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

    let baseClasses = 'border-slate-200';
    if (esRechazada) {
        baseClasses = 'border-estado-rechazado/40 bg-red-50/40';
    } else if (ticket.maquina && (ticket.clasificacion === 'CORRECTIVO' || ticket.tipo === 'TICKET')) {
        if (ticket.maquina.criticidad === 'A') {
            baseClasses = 'border-red-300/50 bg-red-50/60 shadow-[inset_4px_0_0_0_#ef4444]';
        } else if (ticket.maquina.criticidad === 'B') {
            baseClasses = 'border-amber-300/50 bg-amber-50/50 shadow-[inset_4px_0_0_0_#f59e0b]';
        } else if (ticket.maquina.criticidad === 'C') {
            baseClasses = 'border-slate-300/50 bg-slate-50/20 shadow-[inset_4px_0_0_0_#94a3b8]';
        }
    }

    return (
        <div
            ref={cardRef}
            className={cn(
                'bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-3 h-full transition-all duration-700 hover:shadow-md',
                showHighlight
                    ? 'border-yellow-400 bg-yellow-50/50 shadow-[0_0_0_4px_rgba(250,204,21,0.45),0_8px_24px_rgba(250,204,21,0.2)] -translate-y-0.5'
                    : baseClasses,
                className
            )}
        >
            <div
                className="flex items-start justify-between gap-2 cursor-pointer active:opacity-75 transition-opacity select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1 min-w-0">
                    <span className="flex items-center flex-wrap gap-2 text-xs font-mono font-bold text-slate-400 mb-1.5">
                        <span>#{ticket.id}</span>
                        {ticket.tipo && (
                            ticket.tipo === 'TICKET' ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md leading-none">
                                    <Icon name="warning" size="10px" className="text-amber-500 shrink-0" />
                                    <span>Reporte</span>
                                </span>
                            ) : (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md leading-none border border-slate-200/50">
                                    {ticket.tipo}
                                </span>
                            )
                        )}
                        {ticket.clasificacion && (
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md leading-none border",
                                ticket.clasificacion === 'PREVENTIVO' ? 'bg-blue-50 text-blue-700 border-blue-200/50' :
                                ticket.clasificacion === 'CORRECTIVO' ? 'bg-red-50 text-red-700 border-red-200/50' :
                                'bg-slate-100 text-slate-500 border-slate-200/50'
                            )}>
                                {ticket.clasificacion}
                            </span>
                        )}
                    </span>
                    <div className="flex items-start gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 flex-1">
                            {ticket.titulo}
                        </h3>
                    </div>

                    {/* Ubicación de la tarea */}
                    <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-slate-500">
                        <Icon name="location_on" size="xxs" className="text-slate-400 shrink-0" />
                        <span className="truncate">
                            {ticket.planta}{ticket.area ? ` — ${ticket.area}` : ''}
                        </span>
                    </div>

                    {/* Información de la máquina si existe */}
                    {ticket.maquina && (
                        <div className="text-[11px] font-semibold text-slate-505 mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="text-slate-400 font-normal">Máquina:</span>
                            <span className="text-slate-800 font-bold">{ticket.maquina.codigo}</span>
                            <span className="text-slate-450 font-normal">—</span>
                            <span className="text-slate-700">{ticket.maquina.nombre}</span>
                            {ticket.maquina.criticidad && (
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[8px] font-black leading-none border",
                                    ticket.maquina.criticidad === 'A' ? 'bg-red-50 text-red-600 border-red-200' :
                                    ticket.maquina.criticidad === 'B' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                    'bg-slate-100 text-slate-500 border-slate-200'
                                )}>
                                    Crit. {ticket.maquina.criticidad}
                                </span>
                            )}
                        </div>
                    )}
                    {/* Horario o duración programada ultra-compacta */}
                    {(ticket.horaInicioProgramada && ticket.horaFinProgramada) || (ticket.tiempoEstimado > 0) ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mt-1">
                            {ticket.horaInicioProgramada && ticket.horaFinProgramada ? (
                                <>
                                    <Icon name="schedule" size="12px" className="text-slate-400 shrink-0" />
                                    <span>
                                        {(() => {
                                            const startStr = format12h(isoToLocalMXTime(ticket.horaInicioProgramada));
                                            const endStr = format12h(isoToLocalMXTime(ticket.horaFinProgramada));
                                            
                                            const startMs = new Date(ticket.horaInicioProgramada).getTime();
                                            const endMs = new Date(ticket.horaFinProgramada).getTime();
                                            let dur = '';
                                            if (!isNaN(startMs) && !isNaN(endMs) && endMs > startMs) {
                                                const diffMins = Math.round((endMs - startMs) / 60000);
                                                dur = ` (${formatDurationToDaysHours(diffMins)})`;
                                            }
                                            return `${startStr} — ${endStr}${dur}`;
                                        })()}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Icon name="timer" size="12px" className="text-slate-400 shrink-0" />
                                    <span>{ticket.tiempoEstimado} min</span>
                                </>
                            )}
                        </div>
                    ) : null}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1">
                        {vencida ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide border text-estado-rechazado bg-estado-rechazado/10 border-estado-rechazado/20">
                                <Icon name="warning" size="10px" />
                                Atrasada
                            </span>
                        ) : (
                            <TicketStatusBadge estado={ticket.estado} className="text-[9px] px-1.5 py-0.5" />
                        )}
                        <Icon
                            name="keyboard_arrow_down"
                            size="sm"
                            className={cn(
                                'text-slate-400 transition-transform duration-300',
                                isExpanded && 'rotate-180'
                            )}
                        />
                    </div>
                    <TicketPriorityBadge prioridad={ticket.prioridad} className="text-[9px] px-1.5 py-0.5" />
                </div>
            </div>

            {statusLabelData && (
                <div className={cn('flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-[10px] font-bold font-mono', statusLabelData.colorClasses)}>
                    <Icon
                        name={statusLabelData.icon}
                        size="12px"
                        className={cn('shrink-0', statusLabelData.pulse && 'animate-pulse')}
                    />
                    <span className="leading-none">
                        {statusLabelData.label}
                    </span>
                </div>
            )}

            {isExpanded && (
                <div className="flex flex-col gap-1.5 ml-1 flex-1 border-t border-slate-100/50 pt-2.5 animate-fadeIn">
                    {ticket.planta && (
                        <p className="flex items-center gap-2">
                            <Icon name="factory" size="xs" className="text-slate-300 shrink-0" />
                            <span className="text-xs text-slate-500">
                                {ticket.planta}{ticket.area ? ` — ${ticket.area}` : ''}
                            </span>
                        </p>
                    )}
                    {(() => {
                        const catInfo = CATEGORIAS_EQUIPO.find(c => c.value === ticket.categoria);
                        if (!ticket.categoria) return null;
                        return (
                            <p className="flex items-center gap-2">
                                <Icon name={catInfo?.icon || 'label'} size="xs" className="text-slate-300 shrink-0" />
                                <span className="text-xs text-slate-500">
                                    {catInfo?.label || ticket.categoria}
                                </span>
                            </p>
                        );
                    })()}
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
                            <Icon name="event" size="xs" className={cn('shrink-0', vencida ? 'text-orange-500/80' : 'text-slate-300')} />
                            <span className={cn('text-xs font-medium', vencida ? 'text-orange-600 font-bold' : 'text-slate-500')}>
                                {formatFechaHora(ticket.fechaVencimiento)}
                            </span>
                        </p>
                    )}
                </div>
            )}

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
                                ? actionMeta.primaryClass
                                : actionMeta.ghostClass
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
        </div>
    );
};
