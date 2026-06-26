/**
 * @fileoverview Utilidades de fecha para el frontend.
 *
 * ARQUITECTURA "THIN FRONTEND / FAT BACKEND":
 * Las funciones de COMPARACIÓN de fechas en este archivo están marcadas como @deprecated.
 * Todo nuevo feature debe consumir los flags computados por el backend en el DTO del ticket:
 *   - `ticket.isOverdue`       → la tarea está vencida
 *   - `ticket.perteneceAHoy`   → la tarea pertenece a la vista de hoy
 *   - `ticket.isLate`          → la tarea se entregó tarde
 *   - `ticket.diasEnEspera`    → días que lleva en espera
 */

/**
 * @deprecated NO usar para lógica de negocio.
 * Reemplazar con el flag `ticket.isOverdue` que viene pre-calculado desde el backend
 * con zona horaria America/Mexico_City.
 */
export const isPastDate = (iso) => {
    if (!iso) return false;
    const toMXDateStr = (date) => date.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    return toMXDateStr(new Date(iso)) < toMXDateStr(new Date());
};

/**
 * @deprecated NO usar para lógica de negocio.
 * Reemplazar con el flag `ticket.perteneceAHoy` que viene pre-calculado desde el backend
 * con zona horaria America/Mexico_City.
 */
export const isToday = (iso) => {
    if (!iso) return false;
    const toMXDateStr = (date) => date.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    return toMXDateStr(new Date(iso)) === toMXDateStr(new Date());
};

export const getISOWeekInfo = (dateInput = new Date()) => {
    const toMXDateStr = (date) => date.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    const date = new Date(toMXDateStr(dateInput) + 'T00:00:00');
    const day = date.getDay() || 7;
    date.setDate(date.getDate() + 4 - day);
    const year = date.getFullYear();
    const startOfYear = new Date(toMXDateStr(new Date(year, 0, 1)) + 'T00:00:00');
    const weekNumber = Math.ceil((((date.getTime() - startOfYear.getTime()) / 86400000) + 1) / 7);
    return { year, week: weekNumber };
};

export const getWeekRange = (year, week) => {
    const toMXDateStr = (date) => date.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    const jan4 = new Date(toMXDateStr(new Date(year, 0, 4)) + 'T00:00:00');
    const dow = jan4.getDay() || 7;
    const startOfWeek1 = new Date(jan4.getTime());
    startOfWeek1.setDate(jan4.getDate() - dow + 1);

    const targetStart = new Date(startOfWeek1.getTime());
    targetStart.setDate(startOfWeek1.getDate() + (week - 1) * 7);
    const startStr = toMXDateStr(targetStart);

    const targetEnd = new Date(targetStart.getTime());
    targetEnd.setDate(targetStart.getDate() + 6);
    const endStr = toMXDateStr(targetEnd);

    return { startDate: startStr, endDate: endStr };
};

export const getSemanasInYear = (year) => {
    const dec31 = new Date(year, 11, 31);
    const info = getISOWeekInfo(dec31);
    return info.week === 1 ? 52 : info.week;
};

export const getDateRange = (type) => {
    const toMXDateStr = (date) => date.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    const hoy = toMXDateStr(new Date());
    switch (type) {
        case 'HOY':
            return { startDate: hoy, endDate: hoy };
        case 'AYER': {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            const ayer = toMXDateStr(d);
            return { startDate: ayer, endDate: ayer };
        }
        case 'MANANA': {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            const manana = toMXDateStr(d);
            return { startDate: manana, endDate: manana };
        }
        case 'ESTA_SEMANA': {
            const d = new Date();
            const currentDay = d.getDay();
            const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
            d.setDate(d.getDate() + diffToMonday);
            const lunes = toMXDateStr(d);
            
            const dEnd = new Date(d.getTime());
            dEnd.setDate(dEnd.getDate() + 6);
            const domingo = toMXDateStr(dEnd);
            
            return { startDate: lunes, endDate: domingo };
        }
        default:
            return { startDate: null, endDate: null };
    }
};
