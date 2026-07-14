// src/features/hoy/hooks/use-hoy.js
import { useState, useCallback, useRef } from 'react';
import { getHoyTickets, updateHoyTicket, getAsignables, changeHoyTicketStatus } from '../api/hoy-api';
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

// Mantiene las tareas activas visibles antes que el backlog de atrasadas.
const ordenarTareasHoy = (lista = []) => lista
    .map((ticket, index) => ({ ticket, index }))
    .sort((a, b) => {
        const prioridad = (ticket) => {
            if (ticket.estado === 'EN_PROGRESO') return 0;
            if (ticket.isOverdue === true) return 1;
            return 2;
        };
        return prioridad(a.ticket) - prioridad(b.ticket) || a.index - b.index;
    })
    .map(({ ticket }) => ticket);

export const useHoy = (scope = 'general') => {
    const [tickets, setTickets] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [meta, setMeta] = useState({ totalFiltrado: 0, totalPages: 1 });
    // Métricas server-side — sincronizadas con el mismo where que la tabla
    const [metricas, setMetricas] = useState({});
    const [resumenEstados, setResumenEstados] = useState({});
    const [totalAbsoluto, setTotalAbsoluto] = useState(0);
 
    const lastFetchParams = useRef({});
 
    const fetchTickets = useCallback(async (params = {}) => {
        setLoading(true);
        const queryParams = { ...params, scope };
        lastFetchParams.current = queryParams;
        const cacheKey = `hoy_${scope}_${paramsToKey(params)}`;
 
        try {
            const snapshot = await readSnapshot('tickets', cacheKey);
            if (snapshot?.data) {
                const cached = snapshot.data;
                const data = Array.isArray(cached.data) ? cached.data : cached;
                setTickets(ordenarTareasHoy(data));
                if (cached.pagination) {
                    setMeta({
                        totalFiltrado: cached.pagination.total ?? 0,
                        totalPages: cached.pagination.totalPages ?? 1,
                    });
                }
                setMetricas(cached.metricas ?? {});
                setResumenEstados(cached.resumenEstados ?? {});
                setTotalAbsoluto(cached.totalAbsoluto ?? cached.pagination?.total ?? 0);
            }
        } catch {
            // Cache miss: continue with network.
        }
 
        if (!navigator.onLine) {
            setLoading(false);
            return;
        }
 
        try {
            const res = await getHoyTickets(queryParams);
            if (Array.isArray(res)) {
                setTickets(ordenarTareasHoy(res));
                setMeta({ totalFiltrado: res.length, totalPages: 1 });
                setMetricas({});
                setResumenEstados({});
                setTotalAbsoluto(res.length);
                await writeSnapshot('tickets', res, cacheKey);
            } else {
                const pagination = res.pagination ?? {};
                const data = Array.isArray(res.data) ? res.data : [];
                setTickets(ordenarTareasHoy(data));
                setMeta({
                    totalFiltrado: pagination.total ?? 0,
                    totalPages: pagination.totalPages ?? 1,
                });
                // Consumir métricas server-side directamente
                setMetricas(res.metricas ?? {});
                setResumenEstados(res.resumenEstados ?? {});
                setTotalAbsoluto(res.totalAbsoluto ?? pagination.total ?? 0);
                await writeSnapshot('tickets', { ...res, data }, cacheKey);
            }
        } catch (err) {
            console.warn('[useHoy] fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [scope]);

    const fetchTecnicos = useCallback(async () => {
        try {
            const snapshot = await readSnapshot('tecnicos', 'default');
            if (snapshot?.data) setTecnicos(snapshot.data);
        } catch {
            // Cache miss: continue with network.
        }

        if (!navigator.onLine) return;

        try {
            const lista = await getAsignables();
            setTecnicos(lista);
            await writeSnapshot('tecnicos', lista);
        } catch {
            // Offline/permission fallback: keep current list.
        }
    }, []);

    const updateTicket = useCallback(async (id, data) => {
        setSubmitting(true);
        try {
            return await updateHoyTicket(id, data);
        } finally {
            setSubmitting(false);
        }
    }, []);

    const changeStatus = useCallback(async (id, data) => {
        setSubmitting(true);
        try {
            return await changeHoyTicketStatus(id, data);
        } finally {
            setSubmitting(false);
        }
    }, []);

    return {
        tickets,
        tecnicos,
        meta,
        loading,
        submitting,
        // Métricas sincronizadas con el filtro activo (vienen del backend)
        metricas,
        resumenEstados,
        totalAbsoluto,
        fetchTickets,
        fetchTecnicos,
        updateTicket,
        changeStatus,
    };
};
