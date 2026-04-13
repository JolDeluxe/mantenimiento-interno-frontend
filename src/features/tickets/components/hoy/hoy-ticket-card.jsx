import { useState, useRef, useEffect } from 'react';
import { Icon, Tooltip } from '@/components/ui/z_index';
import { TicketStatusBadge, TicketPriorityBadge } from '../historico/ticket-status-badge';
import { isPastDate, formatFechaHora } from '@/lib/date';
import { cn } from '@/utils/cn';

const ROLES_ADMIN = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];
const ROLES_SUPERVISOR = ['SUPER_ADMIN', 'JEFE_MTTO'];
const ESTADOS_FINALES = ['CERRADO', 'CANCELADA'];

const isVencida = (ticket) => {
    if (!ticket.fechaVencimiento) return false;
    if (['RESUELTO', ...ESTADOS_FINALES].includes(ticket.estado)) return false;
    return isPastDate(ticket.fechaVencimiento);
};

const getStatusLabelData = (ticket) => {
    if (ticket.estado === 'RECHAZADO') {
        return {
            label: 'Atención requerida: Tarea rechazada',
            icon: 'warning',
            colorClasses: 'text-white bg-estado-rechazado border-estado-rechazado shadow-sm',
            pulse: true,
        };
    }
    if (ticket.estado === 'RESUELTO') {
        return {
            label: 'Tarea en espera de aprobación',
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
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaPausa = new Date(pauseDate);
        fechaPausa.setHours(0, 0, 0, 0);
        const diffDays = Math.round((hoy.getTime() - fechaPausa.getTime()) / (1000 * 60 * 60 * 24));

        let label = 'Tarea pausada';
        if (diffDays === 1) label = 'Tarea con 1 día en pausa';
        else if (diffDays > 1) label = `Tarea con ${diffDays} días en pausa`;

        return {
            label,
            icon: 'pause_circle',
            colorClasses: 'text-slate-500 bg-slate-100 border-slate-200',
            pulse: false,
        };
    }
    if (ticket.estado === 'EN_PROGRESO') {
        let extraMins = 0;
        const abierto = ticket.intervalos?.find((i) => !i.fin);
        if (abierto) {
            const inicioMs = Date.parse(abierto.inicio);
            if (!isNaN(inicioMs)) {
                extraMins = Math.max(0, Math.floor((Date.now() - inicioMs) / 60000));
            }
        }
        const acum = (ticket.duracionReal || 0) + extraMins;
        let timeString = '';
        if (acum < 60) timeString = `${acum} min`;
        else {
            const h = Math.floor(acum / 60);
            const m = acum % 60;
            timeString = m > 0 ? `${h} h ${m} min` : `${h} h`;
        }
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
    isHighlighted = false,
    className,
}) => {
    const { rol, id: userId } = currentUser ?? {};
    const [responsablesExpanded, setResponsablesExpanded] = useState(false);
    const [showHighlight, setShowHighlight] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        if (!isHighlighted) return;
        setShowHighlight(true);
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

    const baseClasses = esRechazada
        ? 'border-estado-rechazado/40 bg-red-50/40'
        : vencida
            ? 'border-orange-300/50 bg-orange-50/30'
            : 'border-slate-200';

    return (
        <div
            ref={cardRef}
            className={cn(
                'bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-3 h-full transition-all duration-700',
                showHighlight
                    ? 'border-yellow-400 bg-yellow-50/50 shadow-[0_0_0_4px_rgba(250,204,21,0.45),0_8px_24px_rgba(250,204,21,0.2)] -translate-y-0.5'
                    : baseClasses,
                className
            )}
        >
            <div
                className="flex items-start justify-between gap-2 cursor-pointer active:opacity-70 transition-opacity"
                onClick={() => onViewDetail?.(ticket)}
            >
                <div className="flex-1 min-w-0">
                    <span className="flex items-center flex-wrap gap-2 text-xs font-mono font-bold text-slate-400 mb-1.5">
                        <span>#{ticket.id}</span>
                        {ticket.tipo && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                {ticket.tipo}
                            </span>
                        )}
                        {vencida && !esRechazada && (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-white bg-red-500 px-1.5 py-0.5 rounded-md shadow-sm">
                                Atrasada
                            </span>
                        )}
                    </span>
                    <div className="flex items-start gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 flex-1">
                            {ticket.titulo}
                        </h3>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <TicketStatusBadge estado={ticket.estado} />
                    <TicketPriorityBadge prioridad={ticket.prioridad} />
                </div>
            </div>

            {statusLabelData && (
                <div className={cn('flex items-center gap-2 px-3 py-2 border rounded-lg', statusLabelData.colorClasses)}>
                    <Icon
                        name={statusLabelData.icon}
                        size="xs"
                        className={cn('shrink-0', statusLabelData.pulse && 'animate-pulse')}
                    />
                    <span className="text-xs font-bold font-mono">
                        {statusLabelData.label}
                    </span>
                </div>
            )}

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
                        <Icon name="event" size="xs" className={cn('shrink-0', vencida ? 'text-orange-500/80' : 'text-slate-300')} />
                        <span className={cn('text-xs font-medium', vencida ? 'text-orange-600 font-bold' : 'text-slate-500')}>
                            {formatFechaHora(ticket.fechaVencimiento)}
                        </span>
                    </p>
                )}
            </div>

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
        </div>
    );
};