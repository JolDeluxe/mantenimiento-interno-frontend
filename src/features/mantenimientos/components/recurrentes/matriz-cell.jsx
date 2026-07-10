import { Icon } from '@/components/ui/z_index';
import { executionStatusClass, formatDDMM } from './matriz-utils';

export const MatrizCell = ({
    row,
    ejecuciones = [],
    canManage,
    submitting,
    onGenerate,
}) => {
    if (!ejecuciones.length) {
        return <div className="text-[10px] font-semibold text-slate-300">Sin programar</div>;
    }

    return (
        <div className="flex min-w-[150px] flex-col gap-1.5">
            {ejecuciones.map((item, index) => (
                <div key={`${item.fechaInicio}-${item.ticketId || index}`} className={`rounded-lg border px-2 py-1 ${executionStatusClass(item.estado)}`}>
                    <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-black uppercase">{formatDDMM(item.fechaInicio)}</span>
                        <span className="text-[9px] font-black uppercase">{item.estado || 'SIN ESTADO'}</span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-1 text-[9px] font-bold uppercase opacity-80">
                        <span>{item.origen === 'ticket' ? 'Ticket' : 'Proyeccion'}</span>
                        {item.fechaFin && <span>Fin {formatDDMM(item.fechaFin)}</span>}
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                        {item.ticketId ? (
                            <button
                                type="button"
                                disabled
                                className="inline-flex items-center gap-1 rounded-md bg-white/60 px-1.5 py-0.5 text-[9px] font-black uppercase opacity-60"
                                title="Ver ticket pendiente de integrar"
                            >
                                <Icon name="visibility" size="10px" />
                                Ver ticket
                            </button>
                        ) : item.pendienteMaterializar && canManage ? (
                            <button
                                type="button"
                                onClick={() => onGenerate(row, item)}
                                disabled={submitting}
                                className="inline-flex items-center gap-1 rounded-md bg-white/80 px-1.5 py-0.5 text-[9px] font-black uppercase text-marca-primario disabled:opacity-50"
                                title="Generar ciclo actual o vencido"
                            >
                                <Icon name="bolt" size="10px" />
                                Generar
                            </button>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    );
};
