// src/features/tickets/pages/tickets-aprobar.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useTickets } from '../hooks/use-tickets';

import { TicketsAprobarDesktop } from '../views/tickets-aprobar-desktop';
import { TicketsAprobarMobile } from '../views/tickets-aprobar-mobile';
import { AprobarDetailModal } from '../components/aprobar/aprobar-detail-modal';
import { AprobarReviewModal } from '../components/aprobar/aprobar-review-modal';

export default function TicketsAprobarPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data || user;

    const [page, setPage] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const {
        tickets,
        meta,
        loading: isLoading,
        submitting: isSubmitting,
        fetchTickets,
        changeStatus
    } = useTickets();

    const queryPayload = useMemo(() => ({
        estado: 'RESUELTO',
        page,
        limit: 12,
    }), [page]);

    const loadTickets = useCallback(() => {
        fetchTickets(queryPayload);
    }, [fetchTickets, queryPayload]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const pagination = useMemo(() => ({
        total: meta?.totalFiltrado ?? 0,
        totalPages: meta?.totalPages ?? 1,
        page,
    }), [meta, page]);

    const handleOpenDetail = useCallback((ticket) => {
        setSelectedTicket(ticket);
        setIsDetailModalOpen(true);
    }, []);

    const handleOpenReview = useCallback((ticket) => {
        setSelectedTicket(ticket);
        setIsReviewModalOpen(true);
    }, []);

    const handleConfirmReview = useCallback(async (id, formData) => {
        try {
            const decision = formData.get('estado');
            await changeStatus(id, formData);
            notify.success(
                decision === 'CERRADO' 
                    ? 'Ticket cerrado y aprobado con éxito' 
                    : 'Ticket devuelto al técnico con observaciones'
            );
            setIsReviewModalOpen(false);
            setTimeout(() => setSelectedTicket(null), 200);
            loadTickets();
        } catch (error) {
            notify.error(error.response?.data?.error || error.response?.data?.message || 'Error al procesar la revisión');
        }
    }, [changeStatus, loadTickets]);

    return (
        <>
            {isDesktop ? (
                <TicketsAprobarDesktop
                    tickets={tickets}
                    isLoading={isLoading}
                    onReviewTicket={handleOpenReview}
                    onViewDetails={handleOpenDetail}
                    pagination={pagination}
                    onPageChange={setPage}
                    onRefresh={loadTickets}
                />
            ) : (
                <TicketsAprobarMobile
                    tickets={tickets}
                    isLoading={isLoading}
                    onReviewTicket={handleOpenReview}
                    onViewDetails={handleOpenDetail}
                    pagination={pagination}
                    onPageChange={setPage}
                    onRefresh={loadTickets}
                />
            )}

            {selectedTicket && isDetailModalOpen && (
                <AprobarDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    ticket={selectedTicket}
                />
            )}

            {selectedTicket && isReviewModalOpen && (
                <AprobarReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    ticket={selectedTicket}
                    onConfirm={handleConfirmReview}
                    isSubmitting={isSubmitting}
                />
            )}
        </>
    );
}