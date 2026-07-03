// src/features/mantenimientos/hooks/use-mantenimientos.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import {
    getMantenimientos,
    createMantenimiento,
    updateMantenimiento,
    changeMantenimientoStatus,
    getAsignables,
    getMantenimientoMetrics,
    createMantenimientosBatch,
} from '../api/mantenimientos-api';
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

export const useMantenimientos = () => {
    const [mantenimientos, setMantenimientos] = useState([]);
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

    const fetchMantenimientos = useCallback(async (params = {}) => {
        setLoading(true);
        lastFetchParams.current = params;

        const cacheKey = paramsToKey(params);
        let snapshot = null;

        try {
            snapshot = await readSnapshot('tickets', `maint_${cacheKey}`);
            if (snapshot?.data) {
                const cached = snapshot.data;
                setMantenimientos(Array.isArray(cached.data) ? cached.data : cached);

                if (cached.pagination) {
                    setMeta((prev) => ({
                        ...prev,
                        totalFiltrado: cached.pagination.total ?? 0,
                        totalPages: cached.pagination.totalPages ?? 1,
                        resumenEstados: cached.resumenEstados ?? prev.resumenEstados,
                        totalAbsoluto: cached.totalAbsoluto ?? prev.totalAbsoluto,
                    }));
                }
                if (cached.metricas) {
                    setMetricas(cached.metricas);
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
            const res = await getMantenimientos(params);
            if (Array.isArray(res)) {
                setMantenimientos(res);
                setMeta((prev) => ({
                    ...prev,
                    totalFiltrado: res.length,
                    totalPages: 1,
                }));
                await writeSnapshot('tickets', res, `maint_${cacheKey}`);
            } else {
                const pagination = res.pagination ?? {};
                const data = Array.isArray(res.data) ? res.data : [];

                setMantenimientos(data);
                setMeta((prev) => ({
                    ...prev,
                    totalFiltrado: pagination.total ?? 0,
                    totalPages: pagination.totalPages ?? 1,
                    resumenEstados: res.resumenEstados ?? prev.resumenEstados,
                    totalAbsoluto: res.totalAbsoluto ?? prev.totalAbsoluto,
                }));
                if (res.metricas) {
                    setMetricas(res.metricas);
                }
                await writeSnapshot('tickets', res, `maint_${cacheKey}`);
            }
        } catch {
            console.warn('[useMantenimientos] network error');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMetricas = useCallback(async (params = {}) => {
        lastMetricsParams.current = params;
        const cacheKey = `maint_metricas_${paramsToKey(params)}`;

        try {
            const snapshot = await readSnapshot('metricas', cacheKey);
            if (snapshot?.data) {
                setMetricas(snapshot.data);
            }
        } catch {
            // Cache best-effort
        }

        if (!navigator.onLine) return;

        try {
            const res = await getMantenimientoMetrics(params);
            if (res?.data) {
                setMetricas(res.data);
                await writeSnapshot('metricas', res.data, cacheKey);
            }
        } catch {
            // Metrics best-effort
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
            // Cache best-effort
        }

        if (!navigator.onLine) return;

        try {
            const lista = await getAsignables();
            const data = Array.isArray(lista) ? lista : [];
            setTecnicos(data);
            await writeSnapshot('tecnicos', data);
        } catch {
            // Workload best-effort
        }
    }, []);

    const handleCreate = useCallback(async (data) => {
        setSubmitting(true);
        try {
            return await createMantenimiento(data);
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleCreateBatch = useCallback(async (tareas) => {
        setSubmitting(true);
        try {
            return await createMantenimientosBatch(tareas);
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleUpdate = useCallback(async (id, data) => {
        setSubmitting(true);
        try {
            return await updateMantenimiento(id, data);
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleChangeStatus = useCallback(async (id, data) => {
        setSubmitting(true);
        try {
            return await changeMantenimientoStatus(id, data);
        } finally {
            setSubmitting(false);
        }
    }, []);

    useEffect(() => {
        const handleSyncComplete = () => {
            fetchMantenimientos(lastFetchParams.current);
            fetchMetricas(lastMetricsParams.current);
        };
        window.addEventListener('cuadra-sync-complete', handleSyncComplete);
        return () => window.removeEventListener('cuadra-sync-complete', handleSyncComplete);
    }, [fetchMantenimientos, fetchMetricas]);

    return {
        mantenimientos,
        tecnicos,
        meta,
        metricas,
        loading,
        submitting,
        isOffline,
        fetchMantenimientos,
        fetchMetricas,
        fetchTecnicos,
        createMantenimiento: handleCreate,
        createBatch: handleCreateBatch,
        updateMantenimiento: handleUpdate,
        changeStatus: handleChangeStatus,
    };
};
