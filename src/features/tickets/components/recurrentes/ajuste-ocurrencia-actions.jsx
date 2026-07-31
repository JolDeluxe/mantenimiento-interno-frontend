import { Icon } from '@/components/ui/z_index';
import { getOccurrenceOriginalDate, isPastMonth } from './recurrentes-utils';

export const AjusteOcurrenciaActions = ({
    occurrence,
    canManage,
    disabled,
    onMaterialize,
    onMove,
    onOmit,
    onRemove,
}) => {
    if (!canManage) return null;

    const hasTask = Boolean(occurrence?.tareaId || occurrence?.ticketId);
    const omitted = Boolean(occurrence?.omitida || occurrence?.ajusteTipo === 'OMITIR');
    const hasAdjustment = Boolean(occurrence?.ajusteTipo || occurrence?.omitida || occurrence?.movida);
    const periodClosed = isPastMonth(getOccurrenceOriginalDate(occurrence));

    if (periodClosed && !hasTask) {
        return (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-slate-500">
                <Icon name="lock" size="10px" />
                Cerrado
            </span>
        );
    }

    return (
        <div className="flex flex-wrap items-center justify-end gap-1">
            {!hasTask && !omitted && (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onMaterialize(occurrence)}
                    className="inline-flex items-center gap-1 rounded-md p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                    title="Generar tarea"
                    aria-label="Generar tarea"
                >
                    <Icon name="add_task" size="sm" />
                </button>
            )}
            {!hasTask && !omitted && (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onMove(occurrence)}
                    className="inline-flex items-center gap-1 rounded-md p-1 text-sky-700 hover:bg-sky-50 disabled:opacity-40"
                    title="Mover"
                    aria-label="Mover"
                >
                    <Icon name="event_repeat" size="sm" />
                </button>
            )}
            {!hasTask && !hasAdjustment && (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onOmit(occurrence)}
                    className="inline-flex items-center gap-1 rounded-md p-1 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    title="Omitir"
                    aria-label="Omitir"
                >
                    <Icon name="event_busy" size="sm" />
                </button>
            )}
            {!hasTask && hasAdjustment && (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRemove(occurrence)}
                    className="inline-flex items-center gap-1 rounded-md p-1 text-red-700 hover:bg-red-50 disabled:opacity-40"
                    title="Quitar ajuste"
                    aria-label="Quitar ajuste"
                >
                    <Icon name="undo" size="sm" />
                </button>
            )}
        </div>
    );
};
