import React, { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/z_index';
import { MaquinaFilterBar, MaquinaFormModal, MaquinaDetailModal, MaquinaTable } from '../components';

export default function MaquinariaDesktop({
  maquinas = [],
  loading = false,
  submitting = false,
  pagination = {},
  filters = {},
  catalogs = { plantas: [], areas: [], procesos: [] },
  onFilterChange,
  onClearFilters,
  createMaquina,
  updateMaquina,
  getKpis
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMaquina, setSelectedMaquina] = useState(null);

  const handleOpenEdit = (maquina) => {
    setSelectedMaquina(maquina);
    setFormOpen(true);
  };

  const handleOpenDetail = (maquina) => {
    setSelectedMaquina(maquina);
    setDetailOpen(true);
  };

  const handleSaveForm = async (payload) => {
    if (selectedMaquina) {
      return await updateMaquina(selectedMaquina.id, payload);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-1 animate-in fade-in duration-200">
      
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-md text-slate-400 font-medium">
            Listado de maquinaria registrada. Cualquier modificación se realiza directamente desde MAGNUS.
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <MaquinaFilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        catalogs={catalogs}
        onClearFilters={onClearFilters}
      />

      {/* Tabla de Resultados */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <MaquinaTable
          maquinas={maquinas}
          loading={loading}
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={(page) => onFilterChange({ page })}
          onViewDetail={handleOpenDetail}
          onEdit={handleOpenEdit}
        />
      </div>

      {/* Modal Formulario */}
      <MaquinaFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        maquina={selectedMaquina}
        onSave={handleSaveForm}
        submitting={submitting}
      />



      {/* Modal Detalle y KPIs */}
      <MaquinaDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        maquina={selectedMaquina}
        getKpis={getKpis}
      />

    </div>
  );
}