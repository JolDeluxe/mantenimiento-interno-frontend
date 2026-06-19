import React, { useState, useMemo } from 'react';
import { Icon, GlassFab, GlassPill, Spinner } from '@/components/ui/z_index';
import { Input } from '@/components/form/z_index';
import { MobileMaquinaFilterBar, MaquinaFormModal, MaquinaStatusModal, MaquinaDetailModal } from '../components';

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
  onFilterChange,
  onClearFilters,
  createMaquina,
  updateMaquina,
  changeStatus,
  getKpis
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedMaquina, setSelectedMaquina] = useState(null);

  // Extraer áreas únicas para los filtros móviles
  const areasDisponibles = useMemo(() => {
    const uniques = new Set(maquinas.map((m) => m.area).filter(Boolean));
    return Array.from(uniques).sort();
  }, [maquinas]);

  const handleOpenCreate = () => {
    setSelectedMaquina(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (maquina) => {
    setSelectedMaquina(maquina);
    setFormOpen(true);
  };

  const handleOpenStatus = (maquina) => {
    setSelectedMaquina(maquina);
    setStatusOpen(true);
  };

  const handleOpenDetail = (maquina) => {
    setSelectedMaquina(maquina);
    setDetailOpen(true);
  };

  const activeFiltersCount = [
    filters.planta,
    filters.area,
    filters.criticidad,
    filters.estado
  ].filter(Boolean).length;

  const getCriticidadStyle = (crit) => {
    const map = {
      A: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
      B: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
      C: 'bg-blue-500/10 text-blue-700 border-blue-500/20'
    };
    return map[crit] || 'bg-slate-100 text-slate-700';
  };

  const getEstadoStyle = (est) => {
    const map = {
      OPERATIVA: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
      EN_REPARACION: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
      INACTIVA: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
      BAJA: 'bg-red-500/10 text-red-700 border-red-500/20'
    };
    return map[est] || 'bg-slate-100 text-slate-700';
  };

  const handleSaveForm = async (payload) => {
    if (selectedMaquina) {
      return await updateMaquina(selectedMaquina.id, payload);
    } else {
      return await createMaquina(payload);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-28 px-1 animate-in fade-in duration-200">
      
      {/* Encabezado */}
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">
          Catálogo de Maquinaria
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Catálogo Técnico Oficial
        </p>
      </div>

      {/* Caja de Buscador + Botón Filtro */}
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <Input
            icon="search"
            placeholder="Buscar código o nombre..."
            value={filters.q || ''}
            onChange={(e) => onFilterChange({ q: e.target.value, page: 1 })}
            className="text-xs font-semibold"
          />
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          className={`h-[42px] px-3.5 border rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 ${
            activeFiltersCount > 0
              ? 'bg-marca-primario/10 border-marca-primario/30 text-marca-primario font-bold'
              : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <Icon name="filter_list" size="sm" />
          {activeFiltersCount > 0 && (
            <span className="bg-marca-primario text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Lista de Tarjetas */}
      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : maquinas.length > 0 ? (
          maquinas.map((m) => (
            <div
              key={m.id}
              onClick={() => handleOpenDetail(m)}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm active:bg-slate-50/50 transition-colors flex flex-col gap-3 relative"
            >
              
              {/* Renglón Superior: Código y Badges */}
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-[11px] text-slate-400 uppercase tracking-wider">
                  {m.codigo}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-black uppercase border px-2 py-0.5 rounded tracking-wide ${getCriticidadStyle(m.criticidad)}`}>
                    Clase {m.criticidad}
                  </span>
                  <span className={`text-[9px] font-black uppercase border px-2 py-0.5 rounded tracking-wide ${getEstadoStyle(m.estado)}`}>
                    {m.estado === 'EN_REPARACION' ? 'REPARACIÓN' : m.estado}
                  </span>
                </div>
              </div>

              {/* Título */}
              <div className="flex flex-col gap-0.5 pr-20">
                <span className="font-extrabold text-slate-800 text-sm leading-tight uppercase">
                  {m.nombre}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {m.proceso}
                </span>
              </div>

              {/* Renglón Inferior: Ubicación */}
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <Icon name="location_on" size="xxs" className="text-slate-400" />
                  {m.planta} — {m.area}
                </span>
                
                {/* Menú de Acciones Rápidas */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="p-1 text-slate-400 active:text-blue-600 active:bg-blue-50 rounded-lg"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                  <button
                    onClick={() => handleOpenStatus(m)}
                    className="p-1 text-slate-400 active:text-amber-600 active:bg-amber-50 rounded-lg"
                  >
                    <Icon name="swap_horiz" size="sm" />
                  </button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 italic bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <Icon name="search_off" className="mb-2 text-slate-300" size="lg" />
            No se encontraron máquinas.
          </div>
        )}
      </div>

      {/* Floating Action Button (Para SUPER_ADMIN, JEFE_MTTO, COORDINADOR_MTTO) */}
      <GlassFab
        icon="add"
        onClick={handleOpenCreate}
        isLoading={submitting}
        variant="primary"
        size={56}
        bottom="80px"
        right="20px"
      />

      {/* Modal Cajón de Filtros */}
      <MobileMaquinaFilterBar
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onFilterChange={onFilterChange}
        areas={areasDisponibles}
        onClearFilters={onClearFilters}
        totalResults={maquinas.length}
      />

      {/* Modal Formulario */}
      <MaquinaFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        maquina={selectedMaquina}
        onSave={handleSaveForm}
        submitting={submitting}
      />

      {/* Modal Cambio de Estado */}
      <MaquinaStatusModal
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        maquina={selectedMaquina}
        onChangeStatus={changeStatus}
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