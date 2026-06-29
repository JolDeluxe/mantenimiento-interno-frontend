// src/features/bandeja-general/views/tickets-bandeja-desktop.jsx
import React from 'react';
import { Skeleton, Icon, RefreshFab } from '@/components/ui/z_index';
import { BandejaFiltro } from '../components/bandeja-filtro';
import { TicketsEmptyState } from '@/features/tickets/components/tickets-empty-state';
import { BandejaTicketTable } from '../components/bandeja-ticket-table';

export const TicketsBandejaDesktop = ({
    tickets,
    isLoading,
    onAssignTicket,
    onViewDetails,
    sortOrder,
    onSortChange,
    pagination,
    onPageChange,
    onRefresh,
    isFiltering = false,
    onClearFilters
}) => {
    const total = pagination?.total || (tickets ? tickets.length : 0);

    return (
        <div className="flex flex-col gap-5 animate-fade-in relative">
            <div className="w-full">
                <h2 className="fuente-titulos text-2xl text-marca-primario uppercase tracking-wide">
                    Bandeja de Entrada
                </h2>
                <div className="text-sm text-slate-500 mt-0.5">
                    {isLoading ? (
                        <Skeleton className="h-4 w-48 mt-1" />
                    ) : total === 0 ? (
                        <span>No hay reportes pendientes en este momento</span>
                    ) : (
                        <>
                            Hay <span className="font-extrabold text-marca-primario text-base">{total}</span> tarea{total !== 1 ? 's' : ''} sin asignar
                        </>
                    )}
                </div>
            </div>

            {(total > 0 || isLoading) && (
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Icon name="filter_arrow_right" className="text-slate-400" />
                        <BandejaFiltro
                            totalTickets={total}
                            sortOrder={sortOrder}
                            onSortChange={onSortChange}
                        />
                    </div>
                </div>
            )}

            {!isLoading && (!tickets || tickets.length === 0) ? (
                <div className="mt-8">
                    <TicketsEmptyState
                        isFiltering={isFiltering}
                        onClearFilters={onClearFilters}
                        onRefresh={onRefresh}
                        mensaje="¡Bandeja Limpia!"
                        subtexto="Todos los reportes han sido asignados exitosamente."
                        icon="inbox"
                    />
                </div>
            ) : (
                <div className="w-full">
                    <BandejaTicketTable
                        tickets={tickets}
                        isLoading={isLoading}
                        onAssignTicket={onAssignTicket}
                        onViewDetails={onViewDetails}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        pagination={pagination}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
};