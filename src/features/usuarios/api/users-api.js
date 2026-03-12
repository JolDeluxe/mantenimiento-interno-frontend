// src/features/usuarios/api/users-api.js
import api from '@/lib/axios';

/**
 * El backend espera `sort` como JSON string: '[{"nombre":"asc"}]'
 * Desestructuramos sortBy/sortOrder del Page y los convertimos aquí.
 */
export const getUsers = ({ sortBy = 'nombre', sortOrder = 'asc', ...rest } = {}) => {
  const sort = JSON.stringify([{ [sortBy]: sortOrder }]);
  return api.get('/api/usuarios', { params: { ...rest, sort } }).then((r) => r.data);
};

export const createUser = (data) =>
  api.post('/api/usuarios', data).then((r) => r.data);

export const updateUser = (id, data) =>
  api.put(`/api/usuarios/${id}`, data).then((r) => r.data);

/**
 * PATCH /:id recibe { estado: 'ACTIVO' | 'INACTIVO' }
 * El campo del schema Prisma es `estado`, NO `estatus`.
 */
export const updateUserStatus = (id, estado) =>
  api.patch(`/api/usuarios/${id}`, { estado }).then((r) => r.data);

export const getDepartamentos = () =>
  api.get('/api/departamentos').then((r) => r.data);