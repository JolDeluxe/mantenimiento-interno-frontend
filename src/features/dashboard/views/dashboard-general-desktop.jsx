import React from 'react';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { KpiCard } from '../components/general/general-kpi-card';
import { PRIORIDAD_COLOR } from '../constants';
import { cn } from '@/utils/cn';

export default function DashboardGeneralDesktop({ loading, resumen, distribuciones, backlog, topCategorias, colorEficiencia }) {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-10">

            {/* ── Fila 1: Resumen Principal y KPIs ── */}
            <div className="grid grid-cols-1 xl:grid-cols-6 gap-4">

                {/* Generadas y Terminadas (Bloque Oscuro) */}
                <div className="xl:col-span-2 flex items-center justify-between bg-slate-800 rounded-2xl p-6 shadow-sm text-white">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generadas</span>
                        <span className="text-5xl font-black font-mono leading-none mt-2">{resumen?.totalGeneradas ?? 0}</span>
                    </div>
                    <div className="w-px h-16 bg-slate-700 mx-4" />
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Terminadas</span>
                        <span className="text-5xl font-black font-mono leading-none text-emerald-400 mt-2">{resumen?.totalTerminadas ?? 0}</span>
                    </div>
                </div>

                {/* 4 KPIs de Rendimiento */}
                <div className="xl:col-span-4 grid grid-cols-4 gap-4">
                    <KpiCard icon="speed" label="KPI Global" value={resumen?.kpiGlobal} color={resumen?.kpiColor} loading={loading} />
                    <KpiCard icon="thumb_up" label="Aceptación" value={resumen?.tasaAceptacion} color={resumen?.tasaAceptacionColor} loading={loading} />
                    <KpiCard icon="timer" label="SLA (A tiempo)" value={resumen?.slaRate} color={resumen?.slaColor} loading={loading} />
                    <KpiCard icon="difference" label="Efic. Estim." value={resumen?.eficienciaEstimacionGlobal ?? 'N/A'} suffix={resumen?.eficienciaEstimacionGlobal ? '%' : ''} color={colorEficiencia} loading={loading} />
                </div>
            </div>

            {/* ── Fila 2: Detalles (Backlog, Prioridades, Categorías) ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Backlog */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                        <Icon name="assignment" size="sm" className="text-marca-primario" />
                        <h3 className="text-sm font-bold text-slate-800">Carga Viva (Backlog)</h3>
                        <span className="ml-auto text-2xl font-black font-mono text-slate-800 leading-none">{backlog?.totalActivo ?? 0}</span>
                    </div>
                    {loading ? <Skeleton className="h-32 rounded-xl" /> : (
                        <div className="flex flex-col gap-4 flex-1 justify-center">
                            {backlog?.desglose && Object.entries(backlog.desglose).map(([estado, cantidad]) => {
                                if (cantidad === 0) return null;
                                const pct = Math.round((cantidad / backlog.totalActivo) * 100);
                                return (
                                    <div key={estado} className="flex flex-col gap-1.5 text-xs">
                                        <div className="flex justify-between items-end">
                                            <span className="font-bold text-slate-600">{estado}</span>
                                            <span className="font-mono font-black text-slate-800 text-sm leading-none">{cantidad}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-marca-primario rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Prioridades */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                        <Icon name="flag" size="sm" className="text-orange-600" />
                        <h3 className="text-sm font-bold text-slate-800">Prioridades Terminadas</h3>
                    </div>
                    {loading ? <Skeleton className="h-32 rounded-xl" /> : (
                        <div className="grid grid-cols-2 gap-3 flex-1 content-start">
                            {distribuciones?.prioridades && Object.entries(distribuciones.prioridades).map(([prioridad, cantidad]) => {
                                const c = PRIORIDAD_COLOR[prioridad] || PRIORIDAD_COLOR.BAJA;
                                return (
                                    <div key={prioridad} className="flex flex-col p-4 rounded-xl border border-slate-100 bg-slate-50 relative overflow-hidden">
                                        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", c.bg)} />
                                        <span className={cn('text-[10px] font-bold uppercase pl-2', c.text)}>{prioridad}</span>
                                        <span className="text-3xl font-black font-mono text-slate-800 pl-2 leading-none mt-1.5">{cantidad}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Top Categorías */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                        <Icon name="donut_large" size="sm" className="text-emerald-600" />
                        <h3 className="text-sm font-bold text-slate-800">Top 5 Categorías</h3>
                    </div>
                    {loading ? <Skeleton className="h-32 rounded-xl" /> : (
                        <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-center">
                            {topCategorias?.length > 0 ? topCategorias.map(([cat, cant]) => (
                                <div key={cat} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-slate-50 transition-colors rounded-lg px-2 -mx-2">
                                    <span className="text-sm font-bold text-slate-700 truncate mr-2">{cat}</span>
                                    <span className="text-[11px] font-black font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 shrink-0">
                                        {cant}
                                    </span>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                    <Icon name="search_off" size="md" className="opacity-50" />
                                    <span className="text-xs italic">Sin categorías registradas</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}