import { Label, Input } from '@/components/form/z_index';

export const DescripcionField = ({
    id = 'tf-desc',
    value,
    onChange,
    onRemove,
    error,
    disabled = false,
    maxLength,
    label = 'Detalles adicionales / Descripción',
    placeholder,
    rows = 3,
    className = '',
}) => {
    const hasError = Boolean(error);
    const resolvedHelperText = typeof error === 'string' ? error : undefined;
    const currentValue = value ?? '';

    return (
        <div className={`flex flex-col gap-1.5${className ? ` ${className}` : ''}`}>
            <div className="flex justify-between items-center">
                <Label htmlFor={id} error={hasError}>{label}</Label>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${currentValue.length >= maxLength ? 'text-estado-rechazado' : 'text-slate-400'}`}>
                        {currentValue.length}/{maxLength}
                    </span>
                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={disabled}
                        className="text-[10px] text-rose-600 hover:text-rose-800 font-bold bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                    >
                        Quitar
                    </button>
                </div>
            </div>
            <Input
                id={id}
                multiline
                rows={rows}
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
