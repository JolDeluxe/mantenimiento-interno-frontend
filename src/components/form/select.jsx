import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/icon';

export const Select = forwardRef(({ 
    className, 
    error, 
    children, 
    helperText, 
    icon,
    onClear,
    value,
    ...props 
}, ref) => {
    const hasValue = value && value !== "";
    
    const baseStyles = "w-full border px-3 py-2 text-sm appearance-none focus:outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed bg-white h-9.5 font-medium";
    
    const stateStyles = error
        ? "border-red-500 focus:ring-2 focus:ring-red-100 text-red-900"
        : hasValue 
            ? "border-marca-primario/30 bg-marca-primario/[0.03] text-marca-primario focus:ring-2 focus:ring-marca-primario/10"
            : "border-slate-200 text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-marca-secundario/20 focus:border-marca-secundario";

    return (
        <div className="w-full">
            <div className="relative group">
                {icon && (
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors">
                        <Icon 
                            name={icon} 
                            size="xs" 
                            className={cn(
                                "transition-colors",
                                hasValue ? "text-marca-primario" : "text-slate-400 group-focus-within:text-marca-secundario"
                            )} 
                        />
                    </div>
                )}
                
                <select
                    ref={ref}
                    value={value}
                    className={cn(
                        baseStyles, 
                        stateStyles, 
                        "rounded-xl",
                        icon ? "pl-9" : "pl-3",
                        onClear && hasValue ? "pr-14" : "pr-9",
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>

                <div className="absolute inset-y-0 right-0 flex items-center gap-1 px-2 pointer-events-none">
                    {onClear && hasValue && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onClear();
                            }}
                            className="pointer-events-auto flex items-center justify-center w-6 h-6 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                        >
                            <Icon name="close" size="14px" />
                        </button>
                    )}
                    
                    <Icon 
                        name="expand_more" 
                        size="18px" 
                        className={cn(
                            "transition-colors",
                            hasValue ? "text-marca-primario/50" : "text-slate-400"
                        )} 
                    />
                </div>
            </div>
            {helperText && (
                <p className={cn("text-[10px] mt-1 font-bold px-1", error ? "text-red-600" : "text-slate-400 uppercase tracking-tight")}>
                    {helperText}
                </p>
            )}
        </div>
    );
});

Select.displayName = 'Select';