// src/features/hoy/pages/hoy-mantenimientos.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useHoy } from '../hooks/use-hoy';
import { HoyMantenimientosDesktop } from '../views/hoy-mantenimientos-desktop';
import { HoyMantenimientosMobile } from '../views/hoy-mantenimientos-mobile';
import { HoyFormModal } from '../components/hoy-mantenimientos/hoy-form-modal';
import { MobileHoyFormModal } from '../components/hoy-mantenimientos/mobile-hoy-form-modal';
import { BacklogRescheduleDrawer } from '../components/hoy-mantenimientos/backlog-reschedule-drawer';

const ESTADOS_SUMMARY = ['ASIGNADA', 'EN_PROGRESO', 'EN_PAUSA', 'RESUELTO'];

export default function HoyMantenimientosPage() {
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
    } = useHoy('mantenimientos');

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
        fetchTickets(queryPayload).catch(() => notify.error('Error al cargar los mantenimientos.'));
    }, [fetchTickets, queryPayload]);

    useEffect(() => { loadTickets(); }, [loadTickets]);
    useEffect(() => { fetchTecnicos(); }, [fetchTecnicos]);

    const totalHoy = useMemo(() => dateOffset === 0 ? allTickets.length : 0, [allTickets, dateOffset]);
    const totalManana = useMemo(() => dateOffset === 1 ? allTickets.length : 0, [allTickets, dateOffset]);
    const ticketsAtrasados = useMemo(() => allTickets.filter(t => t.isOverdue === true), [allTickets]);
    const totalAtrasadas = useMemo(() => ticketsAtrasados.length, [ticketsAtrasados]);
    const totalRechazadas = useMemo(() => allTickets.filter(t => t.estado === 'RECHAZADO').length, [allTickets]);

    const conteos = useMemo(() => {
        return allTickets.reduce((acc, t) => {
            acc[t.estado] = (acc[t.estado] || 0) + 1;
            return acc;
        }, {});
    }, [allTickets]);

    const totalParaSummary = useMemo(() => {
        return Object.entries(conteos).reduce((acc, [estado, count]) => {
            return ESTADOS_SUMMARY.includes(estado) ? acc + count : acc;
        }, 0);
    }, [conteos]);

    const equipoCount = useMemo(() => allTickets.length, [allTickets]);
    const misTareasCount = useMemo(() => {
        return allTickets.filter(t => t.responsables?.some(r => String(r.id) === String(currentUser?.id))).length;
    }, [allTickets, currentUser]);

    const handleUpdate = async (id, payload) => {
        try {
            await updateTicket(id, payload);
            notify.success('Mantenimiento actualizado correctamente.');
            loadTickets();
        } catch (err) {
            notify.error(err?.response?.data?.error || err?.response?.data?.message || 'Error al actualizar.');
            throw err;
        }
    };

    const handleChangeStatus = async (id, payload) => {
        try {
            await updateTicket(id, payload);
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
            {isDesktop ? <HoyMantenimientosDesktop {...sharedProps} /> : <HoyMantenimientosMobile {...sharedProps} />}
            {isDesktop ? (
                <HoyFormModal isOpen={showCreate} onClose={() => setShowCreate(false)} ticketAEditar={null} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={loadTickets} />
            ) : (
                <MobileHoyFormModal isOpen={showCreate} onClose={() => setShowCreate(false)} ticketAEditar={null} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={loadTickets} />
            )}
            <BacklogRescheduleDrawer
                isOpen={isDrawerAmnistiaOpen}
                onClose={() => setIsDrawerAmnistiaOpen(false)}
                ticketsAtrasados={ticketsAtrasados}
                onSuccessSincronizacion={loadTickets}
            />
        </>
    );
}