import React from 'react';
import { Icon, Button } from '@/components/ui/z_index';
import { Select, Input } from '@/components/form/z_index';

const ESTADOS_MAQUINARIA = [
  { value: 'OPERATIVA', label: 'Operativa' },
  { value: 'EN_REPARACION', label: 'En Reparación' },
  { value: 'INACTIVA', label: 'Inactiva' },
  { value: 'BAJA', label: 'De Baja' }
];

const CRITICIDADES_MAQUINARIA = [
  { value: 'A', label: 'Clase A (Crítica)' },
  { value: 'B', label: 'Clase B (Media)' },
  { value: 'C', label: 'Clase C (Baja)' }
];

const PLANTAS_MAQUINARIA = [
  { value: 'Planta Baja', label: 'Planta Baja' },
  { value: 'Planta Alta', label: 'Planta Alta' }
];

export const MaquinaFilterBar = ({
  filters,
  onFilterChange,
  areas = [],
  onClearFilters,
  onAddNewClick
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-200">
      
      {/* Inputs y Selects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex flex-1 items-center gap-3">
        
        {/* Buscador por Texto */}
        <div className="flex flex-col gap-1 min-w-[200px] flex-1">
          <Input
            icon="search"
            placeholder="Buscar por código o nombre..."
            value={filters.q || ''}
            onChange={(e) => onFilterChange({ q: e.target.value, page: 1 })}
            className="text-xs font-semibold"
          />
        </div>

        {/* Filtro Planta */}
        <div className="flex flex-col gap-1 min-w-[150px]">
          <Select
            icon="store"
            value={filters.planta || ''}
            onChange={(e) => onFilterChange({ planta: e.target.value, page: 1 })}
            onClear={() => onFilterChange({ planta: '', page: 1 })}
            className="text-xs font-bold uppercase tracking-wide"
          >
            <option value="">Planta (Todas)...</option>
            {PLANTAS_MAQUINARIA.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </div>

        {/* Filtro Área */}
        <div className="flex flex-col gap-1 min-w-[150px]">
          <Select
            icon="location_on"
            value={filters.area || ''}
            onChange={(e) => onFilterChange({ area: e.target.value, page: 1 })}
            onClear={() => onFilterChange({ area: '', page: 1 })}
            disabled={areas.length === 0}
            className="text-xs font-bold uppercase tracking-wide"
          >
            <option value="">Área (Todas)...</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
        </div>

        {/* Filtro Criticidad */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <Select
            icon="priority_high"
            value={filters.criticidad || ''}
            onChange={(e) => onFilterChange({ criticidad: e.target.value, page: 1 })}
            onClear={() => onFilterChange({ criticidad: '', page: 1 })}
            className="text-xs font-bold uppercase tracking-wide"
          >
            <option value="">Criticidad...</option>
            {CRITICIDADES_MAQUINARIA.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
        </div>

        {/* Filtro Estado */}
        <div className="flex flex-col gap-1 min-w-[150px]">
          <Select
            icon="settings"
            value={filters.estado || ''}
            onChange={(e) => onFilterChange({ estado: e.target.value, page: 1 })}
            onClear={() => onFilterChange({ estado: '', page: 1 })}
            className="text-xs font-bold uppercase tracking-wide"
          >
            <option value="">Estado (Todos)...</option>
            {ESTADOS_MAQUINARIA.map((est) => (
              <option key={est.value} value={est.value}>{est.label}</option>
            ))}
          </Select>
        </div>

        {/* Botón de limpiar filtros si hay alguno activo */}
        {(filters.q || filters.planta || filters.area || filters.criticidad || filters.estado) && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold shrink-0 self-center"
          >
            <Icon name="filter_alt_off" className="mr-1" size="sm" />
            Limpiar
          </Button>
        )}

      </div>

      {/* Botón Agregar Máquina (Para admin roles) */}
      {onAddNewClick && (
        <Button
          onClick={onAddNewClick}
          className="bg-marca-primario hover:bg-marca-primario-oscuro text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm shrink-0 flex items-center gap-2 self-start md:self-center uppercase tracking-wide"
        >
          <Icon name="add" size="sm" />
          Añadir Máquina
        </Button>
      )}

    </div>
  );
};
