const BASE_LOCALE = 'es-MX';

export const getMinDateHoy = () => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
};

export const fechaInputToISOLocal = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-');
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00.000Z`;
};

export const isoToDateInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
};

export const formatFechaNumerica = (iso, fallback = null) => {
    if (!iso) return fallback;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString(BASE_LOCALE, {
        day: '2-digit', month: '2-digit', year: 'numeric',
        timeZone: 'America/Mexico_City'
    });
};

export const formatFecha = (iso, fallback = null) => {
    if (!iso) return fallback;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString(BASE_LOCALE, {
        day: '2-digit', month: 'short', year: 'numeric',
        timeZone: 'America/Mexico_City'
    }).replace(/\./g, '');
};

export const formatFechaHora = (iso, fallback = null) => {
    if (!iso) return fallback;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString(BASE_LOCALE, {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Mexico_City'
    });
};

export const formatFechaRelativa = (iso) => {
    if (!iso) return '-';
    const toMXDateStr = (date) => date.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    const hoyMX = toMXDateStr(new Date());
    const fechaMX = toMXDateStr(new Date(iso));

    if (fechaMX === hoyMX) return 'Hoy';

    const dHoy = new Date(hoyMX + 'T00:00:00');
    const dFecha = new Date(fechaMX + 'T00:00:00');
    const diffDays = Math.round((dFecha.getTime() - dHoy.getTime()) / (1000 * 60 * 60 * 24));

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

export const formatDurationToDaysHours = (minutes) => {
    if (minutes === undefined || minutes === null || isNaN(minutes) || minutes < 0) {
        minutes = 0;
    }
    if (minutes < 60) return `${minutes} min`;
    
    const totalHours = Math.floor(minutes / 60);
    const m = minutes % 60;
    
    if (totalHours < 24) {
        return m > 0 ? `${totalHours} h ${m} min` : `${totalHours} h`;
    }
    
    const d = Math.floor(totalHours / 24);
    const h = totalHours % 24;
    
    const dStr = `${d} día${d > 1 ? 's' : ''}`;
    const hStr = h > 0 ? ` ${h} h` : '';
    const mStr = m > 0 ? ` ${m} min` : '';
    return `${dStr}${hStr}${mStr}`;
};
