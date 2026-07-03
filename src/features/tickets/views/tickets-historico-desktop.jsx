// src/features/tickets/views/tickets-historico-desktop.jsx
import { useState } from 'react';
import { TicketsTable } from '../components/historico/ticket-table';
import { TicketFilterBar } from '@/features/common/components/ticket-filter-bar';
import { TicketSummaryBar } from '@/features/common/components/ticket-summary-bar';
import { TicketAddButton } from '../components/historico/ticket-add-button';
import { RefreshFab, Icon } from '@/components/ui/z_index';
import { TicketsEmptyState } from '@/features/common/components/tickets-empty-state';
import { ROLES_ADMIN } from '../constants';
import { cn } from '@/utils/cn';

import { TicketDetailModal } from '@/features/common/components/ticket-detail-modal';
import { TicketFormModal } from '../components/historico/ticket-form-modal';
import { TicketAssignModal } from '@/features/common/components/ticket-assign-modal';
import { TicketStatusModal } from '@/features/common/components/status-modal';
import { TicketReviewModal } from '../components/historico/ticket-review-modal';

export const TicketsHistoricoDesktop = ({
    currentUser,
    tickets,
    loading,
    submitting,
    tecnicos,
    page,
    limit,
    totalPages,
    totalParaSummary,
    totalParaPaginador,
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
    conteos,
    existenciaGlobal,
    totalAtrasadasGlobal,
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
    onExport,
    allowCreate = true,
    emptyState = {},
    toApproveCount = 0,
    isFiltering = false,
    onClearFilters
}) => {
    const puedeCrear = ROLES_ADMIN.has(currentUser?.rol);

    const [editTarget, setEditTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [detailTarget, setDetailTarget] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);

    return (
        <div className="flex flex-col gap-4 relative">
            <TicketSummaryBar
                totalParaSummary={totalParaSummary}
                conteos={conteos}
                filtroActual={filtroEstado}
                onFilterChange={onFilterChange}
                loading={loading}
                mostrarPapelera={mostrarPapelera}
                mostrarRechazadas={mostrarRechazadas}
            />

            {allowCreate && puedeCrear && <TicketAddButton onClick={onOpenCreate} />}

            <TicketFilterBar
                currentUser={currentUser}
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
                mostrarRechazadas={mostrarRechazadas}
                onToggleRechazadas={onToggleRechazadas}
                mostrarPapelera={mostrarPapelera}
                onTogglePapelera={onTogglePapelera}
                mostrarAtrasadas={mostrarAtrasadas}
                onToggleAtrasadas={onToggleAtrasadas}
                existenciaGlobal={existenciaGlobal}
                totalAtrasadasGlobal={totalAtrasadasGlobal}
                conteos={conteos}
                onExport={onExport}
            />

            {!loading && (!tickets || tickets.length === 0) ? (
                <div className="mt-8">
                    <TicketsEmptyState
                        isFiltering={isFiltering}
                        onClearFilters={onClearFilters}
                        onRefresh={onRefresh}
                        mensaje={emptyState.mensaje || 'Historial Vacío'}
                        subtexto={emptyState.subtexto || 'No hay tareas registradas en el historial para este periodo.'}
                        icon={emptyState.icon || 'history'}
                    />
                </div>
            ) : (
                <TicketsTable
                    tickets={tickets}
                    loading={loading}
                    submitting={submitting}
                    currentUser={currentUser}
                    tecnicos={tecnicos}
                    page={page}
                    limit={limit}
                    totalPages={totalPages}
                    totalItems={totalParaPaginador}
                    sortConfig={sortConfig}
                    onPageChange={onPageChange}
                    onSortChange={onSortChange}
                    onSave={onSave}
                    onChangeStatus={onChangeStatus}
                    onRefresh={onRefresh}
                />
            )}

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
                currentUser={currentUser}
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
