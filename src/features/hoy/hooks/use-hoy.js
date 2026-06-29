// src/features/hoy/hooks/use-hoy.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { getHoyTickets, updateHoyTicket, getAsignables } from '../api/hoy-api';
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

export const useHoy = (scope = 'general') => {
    const [tickets, setTickets] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [meta, setMeta] = useState({ totalFiltrado: 0, totalPages: 1 });

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
                setTickets(Array.isArray(cached.data) ? cached.data : cached);
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
                setTickets(res);
                setMeta({ totalFiltrado: res.length, totalPages: 1 });
                await writeSnapshot('tickets', res, cacheKey);
            } else {
                const pagination = res.pagination ?? {};
                const data = Array.isArray(res.data) ? res.data : [];
                setTickets(data);
                setMeta({
                    totalFiltrado: pagination.total ?? 0,
                    totalPages: pagination.totalPages ?? 1,
                });
                await writeSnapshot('tickets', res, cacheKey);
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

    return {
        tickets,
        tecnicos,
        meta,
        loading,
        submitting,
        fetchTickets,
        fetchTecnicos,
        updateTicket,
    };
};
