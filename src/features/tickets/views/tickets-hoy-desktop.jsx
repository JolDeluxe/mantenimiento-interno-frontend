// src/features/tickets/views/tickets-hoy-desktop.jsx
import { useState } from 'react';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { RefreshFab } from '@/components/ui/z_index';
import { HoyTicketCard } from '../components/hoy/hoy-ticket-card';
import { HoyDetailModal } from '../components/hoy/hoy-detail-modal';
import { HoyFormModal } from '../components/hoy/hoy-form-modal';
import { TicketAssignModal } from '../components/historico/ticket-assign-modal';
import { HoyStatusModal } from '../components/hoy/hoy-status-modal';
import { TicketReviewModal } from '../components/historico/ticket-review-modal';
import { HoyAddButton } from '../components/hoy/hoy-add-button';
import { HoyFilterBar } from '../components/hoy/hoy-filter-bar';
import { HoySummaryBar } from '../components/hoy/hoy-summary-bar';
import { TicketsEmptyState } from '../components/tickets-empty-state';
import { ROLES_ADMIN } from '../constants';
import { cn } from '@/utils/cn';

const CardSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-12 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
            <div className="flex flex-col gap-1 shrink-0">
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
            </div>
        </div>
        <div className="space-y-1.5">
            <Skeleton className="h-3 w-32 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
        </div>
        <div className="flex gap-2 pt-3 border-t border-slate-100">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="flex-1" />
            <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
    </div>
);

const DateToggle = ({ selected, onChange, totalHoy, totalManana, totalAtrasadas }) => (
    <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1 shadow-sm">
        {[
            { value: 0, label: 'Hoy', icon: 'today', count: totalHoy, alert: totalAtrasadas > 0 },
            { value: 1, label: 'Mañana', icon: 'event', count: totalManana, alert: false },
        ].map(({ value, label, icon, count, alert }) => (
            <button
                key={value}
                type="button"
                onClick={() => onChange(value)}
                className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 relative cursor-pointer',
                    selected === value
                        ? 'bg-marca-primario text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                )}
            >
                <Icon name={icon} size="sm" />
                {label}
                {count > 0 && (
                    <span className={cn(
                        'text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none',
                        selected === value
                            ? 'bg-white/20 text-white'
                            : alert
                                ? 'bg-red-100 text-red-600 animate-pulse'
                                : 'bg-slate-200 text-slate-600'
                    )}>
                        {count}
                    </span>
                )}
            </button>
        ))}
    </div>
);

export const TicketsHoyDesktop = ({
    tickets,
    highlightId,
    loading,
    submitting,
    currentUser,
    tecnicos,
    dateOffset,
    onDateOffsetChange,
    totalHoy,
    totalManana,
    totalParaSummary,
    conteos,
    totalAtrasadas,
    query,
    onSearchChange,
    filtroEstado,
    onEstadoChange,
    filtroTipo,
    onTipoChange,
    filtroPrioridad,
    onPrioridadChange,
    filtroResponsable,
    onResponsableChange,
    mostrarAtrasadas,
    onToggleAtrasadas,
    mostrarRechazadas,
    onToggleRechazadas,
    vistaEquipo,
    onVistaEquipoChange,
    equipoCount,
    misTareasCount,
    existenciaGlobal,
    totalAtrasadasGlobal,
    onSave,
    onChangeStatus,
    onOpenCreate,
    onRefresh,
    isFiltering = false,
    onClearFilters
}) => {
    const [detailTarget, setDetailTarget] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);

    const puedeCrear = ROLES_ADMIN.has(currentUser?.rol);

    return (
        <div className="flex flex-col gap-5 relative">
            <div>
                <h2 className="fuente-titulos text-2xl text-marca-primario uppercase tracking-wide">Tareas del Día</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                    {loading ? 'Cargando…' : (
                        <>
                            {tickets.length} tarea{tickets.length !== 1 ? 's' : ''}
                            {dateOffset === 0 ? ' para hoy' : ' para mañana'}
                            {dateOffset === 0 && totalAtrasadas > 0 && (
                                <span className="ml-2 font-semibold text-estado-rechazado">· {totalAtrasadas} atrasada{totalAtrasadas !== 1 ? 's' : ''}</span>
                            )}
                        </>
                    )}
                </p>
            </div>

            <HoySummaryBar totalParaSummary={totalParaSummary} conteos={conteos} filtroActual={filtroEstado} onFilterChange={onEstadoChange} loading={loading} />

            <div className="flex items-center justify-between w-full gap-4 flex-wrap">
                <DateToggle selected={dateOffset} onChange={onDateOffsetChange} totalHoy={totalHoy} totalManana={totalManana} totalAtrasadas={totalAtrasadas} />
                {puedeCrear && <div className="shrink-0"><HoyAddButton onClick={onOpenCreate} isMobile={false} /></div>}
            </div>

            <HoyFilterBar 
                query={query} 
                onSearchChange={onSearchChange} 
                filtroEstado={filtroEstado} 
                onEstadoChange={onEstadoChange} 
                filtroTipo={filtroTipo} 
                onTipoChange={onTipoChange} 
                filtroPrioridad={filtroPrioridad} 
                onPrioridadChange={onPrioridadChange} 
                filtroResponsable={filtroResponsable} 
                onResponsableChange={onResponsableChange} 
                opcionesResponsables={tecnicos} 
                mostrarAtrasadas={mostrarAtrasadas} 
                onToggleAtrasadas={onToggleAtrasadas} 
                mostrarRechazadas={mostrarRechazadas} 
                onToggleRechazadas={onToggleRechazadas} 
                vistaEquipo={vistaEquipo} 
                onVistaEquipoChange={onVistaEquipoChange} 
                equipoCount={equipoCount}
                misTareasCount={misTareasCount}
                existenciaGlobal={existenciaGlobal} 
                totalAtrasadasGlobal={totalAtrasadasGlobal} 
                currentUser={currentUser} 
                hideStatusFilter 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                    : tickets.length === 0
                        ? (
                            <div className="col-span-full mt-8">
                                <TicketsEmptyState
                                    isFiltering={isFiltering}
                                    onClearFilters={onClearFilters}
                                    onRefresh={onRefresh}
                                    mensaje={dateOffset === 0 ? "Sin tareas para hoy" : "Sin tareas para mañana"}
                                    subtexto="No hay tickets programados para esta fecha."
                                    icon={dateOffset === 0 ? "today" : "event"}
                                />
                            </div>
                        )
                        : [...tickets].sort((a, b) => {
                            const priorizaRechazos = currentUser?.rol === 'TECNICO' || ROLES_ADMIN.has(currentUser?.rol);
                            if (!priorizaRechazos) return 0;
                            if (a.estado === 'RECHAZADO' && b.estado !== 'RECHAZADO') return -1;
                            if (b.estado === 'RECHAZADO' && a.estado !== 'RECHAZADO') return 1;
                            return 0;
                        }).map((ticket) => (
                            <HoyTicketCard key={ticket.id} ticket={ticket} isHighlighted={highlightId === String(ticket.id)} currentUser={currentUser} onViewDetail={setDetailTarget} onEdit={setEditTarget} onAssign={setAssignTarget} onChangeStatus={setStatusTarget} onReview={setReviewTarget} onCancel={setCancelTarget} />
                        ))
                }
            </div>

            <HoyDetailModal isOpen={Boolean(detailTarget)} onClose={() => setDetailTarget(null)} ticket={detailTarget} />
            <HoyFormModal isOpen={Boolean(editTarget)} onClose={() => setEditTarget(null)} ticketAEditar={editTarget} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={async (payload) => { await onSave(editTarget.id, payload); setEditTarget(null); }} />
            <TicketAssignModal isOpen={Boolean(assignTarget)} onClose={() => setAssignTarget(null)} ticket={assignTarget} tecnicos={tecnicos} isSubmitting={submitting} onConfirm={async (id, payload) => { await onSave(id, payload); setAssignTarget(null); }} />
            <HoyStatusModal isOpen={Boolean(statusTarget)} onClose={() => setStatusTarget(null)} ticket={statusTarget} currentUser={currentUser} isSubmitting={submitting} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setStatusTarget(null); }} />
            <TicketReviewModal isOpen={Boolean(reviewTarget)} onClose={() => setReviewTarget(null)} ticket={reviewTarget} isSubmitting={submitting} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setReviewTarget(null); }} />
            <HoyStatusModal isOpen={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} ticket={cancelTarget} currentUser={currentUser} isSubmitting={submitting} forcedEstado="CANCELADA" onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setCancelTarget(null); }} />
        </div>
    );
};