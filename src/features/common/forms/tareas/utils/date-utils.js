// src/features/common/forms/tareas/utils/date-utils.js
import {
    getMinDateHoy as getCoreMinDateHoy,
    fechaInputToISOLocal,
    isoToDateInput,
} from '@/lib/date';

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD en la zona horaria de México.
 * @returns {string} YYYY-MM-DD
 */
export const getTodayYYYYMMDD = () => {
    return getCoreMinDateHoy();
};

/**
 * Obtiene la fecha mínima permitida (hoy) en formato YYYY-MM-DD.
 * @returns {string} YYYY-MM-DD
 */
export const getMinDateHoy = () => {
    return getCoreMinDateHoy();
};

/**
 * Convierte un string de fecha seguro 'YYYY-MM-DD' a formato 'DD/MM/YYYY'.
 * @param {string} fechaStr - YYYY-MM-DD
 * @returns {string} DD/MM/YYYY
 */
export const formatDDMMYYYYFromYYYYMMDD = (fechaStr) => {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length < 3) return fechaStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

/**
 * Obtiene el nombre del día de la semana de un string YYYY-MM-DD en español.
 * @param {string} fechaStr - YYYY-MM-DD
 * @returns {string} Nombre del día (ej. 'lunes', 'martes', etc.)
 */
export const getDayNameFromYYYYMMDD = (fechaStr) => {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length < 3) return '';
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    // Crear fecha en formato UTC para evitar corrimientos por timezone local
    const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
    const nombresDias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return nombresDias[date.getUTCDay()];
};

/**
 * Obtiene el número del día del mes (1-31) de un string YYYY-MM-DD.
 * @param {string} fechaStr - YYYY-MM-DD
 * @returns {number} Número de día
 */
export const getDayOfMonthFromYYYYMMDD = (fechaStr) => {
    if (!fechaStr) return 1;
    const parts = fechaStr.split('-');
    if (parts.length < 3) return 1;
    return parseInt(parts[2], 10);
};

/**
 * Determina si la fecha 'YYYY-MM-DD' corresponde a hoy en la zona horaria de México.
 * @param {string} fechaStr - YYYY-MM-DD
 * @returns {boolean} True si es hoy
 */
export const isTodayYYYYMMDD = (fechaStr) => {
    if (!fechaStr) return false;
    return fechaStr === getTodayYYYYMMDD();
};

/**
 * Determina si la fecha 'YYYY-MM-DD' corresponde al futuro (posterior a hoy en la zona horaria de México).
 * @param {string} fechaStr - YYYY-MM-DD
 * @returns {boolean} True si es posterior a hoy
 */
export const isFutureYYYYMMDD = (fechaStr) => {
    if (!fechaStr) return false;
    return fechaStr > getTodayYYYYMMDD();
};

// Re-exportar funciones del core de fechas para consumirlas unificadamente en el módulo tareas
export {
    fechaInputToISOLocal,
    isoToDateInput,
};
