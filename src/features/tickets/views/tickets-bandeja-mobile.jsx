import React from 'react';
import { Icon, GlassFab, GlassPaginationPill, ScrollToTopButton, Skeleton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { BandejaTicketCard } from '../components/bandeja/bandeja-ticket-card';
import { BandejaFiltro } from '../components/bandeja/bandeja-filtro';
import { TicketsEmptyState } from '../components/tickets-empty-state';
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
    onOpenCreate,
    onRefresh,
    isFiltering = false,
    onClearFilters
}) => {
    const hasContent = !isLoading && tickets && tickets.length > 0;
    const hasPaginator = hasContent && pagination && pagination.totalPages > 1;

    const baseBottom = hasPaginator ? 104 : 84;
    const fabAddBottom = `${baseBottom}px`;
    const fabRefreshBottom = onOpenCreate ? `${baseBottom + 60}px` : `${baseBottom}px`;

    return (
        <>
            <div className={cn('flex flex-col px-4 gap-4 animate-fade-in', hasPaginator ? 'pb-36' : 'pb-28')}>
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
                            subtexto="No hay tickets pendientes."
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
                <div className="md:hidden">
                    <GlassPaginationPill
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        onPageChange={onPageChange}
                        loading={isLoading}
                        bottom="24px"
                    />
                </div>
            )}

            <div className="md:hidden">
                <GlassFab
                    icon="refresh"
                    onClick={hardReload}
                    isLoading={isLoading}
                    variant="neutral"
                    size={50}
                    bottom={fabRefreshBottom}
                    right="20px"
                />

                {onOpenCreate && (
                    <GlassFab
                        icon="add"
                        onClick={onOpenCreate}
                        variant="primary"
                        size={56}
                        bottom={fabAddBottom}
                        right="20px"
                    />
                )}
            </div>

            <div className="md:hidden">
                <ScrollToTopButton
                    bottom={fabAddBottom}
                    left="20px"
                />
            </div>
        </>
    );
};