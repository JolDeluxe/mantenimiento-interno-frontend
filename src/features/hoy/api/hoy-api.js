// src/features/hoy/api/hoy-api.js
import api from '@/lib/axios';

export const getHoyTickets = (params = {}) =>
    api.get('/api/tickets', { params: { ...params, perteneceAHoy: true } });

export const updateHoyTicket = (id, data) =>
    api.put(`/api/tickets/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const changeHoyTicketStatus = (id, data) =>
    api.patch(`/api/tickets/${id}/status`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const getAsignables = async () => {
    const res = await api.get('/api/usuarios/workload');
    return Array.isArray(res?.data) ? res.data : [];
};
