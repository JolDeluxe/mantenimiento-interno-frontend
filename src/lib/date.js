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
    const d = new Date(year, month - 1, day, 23, 59, 59);
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

export const isPastDate = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return false;

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

// Algoritmo matemático estricto ISO 8601
export const getISOWeekInfo = (dateInput = new Date()) => {
    const date = new Date(dateInput.getTime());
    date.setHours(0, 0, 0, 0);
    // Convertir domingo (0) a 7 para semana iniciada en Lunes
    const day = date.getDay() || 7;
    // Pivote al jueves más cercano de la semana evaluada
    date.setDate(date.getDate() + 4 - day);
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const weekNumber = Math.ceil((((date.getTime() - startOfYear.getTime()) / 86400000) + 1) / 7);
    return { year, week: weekNumber };
};

export const getWeekRange = (year, week) => {
    // La semana 1 de la norma ISO siempre contiene el 4 de Enero
    const jan4 = new Date(year, 0, 4);
    const dow = jan4.getDay() || 7;
    const startOfWeek1 = new Date(year, 0, 4 - dow + 1);

    const targetStart = new Date(startOfWeek1.getTime());
    targetStart.setDate(startOfWeek1.getDate() + (week - 1) * 7);

    const startStr = `${targetStart.getFullYear()}-${String(targetStart.getMonth() + 1).padStart(2, '0')}-${String(targetStart.getDate()).padStart(2, '0')}`;

    const targetEnd = new Date(targetStart.getTime());
    targetEnd.setDate(targetStart.getDate() + 6);
    const endStr = `${targetEnd.getFullYear()}-${String(targetEnd.getMonth() + 1).padStart(2, '0')}-${String(targetEnd.getDate()).padStart(2, '0')}`;

    return { startDate: startStr, endDate: endStr };
};

export const getSemanasInYear = (year) => {
    const dec31 = new Date(year, 11, 31);
    const info = getISOWeekInfo(dec31);
    return info.week === 1 ? 52 : info.week;
};

/**
 * Devuelve un objeto con startDate y endDate en formato YYYY-MM-DD
 * para rangos comunes.
 */
export const getDateRange = (type) => {
    const now = new Date();
    const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const formatDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    switch (type) {
        case 'HOY':
            return { startDate: formatDate(hoy), endDate: formatDate(hoy) };
        case 'AYER': {
            const ayer = new Date(hoy);
            ayer.setDate(ayer.getDate() - 1);
            return { startDate: formatDate(ayer), endDate: formatDate(ayer) };
        }
        case 'MANANA': {
            const manana = new Date(hoy);
            manana.setDate(manana.getDate() + 1);
            return { startDate: formatDate(manana), endDate: formatDate(manana) };
        }
        case 'ESTA_SEMANA': {
            // Lunes a Domingo de la semana actual
            const currentDay = hoy.getDay(); // 0 es domingo
            const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
            const lunes = new Date(hoy);
            lunes.setDate(hoy.getDate() + diffToMonday);
            
            const domingo = new Date(lunes);
            domingo.setDate(lunes.getDate() + 6);
            
            return { startDate: formatDate(lunes), endDate: formatDate(domingo) };
        }
        default:
            return { startDate: null, endDate: null };
    }
};