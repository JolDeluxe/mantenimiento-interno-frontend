import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const COLOR_BAR = { green: 'bg-emerald-500', amber: 'bg-amber-400', red: 'bg-red-500' };

export const TecnicoKpiRow = ({ tecnico }) => {
    const barColor = COLOR_BAR[tecnico.color] || 'bg-slate-400';
    const mins = tecnico.minutosReales;
    const tiempoStr = mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;

    return (
        <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
            {tecnico.imagen ? (
                <img
                    src={tecnico.imagen}
                    alt={tecnico.nombre}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                    onError={(e) => { e.target.src = '/img/perfil-no-foto.webp'; }}
                />
            ) : (
                <div className="w-9 h-9 rounded-full bg-marca-primario/10 flex items-center justify-center text-sm font-black text-marca-primario shrink-0">
                    {tecnico.nombre?.charAt(0).toUpperCase()}
                </div>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-800 truncate">{tecnico.nombre}</span>
                    <span className={cn('text-xs font-extrabold font-mono shrink-0',
                        tecnico.color === 'green' ? 'text-emerald-600' :
                            tecnico.color === 'amber' ? 'text-amber-600' : 'text-red-600'
                    )}>
                        {tecnico.kpiPromedio}%
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={cn('h-full rounded-full transition-all duration-500', barColor)}
                            style={{ width: `${tecnico.kpiPromedio}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                        {tecnico.tareasCompletadas} tareas · {tiempoStr}
                    </span>
                </div>
                {!tecnico.datosSuficientes && (
                    <span className="text-[9px] text-amber-600 font-bold flex items-center gap-0.5 mt-0.5">
                        <Icon name="warning" size="xs" /> Datos insuficientes
                    </span>
                )}
            </div>
        </div>
    );
};