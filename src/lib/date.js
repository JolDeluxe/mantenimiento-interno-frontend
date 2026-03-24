// src/lib/date.js

/**
 * Formatea una fecha ISO a formato local de México (ej. 24 mar 2026).
 * Permite inyectar un fallback visual si la fecha es nula.
 */
export const formatFecha = (iso, fallback = null) => {
    if (!iso) return fallback;
    return new Date(iso).toLocaleDateString('es-MX', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
};

/**
 * Compara estrictamente si una fecha ISO es anterior al día de hoy (calendario local).
 * Neutraliza horas y resuelve el desfase UTC vs CST.
 */
export const isPastDate = (iso) => {
    if (!iso) return false;
    
    const [fechaString] = iso.split('T');
    const vencimiento = new Date(`${fechaString}T00:00:00`);
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return vencimiento < hoy;
};