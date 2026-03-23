// src/features/tickets/views/tickets-historico-desktop.jsx
import { TicketsTable } from '../components/historico/ticket-table';
import { TicketFilterBar } from '../components/historico/ticket-filter-bar';
import { TicketSummaryBar } from '../components/historico/ticket-summary-bar';
import { TicketAddButton } from '../components/historico/ticket-add-button';
import { RefreshFab } from '@/components/ui/z_index';

export const TicketsHistoricoDesktop = ({
    tickets,
    loading,
    submitting,
    currentUser,
    tecnicos,
    page,
    limit,
    totalPages,
    totalItems,
    sortConfig,
    query,
    filtroEstado,
    filtroTipo,
    filtroPrioridad,
    conteos,
    mostrarPapelera,
    onTogglePapelera,
    onPageChange,
    onSortChange,
    onSearchChange,
    onFilterChange,
    onTipoChange,
    onPrioridadChange,
    onSave,
    onChangeStatus,
    onOpenCreate,
    onRefresh,
}) => (
    <div className="flex flex-col gap-4">

        <RefreshFab bottom="32px" right="32px" size={48} />

        <TicketSummaryBar
            total={totalItems}
            conteos={conteos}
            filtroActual={filtroEstado}
            onFilterChange={onFilterChange}
            loading={loading}
            mostrarPapelera={mostrarPapelera}
        />

        <TicketAddButton onClick={onOpenCreate} />

        <TicketFilterBar
            query={query}
            onSearchChange={onSearchChange}
            filtroTipo={filtroTipo}
            onTipoChange={onTipoChange}
            filtroPrioridad={filtroPrioridad}
            onPrioridadChange={onPrioridadChange}
            mostrarPapelera={mostrarPapelera}
            onTogglePapelera={onTogglePapelera}
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
            totalItems={totalItems}
            sortConfig={sortConfig}
            onPageChange={onPageChange}
            onSortChange={onSortChange}
            onSave={onSave}
            onChangeStatus={onChangeStatus}
            onRefresh={onRefresh}
        />
    </div>
);