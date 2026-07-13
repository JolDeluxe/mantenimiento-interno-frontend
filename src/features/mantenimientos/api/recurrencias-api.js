import api from '@/lib/axios';
import {
    createReglaRecurrencia,
    deleteReglaRecurrencia,
    getProyeccionRegla,
    getProyeccionesGlobales,
    materializeReglaCiclo,
    updateReglaRecurrencia,
} from '@/features/maquinaria/api/recurrencias-api';

export {
    createReglaRecurrencia,
    deleteReglaRecurrencia,
    getProyeccionRegla,
    getProyeccionesGlobales,
    materializeReglaCiclo,
    updateReglaRecurrencia,
};

export const getRecurrencias = (params = {}) =>
    api.get('/api/recurrencias', { params });

export const getRecurrenciasMatriz = ({ year, incluirBaja } = {}) =>
    api.get('/api/recurrencias/matriz', { params: { year, ...(incluirBaja ? { incluirBaja: true } : {}) } });

export const getAjustesRegla = (reglaId) =>
    api.get(`/api/recurrencias/${reglaId}/ajustes`);

export const moverOcurrencia = (reglaId, data) =>
    api.post(`/api/recurrencias/${reglaId}/ocurrencias/mover`, data);

export const omitirOcurrencia = (reglaId, data) =>
    api.post(`/api/recurrencias/${reglaId}/ocurrencias/omitir`, data);

export const quitarAjusteOcurrencia = (reglaId, data) =>
    api.delete(`/api/recurrencias/${reglaId}/ocurrencias/ajuste`, { data });
