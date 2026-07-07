// src/features/hoy/components/hoy-mantenimientos/mantenimientos-ticket-table.jsx
import React, { useState } from 'react';
import { Icon, Skeleton, Table } from '@/components/ui/z_index';
import { TicketPriorityBadge, TicketStatusBadge } from '@/features/common/components/ticket-status-badge';
import { TicketActions } from '@/features/tickets/components/historico/ticket-actions';
import { TicketDetailModal as HoyDetailModal } from '@/features/common/components/ticket-detail-modal';
import { AdminCloseModal } from '@/features/common/components/admin-close-modal';
import { HoyFormModal } from '../common/hoy-form-modal';
import { TicketStatusModal as HoyStatusModal } from '@/features/common/components/status-modal';

// Modales de asignación y revisión de ambas features
import { TicketAssignModal as TicketsAssign, MantenimientosAssignModal as MantenimientosAssign } from '@/features/common/components/ticket-assign-modal';
import { TicketReviewModal as TicketsReview } from '@/features/tickets/components/historico/ticket-review-modal';
import { TicketReviewModal as MantenimientosReview } from '@/features/mantenimientos/components/common/mantenimientos-review-modal';

import { formatFecha, formatFechaRelativa, isoToLocalMXTime, format12h, formatDurationToDaysHours } from '@/lib/date';
import { cn } from '@/utils/cn';
import { CATEGORIAS_EQUIPO } from '@/features/tickets/constants';

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

const OverdueStatusBadge = () => (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wide border text-estado-rechazado bg-estado-rechazado/10 border-estado-rechazado/20">
        <Icon name="warning" size="xs" />
        Atrasada
    </span>
);

export const MantenimientosTicketTable = ({
    tickets = [],
    loading = false,
    submitting = false,
    currentUser,
    tecnicos = [],
    highlightId,
    onSave,
    onChangeStatus,
    scope = 'mantenimientos',
}) => {
    const [detailTarget, setDetailTarget] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [adminCloseTarget, setAdminCloseTarget] = useState(null);

    const tableData = loading
        ? Array.from({ length: 6 }).map((_, i) => ({ isSkeleton: true, id: `skel-${i}` }))
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
            headerClassName: 'w-[22%] min-w-[160px]',
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
                            <span className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 flex-1">
                                {row.titulo}
                            </span>
                            {row.paroProduccion && (
                                <span className={cn(
                                    "inline-flex items-center gap-0.5 text-[9px] font-extrabold border px-1.5 py-0.5 rounded-md uppercase shrink-0 leading-none",
                                    ['RESUELTO', 'CERRADO'].includes(row.estado)
                                        ? "text-emerald-700 bg-emerald-50 border-emerald-300"
                                        : "text-red-700 bg-red-50 border-red-300 animate-pulse"
                                )}>
                                    <Icon name={['RESUELTO', 'CERRADO'].includes(row.estado) ? "task_alt" : "error"} size="xs" style={{ fontSize: '10px' }} className="shrink-0" />
                                    <span>{['RESUELTO', 'CERRADO'].includes(row.estado) ? "PARO RESUELTO" : "PARO ACTIVO"}</span>
                                </span>
                            )}
                            {row.isLate && (
                                <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md uppercase shrink-0">
                                    <Icon name="timer_off" size="xs" />ENTREGADA CON RETRASO
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-slate-500 self-start max-w-full">
                            <Icon name="location_on" size="xxs" className="text-slate-400 shrink-0" />
                            <span className="truncate">
                                {row.planta}{row.area ? ` — ${row.area}` : ''}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            header: 'Máquina',
            accessorKey: 'maquina',
            sortable: false,
            align: 'center',
            headerClassName: 'w-[12%] min-w-[120px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-20 rounded-md m-auto" />;
                if (!row.maquina) return <span className="text-xs text-slate-400 italic">No asociada</span>;

                return (
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                        <span className="text-xs font-bold text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50">{row.maquina.codigo}</span>
                        {row.maquina.criticidad && (
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[9px] font-black leading-none",
                                row.maquina.criticidad === 'A' ? 'bg-red-100 text-red-700' :
                                row.maquina.criticidad === 'B' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-200/60 text-slate-700'
                            )}>
                                Crit. {row.maquina.criticidad}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Tipo / Clasificación',
            accessorKey: 'tipo_clasificacion',
            sortable: false,
            align: 'center',
            headerClassName: 'w-[15%] min-w-[130px]',
            cell: (row) => {
                if (row.isSkeleton) return (
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-16 rounded-md" />
                        <Skeleton className="h-3.5 w-20 rounded-md" />
                    </div>
                );

                const tipoBadge = row.tipo ? (
                    row.tipo === 'TICKET' ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border leading-none shrink-0 bg-amber-500/10 text-amber-600 border-amber-500/20">
                            <Icon name="warning" size="10px" className="text-amber-500 shrink-0" />
                            <span>Reporte</span>
                        </span>
                    ) : (
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border leading-none shrink-0 ${
                            {
                                PLANEADA: 'bg-blue-50 text-blue-700 border-blue-200/60',
                                EXTRAORDINARIA: 'bg-purple-50 text-purple-700 border-purple-200/60',
                            }[row.tipo] || 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                            {row.tipo}
                        </span>
                    )
                ) : null;

                const clasifIcon = {
                    PREVENTIVO: 'build_circle',
                    CORRECTIVO: 'report_problem',
                    INSPECCION: 'search',
                    RUTINA: 'sync',
                }[row.clasificacion] || 'label';

                let clasifColorClass = 'text-slate-600';
                let clasifIconColorClass = 'text-slate-400';
                if (row.clasificacion === 'CORRECTIVO') {
                    clasifColorClass = 'text-red-700 font-semibold';
                    clasifIconColorClass = 'text-red-500';
                } else if (row.clasificacion === 'PREVENTIVO') {
                    clasifColorClass = 'text-blue-700 font-semibold';
                    clasifIconColorClass = 'text-blue-500';
                }

                const clasifContent = (row.clasificacion && row.categoria === 'MAQUINARIA') ? (
                    <div className={cn("flex items-center gap-1 font-bold text-xs uppercase", clasifColorClass)}>
                        <Icon name={clasifIcon} size="xs" className={cn("shrink-0", clasifIconColorClass)} />
                        <span>{row.clasificacion}</span>
                    </div>
                ) : (
                    <span className="text-xs text-slate-400 italic">-</span>
                );

                return (
                    <div className="flex flex-col items-center gap-1">
                        {clasifContent}
                        {tipoBadge}
                    </div>
                );
            }
        },
        // {
        //     header: 'Categoría',
        //     accessorKey: 'categoria',
        //     sortable: false,
        //     align: 'center',
        //     headerClassName: 'w-[12%] min-w-[100px]',
        //     cell: (row) => {
        //         if (row.isSkeleton) return <Skeleton className="h-5 w-18 mx-auto rounded-md" />;
        //         if (!row.categoria) return <span className="text-xs text-slate-400 italic">-</span>;
                
        //         const catInfo = CATEGORIAS_EQUIPO.find(c => c.value === row.categoria) || {
        //             label: row.categoria,
        //             icon: 'category',
        //             colorClass: 'bg-slate-100 text-slate-500 border-slate-200'
        //         };

        //         return (
        //             <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide whitespace-nowrap`}>
        //                 <Icon name={catInfo.icon} size="xs" className="shrink-0" />
        //                 {catInfo.label}
        //             </span>
        //         );
        //     },
        // },
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
            sortable: false,
            align: 'center',
            headerClassName: 'w-[13%] min-w-[110px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-5 w-20 mx-auto rounded-md" />;
                if (row.isOverdue) return <OverdueStatusBadge />;
                return <TicketStatusBadge estado={row.estado} />;
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
        // {
        //     header: 'Horario / Duración',
        //     accessorKey: 'horario_duracion',
        //     sortable: false,
        //     align: 'center',
        //     headerClassName: 'w-[12%] min-w-[120px]',
        //     cell: (row) => {
        //         if (row.isSkeleton) return <Skeleton className="h-5 w-20 mx-auto rounded-md" />;
        //         if (row.horaInicioProgramada && row.horaFinProgramada) {
        //             const startStr = format12h(isoToLocalMXTime(row.horaInicioProgramada));
        //             const endStr = format12h(isoToLocalMXTime(row.horaFinProgramada));
                    
        //             const startMs = new Date(row.horaInicioProgramada).getTime();
        //             const endMs = new Date(row.horaFinProgramada).getTime();
        //             let durationStr = '';
        //             if (!isNaN(startMs) && !isNaN(endMs) && endMs > startMs) {
        //                 const diffMins = Math.round((endMs - startMs) / 60000);
        //                 durationStr = formatDurationToDaysHours(diffMins);
        //             }

        //             return (
        //                 <div className="flex flex-col items-center gap-0.5">
        //                     <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide whitespace-nowrap bg-marca-secundario/10 text-marca-secundario border-marca-secundario/30">
        //                         <Icon name="schedule" size="xs" className="shrink-0" />
        //                         <span>{startStr} — {endStr}</span>
        //                     </span>
        //                     {durationStr && (
        //                         <span className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">
        //                             {durationStr}
        //                         </span>
        //                     )}
        //                 </div>
        //             );
        //         }
        //         if (row.tiempoEstimado) {
        //             return (
        //                 <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide whitespace-nowrap bg-slate-100 text-slate-600 border-slate-200">
        //                     <Icon name="timer" size="xs" className="shrink-0" />
        //                     <span>{row.tiempoEstimado} min</span>
        //                 </span>
        //             );
        //         }
        //         return <span className="text-xs text-slate-400 italic">-</span>;
        //     }
        // },
        {
            header: 'Fecha Entrega',
            accessorKey: 'fechaVencimiento',
            sortable: false,
            headerClassName: 'w-[12%] min-w-[130px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-8 w-24 rounded-md" />;

                const isResolvedOrClosed = row.estado === 'RESUELTO' || row.estado === 'CERRADO';

                if (isResolvedOrClosed) {
                    const fechaFin = row.finalizadoAt || row.updatedAt;

                    return (
                        <div className="flex flex-col gap-0.5 text-[9px] w-full">
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

                const textoRelativo = row.fechaVencimiento ? formatFechaRelativa(row.fechaVencimiento) : 'Sin fecha límite';
                const textoAbsoluto = row.fechaVencimiento ? formatFecha(row.fechaVencimiento) : '';
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
                        onAdminClose={(r) => setAdminCloseTarget(r)}
                        onReview={(r) => setReviewTarget(r)}
                        onCancel={(r) => setCancelTarget(r)}
                    />
                );
            },
        },
    ];

    // Selección dinámica de modales según si el ticket actual tiene maquinaId
    const ActiveAssignModal = assignTarget?.maquinaId ? MantenimientosAssign : TicketsAssign;
    const ActiveReviewModal = reviewTarget?.maquinaId ? MantenimientosReview : TicketsReview;

    return (
        <div className="w-full">
            <Table
                columns={columns}
                data={tableData}
                keyField="id"
                loading={false}
                emptyMessage="No hay mantenimientos que coincidan con los filtros."
                rowClassName={(row) => {
                    if (row.isSkeleton) return 'bg-white';
                    if (highlightId === String(row.id)) return 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-400';
                    
                    const borderCls = {
                        PENDIENTE: 'border-l-estado-pendiente',
                        ASIGNADA: 'border-l-estado-asignada',
                        EN_PROGRESO: 'border-l-estado-en-progreso',
                        EN_PROCESO: 'border-l-estado-en-progreso',
                        EN_PAUSA: 'border-l-estado-en-pausa',
                        RESUELTO: 'border-l-estado-resuelto',
                        RECHAZADO: 'border-l-estado-rechazado',
                        CANCELADA: 'border-l-estado-cancelada',
                    }[row.estado] || 'border-l-transparent';

                    // Si es reporte de maquinaria (tipo TICKET): aplicar color según criticidad de la máquina
                    if (row.maquina && row.tipo === 'TICKET') {
                        if (row.maquina.criticidad === 'A') {
                            return `bg-red-50/65 hover:bg-red-100/60 border-l-4 border-l-red-500 font-medium`;
                        } else if (row.maquina.criticidad === 'B') {
                            return `bg-amber-50/55 hover:bg-amber-100/40 border-l-4 border-l-amber-500`;
                        } else if (row.maquina.criticidad === 'C') {
                            return `bg-slate-50/30 hover:bg-slate-100/30 border-l-4 border-l-slate-400`;
                        }
                    }

                    if (row.estado === 'RECHAZADO') return `bg-red-100/50 hover:bg-red-100/80 border-l-4 ${borderCls}`;
                    return `bg-white hover:bg-slate-50 border-l-4 ${borderCls}`;
                }}
                hidePagination={true}
            />

            <HoyDetailModal isOpen={Boolean(detailTarget)} onClose={() => setDetailTarget(null)} ticket={detailTarget} />
            
            <HoyFormModal scope={scope} isOpen={Boolean(editTarget)} onClose={() => setEditTarget(null)} ticketAEditar={editTarget} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={async (payload) => { await onSave(editTarget.id, payload); setEditTarget(null); }} />
            
            <ActiveAssignModal isOpen={Boolean(assignTarget)} onClose={() => setAssignTarget(null)} ticket={assignTarget} tecnicos={tecnicos} isSubmitting={submitting} onConfirm={async (id, payload) => { await onSave(id, payload); setAssignTarget(null); }} />
            
            <HoyStatusModal isOpen={Boolean(statusTarget)} onClose={() => setStatusTarget(null)} ticket={statusTarget} currentUser={currentUser} isSubmitting={submitting} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setStatusTarget(null); }} />
            
            <ActiveReviewModal isOpen={Boolean(reviewTarget)} onClose={() => setReviewTarget(null)} ticket={reviewTarget} isSubmitting={submitting} currentUser={currentUser} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setReviewTarget(null); }} />
            
            <HoyStatusModal isOpen={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} ticket={cancelTarget} currentUser={currentUser} isSubmitting={submitting} forcedEstado="CANCELADA" onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setCancelTarget(null); }} />
            <AdminCloseModal isOpen={Boolean(adminCloseTarget)} onClose={() => setAdminCloseTarget(null)} ticket={adminCloseTarget} isSubmitting={submitting} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setAdminCloseTarget(null); }} />
        </div>
    );
};
