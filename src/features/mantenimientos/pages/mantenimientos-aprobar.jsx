// src/features/mantenimientos/pages/mantenimientos-aprobar.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useMantenimientos } from '../hooks/use-mantenimientos';

import { MantenimientosAprobarDesktop } from '../views/mantenimientos-aprobar-desktop';
import { MantenimientosAprobarMobile } from '../views/mantenimientos-aprobar-mobile';
import { MantenimientosDetailModal as AprobarDetailModal } from '../components/common/mantenimientos-detail-modal';
import { MantenimientosReviewModal as AprobarReviewModal } from '../components/common/mantenimientos-review-modal';
import { AprobarBatchDrawer } from '../components/mantenimientos-aprobar/aprobar-batch-drawer';

export default function MantenimientosAprobarPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data || user;

    const [page, setPage] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isApproveBatchOpen, setIsApproveBatchOpen] = useState(false);

    const {
        mantenimientos: tickets,
        meta,
        loading: isLoading,
        submitting: isSubmitting,
        fetchMantenimientos: fetchTickets,
        changeStatus
    } = useMantenimientos();

    const queryPayload = useMemo(() => ({
        estado: 'RESUELTO',
        page,
        limit: 100, // fetch all or a large batch for quick approval
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
                    ? 'Mantenimiento cerrado y aprobado con éxito' 
                    : 'Mantenimiento devuelto al técnico con observaciones'
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
                <MantenimientosAprobarDesktop
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
                <MantenimientosAprobarMobile
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
                    currentUser={currentUser}
                />
            )}

            {isApproveBatchOpen && (
                <AprobarBatchDrawer
                    isOpen={isApproveBatchOpen}
                    onClose={() => setIsApproveBatchOpen(false)}
                    tickets={tickets}
                    onSuccess={loadTickets}
                    scope="mantenimientos"
                />
            )}
        </>
    );
}
