// src/features/calendario/utils/calendarioAdapter.js
import { isoToDateInput } from '@/lib/date';

/**
 * Adapta un listado de tareas (tickets y/o mantenimientos) al formato requerido por InteractiveCalendar.
 * Utiliza isoToDateInput para normalizar la fecha de vencimiento a la zona horaria America/Mexico_City.
 */
export const mapTicketsToCalendarItems = (tickets = []) => {
    return tickets
        .map((t) => ({
            id: String(t.id),
            date: t.fechaVencimiento ? isoToDateInput(t.fechaVencimiento) : null,
            title: t.titulo,
            colorKey: t.estado, // PENDIENTE, ASIGNADA, EN_PROGRESO, etc.
            isMantenimiento: Boolean(t.maquinaId || t.maquina || t.scope === 'mantenimientos' || t.scope === 'mantenimiento'),
            raw: t
        }))
        .filter((item) => item.date !== null && item.date !== '');
};

// Alias para mantener la compatibilidad con el código heredado de mantenimientos
export const mapMantenimientosToCalendarItems = mapTicketsToCalendarItems;
