import React from 'react';
import { useDashboardContext } from '../context/dashboard-context';
import { SummaryBar } from '@/components/ui/summary-bar';
import { Icon, Skeleton } from '@/components/ui/z_index';

export default function TabGeneral() {
    const { data, loading } = useDashboardContext();
    const resumen = data?.resumen;
    const clasificacion = data?.distribucionClasificacion ?? {};

    // Diccionario para adaptar colores del backend a las variantes del SummaryBar
    const mapearColor = (colorBackend) => {
        if (colorBackend === 'green') return 'esmeralda';
        if (colorBackend === 'amber') return 'ambar';
        if (colorBackend === 'red') return 'rojo';
        return 'por_defecto';
    };

    // Construcción dinámica de los items del SummaryBar
    const summaryItems = [
        {
            id: 'kpi',
            label: 'KPI Global',
            value: loading ? '...' : `${resumen?.kpiGlobal ?? 0}%`,
            color: mapearColor(resumen?.kpiColor)
        },
        {
            id: 'ftf',
            label: 'First-Time Fix',
            value: loading ? '...' : `${resumen?.firstTimeFixRate ?? 0}%`,
            color: mapearColor(resumen?.firstTimeFixColor)
        },
        {
            id: 'sla',
            label: 'SLA (A tiempo)',
            value: loading ? '...' : `${resumen?.slaRate ?? 0}%`,
            color: mapearColor(resumen?.slaColor)
        },
        {
            id: 'total',
            label: 'Terminadas',
            value: loading ? '...' : (resumen?.totalTerminadas ?? 0),
            color: 'por_defecto'
        }
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">

            {/* Se reemplaza KpiCard por SummaryBar */}
            <SummaryBar
                items={summaryItems}
                activeId={null} // Pasamos null porque es puramente de lectura (no seleccionable)
                loading={loading}
            />

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Icon name="donut_small" size="sm" className="text-marca-primario" />
                    <h3 className="text-sm font-bold text-slate-800">Distribución por Clasificación</h3>
                </div>
                <div className="px-5 py-4 flex flex-wrap gap-3">
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-28 rounded-full" />)
                        : Object.keys(clasificacion).length === 0
                            ? <p className="text-sm text-slate-400 italic">No hay datos de clasificación en este periodo.</p>
                            : Object.entries(clasificacion).map(([clas, count]) => (
                                <div key={clas} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{clas}</span>
                                    <span className="text-xs font-extrabold text-marca-primario font-mono">{count}</span>
                                </div>
                            ))
                    }
                </div>
            </div>
        </div>
    );
}