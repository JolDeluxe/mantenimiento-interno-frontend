import { useMemo, useState } from 'react';
import { Button, Icon, SearchableSelect, Spinner } from '@/components/ui/z_index';
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
    const currentQuarter = getCurrentQuarter();
    const [viewMode, setViewMode] = useState('trimestre');
    const [selectedMes, setSelectedMes] = useState(String(new Date().getMonth() + 1));
    const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);
    const yearOptions = useMemo(() => (
        Array.from({ length: 7 }, (_, index) => {
            const value = String(currentYear - 3 + index);
            return { value, label: value };
        })
    ), [currentYear]);

    const visibleMonths = useMemo(
        () => getVisibleMonths({ mode: viewMode, month: selectedMes, quarter: selectedQuarter }),
        [selectedMes, selectedQuarter, viewMode],
    );
    const isDefaultYear = Number(year) === currentYear;
    const isDefaultView = viewMode === 'trimestre';
    const isDefaultQuarter = selectedQuarter === currentQuarter;
    const rangeLabel = viewMode === 'trimestre'
        ? `Mostrando trimestre ${isDefaultQuarter && isDefaultYear ? 'actual' : 'seleccionado'}: Q${selectedQuarter} ${year} · ${visibleMonths.map((mes) => mes.label).join(' - ')}`
        : `Mostrando ${viewMode === 'mes' ? 'mes' : 'año'}: ${visibleMonths.map((mes) => mes.label).join(' - ')} ${year}`;

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
                            {total} programacion{total === 1 ? '' : 'es'} preventiva{total === 1 ? '' : 's'}. {rangeLabel}.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="min-w-28 flex-none">
                            <SearchableSelect
                                options={yearOptions}
                                value={isDefaultYear ? '' : String(year)}
                                onChange={(value) => setYear(value ? Number(value) : currentYear)}
                                placeholder={String(currentYear)}
                                icon="calendar_today"
                                allOptionText={String(currentYear)}
                                className="w-full"
                            />
                        </div>
                        <div className="min-w-36 flex-none">
                            <SearchableSelect
                                options={MATRIX_VIEW_MODES}
                                value={isDefaultView ? '' : viewMode}
                                onChange={(value) => setViewMode(value || 'trimestre')}
                                placeholder="Trimestre"
                                icon="view_week"
                                allOptionText="Trimestre"
                                className="w-full"
                            />
                        </div>
                        {viewMode === 'mes' && (
                            <div className="min-w-36 flex-none">
                                <SearchableSelect
                                    options={MESES_MATRIZ.map((mes) => ({ value: mes.key, label: mes.label }))}
                                    value={selectedMes}
                                    onChange={setSelectedMes}
                                    placeholder="Mes..."
                                    icon="event_note"
                                    allOptionText={null}
                                    className="w-full"
                                />
                            </div>
                        )}
                        {viewMode === 'trimestre' && (
                            <div className="min-w-40 flex-none">
                                <SearchableSelect
                                    options={TRIMESTRES_MATRIZ.map((trimestre) => ({ value: trimestre.key, label: trimestre.label }))}
                                    value={isDefaultQuarter ? '' : selectedQuarter}
                                    onChange={(value) => setSelectedQuarter(value || currentQuarter)}
                                    placeholder={`Trimestre ${currentQuarter}`}
                                    icon="date_range"
                                    allOptionText={`Trimestre ${currentQuarter}`}
                                    className="w-full"
                                />
                            </div>
                        )}
                        <input
                            value={filters.q}
                            onChange={(event) => setFilters({ q: event.target.value })}
                            placeholder="Buscar codigo, maquina, responsable"
                            className="h-[38px] min-w-[250px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-marca-secundario focus:ring-2 focus:ring-marca-secundario/20"
                        />
                        <div className="min-w-44 flex-none">
                            <SearchableSelect
                                options={responsables.map((responsable) => ({ value: responsable.id, label: responsable.nombre }))}
                                value={filters.responsable}
                                onChange={(value) => setFilters({ responsable: value })}
                                placeholder="Responsable..."
                                icon="person"
                                allOptionText="Cualquiera"
                                className="w-full"
                            />
                        </div>
                        <div className="min-w-36 flex-none">
                            <SearchableSelect
                                options={[
                                    { value: 'activa', label: 'Activas' },
                                    { value: 'pausada', label: 'Pausadas' },
                                ]}
                                value={filters.estadoRegla}
                                onChange={(value) => setFilters({ estadoRegla: value })}
                                placeholder="Estado..."
                                icon="settings"
                                allOptionText="Todas"
                                className="w-full"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="filtro_gris"
                            icon={filters.mostrarBajaDesuso ? 'close' : 'hide_source'}
                            size="sm"
                            onClick={() => setFilters({ mostrarBajaDesuso: !filters.mostrarBajaDesuso })}
                            className={`h-[38px] ${filters.mostrarBajaDesuso ? 'bg-slate-700 text-white hover:bg-slate-800' : ''}`}
                        >
                            Baja/desuso
                        </Button>
                        <Button type="button" variant="filtro_gris" icon="refresh" size="sm" onClick={refresh} disabled={loading} className="h-[38px]">
                            Actualizar
                        </Button>
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wide">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">Realizado en el mes</span>
                    <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-orange-700">Realizado fuera del mes</span>
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-sky-700">Programado por recurrencia</span>
                    <span className="rounded-full border border-sky-200 bg-sky-100 px-2 py-1 text-sky-800">Movido este mes</span>
                    <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-slate-700">Omitido este mes</span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">Pendiente de generar = aun no se ha creado el mantenimiento</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">Sin mantenimiento este mes = observacion mensual</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">Pausada = programacion detenida</span>
                    <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-cyan-700">Impreso = etiqueta derivada</span>
                </div>
                {cobertura?.maquinasActivasSinRegla > 0 && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                        {cobertura.maquinasActivasSinRegla} maquina{cobertura.maquinasActivasSinRegla === 1 ? '' : 's'} activa{cobertura.maquinasActivasSinRegla === 1 ? '' : 's'} sin programacion preventiva mensual.
                    </div>
                )}
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
                    <p className="text-xs font-medium text-slate-500">No hay programaciones para este año/filtro.</p>
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
                                                    onMove={onMove}
                                                    onSkip={onSkip}
                                                    onRemoveAdjustment={onRemoveAdjustment}
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
