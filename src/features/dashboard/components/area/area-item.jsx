// src/features/dashboard/components/area/area-item.jsx
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const MiniDistribucionBar = ({ tiposTotales, total }) => {
    if (total === 0) return null;

    const tk = tiposTotales?.tickets || 0;
    const pl = tiposTotales?.planeadas || 0;
    const ex = tiposTotales?.extraordinarias || 0;

    const pTk = Math.round((tk / total) * 100);
    const pPl = Math.round((pl / total) * 100);
    const pEx = Math.round((ex / total) * 100);

    return (
        <div className="flex flex-col gap-1.5 mb-3">
            <div className="flex h-2 rounded-full overflow-hidden w-full gap-px bg-slate-100">
                {tk > 0 && <div className="bg-blue-500 transition-all" style={{ width: `${pTk}%` }} title={`Reportes: ${tk}`} />}
                {pl > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${pPl}%` }} title={`Planeadas: ${pl}`} />}
                {ex > 0 && <div className="bg-amber-500 transition-all" style={{ width: `${pEx}%` }} title={`Extraordinarias: ${ex}`} />}
            </div>

            <div className="flex flex-wrap items-center justify-start gap-3 mt-0.5">
                {tk > 0 && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        Reportes <span className="text-slate-800 ml-0.5">{tk}</span>
                    </div>
                )}
                {pl > 0 && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        Planeada <span className="text-slate-800 ml-0.5">{pl}</span>
                    </div>
                )}
                {ex > 0 && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        Extra <span className="text-slate-800 ml-0.5">{ex}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export const AreaItem = ({ area, onClick }) => {
    const { totalTareas = 0, tareasActivas = 0, tiposTotales = {}, tiempos = {} } = area;
    const sumaTipos = (tiposTotales?.tickets || 0) + (tiposTotales?.planeadas || 0) + (tiposTotales?.extraordinarias || 0);
    const totalReal = Math.max(totalTareas, sumaTipos);

    const tieneDatos = totalReal > 0;
    const { alertaTiempo } = tiempos;

    return (
        <button
            type="button"
            disabled={!tieneDatos}
            onClick={tieneDatos ? onClick : undefined}
            className={cn(
                'w-full text-left bg-white border rounded-xl p-3.5 shadow-sm transition-all duration-150 flex flex-col h-full',
                !tieneDatos
                    ? 'border-slate-100 opacity-60 grayscale cursor-not-allowed'
                    : cn(
                        'hover:shadow-md active:scale-[0.98] cursor-pointer',
                        alertaTiempo ? 'border-red-300 shadow-red-500/10' : 'border-slate-200 hover:border-marca-primario/30'
                    )
            )}
        >
            <div className="flex items-start justify-between gap-2 mb-2.5 w-full">
                <p className={cn(
                    "text-[11px] font-black uppercase tracking-wide leading-tight line-clamp-2",
                    !tieneDatos ? "text-slate-400" : "text-slate-800"
                )}>
                    {area.area}
                </p>
                {tieneDatos && <Icon name="open_in_new" size="xs" className="text-slate-300 shrink-0 mt-0.5" />}
            </div>

            <div className="flex-1 w-full flex flex-col justify-center">
                {tieneDatos ? (
                    <MiniDistribucionBar tiposTotales={tiposTotales} total={totalReal} />
                ) : (
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-300 uppercase tracking-wider mb-3">
                        <Icon name="lock" size="xs" className="scale-75 opacity-50" />
                        Sin métricas
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-100 w-full mt-auto">
                <div className="flex flex-col py-1">
                    <span className={cn("text-base font-black leading-none", tieneDatos ? "text-slate-800" : "text-slate-200")}>
                        {tieneDatos ? totalReal : '—'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Total</span>
                </div>
                <div className="flex flex-col py-1">
                    <span className={cn(
                        'text-base font-black leading-none',
                        !tieneDatos
                            ? 'text-slate-200'
                            : (tareasActivas > 0 ? 'text-amber-600' : 'text-slate-800')
                    )}>
                        {tieneDatos ? tareasActivas : '—'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Activas</span>
                </div>
            </div>
        </button>
    );
};