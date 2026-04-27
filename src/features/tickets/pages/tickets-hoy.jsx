import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { isPastDate } from '@/lib/date';
import { useTickets } from '../hooks/use-tickets';
import { TicketsHoyDesktop } from '../views/tickets-hoy-desktop';
import { TicketsHoyMobile } from '../views/tickets-hoy-mobile';
import { HoyFormModal } from '../components/hoy/hoy-form-modal';
import { MobileHoyFormModal } from '../components/hoy/mobile-hoy-form-modal';

const PRIORIDAD_ORDER = { CRITICA: 4, ALTA: 3, MEDIA: 2, BAJA: 1 };
const ESTADOS_EXCLUIDOS = ['PENDIENTE', 'CANCELADA', 'CERRADO'];
const ESTADOS_VALIDOS_ATRASADAS = ['ASIGNADA', 'EN_PROGRESO', 'EN_PAUSA'];
const ESTADOS_SUMMARY = ['ASIGNADA', 'EN_PROGRESO', 'EN_PAUSA', 'RESUELTO'];

const getDateBounds = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    return { start, end };
};

const isOnDate = (isoStr, offset = 0) => {
    if (!isoStr) return false;
    const { start, end } = getDateBounds(offset);
    const d = new Date(isoStr);
    return d >= start && d <= end;
};

const esAtrasadaActiva = (ticket) =>
    Boolean(ticket.fechaVencimiento) &&
    isPastDate(ticket.fechaVencimiento) &&
    ESTADOS_VALIDOS_ATRASADAS.includes(ticket.estado);

const perteneceAHoy = (ticket) => {
    if (ticket.estado === 'RECHAZADO') return true;
    if (!ticket.fechaVencimiento) return false;
    return isOnDate(ticket.fechaVencimiento, 0) || esAtrasadaActiva(ticket);
};

const sortManana = (tickets) =>
    [...tickets].sort((a, b) => {
        const aPrio = PRIORIDAD_ORDER[a.prioridad] || 0;
        const bPrio = PRIORIDAD_ORDER[b.prioridad] || 0;
        return bPrio - aPrio;
    });

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
        updateTicket,
        changeStatus,
    } = useTickets();

    const [dateOffset, setDateOffset] = useState(0);
    const [showCreate, setShowCreate] = useState(false);
    const [query, setQuery] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const [filtroResponsable, setFiltroResponsable] = useState('');
    const [mostrarAtrasadas, setMostrarAtrasadas] = useState(false);
    const [mostrarRechazadas, setMostrarRechazadas] = useState(false);
    const [vistaEquipo, setVistaEquipo] = useState(true);

    const handleDateOffsetChange = useCallback((offset) => {
        setDateOffset(offset);
        setQuery('');
        setFiltroEstado('TODOS');
        setFiltroTipo('');
        setFiltroPrioridad('');
        setFiltroResponsable('');
        setMostrarAtrasadas(false);
        setMostrarRechazadas(false);
        setVistaEquipo(true);
        if (highlightId) setSearchParams({});
    }, [highlightId, setSearchParams]);

    const queryPayload = useMemo(() => ({ limit: 500 }), []);

    const loadTickets = useCallback(() => {
        fetchTickets(queryPayload).catch(() => notify.error('Error al cargar las tareas.'));
    }, [fetchTickets, queryPayload]);

    useEffect(() => { loadTickets(); }, [loadTickets]);
    useEffect(() => { fetchTecnicos(); }, [fetchTecnicos]);

    const customSortHoy = useCallback((tickets) => {
        const rol = currentUser?.rol;
        const esAdmin = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'].includes(rol);

        const STATUS_ORDER = esAdmin
            ? { RESUELTO: 5, EN_PAUSA: 4, EN_PROGRESO: 3, ASIGNADA: 2, RECHAZADO: 2 }
            : { EN_PAUSA: 5, EN_PROGRESO: 4, ASIGNADA: 3, RECHAZADO: 3, RESUELTO: 2 };

        return [...tickets].sort((a, b) => {
            if (highlightId) {
                if (String(a.id) === highlightId) return -1;
                if (String(b.id) === highlightId) return 1;
            }

            const aAtrasadaAsig = esAtrasadaActiva(a) && a.estado === 'ASIGNADA';
            const bAtrasadaAsig = esAtrasadaActiva(b) && b.estado === 'ASIGNADA';
            if (aAtrasadaAsig !== bAtrasadaAsig) return aAtrasadaAsig ? -1 : 1;

            const aStatusW = STATUS_ORDER[a.estado] || 0;
            const bStatusW = STATUS_ORDER[b.estado] || 0;
            if (aStatusW !== bStatusW) return bStatusW - aStatusW;

            const aPrio = PRIORIDAD_ORDER[a.prioridad] || 0;
            const bPrio = PRIORIDAD_ORDER[b.prioridad] || 0;
            if (aPrio !== bPrio) return bPrio - aPrio;

            return new Date(a.fechaVencimiento || 0).getTime() - new Date(b.fechaVencimiento || 0).getTime();
        });
    }, [currentUser, highlightId]);

    const getBaseTickets = useCallback(() => {
        let base = allTickets.filter(t => !ESTADOS_EXCLUIDOS.includes(t.estado));
        
        const esTecnico = currentUser?.rol === 'TECNICO';

        // Solo el Técnico tiene una base restringida permanentemente
        if (esTecnico) {
            base = base.filter(t => t.responsables?.some(r => String(r.id) === String(currentUser.id)));
        }

        return base;
    }, [allTickets, currentUser]);

    const ticketsTabActual = useMemo(() => {
        const base = getBaseTickets();
        const delDia = dateOffset === 0 ? base.filter(perteneceAHoy) : base.filter(t => isOnDate(t.fechaVencimiento, dateOffset));
        
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
                if (mostrarAtrasadas) match = match && esAtrasadaActiva(t);
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

        return dateOffset === 0 ? customSortHoy(filtered) : sortManana(filtered);
    }, [ticketsTabActual, getBaseTickets, dateOffset, mostrarAtrasadas, mostrarRechazadas, filtroEstado, filtroTipo, filtroPrioridad, filtroResponsable, query, customSortHoy, highlightId, allTickets, currentUser, vistaEquipo]);

    const totalHoy = useMemo(() => getBaseTickets().filter(perteneceAHoy).length, [getBaseTickets]);
    const totalManana = useMemo(() => getBaseTickets().filter(t => isOnDate(t.fechaVencimiento, 1)).length, [getBaseTickets]);
    const totalAtrasadas = useMemo(() => getBaseTickets().filter(esAtrasadaActiva).length, [getBaseTickets]);
    const totalRechazadas = useMemo(() => getBaseTickets().filter(t => t.estado === 'RECHAZADO').length, [getBaseTickets]);

    const handleCreate = async (payloads) => {
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

    const sharedProps = {
        tickets: ticketsFiltrados,
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
        filtroResponsable,
        onResponsableChange: setFiltroResponsable,
        mostrarAtrasadas,
        onToggleAtrasadas: () => setMostrarAtrasadas(p => !p),
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
        </div>
    );
}