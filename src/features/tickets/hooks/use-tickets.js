// src/features/tickets/hooks/use-tickets.js
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

// Convierte params a una clave estable para el cache
const paramsToKey = (params = {}) => {
    const sorted = Object.keys(params).sort().reduce((acc, k) => {
        acc[k] = params[k];
        return acc;
    }, {});
    return JSON.stringify(sorted);
};

export const useTickets = () => {
    const [tickets,    setTickets]    = useState([]);
    const [tecnicos,   setTecnicos]   = useState([]);
    const [loading,    setLoading]    = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [metricas,   setMetricas]   = useState({});
    // Estado explícito de conectividad
    const [isOffline,  setIsOffline]  = useState(!navigator.onLine);

    const [meta, setMeta] = useState({
        totalFiltrado:  0,
        totalPages:     1,
        resumenEstados: {},
        totalAbsoluto:  0,
    });

    const lastFetchParams   = useRef({});
    const lastMetricsParams = useRef({});

    // ── Listeners de conectividad ──────────────────────────────────────────
    useEffect(() => {
        const goOffline = () => setIsOffline(true);
        const goOnline  = () => setIsOffline(false);
        window.addEventListener('offline', goOffline);
        window.addEventListener('online',  goOnline);
        return () => {
            window.removeEventListener('offline', goOffline);
            window.removeEventListener('online',  goOnline);
        };
    }, []);

    // ── Lista principal ────────────────────────────────────────────────────
    const fetchTickets = useCallback(async (params = {}) => {
        setLoading(true);
        lastFetchParams.current = params;

        const cacheKey = paramsToKey(params);

        // 1. LEER CACHÉ PRIMERO → renderizar inmediatamente
        const snapshot = await readSnapshot('tickets', cacheKey);
        if (snapshot?.data) {
            const { data: cached } = snapshot;
            setTickets(Array.isArray(cached.data) ? cached.data : cached);
            if (cached.pagination) {
                setMeta((prev) => ({
                    ...prev,
                    totalFiltrado:  cached.pagination.total     ?? 0,
                    totalPages:     cached.pagination.totalPages ?? 1,
                    resumenEstados: cached.resumenEstados        ?? prev.resumenEstados,
                    totalAbsoluto:  cached.totalAbsoluto         ?? prev.totalAbsoluto,
                }));
            }
            // Si el dato es fresco y estamos offline, terminamos aquí
            if (!snapshot.isStale && !navigator.onLine) {
                setLoading(false);
                return;
            }
        }

        // 2. Si no hay red, quedarse con lo que ya renderizamos
        if (!navigator.onLine) {
            setLoading(false);
            return;
        }

        // 3. FETCH REAL y actualizar UI + caché
        try {
            const res = await getTickets(params);

            if (Array.isArray(res)) {
                setTickets(res);
                setMeta((prev) => ({ ...prev, totalFiltrado: res.length, totalPages: 1 }));
                await writeSnapshot('tickets', res, cacheKey);
            } else {
                const pagination = res.pagination ?? {};
                const data = Array.isArray(res.data) ? res.data : [];
                setTickets(data);
                setMeta((prev) => ({
                    ...prev,
                    totalFiltrado:  pagination.total      ?? 0,
                    totalPages:     pagination.totalPages  ?? 1,
                    resumenEstados: res.resumenEstados     ?? prev.resumenEstados,
                    totalAbsoluto:  res.totalAbsoluto      ?? prev.totalAbsoluto,
                }));
                // Persistir para offline
                await writeSnapshot('tickets', res, cacheKey);
            }
        } catch (error) {
            // Si falla la red y NO teníamos caché, dejar la UI vacía con indicador
            if (!snapshot?.data) {
                setTickets([]);
            }
            console.warn('[useTickets] fetchTickets offline o error de red.');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Métricas ───────────────────────────────────────────────────────────
    const fetchMetricas = useCallback(async (params = {}) => {
        lastMetricsParams.current = params;
        const cacheKey = `metricas_${paramsToKey(params)}`;

        // Leer caché inmediatamente
        const snapshot = await readSnapshot('metricas', cacheKey);
        if (snapshot?.data) {
            setMetricas(snapshot.data);
            if (!snapshot.isStale && !navigator.onLine) return;
        }

        if (!navigator.onLine) return;

        try {
            const res = await getTicketMetrics(params);
            if (res?.data) {
                setMetricas(res.data);
                await writeSnapshot('metricas', res.data, cacheKey);
            }
        } catch {
            // silencioso — ya renderizó con caché
        }
    }, []);

    // ── Personal asignable ─────────────────────────────────────────────────
    const fetchTecnicos = useCallback(async () => {
        const user = useAuthStore.getState().user;
        const rolesGestion = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];
        if (!user || !rolesGestion.includes(user.rol)) return;

        // Leer caché
        const snapshot = await readSnapshot('tecnicos', 'default');
        if (snapshot?.data) {
            setTecnicos(Array.isArray(snapshot.data) ? snapshot.data : []);
            if (!snapshot.isStale && !navigator.onLine) return;
        }

        if (!navigator.onLine) return;

        try {
            const lista = await getAsignables();
            const data = Array.isArray(lista) ? lista : [];
            setTecnicos(data);
            await writeSnapshot('tecnicos', data);
        } catch {
            // silencioso
        }
    }, []);

    // ── Mutaciones ─────────────────────────────────────────────────────────
    const handleCreate = useCallback(async (data) => {
        setSubmitting(true);
        try { return await createTicket(data); }
        finally { setSubmitting(false); }
    }, []);

    const handleUpdate = useCallback(async (id, data) => {
        setSubmitting(true);
        try { return await updateTicket(id, data); }
        finally { setSubmitting(false); }
    }, []);

    const handleChangeStatus = useCallback(async (id, data) => {
        setSubmitting(true);
        try { return await changeTicketStatus(id, data); }
        finally { setSubmitting(false); }
    }, []);

    // ── Motor Reactivo Offline ─────────────────────────────────────────────
    useEffect(() => {
        const handleSyncComplete = () => {
            if (Object.keys(lastFetchParams.current).length > 0 || tickets.length > 0) {
                fetchTickets(lastFetchParams.current);
            }
            if (Object.keys(metricas).length > 0) {
                fetchMetricas(lastMetricsParams.current);
            }
        };

        window.addEventListener('cuadra-sync-complete', handleSyncComplete);
        return () => window.removeEventListener('cuadra-sync-complete', handleSyncComplete);
    }, [fetchTickets, fetchMetricas, tickets.length, metricas]);

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
        createTicket:  handleCreate,
        updateTicket:  handleUpdate,
        changeStatus:  handleChangeStatus,
    };
};