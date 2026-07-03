import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import {
    getTickets,
    createTicket,
    updateTicket,
    changeTicketStatus,
    getAsignables,
    getTicketMetrics,
    createTicketsBatch,
} from '../api/tickets-api';
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

const responsablesSignature = (responsables = []) => responsables
    .map((r) => [r.id, r.nombre, r.imagen].join(':'))
    .join(',');

const ticketSignature = (ticket) => [
    ticket?.id,
    ticket?.updatedAt,
    ticket?.estado,
    ticket?.titulo,
    ticket?.tipo,
    ticket?.clasificacion,
    ticket?.categoria,
    ticket?.prioridad,
    ticket?.planta,
    ticket?.area,
    ticket?.folio,
    ticket?.creadorId,
    ticket?.creador?.id,
    ticket?.creador?.nombre,
    ticket?.createdAt,
    ticket?.fechaVencimiento,
    ticket?.finalizadoAt,
    ticket?.horaInicioProgramada,
    ticket?.horaFinProgramada,
    ticket?.tiempoEstimado,
    ticket?.maquinaId,
    ticket?.maquina?.id,
    ticket?.maquina?.codigo,
    ticket?.maquina?.nombre,
    ticket?.isOverdue,
    ticket?.isLate,
    ticket?.isDueToday,
    ticket?.isDueTomorrow,
    responsablesSignature(ticket?.responsables),
].join('|');

const ticketsSignature = (items = []) => (
    Array.isArray(items) ? items.map(ticketSignature).join('||') : ''
);

const stableStringify = (value) => JSON.stringify(value ?? {});

const buildMetaState = (prev, payload) => {
    const fallbackTotal = Array.isArray(payload?.data) ? payload.data.length : 0;
    const totalFiltrado = typeof payload?.pagination?.total === 'number'
        ? payload.pagination.total
        : fallbackTotal;

    return {
        ...prev,
        totalFiltrado,
        totalPages: typeof payload?.pagination?.totalPages === 'number' ? payload.pagination.totalPages : 1,
        resumenEstados: payload?.resumenEstados ?? prev.resumenEstados,
        totalAbsoluto: typeof payload?.totalAbsoluto === 'number' ? payload.totalAbsoluto : (prev.totalAbsoluto || totalFiltrado),
    };
};

export const useTickets = () => {
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

    const lastFetchParams = useRef({});
    const lastMetricsParams = useRef({});
    const hasHydratedFromCache = useRef(false);
    const lastTicketsSignature = useRef('');
    const lastMetaSignature = useRef('');
    const lastMetricasSignature = useRef('');
    const metaRef = useRef(meta);

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

    const syncMeta = useCallback((next) => {
        const signature = stableStringify(next);
        const currentSignature = stableStringify(metaRef.current);
        if (signature === currentSignature) return;

        metaRef.current = next;
        lastMetaSignature.current = signature;
        setMeta(next);
    }, []);

    const fetchTickets = useCallback(async (params = {}) => {
        setLoading(true);
        lastFetchParams.current = params;

        const cacheKey = paramsToKey(params);
        let snapshot = null;

        try {
            snapshot = await readSnapshot('tickets', cacheKey);
            if (snapshot?.data) {
                const cached = snapshot.data;
                const cachedTickets = Array.isArray(cached.data) ? cached.data : cached;
                const cachedTicketsSignature = ticketsSignature(cachedTickets);
                if (cachedTicketsSignature !== lastTicketsSignature.current) {
                    setTickets(cachedTickets);
                    lastTicketsSignature.current = cachedTicketsSignature;
                }

                if (cached.pagination) {
                    syncMeta(buildMetaState(metaRef.current, cached));
                }
                if (cached.metricas) {
                    const signature = stableStringify(cached.metricas);
                    if (signature !== lastMetricasSignature.current) {
                        setMetricas(cached.metricas);
                        lastMetricasSignature.current = signature;
                    }
                }
                hasHydratedFromCache.current = true;
            }
        } catch (err) {
            console.warn('Cache read failed:', err);
        }

        if (!navigator.onLine) {
            setLoading(false);
            return;
        }

        try {
            const res = await getTickets(params);
            if (Array.isArray(res)) {
                const signature = ticketsSignature(res);
                if (signature !== lastTicketsSignature.current) {
                    setTickets(res);
                    lastTicketsSignature.current = signature;
                }
                syncMeta({ ...metaRef.current, totalFiltrado: res.length, totalPages: 1 });
                await writeSnapshot('tickets', res, cacheKey);
            } else {
                const pagination = res.pagination ?? {};
                const data = Array.isArray(res.data) ? res.data : [];

                const signature = ticketsSignature(data);
                if (signature !== lastTicketsSignature.current) {
                    setTickets(data);
                    lastTicketsSignature.current = signature;
                }
                syncMeta(buildMetaState(metaRef.current, { ...res, pagination }));
                if (res.metricas) {
                    const metricasSignature = stableStringify(res.metricas);
                    if (metricasSignature !== lastMetricasSignature.current) {
                        setMetricas(res.metricas);
                        lastMetricasSignature.current = metricasSignature;
                    }
                    await writeSnapshot('metricas', res.metricas, `metricas_${cacheKey}`);
                }
                await writeSnapshot('tickets', res, cacheKey);
            }
        } catch {
            console.warn('[useTickets] network error');
            if (!hasHydratedFromCache.current) {
                console.warn('No cache available → keeping UI empty safely');
            }
        } finally {
            setLoading(false);
        }
    }, [syncMeta]);

    const fetchMetricas = useCallback(async (params = {}) => {
        lastMetricsParams.current = params;
        const cacheKey = `metricas_${paramsToKey(params)}`;

        try {
            const snapshot = await readSnapshot('metricas', cacheKey);
            if (snapshot?.data) {
                setMetricas(snapshot.data);
            }
        } catch {
            // Cache best-effort: si falla, seguimos con red.
        }

        if (!navigator.onLine) return;

        try {
            const res = await getTicketMetrics(params);
            if (res?.data) {
                setMetricas(res.data);
                await writeSnapshot('metricas', res.data, cacheKey);
            }
        } catch {
            // Métricas best-effort: no bloquean el listado.
        }
    }, []);

    const fetchTecnicos = useCallback(async () => {
        const user = useAuthStore.getState().user;
        const rolesGestion = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];
        if (!user || !rolesGestion.includes(user.rol)) return;

        try {
            const snapshot = await readSnapshot('tecnicos', 'default');
            if (snapshot?.data) {
                setTecnicos(snapshot.data);
            }
        } catch {
            // Cache best-effort: si falla, seguimos con red.
        }

        if (!navigator.onLine) return;

        try {
            const lista = await getAsignables();
            const data = Array.isArray(lista) ? lista : [];
            setTecnicos(data);
            await writeSnapshot('tecnicos', data);
        } catch {
            // Workload best-effort: la UI puede operar sin esta cache.
        }
    }, []);

    const handleCreate = useCallback(async (data) => {
        setSubmitting(true);
        try {
            return await createTicket(data);
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleCreateBatch = useCallback(async (tareas) => {
        setSubmitting(true);
        try {
            return await createTicketsBatch(tareas);
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleUpdate = useCallback(async (id, data) => {
        setSubmitting(true);
        try {
            return await updateTicket(id, data);
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleChangeStatus = useCallback(async (id, data) => {
        setSubmitting(true);
        try {
            return await changeTicketStatus(id, data);
        } finally {
            setSubmitting(false);
        }
    }, []);

    useEffect(() => {
        const handleSyncComplete = () => {
            fetchTickets(lastFetchParams.current);
            if (
                Object.keys(lastMetricsParams.current).length > 0 &&
                paramsToKey(lastMetricsParams.current) !== paramsToKey(lastFetchParams.current)
            ) {
                fetchMetricas(lastMetricsParams.current);
            }
        };
        window.addEventListener('cuadra-sync-complete', handleSyncComplete);
        return () => window.removeEventListener('cuadra-sync-complete', handleSyncComplete);
    }, [fetchTickets, fetchMetricas]);

    return {
        tickets,
        tecnicos,
        meta,
        metricas,
        loading,
        submitting,
        isOffline,
        fetchTickets,
        fetchMetricas,
        fetchTecnicos,
        createTicket: handleCreate,
        createBatch: handleCreateBatch,
        updateTicket: handleUpdate,
        changeStatus: handleChangeStatus,
    };
};
