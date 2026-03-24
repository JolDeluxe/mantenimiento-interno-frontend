// src/lib/date.js
// Módulo centralizado de fechas. Ningún componente formatea fechas fuera de aquí.

const BASE_LOCALE = 'es-MX';

/**
 * Devuelve la fecha de hoy en formato YYYY-MM-DD en HORA LOCAL.
 * Uso: atributo min de input[type="date"].
 * Jamás usar new Date().toISOString().split('T')[0] → eso usa UTC y puede dar ayer.
 */
export const getMinDateHoy = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

/**
 * Convierte el string YYYY-MM-DD de un input[type="date"] a ISO local
 * con hora de fin de día, evitando el bug UTC donde "2026-03-24" se parsea
 * como medianoche UTC (= 23-Mar a las 18:00 CST).
 *
 * Envía esto al backend en lugar del string crudo del input.
 * El backend elimina su propio setHours porque ya viene la hora correcta.
 */
export const fechaInputToISOLocal = (dateStr) => {
    if (!dateStr) return null;
    return `${dateStr}T23:59:59`;
};

/**
 * Formato fecha corta: "24 mar 2026"
 * Uso: tablas, cards, badges de vencimiento.
 */
export const formatFecha = (iso, fallback = null) => {
    if (!iso) return fallback;
    return new Date(iso).toLocaleDateString(BASE_LOCALE, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

/**
 * Formato fecha + hora: "24 mar 2026, 12:36 p.m."
 * Uso: modales de detalle, historial, bitácora.
 * Reemplaza las funciones formatFecha locales en ticket-detail-modal y ticket-timeline.
 */
export const formatFechaHora = (iso, fallback = null) => {
    if (!iso) return fallback;
    return new Date(iso).toLocaleDateString(BASE_LOCALE, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Formato relativo: "hace 3 horas", "hace 2 días".
 * Uso: notificaciones, feed de actividad en tiempo real.
 */
export const formatRelativo = (iso, fallback = null) => {
    if (!iso) return fallback;
    const diff = Date.now() - new Date(iso).getTime();
    const minutos = Math.floor(diff / 60000);
    if (minutos < 1) return 'ahora mismo';
    if (minutos < 60) return `hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;
    const dias = Math.floor(horas / 24);
    if (dias < 7) return `hace ${dias} día${dias > 1 ? 's' : ''}`;
    return formatFecha(iso, fallback);
};

/**
 * Compara si una fecha ISO es anterior al día de hoy en hora local.
 * Usa parsing manual para evitar el bug de UTC midnight.
 */
export const isPastDate = (iso) => {
    if (!iso) return false;
    const [fechaStr] = iso.split('T');
    const vencimiento = new Date(`${fechaStr}T00:00:00`);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return vencimiento < hoy;
};

/**
 * Verifica si una fecha ISO corresponde al día de hoy en hora local.
 */
export const isToday = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    const hoy = new Date();
    return (
        d.getFullYear() === hoy.getFullYear() &&
        d.getMonth() === hoy.getMonth() &&
        d.getDate() === hoy.getDate()
    );
};