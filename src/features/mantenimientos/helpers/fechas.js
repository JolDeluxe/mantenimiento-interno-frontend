// src/features/mantenimientos/helpers/fechas.js

/**
 * Convierte un string de fecha seguro 'YYYY-MM-DD' en su índice de mes (0-11).
 * Evita el uso de new Date() local que podría causar desfase por zona horaria.
 * 
 * @param {string} fechaStr - Ej: '2026-07-10'
 * @returns {number} 0 para Enero, 11 para Diciembre
 */
export const getMesIndexFromYYYYMMDD = (fechaStr) => {
    if (!fechaStr) return 0;
    const parts = fechaStr.split('-');
    if (parts.length < 2) return 0;
    const mes = parseInt(parts[1], 10);
    return isNaN(mes) ? 0 : mes - 1;
};

/**
 * Obtiene el año de una fecha segura 'YYYY-MM-DD'.
 * 
 * @param {string} fechaStr - Ej: '2026-07-10'
 * @returns {number} Año
 */
export const getYearFromYYYYMMDD = (fechaStr) => {
    if (!fechaStr) return new Date().getFullYear();
    const parts = fechaStr.split('-');
    const year = parseInt(parts[0], 10);
    return isNaN(year) ? new Date().getFullYear() : year;
};

/**
 * Formatea una fecha segura 'YYYY-MM-DD' a formato legible compacto 'DD/MM'.
 * 
 * @param {string} fechaStr - Ej: '2026-07-10'
 * @returns {string} Ej: '10/07'
 */
export const formatearDDMM = (fechaStr) => {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length < 3) return fechaStr;
    const dia = parts[2];
    const mes = parts[1];
    return `${dia}/${mes}`;
};

const NOMBRES_MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Convierte un string de fecha seguro 'YYYY-MM-DD' a formato largo 'DD de Mes'.
 * 
 * @param {string} fechaStr - Ej: '2026-07-10'
 * @returns {string} Ej: '10 de Julio'
 */
export const formatearFechaTextoLargo = (fechaStr) => {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length < 3) return fechaStr;
    const dia = parseInt(parts[2], 10);
    const mesIdx = parseInt(parts[1], 10) - 1;
    const mesNombre = NOMBRES_MESES[mesIdx] || '';
    return `${dia} de ${mesNombre}`;
};
