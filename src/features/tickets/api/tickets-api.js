// src/features/tickets/api/tickets-api.js
import api from '@/lib/axios';
import { QUEUE_OPERATIONS, sendOrQueueMutation } from '@/lib/offline-mutation-queue';

const notifyBIInvalidated = () => {
    window.dispatchEvent(new Event('bi-maquinaria-invalidada'));
};

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
    sendOrQueueMutation({
        operation: QUEUE_OPERATIONS.CREATE_TICKET,
        method: 'POST',
        endpoint: '/api/tickets',
        payload: data,
        headers: { 'Content-Type': 'multipart/form-data' },
        itemCount: 1,
    });

export const updateTicket = (id, data) =>
    api.put(`/api/tickets/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const changeTicketStatus = async (id, data) => {
    const response = await api.patch(`/api/tickets/${id}/status`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    notifyBIInvalidated();
    return response;
};

export const createTicketsBatch = (tareas) => {
    const list = Array.isArray(tareas) ? tareas : [];
    const hasImages = list.some(t => Array.isArray(t.imagenes) && t.imagenes.some(f => f instanceof Blob || f instanceof File));

    if (!hasImages) {
        const tareasClean = list.map(({ imagenes, ...t }) => t);
        return sendOrQueueMutation({
            operation: QUEUE_OPERATIONS.CREATE_TICKETS_BATCH,
            method: 'POST',
            endpoint: '/api/tickets/batch',
            payload: { tareas: tareasClean },
            itemCount: list.length || 1,
        });
    }

    const fd = new FormData();
    const tareasClean = list.map(({ imagenes, ...t }) => t);
    fd.append('tareas', JSON.stringify(tareasClean));

    list.forEach((tarea, index) => {
        if (Array.isArray(tarea.imagenes)) {
            tarea.imagenes.forEach((file) => {
                if (file instanceof Blob || file instanceof File) {
                    fd.append(`imagenes_${index}`, file);
                }
            });
        }
    });

    return sendOrQueueMutation({
        operation: QUEUE_OPERATIONS.CREATE_TICKETS_BATCH,
        method: 'POST',
        endpoint: '/api/tickets/batch',
        payload: fd,
        headers: { 'Content-Type': 'multipart/form-data' },
        itemCount: list.length || 1,
    });
};

export const rescheduleTicketsBatch = (payload) =>
    api.patch('/api/tickets/reschedule', payload);

export const approveTicketsBatch = (payload) =>
    api.patch('/api/tickets/approve-batch', payload);

// ── Personal asignable ─────────────────────────────────────────────────────

/**
 * Devuelve personal asignable ya calculado desde el cerebro del backend.
 * Evitamos procesamientos dobles y sobrecarga de red en el cliente.
 */
export const getAsignables = async () => {
    const res = await api.get('/api/usuarios/workload');
    return Array.isArray(res?.data) ? res.data : [];
};
