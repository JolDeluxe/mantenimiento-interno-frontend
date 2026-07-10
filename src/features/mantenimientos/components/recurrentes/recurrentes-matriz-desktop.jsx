import { useMemo, useState } from 'react';
import { Button, Icon, Spinner } from '@/components/ui/z_index';
import { frecuenciaLabel } from './recurrentes-utils';
import { RecurrenteStatusBadge } from './recurrente-status-badge';
import {
    ESTADOS_BAJA,
    MATRIX_VIEW_MODES,
    MESES_MATRIZ,
    TRIMESTRES_MATRIZ,
    getCurrentQuarter,
    getVisibleMonths,
    normalizeMeses,
} from './matriz-utils';
import { MatrizMonthColumn } from './matriz-month-column';

export const RecurrentesMatrizDesktop = ({
    year,
    setYear,
    rows,
    total,
    loading,
    submitting,
    error,
    filters,
    responsables,
    setFilters,
    refresh,
    canManage,
    onGenerate,
}) => {
    const [viewMode, setViewMode] = useState('trimestre');
    const [selectedMes, setSelectedMes] = useState(String(new Date().getMonth() + 1));
    const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter);

    const visibleMonths = useMemo(
        () => getVisibleMonths({ mode: viewMode, month: selectedMes, quarter: selectedQuarter }),
        [selectedMes, selectedQuarter, viewMode],
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-800">
                            <Icon name="calendar_month" className="text-marca-primario" />
                            Matriz anual
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                            {total} regla{total === 1 ? '' : 's'} desde backend. Vista actual: {visibleMonths.map((mes) => mes.short).join(', ')}.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="number"
                            min="2020"
                            max="2100"
                            value={year}
                            onChange={(event) => setYear(Number(event.target.value))}
                            className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-marca-primario"
                        />
                        <select
                            value={viewMode}
                            onChange={(event) => setViewMode(event.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-marca-primario"
                        >
                            {MATRIX_VIEW_MODES.map((mode) => (
                                <option key={mode.value} value={mode.value}>{mode.label}</option>
                            ))}
                        </select>
                        {viewMode === 'mes' && (
                            <select
                                value={selectedMes}
                                onChange={(event) => setSelectedMes(event.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-marca-primario"
                            >
                                {MESES_MATRIZ.map((mes) => (
                                    <option key={mes.key} value={mes.key}>{mes.label}</option>
                                ))}
                            </select>
                        )}
                        {viewMode === 'trimestre' && (
                            <select
                                value={selectedQuarter}
                                onChange={(event) => setSelectedQuarter(event.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-marca-primario"
                            >
                                {TRIMESTRES_MATRIZ.map((trimestre) => (
                                    <option key={trimestre.key} value={trimestre.key}>{trimestre.label}</option>
                                ))}
                            </select>
                        )}
                        <input
                            value={filters.q}
                            onChange={(event) => setFilters({ q: event.target.value })}
                            placeholder="Buscar codigo, maquina, responsable"
                            className="min-w-[250px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-marca-primario"
                        />
                        <select
                            value={filters.responsable}
                            onChange={(event) => setFilters({ responsable: event.target.value })}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-marca-primario"
                        >
                            <option value="">Responsables</option>
                            {responsables.map((responsable) => (
                                <option key={responsable.id} value={responsable.id}>{responsable.nombre}</option>
                            ))}
                        </select>
                        <select
                            value={filters.estadoRegla}
                            onChange={(event) => setFilters({ estadoRegla: event.target.value })}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-marca-primario"
                        >
                            <option value="">Todas</option>
                            <option value="activa">Activas</option>
                            <option value="pausada">Pausadas</option>
                        </select>
                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                            <input
                                type="checkbox"
                                checked={filters.mostrarBajaDesuso}
                                onChange={(event) => setFilters({ mostrarBajaDesuso: event.target.checked })}
                            />
                            Baja/desuso
                        </label>
                        <Button type="button" variant="light" icon="refresh" onClick={refresh} disabled={loading}>
                            Actualizar
                        </Button>
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wide">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">Real = ticket existente</span>
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-sky-700">Proyeccion = fecha backend</span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">Pendiente generar = ciclo actual/vencido</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">Pausada = regla detenida</span>
                    <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-cyan-700">Impreso = etiqueta derivada</span>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</div>
            )}

            {loading ? (
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-500">
                    <Spinner size="sm" className="mr-2" />
                    <span className="text-xs font-black uppercase tracking-wide">Cargando matriz...</span>
                </div>
            ) : rows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
                    <div className="text-sm font-black text-slate-700">Sin datos de matriz</div>
                    <p className="text-xs font-medium text-slate-500">Backend no devolvio reglas para este año/filtro.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="max-h-[calc(100vh-260px)] overflow-auto">
                        <table className="min-w-max divide-y divide-slate-100 text-left">
                            <thead className="sticky top-0 z-30 bg-slate-50 shadow-sm">
                                <tr className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                                    <th className="sticky left-0 z-40 min-w-[92px] bg-slate-50 px-3 py-3">Codigo</th>
                                    <th className="sticky left-[92px] z-40 min-w-[240px] bg-slate-50 px-3 py-3">Maquina / area</th>
                                    <th className="sticky left-[332px] z-40 min-w-[190px] bg-slate-50 px-3 py-3">Responsable / frecuencia</th>
                                    {visibleMonths.map((mes) => (
                                        <th key={mes.key} className="min-w-[220px] border-l border-slate-100 px-2 py-3">{mes.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((rawRow) => {
                                    const row = { ...rawRow, meses: normalizeMeses(rawRow.meses) };
                                    const baja = ESTADOS_BAJA.has(String(row.maquina?.estado || '').toUpperCase());
                                    return (
                                        <tr key={row.regla?.id || `${row.maquina?.id}-${row.regla?.titulo}`} className={baja ? 'bg-slate-100 opacity-75' : 'bg-white'}>
                                            <td className="sticky left-0 z-20 bg-inherit px-3 py-3 text-xs font-black text-slate-800">{row.maquina?.codigo || '-'}</td>
                                            <td className="sticky left-[92px] z-20 bg-inherit px-3 py-3">
                                                <div className="max-w-[220px] truncate text-xs font-bold text-slate-800">{row.maquina?.nombre || '-'}</div>
                                                <div className="max-w-[220px] truncate text-[10px] font-semibold text-slate-400">{row.regla?.titulo || '-'}</div>
                                                <div className="max-w-[220px] truncate text-[10px] font-semibold text-slate-500">
                                                    {row.maquina?.planta || '-'} / {row.maquina?.area || '-'}
                                                </div>
                                                {baja && <div className="text-[10px] font-black uppercase text-slate-400">{row.maquina?.estado}</div>}
                                            </td>
                                            <td className="sticky left-[332px] z-20 bg-inherit px-3 py-3">
                                                <div className="max-w-[170px] truncate text-xs font-semibold text-slate-700">{row.regla?.tecnicoResponsable?.nombre || '-'}</div>
                                                <div className="text-[10px] font-bold text-slate-500">{frecuenciaLabel(row.regla)}</div>
                                                <div className="mt-1"><RecurrenteStatusBadge activo={row.regla?.activo} /></div>
                                            </td>
                                            {visibleMonths.map((mes) => (
                                                <MatrizMonthColumn
                                                    key={mes.key}
                                                    row={row}
                                                    mes={mes}
                                                    canManage={canManage}
                                                    submitting={submitting}
                                                    onGenerate={onGenerate}
                                                />
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
