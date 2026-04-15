import React, { useState } from 'react';
import { useDashboardContext } from '../context/dashboard-context';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { PlantaDetalle, formatMins } from '../components/planta-detalle';
import { AreaDetalle } from '../components/area-detalle';

const colorMttr = (mins) => {
    if (mins <= 0) return { bar: 'bg-slate-300', text: 'text-slate-500' };
    if (mins <= 60) return { bar: 'bg-emerald-500', text: 'text-emerald-700' };
    if (mins <= 240) return { bar: 'bg-amber-400', text: 'text-amber-700' };
    return { bar: 'bg-red-500', text: 'text-red-700' };
};

const PlantaRow = ({ planta, maxMttr, onOpenPlanta, onOpenArea }) => {
    const [isOpen, setIsOpen] = useState(false);
    const color = colorMttr(planta.mttrMins);
    const pct = Math.round((planta.mttrMins / maxMttr) * 100);

    return (
        <div className="flex flex-col border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm transition-all">
            <div
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left w-full cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-marca-primario/10 flex items-center justify-center shrink-0">
                        <Icon name="domain" className="text-marca-primario" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 truncate">{planta.planta}</span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs font-semibold text-slate-600">{planta.total} incid.</span>
                            <div className="flex items-center gap-1.5 border-l border-slate-300 pl-2">
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">{planta.totalTickets} Rep.</span>
                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100">{planta.totalCorrectivos} Corr.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto">
                    <div className="flex flex-col gap-1 w-full sm:w-32 mr-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold uppercase text-slate-400">MTTR Global</span>
                            <span className={cn('text-xs font-black font-mono', color.text)}>
                                {formatMins(planta.mttrMins)}
                            </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full transition-all duration-500', color.bar)} style={{ width: `${pct}%` }} />
                        </div>
                    </div>

                    {/* Botón Ojo - Detalle Planta */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onOpenPlanta(planta); }}
                        className="p-2 hover:bg-marca-primario/10 rounded-full transition-colors flex shrink-0"
                        title="Ver detalle completo de planta"
                    >
                        <Icon name="visibility" className="text-slate-400 hover:text-marca-primario" />
                    </button>

                    <Icon name={isOpen ? "expand_less" : "expand_more"} className="text-slate-400 shrink-0 hidden sm:block ml-1" />
                </div>
            </div>

            {isOpen && (
                <div className="flex flex-col gap-2 p-4 pt-0 bg-slate-50/50 border-t border-slate-100 animate-in fade-in duration-300">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-2">
                        Desglose por Área
                    </div>
                    {planta.areas.map((a, i) => {
                        const aColor = colorMttr(a.mttrMins);
                        const aPct = Math.round((a.mttrMins / maxMttr) * 100);
                        return (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-sm gap-3 hover:border-slate-300 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">{a.area}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-slate-500">{a.total} inc.</span>
                                        <span className="text-[10px] font-bold text-blue-500">{a.totalTickets} R</span>
                                        <span className="text-[10px] font-bold text-orange-500">{a.totalCorrectivos} C</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                                    <div className="flex-1 sm:w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={cn('h-full rounded-full transition-all duration-500', aColor.bar)} style={{ width: `${aPct}%` }} />
                                    </div>
                                    <span className={cn('text-[10px] font-black font-mono w-14 text-right', aColor.text)}>
                                        {formatMins(a.mttrMins)}
                                    </span>

                                    {/* Botón Ojo - Detalle Área */}
                                    <button
                                        type="button"
                                        onClick={() => onOpenArea(a, planta.planta)}
                                        className="p-1.5 hover:bg-slate-100 rounded-full transition-colors flex shrink-0 border border-slate-200"
                                        title="Ver detalle de área"
                                    >
                                        <Icon name="open_in_new" size="xs" className="text-slate-400 hover:text-marca-primario" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default function TabArea() {
    const { data, loading } = useDashboardContext();
    const metricasPorPlanta = data?.metricasPorPlanta ?? [];
    const ticketsEvaluados = data?.ticketsEvaluados ?? [];

    const [plantaDetalle, setPlantaDetalle] = useState(null);
    const [areaDetalle, setAreaDetalle] = useState(null);

    const maxMttr = Math.max(
        ...metricasPorPlanta.map((p) => p.mttrMins),
        ...metricasPorPlanta.flatMap((p) => p.areas.map(a => a.mttrMins)),
        1
    );

    return (
        <>
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                {/* DESEMPEÑO POR PLANTA Y ÁREA */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-1">
                        <Icon name="domain" size="sm" className="text-marca-primario" />
                        <h3 className="text-sm font-bold text-slate-800">Desempeño Operativo</h3>
                    </div>

                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-32" />
                                    <Skeleton className="h-2 w-20" />
                                </div>
                                <div className="w-24 space-y-2">
                                    <Skeleton className="h-2 w-full" />
                                </div>
                            </div>
                        ))
                    ) : metricasPorPlanta.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                            <p className="text-sm text-slate-400 italic">Sin datos registrados en las plantas.</p>
                        </div>
                    ) : (
                        metricasPorPlanta.map((planta, idx) => (
                            <PlantaRow
                                key={idx}
                                planta={planta}
                                maxMttr={maxMttr}
                                onOpenPlanta={setPlantaDetalle}
                                onOpenArea={(a, pName) => setAreaDetalle({ ...a, plantaName: pName })}
                            />
                        ))
                    )}
                </div>

                {/* TICKETS EVALUADOS */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Icon name="assignment_turned_in" size="sm" className="text-marca-primario" />
                            <h3 className="text-sm font-bold text-slate-800">Evaluación Detallada de Tickets</h3>
                        </div>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                            Últimos {ticketsEvaluados.length}
                        </span>
                    </div>
                    <div className="flex flex-col max-h-[600px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-5 text-center">
                                <Icon name="progress_activity" className="animate-spin text-slate-300" size="xl" />
                            </div>
                        ) : ticketsEvaluados.length === 0 ? (
                            <p className="text-sm text-slate-400 italic py-8 text-center">
                                No hay tickets resueltos en este filtro.
                            </p>
                        ) : ticketsEvaluados.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-3 md:items-center"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-extrabold text-slate-500 font-mono tracking-tighter">
                                            #{ticket.id}
                                        </span>
                                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">
                                            {ticket.titulo}
                                        </h4>
                                    </div>
                                    {ticket.descripcion && (
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {ticket.descripcion}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                                            {ticket.planta} - {ticket.area}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">
                                            {ticket.clasificacion}
                                        </span>
                                    </div>
                                </div>

                                <div className={cn(
                                    'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border',
                                    ticket.colorKpi === 'green' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                        ticket.colorKpi === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                            'bg-red-50 border-red-200 text-red-700'
                                )}>
                                    <span className="text-xs font-bold uppercase tracking-wide">KPI</span>
                                    <span className="text-lg font-black font-mono">{ticket.kpi}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {plantaDetalle && (
                <PlantaDetalle
                    planta={plantaDetalle}
                    onClose={() => setPlantaDetalle(null)}
                />
            )}

            {areaDetalle && (
                <AreaDetalle
                    area={areaDetalle}
                    plantaName={areaDetalle.plantaName}
                    onClose={() => setAreaDetalle(null)}
                />
            )}
        </>
    );
}