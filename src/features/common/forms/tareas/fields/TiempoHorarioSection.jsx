import React from 'react';
import { Label } from '@/components/form/z_index';
import { Icon } from '@/components/ui/z_index';
import { FechaVencimientoField } from './FechaVencimientoField';
import { DurationPicker } from './DurationPicker';

/**
 * TiempoHorarioSection — componente común controlado y visual.
 *
 * Agrupa de forma integrada el campo de fecha de vencimiento límite y
 * el selector de duración estimada de la tarea en una card elegante.
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

    // Props de Layout y Estilo
    layoutClassName = 'grid grid-cols-1 md:grid-cols-2 gap-3',
    durationColSpanClassName = '',
    sectionTitle = 'Tiempo y Programación',
    sectionDescription = 'Define la fecha límite y la duración estimada de la tarea.',
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
