import { Icon } from '@/components/ui/z_index';

export const AjusteOcurrenciaActions = ({
    item,
    canManage,
    disabled,
    onMove,
    onSkip,
    onRemoveAdjustment,
}) => {
    if (!canManage || item?.ticketId) return null;

    const hasAdjustment = Boolean(item?.ajusteTipo || item?.omitida || item?.movida);
    const omitida = Boolean(item?.omitida);

    return (
        <div className="mt-1 flex flex-wrap items-center gap-1">
            {!omitida && (
                <button
                    type="button"
                    onClick={onMove}
                    disabled={disabled}
                    className="inline-flex items-center gap-1 rounded-md bg-white/80 px-1.5 py-0.5 text-[9px] font-black uppercase text-sky-700 disabled:opacity-50"
                >
                    <Icon name="event_repeat" size="10px" />
                    Mover este mes
                </button>
            )}
            {!hasAdjustment && (
                <button
                    type="button"
                    onClick={onSkip}
                    disabled={disabled}
                    className="inline-flex items-center gap-1 rounded-md bg-white/80 px-1.5 py-0.5 text-[9px] font-black uppercase text-slate-700 disabled:opacity-50"
                >
                    <Icon name="event_busy" size="10px" />
                    Omitir este mes
                </button>
            )}
            {hasAdjustment && (
                <button
                    type="button"
                    onClick={onRemoveAdjustment}
                    disabled={disabled}
                    className="inline-flex items-center gap-1 rounded-md bg-white/80 px-1.5 py-0.5 text-[9px] font-black uppercase text-marca-primario disabled:opacity-50"
                >
                    <Icon name="undo" size="10px" />
                    Quitar ajuste
                </button>
            )}
        </div>
    );
};

