// src/features/common/forms/tareas/validation/date-validation.js
import { getTodayYYYYMMDD } from '../utils/date-utils';

/**
 * Valida que una fecha esté presente.
 * @param {string} fecha - YYYY-MM-DD
 * @param {string} [mensaje] - Mensaje personalizado
 * @returns {string|null} Mensaje de error o null si es válida
 */
export const validateFechaRequerida = (fecha, mensaje = 'La fecha es obligatoria.') => {
    if (!fecha || !fecha.trim()) {
        return mensaje;
    }
    return null;
};

/**
 * Valida que una fecha no sea anterior a hoy.
 * @param {string} fecha - YYYY-MM-DD
 * @param {object} [options]
 * @param {string} [options.mensaje] - Mensaje personalizado
 * @returns {string|null} Mensaje de error o null si es válida
 */
export const validateFechaNoPasada = (fecha, options = {}) => {
    const mensaje = options.mensaje || 'No se permiten fechas anteriores a hoy.';
    
    if (!fecha) return null; // Validador de presencia se encarga de obligar si aplica
    
    const hoy = getTodayYYYYMMDD();
    if (fecha < hoy) {
        return mensaje;
    }
    return null;
};

/**
 * Valida que una nueva fecha de vencimiento en edición no sea pasada,
 * a menos que sea idéntica a la fecha original del registro.
 * @param {string} fechaNueva - YYYY-MM-DD
 * @param {string} fechaOriginal - YYYY-MM-DD
 * @param {object} [options]
 * @param {string} [options.mensaje] - Mensaje personalizado
 * @returns {string|null} Mensaje de error o null si es válida
 */
export const validateFechaEdicionNoPasadaSiCambio = (fechaNueva, fechaOriginal, options = {}) => {
    if (!fechaNueva) return null;
    
    // Si no cambió la fecha original, se permite conservar
    if (fechaOriginal && fechaNueva === fechaOriginal) {
        return null;
    }
    
    return validateFechaNoPasada(fechaNueva, options);
};

/**
 * Valida que la fecha de inicio de recurrencia no sea anterior a hoy.
 * @param {string} fecha - YYYY-MM-DD
 * @param {object} [options]
 * @param {string} [options.mensaje] - Mensaje personalizado
 * @returns {string|null} Mensaje de error o null si es válida
 */
export const validateFechaInicioRecurrencia = (fecha, options = {}) => {
    const mensaje = options.mensaje || 'La fecha de inicio del mantenimiento recurrente no puede estar en el pasado.';
    return validateFechaNoPasada(fecha, { ...options, mensaje });
};
