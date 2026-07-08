import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const MINUTOS_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export const DurationPicker = ({
    valueMins,
    onChange,
    disabled,
    error,
    hoursCount = 12,
    selectBaseClassName = 'w-full border rounded-sm px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed pr-8 transition-colors',
    selectNormalClassName = 'border-slate-300 focus:ring-marca-secundario/30',
    selectErrorClassName = 'border-rose-500 focus:ring-rose-200',
    iconBaseClassName = 'pointer-events-none absolute inset-y-0 right-0 flex items-center px-2',
    iconNormalClassName = 'text-slate-400',
    iconErrorClassName = 'text-rose-400',
    totalLabelBaseClassName = 'text-[11px] flex items-center gap-1 transition-colors',
    totalLabelNormalClassName = 'text-slate-400',
    totalLabelErrorClassName = 'text-rose-600 font-bold',
}) => {
    const horas = Math.floor((valueMins || 0) / 60);
    const minutos = Math.round(((valueMins || 0) % 60) / 5) * 5 % 60;
    const totalLabel = valueMins > 0 ? `${valueMins} min en total` : null;
    const horasOptions = Array.from({ length: hoursCount }, (_, i) => i);

    return (
        <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                    <select
                        value={horas}
                        onChange={(e) => onChange(Number(e.target.value) * 60 + minutos)}
                        disabled={disabled}
                        className={cn(selectBaseClassName, error ? selectErrorClassName : selectNormalClassName)}
                    >
                        {horasOptions.map((h) => (
                            <option key={h} value={h}>{h} h</option>
                        ))}
                    </select>
                    <div className={cn(iconBaseClassName, error ? iconErrorClassName : iconNormalClassName)}>
                        <Icon name="expand_more" size="sm" />
                    </div>
                </div>

                <div className="relative">
                    <select
                        value={minutos}
                        onChange={(e) => onChange(horas * 60 + Number(e.target.value))}
                        disabled={disabled}
                        className={cn(selectBaseClassName, error ? selectErrorClassName : selectNormalClassName)}
                    >
                        {MINUTOS_OPTIONS.map((m) => (
                            <option key={m} value={m}>{String(m).padStart(2, '0')} min</option>
                        ))}
                    </select>
                    <div className={cn(iconBaseClassName, error ? iconErrorClassName : iconNormalClassName)}>
                        <Icon name="expand_more" size="sm" />
                    </div>
                </div>
            </div>

            {totalLabel && (
                <p className={cn(totalLabelBaseClassName, error ? totalLabelErrorClassName : totalLabelNormalClassName)}>
                    <Icon name="timer" size="xs" /> {totalLabel}
                </p>
            )}
        </div>
    );
};
