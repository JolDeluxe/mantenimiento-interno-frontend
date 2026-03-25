// src/features/tickets/api/tickets-api.js
import api from '@/lib/axios';

// ── Listado y detalle ──────────────────────────────────────────────────────

export const getTickets = (params = {}) =>
    api.get('/api/tickets', { params });

export const getTicketById = (id) =>
    api.get(`/api/tickets/${id}`);

// ── Métricas ───────────────────────────────────────────────────────────────

export const getTicketMetrics = (params = {}) =>
    api.get('/api/tickets/metrics', { params });

// ── Mutaciones ─────────────────────────────────────────────────────────────

export const createTicket = (data) =>
    api.post('/api/tickets', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const updateTicket = (id, data) =>
    api.put(`/api/tickets/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const changeTicketStatus = (id, data) =>
    api.patch(`/api/tickets/${id}/status`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// ── Personal asignable ─────────────────────────────────────────────────────

/**
 * Devuelve personal asignable ya calculado desde el cerebro del backend.
 * Evitamos procesamientos dobles y sobrecarga de red en el cliente.
 */
export const getAsignables = async () => {
    const res = await api.get('/api/usuarios/workload');
    return Array.isArray(res?.data) ? res.data : [];
};