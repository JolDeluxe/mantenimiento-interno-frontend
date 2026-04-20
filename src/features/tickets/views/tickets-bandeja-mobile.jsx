import React from 'react';
import { Icon, GlassFab, GlassPaginationPill, ScrollToTopButton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { BandejaTicketCard } from '../components/bandeja/bandeja-ticket-card';
import { BandejaFiltro } from '../components/bandeja/bandeja-filtro';

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
    onRefresh
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
                    <div className="flex flex-col gap-4">
                        <div className="h-32 bg-slate-100 animate-pulse rounded-xl"></div>
                        <div className="h-32 bg-slate-100 animate-pulse rounded-xl"></div>
                    </div>
                ) : !hasContent ? (
                    <div className="flex flex-col items-center justify-center p-8 mt-10 text-center animate-fade-in">
                        <div className="bg-emerald-50 p-4 rounded-full mb-4">
                            <Icon name="done_all" size="48px" className="text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-700 mb-2">Bandeja Limpia</h2>
                        <p className="text-sm text-slate-500">No hay tickets pendientes.</p>
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
                    onClick={onRefresh}
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