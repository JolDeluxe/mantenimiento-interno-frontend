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
