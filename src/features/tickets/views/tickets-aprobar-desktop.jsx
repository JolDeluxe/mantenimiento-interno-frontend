// src/features/tickets/views/tickets-aprobar-desktop.jsx
import React from 'react';
import { Skeleton, Icon, RefreshFab } from '@/components/ui/z_index';
import { TicketsEmptyState } from '../components/tickets-empty-state';
import { AprobarTicketTable } from '../components/aprobar/aprobar-table';

export const TicketsAprobarDesktop = ({
    tickets,
    isLoading,
    onReviewTicket,
    onViewDetails,
    pagination,
    onPageChange,
    onRefresh
}) => {
    const total = pagination?.total || (tickets ? tickets.length : 0);

    return (
        <div className="flex flex-col gap-5 animate-fade-in relative">
            <div className="w-full">
                <h2 className="fuente-titulos text-2xl text-marca-primario uppercase tracking-wide">
                    Control de Aprobaciones
                </h2>
                <div className="text-sm text-slate-500 mt-0.5">
                    {isLoading ? (
                        <Skeleton className="h-4 w-48 mt-1" />
                    ) : total === 0 ? (
                        <span>No hay tareas resueltas esperando validación</span>
                    ) : (
                        <>
                            Hay <span className="font-extrabold text-green-800 text-base">{total}</span> tarea{total !== 1 ? 's' : ''} resuelta{total !== 1 ? 's' : ''} pendiente{total !== 1 ? 's' : ''} por aprobar
                        </>
                    )}
                </div>
            </div>

            {(total > 0 || isLoading) && (
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Icon name="info" size="xs" className="text-slate-400" />
                        <span>Revisa el reporte técnico de las tareas terminadas antes de cerrarlas o rechazarlas</span>
                    </div>
                    <RefreshFab onClick={onRefresh} loading={isLoading} />
                </div>
            )}

            {!isLoading && (!tickets || tickets.length === 0) ? (
                <div className="mt-8">
                    <TicketsEmptyState
                        isFiltering={false}
                        onRefresh={onRefresh}
                        mensaje="¡Todo al día!"
                        subtexto="No hay tickets resueltos esperando tu validación."
                        icon="check_circle"
                    />
                </div>
            ) : (
                <div className="w-full">
                    <AprobarTicketTable
                        tickets={tickets}
                        isLoading={isLoading}
                        onReviewTicket={onReviewTicket}
                        onViewDetails={onViewDetails}
                        pagination={pagination}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
};
