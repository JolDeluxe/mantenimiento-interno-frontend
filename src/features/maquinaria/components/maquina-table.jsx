import React from 'react';
import { Table, Icon, TableActions, Skeleton } from '@/components/ui/z_index';

export const MaquinaTable = ({
  maquinas = [],
  loading = false,
  page,
  totalPages,
  totalItems,
  onPageChange,
  onViewDetail,
  onEdit
}) => {
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
      EN_REPARACION: 'bg-amber-50 text-amber-700 border-amber-200',
      INACTIVA: 'bg-slate-50 text-slate-700 border-slate-200',
      BAJA: 'bg-rose-50 text-rose-700 border-rose-200',
      BAJA_ERP: 'bg-red-50 text-red-700 border-red-200'
    };
    return map[est] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const columns = [
    {
      header: 'Código',
      accessorKey: 'codigo',
      headerClassName: 'w-[10%] min-w-[90px]',
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
      header: 'Nombre de Máquina',
      accessorKey: 'nombre',
      headerClassName: 'w-[25%] min-w-[200px]',
      cell: (row) => {
        if (row.isSkeleton) return (
          <div className="flex flex-col gap-1.5 py-1">
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
        );
        return (
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
        );
      }
    },
    {
      header: 'Proceso / Tipo',
      accessorKey: 'proceso',
      headerClassName: 'w-[15%] min-w-[130px]',
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-5 w-20 rounded-md" />;
        return (
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200/50 px-2.5 py-0.5 rounded-full uppercase">
            {row.proceso}
          </span>
        );
      }
    },
    {
      header: 'Ubicación',
      accessorKey: 'ubicacion',
      headerClassName: 'w-[20%] min-w-[180px]',
      cell: (row) => {
        if (row.isSkeleton) return (
          <div className="flex flex-col gap-1.5 py-1">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        );
        const showPlanta = row.planta !== 'BAJA' && row.planta !== 'VENTA';
        const showArea = row.area !== 'BAJA' && row.area !== 'VENTA';

        if (!showPlanta && !showArea) {
          return <span className="text-slate-400 font-semibold italic text-xs">-</span>;
        }
        return (
          <div className="flex flex-col gap-0.5">
            {showPlanta && (
              <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                <Icon name="store" size="xxs" className="text-slate-400 font-bold" />
                {row.planta}
              </span>
            )}
            {showArea && (
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Icon name="location_on" size="xxs" className="text-slate-300" />
                {row.area}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Criticidad',
      accessorKey: 'criticidad',
      align: 'center',
      headerClassName: 'w-[10%] min-w-[80px]',
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-5 w-8 mx-auto rounded-md" />;
        return (
          <span className={`inline-flex items-center justify-center font-black text-xs px-2.5 py-0.5 rounded border uppercase tracking-wider ${getCriticidadStyle(row.criticidad)}`}>
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
        if (row.isSkeleton) return <Skeleton className="h-5 w-16 mx-auto rounded-md" />;
        const label = row.estado === 'EN_REPARACION' ? 'REPARACIÓN' : (row.estado === 'BAJA_ERP' ? 'BAJA ERP' : row.estado);
        return (
          <span className={`inline-flex items-center justify-center font-black text-[10px] px-2.5 py-0.5 rounded border uppercase tracking-wider ${getEstadoStyle(row.estado)}`}>
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
      cell: (row) => {
        if (row.isSkeleton) return (
          <div className="flex gap-2 justify-center">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        );
        return (
          <div onClick={(e) => e.stopPropagation()}>
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

  return (
    <Table
      data={tableData}
      columns={columns}
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
