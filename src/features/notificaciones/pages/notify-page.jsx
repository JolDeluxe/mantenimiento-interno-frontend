import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;
    const notifyStore = useNotifyStore();

    const {
        notificaciones, loading, submitting, meta,
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

    const loadData = useCallback(() => {
        const params = { page, limit: LIMIT };
        if (soloNoLeidas) params.soloNoLeidas = true;
        if (filtroTipo) params.tipo = filtroTipo;
        fetchNotificaciones(params);
    }, [page, soloNoLeidas, filtroTipo, fetchNotificaciones]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        if (meta.noLeidas !== undefined) notifyStore.setNoLeidas(meta.noLeidas);
    }, [meta.noLeidas]);

    const handleToggleNoLeidas = useCallback(() => {
        setSoloNoLeidas((p) => !p);
        setPage(1);
    }, []);

    const handleTipoChange = useCallback((t) => {
        setFiltroTipo(t);
        setPage(1);
    }, []);

    const handleMarkAllRead = useCallback(async () => {
        await markAllRead();
        notifyStore.reset();
    }, [markAllRead]);

    const handleAction = useCallback(async (notificacion, actionKey) => {
        if (!notificacion.leida) {
            markRead(notificacion.id);
            notifyStore.decrement();
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

            if (actionKey === 'ver_detalle') {
                setDetailOpen(true);
            } else if (actionKey === 'iniciar') {
                setStatusOpen(true);
            } else if (actionKey === 'revisar') {
                setReviewOpen(true);
            }
        } catch {
            notify.error('No se pudo cargar la tarea. Puede que ya no tengas acceso.');
            setActiveNotif(null);
        } finally {
            setFetchingTicket(false);
        }
    }, [markRead, navigate, notifyStore]);

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
            loadData();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al cambiar estado.';
            notify.error(msg);
            throw err;
        } finally {
            setChangeSubmit(false);
        }
    }, [loadData, activeNotif, markActioned]);

    const handleCloseDetail = useCallback(() => {
        setDetailOpen(false);
        setActiveTicket(null);
        setActiveNotif(null);
    }, []);

    const handleCloseReview = useCallback(() => {
        setReviewOpen(false);
        setActiveTicket(null);
        setActiveNotif(null);
    }, []);

    const handleCloseStatus = useCallback(() => {
        setStatusOpen(false);
        setActiveTicket(null);
        setActiveNotif(null);
    }, []);

    const sharedProps = {
        notificaciones,
        loading: loading || fetchingTicket,
        submitting,
        currentUser,
        meta,
        soloNoLeidas,
        filtroTipo,
        page,
        onToggleNoLeidas: handleToggleNoLeidas,
        onTipoChange: handleTipoChange,
        onPageChange: setPage,
        onAction: handleAction,
        onMarkRead: markRead,
        onMarkAll: handleMarkAllRead,
    };

    return (
        <div className="max-w-full mx-auto p-1 lg:p-4">
            {isDesktop
                ? <NotifyDesktop {...sharedProps} />
                : <NotifyMobile  {...sharedProps} />
            }

            <NotifyDetailModal
                isOpen={detailOpen}
                onClose={handleCloseDetail}
                ticket={activeTicket}
            />

            <NotifyReviewModal
                isOpen={reviewOpen}
                onClose={handleCloseReview}
                ticket={activeTicket}
                isSubmitting={changeSubmit}
                onConfirm={handleChangeStatus}
            />

            <NotifyStatusModal
                isOpen={statusOpen}
                onClose={handleCloseStatus}
                ticket={activeTicket}
                currentUser={currentUser}
                isSubmitting={changeSubmit}
                onConfirm={handleChangeStatus}
            />
        </div>
    );
}