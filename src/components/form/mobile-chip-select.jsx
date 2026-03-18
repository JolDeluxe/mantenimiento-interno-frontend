// src/components/form/mobile-chip-select.jsx
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

export const MobileChipSelect = ({
    value,
    onChange,
    options = [],
    placeholder = "Todos",
    icon = "business",
    className
}) => {
    const isSelected = value !== null && value !== '' && value !== undefined;

    return (
        <div className={cn("relative shrink-0 inline-flex items-center", className)}>
            <div className="absolute left-2.5 flex items-center pointer-events-none">
                <Icon
                    name={icon}
                    size="xs"
                    className={isSelected ? "text-marca-primario" : "text-slate-500"}
                />
            </div>
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value || null)}
                className={cn(
                    "appearance-none w-full pl-8 pr-7 py-1.5 h-8 rounded-full border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-marca-primario/30 cursor-pointer",
                    isSelected
                        ? "bg-marca-primario/10 border-marca-primario/30 text-marca-primario"
                        : "bg-white border-slate-200 text-slate-600"
                )}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-2 flex items-center pointer-events-none">
                <Icon
                    name="expand_more"
                    size="xs"
                    className={isSelected ? "text-marca-primario" : "text-slate-400"}
                />
            </div>
        </div>
    );
};