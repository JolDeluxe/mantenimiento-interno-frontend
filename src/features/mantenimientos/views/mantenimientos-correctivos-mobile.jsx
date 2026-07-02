// src/features/mantenimientos/views/mantenimientos-correctivos-mobile.jsx
import { useState } from 'react';
import { GlassFab, GlassPaginationPill, Icon, Skeleton } from '@/components/ui/z_index';
import { ScrollToTopButton } from '@/components/ui/z_index';
import { MantenimientosSummaryBar as TicketSummaryBar } from '@/features/common/components/ticket-summary-bar';
import { MobileMantenimientosFilterBar as MobileTicketFilterBar } from '../components/common/mobile-mantenimientos-filter-bar';
import { MantenimientosTicketCard as TicketCard } from '../components/common/mantenimientos-ticket-card';
import { MobileMantenimientosFormModal as MobileTicketFormModal } from '../components/common/mobile-mantenimientos-form-modal';
import { TicketStatusModal } from '../components/common/mantenimientos-status-modal';
import { MantenimientosDetailModal as TicketDetailModal } from '@/features/common/components/ticket-detail-modal';
import { MantenimientosAssignModal as TicketAssignModal } from '@/features/common/components/ticket-assign-modal';
import { MobileMantenimientosReviewModal as MobileTicketReviewModal } from '../components/common/mobile-mantenimientos-review-modal';
import { TicketsEmptyState } from '@/features/common/components/tickets-empty-state';
import { ROLES_ADMIN } from '../constants';
import { hardReload } from '@/utils/hard-reload';

const SKELETON_COUNT = 5;

const CardSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-3 w-2/3 rounded-md" />
            </div>
            <div className="flex flex-col gap-1 shrink-0">
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
            </div>
        </div>
        <div className="space-y-1.5 mb-3">
            <Skeleton className="h-3 w-40 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-md" />
        </div>
        <div className="flex gap-2 pt-3 border-t border-slate-100">
            <Skeleton className="h-8 w-8 rounded-md shrink-0" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-md shrink-0" />
        </div>
    </div>
);

export const MantenimientosCorrectivosMobile = ({
    tickets,
    loading,
    submitting,
    currentUser,
    tecnicos,
    page,
    limit,
    totalPages,
    totalParaSummary,
    totalParaPaginador,
    conteos,
    existenciaGlobal,
    totalAtrasadasGlobal,
    sortConfig,
    query,
    filtroEstado,
    filtroTipo,
    filtroPrioridad,
    filtroCategoria,
    filtroClasificacion,
    filtroResponsable,
    filtroPlanta,
    filtroArea,
    filtroProgramacion,
    filtroConclusion,
    mostrarPapelera,
    onTogglePapelera,
    mostrarRechazadas,
    onToggleRechazadas,
    mostrarAtrasadas,
    onToggleAtrasadas,
    onPageChange,
    onSortChange,
    onSearchChange,
    onFilterChange,
    onTipoChange,
    onPrioridadChange,
    onCategoriaChange,
    onClasificacionChange,
    onResponsableChange,
    onPlantaChange,
    onAreaChange,
    onProgramacionChange,
    onConclusionChange,
    onSave,
    onChangeStatus,
    onOpenCreate,
    onRefresh,
    isFiltering = false,
    onClearFilters
}) => {
    const [editTarget, setEditTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [detailTarget, setDetailTarget] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);

    const hasContent = !loading && tickets.length > 0;
    const hasPaginator = hasContent && totalPages > 1;
    const puedeCrear = ROLES_ADMIN.has(currentUser?.rol);
    const baseBottom = hasPaginator ? 104 : 84;
    const fabAddBottom = `${baseBottom}px`;
    const fabRefreshBottom = puedeCrear ? `${baseBottom + 60}px` : `${baseBottom}px`;

    return (
        <>
            <div className="mb-3">
                <TicketSummaryBar totalParaSummary={totalParaSummary} conteos={conteos} filtroActual={filtroEstado} onFilterChange={onFilterChange} loading={loading} mostrarPapelera={mostrarPapelera} mostrarRechazadas={mostrarRechazadas} />
            </div>

            <div className="flex flex-col gap-2.5 mb-3">
                <MobileTicketFilterBar
                    query={query}
                    onSearchChange={onSearchChange}
                    filtroTipo={filtroTipo}
                    onTipoChange={onTipoChange}
                    filtroPrioridad={filtroPrioridad}
                    onPrioridadChange={onPrioridadChange}
                    filtroCategoria={filtroCategoria}
                    onCategoriaChange={onCategoriaChange}
                    filtroClasificacion={filtroClasificacion}
                    onClasificacionChange={onClasificacionChange}
                    filtroResponsable={filtroResponsable}
                    onResponsableChange={onResponsableChange}
                    opcionesResponsables={tecnicos}
                    filtroPlanta={filtroPlanta}
                    onPlantaChange={onPlantaChange}
                    filtroArea={filtroArea}
                    onAreaChange={onAreaChange}
                    filtroProgramacion={filtroProgramacion}
                    onProgramacionChange={onProgramacionChange}
                    filtroConclusion={filtroConclusion}
                    onConclusionChange={onConclusionChange}
                    mostrarPapelera={mostrarPapelera}
                    onTogglePapelera={onTogglePapelera}
                    mostrarRechazadas={mostrarRechazadas}
                    onToggleRechazadas={onToggleRechazadas}
                    mostrarAtrasadas={mostrarAtrasadas}
                    onToggleAtrasadas={onToggleAtrasadas}
                    conteos={conteos}
                    existenciaGlobal={existenciaGlobal}
                    totalAtrasadasGlobal={totalAtrasadasGlobal}
                    mobileFiltersOnly
                />
            </div>

            <div className="flex flex-col gap-3 px-1 pt-1 pb-44">
                {loading
                    ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <CardSkeleton key={i} />)
                    : tickets.length === 0
                        ? (
                            <div className="mt-10">
                                <TicketsEmptyState
                                    isMobile={true}
                                    isFiltering={isFiltering}
                                    onClearFilters={onClearFilters}
                                    onRefresh={onRefresh}
                                    mensaje="Historial Vacío"
                                    subtexto="No hay correctivos en el historial."
                                    icon="history"
                                />
                            </div>
                        )
                        : tickets.map((ticket) => (
                            <TicketCard key={ticket.id} ticket={ticket} currentUser={currentUser} onViewDetail={setDetailTarget} onEdit={setEditTarget} onAssign={setAssignTarget} onChangeStatus={setStatusTarget} onReview={setReviewTarget} onCancel={setCancelTarget} />
                        ))
                }
            </div>

            {hasPaginator && (
                <div className="lg:hidden">
                    <GlassPaginationPill page={page} totalPages={totalPages} totalItems={totalParaPaginador} onPageChange={onPageChange} loading={loading} bottom="80px" />
                </div>
            )}
            <div className="lg:hidden">
                <GlassFab icon="refresh" onClick={hardReload} isLoading={loading} variant="neutral" size={50} bottom={fabRefreshBottom} right="20px" />
                {puedeCrear && <GlassFab icon="add" onClick={onOpenCreate} variant="primary" size={56} bottom={fabAddBottom} right="20px" />}
            </div>
            <div className="lg:hidden">
                <ScrollToTopButton bottom={fabAddBottom} left="20px" />
            </div>

            <MobileTicketFormModal isOpen={Boolean(editTarget)} onClose={() => setEditTarget(null)} ticketAEditar={editTarget} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={async (payload) => { await onSave(editTarget.id, payload); setEditTarget(null); }} />
            <TicketStatusModal isOpen={Boolean(statusTarget)} onClose={() => setStatusTarget(null)} ticket={statusTarget} currentUser={currentUser} isSubmitting={submitting} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setStatusTarget(null); }} />
            <TicketAssignModal isOpen={Boolean(assignTarget)} onClose={() => setAssignTarget(null)} ticket={assignTarget} tecnicos={tecnicos} isSubmitting={submitting} onConfirm={async (id, payload) => { await onSave(id, payload); setAssignTarget(null); }} />
            <MobileTicketReviewModal isOpen={Boolean(reviewTarget)} onClose={() => setReviewTarget(null)} ticket={reviewTarget} isSubmitting={submitting} currentUser={currentUser} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setReviewTarget(null); }} />
            <TicketStatusModal isOpen={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} ticket={cancelTarget} currentUser={currentUser} isSubmitting={submitting} forcedEstado="CANCELADA" onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setCancelTarget(null); }} />
            <TicketDetailModal isOpen={Boolean(detailTarget)} onClose={() => setDetailTarget(null)} ticket={detailTarget} />
        </>
    );
};
