// src/features/tickets/pages/tickets-bandeja.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTickets } from '@/features/tickets/hooks/use-tickets';
import { notify } from '@/components/notification/adaptive-notify';

// Views & Modals
import { TicketsBandejaDesktop } from '../views/tickets-bandeja-desktop';
import { TicketsBandejaMobile } from '../views/tickets-bandeja-mobile';
import { BandejaAssignModal } from '../components/bandeja/bandeja-assign-modal';
import { BandejaDetailModal } from '../components/bandeja/bandeja-detail-modal';

// Traductor de ordenamiento para el Backend
const getSortPayload = (order) => {
    switch (order) {
        case 'prioridad-desc':
            return JSON.stringify([{ prioridad: 'desc' }]);
        case 'prioridad-asc':
            return JSON.stringify([{ prioridad: 'asc' }]);
        case 'vencimiento-asc':
            return JSON.stringify([{ fechaVencimiento: 'asc' }]);
        case 'asc':
            return JSON.stringify([{ createdAt: 'asc' }]);
        case 'desc':
        default:
            return JSON.stringify([{ createdAt: 'desc' }]);
    }
};

export default function TicketsBandejaPage() {
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    const [sortOrder, setSortOrder] = useState('desc'); // Mejor empezar con los más recientes
    const [page, setPage] = useState(1);

    const {
        tickets,
        pagination,
        loading: isLoading,
        fetchTickets,
        updateTicket
    } = useTickets();

    useEffect(() => {
        fetchTickets({
            tipo: 'TICKET',
            estado: 'PENDIENTE',
            sort: getSortPayload(sortOrder),
            page: page,
            limit: 12
        });
    }, [fetchTickets, sortOrder, page]);

    const unassignedTickets = useMemo(() => {
        if (!tickets || tickets.length === 0) return [];
        return tickets.filter(t => !t.responsables || t.responsables.length === 0);
    }, [tickets]);

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenAssignModal = (ticket) => {
        setSelectedTicket(ticket);
        setIsAssignModalOpen(true);
    };

    const handleOpenDetailModal = (ticket) => {
        setSelectedTicket(ticket);
        setIsDetailModalOpen(true);
    };

    const handleConfirmAssign = async (payload) => {
        try {
            setIsSubmitting(true);
            await updateTicket(payload.ticketId, {
                responsables: payload.responsables,
                fechaProgramada: payload.fechaProgramada,
                prioridad: payload.prioridad,
                estado: payload.estado
            });

            notify.success('Ticket asignado correctamente');
            fetchTickets({
                tipo: 'TICKET',
                estado: 'PENDIENTE',
                sort: getSortPayload(sortOrder),
                page: page,
                limit: 12
            });
            setIsAssignModalOpen(false);
            setTimeout(() => setSelectedTicket(null), 200);
        } catch (error) {
            notify.error(error.response?.data?.message || 'Ocurrió un error al asignar');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSortChange = (val) => {
        setSortOrder(val);
        setPage(1); // Reiniciamos a página 1 al cambiar orden
    };

    return (
        <>
            {isDesktop ? (
                <TicketsBandejaDesktop
                    tickets={unassignedTickets}
                    isLoading={isLoading}
                    onAssignTicket={handleOpenAssignModal}
                    onViewDetails={handleOpenDetailModal}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    pagination={pagination}
                    onPageChange={setPage}
                />
            ) : (
                <TicketsBandejaMobile
                    tickets={unassignedTickets}
                    isLoading={isLoading}
                    onAssignTicket={handleOpenAssignModal}
                    onViewDetails={handleOpenDetailModal}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    pagination={pagination}
                    onPageChange={setPage}
                />
            )}

            <BandejaAssignModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                ticket={selectedTicket}
                onConfirm={handleConfirmAssign}
                isSubmitting={isSubmitting}
            />

            {selectedTicket && (
                <BandejaDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    ticket={selectedTicket}
                />
            )}
        </>
    );
}