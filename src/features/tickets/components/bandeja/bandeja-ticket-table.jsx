import React from 'react';
import { useLocation } from 'react-router-dom';
import { Skeleton, Icon, Pagination, Table, Tooltip } from '@/components/ui/z_index';
import { TicketPriorityBadge } from '@/features/tickets/components/historico/ticket-status-badge';
import { formatFechaHora } from '@/lib/date';
import { cn } from '@/utils/cn';

export const BandejaTicketTable = ({
    tickets,
    isLoading,
    onAssignTicket,
    onViewDetails,
    sortOrder,
    onSortChange,
    pagination,
    onPageChange
}) => {
    const location = useLocation();

    const sortConfig = React.useMemo(() => {
        if (sortOrder === 'prioridad-desc') return { key: 'prioridad', direction: 'desc' };
        if (sortOrder === 'prioridad-asc') return { key: 'prioridad', direction: 'asc' };
        if (sortOrder === 'asc') return { key: 'createdAt', direction: 'asc' };
        return { key: 'createdAt', direction: 'desc' };
    }, [sortOrder]);

    const handleTableSort = (key) => {
        if (key === 'createdAt') {
            onSortChange(sortOrder === 'desc' ? 'asc' : 'desc');
        } else if (key === 'prioridad') {
            onSortChange(sortOrder === 'prioridad-desc' ? 'prioridad-asc' : 'prioridad-desc');
        }
    };

    const tableData = isLoading
        ? Array.from({ length: 8 }).map((_, i) => ({ isSkeleton: true, id: `skel-${i}` }))
        : tickets;

    const columns = [
        {
            header: 'ID',
            accessorKey: 'id',
            sortable: false,
            headerClassName: 'w-[5%] min-w-[64px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-12 rounded-md" />;
                return (
                    <span className="text-xs font-mono font-bold text-slate-500">#{row.id}</span>
                );
            },
        },
        {
            header: 'Título',
            accessorKey: 'titulo',
            sortable: false,
            headerClassName: 'w-[40%] min-w-[200px]',
            cell: (row) => {
                if (row.isSkeleton) return (
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-3/4 rounded-md" />
                        <Skeleton className="h-3 w-1/2 rounded-md" />
                    </div>
                );

                const createdMs = Date.parse(row.createdAt);
                const daysWaiting = isNaN(createdMs) ? 0 : Math.floor(Math.abs(Date.now() - createdMs) / (1000 * 60 * 60 * 24));

                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
                                {row.titulo}
                            </span>
                            {daysWaiting >= 3 && (
                                <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-estado-rechazado bg-estado-rechazado/10 border border-estado-rechazado/20 px-1.5 py-0.5 rounded-md uppercase shrink-0">
                                    <Icon name="warning" size="xs" /> CRÍTICO: {daysWaiting} DÍAS
                                </span>
                            )}
                            {daysWaiting === 2 && (
                                <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-md uppercase shrink-0">
                                    <Icon name="schedule" size="xs" /> ATRASADO: 2 DÍAS
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                            {row.planta && (
                                <span className="text-xs text-slate-500 font-semibold truncate">
                                    {row.planta}{row.area ? ` — ${row.area}` : ''}
                                </span>
                            )}
                            {(row.tipo || row.clasificacion) && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {row.tipo && (
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border leading-none ${
                                            {
                                                TICKET: 'bg-slate-100 text-slate-600 border-slate-200/60',
                                                PLANEADA: 'bg-blue-50 text-blue-700 border-blue-200/60',
                                                EXTRAORDINARIA: 'bg-purple-50 text-purple-700 border-purple-200/60',
                                            }[row.tipo] || 'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            {row.tipo}
                                        </span>
                                    )}
                                    {row.clasificacion && (
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border leading-none ${
                                            {
                                                PREVENTIVO: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                                                CORRECTIVO: 'bg-rose-50 text-rose-700 border-rose-200/60',
                                                INSPECCION: 'bg-amber-50 text-amber-700 border-amber-200/60',
                                                MEJORA: 'bg-teal-50 text-teal-700 border-teal-200/60',
                                                INFRAESTRUCTURA: 'bg-violet-50 text-violet-700 border-violet-200/60',
                                            }[row.clasificacion] || 'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            {row.clasificacion}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            header: 'Creado por',
            accessorKey: 'creador',
            sortable: false,
            headerClassName: 'w-[15%] min-w-[120px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-24 rounded-md" />;
                return (
                    <span className="text-xs text-slate-600 font-medium truncate">
                        {row.creador?.nombre || 'Desconocido'}
                    </span>
                );
            },
        },
        {
            header: 'Fecha Creación',
            accessorKey: 'createdAt',
            sortable: true,
            headerClassName: 'w-[15%] min-w-[130px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-20 rounded-md" />;
                return (
                    <span className="text-xs font-medium text-slate-600">
                        {formatFechaHora(row.createdAt)}
                    </span>
                );
            },
        },
        {
            header: 'Espera',
            accessorKey: 'espera',
            sortable: false,
            headerClassName: 'w-[12%] min-w-[120px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-5 w-20 rounded-md" />;
                const createdMs = Date.parse(row.createdAt);
                const daysWaiting = isNaN(createdMs) ? 0 : Math.floor(Math.abs(Date.now() - createdMs) / (1000 * 60 * 60 * 24));
                let label = daysWaiting === 0 ? 'Hoy' : `${daysWaiting} día(s)`;
                let badgeClasses = 'text-slate-500 bg-slate-100 border-slate-200';
                if (daysWaiting >= 3) {
                    label = `CRÍTICO`;
                    badgeClasses = 'text-estado-rechazado bg-estado-rechazado/10 border-estado-rechazado/20';
                } else if (daysWaiting === 2) {
                    label = `ATRASADO`;
                    badgeClasses = 'text-orange-600 bg-orange-50 border-orange-200';
                }
                return (
                    <span className={cn(
                        "inline-flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border shadow-sm",
                        badgeClasses
                    )}>
                        <Icon name="schedule" size="xs" />
                        {label}
                    </span>
                );
            },
        },
        {
            header: 'Prioridad',
            accessorKey: 'prioridad',
            sortable: true,
            align: 'center',
            headerClassName: 'w-[10%] min-w-[90px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-5 w-14 mx-auto rounded-md" />;
                return <TicketPriorityBadge prioridad={row.prioridad} />;
            },
        },
        {
            header: 'Acciones',
            accessorKey: 'acciones',
            align: 'center',
            headerClassName: 'w-[10%] min-w-[80px]',
            cell: (row) => {
                if (row.isSkeleton) return (
                    <div className="flex gap-1.5 justify-center">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <Skeleton className="h-7 w-16 rounded-md" />
                    </div>
                );
                return (
                    <div className="flex items-center gap-2 justify-center">
                        <Tooltip text="Ver detalle" variant="dark">
                            <button
                                onClick={() => onViewDetails?.(row)}
                                className="flex items-center justify-center p-1.5 rounded-md text-slate-600 hover:bg-slate-600/10 transition-colors cursor-pointer"
                            >
                                <Icon name="visibility" size="sm" />
                            </button>
                        </Tooltip>
                        <button
                            onClick={() => onAssignTicket?.(row)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-estado-asignada shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
                        >
                            <Icon name="engineering" size="xs" />
                            <span>Asignar</span>
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="w-full">
            <Table
                columns={columns}
                data={tableData}
                keyField="id"
                loading={false}
                emptyMessage="No hay tickets que coincidan con los filtros."
                page={pagination?.page}
                totalPages={pagination?.totalPages}
                totalItems={pagination?.total}
                onPageChange={onPageChange}
                sortConfig={sortConfig}
                onSortChange={handleTableSort}
                rowClassName={(row) => {
                    if (row.isSkeleton) return 'bg-white';
                    const createdMs = Date.parse(row.createdAt);
                    const daysWaiting = isNaN(createdMs) ? 0 : Math.floor(Math.abs(Date.now() - createdMs) / (1000 * 60 * 60 * 24));
                    const isHighlighted = location.hash === `#ticket-${row.id}`;
                    
                    return cn(
                        isHighlighted ? 'bg-yellow-50/85 hover:bg-yellow-100 border-l-4 border-l-yellow-400' :
                        daysWaiting >= 3 ? 'bg-red-50/20 hover:bg-red-50/40 border-l-4 border-l-estado-rechazado' :
                        daysWaiting === 2 ? 'bg-orange-50/20 hover:bg-orange-50/40 border-l-4 border-l-orange-500' :
                        'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'
                    );
                }}
                hidePagination={true}
            />

            {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex justify-center sm:justify-end">
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
};
