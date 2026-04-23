import { useState } from 'react';
import { Table, Skeleton, Icon } from '@/components/ui/z_index';
import { TicketStatusBadge, TicketPriorityBadge } from './ticket-status-badge';
import { TicketFormModal } from './ticket-form-modal';
import { TicketStatusModal } from './ticket-status-modal';
import { TicketDetailModal } from './ticket-detail-modal';
import { TicketAssignModal } from './ticket-assign-modal';
import { TicketReviewModal } from './ticket-review-modal';
import { TicketActions } from './ticket-actions';
import { formatFecha, formatFechaRelativa } from '@/lib/date';
import { cn } from '@/utils/cn';

const ESTADOS_FINALES = ['RESUELTO', 'CERRADO', 'CANCELADA'];

// const isVencida = (ticket) => {
//     if (!ticket.fechaVencimiento) return false;
//     if (ESTADOS_FINALES.includes(ticket.estado)) return false;
//     return isPastDate(ticket.fechaVencimiento);
// };

// const isEntregadaTarde = (ticket) => {
//     if (!ticket.fechaVencimiento) return false;
//     // Solo se evalúa si el ticket ya fue terminado
//     if (ticket.estado !== 'RESUELTO' && ticket.estado !== 'CERRADO') return false;

//     // Extraemos la fecha en la que realmente se resolvió (o el updatedAt si el historial no viene populado)
//     const entryResuelto = ticket.historial?.find(h => h.estadoNuevo === 'RESUELTO');
//     const fechaFin = entryResuelto?.createdAt || ticket.updatedAt;

//     if (!fechaFin) return false;

//     const fVenc = new Date(ticket.fechaVencimiento).setHours(0, 0, 0, 0);
//     const fFin = new Date(fechaFin).setHours(0, 0, 0, 0);

//     return fFin > fVenc;
// };

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

export const TicketsTable = ({
    tickets,
    loading,
    currentUser,
    tecnicos = [],
    page,
    totalPages,
    totalItems,
    sortConfig,
    onPageChange,
    onSortChange,
    onSave,
    onChangeStatus,
    onRefresh,
    submitting,
    hidePagination = false,
}) => {
    const [detailTarget, setDetailTarget] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);

    const columns = [
        {
            header: 'ID',
            accessorKey: 'id',
            sortable: true,
            headerClassName: 'w-[5%] min-w-[64px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-12 rounded-md" />;
                return (
                    <div className="flex flex-col items-start gap-1">
                        <span className="text-xs font-mono font-bold text-slate-500">#{row.id}</span>
                    </div>
                );
            },
        },
        {
            header: 'Título',
            accessorKey: 'titulo',
            sortable: true,
            headerClassName: 'w-[26%] min-w-[180px]',
            cell: (row) => {
                if (row.isSkeleton) return (
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-3/4 rounded-md" />
                        <Skeleton className="h-3 w-1/2 rounded-md" />
                    </div>
                );

                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
                                {row.titulo}
                            </span>
                            {row.isOverdue && (
                                <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-estado-rechazado bg-estado-rechazado/10 border border-estado-rechazado/20 px-1.5 py-0.5 rounded-md uppercase shrink-0">
                                    <Icon name="warning" size="xs" /> ATRASADA
                                </span>
                            )}
                            {row.isLate && (
                                <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md uppercase shrink-0">
                                    <Icon name="timer_off" size="xs" /> CON RETRASO
                                </span>
                            )}
                        </div>
                        {row.planta && (
                            <span className="text-xs text-slate-400 mt-0.5 truncate">
                                {row.planta}{row.area ? ` — ${row.area}` : ''}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Fecha Creación',
            accessorKey: 'createdAt',
            sortable: true,
            headerClassName: 'w-[12%] min-w-[110px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-20 rounded-md" />;
                return (
                    <span className="text-xs font-medium text-slate-600">
                        {formatFecha(row.createdAt)}
                    </span>
                );
            },
        },
        {
            header: 'Responsable',
            accessorKey: 'responsables',
            sortable: false,
            headerClassName: 'w-[15%] min-w-[140px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-24 rounded-md" />;
                return <ResponsablesCell lista={row.responsables} />;
            },
        },
        {
            header: 'Estado',
            accessorKey: 'estado',
            sortable: true,
            align: 'center',
            headerClassName: 'w-[13%] min-w-[110px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-5 w-20 mx-auto rounded-md" />;
                return <TicketStatusBadge estado={row.estado} />;
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
            header: 'Fecha Entrega',
            accessorKey: 'fechaVencimiento',
            sortable: true,
            headerClassName: 'w-[12%] min-w-[130px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-8 w-24 rounded-md" />;

                const isResolvedOrClosed = row.estado === 'RESUELTO' || row.estado === 'CERRADO';

                if (isResolvedOrClosed) {
                    // finalizadoAt es el campo canónico — seteado por el backend al resolver/cerrar.
                    const fechaFin = row.finalizadoAt || row.updatedAt;

                    return (
                        <div className="flex flex-col gap-0.5 text-[10px] w-full">
                            {row.fechaVencimiento ? (
                                <div className="flex items-center justify-items-end-safe gap-1">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider">F. Venc:</span>
                                    <span className="text-slate-600 font-medium text-right">{formatFecha(row.fechaVencimiento)}</span>
                                </div>
                            ) : (
                                <div className="text-slate-400 italic">Sin fecha límite</div>
                            )}
                            {fechaFin && (
                                <div className="flex items-center justify-items-end-safe gap-1">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider">F. Concl:</span>
                                    <span className={cn("font-bold text-right", row.isLate ? "text-red-600" : "text-emerald-600")}>
                                        {formatFecha(fechaFin)}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                }

                // --- NUEVA LÓGICA DE PREVENCIÓN DE DUPLICADOS PARA TICKETS ACTIVOS ---
                const textoRelativo = row.fechaVencimiento ? formatFechaRelativa(row.fechaVencimiento) : 'Sin fecha límite';
                const textoAbsoluto = row.fechaVencimiento ? formatFecha(row.fechaVencimiento) : '';

                // Evitamos duplicidad ignorando mayúsculas/minúsculas
                const mostrarAbsoluto = row.fechaVencimiento && (textoRelativo.toLowerCase() !== textoAbsoluto.toLowerCase());

                return (
                    <div className="flex flex-col gap-0.5 text-xs">
                        <span className={cn('font-medium', row.isOverdue ? 'text-estado-rechazado' : 'text-slate-600')}>
                            {textoRelativo}
                        </span>
                        {mostrarAbsoluto && (
                            <span className="text-[10px] text-slate-400">
                                {textoAbsoluto}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Acciones',
            accessorKey: 'acciones',
            align: 'center',
            headerClassName: 'w-[20%] min-w-[50px]',
            cell: (row) => {
                if (row.isSkeleton) return (
                    <div className="flex gap-1.5 justify-center">
                        {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-7 w-7 rounded-md" />)}
                    </div>
                );
                return (
                    <TicketActions
                        ticket={row}
                        currentUser={currentUser}
                        onViewDetail={(r) => setDetailTarget(r)}
                        onEdit={(r) => setEditTarget(r)}
                        onAssign={(r) => setAssignTarget(r)}
                        onChangeStatus={(r) => setStatusTarget(r)}
                        onReview={(r) => setReviewTarget(r)}
                        onCancel={(r) => setCancelTarget(r)}
                    />
                );
            },
        },
    ];

    const tableData = loading
        ? Array.from({ length: 10 }).map((_, i) => ({ isSkeleton: true, id: `skel-${i}` }))
        : tickets;

    const handleConfirmCancel = async () => {
        if (!cancelTarget) return;
        const formData = new FormData();
        formData.append('estado', 'CANCELADA');
        formData.append('nota', 'Ticket cancelado por el usuario.');
        await onChangeStatus(cancelTarget.id, formData);
        setCancelTarget(null);
    };

    return (
        <div className="w-full">
            <Table
                columns={columns}
                data={tableData}
                keyField="id"
                loading={false}
                emptyMessage="No hay tickets que coincidan con los filtros."
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={onPageChange}
                sortConfig={sortConfig}
                hidePagination={hidePagination}
                rowClassName={(row) =>
                    row.isSkeleton
                        ? 'bg-white'
                        : row.isOverdue
                            ? 'bg-red-50/40 hover:bg-red-50/70'
                            : 'bg-white hover:bg-slate-50'
                }
                onSortChange={(key) => {
                    const direction =
                        sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
                    onSortChange(key, direction);
                }}
            />

            <TicketDetailModal
                isOpen={Boolean(detailTarget)}
                onClose={() => setDetailTarget(null)}
                ticket={detailTarget}
            />

            <TicketFormModal
                isOpen={Boolean(editTarget)}
                onClose={() => setEditTarget(null)}
                ticketAEditar={editTarget}
                currentUser={currentUser}
                tecnicos={tecnicos}
                isSubmitting={submitting}
                onSuccess={async (payload) => {
                    await onSave(editTarget.id, payload);
                    setEditTarget(null);
                }}
            />

            <TicketAssignModal
                isOpen={Boolean(assignTarget)}
                onClose={() => setAssignTarget(null)}
                ticket={assignTarget}
                tecnicos={tecnicos}
                isSubmitting={submitting}
                onConfirm={async (id, payload) => {
                    await onSave(id, payload);
                    setAssignTarget(null);
                }}
            />

            <TicketStatusModal
                isOpen={Boolean(statusTarget)}
                onClose={() => setStatusTarget(null)}
                ticket={statusTarget}
                currentUser={currentUser}
                isSubmitting={submitting}
                onConfirm={async (id, payload) => {
                    await onChangeStatus(id, payload);
                    setStatusTarget(null);
                }}
            />

            <TicketReviewModal
                isOpen={Boolean(reviewTarget)}
                onClose={() => setReviewTarget(null)}
                ticket={reviewTarget}
                isSubmitting={submitting}
                onConfirm={async (id, payload) => {
                    await onChangeStatus(id, payload);
                    setReviewTarget(null);
                }}
            />

            <TicketStatusModal
                isOpen={Boolean(cancelTarget)}
                onClose={() => setCancelTarget(null)}
                ticket={cancelTarget}
                currentUser={currentUser}
                isSubmitting={submitting}
                forcedEstado="CANCELADA"
                onConfirm={async (id, payload) => {
                    await onChangeStatus(id, payload);
                    setCancelTarget(null);
                }}
            />
        </div>
    );
};