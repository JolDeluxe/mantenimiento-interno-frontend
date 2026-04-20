// src/features/tickets/pages/tickets-bandeja.jsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTickets } from '@/features/tickets/hooks/use-tickets';
import { useTicketsUiStore } from '@/stores/tickets-ui-store';
import { notify } from '@/components/notification/adaptive-notify';

import { TicketsBandejaDesktop } from '../views/tickets-bandeja-desktop';
import { TicketsBandejaMobile } from '../views/tickets-bandeja-mobile';
import { BandejaAssignModal } from '../components/bandeja/bandeja-assign-modal';
import { BandejaDetailModal } from '../components/bandeja/bandeja-detail-modal';

const getSortPayload = (order) => {
    switch (order) {
        case 'prioridad-desc': return JSON.stringify([{ prioridad: 'desc' }]);
        case 'prioridad-asc': return JSON.stringify([{ prioridad: 'asc' }]);
        case 'vencimiento-asc': return JSON.stringify([{ fechaVencimiento: 'asc' }]);
        case 'asc': return JSON.stringify([{ createdAt: 'asc' }]);
        default: return JSON.stringify([{ createdAt: 'desc' }]);
    }
};

export default function TicketsBandejaPage() {
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const setUnassignedCount = useTicketsUiStore((s) => s.setUnassignedCount);

    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);

    const {
        tickets,
        meta,
        loading: isLoading,
        fetchTickets,
        updateTicket,
    } = useTickets();

    // ── Congelar el payload para que useCallback/useEffect sean estables ──
    const queryPayload = useMemo(() => ({
        tipo: 'TICKET',
        estado: 'PENDIENTE',
        sort: getSortPayload(sortOrder),
        page,
        limit: 12,
    }), [sortOrder, page]);

    const loadTickets = useCallback(() => {
        fetchTickets(queryPayload);
    }, [fetchTickets, queryPayload]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    // ── Filtrar sin asignados y sincronizar el contador global ─────────────
    const unassignedTickets = useMemo(() => {
        if (!tickets || tickets.length === 0) return [];
        return tickets.filter(t => !t.responsables || t.responsables.length === 0);
    }, [tickets]);

    useEffect(() => {
        setUnassignedCount(unassignedTickets.length);
    }, [unassignedTickets.length, setUnassignedCount]);

    // ── Mapear meta a la forma {total, totalPages, page} que esperan las vistas ──
    // El hook retorna `meta`, no `pagination`. Esta era la causa del bug.
    const pagination = useMemo(() => ({
        total: meta?.totalFiltrado ?? 0,
        totalPages: meta?.totalPages ?? 1,
        page,
    }), [meta, page]);

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenAssignModal = useCallback((ticket) => {
        setSelectedTicket(ticket);
        setIsAssignModalOpen(true);
    }, []);

    const handleOpenDetailModal = useCallback((ticket) => {
        setSelectedTicket(ticket);
        setIsDetailModalOpen(true);
    }, []);

    const handleConfirmAssign = useCallback(async (payload) => {
        try {
            setIsSubmitting(true);
            await updateTicket(payload.ticketId, {
                responsables: payload.responsables,
                fechaVencimiento: payload.fechaVencimiento || payload.fechaProgramada,
                prioridad: payload.prioridad,
                estado: payload.estado,
            });
            notify.success('Ticket asignado correctamente');
            loadTickets();
            setIsAssignModalOpen(false);
            setTimeout(() => setSelectedTicket(null), 200);
        } catch (error) {
            notify.error(error.response?.data?.message || 'Ocurrió un error al asignar');
        } finally {
            setIsSubmitting(false);
        }
    }, [updateTicket, loadTickets]);

    const handleSortChange = useCallback((val) => {
        setSortOrder(val);
        setPage(1);
    }, []);

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
                    onRefresh={loadTickets}
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
                    onRefresh={loadTickets}
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