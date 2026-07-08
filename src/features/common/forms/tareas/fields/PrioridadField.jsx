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

    return (
        <div className={`flex flex-col gap-1.5${className ? ` ${className}` : ''}`}>
            <Label htmlFor={id} error={hasError}>{labelText}</Label>
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
