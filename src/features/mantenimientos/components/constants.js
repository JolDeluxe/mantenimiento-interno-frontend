// src/features/tickets/components/constants.js
import { CATEGORIAS_EQUIPO } from '@/features/tickets/constants';

export const CLASIFICACION_ICONS = {
    PREVENTIVO: 'build_circle',
    CORRECTIVO: 'report_problem',
    INSPECCION: 'search',
    RUTINA: 'sync',
};

export const TIPO_STYLES = {
    TICKET: 'bg-slate-100 text-slate-600 border-slate-200/60',
    PLANEADA: 'bg-blue-50 text-blue-700 border-blue-200/60',
    EXTRAORDINARIA: 'bg-purple-50 text-purple-700 border-purple-200/60',
};

export const getClasificacionIcon = (clasificacion) => {
    return CLASIFICACION_ICONS[clasificacion] || 'label';
};

export const getTipoStyle = (tipo) => {
    return TIPO_STYLES[tipo] || 'bg-slate-100 text-slate-500 border-slate-200';
};

export const getCategoriaInfo = (categoria) => {
    return CATEGORIAS_EQUIPO.find(c => c.value === categoria) || {
        label: categoria,
        icon: 'category',
        colorClass: 'bg-slate-100 text-slate-500 border-slate-200'
    };
};
