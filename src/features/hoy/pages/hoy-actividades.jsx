// src/features/hoy/pages/hoy-actividades.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useHoy } from '../hooks/use-hoy';
import { HoyActividadesDesktop } from '../views/hoy-actividades-desktop';
import { HoyActividadesMobile } from '../views/hoy-actividades-mobile';
import { HoyFormModal } from '../components/common/hoy-form-modal';
import { MobileHoyFormModal } from '../components/common/mobile-hoy-form-modal';
import { BacklogRescheduleDrawer } from '../components/common/backlog-reschedule-drawer';
import { createTicket, createTicketsBatch } from '@/features/tickets/api/tickets-api';



export default function HoyActividadesPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;

    const [searchParams, setSearchParams] = useSearchParams();
    const highlightId = searchParams.get('highlight');

    const {
        tickets: allTickets,
        tecnicos,
        loading,
        submitting,
        fetchTickets,
        fetchTecnicos,
        updateTicket,
        changeStatus,
        // Métricas server-side (mismo where que la tabla)
        resumenEstados,
        totalAbsoluto,
    } = useHoy('actividades');

    const [dateOffset, setDateOffset] = useState(0);
    const [showCreate, setShowCreate] = useState(false);
    const [query, setQuery] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroResponsable, setFiltroResponsable] = useState('');
    const [mostrarAtrasadas, setMostrarAtrasadas] = useState(false);
    const [isDrawerAmnistiaOpen, setIsDrawerAmnistiaOpen] = useState(false);
    const [mostrarRechazadas, setMostrarRechazadas] = useState(false);
    const [vistaEquipo, setVistaEquipo] = useState(true);

    const handleDateOffsetChange = useCallback((offset) => {
        setDateOffset(offset);
        setQuery('');
        setFiltroEstado('TODOS');
        setFiltroTipo('');
        setFiltroPrioridad('');
        setFiltroCategoria('');
        setFiltroResponsable('');
        setMostrarAtrasadas(false);
        setIsDrawerAmnistiaOpen(false);
        setMostrarRechazadas(false);
        setVistaEquipo(true);
        if (highlightId) setSearchParams({});
    }, [highlightId, setSearchParams]);

    const queryPayload = useMemo(() => {
        const params = { limit: 200 };

        if (dateOffset === 0) {
            params.perteneceAHoy = true;
        } else if (dateOffset === 1) {
            params.venceManana = true;
        } else {
            const targetDate = new Date(Date.now() + dateOffset * 86400000);
            const fechaStr = targetDate.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
            params.vencimientoDesde = fechaStr;
            params.vencimientoHasta = fechaStr;
        }

        if (query) params.q = query;

        if (mostrarRechazadas) {
            params.estado = 'RECHAZADO';
        } else if (filtroEstado !== 'TODOS') {
            params.estado = filtroEstado;
        }

        if (filtroTipo) params.tipo = filtroTipo;
        if (filtroPrioridad) params.prioridad = filtroPrioridad;
        if (filtroCategoria) params.categoria = filtroCategoria;

        if (filtroResponsable) {
            params.responsableId = filtroResponsable;
        } else if (currentUser?.rol === 'COORDINADOR_MTTO' && !vistaEquipo) {
            params.responsableId = currentUser.id;
        }

        if (mostrarAtrasadas) params.vencidos = true;

        return params;
    }, [dateOffset, query, filtroEstado, filtroTipo, filtroPrioridad, filtroCategoria, filtroResponsable, mostrarAtrasadas, mostrarRechazadas, currentUser, vistaEquipo]);

    const loadTickets = useCallback(() => {
        fetchTickets(queryPayload).catch(() => notify.error('Error al cargar las actividades.'));
    }, [fetchTickets, queryPayload]);

    useEffect(() => { loadTickets(); }, [loadTickets]);
    useEffect(() => { fetchTecnicos(); }, [fetchTecnicos]);

    const totalHoy = useMemo(() => dateOffset === 0 ? allTickets.length : 0, [allTickets, dateOffset]);
    const totalManana = useMemo(() => dateOffset === 1 ? allTickets.length : 0, [allTickets, dateOffset]);
    const ticketsAtrasados = useMemo(() => allTickets.filter(t => t.isOverdue === true), [allTickets]);
    const totalAtrasadas = useMemo(() => ticketsAtrasados.length, [ticketsAtrasados]);
    const totalRechazadas = useMemo(() => allTickets.filter(t => t.estado === 'RECHAZADO').length, [allTickets]);

    // conteos y totalParaSummary vienen del backend (resumenEstados del response)
    // scope=actividades forzado en backend garantiza que las métricas incluyan solo sin máquina.
    const conteos = resumenEstados;
    const totalParaSummary = totalAbsoluto;

    const equipoCount = useMemo(() => allTickets.length, [allTickets]);
    const misTareasCount = useMemo(() => {
        return allTickets.filter(t => t.responsables?.some(r => String(r.id) === String(currentUser?.id))).length;
    }, [allTickets, currentUser]);

    const handleCreate = async (payloads) => {
        if (Array.isArray(payloads) && payloads.length > 0 && !(payloads[0] instanceof FormData)) {
            try {
                await createTicketsBatch(payloads);
                notify.success(`${payloads.length} actividad${payloads.length !== 1 ? 'es' : ''} creada${payloads.length !== 1 ? 's' : ''} correctamente.`);
                setShowCreate(false);
                loadTickets();
            } catch (err) {
                notify.error(err?.response?.data?.error || err?.response?.data?.message || 'Error al crear las actividades.');
                throw err;
            }
            return;
        }
        const items = Array.isArray(payloads) ? payloads : [payloads];
        try {
            for (const payload of items) await createTicket(payload);
            notify.success(items.length > 1 ? `${items.length} actividades creadas correctamente.` : 'Actividad creada correctamente.');
            setShowCreate(false);
            loadTickets();
        } catch (err) {
            notify.error(err?.response?.data?.error || err?.response?.data?.message || 'Error al crear la actividad.');
            throw err;
        }
    };

    const handleUpdate = async (id, payload) => {
        try {
            await updateTicket(id, payload);
            notify.success('Actividad actualizada correctamente.');
            loadTickets();
        } catch (err) {
            notify.error(err?.response?.data?.error || err?.response?.data?.message || 'Error al actualizar.');
            throw err;
        }
    };

    const handleChangeStatus = async (id, payload) => {
        try {
            await changeStatus(id, payload);
            notify.success('Estado actualizado correctamente.');
            loadTickets();
        } catch (err) {
            notify.error(err?.response?.data?.error || err?.response?.data?.message || 'Error al cambiar estado.');
            throw err;
        }
    };

    const toApproveCount = useMemo(() => {
        return allTickets.filter(t => t.estado === 'RESUELTO').length;
    }, [allTickets]);

    const sharedProps = {
        tickets: allTickets,
        toApproveCount,
        highlightId,
        loading,
        submitting,
        currentUser,
        tecnicos,
        dateOffset,
        onDateOffsetChange: handleDateOffsetChange,
        totalHoy,
        totalManana,
        totalParaSummary,
        conteos,
        totalAtrasadas,
        query,
        onSearchChange: setQuery,
        filtroEstado,
        onEstadoChange: setFiltroEstado,
        filtroTipo,
        onTipoChange: setFiltroTipo,
        filtroPrioridad,
        onPrioridadChange: setFiltroPrioridad,
        filtroCategoria,
        onCategoriaChange: setFiltroCategoria,
        filtroResponsable,
        onResponsableChange: setFiltroResponsable,
        mostrarAtrasadas,
        onToggleAtrasadas: () => setMostrarAtrasadas(p => !p),
        onOpenDrawerAmnistia: () => setIsDrawerAmnistiaOpen(true),
        mostrarRechazadas,
        onToggleRechazadas: () => setMostrarRechazadas(p => !p),
        vistaEquipo,
        onVistaEquipoChange: setVistaEquipo,
        equipoCount,
        misTareasCount,
        existenciaGlobal: { 'RECHAZADO': totalRechazadas },
        totalAtrasadasGlobal: totalAtrasadas,
        onSave: handleUpdate,
        onChangeStatus: handleChangeStatus,
        onOpenCreate: () => setShowCreate(true),
        onRefresh: loadTickets,
    };

    return (
        <>
            {isDesktop ? <HoyActividadesDesktop {...sharedProps} /> : <HoyActividadesMobile {...sharedProps} />}
            {isDesktop ? (
                <HoyFormModal scope="actividades" isOpen={showCreate} onClose={() => setShowCreate(false)} ticketAEditar={null} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={handleCreate} />
            ) : (
                <MobileHoyFormModal scope="actividades" isOpen={showCreate} onClose={() => setShowCreate(false)} ticketAEditar={null} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={handleCreate} />
            )}
            <BacklogRescheduleDrawer
                isOpen={isDrawerAmnistiaOpen}
                onClose={() => setIsDrawerAmnistiaOpen(false)}
                ticketsAtrasados={ticketsAtrasados}
                onSuccessSincronizacion={loadTickets}
                scope="actividades"
            />
        </>
    );
}