// src/features/dashboard/constants.js
export const PRIORIDAD_COLOR = {
    CRITICA: { bg: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-100' },
    ALTA: { bg: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100' },
    MEDIA: { bg: 'bg-blue-500', text: 'text-blue-700', badge: 'bg-blue-100' },
    BAJA: { bg: 'bg-slate-400', text: 'text-slate-600', badge: 'bg-slate-200' },
};

export const EQUIPO_COLOR_MAP = {
    green: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    amber: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    red: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    neutral: { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
};

export const colorMttr = (mins) => {
    if (mins <= 0) return { bar: 'bg-slate-300', text: 'text-slate-500' };
    if (mins <= 60) return { bar: 'bg-emerald-500', text: 'text-emerald-700' };
    if (mins <= 240) return { bar: 'bg-amber-400', text: 'text-amber-700' };
    return { bar: 'bg-red-500', text: 'text-red-700' };
};