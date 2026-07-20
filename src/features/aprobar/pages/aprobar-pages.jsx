import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useTickets } from '@/features/tickets/hooks/use-tickets';

import { AprobarDesktop } from '../views/aprobar-desktop';
import { AprobarMobile } from '../views/aprobar-mobile';
import { TicketDetailModal } from '@/features/common/components/ticket-detail-modal';
import { GlobalTicketReviewModal as AprobarReviewModal } from '@/features/common/components/global-ticket-review-modal';
import { AprobarBatchDrawer } from '../components/aprobar-batch-drawer';

export default function AprobarPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data || user;

    const [page, setPage] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isApproveBatchOpen, setIsApproveBatchOpen] = useState(false);

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
        limit: 100,
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
                    ? 'Tarea cerrada y aprobada con éxito'
                    : 'Tarea devuelta al técnico con observaciones'
            );
            setIsReviewModalOpen(false);
            setTimeout(() => setSelectedTicket(null), 200);
            loadTickets();
            window.dispatchEvent(new Event('refrescar-conteos'));
        } catch (error) {
            notify.error(error.response?.data?.error || error.response?.data?.message || 'Error al procesar la revisión');
        }
    }, [changeStatus, loadTickets]);

    return (
        <>
            {isDesktop ? (
                <AprobarDesktop
                    tickets={tickets}
                    isLoading={isLoading}
                    onReviewTicket={handleOpenReview}
                    onViewDetails={handleOpenDetail}
                    pagination={pagination}
                    onPageChange={setPage}
                    onRefresh={loadTickets}
                    onOpenApproveBatch={() => setIsApproveBatchOpen(true)}
                />
            ) : (
                <AprobarMobile
                    tickets={tickets}
                    isLoading={isLoading}
                    onReviewTicket={handleOpenReview}
                    onViewDetails={handleOpenDetail}
                    pagination={pagination}
                    onPageChange={setPage}
                    onRefresh={loadTickets}
                    onOpenApproveBatch={() => setIsApproveBatchOpen(true)}
                />
            )}

            {selectedTicket && isDetailModalOpen && (
                <TicketDetailModal
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
                    currentUser={currentUser}
                />
            )}

            {isApproveBatchOpen && (
                <AprobarBatchDrawer
                    isOpen={isApproveBatchOpen}
                    onClose={() => setIsApproveBatchOpen(false)}
                    tickets={tickets}
                    onSuccess={loadTickets}
                    scope="general"
                />
            )}
        </>
    );
}
