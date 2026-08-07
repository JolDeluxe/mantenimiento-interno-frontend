import React, { useMemo } from 'react';
import { Button, Icon, Modal, ModalBody, ModalFooter, ModalHeader, Pagination, SearchableSelect, Spinner, Table } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { getISOWeekInfo, getSemanasInYear, getWeekRange } from '@/lib/date';
import {
  addDaysToDateInput,
  formatDays,
  formatInteger,
  formatMinutes,
  formatPercent,
  getDisponibilidadTone,
  labelEstadoAnalitico,
  monthStartInputMX,
  toDateInputMX,
} from '../../utils/bi-maquinaria-format';

const MESES_CORTOS = [
  { num: 1, name: 'Ene' },
  { num: 2, name: 'Feb' },
  { num: 3, name: 'Mar' },
  { num: 4, name: 'Abr' },
  { num: 5, name: 'May' },
  { num: 6, name: 'Jun' },
  { num: 7, name: 'Jul' },
  { num: 8, name: 'Ago' },
  { num: 9, name: 'Sep' },
  { num: 10, name: 'Oct' },
  { num: 11, name: 'Nov' },
  { num: 12, name: 'Dic' },
];

const MESES_FULL = [
  { num: 1, name: 'Enero' },
  { num: 2, name: 'Febrero' },
  { num: 3, name: 'Marzo' },
  { num: 4, name: 'Abril' },
  { num: 5, name: 'Mayo' },
  { num: 6, name: 'Junio' },
  { num: 7, name: 'Julio' },
  { num: 8, name: 'Agosto' },
  { num: 9, name: 'Septiembre' },
  { num: 10, name: 'Octubre' },
  { num: 11, name: 'Noviembre' },
  { num: 12, name: 'Diciembre' },
];

const normalizeOptions = (items = [], formatter = (value) => value) =>
  items.map((value) => ({ value: String(value), label: formatter(value) }));

const getCurrentYear = () => getISOWeekInfo().year;
const getCurrentMonth = () => new Date().getMonth() + 1;

const buildBiYearOptions = () => {
  const current = getCurrentYear();
  return Array.from({ length: 6 }, (_, index) => current - index);
};

const buildWeekPreset = () => {
  const { year, week } = getISOWeekInfo();
  const { startDate, endDate } = getWeekRange(year, week);
  return { desdeInput: startDate, hastaInput: addDaysToDateInput(endDate, 1) };
};

const buildYearRange = (year) => {
  const currentYear = getCurrentYear();
  const today = toDateInputMX();
  return {
    desdeInput: `${year}-01-01`,
    hastaInput: Number(year) === currentYear ? addDaysToDateInput(today, 1) : `${Number(year) + 1}-01-01`,
  };
};

const buildMonthRange = (year, month) => {
  const monthText = String(month).padStart(2, '0');
  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth();
  const today = toDateInputMX();
  const desdeInput = `${year}-${monthText}-01`;

  if (Number(year) === currentYear && Number(month) === currentMonth) {
    return { desdeInput, hastaInput: addDaysToDateInput(today, 1) };
  }

  const nextMonth = Number(month) === 12 ? 1 : Number(month) + 1;
  const nextYear = Number(month) === 12 ? Number(year) + 1 : Number(year);
  return {
    desdeInput,
    hastaInput: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`,
  };
};

const getAvailableMonths = (year) => {
  const maxYear = getCurrentYear();
  const maxMonth = getCurrentMonth();
  const selectedYear = Number(year);

  return MESES_CORTOS.filter((month) => {
    if (selectedYear === maxYear && month.num > maxMonth) return false;
    return selectedYear <= maxYear;
  });
};

const getAvailableWeeks = (year) => {
  const totalWeeks = getSemanasInYear(Number(year));
  const current = getISOWeekInfo();
  const maxWeek = Number(year) === current.year ? current.week : totalWeeks;
  return Array.from({ length: maxWeek }, (_, index) => index + 1);
};

const PERIOD_PRESETS = [
  {
    id: 'semana',
    label: 'Semana actual',
    icon: 'view_week',
    build: buildWeekPreset,
  },
  {
    id: 'mes',
    label: 'Este mes',
    icon: 'calendar_month',
    build: () => ({ desdeInput: monthStartInputMX(), hastaInput: addDaysToDateInput(toDateInputMX(), 1) }),
  },
  {
    id: 'anio',
    label: 'Año actual',
    icon: 'event',
    build: () => ({ desdeInput: `${getCurrentYear()}-01-01`, hastaInput: addDaysToDateInput(toDateInputMX(), 1) }),
  },
];

const SearchInput = ({ value, onChange }) => (
  <div className="relative min-w-[220px] flex-1">
    <Icon name="search" size="sm" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Buscar código, nombre o familia..."
      className="h-9.5 w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm font-medium text-slate-700 transition-all placeholder:text-slate-400 focus:border-marca-secundario focus:outline-none focus:ring-2 focus:ring-marca-secundario/20"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400 transition-colors hover:text-slate-600"
      >
        <Icon name="close" size="xs" />
      </button>
    )}
  </div>
);

const InlineSelect = ({ options = [], value, onChange, icon, placeholder, className }) => (
  <div className={cn('relative w-full', className)}>
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="h-9.5 w-full appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-8 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 focus:border-marca-secundario focus:outline-none focus:ring-2 focus:ring-marca-secundario/20"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    {icon && (
      <Icon
        name={icon}
        size="sm"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
    )}
    <Icon
      name="expand_more"
      size="sm"
      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
    />
  </div>
);

const formatDateInputLabel = (dateInput) => {
  if (!dateInput) return '--/--/----';
  const [year, month, day] = dateInput.split('-');
  return `${day}/${month}/${year}`;
};

const getSelectedPeriodInfo = (filters) => {
  if (!filters.desdeInput || !filters.hastaInput) {
    const current = getISOWeekInfo();
    return {
      year: current.year,
      month: 0,
      week: null,
      isWeek: false,
      isYear: false,
      isMonth: false,
      label: 'Periodo no definido',
    };
  }

  const desde = filters.desdeInput;
  const hasta = filters.hastaInput;
  const hastaVisible = addDaysToDateInput(hasta, -1);
  const [year, month, day] = desde.split('-').map(Number);
  const selectedWeekInfo = getISOWeekInfo(new Date(year, month - 1, day));
  const expectedWeek = getWeekRange(selectedWeekInfo.year, selectedWeekInfo.week);
  const expectedWeekEndExclusive = addDaysToDateInput(expectedWeek.endDate, 1);
  const isWeek = desde === expectedWeek.startDate && hasta === expectedWeekEndExclusive;

  const expectedMonth = buildMonthRange(year, month);
  const isMonth = day === 1 && desde === expectedMonth.desdeInput && hasta === expectedMonth.hastaInput;

  const expectedYear = buildYearRange(year);
  const isYear = month === 1 && day === 1 && hasta === expectedYear.hastaInput;

  let label = `${formatDateInputLabel(desde)} - ${formatDateInputLabel(hastaVisible)}`;
  if (isWeek) {
    label = `Semana ${selectedWeekInfo.week} - ${selectedWeekInfo.year}`;
  } else if (isMonth) {
    label = `${MESES_FULL.find((m) => m.num === month)?.name || 'Mes'} ${year}`;
  } else if (isYear) {
    label = `Año ${year}`;
  }

  return {
    year,
    month: isMonth ? month : 0,
    week: isWeek ? selectedWeekInfo.week : null,
    isWeek,
    isYear,
    isMonth,
    label,
  };
};

export const BIMaquinariaFilters = ({
  filters,
  catalogs,
  onChange,
  onRefresh,
  refreshing,
  mobile = false,
}) => {
  const periodInfo = useMemo(() => getSelectedPeriodInfo(filters), [filters]);
  const hastaVisibleInput = useMemo(
    () => addDaysToDateInput(filters.hastaInput, -1),
    [filters.hastaInput]
  );
  const yearOptions = useMemo(() => buildBiYearOptions(), []);
  const currentWeekInfo = useMemo(() => getISOWeekInfo(), []);
  const availableWeeks = useMemo(
    () => getAvailableWeeks(periodInfo.year || currentWeekInfo.year),
    [currentWeekInfo.year, periodInfo.year]
  );
  const availableMonths = useMemo(() => {
    const selectedYear = Number(periodInfo.year) || currentWeekInfo.year;
    return getAvailableMonths(selectedYear);
  }, [currentWeekInfo.year, periodInfo.year]);
  const activePreset = useMemo(() => {
    if (
      periodInfo.isWeek &&
      Number(periodInfo.year) === currentWeekInfo.year &&
      Number(periodInfo.week) === currentWeekInfo.week
    ) {
      return 'semana';
    }
    if (
      periodInfo.isMonth &&
      Number(periodInfo.year) === getCurrentYear() &&
      Number(periodInfo.month) === getCurrentMonth()
    ) {
      return 'mes';
    }
    if (periodInfo.isYear && Number(periodInfo.year) === getCurrentYear()) {
      return 'anio';
    }
    return null;
  }, [currentWeekInfo.week, currentWeekInfo.year, periodInfo.isMonth, periodInfo.isWeek, periodInfo.isYear, periodInfo.month, periodInfo.week, periodInfo.year]);
  const options = useMemo(() => ({
    procesos: normalizeOptions(catalogs.procesos),
    areas: normalizeOptions(catalogs.areas),
  }), [catalogs.areas, catalogs.procesos]);

  const handleYearChange = (value) => {
    if (!value) return;
    onChange(buildYearRange(Number(value)));
  };

  const handleMonthChange = (month) => {
    onChange(buildMonthRange(periodInfo.year, Number(month)));
  };

  const handleWeekChange = (week) => {
    const selectedWeek = Number(week);
    if (!selectedWeek) return;
    const { startDate, endDate } = getWeekRange(periodInfo.year, selectedWeek);
    onChange({ desdeInput: startDate, hastaInput: addDaysToDateInput(endDate, 1) });
  };

  return (
    <section className={cn('flex w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm', mobile && 'px-3')}>
      <div className={cn('flex gap-3', mobile ? 'flex-col' : 'items-center justify-between')}>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rápido:</span>
          {PERIOD_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.build())}
              className={cn(
                'flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition-all active:scale-95',
                activePreset === preset.id
                  ? 'border-marca-primario bg-marca-primario text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <Icon name={preset.icon} size="xs" />
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="light" icon="refresh" isLoading={refreshing} onClick={onRefresh}>
            Reintentar
          </Button>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      <div className={cn('flex gap-4', mobile ? 'flex-col' : 'items-center flex-wrap')}>
        <div className="flex shrink-0 items-center gap-2">
          <Icon name="bar_chart" size="sm" className="text-marca-primario" />
          <span className="text-sm font-bold text-slate-700">Explorar por períodos</span>
        </div>

        <div className={cn('grid gap-2', mobile ? 'grid-cols-2' : 'grid-cols-[120px_160px]')}>
          <InlineSelect
            options={yearOptions.map((year) => ({ value: String(year), label: String(year) }))}
            value={String(periodInfo.year)}
            onChange={handleYearChange}
            icon="event"
            allOptionText=""
            placeholder="Año"
            className="font-bold"
          />

          <InlineSelect
            options={availableWeeks.map((week) => ({ value: String(week), label: `Semana ${week}` }))}
            value={periodInfo.isWeek ? String(periodInfo.week) : ''}
            onChange={handleWeekChange}
            icon="view_week"
            allOptionText="Ver por semana"
            placeholder="Semana"
            className="font-bold"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => onChange(buildYearRange(periodInfo.year))}
          className={cn(
            'shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95',
            periodInfo.isYear
              ? 'bg-marca-primario text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          Ver Año Completo
        </button>
        {availableMonths.map((month) => (
          <button
            key={month.num}
            type="button"
            onClick={() => handleMonthChange(month.num)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95',
              periodInfo.isMonth && periodInfo.month === month.num
                ? 'bg-marca-primario text-white shadow-sm'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            )}
          >
            {month.name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/40 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-800 shadow-sm">
        <Icon name="date_range" size="sm" className="text-marca-primario" />
        <span className="truncate">{periodInfo.label}</span>
        <span className="hidden text-slate-400 sm:inline">·</span>
        <span className="hidden text-slate-400 sm:inline">
          {formatDateInputLabel(filters.desdeInput)} - {formatDateInputLabel(hastaVisibleInput)}
        </span>
      </div>

      <div className={cn('grid gap-2', mobile ? 'grid-cols-1' : 'grid-cols-[minmax(280px,1fr)_220px_220px]')}>
        <SearchInput value={filters.buscar} onChange={(buscar) => onChange({ buscar })} />
        <SearchableSelect options={options.procesos} value={filters.proceso} onChange={(proceso) => onChange({ proceso })} placeholder="Familia" allOptionText="Todas" icon="build" disabled={options.procesos.length === 0} />
        <SearchableSelect options={options.areas} value={filters.area} onChange={(area) => onChange({ area })} placeholder="Ubicación" allOptionText="Todas" icon="place" disabled={options.areas.length === 0} />
      </div>
    </section>
  );
};

const SummaryCard = ({ icon, label, value, hint, tone = 'slate' }) => {
  const colors = {
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl border', colors[tone])}>
          <Icon name={icon} size="sm" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
          <p className="truncate text-xl font-black text-slate-900">{value}</p>
        </div>
      </div>
      {hint && <p className="mt-2 text-[11px] font-semibold text-slate-500">{hint}</p>}
    </div>
  );
};

export const BIMaquinariaSummary = ({ resumen, metadata }) => (
  <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <SummaryCard icon="precision_manufacturing" label="Maquinas observadas" value={formatInteger(resumen?.maquinasObservadas)} hint={`${formatInteger(metadata?.totalMaquinasFiltradas)} maquinas filtradas`} />
    <SummaryCard icon="report_problem" label="Frecuencia total" value={formatInteger(resumen?.frecuenciaTotal)} hint={`${formatInteger(resumen?.fallasAbiertas)} abiertas`} tone="amber" />
    <SummaryCard icon="task_alt" label="Fallas restauradas" value={formatInteger(resumen?.fallasRestauradas)} hint={`${formatInteger(resumen?.intervalosMTBFValidos)} intervalos MTBF validos`} tone="emerald" />
    <SummaryCard icon="warning" label="Paros incompletos" value={formatMinutes(resumen?.minutosParcialesSinPorcentaje)} hint={metadata?.periodoRecortadoAHoy ? 'Periodo recortado al dia actual' : 'Periodo solicitado completo'} tone="sky" />
  </section>
);

/**
 * Determina si la disponibilidad de un registro es calculable (no null).
 */
const hasDispCalculable = (row) =>
  row.metricas?.disponibilidad?.valorPorcentaje !== null &&
  row.metricas?.disponibilidad?.valorPorcentaje !== undefined;

/**
 * Asigna posición y badge Top usando el ranking global devuelto por el backend.
 * - _position: posición global (1-based), preferentemente row.ranking del backend;
 *   si no está, se calcula desde la página actual × limite + índice.
 * - _priority: Top 10 → sólo filas con disponibilidad calculable cuyo ranking ≤ 10.
 *
 * El tooltip en la columna # explica el criterio: menor disponibilidad = más crítico.
 */
const withPositions = (rows, metadata) => {
  return rows.map((row, index) => {
    // Preferir ranking global del backend; fallback a cálculo local
    const position =
      row.ranking != null
        ? row.ranking
        : (((metadata?.paginacion?.pagina || 1) - 1) * (metadata?.paginacion?.limite || 25)) + index + 1;

    const dispCalculable = hasDispCalculable(row);
    const isTop = dispCalculable && position <= 10;

    return {
      ...row,
      _position: position,
      _priority: isTop,
    };
  });
};

const PositionBadge = ({ position, priority }) => {
  if (!position) {
    return (
      <span
        className="inline-flex h-8 min-w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-2.5 text-xs font-black text-slate-400"
        title="Sin datos de disponibilidad"
      >
        —
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex h-8 min-w-10 items-center justify-center gap-1 rounded-full border px-2.5 text-xs font-black tabular-nums',
        priority
          ? 'border-marca-primario/25 bg-marca-primario/10 text-marca-primario'
          : 'border-slate-200 bg-slate-50 text-slate-500'
      )}
      title={priority
        ? 'Top 10 de menor disponibilidad — Los equipos con menor disponibilidad se muestran primero.'
        : 'Los equipos con menor disponibilidad se muestran primero.'}
    >
      <span className="text-[10px] opacity-70">#</span>
      {position}
      {priority && (
        <span className="ml-1 rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
          Top
        </span>
      )}
    </span>
  );
};

/** Encabezado de columna clicable para ordenar. */
const SortHeader = ({ label, sortKey, ordenarPor, direccion, onSortChange }) => {
  const isActive = ordenarPor === sortKey;
  const nextDireccion = isActive && direccion === 'ASC' ? 'DESC' : 'ASC';
  return (
    <button
      type="button"
      onClick={() => onSortChange({ ordenarPor: sortKey, direccion: nextDireccion })}
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap font-black uppercase tracking-wide transition-colors',
        isActive ? 'text-marca-primario' : 'text-slate-500 hover:text-slate-800'
      )}
      title={`Ordenar por ${label} ${
        isActive ? (direccion === 'ASC' ? '↑ Ascendente' : '↓ Descendente') : ''
      }`}
    >
      {label}
      <span className={cn('text-[11px]', isActive ? 'opacity-100' : 'opacity-0')}>
        {isActive && direccion === 'ASC' ? '↑' : '↓'}
      </span>
    </button>
  );
};

const formatRepairParts = (minutes) => {
  if (minutes === null || minutes === undefined) {
    return null;
  }

  const total = Math.round(minutes);

  return {
    time: `${formatInteger(total, '0')} min`,
  };
};

const EmptyMetric = () => (
  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-100 px-2 text-sm font-black leading-none text-slate-400">
    —
  </span>
);

const RepairValue = ({ minutes, align = 'center' }) => {
  const formatted = formatRepairParts(minutes);
  if (!formatted) {
    return <EmptyMetric />;
  }

  return (
    <span className={cn(
      'inline-flex flex-col',
      align === 'right' && 'items-end text-right',
      align === 'left' && 'items-start text-left',
      align === 'center' && 'items-center text-center'
    )}>
      <span className="font-black text-slate-900">{formatted.time}</span>
    </span>
  );
};

const AccumulatedRestoration = ({ minutes }) => <RepairValue minutes={minutes} />;

const formatMetricMinutes = (minutes) => (
  minutes === null || minutes === undefined ? null : `${formatInteger(Math.round(minutes))} min`
);

const formatMTBFDays = (mtbf) => {
  if (mtbf?.censurado) {
    const days = mtbf.valorDias ?? 0;
    return `≥ ${formatDays(days, '0 días')}`;
  }
  return formatDays(mtbf?.valorDias, null);
};

const MTBF_SIN_FALLAS_TOOLTIP =
  'No se registraron fallas confirmadas durante el periodo seleccionado, ' +
  'por lo que no es posible calcular el tiempo promedio entre fallas.';

/**
 * Celda MTBF con lógica de presentación:
 * - frecuencia === 0 → "No calculable" con tooltip explicativo.
 * - MTBF censurado   → "≥ X días".
 * - Sin datos        → guión (EmptyMetric).
 */
const MtbfCell = ({ mtbf, frecuencia }) => {
  if (frecuencia === 0) {
    return (
      <span
        className="inline-flex min-w-[78px] items-center justify-center"
        title={MTBF_SIN_FALLAS_TOOLTIP}
        aria-label={MTBF_SIN_FALLAS_TOOLTIP}
      >
        <span className="cursor-help text-xs font-semibold italic text-slate-400 underline decoration-dotted underline-offset-2">
          No calculable
        </span>
      </span>
    );
  }
  return <MetricText metric={mtbf}>{formatMTBFDays(mtbf)}</MetricText>;
};

const MetricText = ({ children, metric }) => {
  void metric;
  const hasValue = children !== null && children !== undefined && children !== '—';
  return (
    <span className="inline-flex min-w-[78px] flex-col items-center justify-center gap-0.5 text-center">
      {hasValue ? (
        <span className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-xs font-black text-slate-800">
          {children}
        </span>
      ) : (
        <EmptyMetric />
      )}
    </span>
  );
};

const AvailabilityText = ({ value, agrupacion = 'EQUIPO' }) => {
  if (value === null || value === undefined) {
    return <EmptyMetric />;
  }

  const tone = getDisponibilidadTone(value, agrupacion);
  return (
    <span className={cn('inline-flex items-center justify-center gap-1.5 rounded-full border px-2 py-1 text-xs font-black', tone.border, tone.bg, tone.text)}>
      <span className={cn('h-2 w-2 rounded-full', tone.dot)} aria-hidden="true" />
      {formatPercent(value, '')}
    </span>
  );
};

const getTechnicalWorkMinutes = (metricas) => (
  metricas?.mttr?.sumaMinutosTrabajoTecnico
);

const getPlannedDowntimeMinutes = (metricas) => metricas?.disponibilidad?.minutosParoPlanificado;

const commonMetricColumns = (ordenarPor, direccion, onSortChange) => {
  const sh = (label, key) =>
    onSortChange
      ? <SortHeader label={label} sortKey={key} ordenarPor={ordenarPor} direccion={direccion} onSortChange={onSortChange} />
      : label;

  return [
    {
      header: sh('T. Reparación', 'TIEMPO_REPARACION'),
      accessorKey: 'restauracion',
      align: 'center',
      headerClassName: 'min-w-[150px]',
      cell: (row) => <AccumulatedRestoration minutes={getTechnicalWorkMinutes(row.metricas)} />,
    },
    {
      header: sh('Frecuencia', 'FRECUENCIA'),
      accessorKey: 'frecuencia',
      align: 'center',
      headerClassName: 'min-w-[95px]',
      cell: (row) => <MetricText>{formatInteger(row.metricas?.frecuencia?.valor)}</MetricText>,
    },
    {
      header: sh('MTTR (min)', 'MTTR'),
      accessorKey: 'mttr',
      align: 'center',
      headerClassName: 'min-w-[95px]',
      cell: (row) => <MetricText metric={row.metricas?.mttr}>{formatMetricMinutes(row.metricas?.mttr?.valorMinutos)}</MetricText>,
    },
    {
      header: sh('MTBF (días)', 'MTBF'),
      accessorKey: 'mtbf',
      align: 'center',
      headerClassName: 'min-w-[95px]',
      cell: (row) => <MtbfCell mtbf={row.metricas?.mtbf} frecuencia={row.metricas?.frecuencia?.valor} />,
    },
    {
      header: sh('Disponibilidad', 'DISPONIBILIDAD'),
      accessorKey: 'disponibilidad',
      align: 'center',
      headerClassName: 'min-w-[120px]',
      cell: (row) => (
        <AvailabilityText
          value={row.metricas?.disponibilidad?.valorPorcentaje}
          agrupacion={row.agrupacion}
        />
      ),
    },
    {
      header: sh('Conf. día', 'CONFIABILIDAD_1D'),
      accessorKey: 'r1',
      align: 'center',
      headerClassName: 'min-w-[100px]',
      cell: (row) => <MetricText metric={row.metricas?.confiabilidad}>{formatPercent(row.metricas?.confiabilidad?.r1DiaPorcentaje, null)}</MetricText>,
    },
    {
      header: sh('Conf. semana', 'CONFIABILIDAD_7D'),
      accessorKey: 'r7',
      align: 'center',
      headerClassName: 'min-w-[110px]',
      cell: (row) => <MetricText>{formatPercent(row.metricas?.confiabilidad?.r7DiasPorcentaje, null)}</MetricText>,
    },
    {
      header: sh('Conf. mes', 'CONFIABILIDAD_30D'),
      accessorKey: 'r30',
      align: 'center',
      headerClassName: 'min-w-[100px]',
      cell: (row) => <MetricText>{formatPercent(row.metricas?.confiabilidad?.r30DiasPorcentaje, null)}</MetricText>,
    },
  ];
};

const getColumns = (agrupacion, onOpenDetail, ordenarPor, direccion, onSortChange) => {
  const positionColumn = {
    header: (
      <span
        className="inline-flex items-center gap-1 text-xs font-black text-slate-500"
        title="Los equipos con menor disponibilidad se muestran primero."
      >
        #
      </span>
    ),
    accessorKey: 'posicion',
    align: 'center',
    headerClassName: 'min-w-[90px]',
    cell: (row) => <PositionBadge position={row._position} priority={row._priority} />,
  };

  const metrics = commonMetricColumns(ordenarPor, direccion, onSortChange);

  if (agrupacion === 'PROCESO') {
    return [
      positionColumn,
      {
        header: 'Familia TPM',
        accessorKey: 'familia',
        headerClassName: 'min-w-[220px]',
        cell: (row) => <span className="font-black uppercase text-slate-800">{row.proceso || '—'}</span>,
      },
      ...metrics,
    ];
  }

  if (agrupacion === 'AREA') {
    return [
      positionColumn,
      {
        header: 'Ubicación',
        accessorKey: 'ubicacion',
        headerClassName: 'min-w-[220px]',
        cell: (row) => <span className="font-black uppercase text-slate-800">{row.area || '—'}</span>,
      },
      ...metrics,
    ];
  }

  return [
    positionColumn,
    {
      header: onSortChange
        ? <SortHeader label="Equipo" sortKey="CODIGO" ordenarPor={ordenarPor} direccion={direccion} onSortChange={onSortChange} />
        : 'Equipo TPM',
      accessorKey: 'equipo',
      headerClassName: 'min-w-[130px]',
      cell: (row) => (
        row.equipo?.id && onOpenDetail ? (
          <button
            type="button"
            onClick={() => onOpenDetail(row.equipo.id)}
            className="font-mono text-xs font-black text-marca-primario underline-offset-2 hover:underline"
          >
            {row.equipo?.codigo || '—'}
          </button>
        ) : (
          <span className="font-mono text-xs font-black text-slate-700">{row.equipo?.codigo || '—'}</span>
        )
      ),
    },
    ...metrics,
  ];
};

/** Leyenda discreta que aparece debajo de la tabla cuando alguna fila no tiene fallas. */
const MTBFLeyenda = ({ rows }) => {
  const hasSinFallas = rows?.some((r) => (r.metricas?.frecuencia?.valor ?? 0) === 0);
  if (!hasSinFallas) return null;
  return (
    <p className="mt-2 px-1 text-[11px] font-medium text-slate-400">
      <span className="font-bold">MTBF no calculable:</span>{' '}
      no hubo fallas confirmadas en el periodo seleccionado.
    </p>
  );
};

export const BIMaquinariaTable = ({
  rows,
  loading,
  metadata,
  agrupacion,
  onPageChange,
  onOpenDetail,
  onDrilldown,
  ordenarPor,
  direccion,
  onSortChange,
}) => {
  const tableRows = withPositions(rows, metadata);
  return (
    <>
      <Table
        data={tableRows}
        columns={getColumns(agrupacion, onOpenDetail, ordenarPor, direccion, onSortChange)}
        loading={loading}
        emptyMessage="No hay indicadores para los filtros seleccionados."
        page={metadata?.paginacion?.pagina}
        totalPages={metadata?.paginacion?.totalPaginas}
        totalItems={metadata?.paginacion?.totalRegistros}
        onPageChange={onPageChange}
        rowClassName={(row) => row._priority ? 'bg-marca-primario/[0.03] hover:bg-marca-primario/[0.06]' : 'bg-white hover:bg-slate-50'}
      />
      <MTBFLeyenda rows={rows} />
    </>
  );
};

const getIdentity = (row, agrupacion) => {
  if (agrupacion === 'PROCESO') return { title: row.proceso || '—' };
  if (agrupacion === 'AREA') return { title: row.area || '—' };
  return { title: row.equipo?.codigo || '—' };
};

export const BIMaquinariaMobileCards = ({ rows, loading, metadata, agrupacion, onPageChange, onOpenDetail }) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
    );
  }

  const cardRows = withPositions(rows, metadata);
  if (!cardRows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <Icon name="precision_manufacturing" className="mx-auto text-slate-300" size="lg" />
        <p className="mt-2 text-sm font-black text-slate-800">Sin registros KPI</p>
        <p className="text-xs font-medium text-slate-500">No hay indicadores para los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {cardRows.map((row) => {
          const identity = getIdentity(row, agrupacion);
          return (
            <article
              key={row.key || row.equipo?.id || `${agrupacion}-${row._position}`}
              onClick={row.equipo?.id ? () => onOpenDetail?.(row.equipo.id) : undefined}
              className={cn(
                'rounded-2xl border bg-white p-4 shadow-sm',
                row.equipo?.id && 'cursor-pointer active:scale-[0.99]',
                row._priority ? 'border-marca-primario/25 bg-marca-primario/[0.03]' : 'border-slate-200'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <PositionBadge position={row._position} priority={row._priority} />
                  </div>
                  <h3 className="truncate text-sm font-black uppercase text-slate-800">{identity.title}</h3>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <InfoPill label="Tiempo reparación" value={<RepairValue minutes={getTechnicalWorkMinutes(row.metricas)} />} />
                <InfoPill label="Frecuencia" value={formatInteger(row.metricas?.frecuencia?.valor)} />
                <InfoPill label="MTTR (min)" value={formatMetricMinutes(row.metricas?.mttr?.valorMinutos)} metric={row.metricas?.mttr} />
                <InfoPill label="MTBF (días)" value={formatMTBFDays(row.metricas?.mtbf)} metric={row.metricas?.mtbf} />
                <InfoPill
                  label="Disponibilidad"
                  value={(
                    <AvailabilityText
                      value={row.metricas?.disponibilidad?.valorPorcentaje}
                      agrupacion={row.agrupacion}
                    />
                  )}
                  metric={row.metricas?.disponibilidad}
                />
                <InfoPill label="Confiabilidad día" value={formatPercent(row.metricas?.confiabilidad?.r1DiaPorcentaje, null)} metric={row.metricas?.confiabilidad} />
                <InfoPill label="Confiabilidad semana" value={formatPercent(row.metricas?.confiabilidad?.r7DiasPorcentaje, null)} metric={row.metricas?.confiabilidad} />
                <InfoPill label="Confiabilidad mes" value={formatPercent(row.metricas?.confiabilidad?.r30DiasPorcentaje, null)} metric={row.metricas?.confiabilidad} />
              </div>
            </article>
          );
        })}
      </div>
      <Pagination
        variant="floating"
        page={metadata?.paginacion?.pagina}
        totalPages={metadata?.paginacion?.totalPaginas}
        totalItems={metadata?.paginacion?.totalRegistros}
        onPageChange={onPageChange}
        loading={loading}
      />
    </>
  );
};

const InfoPill = ({ label, value, metric }) => {
  void metric;
  const hasValue = value !== null && value !== undefined && value !== '—';
  return (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 inline-flex min-h-7 w-full items-center justify-center gap-1 font-black text-slate-800">
      {hasValue ? value : <EmptyMetric />}
    </p>
  </div>
  );
};

export const BIErrorState = ({ errorInfo, onRetry }) => {
  if (!errorInfo) return null;
  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800" role="alert">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Icon name="error" size="sm" className="mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-black uppercase">No se pudieron cargar los indicadores.</h3>
            <p className="text-xs font-bold">{errorInfo.message || 'Intenta nuevamente.'}</p>
          </div>
        </div>
        <Button size="sm" variant="borrar" icon="refresh" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    </section>
  );
};

const formatEventDate = (date) => {
  if (!date) return 'Sin fecha';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha';
  return parsed.toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Mexico_City',
  });
};

const EventField = ({ label, value }) => (
  <span className="rounded-lg bg-slate-50 px-2 py-1">
    <span className="font-black uppercase text-slate-400">{label}: </span>
    <span className="font-bold text-slate-700">{value ?? '—'}</span>
  </span>
);

const BIEventRow = ({ evento }) => {
  const datos = evento.datos || evento;
  const isFalla = evento.tipo === 'FALLA';
  const isParo = evento.tipo === 'PARO_NO_PLANIFICADO' || evento.tipo === 'PARO_PLANIFICADO';
  const title = isFalla ? 'Falla' : (evento.tipo === 'PARO_PLANIFICADO' ? 'Paro planificado' : 'Paro no planificado');

  return (
    <div className="px-4 py-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-black uppercase text-slate-800">{title}</span>
        <span className="font-semibold text-slate-500">{formatEventDate(evento.fecha || datos.fechaFallaConfirmada || datos.inicioOriginal || datos.inicio)}</span>
      </div>

      {isFalla && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <EventField label="Estado" value={datos.estado} />
          <EventField label="Confirmada" value={formatEventDate(datos.fechaFallaConfirmada)} />
          <EventField label="Restaurada" value={formatEventDate(datos.fechaRestauracion)} />
          <EventField label="Trabajo técnico" value={formatMinutes(datos.tiempoTecnicoActivoMinutos, '—')} />
          <EventField label="Calidad" value={labelEstadoAnalitico(datos.calidadDato)} />
        </div>
      )}

      {isParo && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <EventField label="Inicio" value={formatEventDate(datos.inicioOriginal || datos.inicio)} />
          <EventField label="Fin" value={datos.abierto ? 'Abierto' : formatEventDate(datos.finOriginal || datos.fin)} />
          <EventField label="Duración efectiva" value={formatMinutes(datos.duracionEfectiva, '—')} />
          <EventField label="Impacto" value={datos.impacto || datos.tipo} />
          <EventField label="Porcentaje" value={datos.porcentajeAfectacion === null || datos.porcentajeAfectacion === undefined ? '—' : `${datos.porcentajeAfectacion}%`} />
          <EventField label="Calidad" value={labelEstadoAnalitico(datos.calidadDato)} />
          <EventField label="Falla" value={datos.fallaId} />
          <EventField label="Tarea" value={datos.tareaId} />
        </div>
      )}
    </div>
  );
};

export const BIDetailModal = ({ detailState, onClose, onPageChange }) => {
  const detail = detailState.data;
  const isOpen = Boolean(detailState.maquinaId);
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full md:max-w-4xl">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-2">
          <Icon name="analytics" className="text-marca-primario" />
          <span className="font-black text-slate-800">Detalle de indicadores de maquinaria</span>
        </div>
      </ModalHeader>
      <ModalBody className="max-h-[76vh] overflow-y-auto p-5">
        {detailState.loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
            <Spinner size="md" />
            <span className="text-sm font-bold">Cargando detalle...</span>
          </div>
        ) : detailState.error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{detailState.error}</div>
        ) : detail ? (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-black text-marca-primario">{detail.maquina?.codigo}</p>
              <h3 className="text-lg font-black uppercase text-slate-900">{detail.maquina?.nombre}</h3>
              <p className="text-xs font-semibold text-slate-500">{detail.maquina?.proceso}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <InfoPill label="Frecuencia" value={formatInteger(detail.metricas?.frecuencia?.valor)} />
              <InfoPill label="Trabajo técnico" value={formatMinutes(getTechnicalWorkMinutes(detail.metricas), '—')} />
              <InfoPill label="MTTR técnico" value={formatMinutes(detail.metricas?.mttr?.valorMinutos, '—')} metric={detail.metricas?.mttr} />
              <InfoPill label="MTBF" value={formatMTBFDays(detail.metricas?.mtbf)} metric={detail.metricas?.mtbf} />
              <InfoPill
                label="Disponibilidad"
                value={(
                  <AvailabilityText
                    value={detail.metricas?.disponibilidad?.valorPorcentaje}
                    agrupacion="EQUIPO"
                  />
                )}
                metric={detail.metricas?.disponibilidad}
              />
              <InfoPill label="Confiabilidad" value={formatPercent(detail.metricas?.confiabilidad?.r30DiasPorcentaje, '—')} metric={detail.metricas?.confiabilidad} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-xs font-black uppercase tracking-wide text-slate-700">Mantenimiento preventivo</h4>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoPill label="Paro planificado" value={formatMinutes(getPlannedDowntimeMinutes(detail.metricas), '—')} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-4 py-3">
                <h4 className="text-xs font-black uppercase tracking-wide text-slate-700">Eventos analiticos</h4>
              </div>
              <div className="divide-y divide-slate-100">
                {(detail.eventos?.data || detail.eventos || []).slice(0, 25).map((evento, index) => (
                  <BIEventRow key={`${evento.tipo}-${evento.fecha}-${index}`} evento={evento} />
                ))}
              </div>
              {detail.metadata?.paginacionEventos?.totalPaginas > 1 && (
                <Pagination
                  page={detail.metadata.paginacionEventos.pagina}
                  totalPages={detail.metadata.paginacionEventos.totalPaginas}
                  totalItems={detail.metadata.paginacionEventos.totalRegistros}
                  onPageChange={onPageChange}
                />
              )}
            </div>
          </div>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <Button variant="cancelar" onClick={onClose}>Cerrar</Button>
      </ModalFooter>
    </Modal>
  );
};
