import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useTickets } from '../hooks/use-tickets';
import { TicketsHoyDesktop } from '../views/tickets-hoy-desktop';
import { TicketsHoyMobile } from '../views/tickets-hoy-mobile';
import { HoyFormModal } from '../components/hoy/hoy-form-modal';
import { MobileHoyFormModal } from '../components/hoy/mobile-hoy-form-modal';
import { BacklogRescheduleDrawer } from '../components/hoy/backlog-reschedule-drawer';

const ESTADOS_SUMMARY = ['ASIGNADA', 'EN_PROGRESO', 'EN_PAUSA', 'RESUELTO'];

/**
 * Calcula la fecha de mañana en zona horaria America/Mexico_City (YYYY-MM-DD).
 * Uso permitido: solo para filtro de pestaña de UI, no para lógica de negocio.
 */
const getMananaMX = () =>
    new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });

export default function TicketsHoyPage() {
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
        createTicket,
        createBatch,
        updateTicket,
        changeStatus,
    } = useTickets();

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

    const queryPayload = useMemo(() => ({ limit: 5000 }), []);

    const loadTickets = useCallback(() => {
        fetchTickets(queryPayload).catch(() => notify.error('Error al cargar las tareas.'));
    }, [fetchTickets, queryPayload]);

    useEffect(() => { loadTickets(); }, [loadTickets]);
    useEffect(() => { fetchTecnicos(); }, [fetchTecnicos]);

    const getBaseTickets = useCallback(() => {
        // El backend ya filtra CANCELADA y controla qué tickets se envían.
        // Solo restringimos por responsable para el rol TECNICO.
        const esTecnico = currentUser?.rol === 'TECNICO';
        if (esTecnico) {
            return allTickets.filter(t =>
                t.responsables?.some(r => String(r.id) === String(currentUser.id))
            );
        }
        return allTickets;
    }, [allTickets, currentUser]);

    const ticketsTabActual = useMemo(() => {
        const base = getBaseTickets();
        // Estados terminales excluidos en AMBAS pestañas (espeja la lógica de perteneceAHoy del backend).
        const ESTADOS_TERMINALES_HOY = ['RESUELTO', 'CERRADO', 'CANCELADA', 'RECHAZADO'];

        const delDia = dateOffset === 0
            // Filtrado declarativo: si el backend dice perteneceAHoy, el frontend lo pinta sin cuestionar.
            ? base.filter(t => t.perteneceAHoy === true)
            : base.filter(t => {
                if (!t.fechaVencimiento) return false;
                // Excluir terminales: misma lógica que el backend usa para perteneceAHoy
                if (ESTADOS_TERMINALES_HOY.includes(t.estado)) return false;
                const mananaMX = getMananaMX();
                const ticketVencMX = new Date(t.fechaVencimiento).toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
                return ticketVencMX === mananaMX;
            });
        
        // CALCULAMOS CONTADORES SIEMPRE SOBRE EL TOTAL DEL DÍA
        // Independientemente de lo que el usuario esté viendo en ese momento
        const misTareasDelDia = delDia.filter(t => t.responsables?.some(r => String(r.id) === String(currentUser?.id)));
        
        const equipoCount = delDia.length;
        const misTareasCount = misTareasDelDia.length;

        // Filtramos qué tickets se van a procesar para la lista final
        const ticketsParaLista = (currentUser?.rol === 'COORDINADOR_MTTO' && !vistaEquipo)
            ? misTareasDelDia
            : delDia;

        return {
            tickets: ticketsParaLista,
            equipoCount,
            misTareasCount
        };
    }, [getBaseTickets, dateOffset, currentUser, vistaEquipo]);

    const conteos = useMemo(() => {
        return ticketsTabActual.tickets.reduce((acc, t) => {
            acc[t.estado] = (acc[t.estado] || 0) + 1;
            return acc;
        }, {});
    }, [ticketsTabActual]);

    const totalParaSummary = useMemo(() => {
        return Object.entries(conteos).reduce((acc, [estado, count]) => {
            return ESTADOS_SUMMARY.includes(estado) ? acc + count : acc;
        }, 0);
    }, [conteos]);

    const ticketsFiltrados = useMemo(() => {
        let filtered = ticketsTabActual.tickets;

        if (highlightId && !filtered.some(t => String(t.id) === highlightId)) {
            const ticketResaltado = allTickets.find(t => String(t.id) === highlightId);
            if (ticketResaltado) {
                filtered = [ticketResaltado, ...filtered];
            }
        }

        if (mostrarAtrasadas || mostrarRechazadas) {
            filtered = getBaseTickets().filter(t => {
                if (highlightId && String(t.id) === highlightId) return true;
                let match = true;
                if (mostrarAtrasadas) match = match && t.isOverdue === true;
                if (mostrarRechazadas) match = match && t.estado === 'RECHAZADO';
                
                // Si el coordinador está en vista "Mis Tareas", solo mostrar atrasadas/rechazadas suyas
                if (currentUser?.rol === 'COORDINADOR_MTTO' && !vistaEquipo) {
                    match = match && t.responsables?.some(r => String(r.id) === String(currentUser.id));
                }
                
                return match;
            });
        }

        if (filtroEstado !== 'TODOS') filtered = filtered.filter(t => t.estado === filtroEstado || (highlightId && String(t.id) === highlightId));
        if (filtroTipo) filtered = filtered.filter(t => t.tipo === filtroTipo || (highlightId && String(t.id) === highlightId));
        if (filtroPrioridad) filtered = filtered.filter(t => t.prioridad === filtroPrioridad || (highlightId && String(t.id) === highlightId));
        if (filtroCategoria) filtered = filtered.filter(t => t.categoria === filtroCategoria || (highlightId && String(t.id) === highlightId));

        if (filtroResponsable) {
            filtered = filtered.filter(t => t.responsables?.some(r => String(r.id) === String(filtroResponsable)) || (highlightId && String(t.id) === highlightId));
        }

        if (query) {
            const q = query.toLowerCase();
            filtered = filtered.filter(t =>
                (highlightId && String(t.id) === highlightId) ||
                t.titulo?.toLowerCase().includes(q) ||
                t.area?.toLowerCase().includes(q) ||
                t.planta?.toLowerCase().includes(q) ||
                String(t.id) === q
            );
        }

        return filtered;
    }, [ticketsTabActual, getBaseTickets, mostrarAtrasadas, mostrarRechazadas, filtroEstado, filtroTipo, filtroPrioridad, filtroCategoria, filtroResponsable, query, highlightId, allTickets, currentUser, vistaEquipo]);

    const totalHoy = useMemo(() => getBaseTickets().filter(t => t.perteneceAHoy === true).length, [getBaseTickets]);
    const totalManana = useMemo(() => {
        const mananaMX = getMananaMX();
        return getBaseTickets().filter(t =>
            t.fechaVencimiento &&
            new Date(t.fechaVencimiento).toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }) === mananaMX
        ).length;
    }, [getBaseTickets]);
    // Incluye TODOS los estados vencibles: PENDIENTE, ASIGNADA, EN_PROGRESO, EN_PAUSA, RECHAZADO
    const ticketsAtrasados = useMemo(() => allTickets.filter(t => t.isOverdue === true), [allTickets]);
    const totalAtrasadas = ticketsAtrasados.length;
    const totalRechazadas = useMemo(() => getBaseTickets().filter(t => t.estado === 'RECHAZADO').length, [getBaseTickets]);

    const handleCreate = async (payloads) => {
        // Batch mode: array of plain objects from carrito
        if (Array.isArray(payloads) && payloads.length > 0 && !(payloads[0] instanceof FormData)) {
            try {
                await createBatch(payloads);
                notify.success(`${payloads.length} tarea${payloads.length !== 1 ? 's' : ''} creada${payloads.length !== 1 ? 's' : ''} correctamente.`);
                setShowCreate(false);
                loadTickets();
            } catch (err) {
                notify.error(err?.response?.data?.error || err?.response?.data?.message || 'Error al crear las tareas.');
                throw err;
            }
            return;
        }
        // Legacy: single FormData or array of FormData (edit mode)
        const items = Array.isArray(payloads) ? payloads : [payloads];
        try {
            for (const payload of items) await createTicket(payload);
            notify.success(items.length > 1 ? `${items.length} tareas creadas correctamente.` : 'Tarea creada correctamente.');
            setShowCreate(false);
            loadTickets();
        } catch (err) {
            notify.error(err?.response?.data?.error || err?.response?.data?.message || 'Error al crear la tarea.');
            throw err;
        }
    };

    const handleUpdate = async (id, payload) => {
        try {
            await updateTicket(id, payload);
            notify.success('Tarea actualizada correctamente.');
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
        if (!allTickets) return 0;
        return allTickets.filter(t => t.estado === 'RESUELTO').length;
    }, [allTickets]);

    const sharedProps = {
        tickets: ticketsFiltrados,
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
        // Siempre filtra por atrasadas al hacer click; el drawer se abre por separado
        onToggleAtrasadas: () => setMostrarAtrasadas(p => !p),
        onOpenDrawerAmnistia: () => setIsDrawerAmnistiaOpen(true),
        mostrarRechazadas,
        onToggleRechazadas: () => setMostrarRechazadas(p => !p),
        vistaEquipo,
        onVistaEquipoChange: setVistaEquipo,
        equipoCount: ticketsTabActual.equipoCount,
        misTareasCount: ticketsTabActual.misTareasCount,
        existenciaGlobal: { 'RECHAZADO': totalRechazadas },
        totalAtrasadasGlobal: totalAtrasadas,
        onSave: handleUpdate,
        onChangeStatus: handleChangeStatus,
        onOpenCreate: () => setShowCreate(true),
        onRefresh: loadTickets,
    };

    return (
        <div className="max-w-full mx-auto">
            {isDesktop ? <TicketsHoyDesktop {...sharedProps} /> : <TicketsHoyMobile {...sharedProps} />}
            {isDesktop ? (
                <HoyFormModal isOpen={showCreate} onClose={() => setShowCreate(false)} ticketAEditar={null} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={handleCreate} />
            ) : (
                <MobileHoyFormModal isOpen={showCreate} onClose={() => setShowCreate(false)} ticketAEditar={null} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={handleCreate} />
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