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

/**
 * Obtiene el nombre del día de la semana de un string YYYY-MM-DD.
 * @param {string} fechaStr - Ej: '2026-07-17' (Viernes)
 * @returns {string} Nombre del día de la semana (ej. 'viernes', 'lunes', etc.)
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
 * Obtiene el día del mes de un string YYYY-MM-DD.
 * @param {string} fechaStr - Ej: '2026-07-17'
 * @returns {number} Número de día (1-31)
 */
export const getDayOfMonthFromYYYYMMDD = (fechaStr) => {
    if (!fechaStr) return 1;
    const parts = fechaStr.split('-');
    if (parts.length < 3) return 1;
    return parseInt(parts[2], 10);
};

/**
 * Convierte un string de fecha seguro 'YYYY-MM-DD' a formato 'DD/MM/YYYY'.
 * @param {string} fechaStr - Ej: '2026-07-10'
 * @returns {string} Ej: '10/07/2026'
 */
export const formatDDMMYYYYFromYYYYMMDD = (fechaStr) => {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length < 3) return fechaStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

/**
 * Determina si la fecha 'YYYY-MM-DD' corresponde a hoy en la zona horaria de México/local.
 */
export const isTodayYYYYMMDD = (fechaStr) => {
    if (!fechaStr) return false;
    const hoy = new Date();
    const hoyStr = hoy.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    return fechaStr === hoyStr;
};

/**
 * Determina si la fecha 'YYYY-MM-DD' corresponde al futuro (posterior a hoy).
 */
export const isFutureYYYYMMDD = (fechaStr) => {
    if (!fechaStr) return false;
    const hoy = new Date();
    const hoyStr = hoy.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    return fechaStr > hoyStr;
};

/**
 * Retorna un texto resumen de la recurrencia.
 */
export const getRecurrenceSummary = ({ fechaStr, frecuencia, intervaloDias }) => {
    if (!fechaStr) {
        return 'Selecciona una fecha para calcular la recurrencia.';
    }

    const diaNombre = getDayNameFromYYYYMMDD(fechaStr);
    const diaMes = getDayOfMonthFromYYYYMMDD(fechaStr);
    const fechaFormateada = formatDDMMYYYYFromYYYYMMDD(fechaStr);

    switch (frecuencia) {
        case 'SEMANAL':
            return `Se repetirá cada ${diaNombre}.`;
        case 'QUINCENAL':
            return `Se repetirá cada 15 días, iniciando el ${diaNombre} ${fechaFormateada}.`;
        case 'MENSUAL':
            if (diaMes === 31) {
                return `Se repetirá el día 31 de cada mes. Si un mes no tiene ese día, se usará el último día del mes.`;
            }
            return `Se repetirá el día ${diaMes} de cada mes.`;
        case 'PERSONALIZADA_DIAS': {
            const dias = parseInt(intervaloDias, 10);
            if (isNaN(dias) || dias <= 0) {
                return 'Indica cada cuántos días debe repetirse.';
            }
            return `Se repetirá cada ${dias} días a partir del ${fechaFormateada}.`;
        }
        default:
            return '';
    }
};
