// src/features/maquinaria/api/recurrencias-api.js
import api from '@/lib/axios';

// Obtener reglas de recurrencia por máquina
export const getMaquinaRecurrencias = (maquinaId) =>
    api.get(`/api/maquinas/${maquinaId}/recurrencias`);

// Crear regla de recurrencia
export const createReglaRecurrencia = (data) =>
    api.post('/api/recurrencias', data);

// Actualizar regla de recurrencia
export const updateReglaRecurrencia = (id, data) =>
    api.put(`/api/recurrencias/${id}`, data);

// Eliminar (desactivar) regla de recurrencia
export const deleteReglaRecurrencia = (id) =>
    api.delete(`/api/recurrencias/${id}`);

// Materializar un ciclo específico de una regla
export const materializeReglaCiclo = (id, data = {}) =>
    api.post(`/api/recurrencias/${id}/materialize`, data);

// Obtener proyecciones globales por año
export const getProyeccionesGlobales = (params = {}) =>
    api.get('/api/recurrencias/proyecciones', { params });

// Obtener proyecciones individuales de una regla por año
export const getProyeccionRegla = (id, params = {}) =>
    api.get(`/api/recurrencias/${id}/proyeccion`, { params });
