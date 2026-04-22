import { Icon, Skeleton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const COLOR_SCORE = {
    green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500', fill: 'fill-emerald-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-400', fill: 'fill-amber-400' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500', fill: 'fill-red-500' },
    neutral: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', bar: 'bg-slate-400', fill: 'fill-slate-400' },
};

const formatMins = (m) => {
    if (!m) return '0m';
    return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
};

const PersonCard = ({ persona, rank, variant = 'top' }) => {
    const c = COLOR_SCORE[persona.color] || COLOR_SCORE.neutral;
    const isFirst = rank === 0;

    return (
        <div className={cn(
            'relative flex flex-col md:flex-row items-center gap-2 p-3 md:p-2.5 rounded-xl border transition-all text-center md:text-left',
            isFirst ? cn(c.bg, c.border, 'shadow-sm') : 'bg-white border-slate-200 opacity-95',
            variant === 'bottom' && isFirst && 'border-red-300 bg-red-50/50'
        )}>
            <div className={cn(
                "absolute -top-2.5 -left-1.5 md:-top-2 md:-left-2 w-6 h-6 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[10px] md:text-[9px] font-black border-2 border-white shadow-sm z-10",
                variant === 'top' ? 'bg-amber-400 text-amber-900' : 'bg-red-500 text-white'
            )}>
                {variant === 'top' ? `#${rank + 1}` : <Icon name="warning" size="xs" />}
            </div>

            {persona.imagen ? (
                <img
                    src={persona.imagen}
                    alt={persona.nombre}
                    className={cn("rounded-full object-cover border-2 border-white shadow-sm shrink-0", isFirst ? "w-14 h-14 md:w-10 md:h-10" : "w-10 h-10 md:w-8 md:h-8")}
                    onError={(e) => { e.target.src = '/img/perfil-no-foto.webp'; }}
                />
            ) : (
                <div className={cn(
                    'rounded-full flex items-center justify-center font-black shrink-0 border-2 border-white shadow-sm',
                    isFirst ? "w-14 h-14 text-xl md:w-10 md:h-10 md:text-sm" : "w-10 h-10 text-sm md:w-8 md:h-8 md:text-xs",
                    c.bg, c.text
                )}>
                    {persona.nombre?.charAt(0).toUpperCase()}
                </div>
            )}

            <div className="flex-1 flex flex-col items-center md:items-start min-w-0 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between w-full md:gap-2">
                    <p className={cn("font-bold text-slate-800 truncate", isFirst ? "text-sm" : "text-xs md:text-sm")}>
                        {persona.nombre.split(' ')[0]}
                    </p>
                    <span className={cn('font-extrabold font-mono mt-0.5 md:mt-0', isFirst ? "text-xl md:text-base" : "text-sm", c.text)}>
                        {persona.scoreAjustado}%
                    </span>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-2 mt-1.5 md:mt-0.5 text-[9px] font-medium text-slate-500 bg-slate-50 md:bg-transparent py-1 md:py-0 w-full md:w-auto rounded-md md:rounded-none border border-slate-100 md:border-none">
                    <span className="flex items-center gap-0.5" title="Tareas Terminadas">
                        <Icon name="task_alt" size="xs" className="text-slate-400" /> {persona.tareasCompletadas}
                    </span>
                    <span className="flex items-center gap-0.5" title="Tiempo Real">
                        <Icon name="timer" size="xs" className="text-slate-400" /> {formatMins(persona.minutosReales)}
                    </span>
                </div>
            </div>
        </div>
    );
};

const PanelSkeleton = () => (
    <div className="grid grid-cols-2 gap-3">
        {[0, 1].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                <Skeleton className="h-3 w-24 rounded-full mx-auto" />
                <div className="flex flex-col md:flex-row items-center gap-2">
                    <Skeleton className="w-12 h-12 md:w-10 md:h-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 w-full">
                        <Skeleton className="h-3 w-20 md:w-full rounded-md mx-auto md:mx-0" />
                        <Skeleton className="h-4 w-12 md:w-16 rounded-md mx-auto md:mx-0" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export const EquipoCicloPanel = ({ personas = [], promedioEquipoGlobal, loading }) => {
    if (loading) return <PanelSkeleton />;
    if (personas.length === 0) return null;

    const calificados = personas.filter(p => p.calificaRanking);
    const top60 = calificados.filter(p => p.scoreAjustado >= 60);
    const top3 = top60.slice(0, 3);
    const bottom60 = calificados.filter(p => p.scoreAjustado < 60);
    const bottom3 = bottom60.length > 0 ? [...bottom60].reverse().slice(0, 3) : [];

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <Icon name="workspace_premium" size="sm" className="text-amber-500" />
                <h3 className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Rendimiento del Ciclo
                </h3>
                {promedioEquipoGlobal !== undefined && (
                    <span className="ml-auto text-[10px] md:text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                        Global: <span className="text-slate-800">{promedioEquipoGlobal}%</span>
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-white border border-emerald-200 rounded-2xl p-3 shadow-sm flex flex-col h-full">
                    <p className="text-[9px] md:text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5 text-center">
                        <Icon name="emoji_events" size="xs" /> Top Rendimiento
                    </p>
                    {top3.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {top3.map((p, i) => <PersonCard key={p.id} persona={p} rank={i} variant="top" />)}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                            <Icon name="emoji_events" size="md" className="text-slate-300 mb-2" />
                            <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Sin Top</span>
                            <p className="text-[9px] md:text-[10px] text-slate-400 font-medium mt-1">Nadie cumple los criterios en este periodo.</p>
                        </div>
                    )}
                </div>

                <div className="bg-white border border-red-200 rounded-2xl p-3 shadow-sm flex flex-col h-full">
                    <p className="text-[9px] md:text-[10px] font-black text-red-700 uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5 text-center">
                        <Icon name="lightbulb" size="xs" /> Foco de Atención
                    </p>
                    {bottom3.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {bottom3.map((p, i) => <PersonCard key={p.id} persona={p} rank={i} variant="bottom" />)}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50/50">
                            <Icon name="task_alt" size="md" className="text-emerald-400 mb-2" />
                            <span className="text-[10px] md:text-[11px] font-black text-emerald-600 uppercase tracking-widest">Sin Rezagos</span>
                            <p className="text-[9px] md:text-[10px] text-emerald-600/80 font-medium mt-1">Todo el personal está por encima del mínimo.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};