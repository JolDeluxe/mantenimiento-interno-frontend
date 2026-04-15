import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const COLOR_BAR = { green: 'bg-emerald-500', amber: 'bg-amber-400', red: 'bg-red-500' };
const ROL_LABEL = { TECNICO: 'Técnico', COORDINADOR_MTTO: 'Coordinador' };
const ROL_COLOR = { TECNICO: 'bg-blue-100 text-blue-700', COORDINADOR_MTTO: 'bg-amber-100 text-amber-700' };

export const TecnicoKpiRow = ({ tecnico, onViewDetail }) => {
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
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="text-sm font-bold text-slate-800 truncate">{tecnico.nombre}</span>
                        {tecnico.rol && (
                            <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0', ROL_COLOR[tecnico.rol] || 'bg-slate-100 text-slate-600')}>
                                {ROL_LABEL[tecnico.rol] || tecnico.rol}
                            </span>
                        )}
                    </div>
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

            {onViewDetail && (
                <button
                    type="button"
                    onClick={() => onViewDetail(tecnico)}
                    className="shrink-0 p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Ver detalle"
                >
                    <Icon name="visibility" size="sm" />
                </button>
            )}
        </div>
    );
};