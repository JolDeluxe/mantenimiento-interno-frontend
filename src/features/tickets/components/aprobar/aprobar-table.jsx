import React, { useState } from 'react';
import { Skeleton, Icon, Pagination, Table, Tooltip } from '@/components/ui/z_index';
import { TicketPriorityBadge } from '@/features/tickets/components/historico/ticket-status-badge';
import { formatFechaHora } from '@/lib/date';
import { cn } from '@/utils/cn';

const ResponsablesCell = ({ lista }) => {
    const [expanded, setExpanded] = useState(false);

    if (!lista || lista.length === 0) {
        return (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 italic">
                <Icon name="person_off" size="xs" />
                Sin asignar
            </span>
        );
    }

    const mostrar = expanded ? lista : lista.slice(0, 3);
    const extra = lista.length - 3;

    return (
        <div className="flex flex-col gap-2 items-start justify-center">
            {mostrar.map((r) => (
                <div key={r.id} className="flex items-center gap-2" title={r.nombre}>
                    {r.imagen ? (
                        <img
                            src={r.imagen}
                            alt={r.nombre}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-50"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/img/perfil-no-foto.webp';
                            }}
                        />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-marca-primario/10 flex items-center justify-center text-marca-primario text-xs font-bold border border-marca-primario/20 shrink-0 shadow-sm">
                            {r.nombre?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                    )}
                    <span className="text-sm text-slate-700 font-medium truncate max-w-[120px]">
                        {r.nombre}
                    </span>
                </div>
            ))}
            {extra > 0 && (
                <button
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                    className="text-[10px] font-bold text-marca-primario hover:underline ml-9"
                >
                    {expanded ? 'Ver menos' : `+ ${extra} ver más`}
                </button>
            )}
        </div>
    );
};

export const AprobarTicketTable = ({
    tickets,
    isLoading,
    onReviewTicket,
    onViewDetails,
    pagination,
    onPageChange
}) => {
    const tableData = isLoading
        ? Array.from({ length: 5 }).map((_, i) => ({ isSkeleton: true, id: `skel-${i}` }))
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
            headerClassName: 'w-[35%] min-w-[180px]',
            cell: (row) => {
                if (row.isSkeleton) return (
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-3/4 rounded-md" />
                        <Skeleton className="h-3 w-1/2 rounded-md" />
                    </div>
                );

                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
                            {row.titulo}
                        </span>
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
            header: 'Responsable(s)',
            accessorKey: 'responsables',
            sortable: false,
            headerClassName: 'w-[20%] min-w-[140px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-28 rounded-md" />;
                return <ResponsablesCell lista={row.responsables} />;
            },
        },
        {
            header: 'Fecha de Resolución',
            accessorKey: 'finalizadoAt',
            sortable: false,
            headerClassName: 'w-[18%] min-w-[130px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-24 rounded-md" />;
                return (
                    <span className="text-xs font-medium text-slate-600">
                        {row.finalizadoAt ? formatFechaHora(row.finalizadoAt) : 'No registrada'}
                    </span>
                );
            },
        },
        {
            header: 'Prioridad',
            accessorKey: 'prioridad',
            sortable: false,
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
            headerClassName: 'w-[12%] min-w-[110px]',
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
                            onClick={() => onReviewTicket?.(row)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-estado-resuelto hover:brightness-110 shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
                        >
                            <Icon name="fact_check" size="xs" />
                            <span>Revisar</span>
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
                emptyMessage="No hay tareas pendientes por aprobar en este momento."
                page={pagination?.page}
                totalPages={pagination?.totalPages}
                totalItems={pagination?.total}
                onPageChange={onPageChange}
                rowClassName={(row) => {
                    if (row.isSkeleton) return 'bg-white';
                    return 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent';
                }}
                hidePagination={false}
            />
        </div>
    );
};
