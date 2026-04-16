// src/features/dashboard/views/dashboard-general-mobile.jsx
import React from 'react';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { KpiCard } from '../components/general/general-kpi-card';
import { PRIORIDAD_COLOR } from '../constants';
import { cn } from '@/utils/cn';

export default function DashboardGeneralMobile({ loading, resumen, distribuciones, backlog, topCategorias, colorEficiencia }) {
    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-8">
            <div className="flex items-center justify-between bg-slate-800 rounded-2xl p-4 shadow-sm text-white">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generadas</span>
                    <span className="text-2xl font-black font-mono leading-none mt-1">{resumen?.totalGeneradas ?? 0}</span>
                </div>
                <div className="w-px h-8 bg-slate-700 mx-2" />
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Terminadas</span>
                    <span className="text-2xl font-black font-mono leading-none text-emerald-400 mt-1">{resumen?.totalTerminadas ?? 0}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <KpiCard icon="speed" label="KPI Global" value={resumen?.kpiGlobal} color={resumen?.kpiColor} loading={loading} />
                <KpiCard icon="thumb_up" label="Aceptación" value={resumen?.tasaAceptacion} color={resumen?.tasaAceptacionColor} loading={loading} />
                <KpiCard icon="timer" label="SLA (A tiempo)" value={resumen?.slaRate} color={resumen?.slaColor} loading={loading} />
                <KpiCard icon="difference" label="Efic. Estim." value={resumen?.eficienciaEstimacionGlobal ?? 'N/A'} suffix={resumen?.eficienciaEstimacionGlobal ? '%' : ''} color={colorEficiencia} loading={loading} />
            </div>

            <div className="flex flex-col gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                        <Icon name="assignment" size="sm" className="text-marca-primario" />
                        <h3 className="text-xs font-bold text-slate-800">Carga Viva (Backlog)</h3>
                        <span className="ml-auto text-lg font-black font-mono text-slate-800">{backlog.totalActivo}</span>
                    </div>
                    {loading ? <Skeleton className="h-16 rounded-xl" /> : (
                        <div className="flex flex-col gap-2">
                            {Object.entries(backlog.desglose).map(([estado, cantidad]) => {
                                if (cantidad === 0) return null;
                                const pct = Math.round((cantidad / backlog.totalActivo) * 100);
                                return (
                                    <div key={estado} className="flex flex-col gap-1 text-[10px]">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-slate-600">{estado}</span>
                                            <span className="font-mono font-bold">{cantidad}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-marca-primario rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                        <Icon name="flag" size="sm" className="text-orange-600" />
                        <h3 className="text-xs font-bold text-slate-800">Prioridades</h3>
                    </div>
                    {loading ? <Skeleton className="h-16 rounded-xl" /> : (
                        <div className="grid grid-cols-2 gap-2">
                            {distribuciones.prioridades && Object.entries(distribuciones.prioridades).map(([prioridad, cantidad]) => {
                                const c = PRIORIDAD_COLOR[prioridad] || PRIORIDAD_COLOR.BAJA;
                                return (
                                    <div key={prioridad} className="flex flex-col p-2 rounded-xl border border-slate-100 bg-slate-50 relative overflow-hidden">
                                        <div className={cn("absolute left-0 top-0 bottom-0 w-1", c.bg)} />
                                        <span className={cn('text-[10px] font-bold uppercase pl-1', c.text)}>{prioridad}</span>
                                        <span className="text-lg font-black font-mono text-slate-800 pl-1">{cantidad}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                        <Icon name="donut_large" size="sm" className="text-emerald-600" />
                        <h3 className="text-xs font-bold text-slate-800">Top 5 Categorías</h3>
                    </div>
                    {loading ? <Skeleton className="h-24 rounded-xl" /> : (
                        <div className="divide-y divide-slate-100">
                            {topCategorias.map(([cat, cant]) => (
                                <div key={cat} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                                    <span className="text-xs font-bold text-slate-700 truncate mr-2">{cat}</span>
                                    <span className="text-[10px] font-black font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 shrink-0">{cant}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}