// src/features/tickets/views/tickets-hoy-mobile.jsx
import { useState } from 'react';
import { GlassFab, Icon, Skeleton } from '@/components/ui/z_index';
import { ScrollToTopButton } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { HoyTicketCard } from '../components/hoy/hoy-ticket-card';
import { HoyDetailModal } from '../components/hoy/hoy-detail-modal';
import { MobileHoyFormModal } from '../components/hoy/mobile-hoy-form-modal';
import { TicketAssignModal } from '../components/historico/ticket-assign-modal';
import { HoyStatusModal } from '../components/hoy/hoy-status-modal';
import { MobileTicketReviewModal } from '../components/historico/mobile-ticket-review-modal';
import { MobileHoyFilterBar } from '../components/hoy/mobile-hoy-filter-bar';
import { HoySummaryBar } from '../components/hoy/hoy-summary-bar';
import { HoyTeamToggle } from '../components/hoy/hoy-team-toggle';
import { TicketsEmptyState } from '../components/tickets-empty-state';
import { ROLES_ADMIN } from '../constants';
import { cn } from '@/utils/cn';
import { hardReload } from '@/utils/hard-reload';

const SKELETON_COUNT = 4;

const CardSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-14 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-3 w-2/3 rounded-md" />
            </div>
            <div className="flex flex-col gap-1 shrink-0">
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
            </div>
        </div>
        <div className="space-y-1.5 mb-3">
            <Skeleton className="h-3 w-36 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
        </div>
        <div className="flex gap-2 pt-3 border-t border-slate-100">
            <Skeleton className="h-8 w-8 rounded-md shrink-0" />
            <div className="flex-1" />
            <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
    </div>
);

const GlassDateToggle = ({ selected, onChange, totalHoy, totalManana, totalAtrasadas }) => {
    const options = [
        { id: 0, label: 'Hoy', icon: 'today', count: totalHoy, alert: totalAtrasadas > 0 },
        { id: 1, label: 'Mañana', icon: 'event', count: totalManana, alert: false },
    ];
    const containerStyle = { display: 'inline-flex', padding: 4, borderRadius: 14, gap: 3, position: 'relative', overflow: 'hidden', ...glassBase('light') };

    return (
        <div style={containerStyle}>
            <GlassSheen />
            {options.map((opt) => {
                const isActive = selected === opt.id;
                const activeStyle = { ...glassBase('primary'), borderRadius: 10, position: 'relative', overflow: 'hidden' };
                const inactiveStyle = { borderRadius: 10, background: 'transparent', border: '1px solid transparent', position: 'relative' };

                return (
                    <button key={opt.id} onClick={() => onChange(opt.id)} style={isActive ? activeStyle : inactiveStyle} className="flex items-center gap-1.5 px-3 py-1.5 transition-all duration-200 active:scale-95 outline-none select-none relative z-10">
                        {isActive && <GlassSheen />}
                        <Icon name={opt.icon} size="xs" className={cn('relative z-10 transition-colors', isActive ? 'text-white' : 'text-slate-600')} />
                        <span className={cn('text-xs font-bold relative z-10 transition-colors', isActive ? 'text-white' : 'text-slate-600')}>{opt.label}</span>
                        {opt.count > 0 && (
                            <span className={cn('text-[9px] font-extrabold px-1 py-0.5 rounded-full relative z-10 leading-none', isActive ? 'bg-white/25 text-white' : opt.alert ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-200 text-slate-600')}>{opt.count}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export const TicketsHoyMobile = ({
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
    const esCoordinador = currentUser?.rol === 'COORDINADOR_MTTO';
    const baseBottom = 84;
    const fabAddBottom = `${baseBottom}px`;
    const fabRefreshBottom = puedeCrear ? `${baseBottom + 60}px` : `${baseBottom}px`;

    return (
        <>
            <div className="flex flex-col gap-2.5 mb-3">
                <div className="flex items-center">
                    <GlassDateToggle selected={dateOffset} onChange={onDateOffsetChange} totalHoy={totalHoy} totalManana={totalManana} totalAtrasadas={totalAtrasadas} />
                </div>
                
                <HoySummaryBar totalParaSummary={totalParaSummary} conteos={conteos} filtroActual={filtroEstado} onFilterChange={onEstadoChange} loading={loading} />
                
                <MobileHoyFilterBar query={query} onSearchChange={onSearchChange} filtroEstado={filtroEstado} onEstadoChange={onEstadoChange} filtroTipo={filtroTipo} onTipoChange={onTipoChange} filtroPrioridad={filtroPrioridad} onPrioridadChange={onPrioridadChange} filtroResponsable={filtroResponsable} onResponsableChange={onResponsableChange} opcionesResponsables={tecnicos} mostrarAtrasadas={mostrarAtrasadas} onToggleAtrasadas={onToggleAtrasadas} mostrarRechazadas={mostrarRechazadas} onToggleRechazadas={onToggleRechazadas} vistaEquipo={vistaEquipo} onVistaEquipoChange={onVistaEquipoChange} existenciaGlobal={existenciaGlobal} totalAtrasadasGlobal={totalAtrasadasGlobal} currentUser={currentUser} hideStatusFilter />

                {esCoordinador && (
                    <div className="px-0.5 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-300">
                        <HoyTeamToggle 
                            vistaEquipo={vistaEquipo} 
                            onChange={onVistaEquipoChange} 
                            isMobile 
                            equipoCount={equipoCount}
                            misTareasCount={misTareasCount}
                        />
                    </div>
                )}
            </div>

            <div className={cn('flex flex-col gap-3 px-1 pt-1', 'pb-44')}>
                {loading
                    ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <CardSkeleton key={i} />)
                    : tickets.length === 0
                        ? (
                            <div className="mt-10">
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

            <div className="md:hidden">
                <GlassFab icon="refresh" onClick={hardReload} isLoading={loading} variant="neutral" size={50} bottom={fabRefreshBottom} right="20px" />
                {puedeCrear && <GlassFab icon="add" onClick={onOpenCreate} variant="primary" size={56} bottom={fabAddBottom} right="20px" />}
            </div>

            <div className="md:hidden">
                <ScrollToTopButton bottom={fabAddBottom} left="20px" />
            </div>

            <HoyDetailModal isOpen={Boolean(detailTarget)} onClose={() => setDetailTarget(null)} ticket={detailTarget} />
            <MobileHoyFormModal isOpen={Boolean(editTarget)} onClose={() => setEditTarget(null)} ticketAEditar={editTarget} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={async (payload) => { await onSave(editTarget.id, payload); setEditTarget(null); }} />
            <TicketAssignModal isOpen={Boolean(assignTarget)} onClose={() => setAssignTarget(null)} ticket={assignTarget} tecnicos={tecnicos} isSubmitting={submitting} onConfirm={async (id, payload) => { await onSave(id, payload); setAssignTarget(null); }} />
            <HoyStatusModal isOpen={Boolean(statusTarget)} onClose={() => setStatusTarget(null)} ticket={statusTarget} currentUser={currentUser} isSubmitting={submitting} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setStatusTarget(null); }} />
            <MobileTicketReviewModal isOpen={Boolean(reviewTarget)} onClose={() => setReviewTarget(null)} ticket={reviewTarget} isSubmitting={submitting} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setReviewTarget(null); }} />
            <HoyStatusModal isOpen={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} ticket={cancelTarget} currentUser={currentUser} isSubmitting={submitting} forcedEstado="CANCELADA" onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setCancelTarget(null); }} />
        </>
    );
};