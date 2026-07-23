// src/features/tickets/views/tickets-actividades-desktop.jsx
import { Pagination } from '@/components/ui/z_index';
import { HoyAddButton } from '@/features/hoy/components/common/hoy-add-button';
import { TicketActividadFormModal } from '@/features/common/forms/tareas/actividades';
import { ActividadesFilterBar } from '@/features/hoy/components/hoy-actividades/actividades-filter-bar';
import { ActividadesTicketTable } from '@/features/hoy/components/hoy-actividades/actividades-ticket-table';
import { TicketSummaryBar } from '@/features/common/components/ticket-summary-bar';
import { TicketsEmptyState } from '@/features/common/components/tickets-empty-state';
import { ROLES_ADMIN } from '@/features/common/constants/catalogos-tareas';

const VIEW_COPY = {
    actividades: {
        title: 'Actividades',
        description: 'Historial de actividades internas planeadas and extraordinarias.',
        emptyMessage: 'Sin actividades',
        emptySubtext: 'No hay actividades internas para los filtros seleccionados.',
        emptyIcon: 'assignment',
    },
    reportes: {
        title: 'Reportes',
        description: 'Historial de reportes creados por clientes internos.',
        emptyMessage: 'Sin reportes',
        emptySubtext: 'No hay reportes de clientes para los filtros seleccionados.',
        emptyIcon: 'assignment_late',
    },
};

export const TicketsActividadesDesktop = ({
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
    query,
    filtroEstado,
    filtroTipo,
    filtroPrioridad,
    filtroCategoria,
    filtroArea,
    filtroResponsable,
    filtroProgramacion,
    filtroConclusion,
    conteos,
    existenciaGlobal,
    totalAtrasadasGlobal,
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
    onAreaChange,
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
    const copy = VIEW_COPY[mode] || VIEW_COPY.actividades;
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
        <div className="flex flex-col gap-5 relative">
            <div>
                <h2 className="fuente-titulos text-2xl text-marca-primario uppercase tracking-wide">
                    {copy.title}
                </h2>
                <p className="text-sm text-slate-555 mt-0.5">
                    {loading ? 'Cargando...' : `${totalParaPaginador} registro${totalParaPaginador !== 1 ? 's' : ''}. ${copy.description}`}
                </p>
            </div>

            <TicketSummaryBar
                totalParaSummary={totalParaSummary}
                conteos={conteos}
                filtroActual={filtroEstado}
                onFilterChange={onFilterChange}
                loading={loading}
                mostrarRechazadas={mostrarRechazadas}
                mostrarPapelera={mostrarPapelera}
            />

            <div className="flex items-center justify-between w-full gap-4 flex-wrap">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Gestión de actividades
                </div>
                {allowCreate && puedeCrear && <HoyAddButton onClick={onOpenCreate} isMobile={false} />}
            </div>

            <ActividadesFilterBar
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
                filtroArea={filtroArea}
                onAreaChange={onAreaChange}
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

            {!loading && tickets.length === 0 ? (
                <div className="mt-8">
                    <TicketsEmptyState
                        isFiltering={isFilteringActive}
                        onClearFilters={handleClearFilters}
                        onRefresh={onRefresh}
                        mensaje={emptyState.mensaje || copy.emptyMessage}
                        subtexto={emptyState.subtexto || copy.emptySubtext}
                        icon={emptyState.icon || copy.emptyIcon}
                    />
                </div>
            ) : (
                <>
                    <ActividadesTicketTable
                        tickets={tickets}
                        loading={loading}
                        submitting={submitting}
                        currentUser={currentUser}
                        tecnicos={tecnicos}
                        onSave={onSave}
                        onChangeStatus={onChangeStatus}
                        scope="actividades"
                        FormModalComponent={TicketActividadFormModal}
                    />
                    {totalPages > 1 && (
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            totalItems={totalParaPaginador}
                            onPageChange={onPageChange}
                            loading={loading}
                        />
                    )}
                </>
            )}
        </div>
    );
};

