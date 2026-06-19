import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
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

export const MobileMaquinaFilterBar = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  areas = [],
  onClearFilters,
  totalResults = 0
}) => {
  const handleSelectChange = (field, value) => {
    onFilterChange({ [field]: value, page: 1 });
  };

  const activeFiltersCount = [
    filters.planta,
    filters.area,
    filters.criticidad,
    filters.estado
  ].filter(Boolean).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" placement="bottom">
      <ModalHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Icon name="filter_list" className="text-marca-primario" />
            <span className="text-base font-black uppercase text-slate-800 tracking-tight">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-marca-primario text-white text-[10px] font-black rounded-full px-2 py-0.5 shadow-sm">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                onClearFilters();
                onClose();
              }}
              className="text-xs font-bold text-marca-primario hover:underline"
            >
              Limpiar todo
            </button>
          )}
        </div>
      </ModalHeader>
      
      <ModalBody className="p-4 space-y-4">
        {/* Planta */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Planta / Piso</label>
          <Select
            icon="store"
            value={filters.planta || ''}
            onChange={(e) => handleSelectChange('planta', e.target.value)}
            onClear={() => handleSelectChange('planta', '')}
            className="text-sm font-semibold uppercase"
          >
            <option value="">Todas las plantas...</option>
            {PLANTAS_MAQUINARIA.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </div>

        {/* Área */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Área / Ubicación</label>
          <Select
            icon="location_on"
            value={filters.area || ''}
            onChange={(e) => handleSelectChange('area', e.target.value)}
            onClear={() => handleSelectChange('area', '')}
            disabled={areas.length === 0}
            className="text-sm font-semibold uppercase"
          >
            <option value="">Todas las áreas...</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
        </div>

        {/* Criticidad */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Criticidad</label>
          <Select
            icon="priority_high"
            value={filters.criticidad || ''}
            onChange={(e) => handleSelectChange('criticidad', e.target.value)}
            onClear={() => handleSelectChange('criticidad', '')}
            className="text-sm font-semibold uppercase"
          >
            <option value="">Todas las criticidades...</option>
            {CRITICIDADES_MAQUINARIA.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Estado Operativo</label>
          <Select
            icon="settings"
            value={filters.estado || ''}
            onChange={(e) => handleSelectChange('estado', e.target.value)}
            onClear={() => handleSelectChange('estado', '')}
            className="text-sm font-semibold uppercase"
          >
            <option value="">Todos los estados...</option>
            {ESTADOS_MAQUINARIA.map((est) => (
              <option key={est.value} value={est.value}>{est.label}</option>
            ))}
          </Select>
        </div>
      </ModalBody>

      <ModalFooter className="p-4 bg-slate-50 flex gap-3">
        <Button
          variant="secondary"
          onClick={onClose}
          className="flex-1 font-bold text-xs uppercase"
        >
          Cerrar
        </Button>
        <Button
          onClick={onClose}
          className="flex-1 bg-marca-primario hover:bg-marca-primario-oscuro text-white font-bold text-xs uppercase"
        >
          Ver ({totalResults}) Máquinas
        </Button>
      </ModalFooter>
    </Modal>
  );
};
