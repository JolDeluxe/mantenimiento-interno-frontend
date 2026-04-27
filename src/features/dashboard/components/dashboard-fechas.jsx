import { useMemo, useEffect } from 'react';
import { Icon } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';
import { getISOWeekInfo, getWeekRange, getSemanasInYear } from '@/lib/date';
import { useDashboardContext } from '../context/dashboard-context';

const MESES_CORTOS = [
    { num: 1, name: 'Ene' }, { num: 2, name: 'Feb' }, { num: 3, name: 'Mar' },
    { num: 4, name: 'Abr' }, { num: 5, name: 'May' }, { num: 6, name: 'Jun' },
    { num: 7, name: 'Jul' }, { num: 8, name: 'Ago' }, { num: 9, name: 'Sep' },
    { num: 10, name: 'Oct' }, { num: 11, name: 'Nov' }, { num: 12, name: 'Dic' },
];

const MESES_FULL = [
    { num: 1, name: 'Enero' }, { num: 2, name: 'Febrero' }, { num: 3, name: 'Marzo' },
    { num: 4, name: 'Abril' }, { num: 5, name: 'Mayo' }, { num: 6, name: 'Junio' },
    { num: 7, name: 'Julio' }, { num: 8, name: 'Agosto' }, { num: 9, name: 'Septiembre' },
    { num: 10, name: 'Octubre' }, { num: 11, name: 'Noviembre' }, { num: 12, name: 'Diciembre' },
];

const getCurrentYear = () => getISOWeekInfo().year;
const getCurrentMonth = () => new Date().getMonth() + 1;

const buildSemanaActual = () => {
    const { year, week } = getISOWeekInfo();
    const { startDate, endDate } = getWeekRange(year, week);
    return { year, month: 0, fechaInicio: startDate, fechaFin: endDate };
};

const PRESETS = [
    {
        id: 'semanaActual',
        label: 'Semana actual',
        icon: 'view_week',
        build: buildSemanaActual,
    },
    {
        id: 'esteMes',
        label: 'Este mes',
        icon: 'calendar_month',
        build: () => ({
            year: getCurrentYear(), month: getCurrentMonth(),
            fechaInicio: null, fechaFin: null,
        }),
    },
];

const formatDateToMX = (isoStr) => {
    if (!isoStr) return '';
    const [y, m, d] = isoStr.split('-');
    return `${d}-${m}-${y}`;
};

export const DashboardFechas = () => {
    const { filtro, onFiltroChange, data } = useDashboardContext();
    const { year, month, fechaInicio, fechaFin } = filtro;
    const aniosDisponibles = data?.aniosDisponibles ?? [];

    useEffect(() => {
        if (!year && !month && !fechaInicio && !fechaFin) {
            onFiltroChange(buildSemanaActual());
        }
    }, [year, month, fechaInicio, fechaFin, onFiltroChange]);

    const years = useMemo(() => {
        const curYear = getCurrentYear();
        const set = new Set([curYear, ...aniosDisponibles]);
        return Array.from(set).sort((a, b) => b - a);
    }, [aniosDisponibles]);

    const selectedWeekInfo = useMemo(() => {
        if (fechaInicio && fechaFin) {
            const [y, m, d] = fechaInicio.split('-');
            return getISOWeekInfo(new Date(y, m - 1, d));
        }
        return null;
    }, [fechaInicio, fechaFin]);

    // Limita las semanas visibles a la semana actual si el año seleccionado es el año en curso
    const availableWeeksInSelectedYear = useMemo(() => {
        const current = getISOWeekInfo();
        const targetYearNum = year !== null ? Number(year) : current.year;

        if (targetYearNum === current.year) {
            return current.week;
        }
        return getSemanasInYear(targetYearNum);
    }, [year]);

    const isArbitraryRange = Boolean(fechaInicio && fechaFin);
    const isFiltered = year !== null || isArbitraryRange;

    const activePreset = useMemo(() => {
        if (isArbitraryRange) {
            const current = getISOWeekInfo();
            if (selectedWeekInfo?.year === current.year && selectedWeekInfo?.week === current.week) {
                return 'semanaActual';
            }
        }
        if (year !== null && Number(year) === getCurrentYear() && Number(month) === getCurrentMonth()) {
            return 'esteMes';
        }
        return null;
    }, [year, month, isArbitraryRange, selectedWeekInfo]);

    const tituloEtiqueta = useMemo(() => {
        if (!year) return 'SEMANA ACTUAL';
        let nombreMes = month > 0 ? MESES_FULL.find(m => m.num === month)?.name.toUpperCase() : '';
        if (isArbitraryRange && selectedWeekInfo) {
            const mesIdx = new Date(fechaInicio).getMonth();
            nombreMes = MESES_FULL[mesIdx]?.name.toUpperCase() || '';
            return `${nombreMes} ${selectedWeekInfo.year} SEMANA ${selectedWeekInfo.week}`;
        }
        return month > 0 ? `${nombreMes} ${year}` : `AÑO ${year}`;
    }, [year, month, isArbitraryRange, selectedWeekInfo, fechaInicio]);

    const handleClear = () => {
        onFiltroChange(buildSemanaActual());
    };

    const handleYearChange = (newYear) => {
        onFiltroChange({ year: newYear ? Number(newYear) : null, month: 0, fechaInicio: null, fechaFin: null });
    };

    const handleMonthChange = (newMonth) => {
        onFiltroChange({ year, month: Number(newMonth), fechaInicio: null, fechaFin: null });
    };

    const handleWeekChange = (weekNum) => {
        const targetYear = year ?? getCurrentYear();
        const { startDate, endDate } = getWeekRange(targetYear, Number(weekNum));
        onFiltroChange({ year: targetYear, month: 0, fechaInicio: startDate, fechaFin: endDate });
    };

    const handlePreset = (preset) => {
        onFiltroChange(preset.build());
    };

    const rangoLabel = isArbitraryRange && selectedWeekInfo
        ? `Semana ${selectedWeekInfo.week} - ${selectedWeekInfo.year} (${formatDateToMX(fechaInicio)} al ${formatDateToMX(fechaFin)})`
        : null;

    return (
        <>
            {/* ── DESKTOP ── */}
            <div className="hidden lg:flex flex-col gap-3 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">Rápido:</span>
                    {PRESETS.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => handlePreset(p)}
                            className={cn(
                                'flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer border',
                                activePreset === p.id
                                    ? 'bg-marca-primario text-white border-marca-primario shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            )}
                        >
                            <Icon name={p.icon} size="xs" />
                            {p.label}
                        </button>
                    ))}

                    {isArbitraryRange && activePreset !== 'semanaActual' && rangoLabel && (
                        <div className="flex items-center gap-2 bg-marca-primario/10 border border-marca-primario/20 px-3 py-1.5 rounded-full ml-auto">
                            <Icon name="date_range" size="xs" className="text-marca-primario" />
                            <span className="text-xs font-bold text-marca-primario">{rangoLabel}</span>
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100" />

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 shrink-0">
                        <Icon name="bar_chart" size="sm" className="text-marca-primario" />
                        <span className="text-sm font-bold text-slate-700">Explorar por períodos</span>
                    </div>

                    <div className="relative shrink-0">
                        <select
                            value={year ?? ''}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-1.5
                                       text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2
                                       focus:ring-marca-secundario/30 cursor-pointer hover:border-slate-400"
                        >
                            <option value="">Seleccionar Año</option>
                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <Icon name="expand_more" size="xs" className="text-slate-400" />
                        </div>
                    </div>

                    {year !== null && (
                        <div className="relative shrink-0 animate-in fade-in slide-in-from-left-2">
                            <select
                                value={isArbitraryRange && selectedWeekInfo ? selectedWeekInfo.week : ''}
                                onChange={(e) => handleWeekChange(e.target.value)}
                                className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-1.5
                                           text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2
                                           focus:ring-marca-secundario/30 cursor-pointer hover:border-slate-400"
                            >
                                <option value="" disabled={isArbitraryRange}>Ver por Semana</option>
                                {Array.from({ length: availableWeeksInSelectedYear }, (_, i) => i + 1).map((w) => (
                                    <option key={w} value={w}>Semana {w}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                <Icon name="expand_more" size="xs" className="text-slate-400" />
                            </div>
                        </div>
                    )}
                </div>

                {year !== null && (
                    <div className="flex items-center gap-1.5 flex-wrap animate-in fade-in slide-in-from-top-1 duration-200 mt-1">
                        <button
                            type="button"
                            onClick={() => handleMonthChange(0)}
                            className={cn(
                                'px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer',
                                month === 0 && !isArbitraryRange ? 'bg-marca-primario text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            )}
                        >
                            Ver Año Completo
                        </button>
                        {MESES_CORTOS.map((m) => (
                            <button
                                key={m.num}
                                type="button"
                                onClick={() => handleMonthChange(m.num)}
                                className={cn(
                                    'px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer',
                                    month === m.num && !isArbitraryRange
                                        ? 'bg-marca-primario text-white shadow-sm'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                )}
                            >
                                {m.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── MOBILE ── */}
            <div
                className="lg:hidden flex flex-col gap-2.5 p-3 rounded-[18px] relative overflow-hidden"
                style={glassBase('light')}
            >
                <GlassSheen />

                <div className="relative z-10 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {PRESETS.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => handlePreset(p)}
                            className={cn(
                                'shrink-0 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-full transition-all cursor-pointer border',
                                activePreset === p.id
                                    ? 'bg-marca-primario text-white border-marca-primario'
                                    : 'bg-white/60 text-slate-600 border-white/80'
                            )}
                        >
                            <Icon name={p.icon} size="xs" />
                            {p.label}
                        </button>
                    ))}
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Filtros</span>
                    <div className="flex items-center gap-2">
                        {isFiltered && activePreset !== 'semanaActual' && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex items-center gap-1 text-[10px] font-bold text-slate-600
                                           bg-white/60 hover:bg-white/80 px-2 py-0.5 rounded-full
                                           transition-colors cursor-pointer border border-white/80 shadow-sm"
                            >
                                <Icon name="refresh" size="xs" />
                                Restablecer
                            </button>
                        )}
                    </div>
                </div>

                {isArbitraryRange && rangoLabel && activePreset !== 'semanaActual' && (
                    <div className="relative z-10 flex items-center gap-2 bg-marca-primario/10 border border-marca-primario/20 px-3 py-2 rounded-xl mb-1">
                        <Icon name="date_range" size="xs" className="text-marca-primario" />
                        <span className="text-xs font-bold text-marca-primario truncate">{rangoLabel}</span>
                    </div>
                )}

                <div className={cn('relative z-10 grid gap-2', year !== null ? 'grid-cols-2' : 'grid-cols-1')}>
                    <div className="relative">
                        <select
                            value={year ?? ''}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="w-full appearance-none bg-white/70 border border-white/50 rounded-xl
                                       pl-3 pr-7 py-2 text-xs font-bold text-slate-700
                                       focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 cursor-pointer shadow-sm"
                        >
                            <option value="">Año</option>
                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <Icon name="expand_more" size="xs" className="text-slate-400" />
                        </div>
                    </div>

                    {year !== null && (
                        <div className="relative animate-in fade-in duration-200">
                            <select
                                value={isArbitraryRange && selectedWeekInfo ? `w_${selectedWeekInfo.week}` : month}
                                onChange={(e) => {
                                    if (e.target.value.startsWith('w_')) {
                                        handleWeekChange(e.target.value.replace('w_', ''));
                                    } else {
                                        handleMonthChange(e.target.value);
                                    }
                                }}
                                className="w-full appearance-none bg-white/70 border border-white/50 rounded-xl
                                           pl-3 pr-7 py-2 text-xs font-bold text-slate-700
                                           focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 cursor-pointer shadow-sm"
                            >
                                <optgroup label="Meses">
                                    <option value={0}>Todo el Año</option>
                                    {MESES_FULL.map((m) => <option key={`m_${m.num}`} value={m.num}>{m.name}</option>)}
                                </optgroup>
                                <optgroup label="Semanas">
                                    {Array.from({ length: availableWeeksInSelectedYear }, (_, i) => i + 1).map((w) => (
                                        <option key={`w_${w}`} value={`w_${w}`}>Semana {w}</option>
                                    ))}
                                </optgroup>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                <Icon name="expand_more" size="xs" className="text-slate-400" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-2 flex items-center justify-center bg-white/40 py-2 px-3 rounded-xl border border-white/60 shadow-sm backdrop-blur-sm relative z-10">
                <Icon name="calendar_today" size="xs" className="text-slate-600 mr-2 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-black text-slate-800 tracking-wider uppercase text-center leading-tight">
                    {tituloEtiqueta}
                </span>
            </div>
        </>
    );
};