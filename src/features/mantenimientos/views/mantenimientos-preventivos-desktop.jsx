// src/features/mantenimientos/views/mantenimientos-preventivos-desktop.jsx
import { useState } from 'react';
import { MantenimientosTicketTable as PreventivosTicketTable } from '../components/common/mantenimientos-ticket-table';
import { MantenimientosFilterBar as PreventivosFilterBar } from '@/features/common/components/ticket-filter-bar';
import { MantenimientosSummaryBar as TicketSummaryBar } from '@/features/common/components/ticket-summary-bar';
import { MantenimientosAddButton as TicketAddButton } from '../components/common/mantenimientos-add-button';
import { Icon } from '@/components/ui/z_index';
import { TicketsEmptyState } from '@/features/common/components/tickets-empty-state';
import { ROLES_ADMIN } from '@/features/common/constants/catalogos-tareas';
import { MantenimientosDetailModal as TicketDetailModal } from '@/features/common/components/ticket-detail-modal';
import { MantenimientosFormModal as TicketFormModal } from '../components/common/mantenimientos-form-modal';
import { MantenimientosAssignModal as TicketAssignModal } from '@/features/common/components/ticket-assign-modal';
import { TicketStatusModal } from '../components/common/mantenimientos-status-modal';
import { MantenimientosReviewModal as TicketReviewModal } from '../components/common/mantenimientos-review-modal';
import { ExcelExportModal } from '@/features/common/components/excel-export-modal';


export const MantenimientosPreventivosDesktop = ({
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
    const [exportOpen, setExportOpen] = useState(false);

    const activeFilters = {
        q: query,
        estado: mostrarRechazadas ? 'RECHAZADO' : (mostrarPapelera ? 'CANCELADA' : (filtroEstado !== 'TODOS' ? filtroEstado : undefined)),
        tipo: filtroTipo,
        prioridad: filtroPrioridad,
        categoria: filtroCategoria,
        clasificacion: filtroClasificacion,
        planta: filtroPlanta,
        area: filtroArea,
        responsableId: filtroResponsable,
        vencidos: mostrarAtrasadas || undefined,
        vencimientoDesde: filtroProgramacion.start,
        vencimientoHasta: filtroProgramacion.end,
        finalizadoDesde: filtroConclusion.start,
        finalizadoHasta: filtroConclusion.end
    };


    return (
        <div className="flex w-full min-w-0 flex-col gap-4 relative">
            <TicketSummaryBar
                totalParaSummary={totalParaSummary}
                conteos={conteos}
                filtroActual={filtroEstado}
                onFilterChange={onFilterChange}
                loading={loading}
                mostrarPapelera={mostrarPapelera}
                mostrarRechazadas={mostrarRechazadas}
            />

            {puedeCrear && <TicketAddButton onClick={onOpenCreate} />}

            <PreventivosFilterBar
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
                showCategoria={false}
                onExport={() => setExportOpen(true)}
            />

            {!loading && (!tickets || tickets.length === 0) ? (
                <div className="mt-8">
                    <TicketsEmptyState
                        isFiltering={isFiltering}
                        onClearFilters={onClearFilters}
                        onRefresh={onRefresh}
                        mensaje="Historial Vacío"
                        subtexto="No hay preventivos registrados para este periodo."
                        icon="history"
                    />
                </div>
            ) : (
                <PreventivosTicketTable
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

            <ExcelExportModal
                isOpen={exportOpen}
                onClose={() => setExportOpen(false)}
                defaultClasificacion="PREVENTIVO"
                scope="mantenimientos"
                currentFilters={activeFilters}
            />
        </div>
    );
};

