import React from 'react';
import { Icon } from './icon';
import { Spinner } from './spinner';
import { cn } from '@/utils/cn';

export const Table = ({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyMessage = "No hay registros disponibles.",
  rowClassName,
  page,
  totalPages,
  totalItems,
  onPageChange,
  sortConfig,
  onSortChange
}) => {
  const handleSort = (key) => {
    if (!onSortChange) return;
    onSortChange(key);
  };

  const renderSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <span className="text-slate-300 text-[10px] ml-1">⇅</span>;
    }
    
    // Soporte nativo para ordenamientos estándar y reglas de negocio específicas (ej. atrasadas)
    if (sortConfig.direction === "atrasadas") {
      return <span className="text-red-600 ml-1 text-sm leading-none">⚠️</span>;
    }
    
    return sortConfig.direction === "asc" 
      ? <span className="text-marca-primario ml-1 font-bold">↑</span> 
      : <span className="text-marca-primario ml-1 font-bold">↓</span>;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-40 text-slate-500 italic bg-white rounded-lg border border-slate-300">
        <Spinner size="md" className="mb-2 text-marca-primario" />
        <span className="text-slate-600 font-semibold">Cargando información...</span>
      </div>
    );
  }

  return (
    <div className="w-full text-sm font-sans pb-0.5">
      {data.length > 0 ? (
        <>
          <div className={cn(
            "max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto border border-slate-300",
            page ? "rounded-t-lg border-b-0" : "rounded-lg"
          )}>
            <table className="w-full text-sm font-sans relative">
              <thead className="bg-slate-100 text-black text-xs uppercase sticky top-0 z-20 shadow-inner">
                <tr>
                  {columns.map((col, idx) => (
                    <th 
                      key={col.accessorKey || idx} 
                      className={cn(
                        "px-3 py-3 text-left font-bold border-b border-slate-300 break-words",
                        col.sortable && "cursor-pointer hover:bg-slate-200 transition select-none",
                        col.headerClassName
                      )}
                      onClick={col.sortable ? () => handleSort(col.accessorKey) : undefined}
                    >
                      <div className={cn("flex items-center", col.align === 'center' && "justify-center", col.align === 'right' && "justify-end")}>
                        {col.header}
                        {col.sortable && renderSortIcon(col.accessorKey)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {data.map((row, index) => (
                  <tr 
                    key={row[keyField] || index} 
                    className={cn(
                      "transition duration-150", 
                      rowClassName ? rowClassName(row) : "bg-white hover:bg-slate-50"
                    )}
                  >
                    {columns.map((col, colIdx) => (
                      <td 
                        key={col.accessorKey || colIdx} 
                        className={cn(
                          "px-3 py-3", 
                          col.align === 'center' && "text-center",
                          col.align === 'right' && "text-right",
                          col.cellClassName
                        )}
                      >
                        {col.cell ? col.cell(row) : row[col.accessorKey]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Barra de Paginación */}
          {page && totalPages && (
            <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-slate-50 border border-slate-300 rounded-b-lg gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <span className="text-xs text-slate-600 font-medium">
                  Página <span className="font-bold text-slate-900">{page}</span> de <span className="font-bold text-slate-900">{totalPages}</span>
                </span>
                <span className="hidden sm:block text-slate-300">|</span>
                <span className="text-[11px] text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full font-medium">
                  {totalItems ? `${totalItems} registros en total` : `${data.length} en esta página`}
                </span>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => onPageChange(page - 1)} 
                  disabled={page === 1} 
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Anterior
                </button>
                <button 
                  onClick={() => onPageChange(page + 1)} 
                  disabled={page === totalPages} 
                  className="px-3 py-1.5 text-xs font-medium text-white bg-marca-primario border border-transparent rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center h-40 text-slate-500 italic text-sm bg-white rounded-lg border border-slate-200">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};