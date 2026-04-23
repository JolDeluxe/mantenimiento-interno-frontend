import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

export const PrincipalTiempos = ({ tiempos }) => {
    if (!tiempos) return null;

    const horasReales = Math.floor(tiempos.realMins / 60);
    const horasEst = Math.floor(tiempos.estimadoMins / 60);
    const pct = Math.min(tiempos.consumoPct || 0, 100);

    const isOver = tiempos.consumoPct > 100;

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight flex items-center gap-2 mb-4">
                <Icon name="schedule" size="sm" className="text-blue-500" />
                Rendimiento de Tiempo
            </h3>

            <div className="flex items-end justify-between mb-2">
                <div>
                    <span className="text-3xl font-black font-mono text-slate-800 tracking-tighter">
                        {horasReales}<span className="text-sm text-slate-400">h</span>
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invertidas</p>
                </div>
                <div className="text-right">
                    <span className="text-lg font-bold font-mono text-slate-600">
                        {horasEst}<span className="text-xs">h</span>
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Planeadas</p>
                </div>
            </div>

            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-3">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", isOver ? "bg-red-500" : "bg-blue-500")}
                    style={{ width: `${pct}%` }}
                />
            </div>

            {isOver && (
                <p className="text-[10px] font-bold text-red-500 mt-2 flex items-center gap-1 uppercase tracking-tight">
                    <Icon name="warning" size="xs" /> Tiempo estimado excedido
                </p>
            )}
        </div>
    );
};