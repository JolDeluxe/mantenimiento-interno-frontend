import React, { useState, useEffect } from 'react';
import { Icon, Button, SearchableSelect } from '@/components/ui/z_index';
import { useQrPrintStore } from '../stores/qr-print-store';

const ESTADOS_MAQUINARIA = [
  { value: 'OPERATIVA', label: 'OPERATIVA' },
  { value: 'EN_REPARACION', label: 'EN REPARACIÓN' },
  { value: 'INACTIVA', label: 'INACTIVA' },
  { value: 'BAJA', label: 'DE BAJA' }
];

const CRITICIDADES_MAQUINARIA = [
  { value: 'A', label: 'CLASE A' },
  { value: 'B', label: 'CLASE B' },
  { value: 'C', label: 'CLASE C' }
];

const normalizeOpts = (opts = []) => opts.map(o => {
  if (typeof o === 'string') return { value: o, label: o };
  return { value: String(o.value ?? o.id), label: String(o.label ?? o.nombre) };
});

const SearchInput = ({ localValue, onChange, onClear, className = "w-full" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
      <Icon name="search" size="sm" className="text-slate-400" />
    </div>
    <input
      type="text"
      value={localValue}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Buscar por código o nombre..."
      className="w-full pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                 focus:outline-none focus:ring-2 focus:ring-marca-secundario/20
                 focus:border-marca-secundario transition-all placeholder:text-slate-400 h-9.5"
    />
    {localValue && (
      <button
        onClick={onClear}
        className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400 cursor-pointer"
      >
        <Icon name="close" size="xs" />
      </button>
    )}
  </div>
);

export const MaquinaFilterBar = ({
  filters,
  onFilterChange,
  catalogs = { plantas: [], areas: [], procesos: [] },
  onClearFilters,
  onAddNewClick
}) => {
  const [localValue, setLocalValue] = useState(filters.q || '');
  const { isPrintMode, togglePrintMode } = useQrPrintStore();

  useEffect(() => {
    setLocalValue(filters.q || '');
  }, [filters.q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== (filters.q || '')) {
        onFilterChange({ q: localValue, page: 1 });
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [localValue, filters.q, onFilterChange]);

  const hasActiveFilters = Boolean(
    filters.q || filters.planta || filters.area || filters.criticidad || filters.estado || filters.proceso
  );

  return (
    <div className="flex flex-col gap-3 w-full pt-2">
      <div className="flex items-center gap-3 w-full">
        <SearchInput
          localValue={localValue}
          onChange={setLocalValue}
          onClear={() => setLocalValue('')}
          className="flex-1 max-w-md min-w-[180px]"
        />

        <div className="flex items-center gap-3 flex-none ml-auto">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onClearFilters}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold shrink-0 self-center"
            >
              <Icon name="filter_alt_off" className="mr-1" size="sm" />
              Limpiar
            </Button>
          )}

          <button
            type="button"
            onClick={togglePrintMode}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-sm border transition-all cursor-pointer h-9.5 active:scale-95 uppercase tracking-wide ${
              isPrintMode
                ? 'bg-amber-600 border-amber-600 hover:bg-amber-700 text-white font-black'
                : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            <Icon name={isPrintMode ? 'print_disabled' : 'print'} size="sm" className="shrink-0" />
            {isPrintMode ? 'Salir Impresión' : 'Impresión'}
          </button>

          {onAddNewClick && (
            <Button
              onClick={onAddNewClick}
              className="bg-marca-primario hover:bg-marca-primario-oscuro text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm shrink-0 flex items-center gap-2 uppercase tracking-wide h-9.5"
            >
              <Icon name="add" size="sm" />
              Añadir Máquina
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full flex-wrap">
        <div className="min-w-40 flex-1 lg:flex-none">
          <SearchableSelect
            options={normalizeOpts(catalogs.plantas)}
            value={filters.planta || ''}
            onChange={(val) => onFilterChange({ planta: val, area: '', page: 1 })}
            placeholder="PLANTA..."
            icon="domain"
            allOptionText="TODAS"
            className="w-full font-bold text-[11px] uppercase tracking-wide"
          />
        </div>

        <div className="min-w-40 flex-1 lg:flex-none">
          <SearchableSelect
            options={normalizeOpts(catalogs.areas)}
            value={filters.area || ''}
            onChange={(val) => onFilterChange({ area: val, page: 1 })}
            placeholder="ÁREA..."
            icon="place"
            allOptionText="TODAS"
            disabled={catalogs.areas.length === 0}
            className="w-full font-bold text-[11px] uppercase tracking-wide"
          />
        </div>

        <div className="min-w-40 flex-1 lg:flex-none">
          <SearchableSelect
            options={normalizeOpts(catalogs.procesos)}
            value={filters.proceso || ''}
            onChange={(val) => onFilterChange({ proceso: val, page: 1 })}
            placeholder="PROCESO / TIPO..."
            icon="build"
            allOptionText="TODOS"
            className="w-full font-bold text-[11px] uppercase tracking-wide"
          />
        </div>

        <div className="min-w-40 flex-1 lg:flex-none">
          <SearchableSelect
            options={CRITICIDADES_MAQUINARIA}
            value={filters.criticidad || ''}
            onChange={(val) => onFilterChange({ criticidad: val, page: 1 })}
            placeholder="CRITICIDAD..."
            icon="priority_high"
            allOptionText="TODAS"
            className="w-full font-bold text-[11px] uppercase tracking-wide"
          />
        </div>

        <div className="min-w-40 flex-1 lg:flex-none">
          <SearchableSelect
            options={ESTADOS_MAQUINARIA}
            value={filters.estado || ''}
            onChange={(val) => onFilterChange({ estado: val, page: 1 })}
            placeholder="ESTADO..."
            icon="settings"
            allOptionText="TODOS"
            className="w-full font-bold text-[11px] uppercase tracking-wide"
          />
        </div>
      </div>
    </div>
  );
};
