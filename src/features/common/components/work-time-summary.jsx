import { Icon } from '@/components/ui/z_index';
import { formatFechaHoraCompacta } from '@/lib/date';

const TimePoint = ({ icon, label, value, fallback }) => {
    const formatted = formatFechaHoraCompacta(value);

    return (
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-slate-400">
                <Icon name={icon} size="xs" className="shrink-0 text-slate-400" />
                <span className="truncate">{label}</span>
            </div>
            {formatted ? (
                <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-black text-slate-900">{formatted.hora}</span>
                    <span className="text-[11px] font-semibold text-slate-500">{formatted.fecha}</span>
                </div>
            ) : (
                <p className="mt-1 text-xs font-semibold text-slate-400">{fallback}</p>
            )}
        </div>
    );
};

export const WorkTimeSummary = ({ inicio, fin, className = '' }) => {
    if (!inicio && !fin) return null;

    return (
        <div className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${className}`}>
            <TimePoint
                icon="play_circle"
                label="Inicio real"
                value={inicio}
                fallback="Sin inicio"
            />
            <TimePoint
                icon="task_alt"
                label="Finalizado"
                value={fin}
                fallback="Sin cierre"
            />
        </div>
    );
};
