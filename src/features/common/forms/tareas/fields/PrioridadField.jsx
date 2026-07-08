import { Label, Select } from '@/components/form/z_index';

export const PrioridadField = ({
    id = 'tf-prioridad',
    value,
    onChange,
    options = [],
    error,
    helperText,
    disabled = false,
    required = false,
    label = 'Prioridad',
    placeholder,
    className = '',
}) => {
    const hasError = Boolean(error);
    const labelText = required && !String(label).includes('*') ? `${label} *` : label;
    const resolvedHelperText = helperText ?? (typeof error === 'string' ? error : undefined);

    const resolvedPriorityDot = {
        BAJA: 'bg-emerald-500',
        MEDIA: 'bg-yellow-500',
        ALTA: 'bg-orange-500',
        CRITICA: 'bg-red-500',
    }[value] || '';

    return (
        <div className={`flex flex-col gap-1.5${className ? ` ${className}` : ''}`}>
            <div className="flex items-center justify-between">
                <Label htmlFor={id} error={hasError}>{labelText}</Label>
                {resolvedPriorityDot && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none animate-in fade-in duration-200">
                        <span className={`w-2 h-2 rounded-full ${resolvedPriorityDot}`} />
                        {value}
                    </span>
                )}
            </div>
            <Select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                error={hasError}
                helperText={resolvedHelperText}
            >
                {placeholder && <option value="" disabled hidden>{placeholder}</option>}
                {options.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                ))}
            </Select>
        </div>
    );
};
