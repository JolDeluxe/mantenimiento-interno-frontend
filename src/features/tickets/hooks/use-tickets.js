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

export const useTickets = () => {
    const [tickets,    setTickets]    = useState([]);
    const [tecnicos,   setTecnicos]   = useState([]);   
    const [loading,    setLoading]    = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [metricas,   setMetricas]   = useState({});

    const [meta, setMeta] = useState({
        totalFiltrado:  0,
        totalPages:     1,
        resumenEstados: {},
        totalAbsoluto:  0,
    });

    // Referencias de memoria para contexto offline
    const lastFetchParams = useRef({});
    const lastMetricsParams = useRef({});

    // ── Lista principal ────────────────────────────────────────────────────
    const fetchTickets = useCallback(async (params = {}) => {
        setLoading(true);
        lastFetchParams.current = params; // Memorizamos el filtro activo
        
        try {
            const res = await getTickets(params);

            if (Array.isArray(res)) {
                setTickets(res);
                setMeta((prev) => ({ ...prev, totalFiltrado: res.length, totalPages: 1 }));
            } else {
                const pagination = res.pagination ?? {};
                setTickets(Array.isArray(res.data) ? res.data : []);
                setMeta((prev) => ({
                    ...prev,
                    totalFiltrado:  pagination.total     ?? 0,
                    totalPages:     pagination.totalPages ?? 1,
                    resumenEstados: res.resumenEstados    ?? prev.resumenEstados,
                    totalAbsoluto:  res.totalAbsoluto     ?? prev.totalAbsoluto,
                }));
            }
        } catch {
            // Silencioso — manejado por el controlador visual
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Métricas ───────────────────────────────────────────────────────────
    const fetchMetricas = useCallback(async (params = {}) => {
        lastMetricsParams.current = params;
        try {
            const res = await getTicketMetrics(params);
            if (res?.data) setMetricas(res.data);
        } catch {
            // Silencioso
        }
    }, []);

    // ── Personal asignable ─────────────────────────────────────────────────
    const fetchTecnicos = useCallback(async () => {
        const user = useAuthStore.getState().user;
        const rolesGestion = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];

        if (!user || !rolesGestion.includes(user.rol)) return; 

        try {
            const lista = await getAsignables();
            setTecnicos(Array.isArray(lista) ? lista : []);
        } catch {
            // Silencioso
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
            console.log('📡 [Hook Tickets] Sincronización finalizada. Refrescando datos con filtros activos...');
            
            // Refresca la tabla principal si fue inicializada
            if (Object.keys(lastFetchParams.current).length > 0 || tickets.length > 0) {
                fetchTickets(lastFetchParams.current);
            }
            
            // Refresca las métricas si fueron inicializadas
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
        fetchTickets,
        fetchMetricas,
        fetchTecnicos,
        createTicket:  handleCreate,
        updateTicket:  handleUpdate,
        changeStatus:  handleChangeStatus,
    };
};