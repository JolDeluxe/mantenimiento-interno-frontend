import React from 'react';
import { Table, Icon, TableActions, Skeleton } from '@/components/ui/z_index';
import { useQrPrintStore } from '../stores/qr-print-store';
import { formatDays, formatInteger, formatMinutes, formatPercent } from '../utils/bi-maquinaria-format';

const SelectionHeaderCheckbox = ({ maquinas, selectedMaquinas, selectAll }) => {
  const pageIds = (maquinas || []).filter(m => m && !m.isSkeleton).map(m => m.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedMaquinas.includes(id));
  
  const handleHeaderChange = () => {
    if (allPageSelected) {
      // Remover las IDs de la página actual del arreglo de selección
      const newSelection = selectedMaquinas.filter(id => !pageIds.includes(id));
      selectAll(newSelection);
    } else {
      // Agregar las IDs de la página actual sin duplicados
      const otherSelected = selectedMaquinas.filter(id => !pageIds.includes(id));
      selectAll([...otherSelected, ...pageIds]);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <input
        type="checkbox"
        checked={allPageSelected}
        onChange={handleHeaderChange}
        className="w-4 h-4 rounded border-slate-300 text-marca-primario focus:ring-marca-primario cursor-pointer"
      />
    </div>
  );
};

export const MaquinaTable = ({
  maquinas = [],
  loading = false,
  page,
  totalPages,
  totalItems,
  onPageChange,
  onViewDetail,
  onEdit,
  biSummaryById = {},
  biSummaryLoading = false
}) => {
  const { selectedMaquinas, toggleSelect, selectAll, isPrintMode } = useQrPrintStore();
  const getCriticidadStyle = (crit) => {
    const map = {
      A: 'bg-rose-50 text-rose-700 border-rose-200',
      B: 'bg-amber-50 text-amber-700 border-amber-200',
      C: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return map[crit] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getEstadoStyle = (est) => {
    const map = {
      OPERATIVA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      PARO_PRODUCCION: 'bg-red-50 text-red-700 border-red-200',
      EN_REPARACION: 'bg-amber-50 text-amber-700 border-amber-200',
      INACTIVA: 'bg-slate-50 text-slate-700 border-slate-200',
      BAJA: 'bg-rose-50 text-rose-700 border-rose-200',
      // BAJA: 'bg-red-50 text-red-700 border-red-200'
    };
    return map[est] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const columns = [
    {
      header: (
        <SelectionHeaderCheckbox
          maquinas={maquinas}
          selectedMaquinas={selectedMaquinas}
          selectAll={selectAll}
        />
      ),
      accessorKey: 'selection',
      align: 'center',
      headerClassName: 'w-[5%] min-w-[50px] text-center',
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-4 w-4 mx-auto rounded" />;
        const isSelected = selectedMaquinas.includes(row.id);
        return (
          <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleSelect(row.id)}
              className="w-4 h-4 rounded border-slate-300 text-marca-primario focus:ring-marca-primario cursor-pointer"
            />
          </div>
        );
      }
    },
    {
      header: 'Código',
      accessorKey: 'codigo',
      headerClassName: 'w-[8%] min-w-[82px]',
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-4 w-12 rounded-md" />;
        return (
          <span className="font-mono font-black text-xs text-slate-500 uppercase tracking-tight">
            {row.codigo}
          </span>
        );
      }
    },
    {
      header: 'Máquina',
      accessorKey: 'nombre',
      headerClassName: 'w-[24%] min-w-[170px]',
      cell: (row) => {
        if (row.isSkeleton) return (
          <div className="flex flex-col gap-1.5 py-1">
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
        );
        return (
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-extrabold text-slate-800 text-sm leading-tight" title={row.nombre}>
              {row.nombre}
            </span>
            {row.numeroSerie && (
              <span className="truncate text-[10px] font-bold text-slate-400 mt-0.5" title={`S/N: ${row.numeroSerie}`}>
                S/N: {row.numeroSerie}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Proceso',
      accessorKey: 'proceso',
      headerClassName: 'w-[24%] min-w-[190px]',
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-5 w-20 rounded-md" />;
        return (
          <span
            className="block min-w-0 truncate whitespace-nowrap text-xs font-semibold text-slate-600 uppercase"
            title={row.proceso}
          >
            {row.proceso}
          </span>
        );
      }
    },
    {
      header: 'Área',
      accessorKey: 'ubicacion',
      headerClassName: 'w-[18%] min-w-[150px]',
      cell: (row) => {
        if (row.isSkeleton) return (
          <div className="flex flex-col gap-1.5 py-1">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        );
        const showArea = typeof row.area === 'string' ? row.area.trim() : row.area;

        if (!showArea) {
          return null;
        }
        return (
          <span
            className="flex min-w-0 items-center gap-1 text-xs font-bold text-slate-700 uppercase"
            title={row.area}
          >
            <Icon name="location_on" size="xxs" className="text-slate-400 font-bold shrink-0" />
            <span className="block min-w-0 truncate whitespace-nowrap">{row.area}</span>
          </span>
        );
      }
    },
    {
      header: 'Tipo',
      accessorKey: 'criticidad',
      align: 'center',
      headerClassName: 'w-[9%] min-w-[92px]',
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-5 w-16 mx-auto rounded-md" />;
        return (
          <span className={`inline-flex min-w-[68px] items-center justify-center whitespace-nowrap font-black text-[10px] px-2.5 py-0.5 rounded border uppercase ${getCriticidadStyle(row.criticidad)}`}>
            Clase {row.criticidad || 'C'}
          </span>
        );
      }
    },
    {
      header: 'Estado',
      accessorKey: 'estado',
      align: 'center',
      headerClassName: 'w-[12%] min-w-[120px]',
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-5 w-16 mx-auto rounded-md" />;
        const label = row.estado === 'EN_REPARACION'
          ? 'REPARACIÓN'
          : row.estado === 'PARO_PRODUCCION'
            ? 'PARO PRODUCCIÓN'
            : (row.estado === 'BAJA' ? 'BAJA ERP' : row.estado);
        return (
          <span className={`inline-flex items-center justify-center whitespace-nowrap font-black text-[10px] px-2.5 py-0.5 rounded border uppercase ${getEstadoStyle(row.estado)}`}>
            {label}
          </span>
        );
      }
    },
    // {
    //   header: 'Indicadores',
    //   accessorKey: 'bi',
    //   headerClassName: 'w-[18%] min-w-[210px]',
    //   cell: (row) => {
    //     if (row.isSkeleton || biSummaryLoading) return <Skeleton className="h-8 w-44 rounded-md" />;
    //     const bi = biSummaryById[String(row.id)];
    //     if (!bi) {
    //       return <span className="text-[11px] font-bold text-slate-400">—</span>;
    //     }
    //     return (
    //       <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-bold text-slate-600">
    //         <span>Fallas: <strong className="text-slate-900">{formatInteger(bi.metricas?.frecuencia?.valor)}</strong></span>
    //         <span>Disp: <strong className="text-slate-900">{formatPercent(bi.metricas?.disponibilidad?.valorPorcentaje)}</strong></span>
    //         <span>MTTR técnico: <strong className="text-slate-900">{formatMinutes(bi.metricas?.mttr?.valorMinutos)}</strong></span>
    //         <span>MTBF: <strong className="text-slate-900">{formatDays(bi.metricas?.mtbf?.valorDias)}</strong></span>
    //       </div>
    //     );
    //   }
    // },
    {
      header: 'Acciones',
      accessorKey: 'acciones',
      align: 'center',
      headerClassName: 'w-[9%] min-w-[96px]',
      cell: (row) => {
        if (row.isSkeleton) return (
          <div className="flex gap-2 justify-center">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        );
        return (
          <div onClick={(e) => e.stopPropagation()} className="flex min-w-[76px] justify-center">
            <TableActions
              row={row}
              actions={[
                {
                  key: 'ver_detalle',
                  enabled: true,
                  onClick: onViewDetail,
                  tooltip: 'Ficha Técnica y KPIs'
                },
                {
                  key: 'editar',
                  enabled: true,
                  onClick: onEdit,
                  tooltip: 'Editar Criticidad'
                }
              ]}
            />
          </div>
        );
      }
    }
  ];

  const tableData = loading
    ? Array.from({ length: 6 }).map((_, i) => ({ isSkeleton: true, id: `skel-${i}` }))
    : maquinas;

  const filteredColumns = isPrintMode ? columns : columns.filter(c => c.accessorKey !== 'selection');

  return (
    <Table
      data={tableData}
      columns={filteredColumns}
      loading={false}
      emptyMessage="No se encontraron máquinas con los filtros seleccionados."
      onRowClick={onViewDetail}
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      onPageChange={onPageChange}
    />
  );
};
