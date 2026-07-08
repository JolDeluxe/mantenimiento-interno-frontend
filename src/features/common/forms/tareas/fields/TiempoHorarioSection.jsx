import React from 'react';
import { Label } from '@/components/form/z_index';
import { Icon } from '@/components/ui/z_index';
import { FechaVencimientoField } from './FechaVencimientoField';
import { DurationPicker } from './DurationPicker';

/**
 * TiempoHorarioSection — componente común controlado y visual.
 *
 * Agrupa la fecha de vencimiento, el selector de duración estimada y la
 * sección de rango horario programado (inicio/fin) si aplica.
 * Toda la lógica de mutación de estado y dependencias permanece en el padre.
 */
export function TiempoHorarioSection({
    // Props de Fecha Vencimiento
    fechaVencimiento,
    onFechaVencimientoChange,
    fechaMin,
    fechaLabel = 'Fecha vencimiento',
    fechaError,
    fechaDisabled = false,
    isToday = false,
    isTomorrow = false,
    onSetToday,
    onSetTomorrow,
    quickButtonBaseClassName,
    quickButtonInactiveClassName,

    // Props de Duración / Tiempo Estimado
    tiempoEstimadoMins,
    onTiempoEstimadoChange,
    tiempoLabel = 'Tiempo estimado',
    tiempoError,
    tiempoDisabled = false,
    durationHoursCount,
    durationSelectBaseClassName,

    // Props de Rango Horario (mantenimientos)
    showHorario = false,
    horaInicio,
    horaFin,
    onHoraInicioChange,
    onHoraFinChange,
    horarioDisabled = false,

    // Props de Layout y Estilo
    layoutClassName = 'grid grid-cols-1 md:grid-cols-2 gap-3',
    durationColSpanClassName = '',
    sectionTitle = 'Tiempo y Programación',
    sectionDescription = 'Define la fecha límite, la duración estimada y las ventanas de atención.',
    showSectionHeader = true,
}) {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {showSectionHeader && (
                <div className="flex items-start gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-marca-primario/10 text-marca-primario flex items-center justify-center shrink-0">
                        <Icon name="schedule" size="sm" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <p className="text-xs font-black text-slate-700 leading-tight">
                            {sectionTitle}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">
                            {sectionDescription}
                        </p>
                    </div>
                </div>
            )}

            <div className={layoutClassName}>
                <FechaVencimientoField
                    id="tf-fecha"
                    value={fechaVencimiento}
                    onChange={onFechaVencimientoChange}
                    min={fechaMin}
                    label={fechaLabel}
                    error={fechaError}
                    disabled={fechaDisabled}
                    onSetToday={onSetToday}
                    onSetTomorrow={onSetTomorrow}
                    isToday={isToday}
                    isTomorrow={isTomorrow}
                    quickButtonBaseClassName={quickButtonBaseClassName}
                    quickButtonInactiveClassName={quickButtonInactiveClassName}
                />

                {showHorario && (
                    <div className="border border-slate-200/80 rounded-2xl p-3 bg-white flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200 col-span-2">
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                            <Icon name="alarm" size="14px" className="text-slate-400" /> Rango Horario Programado (Opcional)
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inicio</span>
                                <input
                                    type="time"
                                    value={horaInicio}
                                    onChange={(e) => onHoraInicioChange(e.target.value)}
                                    disabled={horarioDisabled}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-[7px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fin</span>
                                <input
                                    type="time"
                                    value={horaFin}
                                    onChange={(e) => onHoraFinChange(e.target.value)}
                                    disabled={horarioDisabled}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-[7px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className={`flex flex-col gap-1.5 ${durationColSpanClassName}`}>
                    <Label error={!!tiempoError}>{tiempoLabel}</Label>
                    <DurationPicker
                        valueMins={tiempoEstimadoMins}
                        onChange={onTiempoEstimadoChange}
                        disabled={tiempoDisabled}
                        hoursCount={durationHoursCount}
                        selectBaseClassName={durationSelectBaseClassName}
                    />
                    {tiempoError && <p className="text-[10px] text-rose-600 font-bold">{tiempoError}</p>}
                </div>
            </div>
        </div>
    );
}
