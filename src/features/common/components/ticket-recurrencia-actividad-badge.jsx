import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { formatearRecurrenciaActividad } from '@/features/common/utils/recurrencia-actividad';

export const TicketRecurrenciaActividadBadge = ({ ticket, className }) => {
    const label = formatearRecurrenciaActividad(ticket);
    if (!label) return null;

    return (
        <span
            className={cn(
                'inline-flex max-w-full items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold leading-tight text-slate-500',
                className
            )}
            title={label}
        >
            <Icon name="autorenew" size="10px" className="shrink-0 text-slate-400" />
            <span className="min-w-0 truncate">{label}</span>
        </span>
    );
};
