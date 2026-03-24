// src/features/tickets/pages/tickets-historico.jsx
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

    // ── Estado de la página ──────────────────────────────────────────────────
    const [query, setQuery] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    // 🔥 Estados de Vistas Aisladas
    const [mostrarRechazadas, setMostrarRechazadas] = useState(false);
    const [mostrarPapelera, setMostrarPapelera] = useState(false);

    // ── Carga de datos ───────────────────────────────────────────────────────
    const loadTickets = useCallback(() => {
        const params = { page, limit: LIMIT };

        if (query) params.q = query;

        // 🔥 PRIORIDAD ABSOLUTA AL FETCH
        if (mostrarRechazadas) {
            params.estado = 'RECHAZADO';
        } else if (mostrarPapelera) {
            params.estado = 'CANCELADA'; // Ajusta si tu API espera otro string para papelera
        } else if (filtroEstado !== 'TODOS') {
            params.estado = filtroEstado;
        }

        if (filtroTipo) params.tipo = filtroTipo;
        if (filtroPrioridad) params.prioridad = filtroPrioridad;
        if (sortConfig?.key) {
            params.sort = JSON.stringify([{ [sortConfig.key]: sortConfig.direction }]);
        }

        return fetchTickets(params).catch(() => notify.error('Error al cargar tickets.'));
    }, [page, query, filtroEstado, filtroTipo, filtroPrioridad, sortConfig, mostrarRechazadas, mostrarPapelera, fetchTickets]);

    useEffect(() => { loadTickets(); }, [loadTickets]);
    useEffect(() => { fetchTecnicos(); }, [fetchTecnicos]);

    // ── Handlers de filtros ──────────────────────────────────────────────────
    const handleSearchChange = useCallback((q) => { setQuery(q); setPage(1); }, []);
    const handleFilterChange = useCallback((e) => { setFiltroEstado(e); setPage(1); }, []);
    const handleTipoChange = useCallback((t) => { setFiltroTipo(t); setPage(1); }, []);
    const handlePrioridadChange = useCallback((p) => { setFiltroPrioridad(p); setPage(1); }, []);
    const handleSortChange = useCallback((key, dir) => { setSortConfig({ key, direction: dir }); setPage(1); }, []);

    // 🔥 Handlers mutuamente excluyentes
    const handleToggleRechazadas = useCallback(() => {
        setMostrarRechazadas((prev) => !prev);
        setMostrarPapelera(false);
        setFiltroEstado('TODOS');
        setPage(1);
    }, []);

    const handleTogglePapelera = useCallback(() => {
        setMostrarPapelera((prev) => !prev);
        setMostrarRechazadas(false);
        setFiltroEstado('TODOS');
        setPage(1);
    }, []);

    // ── Handlers de mutaciones ───────────────────────────────────────────────
    const handleCreate = async (payload) => {
        try {
            await createTicket(payload);
            notify.success('Ticket creado correctamente.');
            setShowCreate(false);
            await loadTickets();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al crear el ticket.';
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

    // ── Props compartidos ────────────────────────────────────────────────────
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
        filtroEstado,
        filtroTipo,
        filtroPrioridad,

        // Inyección de estados
        mostrarRechazadas,
        onToggleRechazadas: handleToggleRechazadas,
        mostrarPapelera,
        onTogglePapelera: handleTogglePapelera,

        onPageChange: setPage,
        onSortChange: handleSortChange,
        onSearchChange: handleSearchChange,
        onFilterChange: handleFilterChange,
        onTipoChange: handleTipoChange,
        onPrioridadChange: handlePrioridadChange,
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