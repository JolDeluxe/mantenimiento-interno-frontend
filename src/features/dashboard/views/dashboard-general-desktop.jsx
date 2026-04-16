// src/features/dashboard/views/dashboard-general-desktop.jsx
import React from 'react';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { KpiCard } from '../components/general/general-kpi-card';
import { PRIORIDAD_COLOR } from '../constants';
import { cn } from '@/utils/cn';

export default function DashboardGeneralDesktop({ loading, resumen, distribuciones, backlog, topCategorias, colorEficiencia }) {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header Desktop */}
            <div className="flex items-center justify-between bg-slate-800 rounded-2xl p-5 shadow-sm text-white">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Volumen del Período</span>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-3xl font-black font-mono leading-none">{resumen?.totalGeneradas ?? 0} <span className="text-sm font-medium text-slate-400">Generadas</span></span>
                    </div>
                </div>
                <div className="w-px h-10 bg-slate-700 mx-6" />
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Terminadas</span>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-3xl font-black font-mono leading-none text-emerald-400">{resumen?.totalTerminadas ?? 0}</span>
                    </div>
                </div>
            </div>

            {/* Grilla 5 Columnas Desktop */}
            <div className="grid grid-cols-5 gap-4">
                <KpiCard icon="speed" label="KPI Global" value={resumen?.kpiGlobal} color={resumen?.kpiColor} loading={loading} footnote="Score Bayesiano General" />
                <KpiCard icon="thumb_up" label="Tasa Aceptación" value={resumen?.tasaAceptacion} color={resumen?.tasaAceptacionColor} loading={loading} footnote="Aprobado s/Rechazo" />
                <KpiCard icon="timer" label="SLA (A tiempo)" value={resumen?.slaRate} color={resumen?.slaColor} loading={loading} footnote="Vs Fecha Vencimiento" />
                <KpiCard icon="hourglass_bottom" label="Tiempo Real" value={resumen?.tiempoPromedioCierreMins} suffix="m" color="neutral" loading={loading} footnote="Promedio por ticket" />
                <KpiCard icon="difference" label="Efic. Estimación" value={resumen?.eficienciaEstimacionGlobal ?? 'N/A'} suffix={resumen?.eficienciaEstimacionGlobal ? '%' : ''} color={colorEficiencia} loading={loading} footnote="Consumo vs Planeado" />
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Backlog y Prioridades */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <Icon name="assignment" size="sm" className="text-marca-primario" />
                            <h3 className="text-sm font-bold text-slate-800">Carga Viva (Backlog)</h3>
                            <span className="ml-auto text-xl font-black font-mono text-slate-800">{backlog.totalActivo}</span>
                        </div>
                        {loading ? <Skeleton className="h-20 rounded-xl" /> : (
                            <div className="flex flex-col gap-3">
                                {Object.entries(backlog.desglose).map(([estado, cantidad]) => {
                                    if (cantidad === 0) return null;
                                    const pct = Math.round((cantidad / backlog.totalActivo) * 100);
                                    return (
                                        <div key={estado} className="flex items-center gap-3 text-xs">
                                            <span className="w-24 font-bold text-slate-600 truncate">{estado}</span>
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-marca-primario rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="w-8 text-right font-mono font-bold text-slate-700">{cantidad}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <Icon name="flag" size="sm" className="text-orange-600" />
                            <h3 className="text-sm font-bold text-slate-800">Prioridades</h3>
                        </div>
                        {loading ? <Skeleton className="h-20 rounded-xl" /> : (
                            <div className="grid grid-cols-2 gap-2">
                                {distribuciones.prioridades && Object.entries(distribuciones.prioridades).map(([prioridad, cantidad]) => {
                                    const c = PRIORIDAD_COLOR[prioridad] || PRIORIDAD_COLOR.BAJA;
                                    return (
                                        <div key={prioridad} className="flex flex-col p-3 rounded-xl border border-slate-100 bg-slate-50 relative overflow-hidden">
                                            <div className={cn("absolute left-0 top-0 bottom-0 w-1", c.bg)} />
                                            <span className={cn('text-[10px] font-bold uppercase pl-1', c.text)}>{prioridad}</span>
                                            <span className="text-xl font-black font-mono text-slate-800 pl-1">{cantidad}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Clasificaciones y Top */}
                <div className="col-span-2 flex flex-col gap-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <Icon name="category" size="sm" className="text-blue-600" />
                            <h3 className="text-sm font-bold text-slate-800">Distribución por Clasificación</h3>
                        </div>
                        {loading ? <Skeleton className="h-32 rounded-xl" /> : (
                            <div className="flex flex-wrap gap-3">
                                {distribuciones.clasificaciones && Object.entries(distribuciones.clasificaciones).map(([clas, cant]) => (
                                    <div key={clas} className="flex items-center justify-between gap-3 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2 min-w-[140px] flex-1">
                                        <span className="text-xs font-bold text-blue-800 uppercase">{clas}</span>
                                        <span className="text-xl font-black font-mono text-blue-900">{cant}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex-1">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <Icon name="donut_large" size="sm" className="text-emerald-600" />
                            <h3 className="text-sm font-bold text-slate-800">Top 5 Categorías</h3>
                        </div>
                        {loading ? <Skeleton className="h-32 rounded-xl" /> : (
                            <div className="divide-y divide-slate-100">
                                {topCategorias.map(([cat, cant]) => (
                                    <div key={cat} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                        <span className="text-sm font-bold text-slate-700">{cat}</span>
                                        <span className="text-sm font-black font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">{cant} inc.</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}