// src/features/tickets/hooks/use-tickets.js
import { useState, useCallback } from 'react';
import {
    getTickets,
    createTicket,
    updateTicket,
    changeTicketStatus,
    getAsignables,
} from '../api/tickets-api';

export const useTickets = () => {
    const [tickets,    setTickets]    = useState([]);
    const [tecnicos,   setTecnicos]   = useState([]);   // técnicos + coordinadores asignables
    const [loading,    setLoading]    = useState(false);
    const [submitting, setSubmitting] = useState(false);

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

    return {
        tickets,
        tecnicos,
        meta,
        loading,
        submitting,
        fetchTickets,
        fetchTecnicos,
        createTicket:  handleCreate,
        updateTicket:  handleUpdate,
        changeStatus:  handleChangeStatus,
    };
};