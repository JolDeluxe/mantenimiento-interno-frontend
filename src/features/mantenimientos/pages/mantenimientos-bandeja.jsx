// src/features/mantenimientos/pages/mantenimientos-bandeja.jsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useMantenimientos } from '../hooks/use-mantenimientos';
import { useTicketsUiStore } from '@/stores/tickets-ui-store';
import { notify } from '@/components/notification/adaptive-notify';

import { MantenimientosBandejaDesktop } from '../views/mantenimientos-bandeja-desktop';
import { MantenimientosBandejaMobile } from '../views/mantenimientos-bandeja-mobile';
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

export default function MantenimientosBandejaPage() {
    const isDesktop = useIsDesktop();
    const setUnassignedCount = useTicketsUiStore((s) => s.setUnassignedCount);

    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);

    const {
        mantenimientos: tickets,
        meta,
        loading: isLoading,
        fetchMantenimientos: fetchTickets,
        updateMantenimiento: updateTicket,
    } = useMantenimientos();

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

    const unassignedTickets = useMemo(() => {
        if (!tickets || tickets.length === 0) return [];
        return tickets.filter(t => !t.responsables || t.responsables.length === 0);
    }, [tickets]);

    useEffect(() => {
        setUnassignedCount(unassignedTickets.length);
    }, [unassignedTickets.length, setUnassignedCount]);

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
                tiempoEstimado: payload.tiempoEstimado,
                horaInicioProgramada: payload.horaInicioProgramada,
                horaFinProgramada: payload.horaFinProgramada,
            });
            notify.success('Mantenimiento asignado correctamente');
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
                <MantenimientosBandejaDesktop
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
                <MantenimientosBandejaMobile
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