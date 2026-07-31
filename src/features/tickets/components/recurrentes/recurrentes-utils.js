export const UNIDADES_FRECUENCIA = [
    { value: 'DIA', label: 'Dias' },
    { value: 'SEMANA', label: 'Semanas' },
    { value: 'MES', label: 'Meses' },
];

export const datePart = (value) => value ? String(value).split('T')[0] : '';

export const fecha = (value) => {
    const raw = datePart(value);
    if (!raw) return 'Sin fecha';
    const [year, month, day] = raw.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (Number.isNaN(date.getTime())) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
};

export const fechaCorta = (value) => {
    const raw = datePart(value);
    if (!raw) return '-';
    const [year, month, day] = raw.split('-');
    return `${day}/${month}/${year}`;
};

export const frecuenciaLabel = (regla) => {
    const safeRegla = regla ?? {};
    const intervalo = Number(safeRegla.intervalo || 1);
    const labels = {
        DIA: intervalo === 1 ? 'Diaria' : `Cada ${intervalo} dias`,
        SEMANA: intervalo === 1 ? 'Semanal' : intervalo === 2 ? 'Quincenal' : `Cada ${intervalo} semanas`,
        MES: intervalo === 1 ? 'Mensual' : intervalo === 2 ? 'Bimestral' : intervalo === 3 ? 'Trimestral' : `Cada ${intervalo} meses`,
    };
    return labels[safeRegla.unidad] || 'Sin frecuencia';
};

const toMinutes = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value !== 'string' || !value.includes(':')) return null;
    const [hours, minutes] = value.split(':').map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
    return (hours * 60) + minutes;
};

export const minutesToHHmm = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const minutes = Number(value);
    if (!Number.isFinite(minutes)) return '';
    const bounded = ((minutes % 1440) + 1440) % 1440;
    return `${String(Math.floor(bounded / 60)).padStart(2, '0')}:${String(bounded % 60).padStart(2, '0')}`;
};

export const horarioLabel = (regla) => {
    const safeRegla = regla ?? {};
    const inicio = safeRegla.horaInicio || minutesToHHmm(safeRegla.horaInicioMinutos);
    const fin = safeRegla.horaFin || minutesToHHmm(safeRegla.horaFinMinutos);
    if (!inicio || !fin) return '';
    const crossesMidnight = toMinutes(fin) <= toMinutes(inicio);
    return `${inicio} - ${fin}${crossesMidnight ? ' (+1 dia)' : ''}`;
};

export const horarioODuracion = (regla) => {
    const safeRegla = regla ?? {};
    const horario = horarioLabel(safeRegla);
    if (horario) return horario;
    return safeRegla.tiempoEstimado ? `${safeRegla.tiempoEstimado} min` : 'Sin duracion';
};

export const responsablesLabel = (responsables = []) => (
    Array.isArray(responsables) && responsables.length
        ? responsables.map((user) => user.nombre).filter(Boolean).join(', ')
        : 'Sin responsables'
);

export const normalizeOptions = (options = []) => options.map((item) => (
    typeof item === 'string'
        ? { value: item, label: item }
        : { value: String(item.value ?? item.id), label: String(item.label ?? item.nombre) }
));

export const getOccurrenceDate = (item) => {
    const safeItem = item ?? {};
    return datePart(safeItem.fechaProgramada)
        || datePart(safeItem.fechaNueva)
        || datePart(safeItem.fechaCicloLogica)
        || datePart(safeItem.fechaOriginal);
};

export const getOccurrenceOriginalDate = (item) => {
    const safeItem = item ?? {};
    return datePart(safeItem.fechaOriginal)
        || datePart(safeItem.fechaCicloLogica);
};

export const isPastMonth = (fechaValue) => {
    const raw = datePart(fechaValue);
    if (!raw) return false;
    const date = new Date(`${raw}T00:00:00`);
    if (Number.isNaN(date.getTime())) return false;
    const today = new Date();
    return date.getFullYear() < today.getFullYear()
        || (date.getFullYear() === today.getFullYear() && date.getMonth() < today.getMonth());
};

export const isSameMonth = (fechaA, fechaB) => {
    const a = datePart(fechaA);
    const b = datePart(fechaB);
    if (!a || !b) return false;
    return a.slice(0, 7) === b.slice(0, 7);
};
