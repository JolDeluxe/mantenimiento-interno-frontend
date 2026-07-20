// src/features/bandeja-general/views/tickets-bandeja-mobile.jsx
import React from 'react';
import { Icon, GlassFab, GlassPaginationPill, ScrollToTopButton, Skeleton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { BandejaTicketCard } from '../components/bandeja-ticket-card';
import { BandejaFiltro } from '../components/bandeja-filtro';
import { TicketsEmptyState } from '@/features/common/components/tickets-empty-state';
import { hardReload } from '@/utils/hard-reload';


const BandejaMobileSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-start">
            <Skeleton className="h-5 w-1/2 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full rounded-md" />
        <Skeleton className="h-3 w-2/3 rounded-md" />
        <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
    </div>
);

export const TicketsBandejaMobile = ({
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
    const hasContent = !isLoading && tickets && tickets.length > 0;
    const hasPaginator = hasContent && pagination && pagination.totalPages > 1;

    const baseBottom = hasPaginator ? 104 : 84;
    const fabRefreshBottom = `${baseBottom}px`;

    return (
        <>
            <div className={cn('flex flex-col gap-4 animate-fade-in', hasPaginator ? 'pb-36' : 'pb-28')}>
                <div className="px-1 mb-1">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos uppercase">
                        Bandeja de Entrada
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium leading-snug">
                        Revisa reportes nuevos y asígnalos al equipo responsable.
                    </p>
                </div>

                <BandejaFiltro
                    totalTickets={pagination?.total || (tickets?.length || 0)}
                    sortOrder={sortOrder}
                    onSortChange={onSortChange}
                />

                {isLoading ? (
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <BandejaMobileSkeleton key={i} />
                        ))}
                    </div>
                ) : !tickets || tickets.length === 0 ? (
                    <div className="mt-10">
                        <TicketsEmptyState
                            isMobile={true}
                            isFiltering={isFiltering}
                            onClearFilters={onClearFilters}
                            onRefresh={onRefresh}
                            mensaje="Bandeja Limpia"
                            subtexto="No hay reportes pendientes."
                            icon="inbox"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {tickets.map(ticket => (
                            <BandejaTicketCard
                                key={ticket.id}
                                ticket={ticket}
                                onAssign={onAssignTicket}
                                onViewDetails={onViewDetails}
                            />
                        ))}
                    </div>
                )}
            </div>

            {hasPaginator && (
                <div className="lg:hidden">
                    <GlassPaginationPill
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        onPageChange={onPageChange}
                        loading={isLoading}
                        bottom="calc(80px + var(--safe-bottom-offset, 0px))"
                    />
                </div>
            )}

            <div className="lg:hidden">
                <GlassFab
                    icon="refresh"
                    onClick={hardReload}
                    isLoading={isLoading}
                    variant="neutral"
                    size={50}
                    bottom={fabRefreshBottom}
                    right="20px"
                />
            </div>

            <div className="lg:hidden">
                <ScrollToTopButton
                    bottom={fabRefreshBottom}
                    left="20px"
                />
            </div>
        </>
    );
};
