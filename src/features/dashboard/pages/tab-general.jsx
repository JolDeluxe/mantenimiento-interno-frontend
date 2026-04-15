import React from 'react';
import { useDashboardContext } from '../context/dashboard-context';
import { SummaryBar } from '@/components/ui/summary-bar';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

// Mapa de clasificación a color visual
const CLASIFICACION_COLOR = {
    PREVENTIVO: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
    CORRECTIVO: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
    INSPECCION: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
    MEJORA: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    INFRAESTRUCTURA: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
    RUTINA: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' },
};

const mapearColor = (colorBackend) => {
    if (colorBackend === 'green') return 'esmeralda';
    if (colorBackend === 'amber') return 'ambar';
    if (colorBackend === 'red') return 'rojo';
    return 'por_defecto';
};

export default function TabGeneral() {
    const { data, loading } = useDashboardContext();
    const resumen = data?.resumen;
    const clasificacion = data?.distribucionClasificacion ?? {};

    const summaryItems = [
        {
            id: 'kpi',
            label: 'KPI Global',
            value: loading ? '...' : `${resumen?.kpiGlobal ?? 0}%`,
            color: mapearColor(resumen?.kpiColor),
        },
        {
            id: 'ftf',
            label: 'First-Time Fix',
            value: loading ? '...' : `${resumen?.firstTimeFixRate ?? 0}%`,
            color: mapearColor(resumen?.firstTimeFixColor),
        },
        {
            id: 'sla',
            label: 'SLA',
            value: loading ? '...' : `${resumen?.slaRate ?? 0}%`,
            color: mapearColor(resumen?.slaColor),
        },
        {
            id: 'total',
            label: 'Terminadas',
            value: loading ? '...' : (resumen?.totalTerminadas ?? 0),
            color: 'por_defecto',
        },
    ];

    const totalClasificacion = Object.values(clasificacion).reduce((s, v) => s + v, 0);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <SummaryBar items={summaryItems} activeId={null} loading={loading} />

            {/* Distribución por clasificación */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Icon name="donut_small" size="sm" className="text-marca-primario" />
                    <h3 className="text-sm font-bold text-slate-800">Distribución por Clasificación</h3>
                    <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                        {totalClasificacion} tareas
                    </span>
                </div>

                <div className="px-5 py-4">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 rounded-xl" />
                            ))}
                        </div>
                    ) : Object.keys(clasificacion).length === 0 ? (
                        <p className="text-sm text-slate-400 italic py-4 text-center">
                            No hay datos de clasificación en este período.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(clasificacion)
                                .sort((a, b) => b[1] - a[1])
                                .map(([clas, count]) => {
                                    const c = CLASIFICACION_COLOR[clas] || CLASIFICACION_COLOR.RUTINA;
                                    const pct = totalClasificacion > 0 ? Math.round((count / totalClasificacion) * 100) : 0;
                                    return (
                                        <div
                                            key={clas}
                                            className={cn(
                                                'flex flex-col gap-2 p-3 rounded-xl border',
                                                c.bg, c.border
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={cn('w-2 h-2 rounded-full shrink-0', c.dot)} />
                                                <span className={cn('text-[11px] font-bold uppercase tracking-wider truncate', c.text)}>
                                                    {clas}
                                                </span>
                                            </div>
                                            <div className="flex items-end justify-between gap-2">
                                                <span className={cn('text-2xl font-extrabold font-mono leading-none', c.text)}>
                                                    {count}
                                                </span>
                                                <span className={cn('text-xs font-bold', c.text, 'opacity-60')}>
                                                    {pct}%
                                                </span>
                                            </div>
                                            <div className="h-1 bg-black/5 rounded-full overflow-hidden">
                                                <div
                                                    className={cn('h-full rounded-full', c.dot)}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>

            {/* Sección de clasificación futura — estructura reservada */}
            {!loading && Object.keys(clasificacion).length === 0 && (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center">
                    <Icon name="construction" size="xl" className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">Próximamente</p>
                    <p className="text-xs text-slate-400 mt-1">
                        La distribución completa por clasificación estará disponible cuando se registren tareas en el período seleccionado.
                    </p>
                </div>
            )}
        </div>
    );
}