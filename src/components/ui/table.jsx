// src/components/ui/table.jsx
import { Skeleton } from './spinner';
import { Pagination } from './pagination';
import { cn } from '@/utils/cn';

export const Table = ({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyMessage = 'No hay registros disponibles.',
  rowClassName,
  page,
  totalPages,
  totalItems,
  onPageChange,
  sortConfig,
  onSortChange,
  // Oculta la barra de paginación interna.
  // Usar cuando el consumidor provee su propio paginador (ej. GlassPaginationPill).
  hidePagination = false,
}) => {
  const handleSort = (key) => {
    if (!onSortChange) return;
    onSortChange(key);
  };

  const renderSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <span className="text-slate-300 text-[10px] ml-1">⇅</span>;
    }
    if (sortConfig.direction === 'atrasadas') {
      return <span className="ml-1 text-sm leading-none">⚠️</span>;
    }
    return sortConfig.direction === 'asc'
      ? <span className="text-marca-primario ml-1 font-bold">↑</span>
      : <span className="text-marca-primario ml-1 font-bold">↓</span>;
  };

  if (loading) {
    return (
      <div className="w-full text-sm font-sans pb-0.5">
        <div className="rounded-t-lg border border-slate-300 overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-300 px-3 py-3 flex gap-4">
            {columns.map((col, i) => (
              <div key={i} className={cn('flex items-center', col.headerClassName)}>
                <Skeleton className="h-3 rounded-full w-16" />
              </div>
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-4 px-3 py-3 bg-white border-b border-slate-100 last:border-0">
              {columns.map((col, colIdx) => (
                <div key={colIdx} className={cn('shrink-0', col.headerClassName)}>
                  {colIdx === 0 ? (
                    <Skeleton className="w-10 h-10 rounded-full mx-auto" />
                  ) : colIdx === 1 ? (
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-4 w-28 rounded-md" />
                      <Skeleton className="h-3 w-18 rounded-md" />
                    </div>
                  ) : colIdx === columns.length - 1 ? (
                    <div className="flex gap-2 justify-center">
                      <Skeleton className="w-7 h-7 rounded-md" />
                      <Skeleton className="w-7 h-7 rounded-md" />
                      <Skeleton className="w-7 h-7 rounded-md" />
                    </div>
                  ) : (
                    <Skeleton className="h-4 rounded-md w-20" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        {!hidePagination && (
          <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border border-t-0 border-slate-300 rounded-b-lg">
            <Skeleton className="h-4 w-32 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-7 w-16 rounded-md" />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 text-slate-500 italic text-sm bg-white rounded-lg border border-slate-200">
        {emptyMessage}
      </div>
    );
  }

  // Con paginación interna → rounded-t + sin borde inferior
  // Sin paginación interna → rounded completo
  const hasPaginationBar = !hidePagination && page && totalPages;

  return (
    <div className="w-full text-sm font-sans pb-0.5">
      <div className={cn(
        'max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto border border-slate-300',
        hasPaginationBar ? 'rounded-t-lg border-b-0' : 'rounded-lg'
      )}>
        <table className="w-full text-sm font-sans relative">
          <thead className="bg-slate-100 text-black text-xs uppercase sticky top-0 z-20 shadow-inner">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.accessorKey || idx}
                  className={cn(
                    'px-3 py-3 text-left font-bold border-b border-slate-300 wrap-break-word',
                    col.sortable && 'cursor-pointer hover:bg-slate-200 transition select-none',
                    col.headerClassName
                  )}
                  onClick={col.sortable ? () => handleSort(col.accessorKey) : undefined}
                >
                  <div className={cn(
                    'flex items-center',
                    col.align === 'center' && 'justify-center',
                    col.align === 'right' && 'justify-end'
                  )}>
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
                key={row[keyField] ?? index}
                className={cn(
                  'transition duration-150',
                  rowClassName ? rowClassName(row) : 'bg-white hover:bg-slate-50'
                )}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.accessorKey || colIdx}
                    className={cn(
                      'px-3 py-3',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
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

      {hasPaginationBar && (
        <Pagination
          variant="bar"
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};