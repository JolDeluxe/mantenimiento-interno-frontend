// src/lib/date.js

const BASE_LOCALE = 'es-MX';

// ----------------------------------------------------------------------
// 1. FORMATOS DE DATOS Y FORMULARIOS (Obligatorio YYYY-MM-DD para HTML5)
// ----------------------------------------------------------------------

export const getMinDateHoy = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

export const fechaInputToISOLocal = (dateStr) => {
    if (!dateStr) return null;
    // Fix: Prevenir crash de "Invalid Date" en Safari/iOS al concatenar "T23:59:59" crudo.
    // Instanciamos usando el constructor local y exportamos en formato ISO estricto para Zod.
    const [year, month, day] = dateStr.split('-');
    const d = new Date(year, month - 1, day, 23, 59, 59);
    return d.toISOString(); 
};

export const isoToDateInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    
    // Extracción segura en zona local para inputs de HTML5
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

// ----------------------------------------------------------------------
// 2. FORMATOS DE VISTA / DISPLAY (Formato de México DD/MM/YYYY)
// ----------------------------------------------------------------------

export const formatFechaNumerica = (iso, fallback = null) => {
    if (!iso) return fallback;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString(BASE_LOCALE, {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
};

export const formatFecha = (iso, fallback = null) => {
    if (!iso) return fallback;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString(BASE_LOCALE, {
        day: '2-digit', month: 'short', year: 'numeric',
    }).replace(/\./g, '');
};

export const formatFechaHora = (iso, fallback = null) => {
    if (!iso) return fallback;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString(BASE_LOCALE, {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

export const formatFechaRelativa = (iso) => {
    if (!iso) return '-';
    
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fecha = new Date(iso);
    fecha.setHours(0, 0, 0, 0);

    const diffTime = fecha.getTime() - hoy.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';

    return formatFecha(iso);
};

export const formatRelativo = (iso, fallback = null) => {
    if (!iso) return fallback;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return fallback;

    const diff = Date.now() - d.getTime();
    const minutos = Math.floor(diff / 60000);
    
    if (minutos < 1) return 'ahora mismo';
    if (minutos < 60) return `hace ${minutos} min`;
    
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;
    
    const dias = Math.floor(horas / 24);
    if (dias < 7) return `hace ${dias} día${dias > 1 ? 's' : ''}`;
    
    return formatFecha(iso, fallback);
};

// ----------------------------------------------------------------------
// 3. UTILIDADES LÓGICAS
// ----------------------------------------------------------------------

export const isPastDate = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return false;
    
    // Fix: Cortamos los milisegundos para evaluar estrictamente el cambio de día.
    // Una tarea se marca como atrasada solo si su día límite ya concluyó en su totalidad.
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const limite = new Date(d);
    limite.setHours(0, 0, 0, 0);

    return limite < hoy;
};

export const isToday = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return false;
    
    const hoy = new Date();
    return (
        d.getFullYear() === hoy.getFullYear() &&
        d.getMonth() === hoy.getMonth() &&
        d.getDate() === hoy.getDate()
    );
};