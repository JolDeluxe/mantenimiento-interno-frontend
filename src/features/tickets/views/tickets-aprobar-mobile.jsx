// src/features/tickets/views/tickets-aprobar-mobile.jsx
import React from 'react';
import { Icon, GlassFab, GlassPaginationPill, ScrollToTopButton, Skeleton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { MobileAprobarCard } from '../components/aprobar/mobile-aprobar-cads';
import { TicketsEmptyState } from '../components/tickets-empty-state';
import { hardReload } from '@/utils/hard-reload';

const MobileSkeleton = () => (
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

export const TicketsAprobarMobile = ({
    tickets,
    isLoading,
    onReviewTicket,
    onViewDetails,
    pagination,
    onPageChange,
    onRefresh
}) => {
    const hasContent = !isLoading && tickets && tickets.length > 0;
    const hasPaginator = hasContent && pagination && pagination.totalPages > 1;

    const baseBottom = hasPaginator ? 104 : 84;
    const fabRefreshBottom = `${baseBottom}px`;

    return (
        <>
            <div className={cn('flex flex-col px-4 gap-4 animate-fade-in', hasPaginator ? 'pb-36' : 'pb-28')}>
                <div className="px-1">
                    <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200/50 px-2 py-1 rounded-md uppercase tracking-wider">
                        Revisión de Evidencias
                    </span>
                    <p className="text-xs text-slate-400 mt-2">
                        Autoriza la conclusión de las actividades o rebota el ticket con observaciones para su reprocesamiento.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <MobileSkeleton key={i} />
                        ))}
                    </div>
                ) : !tickets || tickets.length === 0 ? (
                    <div className="mt-10">
                        <TicketsEmptyState
                            isMobile={true}
                            isFiltering={false}
                            onRefresh={onRefresh}
                            mensaje="¡Todo al día!"
                            subtexto="No hay tickets pendientes por aprobar."
                            icon="check_circle"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {tickets.map(ticket => (
                            <MobileAprobarCard
                                key={ticket.id}
                                ticket={ticket}
                                onReview={onReviewTicket}
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
                        bottom="80px"
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
            </div>

            <div className="md:hidden">
                <ScrollToTopButton
                    bottom={fabRefreshBottom}
                    left="20px"
                />
            </div>
        </>
    );
};
