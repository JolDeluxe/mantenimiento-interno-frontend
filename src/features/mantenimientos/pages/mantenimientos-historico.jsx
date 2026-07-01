// src/features/mantenimientos/pages/mantenimientos-historico.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useMantenimientos } from '../hooks/use-mantenimientos';
import { MantenimientosHistoricoDesktop } from '../views/mantenimientos-historico-desktop';
import { MantenimientosHistoricoMobile } from '../views/mantenimientos-historico-mobile';
import { TicketFormModal } from '../components/historico/ticket-form-modal';
import { MobileTicketFormModal } from '../components/historico/mobile-ticket-form-modal';

const LIMIT = 50;

export default function MantenimientosHistoricoPage({ forcedClasificacion }) {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;

    const {
        mantenimientos: tickets,
        tecnicos,
        meta,
        metricas,
        loading,
        submitting,
        fetchMantenimientos: fetchTickets,
        fetchMetricas,
        fetchTecnicos,
        createMantenimiento: createTicket,
        updateMantenimiento: updateTicket,
        changeStatus,
    } = useMantenimientos();

    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [showCreate, setShowCreate] = useState(false);

    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroClasificacion, setFiltroClasificacion] = useState('');
    const [filtroResponsable, setFiltroResponsable] = useState('');
    const [filtroPlanta, setFiltroPlanta] = useState('');
    const [filtroArea, setFiltroArea] = useState('');

    // Filtros Macro Históricos
    const [filtroYear, setFiltroYear] = useState(null);
    const [filtroMonth, setFiltroMonth] = useState(0);

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
        if (filtroCategoria) params.categoria = filtroCategoria;
        
        // Inyectamos la clasificación forzada o el filtro seleccionado
        if (forcedClasificacion) {
            params.clasificacion = forcedClasificacion;
        } else if (filtroClasificacion) {
            params.clasificacion = filtroClasificacion;
        }

        if (filtroPlanta) params.planta = filtroPlanta;
        if (filtroArea) params.area = filtroArea;
        if (filtroResponsable) params.responsableId = filtroResponsable;
        if (mostrarAtrasadas) params.vencidos = true;

        if (filtroYear) params.year = filtroYear;
        if (filtroMonth > 0) params.month = filtroMonth;

        if (filtroProgramacion.start) params.vencimientoDesde = filtroProgramacion.start;
        if (filtroProgramacion.end) params.vencimientoHasta = filtroProgramacion.end;

        if (filtroConclusion.start) params.finalizadoDesde = filtroConclusion.start;
        if (filtroConclusion.end) params.finalizadoHasta = filtroConclusion.end;

        if (sortConfig?.key) {
            params.sort = JSON.stringify([{ [sortConfig.key]: sortConfig.direction }]);
        }
        return params;
    }, [page, query, filtroEstado, filtroTipo, filtroPrioridad, filtroCategoria, filtroClasificacion, forcedClasificacion, filtroResponsable, filtroPlanta, filtroArea, sortConfig, mostrarRechazadas, mostrarPapelera, mostrarAtrasadas, filtroProgramacion, filtroConclusion, filtroYear, filtroMonth]);

    const loadTickets = useCallback(() => {
        fetchTickets(queryPayload).catch(() => notify.error('Error al cargar historial.'));
    }, [fetchTickets, queryPayload]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    useEffect(() => {
        fetchTecnicos();
        fetchMetricas({ scope: 'mantenimientos' });
    }, [fetchTecnicos, fetchMetricas]);

    const handleCreate = useCallback(async (formData) => {
        try {
            await createTicket(formData);
            notify.success('Mantenimiento programado creado con éxito.');
            setShowCreate(false);
            loadTickets();
        } catch (err) {
            notify.error(err.response?.data?.message || 'Error al crear.');
        }
    }, [createTicket, loadTickets]);

    const handleUpdate = useCallback(async (id, payload) => {
        try {
            await updateTicket(id, payload);
            notify.success('Mantenimiento actualizado con éxito.');
            loadTickets();
        } catch (err) {
            notify.error(err.response?.data?.message || 'Error al actualizar.');
        }
    }, [updateTicket, loadTickets]);

    const handleChangeStatus = useCallback(async (id, payload) => {
        try {
            await changeStatus(id, payload);
            notify.success('Estado actualizado correctamente.');
            loadTickets();
        } catch (err) {
            notify.error(err.response?.data?.message || 'Error al cambiar estado.');
        }
    }, [changeStatus, loadTickets]);

    const handleClearFilters = useCallback(() => {
        setQuery('');
        setFiltroEstado('TODOS');
        setFiltroTipo('');
        setFiltroPrioridad('');
        setFiltroCategoria('');
        setFiltroClasificacion('');
        setFiltroResponsable('');
        setFiltroPlanta('');
        setFiltroArea('');
        setFiltroYear(null);
        setFiltroMonth(0);
        setFiltroProgramacion({ type: '', start: '', end: '' });
        setFiltroConclusion({ type: '', start: '', end: '' });
        setMostrarAtrasadas(false);
        setMostrarRechazadas(false);
        setMostrarPapelera(false);
    }, []);

    const handleExport = useCallback(() => {
        if (!tickets || tickets.length === 0) {
            notify.warn('No hay datos para exportar.');
            return;
        }
        const headers = ['ID', 'Título', 'Estado', 'Prioridad', 'Tipo', 'Clasificación', 'Planta', 'Área', 'Responsables', 'Creación', 'Vencimiento', 'Finalización'];
        const formatFechaNumerica = (f) => f ? new Date(f).toLocaleDateString('es-MX') : '';
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
        link.setAttribute("download", `reporte_mantenimientos_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        notify.success('Exportación generada correctamente (CSV).');
    }, [tickets]);

    const isFiltering = useMemo(() => {
        return Boolean(
            query ||
            filtroEstado !== 'TODOS' ||
            filtroTipo ||
            filtroPrioridad ||
            filtroCategoria ||
            (forcedClasificacion || filtroClasificacion) ||
            filtroResponsable ||
            filtroPlanta ||
            filtroArea ||
            mostrarAtrasadas ||
            mostrarRechazadas ||
            filtroYear ||
            filtroMonth > 0 ||
            filtroProgramacion.start ||
            filtroConclusion.start
        );
    }, [
        query, filtroEstado, filtroTipo, filtroPrioridad, filtroCategoria, 
        forcedClasificacion, filtroClasificacion, filtroResponsable, 
        filtroPlanta, filtroArea, mostrarAtrasadas, mostrarRechazadas, 
        filtroYear, filtroMonth, filtroProgramacion.start, filtroConclusion.start
    ]);

    const sharedProps = {
        tickets,
        tecnicos,
        page,
        limit: LIMIT,
        totalPages: meta?.totalPages || 1,
        totalParaSummary: meta?.totalAbsoluto || 0,
        totalParaPaginador: meta?.totalFiltrado || 0,
        conteos: meta?.resumenEstados || {},
        existenciaGlobal: metricas?.existenciaGlobal || {},
        totalAtrasadasGlobal: metricas?.global?.backlogAtrasado || 0,
        metricas,
        loading,
        submitting,
        currentUser,
        query,
        onSearchChange: setQuery,
        filtroEstado,
        onEstadoChange: setFiltroEstado,
        onFilterChange: setFiltroEstado,
        filtroTipo,
        onTipoChange: setFiltroTipo,
        filtroPrioridad,
        onPrioridadChange: setFiltroPrioridad,
        filtroCategoria,
        onCategoriaChange: setFiltroCategoria,
        filtroClasificacion: forcedClasificacion || filtroClasificacion,
        onClasificacionChange: setFiltroClasificacion,
        filtroResponsable,
        onResponsableChange: setFiltroResponsable,
        filtroPlanta,
        onPlantaChange: setFiltroPlanta,
        filtroArea,
        onAreaChange: setFiltroArea,
        filtroYear,
        onYearChange: setFiltroYear,
        filtroMonth,
        onMonthChange: setFiltroMonth,
        filtroProgramacion,
        onProgramacionChange: setFiltroProgramacion,
        filtroConclusion,
        onConclusionChange: setFiltroConclusion,
        mostrarRechazadas,
        onToggleRechazadas: () => setMostrarRechazadas(p => !p),
        mostrarPapelera,
        onTogglePapelera: () => setMostrarPapelera(p => !p),
        mostrarAtrasadas,
        onToggleAtrasadas: () => setMostrarAtrasadas(p => !p),
        sortConfig,
        onSortChange: setSortConfig,
        onSave: handleUpdate,
        onChangeStatus: handleChangeStatus,
        onOpenCreate: () => setShowCreate(true),
        onPageChange: setPage,
        onRefresh: loadTickets,
        disableClasificacionFilter: Boolean(forcedClasificacion),
        isFiltering,
        onClearFilters: handleClearFilters,
        onExport: handleExport,
    };

    return (
        <div className="max-w-full mx-auto">
            {isDesktop ? (
                <MantenimientosHistoricoDesktop {...sharedProps} />
            ) : (
                <MantenimientosHistoricoMobile {...sharedProps} />
            )}

            {isDesktop ? (
                <TicketFormModal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    currentUser={currentUser}
                    tecnicos={tecnicos}
                    isSubmitting={submitting}
                    onSuccess={handleCreate}
                    scope="mantenimientos"
                />
            ) : (
                <MobileTicketFormModal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    currentUser={currentUser}
                    tecnicos={tecnicos}
                    isSubmitting={submitting}
                    onSuccess={handleCreate}
                    scope="mantenimientos"
                />
            )}
        </div>
    );
}