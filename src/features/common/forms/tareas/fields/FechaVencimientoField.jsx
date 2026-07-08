import { Label, Input } from '@/components/form/z_index';
import { cn } from '@/utils/cn';

export const FechaVencimientoField = ({
    id = 'tf-fecha',
    value,
    onChange,
    min,
    label = 'Fecha vencimiento',
    error,
    disabled = false,
    onSetToday,
    onSetTomorrow,
    isToday = false,
    isTomorrow = false,
    description,
    quickButtonBaseClassName = 'text-xs font-bold px-2 py-0.5 rounded transition-colors disabled:opacity-50 cursor-pointer',
    quickButtonActiveClassName = 'bg-marca-primario text-white',
    quickButtonInactiveClassName = 'text-marca-primario bg-marca-primario/10 hover:bg-marca-primario/20',
}) => {
    const hasError = Boolean(error);
    const resolvedHelperText = typeof error === 'string' ? error : undefined;

    return (
        <div className="flex flex-col gap-1.5 overflow-hidden">
            <div className="flex justify-between items-center">
                <Label htmlFor={id} error={hasError}>{label}</Label>
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onSetToday}
                        disabled={disabled}
                        className={cn(quickButtonBaseClassName, isToday ? quickButtonActiveClassName : quickButtonInactiveClassName)}
                    >
                        Hoy
                    </button>
                    <button
                        type="button"
                        onClick={onSetTomorrow}
                        disabled={disabled}
                        className={cn(quickButtonBaseClassName, isTomorrow ? quickButtonActiveClassName : quickButtonInactiveClassName)}
                    >
                        Mañana
                    </button>
                </div>
            </div>
            <Input
                id={id}
                type="date"
                value={value}
                min={min}
                onChange={(e) => onChange(e.target.value)}
                error={hasError}
                helperText={resolvedHelperText}
                disabled={disabled}
                style={{ minWidth: 0 }}
            />
            {description && (
                <span className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1 block">
                    {description}
                </span>
            )}
        </div>
    );
};
