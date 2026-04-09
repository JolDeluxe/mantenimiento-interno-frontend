import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { isPastDate } from '@/lib/date';
import { useTickets } from '../hooks/use-tickets';
import { TicketsHoyDesktop } from '../views/tickets-hoy-desktop';
import { TicketsHoyMobile } from '../views/tickets-hoy-mobile';
import { HoyFormModal } from '../components/hoy/hoy-form-modal';
import { MobileHoyFormModal } from '../components/hoy/mobile-hoy-form-modal';

// ── Constantes ────────────────────────────────────────────────────────────────
const PRIORIDAD_ORDER = { CRITICA: 4, ALTA: 3, MEDIA: 2, BAJA: 1 };
const ESTADOS_VALIDOS_ATRASADAS = ['PENDIENTE', 'ASIGNADA', 'EN_PROGRESO', 'EN_PAUSA', 'RECHAZADO'];

// ── Utilidades de fecha ───────────────────────────────────────────────────────
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

// Tarea atrasada = vence antes de hoy Y sigue activa (no cerrada/cancelada/resuelta)
const esAtrasadaActiva = (ticket) =>
    Boolean(ticket.fechaVencimiento) &&
    isPastDate(ticket.fechaVencimiento) &&
    ESTADOS_VALIDOS_ATRASADAS.includes(ticket.estado);

// Pertenece al tab HOY: vence hoy O está atrasada y activa
const perteneceAHoy = (ticket) => {
    if (!ticket.fechaVencimiento) return false;
    return isOnDate(ticket.fechaVencimiento, 0) || esAtrasadaActiva(ticket);
};

// Ordenamiento: atrasadas primero → prioridad DESC → fecha vencimiento ASC
const sortHoy = (tickets) =>
    [...tickets].sort((a, b) => {
        const aAtrasada = esAtrasadaActiva(a);
        const bAtrasada = esAtrasadaActiva(b);
        if (aAtrasada !== bAtrasada) return aAtrasada ? -1 : 1;

        const aPrio = PRIORIDAD_ORDER[a.prioridad] || 0;
        const bPrio = PRIORIDAD_ORDER[b.prioridad] || 0;
        if (aPrio !== bPrio) return bPrio - aPrio;

        return new Date(a.fechaVencimiento || 0).getTime() - new Date(b.fechaVencimiento || 0).getTime();
    });

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

    // ── Estados de filtros ────────────────────────────────────────────────────
    const [query, setQuery] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const [filtroResponsable, setFiltroResponsable] = useState('');

    // Al cambiar fecha, limpiar filtros
    const handleDateOffsetChange = useCallback((offset) => {
        setDateOffset(offset);
        setQuery('');
        setFiltroEstado('');
        setFiltroTipo('');
        setFiltroPrioridad('');
        setFiltroResponsable('');
    }, []);

    const loadTickets = useCallback(() => {
        fetchTickets({ limit: 500 }).catch(() => notify.error('Error al cargar las tareas.'));
    }, [fetchTickets]);

    useEffect(() => { loadTickets(); }, [loadTickets]);
    useEffect(() => { fetchTecnicos(); }, [fetchTecnicos]);

    // ── Datos filtrados y ordenados ───────────────────────────────────────────
    const ticketsFiltrados = useMemo(() => {
        // 1. Filtro por fecha
        let filtered = allTickets.filter(
            dateOffset === 0 ? perteneceAHoy : (t) => isOnDate(t.fechaVencimiento, dateOffset)
        );

        // 2. Filtros adicionales del usuario
        if (filtroEstado) filtered = filtered.filter(t => t.estado === filtroEstado);
        if (filtroTipo) filtered = filtered.filter(t => t.tipo === filtroTipo);
        if (filtroPrioridad) filtered = filtered.filter(t => t.prioridad === filtroPrioridad);
        if (filtroResponsable) {
            filtered = filtered.filter(t =>
                t.responsables?.some(r => String(r.id) === String(filtroResponsable))
            );
        }
        if (query) {
            const q = query.toLowerCase();
            filtered = filtered.filter(t =>
                t.titulo?.toLowerCase().includes(q) ||
                t.area?.toLowerCase().includes(q) ||
                t.planta?.toLowerCase().includes(q) ||
                String(t.id) === q
            );
        }

        // 3. Ordenamiento
        return dateOffset === 0 ? sortHoy(filtered) : sortManana(filtered);
    }, [allTickets, dateOffset, filtroEstado, filtroTipo, filtroPrioridad, filtroResponsable, query]);

    // Conteos para badges del toggle (sin filtros aplicados)
    const totalHoy = useMemo(() => allTickets.filter(perteneceAHoy).length, [allTickets]);
    const totalManana = useMemo(
        () => allTickets.filter(t => isOnDate(t.fechaVencimiento, 1)).length,
        [allTickets]
    );
    const totalAtrasadas = useMemo(
        () => allTickets.filter(esAtrasadaActiva).length,
        [allTickets]
    );

    // ── Handlers de mutaciones ────────────────────────────────────────────────
    const handleCreate = async (payloads) => {
        const items = Array.isArray(payloads) ? payloads : [payloads];
        try {
            for (const payload of items) await createTicket(payload);
            notify.success(items.length > 1
                ? `${items.length} tareas creadas correctamente.`
                : 'Tarea creada correctamente.'
            );
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

    // ── Props compartidos ─────────────────────────────────────────────────────
    const sharedProps = {
        tickets: ticketsFiltrados,
        loading,
        submitting,
        currentUser,
        tecnicos,
        dateOffset,
        onDateOffsetChange: handleDateOffsetChange,
        totalHoy,
        totalManana,
        totalAtrasadas,
        // Filtros
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
        // Acciones
        onSave: handleUpdate,
        onChangeStatus: handleChangeStatus,
        onOpenCreate: () => setShowCreate(true),
        onRefresh: loadTickets,
    };

    return (
        <div className="max-w-full mx-auto">
            {isDesktop
                ? <TicketsHoyDesktop {...sharedProps} />
                : <TicketsHoyMobile {...sharedProps} />
            }
            {isDesktop ? (
                <HoyFormModal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    ticketAEditar={null}
                    currentUser={currentUser}
                    tecnicos={tecnicos}
                    isSubmitting={submitting}
                    onSuccess={handleCreate}
                />
            ) : (
                <MobileHoyFormModal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    ticketAEditar={null}
                    currentUser={currentUser}
                    tecnicos={tecnicos}
                    isSubmitting={submitting}
                    onSuccess={handleCreate}
                />
            )}
        </div>
    );
}