// src/features/calendario/hooks/use-calendario.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { getCalendarioTickets, getCalendarioMetrics, getAsignables } from '../api/calendario-api';
import { readSnapshot, writeSnapshot } from '@/lib/idb';

const paramsToKey = (params = {}) => {
    const sorted = Object.keys(params)
        .sort()
        .reduce((acc, k) => {
            acc[k] = params[k];
            return acc;
        }, {});
    return JSON.stringify(sorted);
};

const getGridBounds = (date, view) => {
    // Aseguramos operar bajo la zona horaria America/Mexico_City
    const localDateStr = date.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    const [year, month, day] = localDateStr.split('-').map(Number);
    const dateNominal = new Date(year, month - 1, day, 12, 0, 0);

    if (view === 'week') {
        const dayOfWeekIndex = dateNominal.getDay() - 1 === -1 ? 6 : dateNominal.getDay() - 1;
        const start = new Date(dateNominal);
        start.setDate(dateNominal.getDate() - dayOfWeekIndex);
        
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        
        return {
            start: start.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }),
            end: end.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
        };
    } else {
        const firstDay = new Date(year, month - 1, 1, 12, 0, 0);
        let firstDayOfWeekIndex = firstDay.getDay() - 1;
        if (firstDayOfWeekIndex === -1) firstDayOfWeekIndex = 6;
        
        const start = new Date(firstDay);
        start.setDate(firstDay.getDate() - firstDayOfWeekIndex);
        
        const end = new Date(start);
        end.setDate(start.getDate() + 41);
        
        return {
            start: start.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }),
            end: end.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
        };
    }
};

const buildCalendarioParams = ({
    calendarDate,
    calendarView,
    scope,
    filtroEstado,
    filtroTipo,
    filtroPrioridad,
    filtroCategoria,
    filtroClasificacion,
    filtroResponsable,
    filtroPlanta,
    filtroArea,
    query,
}) => {
    const bounds = getGridBounds(calendarDate, calendarView);
    const params = {
        limit: 250,
        scope,
        vencimientoDesde: bounds.start,
        vencimientoHasta: bounds.end,
    };

    if (filtroEstado !== 'TODOS') params.estado = filtroEstado;
    if (filtroTipo) params.tipo = filtroTipo;
    if (filtroPrioridad) params.prioridad = filtroPrioridad;
    if (filtroCategoria) params.categoria = filtroCategoria;
    if (filtroClasificacion) params.clasificacion = filtroClasificacion;
    if (filtroResponsable) params.responsableId = filtroResponsable;
    if (filtroPlanta) params.planta = filtroPlanta;
    if (filtroArea) params.area = filtroArea;
    if (query) params.q = query;

    return params;
};

const mergeById = (...lists) => {
    const map = new Map();
    lists.flat().forEach((item) => {
        if (!item?.id) return;
        map.set(String(item.id), { ...(map.get(String(item.id)) || {}), ...item });
    });
    return Array.from(map.values());
};

const getFinalizadosParams = (params, estado) => {
    const { vencimientoDesde, vencimientoHasta, ...rest } = params;
    return {
        ...rest,
        estado,
        finalizadoDesde: vencimientoDesde,
        finalizadoHasta: vencimientoHasta,
    };
};

export const useCalendario = () => {
    const [tickets, setTickets] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [metricas, setMetricas] = useState({});
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    const [meta, setMeta] = useState({
        totalFiltrado: 0,
        totalPages: 1,
        resumenEstados: {},
        totalAbsoluto: 0,
    });

    // Estados de navegación del calendario
    const [calendarDate, setCalendarDate] = useState(() => new Date());
    const [calendarView, setCalendarView] = useState('week');

    // Filtros del calendario
    const [scope, setScope] = useState('general'); // general (Todas), actividades (Actividades), mantenimientos (Mantenimientos)
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroClasificacion, setFiltroClasificacion] = useState('');
    const [filtroResponsable, setFiltroResponsable] = useState('');
    const [filtroPlanta, setFiltroPlanta] = useState('');
    const [filtroArea, setFiltroArea] = useState('');
    const [query, setQuery] = useState('');

    const lastFetchParams = useRef({});
    const hasHydratedFromCache = useRef(false);

    // Detección de conectividad
    useEffect(() => {
        const goOffline = () => setIsOffline(true);
        const goOnline = () => setIsOffline(false);

        window.addEventListener('offline', goOffline);
        window.addEventListener('online', goOnline);

        return () => {
            window.removeEventListener('offline', goOffline);
            window.removeEventListener('online', goOnline);
        };
    }, []);

    // Escuchar el evento de sincronización de fondo para recargar datos
    useEffect(() => {
        const handleReload = () => {
            fetchTickets(lastFetchParams.current);
        };
        window.addEventListener('cuadra-sync-complete', handleReload);
        return () => {
            window.removeEventListener('cuadra-sync-complete', handleReload);
        };
    }, []);

    const fetchTickets = useCallback(async (params = {}) => {
        setLoading(true);
        lastFetchParams.current = params;

        const cacheKey = `calendario_${paramsToKey(params)}`;
        hasHydratedFromCache.current = false;

        // Intentar cargar desde IndexedDB (Caché local)
        try {
            const snapshot = await readSnapshot('tickets', cacheKey);
            if (snapshot?.data) {
                const cached = snapshot.data;
                setTickets(Array.isArray(cached.data) ? cached.data : cached);
                if (cached.pagination) {
                    setMeta((prev) => ({
                        ...prev,
                        totalFiltrado: cached.pagination.total ?? 0,
                        totalPages: cached.pagination.totalPages ?? 1,
                        resumenEstados: cached.resumenEstados ?? prev.resumenEstados,
                        totalAbsoluto: cached.totalAbsoluto ?? prev.totalAbsoluto,
                    }));
                }
                hasHydratedFromCache.current = true;
            }
        } catch (err) {
            console.warn('[IDB] Error de lectura de caché:', err);
        }

        // Si no hay red, terminar aquí
        if (!navigator.onLine) {
            setLoading(false);
            return;
        }

        // Carga desde red
        try {
            const requests = [getCalendarioTickets(params)];
            const shouldFetchFinalizados = !params.estado || ['RESUELTO', 'CERRADO'].includes(params.estado);

            if (shouldFetchFinalizados) {
                const estadosFinalizados = params.estado ? [params.estado] : ['RESUELTO', 'CERRADO'];
                estadosFinalizados.forEach((estado) => {
                    requests.push(getCalendarioTickets(getFinalizadosParams(params, estado)));
                });
            }

            const [res, ...finalizadosRes] = await Promise.all(requests);
            const data = mergeById(
                Array.isArray(res.data) ? res.data : [],
                ...finalizadosRes.map((r) => Array.isArray(r.data) ? r.data : [])
            );
            const pagination = res.pagination ?? {};

            setTickets(data);
            setMeta((prev) => ({
                ...prev,
                totalFiltrado: pagination.total ?? 0,
                totalPages: pagination.totalPages ?? 1,
                resumenEstados: res.resumenEstados ?? prev.resumenEstados,
                totalAbsoluto: res.totalAbsoluto ?? prev.totalAbsoluto,
            }));

            // Guardar en IndexedDB con la lista ya fusionada para conservar la vista offline.
            await writeSnapshot('tickets', { ...res, data }, cacheKey);
        } catch (error) {
            console.warn('[useCalendario] Error de red al cargar tareas:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMetricas = useCallback(async (params = {}) => {
        if (!navigator.onLine) return;
        try {
            const res = await getCalendarioMetrics(params);
            setMetricas(res.data ?? {});
        } catch (err) {
            console.warn('[useCalendario] Error al cargar métricas:', err);
        }
    }, []);

    const fetchTecnicos = useCallback(async () => {
        try {
            const record = await readSnapshot('tecnicos', 'asignables');
            if (record?.data) {
                setTecnicos(record.data);
            }
        } catch {}

        if (!navigator.onLine) return;

        try {
            const data = await getAsignables();
            setTecnicos(data);
            await writeSnapshot('tecnicos', data, 'asignables');
        } catch (err) {
            console.warn('[useCalendario] Error al cargar técnicos:', err);
        }
    }, []);

    // Carga inicial y dependencias de filtros y rango de fechas
    useEffect(() => {
        const params = buildCalendarioParams({
            calendarDate,
            calendarView,
            scope,
            filtroEstado,
            filtroTipo,
            filtroPrioridad,
            filtroCategoria,
            filtroClasificacion,
            filtroResponsable,
            filtroPlanta,
            filtroArea,
            query,
        });

        const timer = setTimeout(() => {
            fetchTickets(params);
            fetchMetricas(params);
        }, 200);

        return () => clearTimeout(timer);
    }, [
        calendarDate,
        calendarView,
        scope,
        filtroEstado,
        filtroTipo,
        filtroPrioridad,
        filtroCategoria,
        filtroClasificacion,
        filtroResponsable,
        filtroPlanta,
        filtroArea,
        query,
        fetchTickets,
        fetchMetricas,
    ]);

    useEffect(() => {
        fetchTecnicos();
    }, [fetchTecnicos]);

    const handleClearFilters = useCallback(() => {
        setScope('general');
        setFiltroEstado('TODOS');
        setFiltroTipo('');
        setFiltroPrioridad('');
        setFiltroCategoria('');
        setFiltroClasificacion('');
        setFiltroResponsable('');
        setFiltroPlanta('');
        setFiltroArea('');
        setQuery('');
    }, []);

    return {
        tickets,
        tecnicos,
        loading,
        submitting,
        setSubmitting,
        meta,
        metricas,
        isOffline,
        // Navegación
        calendarDate,
        setCalendarDate,
        calendarView,
        setCalendarView,
        // Filtros
        scope,
        setScope,
        filtroEstado,
        setFiltroEstado,
        filtroTipo,
        setFiltroTipo,
        filtroPrioridad,
        setFiltroPrioridad,
        filtroCategoria,
        setFiltroCategoria,
        filtroClasificacion,
        setFiltroClasificacion,
        filtroResponsable,
        setFiltroResponsable,
        filtroPlanta,
        setFiltroPlanta,
        filtroArea,
        setFiltroArea,
        query,
        setQuery,
        handleClearFilters,
        refresh: () => {
            const params = buildCalendarioParams({
                calendarDate,
                calendarView,
                scope,
                filtroEstado,
                filtroTipo,
                filtroPrioridad,
                filtroCategoria,
                filtroClasificacion,
                filtroResponsable,
                filtroPlanta,
                filtroArea,
                query,
            });

            fetchTickets(params);
            fetchMetricas(params);
        }
    };
};
