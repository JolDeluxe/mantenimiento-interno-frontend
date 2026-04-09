import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { TIPOS, PRIORIDADES, ROLES_ADMIN } from '../../constants';

const ESTADOS_HOY = [
    { value: 'ASIGNADA', label: 'Asignada' },
    { value: 'EN_PAUSA', label: 'En Pausa' },
    { value: 'EN_PROGRESO', label: 'En Progreso' },
    { value: 'RESUELTO', label: 'Resuelto' },
];

const normalizeOpts = (opts = []) =>
    opts.map(o =>
        typeof o === 'string'
            ? { value: o, label: o }
            : { value: String(o.value ?? o.id), label: String(o.label ?? o.nombre) }
    );

const GlassNativeSelect = ({ icon, placeholder, options, value, onChange }) => {
    const selected = options.find((o) => o.value === String(value));
    const isActive = Boolean(value);

    return (
        <div className="relative w-full h-[38px]">
            <select
                value={value ? String(value) : ''}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 z-20 appearance-none cursor-pointer"
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div
                style={isActive
                    ? { ...glassBase('primary'), borderRadius: 12 }
                    : { ...glassBase('light'), borderRadius: 12 }
                }
                className={`absolute inset-0 flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all duration-200 pointer-events-none overflow-hidden ${isActive ? 'text-white' : 'text-slate-600'}`}
            >
                <GlassSheen />
                <Icon name={icon} size="xs" className="relative shrink-0 z-10" />
                <span className="relative flex-1 truncate z-10">{selected?.label ?? placeholder}</span>
                {isActive ? (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}
                        className="relative z-30 flex items-center justify-center w-5 h-5 -mr-1 rounded-full bg-white/20 hover:bg-white/30 pointer-events-auto shrink-0 active:scale-90 transition-transform"
                    >
                        <Icon name="close" size="xs" className="text-white scale-75" />
                    </button>
                ) : (
                    <Icon name="expand_more" size="xs" className="text-slate-500 shrink-0 relative z-10" />
                )}
            </div>
        </div>
    );
};

const SearchInput = ({ localValue, onChange, onClear, className = 'w-full' }) => (
    <div
        className={`relative overflow-hidden flex items-center ${className}`}
        style={{ ...glassBase('light'), borderRadius: 14 }}
    >
        <GlassSheen />
        <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none z-10">
            <Icon name="search" size="sm" className="text-slate-500" />
        </div>
        <input
            type="text"
            value={localValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-8 pr-7 py-2.5 text-xs bg-transparent relative z-10 text-slate-700
                       focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 rounded-[14px]
                       transition-all placeholder:text-slate-500 h-[38px]"
        />
        {localValue && (
            <button
                onClick={onClear}
                className="absolute inset-y-0 right-1.5 flex items-center px-2 text-slate-500 cursor-pointer z-10 active:scale-90 transition-transform"
            >
                <Icon name="close" size="xs" />
            </button>
        )}
    </div>
);

export const MobileHoyFilterBar = ({
    query,
    onSearchChange,
    filtroEstado,
    onEstadoChange,
    filtroTipo,
    onTipoChange,
    filtroPrioridad,
    onPrioridadChange,
    filtroResponsable,
    onResponsableChange,
    opcionesResponsables = [],
    currentUser,
}) => {
    const [localValue, setLocalValue] = useState(query || '');
    const [showFilters, setShowFilters] = useState(false);
    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);

    useEffect(() => { setLocalValue(query || ''); }, [query]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== query) onSearchChange(localValue);
        }, 450);
        return () => clearTimeout(timer);
    }, [localValue, query, onSearchChange]);

    const hasAdvancedFilters = Boolean(filtroTipo || filtroPrioridad || filtroResponsable);

    const handleClearAdvanced = () => {
        if (filtroTipo) onTipoChange('');
        if (filtroPrioridad) onPrioridadChange('');
        if (filtroResponsable) onResponsableChange('');
    };

    // TECNICO: solo filtro de estado
    if (!esAdmin) {
        return (
            <div className="w-full">
                <GlassNativeSelect
                    icon="swap_horiz"
                    placeholder="Todos los estados"
                    options={ESTADOS_HOY}
                    value={filtroEstado}
                    onChange={onEstadoChange}
                />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-2.5">
            {/* Barra superior: búsqueda + estado + toggle */}
            <div className="flex items-center gap-1.5">
                <SearchInput
                    localValue={localValue}
                    onChange={setLocalValue}
                    onClear={() => setLocalValue('')}
                    className="flex-1 min-w-[80px]"
                />
                <div className="w-[120px] shrink-0">
                    <GlassNativeSelect
                        icon="swap_horiz"
                        placeholder="Estado"
                        options={ESTADOS_HOY}
                        value={filtroEstado}
                        onChange={onEstadoChange}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    style={showFilters || hasAdvancedFilters
                        ? { ...glassBase('primary'), borderRadius: 14 }
                        : { ...glassBase('light'), borderRadius: 14 }
                    }
                    className={`relative overflow-hidden flex items-center justify-center w-[38px] h-[38px] shrink-0 transition-all duration-200 active:scale-95 ${showFilters || hasAdvancedFilters ? 'text-white' : 'text-slate-600'}`}
                >
                    <GlassSheen />
                    <Icon name="filter_alt" size="sm" className="relative z-10" />
                    {hasAdvancedFilters && !showFilters && (
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-marca-acento rounded-full border-2 border-white z-20" />
                    )}
                </button>
            </div>

            {/* Panel de filtros avanzados */}
            {showFilters && (
                <div
                    className="flex flex-col gap-3 p-3 rounded-[20px] relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    style={glassBase('light')}
                >
                    <GlassSheen />
                    <div className="grid grid-cols-2 gap-2 relative z-10">
                        <GlassNativeSelect
                            icon="category"
                            placeholder="Tipo"
                            options={TIPOS}
                            value={filtroTipo}
                            onChange={onTipoChange}
                        />
                        <GlassNativeSelect
                            icon="flag"
                            placeholder="Prioridad"
                            options={PRIORIDADES}
                            value={filtroPrioridad}
                            onChange={onPrioridadChange}
                        />
                        {opcionesResponsables.length > 0 && (
                            <div className="col-span-2">
                                <GlassNativeSelect
                                    icon="person"
                                    placeholder="Responsable"
                                    options={normalizeOpts(opcionesResponsables)}
                                    value={filtroResponsable}
                                    onChange={onResponsableChange}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end pt-0.5 relative z-10">
                        <button
                            type="button"
                            onClick={handleClearAdvanced}
                            disabled={!hasAdvancedFilters}
                            style={hasAdvancedFilters ? { ...glassBase('light'), borderRadius: 10 } : {}}
                            className={`relative overflow-hidden flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 transition-all duration-200 ${hasAdvancedFilters ? 'text-red-500 active:scale-95' : 'text-slate-400 pointer-events-none'}`}
                        >
                            {hasAdvancedFilters && <GlassSheen />}
                            <Icon name="filter_alt_off" size="xs" className="relative z-10" />
                            <span className="relative z-10">Limpiar</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};