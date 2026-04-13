import { useMemo } from 'react';
import { Icon } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';
import { getMinDateHoy } from '@/lib/date';

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

const getCurrentYear = () => Number(getMinDateHoy().split('-')[0]);
const getCurrentMonth = () => Number(getMinDateHoy().split('-')[1]);

/**
 * Props:
 *   year             → number | null
 *   month            → number (0 = todos)
 *   aniosDisponibles → number[] (del backend)
 *   onChange         → ({ year, month }) => void
 */
export const DashboardFechas = ({ year, month, aniosDisponibles = [], onChange }) => {
    const years = useMemo(() => {
        const curYear = getCurrentYear();
        const set = new Set([curYear, ...aniosDisponibles]);
        return Array.from(set).sort((a, b) => b - a);
    }, [aniosDisponibles]);

    const handleGoToCurrent = () => {
        onChange({ year: getCurrentYear(), month: getCurrentMonth() });
    };

    const handleYearChange = (newYear) => {
        onChange({ year: newYear ? Number(newYear) : null, month: 0 });
    };

    const handleMonthChange = (newMonth) => {
        onChange({ year, month: Number(newMonth) });
    };

    const isFiltered = year !== null;

    return (
        <>
            {/* ── DESKTOP ── */}
            <div className="hidden lg:flex flex-col gap-3 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 shrink-0">
                        <Icon name="bar_chart" size="sm" className="text-marca-primario" />
                        <span className="text-sm font-bold text-slate-700">Período de análisis</span>
                    </div>

                    <div className="relative shrink-0">
                        <select
                            value={year ?? ''}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-1.5
                         text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2
                         focus:ring-marca-secundario/30 cursor-pointer hover:border-slate-400"
                        >
                            <option value="">Todos los períodos</option>
                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <Icon name="expand_more" size="xs" className="text-slate-400" />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoToCurrent}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-600
                       bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full
                       transition-colors cursor-pointer border border-slate-200"
                    >
                        <Icon name="today" size="xs" className="text-marca-primario" />
                        Mes actual
                    </button>

                    {isFiltered && (
                        <button
                            type="button"
                            onClick={() => onChange({ year: null, month: 0 })}
                            className="flex items-center gap-1 text-xs font-bold text-marca-primario
                         bg-marca-primario/10 hover:bg-marca-primario/20 px-2.5 py-1.5
                         rounded-full transition-colors cursor-pointer border border-marca-primario/20"
                        >
                            <Icon name="close" size="xs" />
                            Limpiar
                        </button>
                    )}
                </div>

                {isFiltered && (
                    <div className="flex items-center gap-1.5 flex-wrap animate-in fade-in slide-in-from-top-1 duration-200">
                        <button
                            type="button"
                            onClick={() => handleMonthChange(0)}
                            className={cn(
                                'px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer',
                                month === 0 ? 'bg-marca-primario text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            )}
                        >
                            Todos
                        </button>
                        {MESES_CORTOS.map((m) => (
                            <button
                                key={m.num}
                                type="button"
                                onClick={() => handleMonthChange(m.num)}
                                className={cn(
                                    'px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer',
                                    month === m.num
                                        ? 'bg-marca-primario text-white shadow-sm'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                )}
                            >
                                {m.name}
                            </button>
                        ))}
                    </div>
                )}

                {!isFiltered && (
                    <p className="text-xs text-slate-400 italic">
                        Selecciona un año para filtrar por mes específico.
                    </p>
                )}
            </div>

            {/* ── MOBILE ── */}
            <div
                className="lg:hidden flex flex-col gap-2.5 p-3 rounded-[18px] relative overflow-hidden"
                style={glassBase('light')}
            >
                <GlassSheen />
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Icon name="bar_chart" size="xs" className="text-slate-600" />
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Período</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleGoToCurrent}
                            className="flex items-center gap-1 text-[10px] font-bold text-slate-600
                         bg-white/60 hover:bg-white/80 px-2 py-0.5 rounded-full
                         transition-colors cursor-pointer border border-white/80 shadow-sm"
                        >
                            <Icon name="today" size="xs" className="text-marca-primario" />
                            Actual
                        </button>
                        {isFiltered && (
                            <button
                                type="button"
                                onClick={() => onChange({ year: null, month: 0 })}
                                className="flex items-center gap-1 text-[10px] font-bold text-red-500
                           bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-full
                           transition-colors cursor-pointer border border-red-200"
                            >
                                <Icon name="close" size="xs" />
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                <div className={cn('relative z-10 grid gap-2', isFiltered ? 'grid-cols-2' : 'grid-cols-1')}>
                    <div className="relative">
                        <select
                            value={year ?? ''}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="w-full appearance-none bg-white/70 border border-white/50 rounded-xl
                         pl-3 pr-7 py-2 text-xs font-bold text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 cursor-pointer shadow-sm"
                        >
                            <option value="">Todos los períodos</option>
                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <Icon name="expand_more" size="xs" className="text-slate-400" />
                        </div>
                    </div>

                    {isFiltered && (
                        <div className="relative">
                            <select
                                value={month}
                                onChange={(e) => handleMonthChange(e.target.value)}
                                className="w-full appearance-none bg-white/70 border border-white/50 rounded-xl
                           pl-3 pr-7 py-2 text-xs font-bold text-slate-700
                           focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 cursor-pointer shadow-sm"
                            >
                                <option value={0}>Todos los meses</option>
                                {MESES_FULL.map((m) => <option key={m.num} value={m.num}>{m.name}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                <Icon name="expand_more" size="xs" className="text-slate-400" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};