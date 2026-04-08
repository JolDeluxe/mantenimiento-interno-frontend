// src/features/tickets/hooks/use-tickets.js
import { useState, useCallback } from 'react';
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
    const [tecnicos,   setTecnicos]   = useState([]);   // técnicos + coordinadores asignables
    const [loading,    setLoading]    = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [metricas,   setMetricas]   = useState({});

    const [meta, setMeta] = useState({
        totalFiltrado:  0,
        totalPages:     1,
        resumenEstados: {},
        totalAbsoluto:  0,
    });

    // ── Lista principal ────────────────────────────────────────────────────
    const fetchTickets = useCallback(async (params = {}) => {
        setLoading(true);
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

    // ── Personal asignable (técnicos + coordinadores) ─────────────────────
    const fetchTecnicos = useCallback(async () => {
        // Obtenemos el snapshot de la sesión sin suscribir el hook a re-renders
        const user = useAuthStore.getState().user;
        const rolesGestion = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];

        // Guardrail: Abortamos la llamada silenciosamente si el rol no tiene privilegios
        if (!user || !rolesGestion.includes(user.rol)) {
            return; 
        }

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

    const fetchMetricas = useCallback(async (params = {}) => {
        try {
            const res = await getTicketMetrics(params);
            if (res?.data) setMetricas(res.data);
        } catch {
            // Silencioso, manejado por UI global si es necesario
        }
    }, []);

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