import React, { useState } from 'react';
import { Icon, Tooltip } from '@/components/ui/z_index';
import { TicketPriorityBadge } from '@/features/common/components/ticket-status-badge';
import { formatFechaHora } from '@/lib/date';
import { cn } from '@/utils/cn';

export function MobileAprobarCard({ ticket, onReview, onViewDetails }) {
    const [responsablesExpanded, setResponsablesExpanded] = useState(false);

    const responsablesExtra = (ticket.responsables?.length || 0) - 2;
    const responsablesMostrar = responsablesExpanded
        ? ticket.responsables
        : ticket.responsables?.slice(0, 2);

    return (
        <div className="border border-slate-200 bg-white rounded-2xl p-4 shadow-sm flex flex-col h-full transition-all">
            <div
                className="flex items-start justify-between gap-2 mb-2 active:opacity-70 transition-opacity cursor-pointer"
                onClick={() => onViewDetails?.(ticket)}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-400">
                            #{String(ticket.id)}
                        </span>
                        {ticket.tipo && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                {ticket.tipo}
                            </span>
                        )}
                        {ticket.isLate && (
                            <span className="flex items-center gap-0.5 text-[8px] font-black text-red-700 bg-red-50 border border-red-200 px-1 py-0.5 rounded-md uppercase shrink-0 animate-pulse">
                                <Icon name="timer_off" size="xs" /> Con Retraso
                            </span>
                        )}
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
                
                <div className="flex items-center gap-2 pt-1.5 flex-wrap">
                    <span className="flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 shadow-sm">
                        <Icon name="check_circle" size="xs" fill />
                        Resuelto
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 ml-auto uppercase tracking-wider">
                        {ticket.finalizadoAt ? formatFechaHora(ticket.finalizadoAt) : 'Finalizado'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap w-full mt-auto">
                <button
                    onClick={() => onViewDetails?.(ticket)}
                    className="flex items-center justify-center p-1.5 rounded-md text-slate-600 hover:bg-slate-600/10 transition-colors cursor-pointer"
                >
                    <Icon name="visibility" size="sm" />
                </button>

                <div className="flex-1 min-w-[8px]"></div>

                <button
                    onClick={() => onReview?.(ticket)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-estado-resuelto hover:brightness-110 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                    <Icon name="fact_check" size="xs" />
                    <span className="inline">Revisar</span>
                </button>
            </div>
        </div>
    );
}
