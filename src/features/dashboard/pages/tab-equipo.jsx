import React from 'react';
import { useDashboardContext } from '../context/dashboard-context';
import { TecnicoKpiRow } from '../components/tecnico-kpi-row';
import { Icon, Skeleton } from '@/components/ui/z_index';

export default function TabEquipo() {
    // Consumimos el contexto seguro
    const { data, loading } = useDashboardContext();
    const tecnicos = data?.kpiPorTecnico ?? [];

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Icon name="engineering" size="sm" className="text-marca-primario" />
                <h3 className="text-sm font-bold text-slate-800">Rendimiento por Técnico / Coordinador</h3>
            </div>
            <div className="px-5 py-2">
                {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-100">
                            <Skeleton className="w-9 h-9 rounded-full" />
                            <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-32 rounded-md" /><Skeleton className="h-2 w-full rounded-md" /></div>
                        </div>
                    ))
                    : tecnicos.length === 0
                        ? <p className="text-sm text-slate-400 italic py-8 text-center">Sin datos de equipo en este período.</p>
                        : tecnicos.map((t) => <TecnicoKpiRow key={t.id} tecnico={t} />)
                }
            </div>
        </div>
    );
}