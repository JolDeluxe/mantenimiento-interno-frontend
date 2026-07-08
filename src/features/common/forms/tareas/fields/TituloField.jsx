import { Label, Input } from '@/components/form/z_index';

export const TituloField = ({
    id = 'tf-titulo',
    value,
    onChange,
    error,
    disabled = false,
    required = false,
    maxLength,
    label = 'Título',
    placeholder,
    className = '',
}) => {
    const hasError = Boolean(error);
    const labelText = required && !String(label).includes('*') ? `${label} *` : label;
    const resolvedHelperText = typeof error === 'string' ? error : undefined;
    const currentValue = value ?? '';

    return (
        <div className={`flex flex-col gap-1.5${className ? ` ${className}` : ''}`}>
            <div className="flex justify-between items-center">
                <Label htmlFor={id} error={hasError}>{labelText}</Label>
                <span className={`text-[10px] font-bold ${currentValue.length >= maxLength ? 'text-estado-rechazado' : 'text-slate-400'}`}>
                    {currentValue.length}/{maxLength}
                </span>
            </div>
            <Input
                id={id}
                value={currentValue}
                onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
                error={hasError}
                helperText={resolvedHelperText}
                placeholder={placeholder}
                disabled={disabled}
            />
        </div>
    );
};
