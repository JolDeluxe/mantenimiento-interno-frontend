// src/features/mantenimientos/api/mantenimientos-api.js
import api from '@/lib/axios';
import { QUEUE_OPERATIONS, sendOrQueueMutation } from '@/lib/offline-mutation-queue';

const notifyBIInvalidated = () => {
    window.dispatchEvent(new Event('bi-maquinaria-invalidada'));
};

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
    sendOrQueueMutation({
        operation: QUEUE_OPERATIONS.CREATE_TICKET,
        method: 'POST',
        endpoint: '/api/tickets',
        payload: data,
        headers: { 'Content-Type': 'multipart/form-data' },
        itemCount: 1,
    });

export const updateMantenimiento = (id, data) =>
    api.put(`/api/tickets/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const changeMantenimientoStatus = async (id, data) => {
    const response = await api.patch(`/api/tickets/${id}/status`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    notifyBIInvalidated();
    return response;
};

export const createMantenimientosBatch = (tareas) =>
    sendOrQueueMutation({
        operation: QUEUE_OPERATIONS.CREATE_TICKETS_BATCH,
        method: 'POST',
        endpoint: '/api/tickets/batch',
        payload: { tareas },
        itemCount: Array.isArray(tareas) ? tareas.length : 1,
    });

export const rescheduleMantenimientosBatch = (payload) =>
    api.patch('/api/tickets/reschedule', payload);

export const approveMantenimientosBatch = (payload) =>
    api.patch('/api/tickets/approve-batch', payload);

// ── Personal asignable ─────────────────────────────────────────────────────

export const getAsignables = async () => {
    const res = await api.get('/api/usuarios/workload');
    return Array.isArray(res?.data) ? res.data : [];
};
