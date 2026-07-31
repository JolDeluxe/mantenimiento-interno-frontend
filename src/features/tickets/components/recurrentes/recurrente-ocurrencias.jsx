import { Icon, Spinner } from '@/components/ui/z_index';
import { AjusteOcurrenciaActions } from './ajuste-ocurrencia-actions';
import { fecha, fechaCorta, getOccurrenceDate, getOccurrenceOriginalDate } from './recurrentes-utils';

const statusInfo = (item) => {
    if (item.omitida || item.ajusteTipo === 'OMITIR') {
        return ['Omitida', 'border-slate-200 bg-slate-100 text-slate-600'];
    }
    if (item.tareaId || item.ticketId) {
        const estado = String(item.tareaEstado || item.ticketEstado || '').toUpperCase();
        if (estado === 'RESUELTO' || estado === 'CERRADO') return ['Resuelta', 'border-emerald-200 bg-emerald-50 text-emerald-700'];
        if (estado === 'RECHAZADO') return ['Rechazada', 'border-red-200 bg-red-50 text-red-700'];
        if (estado === 'EN_PROGRESO') return ['En progreso', 'border-sky-200 bg-sky-50 text-sky-700'];
        if (estado === 'EN_PAUSA') return ['En pausa', 'border-amber-200 bg-amber-50 text-amber-700'];
        return ['Tarea generada', 'border-emerald-200 bg-emerald-50 text-emerald-700'];
    }
    if (item.movida || item.ajusteTipo === 'MOVER') {
        return ['Fecha ajustada', 'border-sky-200 bg-sky-50 text-sky-700'];
    }
    return ['Pendiente', 'border-amber-200 bg-amber-50 text-amber-700'];
};

export const RecurrenteOcurrencias = ({
    occurrences,
    loading,
    canManage,
    submitting,
    onMaterialize,
    onMove,
    onOmit,
    onRemove,
}) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-slate-500">
                <Spinner size="sm" className="mr-2" />
                <span className="text-xs font-black uppercase tracking-wide">Cargando cronograma...</span>
            </div>
        );
    }

    if (!occurrences.length) {
        return (
            <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs font-semibold text-slate-400">
                Sin fechas programadas para este rango.
            </div>
        );
    }

    return (
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {occurrences.map((item) => {
                const scheduledDate = getOccurrenceDate(item);
                const originalDate = getOccurrenceOriginalDate(item);
                const [label, tone] = statusInfo(item);
                const moved = Boolean(item.movida || item.ajusteTipo === 'MOVER');
                const taskId = item.tareaId || item.ticketId;

                return (
                    <div
                        key={`${originalDate}-${scheduledDate}-${item.ajusteTipo || 'base'}`}
                        className={`rounded-xl border p-3.5 shadow-sm transition-all ${tone}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-xs font-black uppercase">
                                    {fecha(scheduledDate)}
                                </div>
                                {moved && (
                                    <div className="mt-0.5 text-[10px] font-bold opacity-75">
                                        Original: {fechaCorta(originalDate)}
                                    </div>
                                )}
                                {(item.ajusteMotivo || item.motivo) && (
                                    <div className="mt-1.5 rounded-lg border border-black/5 bg-white/50 p-2 text-[10px] font-bold italic">
                                        Motivo: {item.ajusteMotivo || item.motivo}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <span className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 text-[9px] font-black uppercase">
                                    {label}
                                </span>
                                {taskId && (
                                    <span className="rounded-md bg-black/5 px-1.5 py-0.5 text-[9px] font-black uppercase">
                                        Tarea #{taskId}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-end border-t border-black/5 pt-2.5">
                            <AjusteOcurrenciaActions
                                occurrence={item}
                                canManage={canManage}
                                disabled={submitting}
                                onMaterialize={onMaterialize}
                                onMove={onMove}
                                onOmit={onOmit}
                                onRemove={onRemove}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
