import React, { useState, useMemo } from 'react';
import { Icon, Table, Pagination, Badge, Tooltip } from '@/components/ui/z_index';
import { MaquinaFilterBar, MaquinaFormModal, MaquinaStatusModal, MaquinaDetailModal } from '../components';

export default function MaquinariaDesktop({
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
  const [selectedMaquina, setSelectedMaquina] = useState(null);

  // Extraer lista única de áreas registradas para alimentar el selector de filtros
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

  // Definir columnas de la tabla
  const columns = [
    {
      header: 'Código',
      accessorKey: 'codigo',
      headerClassName: 'w-[10%] min-w-[90px]',
      cell: (row) => (
        <span className="font-mono font-black text-xs text-slate-500 uppercase tracking-tight">
          {row.codigo}
        </span>
      )
    },
    {
      header: 'Nombre de Máquina',
      accessorKey: 'nombre',
      headerClassName: 'w-[25%] min-w-[200px]',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-slate-800 text-sm leading-tight">
            {row.nombre}
          </span>
          {row.numeroSerie && (
            <span className="text-[10px] font-bold text-slate-400 mt-0.5">
              S/N: {row.numeroSerie}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Proceso / Tipo',
      accessorKey: 'proceso',
      headerClassName: 'w-[15%] min-w-[130px]',
      cell: (row) => (
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200/50 px-2.5 py-0.5 rounded-full uppercase">
          {row.proceso}
        </span>
      )
    },
    {
      header: 'Ubicación',
      accessorKey: 'ubicacion',
      headerClassName: 'w-[20%] min-w-[180px]',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
            <Icon name="store" size="xxs" className="text-slate-400" />
            {row.planta}
          </span>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Icon name="location_on" size="xxs" className="text-slate-300" />
            {row.area}
          </span>
        </div>
      )
    },
    {
      header: 'Criticidad',
      accessorKey: 'criticidad',
      align: 'center',
      headerClassName: 'w-[10%] min-w-[80px]',
      cell: (row) => {
        const styles = {
          A: 'bg-rose-500/10 text-rose-700 border-rose-500/30',
          B: 'bg-orange-500/10 text-orange-700 border-orange-500/30',
          C: 'bg-blue-500/10 text-blue-700 border-blue-500/30'
        };
        const cls = styles[row.criticidad] || 'bg-slate-100 text-slate-700 border-slate-200';
        return (
          <span className={`inline-flex items-center justify-center font-black text-xs px-2.5 py-0.5 rounded border uppercase tracking-wider ${cls}`}>
            {row.criticidad}
          </span>
        );
      }
    },
    {
      header: 'Estado',
      accessorKey: 'estado',
      align: 'center',
      headerClassName: 'w-[10%] min-w-[100px]',
      cell: (row) => {
        const styles = {
          OPERATIVA: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
          EN_REPARACION: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
          INACTIVA: 'bg-slate-500/10 text-slate-700 border-slate-500/30',
          BAJA: 'bg-red-500/10 text-red-700 border-red-500/30'
        };
        const cls = styles[row.estado] || 'bg-slate-100 text-slate-700 border-slate-200';
        const label = row.estado === 'EN_REPARACION' ? 'REPARACIÓN' : row.estado;
        return (
          <span className={`inline-flex items-center justify-center font-black text-[10px] px-2.5 py-0.5 rounded border uppercase tracking-wider ${cls}`}>
            {label}
          </span>
        );
      }
    },
    {
      header: 'Acciones',
      accessorKey: 'acciones',
      align: 'center',
      headerClassName: 'w-[10%] min-w-[120px]',
      cell: (row) => (
        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          
          {/* Ficha / Detalle */}
          <Tooltip text="Ficha Técnica y KPIs">
            <button
              onClick={() => handleOpenDetail(row)}
              className="p-1.5 text-slate-400 hover:text-marca-primario hover:bg-marca-primario/5 rounded-lg transition-colors"
            >
              <Icon name="visibility" size="sm" />
            </button>
          </Tooltip>

          {/* Editar */}
          <Tooltip text="Editar Información">
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Icon name="edit" size="sm" />
            </button>
          </Tooltip>

          {/* Cambiar Estado */}
          <Tooltip text="Cambiar Estado Operativo">
            <button
              onClick={() => handleOpenStatus(row)}
              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <Icon name="swap_horiz" size="sm" />
            </button>
          </Tooltip>

        </div>
      )
    }
  ];

  const handleSaveForm = async (payload) => {
    if (selectedMaquina) {
      return await updateMaquina(selectedMaquina.id, payload);
    } else {
      return await createMaquina(payload);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-1 animate-in fade-in duration-200">
      
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-marca-primario/10 rounded-lg">
              <Icon name="precision_manufacturing" size="sm" className="text-marca-primario" />
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Catálogo de Maquinaria
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Expedientes técnicos, indicadores de fiabilidad y estado operativo de equipos de producción.
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <MaquinaFilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        areas={areasDisponibles}
        onClearFilters={onClearFilters}
        onAddNewClick={handleOpenCreate}
      />

      {/* Tabla de Resultados */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <Table
          data={loading ? Array.from({ length: 6 }).map((_, i) => ({ isSkeleton: true, id: i })) : maquinas}
          columns={columns}
          loading={loading}
          emptyText="No se encontraron máquinas con los filtros seleccionados."
          onRowClick={handleOpenDetail}
        />
      </div>

      {/* Paginación */}
      {!loading && pagination.pages > 1 && (
        <div className="flex justify-center mt-2">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(page) => onFilterChange({ page })}
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

      {/* Modal Cambio Estado */}
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