import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import {
    getTickets,
    createTicket,
    updateTicket,
    changeTicketStatus,
    getAsignables,
    getTicketMetrics,
} from '../api/tickets-api';
import { readSnapshot, writeSnapshot } from '@/lib/idb';
import { enqueue } from '@/lib/offline-queue';

const paramsToKey = (params = {}) => {
    const sorted = Object.keys(params)
        .sort()
        .reduce((acc, k) => {
            acc[k] = params[k];
            return acc;
        }, {});
    return JSON.stringify(sorted);
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

    const fetchTickets = useCallback(async (params = {}) => {
        setLoading(true);
        lastFetchParams.current = params;

        const cacheKey = paramsToKey(params);
        let snapshot = null;

        try {
            snapshot = await readSnapshot('tickets', cacheKey);
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
            console.warn('Cache read failed:', err);
        }

        if (!navigator.onLine) {
            setLoading(false);
            return;
        }

        try {
            const res = await getTickets(params);
            if (Array.isArray(res)) {
                setTickets(res);
                setMeta((prev) => ({
                    ...prev,
                    totalFiltrado: res.length,
                    totalPages: 1,
                }));
                await writeSnapshot('tickets', res, cacheKey);
            } else {
                const pagination = res.pagination ?? {};
                const data = Array.isArray(res.data) ? res.data : [];

                setTickets(data);
                setMeta((prev) => ({
                    ...prev,
                    totalFiltrado: pagination.total ?? 0,
                    totalPages: pagination.totalPages ?? 1,
                    resumenEstados: res.resumenEstados ?? prev.resumenEstados,
                    totalAbsoluto: res.totalAbsoluto ?? prev.totalAbsoluto,
                }));
                await writeSnapshot('tickets', res, cacheKey);
            }
        } catch (error) {
            console.warn('[useTickets] network error');
            if (!hasHydratedFromCache.current) {
                console.warn('No cache available → keeping UI empty safely');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMetricas = useCallback(async (params = {}) => {
        lastMetricsParams.current = params;
        const cacheKey = `metricas_${paramsToKey(params)}`;

        try {
            const snapshot = await readSnapshot('metricas', cacheKey);
            if (snapshot?.data) {
                setMetricas(snapshot.data);
            }
        } catch { }

        if (!navigator.onLine) return;

        try {
            const res = await getTicketMetrics(params);
            if (res?.data) {
                setMetricas(res.data);
                await writeSnapshot('metricas', res.data, cacheKey);
            }
        } catch { }
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
        } catch { }

        if (!navigator.onLine) return;

        try {
            const lista = await getAsignables();
            const data = Array.isArray(lista) ? lista : [];
            setTecnicos(data);
            await writeSnapshot('tecnicos', data);
        } catch { }
    }, []);

    const handleCreate = useCallback(async (data) => {
        setSubmitting(true);
        try {
            if (!navigator.onLine) {
                await enqueue({ type: 'CREATE_TICKET', payload: data });
                return { offline: true };
            }
            return await createTicket(data);
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleUpdate = useCallback(async (id, data) => {
        setSubmitting(true);
        try {
            if (!navigator.onLine) {
                await enqueue({ type: 'UPDATE_TICKET', payload: { id, ...data } });
                return { offline: true };
            }
            return await updateTicket(id, data);
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleChangeStatus = useCallback(async (id, data) => {
        setSubmitting(true);
        try {
            if (!navigator.onLine) {
                await enqueue({ type: 'CHANGE_STATUS', payload: { id, ...data } });
                return { offline: true };
            }
            return await changeTicketStatus(id, data);
        } finally {
            setSubmitting(false);
        }
    }, []);

    useEffect(() => {
        const handleSyncComplete = () => {
            fetchTickets(lastFetchParams.current);
            fetchMetricas(lastMetricsParams.current);
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
        updateTicket: handleUpdate,
        changeStatus: handleChangeStatus,
    };
};