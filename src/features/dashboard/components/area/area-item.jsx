import React from 'react';
import { Icon, Tooltip } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

export const formatMins = (m) => {
    if (!m || m === 0) return '0 min';
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
};

export const formatKey = (str) => {
    if (!str) return 'No Definido';
    return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const getDesviacionColor = (real, planeado) => {
    if (real === 0 && planeado === 0) return 'text-slate-400';
    if (planeado === 0 && real > 0) return 'text-red-600';

    const pct = ((real - planeado) / planeado) * 100;

    if (pct >= 30) return 'text-red-600';
    if (pct > 5) return 'text-amber-500';
    return 'text-emerald-600';
};

export const AreaItem = ({ area, onOpenArea, plantaName, isMobile = false }) => {
    const real = Number(area?.tiemposCerradas?.tiempoRealTotal) || 0;
    const planeado = Number(area?.tiemposCerradas?.tiempoEstimadoTotal) || 0;
    const cerradas = Number(area?.tiemposCerradas?.cantidad) || 0;
    const totalTareas = Number(area?.totalTareas) || 0;

    const hasData = cerradas > 0;
    const colorReal = getDesviacionColor(real, planeado);

    if (isMobile) {
        return (
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 active:scale-95 transition-transform">
                <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-700">{area.area}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{totalTareas} tareas totales</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Tiempo Planeado</span>
                        <span className="text-[9px] font-bold font-mono text-slate-500">{hasData ? formatMins(planeado) : 'S/D'}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Tiempo Total Área</span>
                        <span className={cn('text-[11px] font-black font-mono', hasData ? colorReal : 'text-slate-400')}>
                            {hasData ? formatMins(real) : 'S/D'}
                        </span>
                    </div>
                    <button onClick={() => onOpenArea(area, plantaName)} className="p-1 cursor-pointer">
                        <Icon name="open_in_new" size="xs" className="text-marca-primario" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group flex flex-row items-center justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-sm gap-4 hover:border-slate-300 hover:shadow-md transition-all cursor-default">
            <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-700 truncate">{area.area}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{totalTareas} tareas totales</span>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end border-r border-slate-100 pr-4">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Tiempo Planeado</span>
                        <span className="text-[10px] font-bold font-mono text-slate-500">{hasData ? formatMins(planeado) : 'S/D'}</span>
                    </div>
                    <div className="flex flex-col items-end w-24">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Tiempo Total Área</span>
                        <span className={cn('text-[13px] font-black font-mono leading-none mt-0.5', hasData ? colorReal : 'text-slate-400')}>
                            {hasData ? formatMins(real) : 'S/D'}
                        </span>
                    </div>
                </div>

                <Tooltip text="Ver reporte del área" variant="dark">
                    <button
                        type="button"
                        onClick={() => onOpenArea(area, plantaName)}
                        className="p-1.5 hover:bg-slate-100 rounded-full transition-colors flex shrink-0 border border-slate-100 cursor-pointer"
                    >
                        <Icon name="analytics" size="xs" className="text-slate-400 group-hover:text-marca-primario" />
                    </button>
                </Tooltip>
            </div>
        </div>
    );
};