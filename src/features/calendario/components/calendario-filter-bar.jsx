// src/features/calendario/components/calendario-filter-bar.jsx
import { useState, useEffect } from 'react';
import { Icon, Button, SearchableSelect } from '@/components/ui/z_index';
import { Input } from '@/components/form/z_index';
import { TIPOS, PRIORIDADES, CLASIFICACIONES, PLANTAS, AREAS, AREAS_POR_PLANTA, CATEGORIAS_EQUIPO } from '@/features/common/constants/catalogos-tareas';

const SCOPE_OPTIONS = [
    { value: 'general', label: 'Todas las Tareas' },
    { value: 'mantenimientos', label: 'Mantenimientos' },
    { value: 'actividades', label: 'Actividades' }
];

const normalizeOpts = (opts = []) =>
    opts.map((o) => {
        if (typeof o === 'string') return { value: o, label: o };
        return { value: String(o.value ?? o.id), label: String(o.label ?? o.nombre) };
    });

export const CalendarioFilterBar = ({
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
    isFiltering = false
}) => {
    const [localQuery, setLocalQuery] = useState(query);

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

    const activeAreas = filtroPlanta ? (AREAS_POR_PLANTA[filtroPlanta] || []) : AREAS;

    const ESTADOS = [
        { value: 'PENDIENTE', label: 'Pendiente' },
        { value: 'ASIGNADA', label: 'Asignada' },
        { value: 'EN_PROGRESO', label: 'En Progreso / Proceso' },
        { value: 'EN_PAUSA', label: 'En Pausa' },
        { value: 'RESUELTO', label: 'Resuelto' },
        { value: 'RECHAZADO', label: 'Rechazado' },
        { value: 'CANCELADA', label: 'Cancelado' }
    ];

    return (
        <div className="flex flex-col gap-3 w-full pt-2">
            {/* Fila 1: Búsqueda, Selector de Scope, Estado y Botón de Limpiar */}
            <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
                {/* Caja de Búsqueda */}
                <div className="relative flex-1 w-full">
                    <Input
                        type="text"
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                        placeholder="Buscar por título, máquina o descripción..."
                        className="pl-9 h-9.5 rounded-2xl w-full"
                        icon="search"
                    />
                </div>

                {/* Selector de Scope (Filtro Principal) */}
                <div className="w-full md:w-56 shrink-0">
                    <SearchableSelect
                        options={SCOPE_OPTIONS}
                        value={scope === 'general' ? '' : scope}
                        onChange={(val) => onScopeChange(val || 'general')}
                        placeholder="Todas las Tareas"
                        icon="assignment"
                        allOptionText="Todas las Tareas"
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                    />
                </div>

                {/* Selector de Estado */}
                <div className="w-full md:w-52 shrink-0">
                    <SearchableSelect
                        options={ESTADOS}
                        value={filtroEstado === 'TODOS' ? '' : filtroEstado}
                        onChange={(val) => onFilterChange(val || 'TODOS')}
                        placeholder="Todos los Estados"
                        icon="swap_horiz"
                        allOptionText="Todos los Estados"
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                        menuClassName="left-auto right-0 w-72 max-w-[calc(100vw-2rem)] z-[80]"
                    />
                </div>

                {/* Botón Limpiar Filtros */}
                {isFiltering && (
                    <Button
                        variant="gris"
                        size="sm"
                        onClick={onClearFilters}
                        className="w-full md:w-auto px-4 py-2 text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 h-9.5 rounded-2xl"
                    >
                        <Icon name="filter_alt_off" size="xs" /> Limpiar
                    </Button>
                )}
            </div>

            {/* Fila 2: Filtros Estructurales */}
            <div className="flex items-start gap-2.5 w-full flex-wrap">
                {/* Planta */}
                <div className="min-w-40 flex-1 lg:flex-none">
                    <SearchableSelect
                        options={normalizeOpts(PLANTAS)}
                        value={filtroPlanta}
                        onChange={(val) => {
                            onPlantaChange(val);
                            onAreaChange('');
                        }}
                        placeholder="PLANTA..."
                        icon="domain"
                        allOptionText="TODAS"
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                    />
                </div>

                {/* Área */}
                <div className="min-w-40 flex-1 lg:flex-none">
                    <SearchableSelect
                        options={normalizeOpts(activeAreas)}
                        value={filtroArea}
                        onChange={onAreaChange}
                        placeholder="ÁREA..."
                        icon="location_on"
                        allOptionText="TODAS"
                        disabled={activeAreas.length === 0}
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                    />
                </div>

                {/* Prioridad */}
                <div className="min-w-40 flex-1 lg:flex-none">
                    <SearchableSelect
                        options={PRIORIDADES}
                        value={filtroPrioridad}
                        onChange={onPrioridadChange}
                        placeholder="PRIORIDAD..."
                        icon="flag"
                        allOptionText="TODAS"
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                    />
                </div>

                {/* Técnico Responsable */}
                <div className="min-w-48 flex-1 lg:flex-none">
                    <SearchableSelect
                        options={normalizeOpts(tecnicos)}
                        value={filtroResponsable}
                        onChange={onResponsableChange}
                        placeholder="TÉCNICO..."
                        icon="engineering"
                        allOptionText="TODOS"
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                    />
                </div>

                {/* Categoría */}
                <div className="min-w-40 flex-1 lg:flex-none">
                    <SearchableSelect
                        options={CATEGORIAS_EQUIPO}
                        value={filtroCategoria}
                        onChange={onCategoriaChange}
                        placeholder="CATEGORÍA..."
                        icon="category"
                        allOptionText="TODAS"
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                    />
                </div>

                {/* Clasificación */}
                <div className="min-w-40 flex-1 lg:flex-none">
                    <SearchableSelect
                        options={CLASIFICACIONES}
                        value={filtroClasificacion}
                        onChange={onClasificacionChange}
                        placeholder="CLASIFICACIÓN..."
                        icon="build"
                        allOptionText="TODAS"
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                    />
                </div>
            </div>
        </div>
    );
};

