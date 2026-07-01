// src/features/mantenimientos/pages/mantenimientos-hoy.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useMantenimientos } from '../hooks/use-mantenimientos';
import { MantenimientosHoyDesktop } from '../views/mantenimientos-hoy-desktop';
import { MantenimientosHoyMobile } from '../views/mantenimientos-hoy-mobile';
import { HoyFormModal } from '../components/hoy/hoy-form-modal';
import { MobileHoyFormModal } from '../components/hoy/mobile-hoy-form-modal';
import { BacklogRescheduleDrawer } from '../components/hoy/backlog-reschedule-drawer';

const ESTADOS_SUMMARY = ['ASIGNADA', 'EN_PROGRESO', 'EN_PAUSA', 'RESUELTO'];

export default function MantenimientosHoyPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;

    const [searchParams, setSearchParams] = useSearchParams();
    const highlightId = searchParams.get('highlight');

    const {
        mantenimientos: allTickets,
        tecnicos,
        loading,
        submitting,
        fetchMantenimientos: fetchTickets,
        fetchTecnicos,
        createMantenimiento: createTicket,
        createBatch,
        updateMantenimiento: updateTicket,
        changeStatus,
    } = useMantenimientos();

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
        fetchTickets(queryPayload).catch(() => notify.error('Error al cargar las tareas.'));
    }, [fetchTickets, queryPayload]);

    useEffect(() => { loadTickets(); }, [loadTickets]);
    useEffect(() => { fetchTecnicos(); }, [fetchTecnicos]);

    const totalHoy = useMemo(() => dateOffset === 0 ? allTickets.length : 0, [allTickets, dateOffset]);
    const totalManana = useMemo(() => dateOffset === 1 ? allTickets.length : 0, [allTickets, dateOffset]);
    const ticketsAtrasados = useMemo(() => allTickets.filter(t => t.isOverdue === true), [allTickets]);
    const totalAtrasadas = useMemo(() => ticketsAtrasados.length, [ticketsAtrasados]);

    const filteredTickets = useMemo(() => {
        let list = [...allTickets];
        if (mostrarAtrasadas) {
            list = list.filter(t => t.isOverdue === true);
        }
        if (mostrarRechazadas) {
            list = list.filter(t => t.estado === 'RECHAZADO');
        } else if (filtroEstado !== 'TODOS') {
            list = list.filter(t => t.estado === filtroEstado);
        }
        if (filtroTipo) {
            list = list.filter(t => t.tipo === filtroTipo);
        }
        if (filtroPrioridad) {
            list = list.filter(t => t.prioridad === filtroPrioridad);
        }
        if (filtroCategoria) {
            list = list.filter(t => t.categoria === filtroCategoria);
        }
        if (filtroResponsable) {
            list = list.filter(t => t.responsables?.some(r => String(r.id) === String(filtroResponsable)));
        } else if (currentUser?.rol === 'COORDINADOR_MTTO' && !vistaEquipo) {
            list = list.filter(t => t.responsables?.some(r => String(r.id) === String(currentUser.id)));
        }
        return list;
    }, [allTickets, filtroEstado, filtroTipo, filtroPrioridad, filtroCategoria, filtroResponsable, mostrarAtrasadas, mostrarRechazadas, currentUser, vistaEquipo]);

    const totalParaSummary = useMemo(() => {
        return allTickets.filter(t => ESTADOS_SUMMARY.includes(t.estado)).length;
    }, [allTickets]);

    const conteos = useMemo(() => {
        const c = { ASIGNADA: 0, EN_PROGRESO: 0, EN_PAUSA: 0, RESUELTO: 0 };
        allTickets.forEach(t => {
            if (c[t.estado] !== undefined) c[t.estado]++;
        });
        return c;
    }, [allTickets]);

    const totalRechazadas = useMemo(() => {
        return allTickets.filter(t => t.estado === 'RECHAZADO').length;
    }, [allTickets]);

    const equipoCount = allTickets.length;
    const misTareasCount = useMemo(() => {
        return allTickets.filter(t => t.responsables?.some(r => String(r.id) === String(currentUser?.id))).length;
    }, [allTickets, currentUser]);

    const handleCreate = useCallback(async (formData) => {
        try {
            if (Array.isArray(formData)) {
                await createBatch(formData);
                notify.success(`${formData.length} mantenimiento${formData.length !== 1 ? 's' : ''} creado${formData.length !== 1 ? 's' : ''} exitosamente.`);
            } else {
                await createTicket(formData);
                notify.success('Mantenimiento creado exitosamente.');
            }
            setShowCreate(false);
            loadTickets();
        } catch (err) {
            notify.error(err.response?.data?.error || err.response?.data?.message || 'Error al crear el mantenimiento.');
            throw err;
        }
    }, [createBatch, createTicket, loadTickets]);

    const handleUpdate = useCallback(async (id, payload) => {
        try {
            await updateTicket(id, payload);
            notify.success('Mantenimiento actualizado exitosamente.');
            loadTickets();
        } catch (err) {
            notify.error(err.response?.data?.message || 'Error al actualizar el mantenimiento.');
        }
    }, [updateTicket, loadTickets]);

    const handleChangeStatus = useCallback(async (id, payload) => {
        try {
            await changeStatus(id, payload);
            notify.success('Estado del mantenimiento actualizado.');
            loadTickets();
        } catch (err) {
            notify.error(err.response?.data?.message || 'Error al cambiar estado.');
        }
    }, [changeStatus, loadTickets]);

    const sharedProps = {
        tickets: filteredTickets,
        toApproveCount: 0,
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
        <div className="max-w-full mx-auto">
            {isDesktop ? <MantenimientosHoyDesktop {...sharedProps} /> : <MantenimientosHoyMobile {...sharedProps} />}
            {isDesktop ? (
                <HoyFormModal isOpen={showCreate} onClose={() => setShowCreate(false)} ticketAEditar={null} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={handleCreate} scope="mantenimientos" />
            ) : (
                <MobileHoyFormModal isOpen={showCreate} onClose={() => setShowCreate(false)} ticketAEditar={null} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={handleCreate} scope="mantenimientos" />
            )}
            <BacklogRescheduleDrawer
                isOpen={isDrawerAmnistiaOpen}
                onClose={() => setIsDrawerAmnistiaOpen(false)}
                ticketsAtrasados={ticketsAtrasados}
                onSuccessSincronizacion={loadTickets}
            />
        </div>
    );
}
