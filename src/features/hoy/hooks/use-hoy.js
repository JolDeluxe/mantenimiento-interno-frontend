// src/features/hoy/hooks/use-hoy.js
import { useState, useCallback, useEffect, useRef } from 'react';
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
const PRIORIDAD_VAL = {
    CRITICA: 4,
    ALTA: 3,
    MEDIA: 2,
    BAJA: 1
};

const sortHoyTicketsHelper = (ticketsList = []) => {
    return [...ticketsList].sort((a, b) => {
        // 1. Primero RECHAZADAS
        const aRechazada = a.estado === 'RECHAZADO' ? 1 : 0;
        const bRechazada = b.estado === 'RECHAZADO' ? 1 : 0;
        if (aRechazada !== bRechazada) {
            return bRechazada - aRechazada;
        }

        // 2. Luego ATRASADAS (isOverdue)
        const aAtrasada = a.isOverdue ? 1 : 0;
        const bAtrasada = b.isOverdue ? 1 : 0;
        if (aAtrasada !== bAtrasada) {
            return bAtrasada - aAtrasada;
        }

        // 3. Luego por HORA (si tiene horaInicioProgramada)
        const aTieneHora = a.horaInicioProgramada ? 1 : 0;
        const bTieneHora = b.horaInicioProgramada ? 1 : 0;
        
        if (aTieneHora && bTieneHora) {
            if (a.horaInicioProgramada < b.horaInicioProgramada) return -1;
            if (a.horaInicioProgramada > b.horaInicioProgramada) return 1;
        }
        
        if (aTieneHora !== bTieneHora) {
            return bTieneHora - aTieneHora;
        }

        // 4. Si no tienen hora (o si tienen la misma hora), ordenar por PRIORIDAD
        const aPrio = PRIORIDAD_VAL[a.prioridad] || 0;
        const bPrio = PRIORIDAD_VAL[b.prioridad] || 0;
        if (aPrio !== bPrio) {
            return bPrio - aPrio;
        }

        // Fallback final por ID
        return b.id - a.id;
    });
};

export const useHoy = (scope = 'general') => {
    const [tickets, setTickets] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [meta, setMeta] = useState({ totalFiltrado: 0, totalPages: 1 });
    // Métricas server-side — sincronizadas con el mismo where que la tabla
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
                const sortedData = sortHoyTicketsHelper(data);
                setTickets(sortedData);
                if (cached.pagination) {
                    setMeta({
                        totalFiltrado: cached.pagination.total ?? 0,
                        totalPages: cached.pagination.totalPages ?? 1,
                    });
                }
            }
        } catch {}
 
        if (!navigator.onLine) {
            setLoading(false);
            return;
        }
 
        try {
            const res = await getHoyTickets(queryParams);
            if (Array.isArray(res)) {
                const sorted = sortHoyTicketsHelper(res);
                setTickets(sorted);
                setMeta({ totalFiltrado: sorted.length, totalPages: 1 });
                setResumenEstados({});
                setTotalAbsoluto(sorted.length);
                await writeSnapshot('tickets', sorted, cacheKey);
            } else {
                const pagination = res.pagination ?? {};
                const data = Array.isArray(res.data) ? res.data : [];
                const sortedData = sortHoyTicketsHelper(data);
                setTickets(sortedData);
                setMeta({
                    totalFiltrado: pagination.total ?? 0,
                    totalPages: pagination.totalPages ?? 1,
                });
                // Consumir métricas server-side directamente
                setResumenEstados(res.resumenEstados ?? {});
                setTotalAbsoluto(res.totalAbsoluto ?? pagination.total ?? 0);
                await writeSnapshot('tickets', { ...res, data: sortedData }, cacheKey);
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
        } catch {}

        if (!navigator.onLine) return;

        try {
            const lista = await getAsignables();
            setTecnicos(lista);
            await writeSnapshot('tecnicos', lista);
        } catch {}
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
        resumenEstados,
        totalAbsoluto,
        fetchTickets,
        fetchTecnicos,
        updateTicket,
        changeStatus,
    };
};
