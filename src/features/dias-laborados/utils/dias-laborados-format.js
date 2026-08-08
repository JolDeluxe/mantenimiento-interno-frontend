export const formatMinutes = (value) => {
  if (value == null) return '—';
  const rounded = Math.round(value);
  if (rounded < 60) return `${rounded.toLocaleString('es-MX')} min`;
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  return minutes > 0
    ? `${hours.toLocaleString('es-MX')} h ${minutes} min`
    : `${hours.toLocaleString('es-MX')} h`;
};

export const formatRawMinutes = (value) => (
  value == null ? '—' : `${Math.round(value).toLocaleString('es-MX')} min`
);

export const formatHoursEquivalent = (value) => {
  if (value == null) return null;
  const rounded = Math.round(value);
  if (rounded <= 0) return null;
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours === 0) return null;
  return minutes > 0
    ? `${hours.toLocaleString('es-MX')} h ${minutes} min`
    : `${hours.toLocaleString('es-MX')} h`;
};

export const formatPercent = (value) => value == null ? '—' : `${Number(value).toFixed(2)}%`;

export const formatDate = (value) => {
  if (!value) return '—';
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(year, month - 1, day));
};

export const getRowTitle = (row, annual) => annual ? row.mesNombre : formatDate(row.fecha);
