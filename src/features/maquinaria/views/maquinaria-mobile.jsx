import React, { useState, useMemo } from 'react';
import { Icon, GlassPaginationPill, GlassFab, ScrollToTopButton } from '@/components/ui/z_index';
import { TicketsEmptyState } from '@/features/common/components/tickets-empty-state';
import { MobileMaquinaFilterBar, MaquinaFormModal, MaquinaDetailModal, MaquinaCard } from '../components';
import { hardReload } from '@/utils/hard-reload';
import { cn } from '@/utils/cn';

const SkeletonCard = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
    <div className="flex items-center justify-between">
      <div className="h-3 w-16 bg-slate-100 animate-pulse rounded" />
      <div className="h-4 w-12 bg-slate-100 animate-pulse rounded" />
    </div>
    <div className="h-4 w-3/4 bg-slate-100 animate-pulse rounded" />
    <div className="h-3 w-1/2 bg-slate-100 animate-pulse rounded" />
  </div>
);

export default function MaquinariaMobile({
  maquinas = [],
  loading = false,
  submitting = false,
  pagination = {},
  filters = {},
  catalogs = { plantas: [], areas: [], procesos: [] },
  onFilterChange,
  onClearFilters,
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

  const hasPaginator = !loading && pagination.totalPages > 1;
  const baseBottom = hasPaginator ? 104 : 84;
  const fabRefreshBottom = `${baseBottom}px`;

  return (
    <>
      <div className={cn("flex flex-col gap-4 px-1 animate-in fade-in duration-200", hasPaginator ? "pb-36" : "pb-28")}>
        
        {/* Encabezado */}
        <div className="px-1 mb-4">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos uppercase">
            Catálogo de Maquinaria
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium leading-snug">
            Listado de maquinaria registrada. Cualquier modificación se realiza directamente desde MAGNUS.
          </p>
        </div>

        {/* Barra de Filtros In-place (Mobile) */}
        <MobileMaquinaFilterBar
          filters={filters}
          onFilterChange={onFilterChange}
          catalogs={catalogs}
          onClearFilters={onClearFilters}
        />

        {/* Lista de Tarjetas */}
        <div className="flex flex-col gap-3 pt-1">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : maquinas.length > 0 ? (
            maquinas.map((m) => (
              <MaquinaCard
                key={m.id}
                maquina={m}
                onViewDetail={handleOpenDetail}
                onEdit={handleOpenEdit}
              />
            ))
          ) : (
            <TicketsEmptyState
              isMobile={true}
              isFiltering={Object.keys(filters).some(k => filters[k] !== '' && k !== 'page' && k !== 'limit')}
              mensaje="Sin maquinaria"
              subtexto="No se encontraron máquinas con los filtros aplicados."
              icon="precision_manufacturing"
            />
          )}
        </div>
      </div>

      {/* Floating Pagination Pill (Mobile) */}
      {hasPaginator && (
        <div className="lg:hidden">
          <GlassPaginationPill
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={(page) => onFilterChange({ page })}
            loading={loading}
            bottom="80px"
          />
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="lg:hidden">
        <GlassFab
          icon="refresh"
          onClick={hardReload}
          isLoading={loading}
          variant="neutral"
          size={50}
          bottom={fabRefreshBottom}
          right="20px"
        />
      </div>

      {/* Scroll to Top */}
      <div className="lg:hidden">
        <ScrollToTopButton bottom={`${baseBottom}px`} left="20px" />
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

    </>
  );
}