import { useState, useEffect, useCallback } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useTickets } from '../hooks/use-tickets';
import { TicketsHistoricoDesktop } from '../views/tickets-historico-desktop';
import { TicketsHistoricoMobile } from '../views/tickets-historico-mobile';
import { TicketFormModal } from '../components/historico/ticket-form-modal';
import { MobileTicketFormModal } from '../components/historico/mobile-ticket-form-modal';

const LIMIT = 20;

export default function TicketsHistoricoPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;

    const {
        tickets,
        tecnicos,
        meta,
        loading,
        submitting,
        fetchTickets,
        fetchTecnicos,
        createTicket,
        updateTicket,
        changeStatus,
    } = useTickets();

    // ── Estado de la página (Paginación y Búsqueda) ──────────────────────────
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    // ── Estados de Filtros Estándar y Avanzados ──────────────────────────────
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const [filtroClasificacion, setFiltroClasificacion] = useState('');
    const [filtroResponsable, setFiltroResponsable] = useState('');
    const [filtroPlanta, setFiltroPlanta] = useState('');
    const [filtroArea, setFiltroArea] = useState('');

    // ── Estados de Vistas Aisladas (Mutuamente Excluyentes) ──────────────────
    const [mostrarRechazadas, setMostrarRechazadas] = useState(false);
    const [mostrarPapelera, setMostrarPapelera] = useState(false);
    const [mostrarAtrasadas, setMostrarAtrasadas] = useState(false);

    // ── Carga de datos ───────────────────────────────────────────────────────
    const loadTickets = useCallback(() => {
        const params = { page, limit: LIMIT };

        if (query) params.q = query;

        // PRIORIDAD ABSOLUTA AL FETCH: Estados aislados
        if (mostrarRechazadas) {
            params.estado = 'RECHAZADO';
        } else if (mostrarPapelera) {
            params.estado = 'CANCELADA';
        } else if (filtroEstado !== 'TODOS') {
            params.estado = filtroEstado;
        }

        // Mapeo estricto de filtros avanzados
        if (filtroTipo) params.tipo = filtroTipo;
        if (filtroPrioridad) params.prioridad = filtroPrioridad;
        if (filtroClasificacion) params.clasificacion = filtroClasificacion;
        if (filtroPlanta) params.planta = filtroPlanta;
        if (filtroArea) params.area = filtroArea;

        // Mapeo estructural hacia Zod Backend
        if (filtroResponsable) params.responsableId = filtroResponsable;
        if (mostrarAtrasadas) params.vencidos = true;

        if (sortConfig?.key) {
            params.sort = JSON.stringify([{ [sortConfig.key]: sortConfig.direction }]);
        }

        return fetchTickets(params).catch(() => notify.error('Error al cargar tickets.'));
    }, [
        page, query, filtroEstado, filtroTipo, filtroPrioridad,
        filtroClasificacion, filtroResponsable, filtroPlanta, filtroArea,
        sortConfig, mostrarRechazadas, mostrarPapelera, mostrarAtrasadas,
        fetchTickets
    ]);

    useEffect(() => { loadTickets(); }, [loadTickets]);
    useEffect(() => { fetchTecnicos(); }, [fetchTecnicos]);

    // ── Handlers de filtros estándar ─────────────────────────────────────────
    const handleSearchChange = useCallback((q) => { setQuery(q); setPage(1); }, []);
    const handleFilterChange = useCallback((e) => { setFiltroEstado(e); setPage(1); }, []);
    const handleTipoChange = useCallback((t) => { setFiltroTipo(t); setPage(1); }, []);
    const handlePrioridadChange = useCallback((p) => { setFiltroPrioridad(p); setPage(1); }, []);
    const handleSortChange = useCallback((key, dir) => { setSortConfig({ key, direction: dir }); setPage(1); }, []);

    const handleClasificacionChange = useCallback((c) => { setFiltroClasificacion(c); setPage(1); }, []);
    const handleResponsableChange = useCallback((r) => { setFiltroResponsable(r); setPage(1); }, []);
    const handlePlantaChange = useCallback((p) => { setFiltroPlanta(p); setPage(1); }, []);
    const handleAreaChange = useCallback((a) => { setFiltroArea(a); setPage(1); }, []);

    // ── Handlers de vistas aisladas mutuamente excluyentes ───────────────────
    const handleToggleRechazadas = useCallback(() => {
        setMostrarRechazadas((prev) => !prev);
        setMostrarPapelera(false);
        setMostrarAtrasadas(false);
        setFiltroEstado('TODOS');
        setPage(1);
    }, []);

    const handleTogglePapelera = useCallback(() => {
        setMostrarPapelera((prev) => !prev);
        setMostrarRechazadas(false);
        setMostrarAtrasadas(false);
        setFiltroEstado('TODOS');
        setPage(1);
    }, []);

    const handleToggleAtrasadas = useCallback(() => {
        setMostrarAtrasadas((prev) => !prev);
        setMostrarRechazadas(false);
        setMostrarPapelera(false);
        setFiltroEstado('TODOS');
        setPage(1);
    }, []);

    // ── Handlers de mutaciones ───────────────────────────────────────────────
    const handleCreate = async (payloads) => {
        // Normaliza: acepta un solo FormData (edit mode) o un array (cart mode)
        const items = Array.isArray(payloads) ? payloads : [payloads];

        try {
            for (const payload of items) {
                await createTicket(payload);
            }
            const msg = items.length > 1
                ? `${items.length} tareas creadas correctamente.`
                : 'Tarea creada correctamente.';
            notify.success(msg);
            setShowCreate(false);
            await loadTickets();
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                'Error al crear la tarea.';
            notify.error(msg);
            throw err;
        }
    };


    const handleUpdate = async (id, payload) => {
        try {
            await updateTicket(id, payload);
            notify.success('Ticket actualizado correctamente.');
            await loadTickets();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al actualizar.';
            notify.error(msg);
            throw err;
        }
    };

    const handleChangeStatus = async (id, payload) => {
        try {
            await changeStatus(id, payload);
            notify.success('Estado actualizado correctamente.');
            await loadTickets();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al cambiar estado.';
            notify.error(msg);
            throw err;
        }
    };

    // ── Props compartidos a Vistas ───────────────────────────────────────────
    const sharedViewProps = {
        tickets,
        loading,
        submitting,
        currentUser,
        tecnicos,
        page,
        limit: LIMIT,
        totalPages: meta.totalPages,
        totalParaSummary: meta.totalAbsoluto,
        totalParaPaginador: meta.totalFiltrado,
        conteos: meta.resumenEstados,
        sortConfig,
        query,

        // Estado de Filtros Estándar y Avanzados
        filtroEstado,
        filtroTipo,
        filtroPrioridad,
        filtroClasificacion,
        filtroResponsable,
        filtroPlanta,
        filtroArea,

        // Estado de Vistas Excluyentes
        mostrarRechazadas,
        mostrarPapelera,
        mostrarAtrasadas,

        // Handlers Estándar y Avanzados
        onPageChange: setPage,
        onSortChange: handleSortChange,
        onSearchChange: handleSearchChange,
        onFilterChange: handleFilterChange,
        onTipoChange: handleTipoChange,
        onPrioridadChange: handlePrioridadChange,
        onClasificacionChange: handleClasificacionChange,
        onResponsableChange: handleResponsableChange,
        onPlantaChange: handlePlantaChange,
        onAreaChange: handleAreaChange,

        // Handlers Excluyentes
        onToggleRechazadas: handleToggleRechazadas,
        onTogglePapelera: handleTogglePapelera,
        onToggleAtrasadas: handleToggleAtrasadas,

        // Acciones Globales
        onSave: handleUpdate,
        onChangeStatus: handleChangeStatus,
        onOpenCreate: () => setShowCreate(true),
        onRefresh: loadTickets,
    };

    return (
        <div className="max-w-full mx-auto">
            {isDesktop
                ? <TicketsHistoricoDesktop {...sharedViewProps} />
                : <TicketsHistoricoMobile  {...sharedViewProps} />
            }

            {isDesktop ? (
                <TicketFormModal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    ticketAEditar={null}
                    currentUser={currentUser}
                    tecnicos={tecnicos}
                    isSubmitting={submitting}
                    onSuccess={handleCreate}
                />
            ) : (
                <MobileTicketFormModal
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