// src/features/tickets/views/tickets-bandeja-mobile.jsx
import React from 'react';
import { Spinner, Icon } from '@/components/ui/z_index';
import { Select } from '@/components/form/z_index';
import { BandejaTicketCard } from '../components/bandeja/bandeja-ticket-card';

export default function TicketsBandejaMobile({
    tickets,
    isLoading,
    onAssignTicket,
    onViewDetails,
    sortOrder,
    onSortChange
}) {
    if (isLoading) {
        return (
            <div className="flex flex-col p-4 gap-4">
                <div className="h-32 bg-slate-100 animate-pulse rounded-xl"></div>
                <div className="h-32 bg-slate-100 animate-pulse rounded-xl"></div>
            </div>
        );
    }

    if (!tickets || tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 mt-10 text-center animate-fade-in">
                <div className="bg-emerald-50 p-4 rounded-full mb-4">
                    <Icon name="done_all" size="48px" className="text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-700 mb-2">Bandeja Limpia</h2>
                <p className="text-sm text-slate-500">No hay tickets pendientes.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col px-4 pb-24 gap-4 animate-fade-in">
            <div className="pt-2 pb-1 flex flex-col gap-3">
                <div>
                    <h2 className="text-xl font-black text-slate-800 font-heading">
                        Nuevos Tickets ({tickets.length})
                    </h2>
                </div>
                <Select
                    options={[
                        { value: 'asc', label: 'Más antiguos primero' },
                        { value: 'desc', label: 'Más recientes primero' }
                    ]}
                    value={sortOrder}
                    onChange={(val) => onSortChange(val)}
                />
            </div>

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
        </div>
    );
}