import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon, Tooltip } from '@/components/ui/z_index';
import { TicketPriorityBadge } from '../historico/ticket-status-badge';
import { formatFechaHora } from '@/lib/date';
import { cn } from '@/utils/cn';

export function BandejaTicketCard({ ticket, onAssign, onViewDetails }) {
    const location = useLocation();
    const cardRef = useRef(null);
    const isHighlighted = location.hash === `#ticket-${ticket.id}`;

    useEffect(() => {
        if (isHighlighted && cardRef.current) {
            cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isHighlighted]);

    // Purga de instanciación Date a favor de matemática simple y segura 
    const calculateDaysWaiting = (createdAt) => {
        if (!createdAt) return 0;
        const createdMs = Date.parse(createdAt);
        if (isNaN(createdMs)) return 0;

        const diffTime = Math.abs(Date.now() - createdMs);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysWaiting = calculateDaysWaiting(ticket.createdAt);

    let statusTheme = {
        cardBorder: 'border-slate-200',
        cardBg: 'bg-white',
        timeColor: 'text-slate-500',
        timeBg: 'bg-slate-100',
        timeBorder: 'border-slate-200',
        text: daysWaiting === 0 ? 'Hoy' : `${daysWaiting} día(s) en espera`
    };

    if (daysWaiting >= 3) {
        statusTheme = {
            cardBorder: 'border-estado-rechazado/30',
            cardBg: 'bg-red-50/30',
            timeColor: 'text-estado-rechazado',
            timeBg: 'bg-estado-rechazado/10',
            timeBorder: 'border-estado-rechazado/30',
            text: `CRÍTICO: ${daysWaiting} DÍAS`
        };
    } else if (daysWaiting === 2) {
        statusTheme = {
            cardBorder: 'border-orange-300/50',
            cardBg: 'bg-orange-50/30',
            timeColor: 'text-orange-600',
            timeBg: 'bg-orange-500/10',
            timeBorder: 'border-orange-500/20',
            text: `ATRASADO: ${daysWaiting} DÍAS`
        };
    }

    return (
        <div
            ref={cardRef}
            id={`ticket-${ticket.id}`}
            className={cn(
                'border rounded-2xl p-4 shadow-sm flex flex-col h-full transition-all duration-700',
                isHighlighted ? 'ring-4 ring-yellow-400 bg-yellow-50 border-yellow-400' : statusTheme.cardBg,
                !isHighlighted && statusTheme.cardBorder
            )}>
            <div
                className="flex items-start justify-between gap-2 mb-2 active:opacity-70 transition-opacity cursor-pointer"
                onClick={() => onViewDetails?.(ticket)}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-400">
                            {ticket.folio || `#${String(ticket.id)}`}
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {ticket.titulo}
                    </h3>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <TicketPriorityBadge prioridad={ticket.prioridad} />
                </div>
            </div>

            <div className="space-y-1.5 mb-3 ml-1 mt-2 flex-grow">
                {(ticket.planta || ticket.area) && (
                    <p className="flex items-center gap-2">
                        <Icon name="factory" size="xs" className="text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-500">
                            {ticket.planta || 'General'}{ticket.area ? ` — ${ticket.area}` : ''}
                        </span>
                    </p>
                )}
                {ticket.creador && (
                    <p className="flex items-center gap-2">
                        <Icon name="person" size="xs" className="text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-500 truncate">{ticket.creador.nombre}</span>
                    </p>
                )}

                <div className="flex items-center gap-2 pt-1.5">
                    <span className={cn(
                        "flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase shrink-0 border",
                        statusTheme.timeColor,
                        statusTheme.timeBg,
                        statusTheme.timeBorder
                    )}>
                        <Icon name="schedule" size="xs" />
                        {statusTheme.text}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 ml-auto uppercase tracking-wider">
                        {formatFechaHora(ticket.createdAt)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap w-full mt-auto">
                <Tooltip text="Ver detalle" variant="dark">
                    <button
                        onClick={() => onViewDetails?.(ticket)}
                        className="flex items-center justify-center p-1.5 rounded-md text-slate-600 hover:bg-slate-600/10 transition-colors cursor-pointer"
                    >
                        <Icon name="visibility" size="sm" />
                    </button>
                </Tooltip>

                <div className="flex-1 min-w-[8px]"></div>

                <button
                    onClick={() => onAssign?.(ticket)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-estado-asignada shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                    <Icon name="engineering" size="xs" />
                    <span className="hidden min-[360px]:inline">Asignar</span>
                </button>
            </div>
        </div>
    );
}