import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // 🟢 1. Importamos useSearchParams
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { useNotifyStore } from '@/stores/notify-store';
import { useSyncStore } from '@/stores/sync-store';
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
    const [searchParams, setSearchParams] = useSearchParams(); // 🟢 2. Inicializamos el hook

    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;
    const setNoLeidas = useNotifyStore((state) => state.setNoLeidas);
    const resetNotifyStore = useNotifyStore((state) => state.reset);
    const decrementNotifyStore = useNotifyStore((state) => state.decrement);

    const lastUpdate = useSyncStore((state) => state.lastUpdate);
    const prevUpdate = useRef(lastUpdate);

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

    // 🟢 3. INTERCEPTOR DE REFRESH FORZADO
    useEffect(() => {
        if (searchParams.has('refresh')) {
            const params = { page: 1, limit: LIMIT };
            if (soloNoLeidas) params.soloNoLeidas = true;
            if (filtroTipo) params.tipo = filtroTipo;

            fetchNotificaciones(params, false, true); // Silent refresh
            setPage(1);

            // Limpiamos el parámetro de la URL
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('refresh');
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams, soloNoLeidas, filtroTipo, fetchNotificaciones]);

    // 🟢 4. INTERCEPTOR DE DEEP LINK (Push Notifications)
    useEffect(() => {
        const ticketId = searchParams.get('ticketId');

        if (ticketId && !isNaN(Number(ticketId))) {
            const fetchFromUrl = async () => {
                setFetchingTicket(true);
                try {
                    const ticket = await getTicketById(Number(ticketId));
                    setActiveTicket(ticket);
                    setDetailOpen(true);
                } catch (err) {
                    notify.error('No se pudo cargar el ticket solicitado.');
                } finally {
                    setFetchingTicket(false);
                }
            };

            fetchFromUrl();

            // Limpiamos la URL silenciosamente para evitar bucles si recarga
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('ticketId');
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        const params = { page: 1, limit: LIMIT };
        if (soloNoLeidas) params.soloNoLeidas = true;
        if (filtroTipo) params.tipo = filtroTipo;

        fetchNotificaciones(params, false, false);
        setPage(1);
    }, [soloNoLeidas, filtroTipo, fetchNotificaciones]);

    useEffect(() => {
        if (prevUpdate.current !== lastUpdate) {
            prevUpdate.current = lastUpdate;

            const params = { page: 1, limit: LIMIT * page };
            if (soloNoLeidas) params.soloNoLeidas = true;
            if (filtroTipo) params.tipo = filtroTipo;

            fetchNotificaciones(params, false, true);
        }
    }, [lastUpdate, page, soloNoLeidas, filtroTipo, fetchNotificaciones]);

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

        fetchNotificaciones(params, true, false);
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

        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al cambiar estado.';
            notify.error(msg);
            throw err;
        } finally {
            setChangeSubmit(false);
        }
    }, [activeNotif, markActioned]);

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