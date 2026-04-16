import { Icon, Skeleton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const COLOR_MAP = {
    green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-400/30' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', ring: 'ring-amber-400/30' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', ring: 'ring-red-400/30' },
    neutral: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', ring: 'ring-slate-300/30' },
};

/**
 * Props:
 *   icon         → string Material Symbol
 *   label        → string
 *   value        → number | string
 *   suffix       → string (ej. '%')
 *   color        → 'green' | 'amber' | 'red' | 'neutral'
 *   datosSuficientes → boolean
 *   loading      → boolean
 *   footnote     → string (texto pequeño debajo)
 */
export const KpiCard = ({
    icon,
    label,
    value,
    suffix = '%',
    color = 'neutral',
    datosSuficientes = true,
    loading = false,
    footnote,
}) => {
    const c = COLOR_MAP[color] || COLOR_MAP.neutral;

    if (loading) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-10 w-20 rounded-md" />
                <Skeleton className="h-2.5 w-32 rounded-full" />
            </div>
        );
    }

    return (
        <div className={cn(
            'rounded-2xl p-5 border shadow-sm flex flex-col gap-2 transition-all',
            c.bg, c.border,
            !datosSuficientes && 'opacity-70 ring-2 ring-offset-1',
            !datosSuficientes && c.ring,
        )}>
            <div className="flex items-center justify-between">
                <span className={cn('text-xs font-bold uppercase tracking-wider', c.text)}>
                    {label}
                </span>
                <Icon name={icon} size="sm" className={c.text} />
            </div>

            <div className="flex items-end gap-1">
                <span className={cn('text-4xl font-extrabold font-mono leading-none', c.text)}>
                    {value ?? '—'}
                </span>
                {value !== null && value !== undefined && (
                    <span className={cn('text-lg font-bold mb-0.5', c.text)}>{suffix}</span>
                )}
            </div>

            {footnote && (
                <p className="text-[10px] text-slate-400 font-medium">{footnote}</p>
            )}

            {!datosSuficientes && (
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                    <Icon name="warning" size="xs" />
                    Pocos datos — resultado orientativo
                </div>
            )}
        </div>
    );
};