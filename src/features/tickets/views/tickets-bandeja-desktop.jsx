import React from 'react';
import { Skeleton, Icon, Pagination, RefreshFab } from '@/components/ui/z_index';
import { BandejaTicketCard } from '../components/bandeja/bandeja-ticket-card';
import { BandejaFiltro } from '../components/bandeja/bandeja-filtro';
import { TicketsEmptyState } from '../components/tickets-empty-state';

const BandejaCardSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-6 w-3/4 rounded-md" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-5/6 rounded-md" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
    </div>
);

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
                        <span>No hay tareas pendientes en este momento</span>
                    ) : (
                        <>
                            Hay <span className="font-extrabold text-marca-primario text-base">{total}</span> tarea{total !== 1 ? 's' : ''} sin asignar
                        </>
                    )}
                </div>
            </div>

            {(total > 0 || isLoading) && (
                <div className="flex items-center gap-2 w-full">
                    <Icon name="filter_arrow_right" className="text-slate-400" />
                    <BandejaFiltro
                        totalTickets={total}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                    />
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <BandejaCardSkeleton key={i} />
                    ))}
                </div>
            ) : !tickets || tickets.length === 0 ? (
                <div className="mt-8">
                    <TicketsEmptyState
                        isFiltering={isFiltering}
                        onClearFilters={onClearFilters}
                        onRefresh={onRefresh}
                        mensaje="¡Bandeja Limpia!"
                        subtexto="Todos los tickets han sido asignados exitosamente."
                        icon="inbox"
                    />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {tickets.map(ticket => (
                            <BandejaTicketCard
                                key={ticket.id}
                                ticket={ticket}
                                onAssign={onAssignTicket}
                                onViewDetails={onViewDetails}
                            />
                        ))}
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="mt-4 flex justify-center sm:justify-end">
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={onPageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};