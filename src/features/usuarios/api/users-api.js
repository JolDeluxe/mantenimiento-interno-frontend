// src/features/usuarios/api/users-api.js
import api from '@/lib/axios';

export const getUsers = async (params = {}) => {
  return await api.get('/api/usuarios', { params });
};

export const createUser = (data) =>
  api.post('/api/usuarios', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
  });

export const updateUser = (id, data) =>
  api.put(`/api/usuarios/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
  });

export const updateUserStatus = (id, estado) =>
  api.patch(`/api/usuarios/${id}`, { estado }).then((r) => r.data);

export const getDepartamentos = () =>
  api.get('/api/departamentos', { params: { limit: 1000 } });