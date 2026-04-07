// src/features/tickets/views/tickets-bandeja-desktop.jsx
import React from 'react';
import { Spinner, Icon } from '@/components/ui/z_index';
import { Select } from '@/components/form/z_index';
import { BandejaTicketCard } from '../components/bandeja/bandeja-ticket-card';

export default function TicketsBandejaDesktop({
    tickets,
    isLoading,
    onAssignTicket,
    onViewDetails,
    sortOrder,
    onSortChange
}) {
    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!tickets || tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-fade-in bg-white rounded-xl border border-dashed border-slate-200">
                <div className="bg-emerald-50 p-4 rounded-full mb-4">
                    <Icon name="done_all" size="48px" className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700 mb-2">¡Bandeja Limpia!</h2>
                <p className="text-slate-500 max-w-md">No hay tickets pendientes de asignación en este momento.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 font-heading tracking-tight">
                        Bandeja de Entrada
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Mostrando <span className="font-bold text-slate-700">{tickets.length}</span> ticket(s) sin asignar.
                    </p>
                </div>

                <div className="w-64">
                    <Select
                        options={[
                            { value: 'asc', label: 'Más antiguos primero' },
                            { value: 'desc', label: 'Más recientes primero' }
                        ]}
                        value={sortOrder}
                        onChange={(val) => onSortChange(val)}
                    />
                </div>
            </div>

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
        </div>
    );
}