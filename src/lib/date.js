const BASE_LOCALE = 'es-MX';

export const getMinDateHoy = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

export const fechaInputToISOLocal = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-');
    const toMXDateStr = (date) => date.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    const d = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);
    return d.toISOString();
};

export const isoToDateInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

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

// ── FIRMAS DE TRANSICIÓN TEMPORAL (Sin setHours(0,0,0,0) ni lógica pesada local) ──

export const isPastDate = (iso) => {
    if (!iso) return false;
    const toMXDateStr = (date) => date.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    return toMXDateStr(new Date(iso)) < toMXDateStr(new Date());
};

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