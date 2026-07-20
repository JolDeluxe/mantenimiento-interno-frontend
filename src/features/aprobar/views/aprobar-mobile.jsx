import React from 'react';
import { Icon, GlassFab, GlassPaginationPill, ScrollToTopButton, Skeleton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { MobileAprobarCard } from '../components/mobile-aprobar-cads';
import { TicketsEmptyState } from '@/features/common/components/tickets-empty-state';
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

export const AprobarMobile = ({
    tickets,
    isLoading,
    onReviewTicket,
    onViewDetails,
    pagination,
    onPageChange,
    onRefresh,
    onOpenApproveBatch
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
                        Por Aprobar
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium leading-snug">
                        Revisa, aprueba o devuelve las tareas resueltas por el equipo.
                    </p>
                </div>

                <div className="px-1 flex flex-col gap-3">
                    <div className="max-w-sm">
                        <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200/50 px-2 py-1 rounded-md uppercase tracking-wider">
                            Revisión de Evidencias
                        </span>
                        <p className="text-xs text-slate-400 mt-2">
                            Autoriza la conclusión de las actividades o devuelve el reporte con observaciones para su reprocesamiento.
                        </p>
                    </div>
                    {hasContent && (
                        <button
                            onClick={onOpenApproveBatch}
                            className="self-start flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 active:scale-95 shadow-md transition-all cursor-pointer"
                        >
                            <Icon name="fact_check" size="xs" />
                            <span>Aprobar Lote</span>
                        </button>
                    )}
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
                            subtexto="No hay tareas pendientes por aprobar."
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
