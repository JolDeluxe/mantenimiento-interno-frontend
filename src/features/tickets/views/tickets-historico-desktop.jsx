import { TicketsTable } from '../components/historico/ticket-table';
import { TicketFilterBar } from '../components/historico/ticket-filter-bar';
import { TicketSummaryBar } from '../components/historico/ticket-summary-bar';
import { TicketAddButton } from '../components/historico/ticket-add-button';
import { RefreshFab } from '@/components/ui/z_index';
import { ROLES_ADMIN } from '../constants';

export const TicketsHistoricoDesktop = ({
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
}) => {
    const puedeCrear = ROLES_ADMIN.has(currentUser?.rol);

    return (
        <div className="flex flex-col gap-4">
            <RefreshFab bottom="32px" right="32px" size={48} />

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