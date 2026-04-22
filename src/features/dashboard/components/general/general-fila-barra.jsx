// src/features/dashboard/components/general/general-fila-barra.jsx
import { cn } from '@/utils/cn';

export const GeneralFilaBarra = ({ etiqueta, cantidad, porcentaje, colorBarra = 'bg-marca-primario', isMobile = false }) => {
    // 🚨 REGLA: Si la cantidad es 0 o nula, no se renderiza la barra vacía.
    if (!cantidad || cantidad === 0) return null;

    if (isMobile) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-600 w-24 truncate shrink-0">{etiqueta}</span>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex-1">
                    <div className={cn('h-full rounded-full transition-all', colorBarra)} style={{ width: `${Math.min(porcentaje, 100)}%` }} />
                </div>
                <span className="text-[10px] font-black text-slate-700 tabular-nums w-6 text-right">{cantidad}</span>
                <span className="text-[9px] text-slate-400 w-6 text-right">{porcentaje}%</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold text-slate-600 w-28 truncate shrink-0">{etiqueta}</span>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex-1">
                <div className={cn('h-full rounded-full transition-all', colorBarra)} style={{ width: `${Math.min(porcentaje, 100)}%` }} />
            </div>
            <span className="text-[11px] font-black text-slate-700 tabular-nums w-8 text-right">{cantidad}</span>
            <span className="text-[10px] text-slate-400 w-8 text-right">{porcentaje}%</span>
        </div>
    );
};