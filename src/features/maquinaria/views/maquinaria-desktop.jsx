import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/z_index';
import { MaquinaFilterBar, MaquinaFormModal, MaquinaDetailModal, MaquinaTable } from '../components';
import { TicketsEmptyState } from '@/features/common/components/tickets-empty-state';
import { useQrPrintStore } from '../stores/qr-print-store';
import { getMaquinas } from '../api/maquinaria-api';

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
  const navigate = useNavigate();
  const { selectedMaquinas, selectAll, clearSelection, isPrintMode } = useQrPrintStore();

  const handleSelectAllSystem = async () => {
    try {
      const res = await getMaquinas({ limit: 1000 });
      const allIds = (res?.data || []).map(m => m.id);
      selectAll(allIds);
    } catch (err) {
      console.error('Error al seleccionar todas las máquinas:', err);
    }
  };

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
      <div className="flex items-center justify-between gap-4">
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

      {/* Barra de Selección Masiva de QR */}
      {isPrintMode && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-marca-primario/10 rounded-xl text-marca-primario">
              <Icon name="qr_code_2" size="sm" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Impresión de QR</span>
              <span className="text-xs font-extrabold text-slate-700 leading-none">
                {selectedMaquinas.length === 0
                  ? 'Ningún equipo seleccionado para impresión.'
                  : `${selectedMaquinas.length} ${selectedMaquinas.length === 1 ? 'equipo seleccionado' : 'equipos seleccionados'} para imprimir.`}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSelectAllSystem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Icon name="select_all" size="xs" className="shrink-0" />
              Seleccionar Todas ({pagination.total || 0})
            </button>
            
            {selectedMaquinas.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Icon name="deselect" size="xs" className="shrink-0" />
                  Limpiar Selección
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/maquinaria/imprimir-qr')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-marca-primario hover:bg-marca-primario-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                >
                  <Icon name="print" size="xs" className="shrink-0" />
                  Imprimir Seleccionadas ({selectedMaquinas.length})
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tabla de Resultados */}
      {!loading && maquinas.length === 0 ? (
        <TicketsEmptyState
          isMobile={false}
          isFiltering={Object.keys(filters).some(k => filters[k] !== '' && k !== 'page' && k !== 'limit')}
          mensaje="Sin maquinaria"
          subtexto="No se encontraron máquinas con los filtros aplicados."
          icon="precision_manufacturing"
        />
      ) : (
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
      )}

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