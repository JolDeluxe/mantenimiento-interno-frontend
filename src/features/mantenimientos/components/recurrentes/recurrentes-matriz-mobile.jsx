import { useMemo, useState } from 'react';
import { Button, Icon, Spinner } from '@/components/ui/z_index';
import { frecuenciaLabel } from './recurrentes-utils';
import { RecurrenteStatusBadge } from './recurrente-status-badge';
import { ESTADOS_BAJA, MESES_MATRIZ, normalizeMeses, summarizeExecutions } from './matriz-utils';
import { MatrizCell } from './matriz-cell';

export const RecurrentesMatrizMobile = ({
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
    const [selectedMes, setSelectedMes] = useState(String(new Date().getMonth() + 1));

    const mesActual = useMemo(
        () => MESES_MATRIZ.find((mes) => mes.key === selectedMes) || MESES_MATRIZ[0],
        [selectedMes],
    );

    return (
        <div className="flex flex-col gap-3 pb-24">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-800">
                            <Icon name="calendar_month" className="text-marca-primario" />
                            Matriz anual
                        </div>
                        <p className="text-xs font-medium text-slate-500">{total} reglas desde backend.</p>
                    </div>
                    <Button type="button" variant="light" icon="refresh" onClick={refresh} disabled={loading}>
                        Actualizar
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        min="2020"
                        max="2100"
                        value={year}
                        onChange={(event) => setYear(Number(event.target.value))}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-marca-primario"
                    />
                    <select
                        value={selectedMes}
                        onChange={(event) => setSelectedMes(event.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-marca-primario"
                    >
                        {MESES_MATRIZ.map((mes) => (
                            <option key={mes.key} value={mes.key}>{mes.label}</option>
                        ))}
                    </select>
                    <input
                        value={filters.q}
                        onChange={(event) => setFilters({ q: event.target.value })}
                        placeholder="Buscar regla o maquina"
                        className="col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-marca-primario"
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
                    <label className="col-span-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                        <input
                            type="checkbox"
                            checked={filters.mostrarBajaDesuso}
                            onChange={(event) => setFilters({ mostrarBajaDesuso: event.target.checked })}
                        />
                        Mostrar baja/desuso
                    </label>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] font-black uppercase tracking-wide">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">Real = ticket</span>
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-sky-700">Proyeccion</span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">Pendiente generar</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">Pausada</span>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</div>
            )}

            {loading ? (
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-12 text-slate-500">
                    <Spinner size="sm" className="mr-2" />
                    <span className="text-xs font-black uppercase tracking-wide">Cargando matriz...</span>
                </div>
            ) : rows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <div className="text-sm font-black text-slate-700">Sin datos de matriz</div>
                    <p className="text-xs font-medium text-slate-500">No hay reglas para este filtro.</p>
                </div>
            ) : (
                rows.map((rawRow) => {
                    const row = { ...rawRow, meses: normalizeMeses(rawRow.meses) };
                    const baja = ESTADOS_BAJA.has(String(row.maquina?.estado || '').toUpperCase());
                    const ejecucionesMes = row.meses[selectedMes] || [];
                    const summary = summarizeExecutions(ejecucionesMes);
                    return (
                        <article key={row.regla?.id || `${row.maquina?.id}-${row.regla?.titulo}`} className={`rounded-2xl border bg-white p-4 shadow-sm ${baja ? 'border-slate-100 opacity-70' : 'border-slate-200'}`}>
                            <div className="mb-2 flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">{row.maquina?.codigo || '-'}</div>
                                    <h3 className="truncate text-sm font-black uppercase text-slate-800">{row.maquina?.nombre || '-'}</h3>
                                    <p className="line-clamp-2 text-xs font-semibold text-slate-500">{row.regla?.titulo || '-'}</p>
                                </div>
                                <RecurrenteStatusBadge activo={row.regla?.activo} />
                            </div>

                            <div className="mb-3 grid grid-cols-1 gap-1.5 text-xs font-semibold text-slate-600">
                                <div>Responsable: <strong>{row.regla?.tecnicoResponsable?.nombre || '-'}</strong></div>
                                <div>Frecuencia: <strong>{frecuenciaLabel(row.regla)}</strong></div>
                                <div>Ubicacion: <strong>{row.maquina?.planta || '-'} / {row.maquina?.area || '-'}</strong></div>
                                {baja && <div className="font-black uppercase text-slate-400">Estado maquina: {row.maquina?.estado}</div>}
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-2">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                                        {mesActual.label} {year}
                                    </div>
                                    <div className="text-[10px] font-black uppercase text-slate-500">
                                        {summary.total} total
                                    </div>
                                </div>
                                <div className="mb-2 grid grid-cols-3 gap-1 text-center text-[9px] font-black uppercase">
                                    <div className="rounded-lg bg-emerald-50 px-1.5 py-1 text-emerald-700">{summary.reales} reales</div>
                                    <div className="rounded-lg bg-sky-50 px-1.5 py-1 text-sky-700">{summary.proyecciones} proy.</div>
                                    <div className="rounded-lg bg-amber-50 px-1.5 py-1 text-amber-700">{summary.pendientesGenerar} generar</div>
                                </div>
                                <MatrizCell
                                    row={row}
                                    ejecuciones={ejecucionesMes}
                                    canManage={canManage}
                                    submitting={submitting}
                                    onGenerate={onGenerate}
                                />
                            </div>
                        </article>
                    );
                })
            )}
        </div>
    );
};
