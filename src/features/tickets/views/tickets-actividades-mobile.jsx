// src/features/tickets/views/tickets-actividades-mobile.jsx
import { useState } from 'react';
import { GlassFab, GlassPaginationPill, Skeleton, ScrollToTopButton } from '@/components/ui/z_index';
import { ActividadesTicketCard } from '@/features/hoy/components/hoy-actividades/actividades-ticket-card';
import { MobileActividadesFilterBar } from '@/features/hoy/components/hoy-actividades/mobile-actividades-filter-bar';
import { TicketSummaryBar } from '@/features/common/components/ticket-summary-bar';
import { TicketsEmptyState } from '@/features/common/components/tickets-empty-state';
import { TicketDetailModal } from '@/features/common/components/ticket-detail-modal';
import { AdminCloseModal } from '@/features/common/components/admin-close-modal';
import { MobileHoyFormModal } from '@/features/hoy/components/common/mobile-hoy-form-modal';
import { TicketAssignModal } from '@/features/common/components/ticket-assign-modal';
import { TicketStatusModal } from '@/features/common/components/status-modal';
import { MobileTicketReviewModal } from '../components/historico/mobile-ticket-review-modal';
import { ROLES_ADMIN } from '../constants';

const SKELETON_COUNT = 4;

const VIEW_COPY = {
    actividades: {
        emptyMessage: 'Sin actividades',
        emptySubtext: 'No hay actividades internas para los filtros seleccionados.',
        emptyIcon: 'assignment',
    },
    reportes: {
        emptyMessage: 'Sin reportes',
        emptySubtext: 'No hay reportes de clientes para los filtros seleccionados.',
        emptyIcon: 'assignment_late',
    },
};

const CardSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-3">
            <Skeleton className="h-5 w-1/2 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full rounded-md mb-2" />
        <Skeleton className="h-3 w-2/3 rounded-md mb-3" />
        <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
    </div>
);

export const TicketsActividadesMobile = ({
    mode = 'actividades',
    tickets = [],
    loading,
    submitting,
    currentUser,
    tecnicos = [],
    page,
    totalPages,
    totalParaSummary,
    totalParaPaginador,
    conteos,
    existenciaGlobal,
    totalAtrasadasGlobal,
    query,
    filtroEstado,
    filtroTipo,
    filtroPrioridad,
    filtroCategoria,
    filtroResponsable,
    filtroProgramacion,
    filtroConclusion,
    mostrarRechazadas,
    onToggleRechazadas,
    mostrarPapelera,
    mostrarAtrasadas,
    onToggleAtrasadas,
    onPageChange,
    onSearchChange,
    onFilterChange,
    onTipoChange,
    onPrioridadChange,
    onCategoriaChange,
    onResponsableChange,
    onProgramacionChange,
    onConclusionChange,
    onSave,
    onChangeStatus,
    onOpenCreate,
    onRefresh,
    allowCreate = true,
    emptyState = {},
}) => {
    const puedeCrear = ROLES_ADMIN.has(currentUser?.rol);
    const [detailTarget, setDetailTarget] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [adminCloseTarget, setAdminCloseTarget] = useState(null);

    const copy = VIEW_COPY[mode] || VIEW_COPY.actividades;
    const hasContent = !loading && tickets.length > 0;
    const hasPaginator = hasContent && totalPages > 1;
    const showCreateFab = allowCreate && puedeCrear;
    const baseBottom = hasPaginator ? 104 : 84;
    const addBottom = `${baseBottom}px`;

    const isFilteringActive = Boolean(
        query?.trim() ||
        (filtroEstado && filtroEstado !== 'TODOS') ||
        filtroTipo ||
        filtroPrioridad ||
        filtroCategoria ||
        filtroResponsable ||
        filtroProgramacion?.type ||
        filtroConclusion?.type ||
        mostrarAtrasadas ||
        mostrarRechazadas
    );

    const handleClearFilters = () => {
        onSearchChange('');
        onFilterChange('TODOS');
        onTipoChange('');
        onPrioridadChange('');
        onCategoriaChange('');
        onResponsableChange('');
        onProgramacionChange?.({ type: '', start: '', end: '' });
        onConclusionChange?.({ type: '', start: '', end: '' });
        if (mostrarAtrasadas) onToggleAtrasadas();
        if (mostrarRechazadas) onToggleRechazadas();
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in pb-28">
            <TicketSummaryBar
                totalParaSummary={totalParaSummary}
                conteos={conteos}
                filtroActual={filtroEstado}
                onFilterChange={onFilterChange}
                loading={loading}
                mostrarRechazadas={mostrarRechazadas}
                mostrarPapelera={mostrarPapelera}
            />

            <MobileActividadesFilterBar
                query={query}
                onSearchChange={onSearchChange}
                filtroEstado={filtroEstado}
                onEstadoChange={onFilterChange}
                filtroTipo={filtroTipo}
                onTipoChange={onTipoChange}
                filtroPrioridad={filtroPrioridad}
                onPrioridadChange={onPrioridadChange}
                filtroCategoria={filtroCategoria}
                onCategoriaChange={onCategoriaChange}
                filtroResponsable={filtroResponsable}
                onResponsableChange={onResponsableChange}
                opcionesResponsables={tecnicos}
                filtroProgramacion={filtroProgramacion}
                onProgramacionChange={onProgramacionChange}
                filtroConclusion={filtroConclusion}
                onConclusionChange={onConclusionChange}
                mostrarAtrasadas={mostrarAtrasadas}
                onToggleAtrasadas={onToggleAtrasadas}
                mostrarRechazadas={mostrarRechazadas}
                onToggleRechazadas={onToggleRechazadas}
                existenciaGlobal={existenciaGlobal}
                totalAtrasadasGlobal={totalAtrasadasGlobal}
                currentUser={currentUser}
            />

            {loading ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: SKELETON_COUNT }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : tickets.length === 0 ? (
                <div className="mt-10">
                    <TicketsEmptyState
                        isMobile
                        isFiltering={isFilteringActive}
                        onClearFilters={handleClearFilters}
                        onRefresh={onRefresh}
                        mensaje={emptyState.mensaje || copy.emptyMessage}
                        subtexto={emptyState.subtexto || copy.emptySubtext}
                        icon={emptyState.icon || copy.emptyIcon}
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {tickets.map((ticket) => (
                        <ActividadesTicketCard
                            key={ticket.id}
                            ticket={ticket}
                            currentUser={currentUser}
                            onViewDetail={setDetailTarget}
                            onEdit={setEditTarget}
                            onAssign={setAssignTarget}
                            onChangeStatus={setStatusTarget}
                            onAdminClose={setAdminCloseTarget}
                            onReview={setReviewTarget}
                            onCancel={setCancelTarget}
                        />
                    ))}
                </div>
            )}

            {hasPaginator && (
                <div className="lg:hidden">
                    <GlassPaginationPill page={page} totalPages={totalPages} totalItems={totalParaPaginador} onPageChange={onPageChange} loading={loading} bottom="80px" />
                </div>
            )}

            {showCreateFab && (
                <div className="lg:hidden">
                    <GlassFab onClick={onOpenCreate} icon="add" bottom={addBottom} />
                </div>
            )}
            <ScrollToTopButton bottom={addBottom} />

            <TicketDetailModal isOpen={Boolean(detailTarget)} onClose={() => setDetailTarget(null)} ticket={detailTarget} />
            <MobileHoyFormModal scope="actividades" isOpen={Boolean(editTarget)} onClose={() => setEditTarget(null)} ticketAEditar={editTarget} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={async (payload) => { await onSave(editTarget.id, payload); setEditTarget(null); }} />
            <TicketAssignModal isOpen={Boolean(assignTarget)} onClose={() => setAssignTarget(null)} ticket={assignTarget} tecnicos={tecnicos} isSubmitting={submitting} onConfirm={async (id, payload) => { await onSave(id, payload); setAssignTarget(null); }} />
            <TicketStatusModal isOpen={Boolean(statusTarget)} onClose={() => setStatusTarget(null)} ticket={statusTarget} currentUser={currentUser} isSubmitting={submitting} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setStatusTarget(null); }} />
            <MobileTicketReviewModal isOpen={Boolean(reviewTarget)} onClose={() => setReviewTarget(null)} ticket={reviewTarget} isSubmitting={submitting} currentUser={currentUser} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setReviewTarget(null); }} />
            <TicketStatusModal isOpen={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} ticket={cancelTarget} currentUser={currentUser} isSubmitting={submitting} forcedEstado="CANCELADA" onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setCancelTarget(null); }} />
            <AdminCloseModal isOpen={Boolean(adminCloseTarget)} onClose={() => setAdminCloseTarget(null)} ticket={adminCloseTarget} isSubmitting={submitting} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setAdminCloseTarget(null); }} />
        </div>
    );
};
