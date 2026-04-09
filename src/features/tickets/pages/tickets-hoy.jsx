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

// Estados explícitamente vetados de la vista "Hoy"
const ESTADOS_EXCLUIDOS = ['PENDIENTE', 'CANCELADA', 'CERRADO'];

// Para definir si una tarea sigue activa pero está atrasada
const ESTADOS_VALIDOS_ATRASADAS = ['ASIGNADA', 'EN_PROGRESO', 'EN_PAUSA', 'RECHAZADO', 'RESUELTO'];

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

// Tarea atrasada = vence antes de hoy Y sigue activa
const esAtrasadaActiva = (ticket) =>
    Boolean(ticket.fechaVencimiento) &&
    isPastDate(ticket.fechaVencimiento) &&
    ESTADOS_VALIDOS_ATRASADAS.includes(ticket.estado);

const perteneceAHoy = (ticket) => {
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

    // ── Ordenamiento Dinámico Basado en Rol ───────────────────────────────────
    const customSortHoy = useCallback((tickets) => {
        const rol = currentUser?.rol;
        const esAdmin = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'].includes(rol);

        // Mapas de pesos para ordenación de estados
        const STATUS_ORDER = esAdmin
            ? { RESUELTO: 5, EN_PAUSA: 4, EN_PROGRESO: 3, ASIGNADA: 2, RECHAZADO: 2 }
            : { EN_PAUSA: 5, EN_PROGRESO: 4, ASIGNADA: 3, RECHAZADO: 3, RESUELTO: 2 };

        return [...tickets].sort((a, b) => {
            // 1. Rezagadas que estén estrictamente ASIGNADAS van al tope global
            const aAtrasadaAsig = esAtrasadaActiva(a) && a.estado === 'ASIGNADA';
            const bAtrasadaAsig = esAtrasadaActiva(b) && b.estado === 'ASIGNADA';
            if (aAtrasadaAsig !== bAtrasadaAsig) return aAtrasadaAsig ? -1 : 1;

            // 2. Orden jerárquico por Estado según el rol
            const aStatusW = STATUS_ORDER[a.estado] || 0;
            const bStatusW = STATUS_ORDER[b.estado] || 0;
            if (aStatusW !== bStatusW) return bStatusW - aStatusW;

            // 3. Prioridad (Crítica > Alta > Media > Baja)
            const aPrio = PRIORIDAD_ORDER[a.prioridad] || 0;
            const bPrio = PRIORIDAD_ORDER[b.prioridad] || 0;
            if (aPrio !== bPrio) return bPrio - aPrio;

            // 4. Fecha de vencimiento (más antigua primero)
            return new Date(a.fechaVencimiento || 0).getTime() - new Date(b.fechaVencimiento || 0).getTime();
        });
    }, [currentUser]);

    // ── Pre-procesamiento y filtrado maestro ──────────────────────────────────
    const getBaseTickets = useCallback(() => {
        let base = allTickets.filter(t => !ESTADOS_EXCLUIDOS.includes(t.estado));

        // Para técnicos: Aislamiento absoluto de sus propias tareas
        if (currentUser?.rol === 'TECNICO') {
            base = base.filter(t => t.responsables?.some(r => String(r.id) === String(currentUser.id)));
        }
        return base;
    }, [allTickets, currentUser]);

    const ticketsFiltrados = useMemo(() => {
        let filtered = getBaseTickets();

        // Filtro de Pestaña (Hoy vs Mañana)
        filtered = filtered.filter(
            dateOffset === 0 ? perteneceAHoy : (t) => isOnDate(t.fechaVencimiento, dateOffset)
        );

        // Filtros de barra (Usuario)
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

        return dateOffset === 0 ? customSortHoy(filtered) : sortManana(filtered);
    }, [getBaseTickets, dateOffset, filtroEstado, filtroTipo, filtroPrioridad, filtroResponsable, query, customSortHoy]);

    // Conteos para badges del toggle (basados en tickets base permitidos para el rol)
    const totalHoy = useMemo(() => getBaseTickets().filter(perteneceAHoy).length, [getBaseTickets]);
    const totalManana = useMemo(() => getBaseTickets().filter(t => isOnDate(t.fechaVencimiento, 1)).length, [getBaseTickets]);
    const totalAtrasadas = useMemo(() => getBaseTickets().filter(esAtrasadaActiva).length, [getBaseTickets]);

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