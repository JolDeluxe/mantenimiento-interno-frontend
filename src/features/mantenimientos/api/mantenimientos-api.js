// src/features/mantenimientos/api/mantenimientos-api.js
import api from '@/lib/axios';

// ── Listado y detalle (con scope forzado) ───────────────────────────────────

export const getMantenimientos = (params = {}) =>
    api.get('/api/tickets', { params: { ...params, scope: 'mantenimientos' } });

export const getMantenimientoById = (id) =>
    api.get(`/api/tickets/${id}`);

// ── Métricas ───────────────────────────────────────────────────────────────

export const getMantenimientoMetrics = (params = {}) =>
    api.get('/api/tickets/metrics', { params: { ...params, scope: 'mantenimientos' } });

// ── Mutaciones ─────────────────────────────────────────────────────────────

export const createMantenimiento = (data) =>
    api.post('/api/tickets', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const updateMantenimiento = (id, data) =>
    api.put(`/api/tickets/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const changeMantenimientoStatus = (id, data) =>
    api.patch(`/api/tickets/${id}/status`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const createMantenimientosBatch = (tareas) =>
    api.post('/api/tickets/batch', { tareas });

export const rescheduleMantenimientosBatch = (payload) =>
    api.patch('/api/tickets/reschedule', payload);

// ── Personal asignable ─────────────────────────────────────────────────────

export const getAsignables = async () => {
    const res = await api.get('/api/usuarios/workload');
    return Array.isArray(res?.data) ? res.data : [];
};
