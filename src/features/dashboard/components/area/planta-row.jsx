// src/features/dashboard/components/area/planta-row.jsx
import { useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import { AreaItem } from './area-item';
import { cn } from '@/utils/cn';

export const PlantaRow = ({ planta, onOpenPlanta, onOpenArea, isMobile = false }) => {
    const [expanded, setExpanded] = useState(false);

    const {
        totalTareas = 0,
        tareasActivas = 0,
        areas = [],
        tiempos = {},
    } = planta;

    return (
        <div className={cn(
            'bg-white border rounded-2xl overflow-hidden shadow-sm transition-all duration-200',
            expanded ? 'border-marca-primario/20 shadow-md' : 'border-slate-200'
        )}>
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
                <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    expanded ? 'bg-marca-primario text-white' : 'bg-marca-primario/10 text-marca-primario'
                )}>
                    <Icon name="factory" size="sm" />
                </div>

                <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-widest">{planta.planta}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {areas.length} área{areas.length !== 1 ? 's' : ''} · {totalTareas} tareas totales
                    </p>
                </div>

                <div className={cn('flex items-center gap-2 flex-wrap', isMobile ? 'hidden sm:flex' : 'flex')}>
                    {tareasActivas > 0 && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                            {tareasActivas} activas
                        </span>
                    )}
                    {planta.tiposTotales?.tickets > 0 && (
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                            {planta.tiposTotales.tickets} REPORTES
                        </span>
                    )}
                    {tiempos.alertaTiempo ? (
                        <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                            Tiempo Excedido
                        </span>
                    ) : tiempos.tiempoEstimadoTotal > 0 ? (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                            Tiempo OK
                        </span>
                    ) : null}
                </div>

                <Icon name="expand_more" size="sm" className={cn('text-slate-400 transition-transform duration-200 shrink-0', expanded && 'rotate-180')} />
            </button>

            {isMobile && (
                <div className="sm:hidden flex items-center gap-2 px-5 pb-3 flex-wrap">
                    {tareasActivas > 0 && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                            {tareasActivas} activas
                        </span>
                    )}
                    {planta.tiposTotales?.tickets > 0 && (
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                            {planta.tiposTotales.tickets} TK
                        </span>
                    )}
                    {tiempos.alertaTiempo && (
                        <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                            Tiempo Excedido
                        </span>
                    )}
                </div>
            )}

            {expanded && (
                <div className="border-t border-slate-100 bg-slate-50/40 p-4">
                    {areas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl my-2">
                            <Icon name="domain_disabled" size="md" className="text-slate-300 mb-2" />
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sin áreas registradas</span>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">No hay actividad en ninguna área de esta planta.</p>
                        </div>
                    ) : (
                        <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')}>
                            {areas.map((area, idx) => (
                                <AreaItem
                                    key={idx}
                                    area={area}
                                    plantaName={planta.planta}
                                    onClick={() => onOpenArea(area, planta.planta)}
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end mt-3 pt-3 border-t border-slate-200/70">
                        <button
                            type="button"
                            onClick={() => onOpenPlanta(planta)}
                            className="flex items-center gap-1.5 text-xs font-bold text-marca-primario hover:bg-marca-primario/5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                            <Icon name="analytics" size="xs" />
                            Ver resumen de planta
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};