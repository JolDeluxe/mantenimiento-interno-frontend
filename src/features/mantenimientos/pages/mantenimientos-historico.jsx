// src/features/mantenimientos/pages/mantenimientos-historico.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useMantenimientos } from '../hooks/use-mantenimientos';
import { MantenimientosHistoricoDesktop } from '../views/mantenimientos-historico-desktop';
import { MantenimientosHistoricoMobile } from '../views/mantenimientos-historico-mobile';
import { MantenimientosFormModal as TicketFormModal } from '../components/common/mantenimientos-form-modal';
import { MobileMantenimientosFormModal as MobileTicketFormModal } from '../components/common/mobile-mantenimientos-form-modal';
import { MantenimientosDetailModal as TicketDetailModal } from '@/features/common/components/ticket-detail-modal';
import { MantenimientosFechas } from '@/features/common/components/ticket-fechas';
import { HoyAprobarPanel } from '@/features/hoy/components/common/hoy-aprobar-panel';

const LIMIT = 50;

export default function MantenimientosHistoricoPage({
    forcedClasificacion,
    // eslint-disable-next-line no-unused-vars
    DesktopView = MantenimientosHistoricoDesktop,
    // eslint-disable-next-line no-unused-vars
    MobileView = MantenimientosHistoricoMobile,
}) {
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
        createBatch,
        updateMantenimiento: updateTicket,
        changeStatus,
    } = useMantenimientos();

    const sortedTickets = useMemo(() => {
        if (!tickets) return [];
        const active = tickets.filter(t => t.estado !== 'CERRADO');
        const closed = tickets.filter(t => t.estado === 'CERRADO');
        return [...active, ...closed];
    }, [tickets]);

    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [year, setYear] = useState(null);
    const [month, setMonth] = useState(0);
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

    const [filtroProgramacion, setFiltroProgramacion] = useState({ type: '', start: '', end: '' });
    const [filtroConclusion, setFiltroConclusion] = useState({ type: '', start: '', end: '' });

    const [mostrarRechazadas, setMostrarRechazadas] = useState(false);
    const [mostrarPapelera, setMostrarPapelera] = useState(false);
    const [mostrarAtrasadas, setMostrarAtrasadas] = useState(false);

    const [detailTicket, setDetailTicket] = useState(null);

    const queryPayload = useMemo(() => {
        const params = { page, limit: LIMIT };
        if (query) params.q = query;
        if (year) params.year = year;
        if (year && month > 0) params.month = month;

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
        
        if (forcedClasificacion) {
            params.clasificacion = forcedClasificacion;
        } else if (filtroClasificacion) {
            params.clasificacion = filtroClasificacion;
        }

        if (filtroPlanta) params.planta = filtroPlanta;
        if (filtroArea) params.area = filtroArea;
        if (filtroResponsable) params.responsableId = filtroResponsable;
        if (mostrarAtrasadas) params.vencidos = true;

        if (filtroProgramacion.start) params.vencimientoDesde = filtroProgramacion.start;
        if (filtroProgramacion.end) params.vencimientoHasta = filtroProgramacion.end;

        if (filtroConclusion.start) params.finalizadoDesde = filtroConclusion.start;
        if (filtroConclusion.end) params.finalizadoHasta = filtroConclusion.end;

        if (sortConfig?.key) {
            params.sort = JSON.stringify([{ [sortConfig.key]: sortConfig.direction }]);
        }
        return params;
    }, [page, query, year, month, filtroEstado, filtroTipo, filtroPrioridad, filtroCategoria, filtroClasificacion, forcedClasificacion, filtroResponsable, filtroPlanta, filtroArea, sortConfig, mostrarRechazadas, mostrarPapelera, mostrarAtrasadas, filtroProgramacion, filtroConclusion]);

    const handleYearChange = useCallback((value) => {
        setYear(value);
        setPage(1);
    }, []);

    const handleMonthChange = useCallback((value) => {
        setMonth(value);
        setPage(1);
    }, []);

    const loadTickets = useCallback(() => {
        return fetchTickets(queryPayload).catch(() => notify.error('Error al cargar historial.'));
    }, [fetchTickets, queryPayload]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    useEffect(() => {
        fetchTecnicos();
        fetchMetricas({ scope: 'mantenimientos', clasificacion: forcedClasificacion });
    }, [fetchTecnicos, fetchMetricas, forcedClasificacion]);

    const handleCreate = useCallback(async (formData) => {
        try {
            if (formData === null) {
                // Es un mantenimiento recurrente que ya fue guardado en el formulario
                notify.success('Mantenimiento recurrente creado con éxito.');
            } else if (Array.isArray(formData)) {
                await createBatch(formData);
                notify.success(`${formData.length} mantenimiento${formData.length !== 1 ? 's' : ''} programado${formData.length !== 1 ? 's' : ''} con éxito.`);
            } else {
                await createTicket(formData);
                notify.success('Mantenimiento programado creado con éxito.');
            }
            setShowCreate(false);
            loadTickets();
        } catch (err) {
            const errStr = err.response?.data?.error || err.response?.data?.message || '';
            const isConflict = err.response?.status === 409 || errStr.includes('Conflicto') || errStr.includes('ya tiene programada');
            if (!isConflict) {
                notify.error(errStr || 'Error al crear.');
            }
            throw err;
        }
    }, [createBatch, createTicket, loadTickets]);

    const handleCloseCreate = useCallback(() => {
        setShowCreate(false);
    }, []);

    const handleUpdate = useCallback(async (id, payload) => {
        try {
            await updateTicket(id, payload);
            notify.success('Mantenimiento actualizado con éxito.');
            loadTickets();
        } catch (err) {
            const errStr = err.response?.data?.error || err.response?.data?.message || '';
            const isConflict = err.response?.status === 409 || errStr.includes('Conflicto') || errStr.includes('ya tiene programada');
            if (!isConflict) {
                notify.error(errStr || 'Error al actualizar.');
            }
            throw err;
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
        setQuery(''); setPage(1); setFiltroEstado('TODOS'); setFiltroTipo('');
        setFiltroPrioridad(''); setFiltroCategoria(''); setFiltroClasificacion('');
        setFiltroResponsable(''); setFiltroPlanta(''); setFiltroArea('');
        setFiltroProgramacion({ type: '', start: '', end: '' });
        setFiltroConclusion({ type: '', start: '', end: '' });
        setMostrarRechazadas(false); setMostrarPapelera(false); setMostrarAtrasadas(false);
    }, []);

    const handleExport = useCallback(() => {
        if (!sortedTickets || sortedTickets.length === 0) return notify.info('No hay datos para exportar.');
        const headers = ['ID', 'Título', 'Estado', 'Prioridad', 'Tipo', 'Clasificación', 'Planta', 'Área', 'Responsables', 'Creación', 'Vencimiento', 'Finalización'];
        const formatFechaNumerica = (f) => f ? new Date(f).toLocaleDateString('es-MX') : '';
        const rows = sortedTickets.map(t => [
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
    }, [sortedTickets]);

    const isFiltering = useMemo(() => {
        return query !== '' || filtroEstado !== 'TODOS' || filtroTipo !== '' ||
            filtroPrioridad !== '' || filtroCategoria !== '' || filtroClasificacion !== '' ||
            filtroResponsable !== '' || filtroPlanta !== '' || filtroArea !== '' ||
            filtroProgramacion.type !== '' || filtroConclusion.type !== '' ||
            mostrarRechazadas || mostrarPapelera || mostrarAtrasadas;
    }, [query, filtroEstado, filtroTipo, filtroPrioridad, filtroCategoria, filtroClasificacion, filtroResponsable, filtroPlanta, filtroArea, filtroProgramacion, filtroConclusion, mostrarRechazadas, mostrarPapelera, mostrarAtrasadas]);

    const sharedProps = {
        tickets: sortedTickets,
        loading,
        submitting,
        tecnicos,
        page,
        limit: LIMIT,
        totalPages: meta?.totalPages || 1,
        totalItems: meta?.totalFiltrado || 0,
        totalParaSummary: meta?.totalAbsoluto || 0,
        totalParaPaginador: meta?.totalFiltrado || 0,
        conteos: meta?.resumenEstados || [],
        toApproveCount: meta?.resumenEstados?.RESUELTO ?? 0,
        existenciaGlobal: {
            ...metricas?.existenciaGlobal,
            RECHAZADO: metricas?.totalRechazadas ?? metricas?.existenciaGlobal?.RECHAZADO ?? 0,
        },
        totalAtrasadasGlobal: metricas?.totalAtrasadas ?? metricas?.global?.backlogAtrasado ?? 0,
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
        onExport: handleExport
    };

    return (
        <div className="w-full max-w-full mx-auto flex flex-col gap-4">
            <HoyAprobarPanel toApproveCount={meta?.resumenEstados?.RESUELTO ?? 0} currentUser={currentUser} isMobile={!isDesktop} />
            <MantenimientosFechas
                year={year}
                month={month}
                onYearChange={handleYearChange}
                onMonthChange={handleMonthChange}
                existenciaGlobal={metricas?.existenciaGlobal || {}}
            />
            {isDesktop ? (
                <DesktopView {...sharedProps} />
            ) : (
                <MobileView {...sharedProps} />
            )}

            {showCreate && (
                isDesktop ? (
                    <TicketFormModal
                        isOpen={showCreate}
                        onClose={handleCloseCreate}
                        currentUser={currentUser}
                        tecnicos={tecnicos}
                        isSubmitting={submitting}
                        onSuccess={handleCreate}
                        scope="mantenimientos"
                        defaultClasificacion={forcedClasificacion || "PREVENTIVO"}
                    />
                ) : (
                    <MobileTicketFormModal
                        isOpen={showCreate}
                        onClose={handleCloseCreate}
                        currentUser={currentUser}
                        tecnicos={tecnicos}
                        isSubmitting={submitting}
                        onSuccess={handleCreate}
                        scope="mantenimientos"
                        defaultClasificacion={forcedClasificacion || "PREVENTIVO"}
                    />
                )
            )}
            <TicketDetailModal isOpen={Boolean(detailTicket)} onClose={() => setDetailTicket(null)} ticket={detailTicket} />
        </div>
    );
}
