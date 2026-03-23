// src/features/tickets/api/tickets-api.js
import api from '@/lib/axios';

export const getTickets = (params = {}) =>
  api.get('/api/tickets', { params });

export const getTicketById = (id) =>
  api.get(`/api/tickets/${id}`);

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

export const getTicketMetrics = (params = {}) =>
  api.get('/api/tickets/metrics', { params });

export const getTecnicos = () =>
  api.get('/api/usuarios', {
    params: { rol: 'TECNICO', limit: 500, estado: 'ACTIVO' },
  });