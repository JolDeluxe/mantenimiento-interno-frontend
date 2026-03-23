// src/features/tickets/components/historico/ticket-timeline.jsx
import { useState } from 'react';
import { Icon } from '@/components/ui/z_index';

const formatFecha = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const formatEstado = (estado) => {
    if (!estado) return '';
    return estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const TicketTimeline = ({ historial }) => {
    const [filtro, setFiltro] = useState('ESTADO');

    if (!historial || historial.length === 0) return null;

    const eventosVisibles = historial.filter((h) => {
        if (filtro === 'COMPLETO') return true;

        const isCreation = !h.estadoAnterior || h.estadoAnterior === h.estadoNuevo;
        const hasStateChange = h.estadoAnterior && h.estadoNuevo && h.estadoAnterior !== h.estadoNuevo;

        return isCreation || hasStateChange;
    });

    return (
        <div className="w-full lg:w-80 xl:w-96 shrink-0 bg-slate-50/50 border border-slate-100 rounded-xl p-0 max-h-[65vh] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 pt-1 pb-3 mb-5 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Icon name="history" size="sm" className="text-marca-primario" />
                    Línea de Tiempo
                </h4>

                <div className="flex bg-slate-200/60 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setFiltro('ESTADO')}
                        className={`flex-1 text-[10px] uppercase tracking-wider font-extrabold py-2 rounded-md transition-all ${filtro === 'ESTADO' ? 'bg-white shadow-sm text-marca-primario' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Por Estado
                    </button>
                    <button
                        type="button"
                        onClick={() => setFiltro('COMPLETO')}
                        className={`flex-1 text-[10px] uppercase tracking-wider font-extrabold py-2 rounded-md transition-all ${filtro === 'COMPLETO' ? 'bg-white shadow-sm text-marca-primario' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Completo
                    </button>
                </div>
            </div>

            <ol className="relative border-l-2 border-slate-200 ml-3 flex flex-col gap-6">
                {eventosVisibles.map((h, index) => {
                    const isAbsoluteLatest = h.id === historial[0].id;
                    const isCreation = !h.estadoAnterior || h.estadoAnterior === h.estadoNuevo;
                    const hasStateChange = h.estadoAnterior && h.estadoNuevo && h.estadoAnterior !== h.estadoNuevo;

                    return (
                        <li key={h.id} className="relative pl-6">
                            <div className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm 
                                ${isAbsoluteLatest ? 'bg-marca-primario ring-4 ring-marca-primario/20 animate-pulse' : 'bg-slate-300'}`}
                            />

                            <div className="flex items-center gap-2 mb-1">
                                <p className={`text-[11px] font-bold tracking-wide uppercase ${isAbsoluteLatest ? 'text-marca-primario' : 'text-slate-400'}`}>
                                    {formatFecha(h.createdAt)}
                                </p>
                                {isAbsoluteLatest && (
                                    <span className="text-[9px] font-extrabold bg-marca-primario text-white px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                                        Actual
                                    </span>
                                )}
                            </div>

                            <div>
                                {hasStateChange ? (
                                    <div className="flex items-center flex-wrap gap-1.5 text-sm mb-1.5">
                                        <span className="text-slate-400 line-through decoration-slate-300">{formatEstado(h.estadoAnterior)}</span>
                                        <Icon name="arrow_forward" size="xs" className="text-slate-400" />
                                        <span className="font-bold text-marca-primario">{formatEstado(h.estadoNuevo)}</span>
                                    </div>
                                ) : isCreation ? (
                                    <div className="flex items-center gap-1.5 text-sm mb-1.5">
                                        <Icon name="flag" size="xs" className="text-emerald-500" />
                                        <span className="font-bold text-slate-700">Ticket Registrado</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-sm mb-1.5">
                                        <Icon name="edit" size="xs" className="text-slate-400" />
                                        <span className="font-bold text-slate-700">Actualización</span>
                                    </div>
                                )}

                                {h.nota && (
                                    <p className={`text-sm leading-snug ${hasStateChange || isCreation ? 'text-slate-600 border-l-2 border-slate-200 pl-2 italic mt-2' : 'font-medium text-slate-700'}`}>
                                        {h.nota}
                                    </p>
                                )}
                            </div>

                            {h.usuario && (
                                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
                                    <Icon name="account_circle" size="xs" /> {h.usuario.nombre}
                                </p>
                            )}
                        </li>
                    );
                })}
            </ol>

            {eventosVisibles.length === 0 && (
                <div className="text-center text-slate-400 text-sm py-4 italic">
                    No hay eventos registrados para este filtro.
                </div>
            )}
        </div>
    );
};