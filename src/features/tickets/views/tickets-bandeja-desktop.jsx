// src/features/tickets/views/tickets-bandeja-desktop.jsx
import React from 'react';
import { Spinner, Icon, Pagination } from '@/components/ui/z_index';
import { BandejaTicketCard } from '../components/bandeja/bandeja-ticket-card';
import { BandejaFiltro } from '../components/bandeja/bandeja-filtro';

export const TicketsBandejaDesktop = ({
    tickets,
    isLoading,
    onAssignTicket,
    onViewDetails,
    sortOrder,
    onSortChange,
    pagination,
    onPageChange
}) => {
    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    // Calculamos el total real desde la paginación del backend, o hacemos fallback a la longitud del array
    const total = pagination?.total || (tickets ? tickets.length : 0);

    return (
        <div className="flex flex-col gap-5 animate-fade-in">

            {/* ── Encabezado ── */}
            <div className="w-full">
                <h2 className="fuente-titulos text-2xl text-marca-primario uppercase tracking-wide">
                    Bandeja de Entrada
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                    {total === 0 ? (
                        'No hay tareas pendientes en este momento'
                    ) : (
                        <>
                            Hay <span className="font-extrabold text-marca-primario text-base">{total}</span> tarea{total !== 1 ? 's' : ''} sin asignar
                        </>
                    )}
                </p>
            </div>

            {/* ── Barra de Filtros ── */}
            {total > 0 && (
                <div className="flex items-center gap-2 w-full">
                    <Icon name="filter_arrow_right" className="text-slate-400" />
                    <BandejaFiltro
                        totalTickets={tickets.length}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                    />
                </div>
            )}

            {/* ── Contenido Principal ── */}
            {!tickets || tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-white rounded-xl border border-dashed border-slate-200 mt-2">
                    <div className="bg-emerald-50 p-4 rounded-full mb-4">
                        <Icon name="done_all" size="48px" className="text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-700 mb-2">¡Bandeja Limpia!</h2>
                    <p className="text-slate-500 max-w-md">Todos los tickets han sido asignados exitosamente.</p>
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

                    {/* ── Paginación ── */}
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