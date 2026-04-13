import React from 'react';
import { useDashboardContext } from '../context/dashboard-context';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

export default function TabArea() {
    // Consumimos el contexto seguro
    const { data, loading } = useDashboardContext();
    const mapaCalor = data?.mapaCalor ?? [];
    const ticketsEvaluados = data?.ticketsEvaluados ?? [];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* MAPA DE CALOR */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Icon name="location_on" size="sm" className="text-marca-primario" />
                    <h3 className="text-sm font-bold text-slate-800">Áreas con más incidencias</h3>
                </div>
                <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-1"><Skeleton className="h-3 w-40" /><Skeleton className="h-2 w-full" /></div>
                        ))
                        : mapaCalor.length === 0
                            ? <p className="text-sm text-slate-400 italic col-span-2">Sin datos de áreas.</p>
                            : mapaCalor.map((area, idx) => {
                                const max = mapaCalor[0]?.total || 1;
                                const pct = Math.round((area.total / max) * 100);
                                return (
                                    <div key={idx} className="flex flex-col gap-1 py-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-700">{area.planta} — {area.area}</span>
                                            <span className="text-xs font-extrabold font-mono text-slate-600">{area.total}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-marca-primario/80 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })
                    }
                </div>
            </div>

            {/* TICKETS EVALUADOS EN LAS ÁREAS */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon name="assignment_turned_in" size="sm" className="text-marca-primario" />
                        <h3 className="text-sm font-bold text-slate-800">Evaluación Detallada de Tickets</h3>
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-bold">Últimos {ticketsEvaluados.length}</span>
                </div>
                <div className="flex flex-col max-h-[600px] overflow-y-auto custom-scrollbar">
                    {loading
                        ? <div className="p-5 text-center"><Icon name="progress_activity" className="animate-spin text-slate-300" size="xl" /></div>
                        : ticketsEvaluados.length === 0
                            ? <p className="text-sm text-slate-400 italic py-8 text-center">No hay tickets resueltos en este filtro.</p>
                            : ticketsEvaluados.map((ticket) => (
                                <div key={ticket.id} className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-3 md:items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-extrabold text-slate-500 font-mono tracking-tighter">#{ticket.id}</span>
                                            <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{ticket.titulo}</h4>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ticket.descripcion}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">{ticket.planta} - {ticket.area}</span>
                                            <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">{ticket.clasificacion}</span>
                                        </div>
                                    </div>

                                    <div className={cn('shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border',
                                        ticket.colorKpi === 'green' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                            ticket.colorKpi === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                'bg-red-50 border-red-200 text-red-700'
                                    )}>
                                        <span className="text-xs font-bold uppercase tracking-wide">KPI</span>
                                        <span className="text-lg font-black font-mono">{ticket.kpi}</span>
                                    </div>
                                </div>
                            ))
                    }
                </div>
            </div>
        </div>
    );
}