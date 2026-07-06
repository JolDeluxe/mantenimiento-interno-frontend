import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';

const ESTADOS_MAQUINARIA = [
  { value: 'OPERATIVA', label: 'OPERATIVA' },
  { value: 'PARO_PRODUCCION', label: 'PARO PRODUCCIÓN' },
  { value: 'EN_REPARACION', label: 'EN REPARACIÓN' },
  { value: 'INACTIVA', label: 'INACTIVA' },
  { value: 'BAJA', label: 'DE BAJA' }
];

const CRITICIDADES_MAQUINARIA = [
  { value: 'A', label: 'CLASE A' },
  { value: 'B', label: 'CLASE B' },
  { value: 'C', label: 'CLASE C' }
];

const normalizeOpts = (opts = []) =>
  opts.map(o =>
    typeof o === 'string'
      ? { value: o, label: o }
      : { value: String(o.value ?? o.id), label: String(o.label ?? o.nombre) }
  );

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
      placeholder="Buscar por código o nombre..."
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

const GlassNativeSelect = ({ icon, placeholder, options, value, onChange, disabled }) => {
  const selected = options.find((o) => o.value === String(value));
  const isActive = Boolean(value);

  return (
    <div className="relative w-full h-9.5">
      <select
        value={value ? String(value) : ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`absolute inset-0 w-full h-full opacity-0 z-20 appearance-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div
        style={
          disabled
            ? { ...glassBase('light'), borderRadius: 12, opacity: 0.5 }
            : isActive
            ? { ...glassBase('primary'), borderRadius: 12 }
            : { ...glassBase('light'), borderRadius: 12 }
        }
        className={`
          absolute inset-0 flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all duration-200 pointer-events-none overflow-hidden
          ${isActive && !disabled ? 'text-white' : 'text-slate-600'}
        `}
      >
        {!disabled && <GlassSheen />}
        <Icon name={icon} size="xs" className="relative shrink-0 z-10" />
        <span className="relative flex-1 truncate z-10">
          {selected?.label ?? placeholder}
        </span>

        {isActive && !disabled ? (
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

export const MobileMaquinaFilterBar = ({
  filters,
  onFilterChange,
  catalogs = { plantas: [], areas: [], procesos: [] },
  onClearFilters
}) => {
  const [localValue, setLocalValue] = useState(filters.q || '');
  const [showFilters, setShowFilters] = useState(false);

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
    filters.planta || filters.area || filters.criticidad || filters.estado || filters.proceso
  );

  const activeFiltersCount = [
    filters.planta,
    filters.area,
    filters.criticidad,
    filters.estado,
    filters.proceso
  ].filter(Boolean).length;

  return (
    <div className="w-full flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5 overflow-x-hidden">
        <SearchInput
          localValue={localValue}
          onChange={setLocalValue}
          onClear={() => setLocalValue('')}
          className="flex-1 min-w-[90px]"
        />

        {/* Botón de Toggle Filtros */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          style={showFilters || hasActiveFilters ? { ...glassBase('primary'), borderRadius: 14 } : { ...glassBase('light'), borderRadius: 14 }}
          className={`
            relative overflow-hidden flex items-center justify-center w-[38px] h-[38px] shrink-0 transition-all duration-200 active:scale-95
            ${showFilters || hasActiveFilters ? 'text-white' : 'text-slate-600'}
          `}
        >
          <GlassSheen />
          <Icon name="filter_alt" size="sm" className="relative z-10" />
          {hasActiveFilters && !showFilters && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-marca-acento text-white text-[9px] font-extrabold leading-none border-2 border-white shadow-md z-20">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Menú de filtros desplegable */}
      {showFilters && (
        <div
          className="flex flex-col gap-3 p-3 rounded-[20px] relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={glassBase('light')}
        >
          <GlassSheen />
          <div className="grid grid-cols-2 gap-2 relative z-10">
            <div className="col-span-1">
              <GlassNativeSelect
                icon="domain"
                placeholder="Planta"
                options={normalizeOpts(catalogs.plantas)}
                value={filters.planta}
                onChange={(val) => onFilterChange({ planta: val, area: '', page: 1 })}
              />
            </div>
            <div className="col-span-1">
              <GlassNativeSelect
                icon="place"
                placeholder="Área"
                options={normalizeOpts(catalogs.areas)}
                value={filters.area}
                disabled={catalogs.areas.length === 0}
                onChange={(val) => onFilterChange({ area: val, page: 1 })}
              />
            </div>
            <div className="col-span-2">
              <GlassNativeSelect
                icon="build"
                placeholder="Proceso / Tipo"
                options={normalizeOpts(catalogs.procesos)}
                value={filters.proceso}
                onChange={(val) => onFilterChange({ proceso: val, page: 1 })}
              />
            </div>
            <div className="col-span-1">
              <GlassNativeSelect
                icon="priority_high"
                placeholder="Criticidad"
                options={CRITICIDADES_MAQUINARIA}
                value={filters.criticidad}
                onChange={(val) => onFilterChange({ criticidad: val, page: 1 })}
              />
            </div>
            <div className="col-span-1">
              <GlassNativeSelect
                icon="settings"
                placeholder="Estado"
                options={ESTADOS_MAQUINARIA}
                value={filters.estado}
                onChange={(val) => onFilterChange({ estado: val, page: 1 })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1 relative z-10">
            <button
              type="button"
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              style={hasActiveFilters ? { ...glassBase('light'), borderRadius: 10 } : {}}
              className={`
                relative overflow-hidden flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 transition-all duration-200
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
