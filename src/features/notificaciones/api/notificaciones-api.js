import api from '@/lib/axios';

export const getNotificaciones = (params = {}) =>
  api.get('/api/notificaciones', { params });

export const getUnreadCount = () =>
  api.get('/api/notificaciones/count');

export const markAsRead = (id) =>
  api.patch(`/api/notificaciones/${id}/read`);

export const markAllAsRead = () =>
  api.patch('/api/notificaciones/read-all');

export const markActioned = (id) =>
  api.patch(`/api/notificaciones/${id}/action`);