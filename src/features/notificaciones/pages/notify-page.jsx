import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { useNotifyStore } from '@/stores/notify-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useNotify } from '../hooks/use-notify';
import { NotifyDesktop } from '../views/notify-desktop';
import { NotifyMobile } from '../views/notify-mobile';
import { NotifyDetailModal } from '../components/notify-detail-modal';
import { NotifyReviewModal } from '../components/notify-review-modal';
import { NotifyStatusModal } from '../components/notify-status-modal';
import { getTicketById, changeTicketStatus } from '@/features/tickets/api/tickets-api';

const LIMIT = 20;

export default function NotifyPage() {
    const isDesktop = useIsDesktop();
    const navigate = useNavigate();

    // Selectores atómicos para evitar bucles de renderizado
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;
    const setNoLeidas = useNotifyStore((state) => state.setNoLeidas);
    const resetNotifyStore = useNotifyStore((state) => state.reset);
    const decrementNotifyStore = useNotifyStore((state) => state.decrement);

    const {
        notificaciones, loading, loadingMore, submitting, meta,
        fetchNotificaciones, markRead, markAllRead, markActioned,
    } = useNotify();

    const [soloNoLeidas, setSoloNoLeidas] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState('');
    const [page, setPage] = useState(1);

    const [activeTicket, setActiveTicket] = useState(null);
    const [activeNotif, setActiveNotif] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [fetchingTicket, setFetchingTicket] = useState(false);
    const [changeSubmit, setChangeSubmit] = useState(false);

    // Carga inicial y reacción a filtros
    useEffect(() => {
        const params = { page: 1, limit: LIMIT };
        if (soloNoLeidas) params.soloNoLeidas = true;
        if (filtroTipo) params.tipo = filtroTipo;

        fetchNotificaciones(params, false);
        setPage(1);
    }, [soloNoLeidas, filtroTipo, fetchNotificaciones]);

    // Sincronización segura con el badge global
    useEffect(() => {
        if (meta.noLeidas !== undefined) {
            setNoLeidas(meta.noLeidas);
        }
    }, [meta.noLeidas, setNoLeidas]);

    const handleLoadMore = useCallback(() => {
        if (page >= meta.totalPages || loadingMore) return;

        const nextPage = page + 1;
        const params = { page: nextPage, limit: LIMIT };
        if (soloNoLeidas) params.soloNoLeidas = true;
        if (filtroTipo) params.tipo = filtroTipo;

        fetchNotificaciones(params, true);
        setPage(nextPage);
    }, [page, meta.totalPages, loadingMore, soloNoLeidas, filtroTipo, fetchNotificaciones]);

    const handleToggleNoLeidas = useCallback(() => {
        setSoloNoLeidas((p) => !p);
    }, []);

    const handleTipoChange = useCallback((t) => {
        setFiltroTipo(t);
    }, []);

    const handleMarkAllRead = useCallback(async () => {
        await markAllRead();
        resetNotifyStore();
    }, [markAllRead, resetNotifyStore]);

    const handleAction = useCallback(async (notificacion, actionKey) => {
        if (!notificacion.leida) {
            markRead(notificacion.id);
            decrementNotifyStore();
        }

        if (actionKey === 'ir_a_hoy') {
            navigate(`/tickets/hoy?highlight=${notificacion.tareaId}`);
            return;
        }

        if (actionKey === 'ir_a_bandeja') {
            navigate('/tickets/bandeja');
            return;
        }

        if (!notificacion.tareaId) return;

        setActiveNotif(notificacion);
        setFetchingTicket(true);

        try {
            const ticket = await getTicketById(notificacion.tareaId);
            setActiveTicket(ticket);

            if (actionKey === 'ver_detalle') setDetailOpen(true);
            else if (actionKey === 'iniciar') setStatusOpen(true);
            else if (actionKey === 'revisar') setReviewOpen(true);
        } catch {
            notify.error('No se pudo cargar la tarea. Puede que ya no tengas acceso.');
            setActiveNotif(null);
        } finally {
            setFetchingTicket(false);
        }
    }, [markRead, navigate, decrementNotifyStore]);

    const handleChangeStatus = useCallback(async (id, payload) => {
        setChangeSubmit(true);
        try {
            await changeTicketStatus(id, payload);
            notify.success('Estado actualizado correctamente.');

            if (activeNotif?.id) {
                markActioned(activeNotif.id);
            }

            setStatusOpen(false);
            setReviewOpen(false);
            setActiveTicket(null);
            setActiveNotif(null);

            fetchNotificaciones({ page: 1, limit: LIMIT * page, soloNoLeidas, tipo: filtroTipo }, false);
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al cambiar estado.';
            notify.error(msg);
            throw err;
        } finally {
            setChangeSubmit(false);
        }
    }, [activeNotif, markActioned, fetchNotificaciones, page, soloNoLeidas, filtroTipo]);

    const handleCloseModals = useCallback(() => {
        setDetailOpen(false);
        setReviewOpen(false);
        setStatusOpen(false);
        setActiveTicket(null);
        setActiveNotif(null);
    }, []);

    const sharedProps = {
        notificaciones,
        loading: loading || fetchingTicket,
        loadingMore,
        submitting,
        currentUser,
        meta,
        soloNoLeidas,
        filtroTipo,
        hasMore: page < meta.totalPages,
        onToggleNoLeidas: handleToggleNoLeidas,
        onTipoChange: handleTipoChange,
        onLoadMore: handleLoadMore,
        onAction: handleAction,
        onMarkRead: markRead,
        onMarkAll: handleMarkAllRead,
    };

    return (
        <div className="max-w-full mx-auto p-1 lg:p-10 m-1">
            {isDesktop ? <NotifyDesktop {...sharedProps} /> : <NotifyMobile {...sharedProps} />}

            <NotifyDetailModal isOpen={detailOpen} onClose={handleCloseModals} ticket={activeTicket} />
            <NotifyReviewModal isOpen={reviewOpen} onClose={handleCloseModals} ticket={activeTicket} isSubmitting={changeSubmit} onConfirm={handleChangeStatus} />
            <NotifyStatusModal isOpen={statusOpen} onClose={handleCloseModals} ticket={activeTicket} currentUser={currentUser} isSubmitting={changeSubmit} onConfirm={handleChangeStatus} />
        </div>
    );
}