import React, { useState } from 'react';
import { Icon, Tooltip } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { AreaItem, formatMins, getDesviacionColor } from './area-item';

export const PlantaRow = ({ planta, onOpenPlanta, onOpenArea, isMobile = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    const real = Number(planta?.tiemposCerradas?.tiempoRealTotal) || 0;
    const planeado = Number(planta?.tiemposCerradas?.tiempoEstimadoTotal) || 0;
    const cerradas = Number(planta?.tiemposCerradas?.cantidad) || 0;
    const totalTareas = Number(planta?.totalTareas) || 0;
    const tareasActivas = Number(planta?.backlogActivo) || 0;

    const hasData = cerradas > 0;
    const colorReal = getDesviacionColor(real, planeado);

    if (isMobile) {
        return (
            <div className="flex flex-col border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                <div
                    className="p-4 flex items-center justify-between active:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-marca-primario/10 flex items-center justify-center shrink-0">
                            <Icon name="domain" size="sm" className="text-marca-primario" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">{planta.planta}</span>
                            <span className="text-[10px] font-semibold text-slate-500">{totalTareas} tareas totales</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Tiempo Planeado</span>
                            <span className="text-[9px] font-bold font-mono text-slate-500">{hasData ? formatMins(planeado) : 'S/D'}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-slate-400 uppercase">Tiempo Total Planta</span>
                            <span className={cn('text-[11px] font-black font-mono', hasData ? colorReal : 'text-slate-400')}>
                                {hasData ? formatMins(real) : 'S/D'}
                            </span>
                        </div>
                        <Icon name={isOpen ? "expand_less" : "expand_more"} size="sm" className="text-slate-400 ml-1" />
                    </div>
                </div>
                {isOpen && (
                    <div className="px-4 pb-4 flex flex-col gap-2 border-t border-slate-50 pt-3 bg-slate-50/30 animate-in slide-in-from-top-2 duration-300">
                        {(planta.areas || []).map((a, i) => (
                            <AreaItem
                                key={i}
                                area={a}
                                onOpenArea={onOpenArea}
                                plantaName={planta.planta}
                                isMobile
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div
                className="flex flex-row items-center gap-4 p-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-marca-primario/5 border border-marca-primario/10 flex items-center justify-center shrink-0">
                        <Icon name="location_city" className="text-marca-primario" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 tracking-tight">{planta.planta}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                                {planta.areas?.length || 0} Áreas
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">{totalTareas} Tareas Totales</span>
                            {tareasActivas > 0 && (
                                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md">
                                    {tareasActivas} Activas
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-6 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end gap-0.5 border-r border-slate-200 pr-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-shadow-sm">Tiempo Planeado</span>
                            <span className="text-sm font-bold font-mono text-slate-500">
                                {hasData ? formatMins(planeado) : 'S/D'}
                            </span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 w-32">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-shadow-sm">Tiempo Total Planta</span>
                            <span className={cn('text-lg font-black font-mono leading-none mt-0.5', hasData ? colorReal : 'text-slate-400')}>
                                {hasData ? formatMins(real) : 'S/D'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
                        <Tooltip text="Ver reporte de planta" variant="dark">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onOpenPlanta(planta); }}
                                className="p-2.5 hover:bg-marca-primario text-slate-400 hover:text-white border border-slate-200 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                            >
                                <Icon name="query_stats" size="sm" />
                                <span className="text-xs font-bold hidden md:inline">Ver Planta</span>
                            </button>
                        </Tooltip>
                        <div className={cn("p-1 rounded-full transition-transform duration-300", isOpen && "rotate-180")}>
                            <Icon name="expand_more" className="text-slate-300" />
                        </div>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-5 pt-2 bg-slate-50/50 border-t border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                    {(planta.areas || []).map((a, i) => (
                        <AreaItem
                            key={i}
                            area={a}
                            onOpenArea={onOpenArea}
                            plantaName={planta.planta}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};