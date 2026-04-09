import { useMemo } from 'react';
import { Icon } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';

const MESES = [
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

// Extrae años dinámicamente, filtra basura (NaN) y garantiza que el año actual siempre exista
const extractAvailableYears = (existenciaGlobal) => {
    const currentYear = new Date().getFullYear();

    if (!existenciaGlobal || typeof existenciaGlobal !== 'object') {
        return [currentYear];
    }

    const years = Object.keys(existenciaGlobal)
        .map(Number)
        .filter(n => !isNaN(n) && n > 2000); // Bloquea llaves como "total"

    // Garantizar existencia del año actual para el botón de acceso rápido
    if (!years.includes(currentYear)) {
        years.push(currentYear);
    }

    return years.sort((a, b) => b - a); // Orden descendente
};

// ── Vista Desktop ─────────────────────────────────────────────────────────────
const TicketFechasDesktop = ({ year, month, onYearChange, onMonthChange, existenciaGlobal }) => {
    const years = useMemo(() => extractAvailableYears(existenciaGlobal), [existenciaGlobal]);
    const isFiltered = year !== null;

    // Helper blindado: Fuerza evaluación matemática para ignorar strings "0"
    const checkMonthHasData = (mNum) => {
        if (!year) return false;
        const data = existenciaGlobal?.[year] || existenciaGlobal?.[String(year)];
        if (!data) return false;

        if (Array.isArray(data)) {
            if (data.length > 0 && typeof data[0] === 'object') {
                const obj = data.find(item => Number(item.mes || item.month || item.id) === mNum);
                return obj ? Number(obj.total || obj.count || obj.conteo || 0) > 0 : false;
            }
            return data.some(val => Number(val) === mNum);
        }

        if (typeof data === 'object') {
            const val = data[mNum] ?? data[String(mNum)];
            if (val === undefined || val === null) return false;
            if (typeof val === 'boolean') return val;
            return Number(val) > 0;
        }

        return false;
    };

    const handleGoToCurrent = () => {
        const now = new Date();
        onYearChange(now.getFullYear());
        onMonthChange(now.getMonth() + 1);
    };

    return (
        <div className="flex flex-col gap-3 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">

            {/* Fila superior: Año + indicador de filtro activo + Botón mes actual */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2.5 shrink-0">
                    <Icon name="calendar_month" size="sm" className="text-marca-primario" />
                    <span className="text-sm font-bold text-slate-700">Período</span>
                </div>

                {/* Selector de año */}
                <div className="relative shrink-0">
                    <select
                        value={year ?? ''}
                        onChange={(e) => onYearChange(e.target.value ? Number(e.target.value) : null)}
                        className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-1.5
                                   text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2
                                   focus:ring-marca-secundario/30 focus:border-marca-secundario
                                   transition-all cursor-pointer hover:border-slate-400"
                    >
                        <option value="">Todos los años</option>
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                        <Icon name="expand_more" size="xs" className="text-slate-400" />
                    </div>
                </div>

                {/* Botón de acceso rápido al mes actual */}
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

                {/* Badge de limpieza cuando hay filtro activo */}
                {isFiltered && (
                    <button
                        type="button"
                        onClick={() => { onYearChange(null); onMonthChange(0); }}
                        className="flex items-center gap-1 text-xs font-bold text-marca-primario
                                   bg-marca-primario/10 hover:bg-marca-primario/20 px-2.5 py-1.5
                                   rounded-full transition-colors cursor-pointer border border-marca-primario/20"
                    >
                        <Icon name="close" size="xs" />
                        Limpiar filtro
                    </button>
                )}
            </div>

            {/* Fila inferior: Meses (solo visibles si hay un año seleccionado) */}
            {isFiltered && (
                <div className="flex items-center gap-1.5 flex-wrap animate-in fade-in slide-in-from-top-1 duration-200">
                    <button
                        type="button"
                        onClick={() => onMonthChange(0)}
                        className={cn(
                            'px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer',
                            month === 0
                                ? 'bg-marca-primario text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                    >
                        Todos
                    </button>

                    {MESES.map((m) => {
                        const isSelected = month === m.num;
                        const hasData = checkMonthHasData(m.num);

                        return (
                            <button
                                key={m.num}
                                type="button"
                                onClick={() => onMonthChange(m.num)}
                                className={cn(
                                    'px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer',
                                    isSelected
                                        ? 'bg-marca-primario text-white shadow-sm' // Seleccionado (Prioridad)
                                        : hasData
                                            ? 'bg-marca-primario/10 text-marca-primario hover:bg-marca-primario/20 border border-marca-primario/10' // Tiene registros
                                            : 'bg-slate-50 text-slate-400/60 opacity-60 hover:opacity-100 hover:bg-slate-100 hover:text-slate-500' // Sin registros (Opaco)
                                )}
                            >
                                {m.name}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Hint cuando no hay año seleccionado */}
            {!isFiltered && (
                <p className="text-xs text-slate-400 italic">
                    Selecciona un año para filtrar por mes específico.
                </p>
            )}
        </div>
    );
};

// ── Vista Mobile ──────────────────────────────────────────────────────────────
const TicketFechasMobile = ({ year, month, onYearChange, onMonthChange, existenciaGlobal }) => {
    const years = useMemo(() => extractAvailableYears(existenciaGlobal), [existenciaGlobal]);
    const isFiltered = year !== null;

    const handleGoToCurrent = () => {
        const now = new Date();
        onYearChange(now.getFullYear());
        onMonthChange(now.getMonth() + 1);
    };

    return (
        <div
            className="flex flex-col gap-2.5 p-3 rounded-[18px] relative overflow-hidden"
            style={glassBase('light')}
        >
            <GlassSheen />

            {/* Header con ícono, mes actual y limpiar */}
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Icon name="calendar_month" size="xs" className="text-slate-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Período
                    </span>
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
                        Mes actual
                    </button>

                    {isFiltered && (
                        <button
                            type="button"
                            onClick={() => { onYearChange(null); onMonthChange(0); }}
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

            {/* Selectores en grid 2 cols */}
            <div className={cn('relative z-10 grid gap-2', isFiltered ? 'grid-cols-2' : 'grid-cols-1')}>

                {/* Selector Año */}
                <div className="relative">
                    <select
                        value={year ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            onYearChange(val ? Number(val) : null);
                            if (!val) onMonthChange(0);
                        }}
                        className="w-full appearance-none bg-white/70 border border-white/50 rounded-xl
                                   pl-3 pr-7 py-2 text-xs font-bold text-slate-700
                                   focus:outline-none focus:ring-2 focus:ring-marca-secundario/30
                                   cursor-pointer transition-all shadow-sm"
                    >
                        <option value="">Todos los años</option>
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                        <Icon name="expand_more" size="xs" className="text-slate-400" />
                    </div>
                </div>

                {/* Selector Mes (solo si hay año) */}
                {isFiltered && (
                    <div className="relative animate-in fade-in slide-in-from-right-2 duration-200">
                        <select
                            value={month}
                            onChange={(e) => onMonthChange(Number(e.target.value))}
                            className="w-full appearance-none bg-white/70 border border-white/50 rounded-xl
                                       pl-3 pr-7 py-2 text-xs font-bold text-slate-700
                                       focus:outline-none focus:ring-2 focus:ring-marca-secundario/30
                                       cursor-pointer transition-all shadow-sm"
                        >
                            <option value={0}>Todos los meses</option>
                            {MESES_FULL.map((m) => (
                                <option key={m.num} value={m.num}>{m.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <Icon name="expand_more" size="xs" className="text-slate-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Indicador visual del período activo */}
            {isFiltered && (
                <div className="relative z-10 flex items-center gap-1.5 px-2 py-1 bg-marca-primario/10
                                border border-marca-primario/20 rounded-lg">
                    <Icon name="filter_alt" size="xs" className="text-marca-primario" />
                    <span className="text-[10px] font-bold text-marca-primario">
                        {month === 0
                            ? `Año ${year} completo`
                            : `${MESES_FULL.find(m => m.num === month)?.name} ${year}`
                        }
                    </span>
                </div>
            )}
        </div>
    );
};

// ── Componente Exportado (Adaptive) ───────────────────────────────────────────
export const TicketFechas = ({ year, month, onYearChange, onMonthChange, existenciaGlobal = {} }) => {
    return (
        <>
            {/* Desktop */}
            <div className="hidden lg:block">
                <TicketFechasDesktop
                    year={year}
                    month={month}
                    onYearChange={onYearChange}
                    onMonthChange={onMonthChange}
                    existenciaGlobal={existenciaGlobal}
                />
            </div>

            {/* Mobile */}
            <div className="lg:hidden">
                <TicketFechasMobile
                    year={year}
                    month={month}
                    onYearChange={onYearChange}
                    onMonthChange={onMonthChange}
                    existenciaGlobal={existenciaGlobal}
                />
            </div>
        </>
    );
};