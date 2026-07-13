// src/features/calendario/components/mobile-calendario-filter-bar.jsx
import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { TIPOS, PRIORIDADES, CLASIFICACIONES, PLANTAS, AREAS, AREAS_POR_PLANTA, CATEGORIAS_EQUIPO } from '@/features/common/constants/catalogos-tareas';

const SCOPE_OPTIONS = [
    { value: 'mantenimientos', label: 'Mantenimientos' },
    { value: 'actividades', label: 'Actividades' }
];

const normalizeOpts = (opts = []) => opts.map(o => {
    if (typeof o === 'string') return { value: o, label: o };
    return { value: String(o.value ?? o.id), label: String(o.label ?? o.nombre) };
});

const SearchInput = ({ localValue, onChange, onClear, className = "w-full" }) => (
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
                       transition-all placeholder:text-slate-500 h-9.5"
        />
        {localValue && (
            <button
                type="button"
                onClick={onClear}
                className="absolute inset-y-0 right-1.5 flex items-center px-2 text-slate-500 cursor-pointer z-10 active:scale-90 transition-transform bg-transparent border-none"
            >
                <Icon name="close" size="xs" />
            </button>
        )}
    </div>
);

const GlassNativeSelect = ({ icon, placeholder, options, value, onChange }) => {
    const normalized = normalizeOpts(options);
    const selected = normalized.find((o) => o.value === String(value));
    const isActive = Boolean(value);

    return (
        <div className="relative w-full h-9.5">
            <select
                value={value ? String(value) : ''}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 z-20 appearance-none cursor-pointer"
            >
                <option value="">{placeholder}</option>
                {normalized.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            <div
                style={isActive ? { ...glassBase('primary'), borderRadius: 12 } : { ...glassBase('light'), borderRadius: 12 }}
                className={`
                    absolute inset-0 flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all duration-200 pointer-events-none overflow-hidden
                    ${isActive ? 'text-white' : 'text-slate-600'}
                `}
            >
                <GlassSheen />
                <Icon name={icon} size="xs" className="relative shrink-0 z-10" />
                <span className="relative flex-1 truncate z-10">
                    {selected?.label ?? placeholder}
                </span>

                {isActive ? (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}
                        className="relative z-30 flex items-center justify-center w-5 h-5 -mr-1 rounded-full bg-white/20 hover:bg-white/30 pointer-events-auto shrink-0 active:scale-90 transition-transform bg-transparent border-none"
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

export const MobileCalendarioFilterBar = ({
    scope,
    onScopeChange,
    filtroEstado,
    onFilterChange,
    filtroPrioridad,
    onPrioridadChange,
    filtroCategoria,
    onCategoriaChange,
    filtroClasificacion,
    onClasificacionChange,
    filtroResponsable,
    onResponsableChange,
    filtroPlanta,
    onPlantaChange,
    filtroArea,
    onAreaChange,
    query,
    onSearchChange,
    tecnicos = [],
    onClearFilters,
}) => {
    const [localQuery, setLocalQuery] = useState(query || '');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalQuery(query || '');
    }, [query]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localQuery !== query) onSearchChange(localQuery);
        }, 450);
        return () => clearTimeout(timer);
    }, [localQuery, query, onSearchChange]);

    const handlePlantaChange = (nuevaPlanta) => {
        onPlantaChange(nuevaPlanta);
        onAreaChange('');
    };

    const areasDisponibles = filtroPlanta ? (AREAS_POR_PLANTA[filtroPlanta] || []) : AREAS;

    const ESTADOS = [
        { value: 'PENDIENTE', label: 'Pendiente' },
        { value: 'ASIGNADA', label: 'Asignada' },
        { value: 'EN_PROGRESO', label: 'En Progreso' },
        { value: 'EN_PAUSA', label: 'En Pausa' },
        { value: 'RESUELTO', label: 'Resuelto' },
        { value: 'RECHAZADO', label: 'Rechazado' },
        { value: 'CANCELADA', label: 'Cancelado' }
    ];

    const hasActiveFilters =
        scope !== 'general' ||
        filtroEstado !== 'TODOS' ||
        filtroPrioridad !== '' ||
        filtroCategoria !== '' ||
        filtroClasificacion !== '' ||
        filtroResponsable !== '' ||
        filtroPlanta !== '' ||
        filtroArea !== '';

    const filterElements = [
        { key: 'scope', el: <GlassNativeSelect icon="assignment" placeholder="Todas las Tareas" options={SCOPE_OPTIONS} value={scope === 'general' ? '' : scope} onChange={(val) => onScopeChange(val || 'general')} />, span2: true },
        { key: 'estado', el: <GlassNativeSelect icon="swap_horiz" placeholder="Todos los Estados" options={ESTADOS} value={filtroEstado === 'TODOS' ? '' : filtroEstado} onChange={(val) => onFilterChange(val || 'TODOS')} />, span2: true },
        { key: 'planta', el: <GlassNativeSelect icon="domain" placeholder="Planta" options={normalizeOpts(PLANTAS)} value={filtroPlanta} onChange={handlePlantaChange} />, span2: false },
        { key: 'area', el: <GlassNativeSelect icon="place" placeholder="Área" options={normalizeOpts(areasDisponibles)} value={filtroArea} onChange={onAreaChange} />, span2: false },
        { key: 'prioridad', el: <GlassNativeSelect icon="flag" placeholder="Prioridad" options={PRIORIDADES} value={filtroPrioridad} onChange={onPrioridadChange} />, span2: false },
        { key: 'responsable', el: <GlassNativeSelect icon="person" placeholder="Responsable" options={normalizeOpts(tecnicos)} value={filtroResponsable} onChange={onResponsableChange} />, span2: false },
        { key: 'categoria', el: <GlassNativeSelect icon="label" placeholder="Categoría" options={CATEGORIAS_EQUIPO} value={filtroCategoria} onChange={onCategoriaChange} />, span2: false },
        { key: 'clasificacion', el: <GlassNativeSelect icon="build" placeholder="Clasificación" options={CLASIFICACIONES} value={filtroClasificacion} onChange={onClasificacionChange} />, span2: false }
    ];

    return (
        <div className="w-full flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-hidden">
                <SearchInput
                    localValue={localQuery}
                    onChange={setLocalQuery}
                    onClear={() => setLocalQuery('')}
                    className="flex-1 min-w-[90px]"
                />

                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    style={showFilters || hasActiveFilters ? { ...glassBase('primary'), borderRadius: 14 } : { ...glassBase('light'), borderRadius: 14 }}
                    className={`
                        relative overflow-hidden flex items-center justify-center w-[38px] h-[38px] shrink-0 transition-all duration-200 active:scale-95 border-none
                        ${showFilters || hasActiveFilters ? 'text-white' : 'text-slate-600'}
                    `}
                >
                    <GlassSheen />
                    <Icon name="filter_alt" size="sm" className="relative z-10" />
                    {hasActiveFilters && !showFilters && (
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-marca-acento rounded-full border-2 border-white z-20"></span>
                    )}
                </button>
            </div>

            {showFilters && (
                <div
                    className="flex flex-col gap-3 p-3 rounded-[20px] relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    style={glassBase('light')}
                >
                    <GlassSheen />
                    <div className="grid grid-cols-2 gap-2 relative z-10">
                        {filterElements.map((item) => (
                            <div key={item.key} className={item.span2 ? "col-span-2" : "col-span-1"}>
                                {item.el}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-1 relative z-10">
                        <button
                            type="button"
                            onClick={onClearFilters}
                            disabled={!hasActiveFilters}
                            style={hasActiveFilters ? { ...glassBase('light'), borderRadius: 10 } : {}}
                            className={`
                                relative overflow-hidden flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 transition-all duration-200 border-none bg-transparent
                                ${hasActiveFilters
                                    ? 'text-red-500 active:scale-95'
                                    : 'text-slate-400 pointer-events-none'
                                }
                            `}
                        >
                            {hasActiveFilters && <GlassSheen />}
                            <Icon name="filter_alt_off" size="xs" className="relative z-10" />
                            <span className="relative z-10">Limpiar filtros</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

