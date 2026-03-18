import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icon, Tooltip } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

export const SearchableSelect = ({
    options = [], // Formato: [{ value: '1', label: 'Mantenimiento' }]
    value,
    onChange,
    placeholder = "Seleccionar...",
    searchPlaceholder = "Buscar...",
    allOptionText = "Todos",
    icon,
    disabled = false,
    className,
    menuClassName,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef(null);

    // ── Interceptor de clics externos para cerrar el menú ──
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = useMemo(() =>
        options.find(opt => String(opt.value) === String(value)),
        [options, value]);

    const filteredOptions = useMemo(() =>
        options.filter(opt =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [options, searchQuery]);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
        setSearchQuery("");
    };

    return (
        <div className="relative shrink-0" ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all h-[38px]",
                    disabled ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" : "cursor-pointer",
                    value && !disabled
                        ? "bg-marca-primario/5 border-marca-primario/30 text-marca-primario shadow-sm"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
                    className
                )}
            >
                <span className="flex items-center whitespace-nowrap">
                    {icon && <Icon name={icon} size="sm" className="mr-2 opacity-70 flex-shrink-0" />}
                    <span>
                        {value ? selectedOption?.label : placeholder}
                    </span>
                </span>

                {value && !disabled ? (
                    <Tooltip text="Limpiar selección" variant="dark" position="top">
                        <div
                            role="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect('');
                            }}
                            className="p-1 hover:bg-red-100 rounded-full text-red-600 transition-colors ml-2 flex-shrink-0"
                        >
                            <Icon name="close" size="xs" />
                        </div>
                    </Tooltip>
                ) : (
                    <Icon
                        name="expand_more"
                        size="sm"
                        className={cn(
                            "transition-transform flex-shrink-0 ml-2",
                            disabled ? "text-slate-300" : "text-slate-400",
                            isOpen ? "rotate-180" : ""
                        )}
                    />
                )}
            </button>

            {isOpen && !disabled && (
                <div className={cn("absolute top-full left-0 mt-1 min-w-full w-max max-w-sm bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in", menuClassName)}>

                    {/* Buscador Interno */}
                    <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
                        <div className="relative">
                            <Icon name="search" size="xs" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-marca-secundario bg-white"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Lista de Resultados */}
                    <div className="max-h-60 overflow-y-auto py-1">
                        {searchQuery === "" && allOptionText && (
                            <button
                                onClick={() => handleSelect("")}
                                className={cn(
                                    "w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap",
                                    !value ? "bg-slate-50 font-bold text-slate-900" : "text-slate-600"
                                )}
                            >
                                {allOptionText}
                            </button>
                        )}

                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSelect(String(opt.value))}
                                    className={cn(
                                        "w-full text-left px-4 py-2.5 text-sm hover:bg-marca-primario/5 transition-colors border-t border-slate-50 cursor-pointer whitespace-nowrap",
                                        String(value) === String(opt.value) ? "bg-marca-primario/5 font-bold text-marca-primario" : "text-slate-600"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-slate-500 text-center italic">
                                No se encontraron resultados
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};