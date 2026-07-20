// src/features/hoy/pages/hoy-mantenimientos.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useHoy } from '../hooks/use-hoy';
import { HoyMantenimientosDesktop } from '../views/hoy-mantenimientos-desktop';
import { HoyMantenimientosMobile } from '../views/hoy-mantenimientos-mobile';
import { HoyFormModal } from '../components/common/hoy-form-modal';
import { MobileHoyFormModal } from '../components/common/mobile-hoy-form-modal';
import { BacklogRescheduleDrawer } from '../components/common/backlog-reschedule-drawer';
import { createTicket, createTicketsBatch } from '@/features/tickets/api/tickets-api';
import { buildHoyDateParams, getDefaultHoyVista, getMetricTotalForVista, puedeFiltrarAtrasadasRechazadas } from '../utils/date-filters';



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
        changeStatus,
        // Métricas server-side (mismo where que la tabla)
        metricas,
        resumenEstados,
    } = useHoy('mantenimientos');

    const [vistaActiva, setVistaActiva] = useState(getDefaultHoyVista('mantenimientos'));
    const [showCreate, setShowCreate] = useState(false);
    const [query, setQuery] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroClasificacion, setFiltroClasificacion] = useState('');
    const [filtroCriticidad, setFiltroCriticidad] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroResponsable, setFiltroResponsable] = useState('');
    const [mostrarAtrasadas, setMostrarAtrasadas] = useState(false);
    const [isDrawerAmnistiaOpen, setIsDrawerAmnistiaOpen] = useState(false);
    const [mostrarRechazadas, setMostrarRechazadas] = useState(false);
    const [vistaEquipo, setVistaEquipo] = useState(true);

    const handleVistaActivaChange = useCallback((vista) => {
        setVistaActiva(vista);
        setMostrarAtrasadas(false);
        setIsDrawerAmnistiaOpen(false);
        setMostrarRechazadas(false);
        if (highlightId) setSearchParams({});
    }, [highlightId, setSearchParams]);

    const queryPayload = useMemo(() => {
        const params = { limit: 200 };

        Object.assign(params, buildHoyDateParams(vistaActiva, 'mantenimientos'));

        if (query) params.q = query;

        if (mostrarRechazadas) {
            params.estado = 'RECHAZADO';
        } else if (filtroEstado !== 'TODOS') {
            params.estado = filtroEstado;
        }

        if (filtroTipo) params.tipo = filtroTipo;
        if (filtroClasificacion) params.clasificacion = filtroClasificacion;
        if (filtroCriticidad) params.criticidadMaquina = filtroCriticidad;
        if (filtroPrioridad) params.prioridad = filtroPrioridad;
        if (filtroCategoria) params.categoria = filtroCategoria;

        if (filtroResponsable) {
            params.responsableId = filtroResponsable;
        } else if (currentUser?.rol === 'COORDINADOR_MTTO' && !vistaEquipo) {
            params.responsableId = currentUser.id;
        }

        if (mostrarAtrasadas) params.vencidos = true;

        return params;
    }, [vistaActiva, query, filtroEstado, filtroTipo, filtroClasificacion, filtroCriticidad, filtroPrioridad, filtroCategoria, filtroResponsable, mostrarAtrasadas, mostrarRechazadas, currentUser, vistaEquipo]);

    const loadTickets = useCallback(() => {
        fetchTickets(queryPayload).catch(() => notify.error('Error al cargar los mantenimientos.'));
    }, [fetchTickets, queryPayload]);

    useEffect(() => { loadTickets(); }, [loadTickets]);
    useEffect(() => { fetchTecnicos(); }, [fetchTecnicos]);

    const totalHoy = metricas?.totalHoy ?? 0;
    const totalManana = metricas?.totalManana ?? 0;
    const totalSemana = metricas?.totalSemana ?? 0;
    const totalPrimeraVista = metricas?.totalMes ?? 0;
    const totalVistaActiva = getMetricTotalForVista(metricas, vistaActiva, 'mantenimientos');
    const totalAtrasadas = metricas?.totalAtrasadas ?? 0;
    const totalRechazadas = metricas?.totalRechazadas ?? 0;
    const equipoCount = metricas?.equipoCount ?? 0;
    const misTareasCount = metricas?.misTareasCount ?? 0;
    const backlogTicketsForDrawer = useMemo(() => allTickets.filter(t => t.isOverdue === true), [allTickets]);

    // conteos y totalParaSummary vienen del backend (resumenEstados del response)
    // scope=mantenimientos forzado en backend garantiza métricas de solo tareas con máquina.
    const conteos = resumenEstados;
    const totalParaSummary = totalVistaActiva;

    const handleCreate = async (payloads) => {
        if (payloads === null) {
            // Es un mantenimiento recurrente que ya fue guardado en el formulario
            notify.success('Mantenimiento recurrente creado con éxito.');
            setShowCreate(false);
            loadTickets();
            return;
        }
        if (Array.isArray(payloads) && payloads.length > 0 && !(payloads[0] instanceof FormData)) {
            try {
                await createTicketsBatch(payloads);
                notify.success(`${payloads.length} mantenimiento${payloads.length !== 1 ? 's' : ''} creado${payloads.length !== 1 ? 's' : ''} correctamente.`);
                setShowCreate(false);
                loadTickets();
            } catch (err) {
                const errStr = err?.response?.data?.error || err?.response?.data?.message || '';
                const isConflict = err?.response?.status === 409 || errStr.includes('Conflicto') || errStr.includes('ya tiene programada');
                if (!isConflict) {
                    notify.error(errStr || 'Error al crear los mantenimientos.');
                }
                throw err;
            }
            return;
        }
        const items = Array.isArray(payloads) ? payloads : [payloads];
        try {
            for (const payload of items) await createTicket(payload);
            notify.success(items.length > 1 ? `${items.length} mantenimientos creados correctamente.` : 'Mantenimiento creado correctamente.');
            setShowCreate(false);
            loadTickets();
        } catch (err) {
            const errStr = err?.response?.data?.error || err?.response?.data?.message || '';
            const isConflict = err?.response?.status === 409 || errStr.includes('Conflicto') || errStr.includes('ya tiene programada');
            if (!isConflict) {
                notify.error(errStr || 'Error al crear el mantenimiento.');
            }
            throw err;
        }
    };

    const handleUpdate = async (id, payload) => {
        try {
            await updateTicket(id, payload);
            notify.success('Mantenimiento actualizado correctamente.');
            loadTickets();
        } catch (err) {
            const errStr = err?.response?.data?.error || err?.response?.data?.message || '';
            const isConflict = err?.response?.status === 409 || errStr.includes('Conflicto') || errStr.includes('ya tiene programada');
            if (!isConflict) {
                notify.error(errStr || 'Error al actualizar.');
            }
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

    const handleToggleAtrasadas = useCallback(() => {
        setMostrarAtrasadas((prev) => !prev);
        setMostrarRechazadas(false);
        setFiltroEstado('TODOS');
    }, []);

    const handleToggleRechazadas = useCallback(() => {
        setMostrarRechazadas((prev) => !prev);
        setMostrarAtrasadas(false);
        setIsDrawerAmnistiaOpen(false);
        setFiltroEstado('TODOS');
    }, []);

    const toApproveCount = resumenEstados?.RESUELTO ?? 0;

    const sharedProps = {
        tickets: allTickets,
        toApproveCount,
        highlightId,
        loading,
        submitting,
        currentUser,
        tecnicos,
        vistaActiva,
        onVistaActivaChange: handleVistaActivaChange,
        puedeFiltrarAtrasadasRechazadas: puedeFiltrarAtrasadasRechazadas(vistaActiva),
        totalHoy,
        totalManana,
        totalSemana,
        totalPrimeraVista,
        totalVistaActiva,
        totalParaSummary,
        conteos,
        totalAtrasadas,
        query,
        onSearchChange: setQuery,
        filtroEstado,
        onEstadoChange: setFiltroEstado,
        filtroTipo,
        onTipoChange: setFiltroTipo,
        filtroClasificacion,
        onClasificacionChange: setFiltroClasificacion,
        filtroCriticidad,
        onCriticidadChange: setFiltroCriticidad,
        filtroPrioridad,
        onPrioridadChange: setFiltroPrioridad,
        filtroCategoria,
        onCategoriaChange: setFiltroCategoria,
        filtroResponsable,
        onResponsableChange: setFiltroResponsable,
        mostrarAtrasadas,
        onToggleAtrasadas: handleToggleAtrasadas,
        onOpenDrawerAmnistia: () => setIsDrawerAmnistiaOpen(true),
        mostrarRechazadas,
        onToggleRechazadas: handleToggleRechazadas,
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
                <HoyFormModal defaultModoLista={false} scope="mantenimientos" isOpen={showCreate} onClose={() => setShowCreate(false)} ticketAEditar={null} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={handleCreate} />
            ) : (
                <MobileHoyFormModal defaultModoLista={false} scope="mantenimientos" isOpen={showCreate} onClose={() => setShowCreate(false)} ticketAEditar={null} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={handleCreate} />
            )}
            <BacklogRescheduleDrawer
                isOpen={isDrawerAmnistiaOpen}
                onClose={() => setIsDrawerAmnistiaOpen(false)}
                ticketsAtrasados={backlogTicketsForDrawer}
                onSuccessSincronizacion={loadTickets}
                scope="mantenimientos"
            />
        </>
    );
}
