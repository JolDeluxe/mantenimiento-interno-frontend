import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const BAR_COLOR = { green: 'bg-emerald-500', amber: 'bg-amber-400', red: 'bg-red-500' };
const SCORE_COLOR = { green: 'text-emerald-600', amber: 'text-amber-600', red: 'text-red-600' };

// Colores para los lugares del Ranking (Oro, Plata, Bronce, y gris por defecto)
const RANK_STYLES = {
    1: 'bg-amber-400 text-amber-950',
    2: 'bg-slate-300 text-slate-800',
    3: 'bg-orange-300 text-orange-950'
};

const formatMins = (m) => {
    if (!m || m === 0) return '0 min';
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
};

export const TecnicoKpiRow = ({ tecnico, rank, onViewDetail }) => {
    const barColor = BAR_COLOR[tecnico.color] || 'bg-slate-400';
    const scoreColor = SCORE_COLOR[tecnico.color] || 'text-slate-600';
    const rankStyle = RANK_STYLES[rank] || 'bg-slate-100 text-slate-500';

    // Regla de color para el tiempo Real vs Planeado
    let timeColor = 'text-slate-600';
    if (tecnico.minutosEstimados > 0) {
        const ratio = tecnico.minutosReales / tecnico.minutosEstimados;
        if (ratio <= 1) {
            timeColor = 'text-emerald-600 font-bold'; // A tiempo (Verde)
        } else if (ratio > 1.2) {
            timeColor = 'text-red-600 font-bold'; // +20% Excedido (Rojo)
        } else {
            timeColor = 'text-amber-600 font-bold'; // Ligeramente excedido (Ámbar)
        }
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative flex flex-col gap-4 overflow-hidden group">

            {/* Etiqueta de Posición en la esquina superior izquierda */}
            <div className={cn(
                "absolute top-0 left-0 px-3 py-1 rounded-br-xl text-xs font-black font-mono shadow-sm z-10",
                rankStyle
            )}>
                #{rank}
            </div>

            {/* Cabecera: Avatar, Nombre y Score */}
            <div className="flex items-start justify-between gap-3 mt-3">
                <div className="flex items-center gap-3 min-w-0">
                    {tecnico.imagen ? (
                        <img
                            src={tecnico.imagen}
                            alt={tecnico.nombre}
                            className="w-11 h-11 rounded-full object-cover border-2 border-slate-50 shrink-0 shadow-sm"
                            onError={(e) => { e.target.src = '/img/perfil-no-foto.webp'; }}
                        />
                    ) : (
                        <div className="w-11 h-11 rounded-full bg-marca-primario/10 flex items-center justify-center text-lg font-black text-marca-primario shrink-0 shadow-sm">
                            {tecnico.nombre?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <p className="text-sm font-extrabold text-slate-800 truncate" title={tecnico.nombre}>
                            {tecnico.nombre}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide truncate mt-0.5">
                            {tecnico.tareasCompletadas} tarea{tecnico.tareasCompletadas !== 1 ? 's' : ''} finalizada{tecnico.tareasCompletadas !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                    <span className={cn('text-2xl font-black font-mono leading-none', scoreColor)}>
                        {tecnico.scoreAjustado}%
                    </span>
                    {/* ETIQUETA DE VOLUMEN INSUFICIENTE */}
                    {tecnico.tareasCompletadas < 3 && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] font-black text-amber-700 bg-amber-100/50 border border-amber-200 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            <Icon name="warning" size="xs" className="scale-75" /> Orientativo
                        </div>
                    )}
                </div>
            </div>

            {/* Barra de Progreso Central */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={cn('h-full rounded-full transition-all duration-700', barColor)}
                    style={{ width: `${Math.min(tecnico.scoreAjustado, 100)}%` }}
                />
            </div>

            {/* Panel de Tiempos */}
            <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 p-2.5">
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Tiempo Real</span>
                    <span className={cn("text-xs", timeColor)}>
                        {formatMins(tecnico.minutosReales)}
                    </span>
                </div>
                <div className="w-px h-8 bg-slate-200 mx-2"></div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Planeado</span>
                    <span className="text-xs font-bold text-slate-600">
                        {tecnico.minutosEstimados > 0 ? formatMins(tecnico.minutosEstimados) : '—'}
                    </span>
                </div>
            </div>

            {/* Botón de Detalle */}
            {onViewDetail && (
                <button
                    type="button"
                    onClick={() => onViewDetail(tecnico)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-marca-primario hover:text-white transition-colors cursor-pointer mt-auto"
                >
                    <Icon name="analytics" size="xs" />
                    Ver Análisis
                </button>
            )}
        </div>
    );
};