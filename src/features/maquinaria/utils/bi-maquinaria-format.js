export const BI_ROLES = new Set(['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO']);

const MX_OFFSET = '-06:00';

export const toDateInputMX = (date = new Date()) =>
  date.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });

export const addDaysToDateInput = (dateInput, days) => {
  if (!dateInput) return '';
  const [year, month, day] = dateInput.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  return date.toLocaleDateString('en-CA', { timeZone: 'UTC' });
};

export const monthStartInputMX = () => {
  const today = toDateInputMX();
  return `${today.slice(0, 8)}01`;
};

export const dateInputToBIStart = (dateInput) =>
  dateInput ? `${dateInput}T00:00:00${MX_OFFSET}` : '';

export const dateInputToBIEndExclusive = (dateInput) =>
  dateInput ? `${dateInput}T00:00:00${MX_OFFSET}` : '';

export const compactParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => (
      value !== undefined &&
      value !== null &&
      value !== ''
    ))
  );

export const formatInteger = (value, fallback = '—') => {
  if (value === null || value === undefined) return fallback;
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(value);
};

export const formatNumber = (value, fallback = '—') => {
  if (value === null || value === undefined) return fallback;
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(value);
};

export const formatPercent = (value, fallback = '—') => {
  if (value === null || value === undefined) return fallback;
  return `${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value)}%`;
};

export const formatMinutes = (minutes, fallback = '—') => {
  if (minutes === null || minutes === undefined) return fallback;
  if (minutes === 0) return '0 min';
  if (minutes < 60) return `${formatInteger(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours < 24) return mins ? `${hours} h ${mins} min` : `${hours} h`;
  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  return restHours ? `${days} d ${restHours} h` : `${days} d`;
};

export const formatMinutesWithHours = (minutes, fallback = '—') => {
  if (minutes === null || minutes === undefined) return { base: fallback, compact: '' };
  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  return {
    base: `${formatInteger(rounded, '0')} min`,
    compact: hours > 0 ? `${hours} h${mins ? ` ${mins} min` : ''}` : `${mins} min`,
  };
};

export const formatDays = (days, fallback = '—') => {
  if (days === null || days === undefined) return fallback;
  if (days === 0) return '0 días';
  return `${formatNumber(days)} ${Number(days) === 1 ? 'día' : 'días'}`;
};

export const getDisponibilidadTone = (value, agrupacion = 'EQUIPO') => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return {
      dot: 'bg-slate-300',
      text: 'text-slate-700',
      border: 'border-slate-200',
      bg: 'bg-slate-50',
    };
  }

  const disponibilidad = Number(value);
  const thresholds = agrupacion === 'AREA'
    ? { green: 95, yellow: 85 }
    : agrupacion === 'PROCESO'
      ? { green: 95, yellow: 90 }
      : { green: 98, yellow: 97 };

  if (disponibilidad >= thresholds.green) {
    return {
      dot: 'bg-emerald-500',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50',
    };
  }

  if (disponibilidad >= thresholds.yellow) {
    return {
      dot: 'bg-amber-500',
      text: 'text-amber-700',
      border: 'border-amber-200',
      bg: 'bg-amber-50',
    };
  }

  return {
    dot: 'bg-rose-500',
    text: 'text-rose-700',
    border: 'border-rose-200',
    bg: 'bg-rose-50',
  };
};

export const labelEstadoAnalitico = (estado) => {
  const map = {
    CALCULABLE: 'Calculable',
    CONFIRMADO: 'Confirmado',
    PROVISIONAL: 'Provisional',
  };
  return map[estado] || '—';
};

export const getRowTitle = (row) => {
  if (row?.equipo) return `${row.equipo.codigo || '-'} · ${row.equipo.nombre || '-'}`;
  if (row?.proceso) return row.proceso;
  if (Object.prototype.hasOwnProperty.call(row || {}, 'area')) {
    return row.area || 'Area pendiente de registro';
  }
  return row?.key || '-';
};

export const buildBiSummaryMap = (rows = []) => {
  const pairs = rows
    .filter((row) => row?.equipo?.id)
    .map((row) => [String(row.equipo.id), row]);
  return Object.fromEntries(pairs);
};
