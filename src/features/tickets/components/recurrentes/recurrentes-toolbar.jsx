import { useEffect, useMemo, useState } from 'react';
import { Button, Icon, SearchableSelect } from '@/components/ui/z_index';
import { AREAS, CATEGORIAS_EQUIPO } from '@/features/common/constants/catalogos-tareas';
import { normalizeOptions, UNIDADES_FRECUENCIA } from './recurrentes-utils';

const ESTADO_OPTIONS = [
    { value: 'true', label: 'Activas' },
    { value: 'false', label: 'Pausadas' },
];

const updateFilter = (filters, key, value) => ({
    ...filters,
    [key]: value,
});

const SearchInput = ({ localValue, onChange, onClear }) => (
    <div className="relative min-w-[180px] max-w-md flex-1">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="search" size="sm" className="text-slate-400" />
        </div>
        <input
            type="text"
            value={localValue}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Buscar regla, categoria, area o responsable"
            className="h-[38px] w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400 focus:border-marca-secundario focus:outline-none focus:ring-2 focus:ring-marca-secundario/20"
        />
        {localValue && (
            <button
                type="button"
                onClick={onClear}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400 hover:text-slate-600"
                aria-label="Limpiar busqueda"
            >
                <Icon name="close" size="xs" />
            </button>
        )}
    </div>
);

export const RecurrentesToolbar = ({
    query,
    onQueryChange,
    filters,
    onFiltersChange,
    tecnicos,
    onCreate,
    onRefresh,
    onClearFilters,
    loading,
    canManage,
}) => {
    const [localValue, setLocalValue] = useState(query || '');
    const responsableOptions = useMemo(() => normalizeOptions(tecnicos), [tecnicos]);
    const areaOptions = useMemo(() => normalizeOptions(AREAS), []);
    const hasFilters = Boolean(
        query ||
        (filters.activo && filters.activo !== 'all') ||
        filters.incluirArchivadas ||
        filters.categoria ||
        filters.area ||
        filters.responsableId ||
        filters.unidad
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalValue(query || '');
    }, [query]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== query) onQueryChange(localValue);
        }, 450);
        return () => clearTimeout(timer);
    }, [localValue, onQueryChange, query]);

    return (
        <div className="flex w-full min-w-0 flex-col gap-3 pt-1">
            <div className="flex w-full items-center gap-3">
                <SearchInput
                    localValue={localValue}
                    onChange={setLocalValue}
                    onClear={() => setLocalValue('')}
                />
                <div className="ml-auto flex flex-none items-center gap-3">
                    <Button
                        type="button"
                        variant="filtro_gris"
                        icon="refresh"
                        size="sm"
                        onClick={onRefresh}
                        disabled={loading}
                        className="h-9.5"
                    >
                        Actualizar
                    </Button>
                    {canManage && (
                        <Button type="button" variant="accion" icon="add" size="sm" onClick={onCreate} className="h-9.5">
                            Agregar actividad recurrente
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex w-full flex-wrap items-center gap-3">
                <div className="min-w-40 flex-none">
                    <SearchableSelect
                        options={ESTADO_OPTIONS}
                        value={filters.activo}
                        onChange={(value) => onFiltersChange(updateFilter(filters, 'activo', value || ''))}
                        placeholder="Estado"
                        icon="settings"
                        allOptionText="Todas"
                        className="w-full"
                    />
                </div>
                <div className="min-w-40 flex-none">
                    <SearchableSelect
                        options={CATEGORIAS_EQUIPO}
                        value={filters.categoria}
                        onChange={(value) => onFiltersChange(updateFilter(filters, 'categoria', value))}
                        placeholder="Categoria"
                        icon="label"
                        allOptionText="Todas"
                        className="w-full"
                    />
                </div>
                <div className="min-w-40 flex-none">
                    <SearchableSelect
                        options={areaOptions}
                        value={filters.area}
                        onChange={(value) => onFiltersChange(updateFilter(filters, 'area', value))}
                        placeholder="Area"
                        icon="place"
                        allOptionText="Todas las areas"
                        className="w-full"
                    />
                </div>
                <div className="min-w-40 flex-none">
                    <SearchableSelect
                        options={UNIDADES_FRECUENCIA}
                        value={filters.unidad}
                        onChange={(value) => onFiltersChange(updateFilter(filters, 'unidad', value))}
                        placeholder="Frecuencia"
                        icon="sync"
                        allOptionText="Todas"
                        className="w-full"
                    />
                </div>
                <div className="min-w-44 flex-none">
                    <SearchableSelect
                        options={responsableOptions}
                        value={filters.responsableId}
                        onChange={(value) => onFiltersChange(updateFilter(filters, 'responsableId', value))}
                        placeholder="Responsable"
                        icon="person"
                        allOptionText="Cualquiera"
                        className="w-full"
                    />
                </div>
                <Button
                    type="button"
                    variant="filtro_gris"
                    icon={filters.incluirArchivadas ? 'close' : 'archive'}
                    size="sm"
                    onClick={() => onFiltersChange(updateFilter(filters, 'incluirArchivadas', !filters.incluirArchivadas))}
                    className={`h-9.5 ${filters.incluirArchivadas ? 'bg-slate-700 text-white hover:bg-slate-800' : ''}`}
                >
                    Archivadas
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    icon="filter_alt_off"
                    size="sm"
                    onClick={onClearFilters}
                    disabled={!hasFilters}
                    className="h-9.5"
                >
                    Limpiar
                </Button>
            </div>
        </div>
    );
};
