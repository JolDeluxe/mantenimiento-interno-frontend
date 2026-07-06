// src/features/calendario/utils/calendarioAdapter.js
import { isoToDateInput, format12h, isoToLocalMXTime } from '@/lib/date';

const ESTADOS_FINALIZADOS = new Set(['RESUELTO', 'CERRADO']);

const toMillis = (iso) => {
    if (!iso) return null;
    const time = new Date(iso).getTime();
    return Number.isNaN(time) ? null : time;
};

const getTimeLabel = (t) => {
    const inicio = t.fechaInicio ? isoToLocalMXTime(t.fechaInicio) : '';
    const fin = t.finalizadoAt ? isoToLocalMXTime(t.finalizadoAt) : '';

    if (inicio && fin) return `${format12h(inicio)} - ${format12h(fin)}`;
    if (inicio) return `Inicio ${format12h(inicio)}`;
    if (fin) return `Fin ${format12h(fin)}`;
    if (t.horaInicioProgramada) return format12h(t.horaInicioProgramada);
    return '';
};

const getCalendarDate = (t) => {
    if (ESTADOS_FINALIZADOS.has(t.estado)) {
        return isoToDateInput(t.fechaInicio || t.finalizadoAt || t.fechaVencimiento);
    }
    return isoToDateInput(t.fechaVencimiento);
};

const getSortKey = (t) => {
    const hasMeasuredRange = Boolean(t.fechaInicio || t.finalizadoAt);

    if (ESTADOS_FINALIZADOS.has(t.estado)) {
        if (!hasMeasuredRange) return `0-${String(t.id).padStart(8, '0')}`;
        const start = toMillis(t.fechaInicio) ?? toMillis(t.finalizadoAt) ?? 0;
        const end = toMillis(t.finalizadoAt) ?? start;
        return `1-${String(start).padStart(15, '0')}-${String(end).padStart(15, '0')}`;
    }

    return `2-${t.horaInicioProgramada || '99:99'}-${toMillis(t.fechaVencimiento) ?? 0}`;
};

/**
 * Adapta un listado de tareas (reportes y/o mantenimientos) al formato requerido por InteractiveCalendar.
 * Para tareas finalizadas prioriza las fechas medidas por el sistema/manual para mostrar el trabajo real del día.
 */
export const mapTicketsToCalendarItems = (tickets = []) => {
    return tickets
        .map((t) => ({
            id: String(t.id),
            date: getCalendarDate(t),
            title: t.titulo,
            colorKey: t.estado, // PENDIENTE, ASIGNADA, EN_PROGRESO, etc.
            timeLabel: getTimeLabel(t),
            sortKey: getSortKey(t),
            isMantenimiento: Boolean(t.maquinaId || t.maquina || t.scope === 'mantenimientos' || t.scope === 'mantenimiento'),
            raw: t
        }))
        .filter((item) => item.date !== null && item.date !== '');
};

// Alias para mantener la compatibilidad con el código heredado de mantenimientos
export const mapMantenimientosToCalendarItems = mapTicketsToCalendarItems;
