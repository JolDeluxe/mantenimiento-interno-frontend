// src/features/calendario/components/mobile-calendario-filter-bar.jsx
import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { TIPOS, PRIORIDADES, CLASIFICACIONES, PLANTAS, AREAS, AREAS_POR_PLANTA, CATEGORIAS_EQUIPO } from '@/features/tickets/constants';
import { cn } from '@/utils/cn';

const SCOPE_OPTIONS = [
    { value: 'general', label: 'Todas las Tareas' },
    { value: 'mantenimientos', label: 'Mantenimientos' },
    { value: 'actividades', label: 'Actividades' }
];

const normalizeOpts = (opts = []) => opts.map(o => {
    if (typeof o === 'string') return { value: o, label: o };
    return { value: String(o.value ?? o.id), label: String(o.label ?? o.nombre) };
});

const SearchInput = ({ localValue, onChange, onClear, className }) => (
    <div className={cn("relative h-[38px] flex-1", className)}>
        <input
            type="text"
            value={localValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar tarea..."
            className="w-full h-full bg-slate-100 text-xs font-semibold px-9 rounded-xl border-none outline-none text-slate-800 focus:bg-slate-200/50 transition-colors"
        />
        <Icon name="search" size="xs" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        {localValue && (
            <button
                type="button"
                onClick={onClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none p-0 cursor-pointer flex items-center"
            >
                <Icon name="close" size="xs" />
            </button>
        )}
    </div>
);

const GlassNativeSelect = ({ icon, placeholder, value, onChange, options }) => {
    const isActive = Boolean(value);
    const normalized = normalizeOpts(options);
    const selectedLabel = normalized.find(o => o.value === value)?.label || placeholder;

    return (
        <div className="relative w-full h-[42px]">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 z-20 appearance-none cursor-pointer"
            >
                <option value="">{placeholder} (TODOS)</option>
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
                <span className="relative flex-1 truncate z-10 uppercase">
                    {selectedLabel}
                </span>
                <Icon name="arrow_drop_down" size="xs" className="relative shrink-0 z-10 opacity-70" />
            </div>
        </div>
    );
};

export const MobileCalendarioFilterBar = ({
    scope,
    onScopeChange,
    filtroEstado,
    onFilterChange,
    filtroTipo,
    onTipoChange,
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
    isFiltering = false
}) => {
    const [localQuery, setLocalQuery] = useState(query);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        setLocalQuery(query);
    }, [query]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localQuery !== query) {
                onSearchChange(localQuery);
            }
        }, 300);
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

    return (
        <div className="w-full flex flex-col gap-2">
            {/* Barra superior de controles rápidos */}
            <div className="flex items-center gap-1.5 w-full">
                <SearchInput
                    localValue={localQuery}
                    onChange={setLocalQuery}
                    onClear={() => setLocalQuery('')}
                    className="flex-grow"
                />

                {/* Botón de Filtros */}
                <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    style={isFiltering ? { ...glassBase('primary'), borderRadius: 14 } : { ...glassBase('light'), borderRadius: 14 }}
                    className={cn(
                        "relative overflow-hidden flex items-center justify-center w-[38px] h-[38px] shrink-0 transition-all active:scale-95",
                        isFiltering ? "text-white" : "text-slate-600"
                    )}
                >
                    <GlassSheen />
                    <Icon name="filter_alt" size="sm" className="relative z-10" />
                </button>
            </div>

            {/* Drawer/Cajón de Filtros Detallados */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm transition-opacity duration-300">
                    <div 
                        className="w-full max-h-[85vh] bg-white rounded-t-3xl p-5 shadow-2xl flex flex-col gap-4 animate-slide-up overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Cabecera del Drawer */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Icon name="filter_list" size="sm" className="text-slate-700" />
                                <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Filtros de Tarea</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDrawerOpen(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 border-none outline-none cursor-pointer"
                            >
                                <Icon name="close" size="xs" />
                            </button>
                        </div>

                        {/* Listado de Selects */}
                        <div className="flex flex-col gap-3.5">
                            {/* Scope Selector */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase pl-1">Tipo de Tarea</span>
                                <GlassNativeSelect
                                    icon="assignment"
                                    placeholder="Seleccionar tipo de tarea"
                                    options={SCOPE_OPTIONS}
                                    value={scope}
                                    onChange={(val) => onScopeChange(val || 'general')}
                                />
                            </div>

                            {/* Estado Selector */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase pl-1">Estado de Tarea</span>
                                <GlassNativeSelect
                                    icon="swap_horiz"
                                    placeholder="Estado"
                                    options={ESTADOS}
                                    value={filtroEstado === 'TODOS' ? '' : filtroEstado}
                                    onChange={(val) => onFilterChange(val || 'TODOS')}
                                />
                            </div>

                            {/* Planta */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase pl-1">Planta</span>
                                <GlassNativeSelect
                                    icon="domain"
                                    placeholder="Planta"
                                    options={normalizeOpts(PLANTAS)}
                                    value={filtroPlanta}
                                    onChange={handlePlantaChange}
                                />
                            </div>

                            {/* Área */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase pl-1">Área</span>
                                <GlassNativeSelect
                                    icon="place"
                                    placeholder="Área"
                                    options={normalizeOpts(areasDisponibles)}
                                    value={filtroArea}
                                    onChange={onAreaChange}
                                    disabled={areasDisponibles.length === 0}
                                />
                            </div>

                            {/* Prioridad */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase pl-1">Prioridad</span>
                                <GlassNativeSelect
                                    icon="flag"
                                    placeholder="Prioridad"
                                    options={PRIORIDADES}
                                    value={filtroPrioridad}
                                    onChange={onPrioridadChange}
                                />
                            </div>

                            {/* Técnico Responsable */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase pl-1">Técnico</span>
                                <GlassNativeSelect
                                    icon="person"
                                    placeholder="Técnico"
                                    options={normalizeOpts(tecnicos)}
                                    value={filtroResponsable}
                                    onChange={onResponsableChange}
                                />
                            </div>

                            {/* Categoría */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase pl-1">Categoría</span>
                                <GlassNativeSelect
                                    icon="category"
                                    placeholder="Categoría"
                                    options={CATEGORIAS_EQUIPO}
                                    value={filtroCategoria}
                                    onChange={onCategoriaChange}
                                />
                            </div>

                            {/* Clasificación */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase pl-1">Clasificación</span>
                                <GlassNativeSelect
                                    icon="build"
                                    placeholder="Clasificación"
                                    options={CLASIFICACIONES}
                                    value={filtroClasificacion}
                                    onChange={onClasificacionChange}
                                />
                            </div>
                        </div>

                        {/* Botones de acción del Drawer */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                            {isFiltering && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClearFilters();
                                        setDrawerOpen(false);
                                    }}
                                    className="flex-1 py-3 text-xs font-bold text-center text-slate-500 rounded-xl bg-slate-100 active:scale-95 transition-all border-none cursor-pointer"
                                >
                                    Limpiar
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setDrawerOpen(false)}
                                style={glassBase('primary')}
                                className="flex-grow py-3 text-xs font-bold text-center text-white rounded-xl active:scale-95 transition-all border-none cursor-pointer overflow-hidden relative"
                            >
                                <GlassSheen />
                                <span className="relative z-10">Aplicar Filtros</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
