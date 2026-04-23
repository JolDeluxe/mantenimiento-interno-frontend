import { TicketsTable } from '../components/historico/ticket-table';
import { TicketFilterBar } from '../components/historico/ticket-filter-bar';
import { TicketSummaryBar } from '../components/historico/ticket-summary-bar';
import { TicketAddButton } from '../components/historico/ticket-add-button';
import { TicketFechas } from '../components/historico/ticket-fechas';
import { RefreshFab } from '@/components/ui/z_index';
import { ROLES_ADMIN } from '../constants';

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
    filtroClasificacion,
    filtroResponsable,
    filtroPlanta,
    filtroArea,
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
    onClasificacionChange,
    onResponsableChange,
    onPlantaChange,
    onAreaChange,
    onSave,
    onChangeStatus,
    onOpenCreate,
    onRefresh,
    filtroYear,
    filtroMonth,
    onYearChange,
    onMonthChange,
}) => {
    const puedeCrear = ROLES_ADMIN.has(currentUser?.rol);

    return (
        <div className="flex flex-col gap-4 relative">
            <RefreshFab bottom="32px" right="32px" size={48} onClick={onRefresh} />

            <TicketFechas
                year={filtroYear}
                month={filtroMonth}
                onYearChange={onYearChange}
                onMonthChange={onMonthChange}
            />

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

            <TicketFilterBar
                currentUser={currentUser}
                query={query}
                onSearchChange={onSearchChange}
                filtroTipo={filtroTipo}
                onTipoChange={onTipoChange}
                filtroPrioridad={filtroPrioridad}
                onPrioridadChange={onPrioridadChange}
                filtroClasificacion={filtroClasificacion}
                onClasificacionChange={onClasificacionChange}
                filtroResponsable={filtroResponsable}
                onResponsableChange={onResponsableChange}
                opcionesResponsables={tecnicos}
                filtroPlanta={filtroPlanta}
                onPlantaChange={onPlantaChange}
                filtroArea={filtroArea}
                onAreaChange={onAreaChange}
                opcionesAreas={[]}
                mostrarRechazadas={mostrarRechazadas}
                onToggleRechazadas={onToggleRechazadas}
                mostrarPapelera={mostrarPapelera}
                onTogglePapelera={onTogglePapelera}
                mostrarAtrasadas={mostrarAtrasadas}
                onToggleAtrasadas={onToggleAtrasadas}
                existenciaGlobal={existenciaGlobal}
                totalAtrasadasGlobal={totalAtrasadasGlobal}
                conteos={conteos}
            />

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
        </div>
    );
};