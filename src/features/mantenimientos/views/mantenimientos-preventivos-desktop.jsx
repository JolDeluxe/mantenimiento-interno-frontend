import { useState } from 'react';
import { MantenimientosTicketTable as PreventivosTicketTable } from '../components/common/mantenimientos-ticket-table';
import { MantenimientosFilterBar as PreventivosFilterBar } from '@/features/common/components/ticket-filter-bar';
import { MantenimientosSummaryBar as TicketSummaryBar } from '@/features/common/components/ticket-summary-bar';
import { MantenimientosFechas as TicketFechas } from '@/features/common/components/ticket-fechas';
import { MantenimientosAddButton as TicketAddButton } from '../components/common/mantenimientos-add-button';
import { InteractiveCalendar, Icon } from '@/components/ui/z_index';
import { TicketsEmptyState } from '@/features/common/components/tickets-empty-state';
import { ROLES_ADMIN } from '../constants';
import { cn } from '@/utils/cn';
import { MantenimientosDetailModal as TicketDetailModal } from '@/features/common/components/ticket-detail-modal';
import { MantenimientosFormModal as TicketFormModal } from '../components/common/mantenimientos-form-modal';
import { MantenimientosAssignModal as TicketAssignModal } from '@/features/common/components/ticket-assign-modal';
import { TicketStatusModal } from '../components/common/mantenimientos-status-modal';
import { MantenimientosReviewModal as TicketReviewModal } from '../components/common/mantenimientos-review-modal';
import { MantenimientosCalendarItemActions as CalendarItemActions } from '../components/common/mantenimientos-calendar-item-actions';

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
    filtroYear,
    filtroMonth,
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
    onYearChange,
    onMonthChange,
    onSave,
    onChangeStatus,
    onOpenCreate,
    onRefresh,
    onExport,
    isFiltering = false,
    onClearFilters,
    viewMode,
    onViewModeChange,
    vistaCalendario,
    calendarItems,
    calendarDate,
    onCalendarNavigate,
    calendarView,
    onCalendarViewChange,
    onCalendarDayClick,
    onCalendarItemClick,
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
            <div className="flex items-center justify-between w-full bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => onViewModeChange('cards')}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer border-none outline-none',
                            !vistaCalendario ? 'bg-white text-marca-primario shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        )}
                    >
                        <Icon name="table_rows" size="sm" /> Listado
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewModeChange('calendar')}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer border-none outline-none',
                            vistaCalendario ? 'bg-white text-marca-primario shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        )}
                    >
                        <Icon name="calendar_month" size="sm" /> Calendario
                    </button>
                </div>
            </div>

            {!vistaCalendario && (
                <TicketFechas
                    year={filtroYear}
                    month={filtroMonth}
                    onYearChange={onYearChange}
                    onMonthChange={onMonthChange}
                    existenciaGlobal={existenciaGlobal}
                />
            )}

            {!vistaCalendario && (
                <TicketSummaryBar
                    totalParaSummary={totalParaSummary}
                    conteos={conteos}
                    filtroActual={filtroEstado}
                    onFilterChange={onFilterChange}
                    loading={loading}
                    mostrarPapelera={mostrarPapelera}
                    mostrarRechazadas={mostrarRechazadas}
                />
            )}

            {puedeCrear && <TicketAddButton onClick={onOpenCreate} />}

            {!vistaCalendario && (
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
                    onExport={onExport}
                />
            )}

            {vistaCalendario ? (
                <InteractiveCalendar
                    items={calendarItems}
                    view={calendarView}
                    onViewChange={onCalendarViewChange}
                    currentDate={calendarDate}
                    onNavigate={onCalendarNavigate}
                    onDayClick={onCalendarDayClick}
                    onItemClick={(item) => setDetailTarget(item.raw)}
                    isLoading={loading}
                    isMobile={false}
                    renderActions={(item) => (
                        <CalendarItemActions
                            ticket={item.raw}
                            currentUser={currentUser}
                            onEdit={setEditTarget}
                            onAssign={setAssignTarget}
                            onChangeStatus={setStatusTarget}
                            onReview={setReviewTarget}
                            onCancel={setCancelTarget}
                        />
                    )}
                />
            ) : !loading && (!tickets || tickets.length === 0) ? (
                <div className="mt-8">
                    <TicketsEmptyState
                        isFiltering={isFiltering}
                        onClearFilters={onClearFilters}
                        onRefresh={onRefresh}
                        mensaje="Historial Vacío"
                        subtexto="No hay tareas registradas en el historial para este periodo."
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

            <TicketDetailModal isOpen={Boolean(detailTarget)} onClose={() => setDetailTarget(null)} ticket={detailTarget} />

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
