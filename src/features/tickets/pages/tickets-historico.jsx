import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useTickets } from '../hooks/use-tickets';
import { TicketsHistoricoDesktop } from '../views/tickets-historico-desktop';
import { TicketsHistoricoMobile } from '../views/tickets-historico-mobile';
import { TicketFormModal } from '../components/historico/ticket-form-modal';
import { MobileTicketFormModal } from '../components/historico/mobile-ticket-form-modal';
import { formatFechaNumerica } from '@/lib/date';

const LIMIT = 50; // Aumentamos el límite para histórico por defecto

export default function TicketsHistoricoPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;

    const {
        tickets,
        tecnicos,
        meta,
        metricas,
        loading,
        submitting,
        fetchTickets,
        fetchMetricas,
        fetchTecnicos,
        createTicket,
        updateTicket,
        changeStatus,
    } = useTickets();

    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [showCreate, setShowCreate] = useState(false);

    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const [filtroClasificacion, setFiltroClasificacion] = useState('');
    const [filtroResponsable, setFiltroResponsable] = useState('');
    const [filtroPlanta, setFiltroPlanta] = useState('');
    const [filtroArea, setFiltroArea] = useState('');
    
    // Filtros de fecha mejorados
    const [filtroProgramacion, setFiltroProgramacion] = useState({ type: '', start: '', end: '' });
    const [filtroConclusion, setFiltroConclusion] = useState({ type: '', start: '', end: '' });

    const [mostrarRechazadas, setMostrarRechazadas] = useState(false);
    const [mostrarPapelera, setMostrarPapelera] = useState(false);
    const [mostrarAtrasadas, setMostrarAtrasadas] = useState(false);

    const queryPayload = useMemo(() => {
        const params = { page, limit: LIMIT };
        if (query) params.q = query;
        
        if (mostrarRechazadas) {
            params.estado = 'RECHAZADO';
        } else if (mostrarPapelera) {
            params.estado = 'CANCELADA';
        } else if (filtroEstado !== 'TODOS') {
            params.estado = filtroEstado;
        }

        if (filtroTipo) params.tipo = filtroTipo;
        if (filtroPrioridad) params.prioridad = filtroPrioridad;
        if (filtroClasificacion) params.clasificacion = filtroClasificacion;
        if (filtroPlanta) params.planta = filtroPlanta;
        if (filtroArea) params.area = filtroArea;
        if (filtroResponsable) params.responsableId = filtroResponsable;
        if (mostrarAtrasadas) params.vencidos = true;

        // Filtro Programación (Vencimiento)
        if (filtroProgramacion.start) params.vencimientoDesde = filtroProgramacion.start;
        if (filtroProgramacion.end) params.vencimientoHasta = filtroProgramacion.end;

        // Filtro Conclusión (FinalizadoAt)
        if (filtroConclusion.start) params.finalizadoDesde = filtroConclusion.start;
        if (filtroConclusion.end) params.finalizadoHasta = filtroConclusion.end;

        if (sortConfig?.key) {
            params.sort = JSON.stringify([{ [sortConfig.key]: sortConfig.direction }]);
        }
        return params;
    }, [page, query, filtroEstado, filtroTipo, filtroPrioridad, filtroClasificacion, filtroResponsable, filtroPlanta, filtroArea, sortConfig, mostrarRechazadas, mostrarPapelera, mostrarAtrasadas, filtroProgramacion, filtroConclusion]);

    const loadTickets = useCallback(() => {
        fetchMetricas(queryPayload);
        return fetchTickets(queryPayload).catch(() => notify.error('Error al cargar tickets.'));
    }, [fetchTickets, fetchMetricas, queryPayload]);

    useEffect(() => { loadTickets(); }, [loadTickets]);
    useEffect(() => { fetchTecnicos(); }, [fetchTecnicos]);

    const handleSearchChange = useCallback((q) => { setQuery(q); setPage(1); }, []);
    const handleFilterChange = useCallback((e) => { setFiltroEstado(e); setPage(1); }, []);
    const handleTipoChange = useCallback((t) => { setFiltroTipo(t); setPage(1); }, []);
    const handlePrioridadChange = useCallback((p) => { setFiltroPrioridad(p); setPage(1); }, []);
    const handleSortChange = useCallback((key, dir) => { setSortConfig({ key, direction: dir }); setPage(1); }, []);
    const handleClasificacionChange = useCallback((c) => { setFiltroClasificacion(c); setPage(1); }, []);
    const handleResponsableChange = useCallback((r) => { setFiltroResponsable(r); setPage(1); }, []);
    const handlePlantaChange = useCallback((p) => { setFiltroPlanta(p); setPage(1); }, []);
    const handleAreaChange = useCallback((a) => { setFiltroArea(a); setPage(1); }, []);

    const handleProgramacionChange = useCallback((val) => { setFiltroProgramacion(val); setPage(1); }, []);
    const handleConclusionChange = useCallback((val) => { setFiltroConclusion(val); setPage(1); }, []);

    const handleToggleRechazadas = useCallback(() => {
        setMostrarRechazadas((prev) => !prev);
        setMostrarPapelera(false); setMostrarAtrasadas(false); setFiltroEstado('TODOS'); setPage(1);
    }, []);

    const handleTogglePapelera = useCallback(() => {
        setMostrarPapelera((prev) => !prev);
        setMostrarRechazadas(false); setMostrarAtrasadas(false); setFiltroEstado('TODOS'); setPage(1);
    }, []);

    const handleToggleAtrasadas = useCallback(() => {
        setMostrarAtrasadas((prev) => !prev);
        setMostrarRechazadas(false); setMostrarPapelera(false); setFiltroEstado('TODOS'); setPage(1);
    }, []);

    const handleExport = useCallback(() => {
        if (!tickets || tickets.length === 0) return notify.info('No hay datos para exportar.');

        const headers = ['ID', 'Título', 'Estado', 'Prioridad', 'Tipo', 'Clasificación', 'Planta', 'Área', 'Responsables', 'Creado', 'Vencimiento', 'Finalizado'];
        const rows = tickets.map(t => [
            t.id,
            t.titulo,
            t.estado,
            t.prioridad,
            t.tipo,
            t.clasificacion,
            t.planta,
            t.area,
            t.responsables?.map(r => r.nombre).join(', ') || 'Sin asignar',
            formatFechaNumerica(t.createdAt),
            formatFechaNumerica(t.fechaVencimiento),
            formatFechaNumerica(t.finalizadoAt) || 'N/A'
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_tickets_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        notify.success('Exportación generada correctamente (CSV).');
    }, [tickets]);

    const handleCreate = async (payloads) => {
        const items = Array.isArray(payloads) ? payloads : [payloads];
        try {
            for (const payload of items) await createTicket(payload);
            notify.success(items.length > 1 ? `${items.length} tareas creadas correctamente.` : 'Tarea creada correctamente.');
            setShowCreate(false);
            await loadTickets();
        } catch (err) {
            notify.error(err?.response?.data?.error || err?.response?.data?.message || 'Error al crear la tarea.');
            throw err;
        }
    };

    const handleUpdate = async (id, payload) => {
        try {
            await updateTicket(id, payload);
            notify.success('Ticket actualizado correctamente.');
            await loadTickets();
        } catch (err) {
            notify.error(err?.response?.data?.error || err?.response?.data?.message || 'Error al actualizar.');
            throw err;
        }
    };

    const handleChangeStatus = async (id, payload) => {
        try {
            await changeStatus(id, payload);
            notify.success('Estado actualizado correctamente.');
            await loadTickets();
        } catch (err) {
            notify.error(err?.response?.data?.error || err?.response?.data?.message || 'Error al cambiar estado.');
            throw err;
        }
    };

    const sharedViewProps = {
        tickets, loading, submitting, currentUser, tecnicos, page, limit: LIMIT,
        totalPages: meta?.totalPages || 1, totalParaSummary: meta?.totalAbsoluto || 0,
        totalParaPaginador: meta?.totalFiltrado || 0, conteos: meta?.resumenEstados || [],
        existenciaGlobal: metricas?.existenciaGlobal || {},
        totalAtrasadasGlobal: metricas?.global?.backlogAtrasado || 0, sortConfig, query,
        filtroEstado, filtroTipo, filtroPrioridad, filtroClasificacion, filtroResponsable,
        filtroPlanta, filtroArea, filtroProgramacion, filtroConclusion,
        mostrarRechazadas, mostrarPapelera, mostrarAtrasadas,
        onPageChange: setPage, onSortChange: handleSortChange, onSearchChange: handleSearchChange,
        onFilterChange: handleFilterChange, onTipoChange: handleTipoChange, onPrioridadChange: handlePrioridadChange,
        onClasificacionChange: handleClasificacionChange, onResponsableChange: handleResponsableChange,
        onPlantaChange: handlePlantaChange, onAreaChange: handleAreaChange,
        onProgramacionChange: handleProgramacionChange, onConclusionChange: handleConclusionChange,
        onToggleRechazadas: handleToggleRechazadas,
        onTogglePapelera: handleTogglePapelera, onToggleAtrasadas: handleToggleAtrasadas,
        onSave: handleUpdate, onChangeStatus: handleChangeStatus, onOpenCreate: () => setShowCreate(true),
        onRefresh: loadTickets,
        onExport: handleExport
    };

    return (
        <div className="max-w-full mx-auto">
            {isDesktop ? <TicketsHistoricoDesktop {...sharedViewProps} /> : <TicketsHistoricoMobile {...sharedViewProps} />}
            {isDesktop ? (
                <TicketFormModal isOpen={showCreate} onClose={() => setShowCreate(false)} ticketAEditar={null} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={handleCreate} />
            ) : (
                <MobileTicketFormModal isOpen={showCreate} onClose={() => setShowCreate(false)} ticketAEditar={null} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={handleCreate} />
            )}
        </div>
    );
}