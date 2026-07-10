import { useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import {
    executionStatusClass,
    executionStatusLabel,
    formatDDMM,
    originLabel,
    summarizeExecutions,
} from './matriz-utils';

export const MatrizCell = ({
    row,
    ejecuciones = [],
    canManage,
    submitting,
    onGenerate,
}) => {
    const [expanded, setExpanded] = useState(false);

    if (!ejecuciones.length) {
        return (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-2 py-3">
                <div className="text-[10px] font-black uppercase text-slate-500">Sin mantenimiento este mes</div>
                <div className="mt-1 text-[9px] font-semibold text-slate-400">Observación: sin registro de mantenimiento realizado este mes.</div>
            </div>
        );
    }

    const summary = summarizeExecutions(ejecuciones);
    const visibleItems = expanded ? ejecuciones : ejecuciones.slice(0, 3);
    const hiddenCount = Math.max(ejecuciones.length - visibleItems.length, 0);

    return (
        <div className="flex min-w-[170px] flex-col gap-2">
            <div className="rounded-xl border border-slate-200 bg-white px-2 py-1.5">
                <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase text-slate-700">
                    <span>{summary.total} registro{summary.total === 1 ? '' : 's'}</span>
                    {summary.pendientesGenerar > 0 && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] text-amber-700">
                            {summary.pendientesGenerar} por generar
                        </span>
                    )}
                </div>
                <div className="mt-1 flex flex-wrap gap-1 text-[9px] font-bold uppercase text-slate-500">
                    <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-emerald-700">{summary.reales} generados</span>
                    <span className="rounded-full bg-sky-50 px-1.5 py-0.5 text-sky-700">{summary.proyecciones} programados</span>
                </div>
            </div>

            {visibleItems.map((item, index) => {
                const pendiente = item.pendienteMaterializar && !item.ticketId;
                return (
                    <div key={`${item.fechaInicio}-${item.ticketId || index}`} className={`rounded-lg border px-2 py-1.5 ${executionStatusClass(item.estado)}`}>
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-black uppercase">{formatDDMM(item.fechaInicio)}</span>
                            <span className="text-[9px] font-black uppercase">{executionStatusLabel(item.estado)}</span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[9px] font-bold uppercase opacity-85">
                            <span className="inline-flex items-center gap-1 rounded-md bg-white/60 px-1.5 py-0.5">
                                <Icon name={item.ticketId ? 'confirmation_number' : 'event'} size="10px" />
                                {originLabel(item.origen)}
                            </span>
                            {pendiente && (
                                <span className="rounded-md bg-white/70 px-1.5 py-0.5 text-amber-700">Pendiente de generar</span>
                            )}
                            {item.fechaTerminacion && <span>Termino {formatDDMM(item.fechaTerminacion)}</span>}
                            {!item.fechaTerminacion && item.fechaFin && <span>Limite {formatDDMM(item.fechaFin)}</span>}
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                            {item.ticketId ? (
                                <button
                                    type="button"
                                    disabled
                                    className="inline-flex items-center gap-1 rounded-md bg-white/60 px-1.5 py-0.5 text-[9px] font-black uppercase opacity-60"
                                    title="Ver mantenimiento pendiente de integrar"
                                >
                                    <Icon name="visibility" size="10px" />
                                    Ver mantenimiento
                                </button>
                            ) : pendiente && canManage ? (
                                <button
                                    type="button"
                                    onClick={() => onGenerate(row, item)}
                                    disabled={submitting}
                                    className="inline-flex items-center gap-1 rounded-md bg-white/80 px-1.5 py-0.5 text-[9px] font-black uppercase text-marca-primario disabled:opacity-50"
                                    title="Generar mantenimiento de este periodo"
                                >
                                    <Icon name="bolt" size="10px" />
                                    Generar mantenimiento
                                </button>
                            ) : null}
                        </div>
                    </div>
                );
            })}

            {(hiddenCount > 0 || expanded) && (
                <button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50"
                >
                    {expanded ? 'Ver menos' : `Ver ${hiddenCount} mas`}
                </button>
            )}
        </div>
    );
};
