import { useMemo, useState } from 'react';
import { Button, Icon, Spinner } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { frecuenciaLabel } from './recurrentes-utils';
import { RecurrenteStatusBadge } from './recurrente-status-badge';
import { ESTADOS_BAJA, MESES_MATRIZ, normalizeMeses, summarizeExecutions } from './matriz-utils';
import { MatrizCell } from './matriz-cell';

const GlassNativeSelect = ({ icon, placeholder, options, value, onChange, defaultValue = '' }) => {
    const selected = options.find((option) => option.value === String(value));
    const isActive = Boolean(value) && String(value) !== String(defaultValue);

    return (
        <div className="relative h-9.5 w-full">
            <select
                value={value ? String(value) : ''}
                onChange={(event) => onChange(event.target.value)}
                className="absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none opacity-0"
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            <div
                style={isActive ? { ...glassBase('primary'), borderRadius: 12 } : { ...glassBase('light'), borderRadius: 12 }}
                className={`absolute inset-0 flex items-center gap-1.5 overflow-hidden px-3 py-2 text-xs font-bold transition-all ${isActive ? 'text-white' : 'text-slate-600'}`}
            >
                <GlassSheen />
                <Icon name={icon} size="xs" className="relative z-10 shrink-0" />
                <span className="relative z-10 flex-1 truncate">{selected?.label ?? placeholder}</span>
                <Icon name="expand_more" size="xs" className="relative z-10 shrink-0" />
            </div>
        </div>
    );
};

export const RecurrentesMatrizMobile = ({
    year,
    setYear,
    rows,
    total,
    cobertura,
    loading,
    submitting,
    error,
    filters,
    responsables,
    setFilters,
    refresh,
    canManage,
    onGenerate,
    onMove,
    onSkip,
    onRemoveAdjustment,
}) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1);
    const [selectedMes, setSelectedMes] = useState(currentMonth);
    const [showFilters, setShowFilters] = useState(false);
    const yearOptions = useMemo(() => (
        Array.from({ length: 7 }, (_, index) => {
            const value = String(currentYear - 3 + index);
            return { value, label: value };
        })
    ), [currentYear]);

    const mesActual = useMemo(
        () => MESES_MATRIZ.find((mes) => mes.key === selectedMes) || MESES_MATRIZ[0],
        [selectedMes],
    );

    return (
        <div className="flex flex-col gap-3 pb-24">
            <div className="relative overflow-hidden rounded-[20px] p-3 shadow-sm" style={glassBase('light')}>
                <GlassSheen />
                <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-800">
                            <Icon name="calendar_month" className="text-marca-primario" />
                            Matriz anual
                        </div>
                        <p className="text-xs font-medium text-slate-500">{total} programaciones preventivas.</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setShowFilters((prev) => !prev)}
                            style={showFilters ? { ...glassBase('primary'), borderRadius: 14 } : { ...glassBase('light'), borderRadius: 14 }}
                            className={`relative h-[38px] w-[38px] overflow-hidden transition-all active:scale-95 ${showFilters ? 'text-white' : 'text-slate-600'}`}
                        >
                            <GlassSheen />
                            <Icon name="filter_alt" size="sm" className="relative z-10" />
                        </button>
                        <button
                            type="button"
                            onClick={refresh}
                            disabled={loading}
                            style={{ ...glassBase('light'), borderRadius: 14 }}
                            className="relative h-[38px] w-[38px] overflow-hidden text-slate-600 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <GlassSheen />
                            <Icon name="refresh" size="sm" className="relative z-10" />
                        </button>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-1.5">
                    <input
                        value={filters.q}
                        onChange={(event) => setFilters({ q: event.target.value })}
                        placeholder="Buscar programacion o maquina"
                        className="h-[38px] min-w-[90px] flex-1 rounded-[14px] border border-white/40 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-marca-secundario/30"
                    />
                </div>

                {showFilters && (
                    <div className="relative z-10 mt-3 grid grid-cols-2 gap-2">
                        <GlassNativeSelect
                            icon="calendar_today"
                            placeholder="Año"
                            options={yearOptions}
                            value={String(year)}
                            onChange={(value) => setYear(Number(value || currentYear))}
                            defaultValue={String(currentYear)}
                        />
                        <GlassNativeSelect
                            icon="event_note"
                            placeholder="Mes"
                            options={MESES_MATRIZ.map((mes) => ({ value: mes.key, label: mes.label }))}
                            value={selectedMes}
                            onChange={(value) => setSelectedMes(value || currentMonth)}
                            defaultValue={currentMonth}
                        />
                        <GlassNativeSelect
                            icon="person"
                            placeholder="Responsable"
                            options={responsables.map((responsable) => ({ value: responsable.id, label: responsable.nombre }))}
                            value={filters.responsable}
                            onChange={(value) => setFilters({ responsable: value })}
                        />
                        <GlassNativeSelect
                            icon="settings"
                            placeholder="Estado"
                            options={[
                                { value: 'activa', label: 'Activas' },
                                { value: 'pausada', label: 'Pausadas' },
                            ]}
                            value={filters.estadoRegla}
                            onChange={(value) => setFilters({ estadoRegla: value })}
                        />
                        <button
                            type="button"
                            onClick={() => setFilters({ mostrarBajaDesuso: !filters.mostrarBajaDesuso })}
                            style={filters.mostrarBajaDesuso ? { ...glassBase('dark'), borderRadius: 12 } : { ...glassBase('light'), borderRadius: 12 }}
                            className={`relative col-span-2 h-[38px] overflow-hidden text-xs font-bold ${filters.mostrarBajaDesuso ? 'text-white' : 'text-slate-600'}`}
                        >
                            <GlassSheen />
                            <span className="relative z-10 inline-flex items-center gap-1.5">
                                <Icon name={filters.mostrarBajaDesuso ? 'close' : 'hide_source'} size="xs" />
                                Mostrar baja/desuso
                            </span>
                        </button>
                    </div>
                )}

                <div className="relative z-10 mt-3 grid grid-cols-2 gap-1.5 text-[10px] font-black uppercase tracking-wide">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">Realizado</span>
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-sky-700">Programado</span>
                    <span className="rounded-full border border-sky-200 bg-sky-100 px-2 py-1 text-sky-800">Movido</span>
                    <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-slate-700">Omitido</span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">Pendiente de generar</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">Pausada</span>
                </div>
                {cobertura?.maquinasActivasSinRegla > 0 && (
                    <div className="relative z-10 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                        {cobertura.maquinasActivasSinRegla} maquina{cobertura.maquinasActivasSinRegla === 1 ? '' : 's'} activa{cobertura.maquinasActivasSinRegla === 1 ? '' : 's'} sin programacion preventiva mensual.
                    </div>
                )}
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
                    <p className="text-xs font-medium text-slate-500">No hay programaciones para este filtro.</p>
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
                                    <div className="rounded-lg bg-emerald-50 px-1.5 py-1 text-emerald-700">{summary.reales} realizados</div>
                                    <div className="rounded-lg bg-sky-50 px-1.5 py-1 text-sky-700">{summary.proyecciones} programados</div>
                                    <div className="rounded-lg bg-amber-50 px-1.5 py-1 text-amber-700">{summary.pendientesGenerar} generar</div>
                                </div>
                                <MatrizCell
                                    row={row}
                                    ejecuciones={ejecucionesMes}
                                    canManage={canManage}
                                    submitting={submitting}
                                    onGenerate={onGenerate}
                                    onMove={onMove}
                                    onSkip={onSkip}
                                    onRemoveAdjustment={onRemoveAdjustment}
                                />
                            </div>
                        </article>
                    );
                })
            )}
        </div>
    );
};
