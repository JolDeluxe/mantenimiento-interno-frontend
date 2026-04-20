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
                {tk > 0 && <div className="bg-blue-500 transition-all" style={{ width: `${pTk}%` }} title={`Tickets: ${tk}`} />}
                {pl > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${pPl}%` }} title={`Planeadas: ${pl}`} />}
                {ex > 0 && <div className="bg-amber-500 transition-all" style={{ width: `${pEx}%` }} title={`Extraordinarias: ${ex}`} />}
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                <span className={cn(tk > 0 ? 'text-blue-600' : 'text-slate-300')}>Reportes: {tk}</span>
                <span className={cn(pl > 0 ? 'text-emerald-600' : 'text-slate-300')}>Planeadas: {pl}</span>
                <span className={cn(ex > 0 ? 'text-amber-600' : 'text-slate-300')}>Extraordinarias: {ex}</span>
            </div>
        </div>
    );
};

export const AreaItem = ({ area, plantaName, onClick }) => {
    const {
        totalTareas = 0,
        tareasActivas = 0,
        tiposTotales = {},
        tiempos = {},
    } = area;

    const { alertaTiempo } = tiempos;

    const borderColor = alertaTiempo
        ? 'border-red-300 hover:border-red-400 shadow-red-500/10'
        : 'border-slate-200 hover:border-marca-primario/30';

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'w-full text-left bg-white border rounded-xl p-3.5 shadow-sm transition-all duration-150',
                'hover:shadow-md active:scale-[0.98] cursor-pointer',
                borderColor
            )}
        >
            <div className="flex items-start justify-between gap-2 mb-2.5">
                <p className="text-[11px] font-black text-slate-800 uppercase tracking-wide leading-tight line-clamp-2">
                    {area.area}
                </p>
                <Icon name="open_in_new" size="xs" className="text-slate-300 shrink-0 mt-0.5" />
            </div>

            <MiniDistribucionBar tiposTotales={tiposTotales} total={totalTareas} />

            <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-100">
                <div className="flex flex-col bg-slate-50 rounded-lg py-1.5">
                    <span className="text-base font-black text-slate-800 leading-none">{totalTareas}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Total</span>
                </div>
                <div className="flex flex-col bg-slate-50 rounded-lg py-1.5">
                    <span className={cn(
                        'text-base font-black leading-none',
                        tareasActivas > 0 ? 'text-amber-600' : 'text-slate-800'
                    )}>
                        {tareasActivas}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Activas</span>
                </div>
            </div>
        </button>
    );
};