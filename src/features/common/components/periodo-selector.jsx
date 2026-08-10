import React, { useMemo } from 'react';
import { Icon } from '@/components/ui/z_index';
import { getISOWeekInfo, getSemanasInYear } from '@/lib/date-utils';
import { cn } from '@/utils/cn';

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

const getTodayMX = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City', year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(new Date());
  const read = (type) => Number(parts.find((part) => part.type === type)?.value);
  return { year: read('year'), month: read('month') };
};

const InlineSelect = ({ options = [], value, onChange, icon, placeholder, className, disabled }) => (
  <div className={cn('relative w-full', className)}>
    <select
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="h-9.5 w-full appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-8 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 focus:border-marca-secundario focus:outline-none focus:ring-2 focus:ring-marca-secundario/20 disabled:cursor-not-allowed disabled:opacity-50"
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

export function PeriodoSelector({ value, onChange, disabled = false }) {
  const currentWeek = getISOWeekInfo();
  const today = getTodayMX();

  const years = useMemo(() => {
    return Array.from({ length: Math.max(7, today.year - 2019) }, (_, index) => today.year - index);
  }, [today.year]);

  const availableWeeks = useMemo(() => {
    const totalWeeks = getSemanasInYear(value.anio);
    const maxWeek = value.anio === currentWeek.year ? currentWeek.week : totalWeeks;
    return Array.from({ length: maxWeek }, (_, index) => index + 1);
  }, [value.anio, currentWeek.year, currentWeek.week]);

  const availableMonths = useMemo(() => {
    return MESES_CORTOS.filter((month) => {
      if (value.anio === currentWeek.year && month.num > today.month) return false;
      return value.anio <= currentWeek.year;
    });
  }, [value.anio, currentWeek.year, today.month]);

  // Construir preset rápido de periodo
  const setPeriodPreset = (periodo) => {
    if (periodo === 'SEMANA') {
      onChange({ periodo, anio: currentWeek.year, semana: currentWeek.week, mes: null });
    } else if (periodo === 'MES') {
      onChange({ periodo, anio: today.year, semana: null, mes: today.month });
    } else if (periodo === 'ANIO') {
      onChange({ periodo, anio: today.year, semana: null, mes: null });
    }
  };

  const handleYearChange = (yearVal) => {
    if (!yearVal) return;
    const yearNum = Number(yearVal);
    onChange({
      ...value,
      anio: yearNum,
      semana: value.periodo === 'SEMANA' ? Math.min(value.semana || 1, getSemanasInYear(yearNum)) : null,
      mes: value.periodo === 'MES' ? Math.min(value.mes || 1, yearNum === currentWeek.year ? today.month : 12) : null,
    });
  };

  const handleWeekChange = (weekVal) => {
    const weekNum = Number(weekVal);
    if (!weekNum) return;
    onChange({ ...value, periodo: 'SEMANA', semana: weekNum, mes: null });
  };

  const handleMonthChange = (monthNum) => {
    onChange({ ...value, periodo: 'MES', mes: Number(monthNum), semana: null });
  };

  const periodLabel = useMemo(() => {
    if (value.periodo === 'SEMANA') {
      return `Semana ${value.semana} - ${value.anio}`;
    }
    if (value.periodo === 'MES') {
      const monthName = MESES_FULL.find((m) => m.num === value.mes)?.name || 'Mes';
      return `${monthName} ${value.anio}`;
    }
    if (value.periodo === 'ANIO') {
      return `Año ${value.anio}`;
    }
    return 'Periodo personalizado';
  }, [value]);

  return (
    <section className="flex w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      {/* 1. Fila de botones rápidos */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rápido:</span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setPeriodPreset('SEMANA')}
            className={cn(
              'flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
              value.periodo === 'SEMANA' && value.semana === currentWeek.week && value.anio === currentWeek.year
                ? 'border-marca-primario bg-marca-primario text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <Icon name="view_week" size="xs" />
            Semana actual
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setPeriodPreset('MES')}
            className={cn(
              'flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
              value.periodo === 'MES' && value.mes === today.month && value.anio === today.year
                ? 'border-marca-primario bg-marca-primario text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <Icon name="calendar_month" size="xs" />
            Este mes
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setPeriodPreset('ANIO')}
            className={cn(
              'flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
              value.periodo === 'ANIO' && value.anio === today.year
                ? 'border-marca-primario bg-marca-primario text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <Icon name="event" size="xs" />
            Año actual
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* 2. Fila de controles de selección */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <Icon name="bar_chart" size="sm" className="text-marca-primario" />
          <span className="text-sm font-bold text-slate-700">Explorar por períodos</span>
        </div>

        <div className="grid grid-cols-2 gap-2 min-w-[280px] sm:w-auto">
          <InlineSelect
            options={years.map((y) => ({ value: String(y), label: String(y) }))}
            value={String(value.anio)}
            onChange={handleYearChange}
            icon="event"
            disabled={disabled}
            placeholder="Año"
            className="font-bold"
          />

          <InlineSelect
            options={availableWeeks.map((w) => ({ value: String(w), label: `Semana ${w}` }))}
            value={value.periodo === 'SEMANA' ? String(value.semana) : ''}
            onChange={handleWeekChange}
            icon="view_week"
            disabled={disabled || value.periodo !== 'SEMANA'}
            placeholder="Semana"
            className="font-bold"
          />
        </div>
      </div>

      {/* 3. Selección de meses horizontales */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange({ ...value, periodo: 'ANIO', semana: null, mes: null })}
          className={cn(
            'shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95 disabled:opacity-50',
            value.periodo === 'ANIO'
              ? 'bg-marca-primario text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          Ver Año Completo
        </button>
        {availableMonths.map((m) => (
          <button
            key={m.num}
            type="button"
            disabled={disabled}
            onClick={() => handleMonthChange(m.num)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95 disabled:opacity-50',
              value.periodo === 'MES' && value.mes === m.num
                ? 'bg-marca-primario text-white shadow-sm'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* 4. Etiqueta del periodo resultante */}
      <div className="flex items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/40 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-800 shadow-sm">
        <Icon name="date_range" size="sm" className="text-marca-primario" />
        <span className="truncate">{periodLabel}</span>
        <span className="hidden text-slate-400 sm:inline">·</span>
        <span className="hidden text-slate-400 sm:inline">America/Mexico_City</span>
      </div>
    </section>
  );
}
