import { useEffect, useMemo, useState } from 'react';
import { Button, Icon, Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/z_index';
import { formatDDMM } from './matriz-utils';

const isWeekend = (fecha) => {
    if (!fecha) return false;
    const date = new Date(`${fecha}T00:00:00`);
    const day = date.getDay();
    return day === 0 || day === 6;
};

export const AjusteOcurrenciaModal = ({
    isOpen,
    mode,
    item,
    submitting,
    onClose,
    onConfirm,
}) => {
    const fechaOriginal = item?.fechaOriginal || item?.fechaInicio || '';
    const [fechaNueva, setFechaNueva] = useState(item?.fechaProgramadaPreventiva || item?.fechaProgramada || fechaOriginal);
    const [motivo, setMotivo] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFechaNueva(item?.fechaProgramadaPreventiva || item?.fechaProgramada || fechaOriginal);
        setMotivo('');
    }, [fechaOriginal, isOpen, item?.fechaProgramada, item?.fechaProgramadaPreventiva]);

    const isMove = mode === 'mover';
    const title = isMove ? 'Mover este mes' : 'Omitir este mes';
    const weekendWarning = useMemo(() => isMove && isWeekend(fechaNueva), [fechaNueva, isMove]);
    const disabled = submitting || !fechaOriginal || (isMove ? !fechaNueva : motivo.trim().length < 3);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (disabled) return;
        onConfirm({
            fechaOriginal,
            ...(isMove ? { fechaNueva } : {}),
            motivo: motivo.trim() || undefined,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <form onSubmit={handleSubmit}>
                <ModalHeader title={title} onClose={onClose} />
                <ModalBody className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="text-[10px] font-black uppercase text-slate-500">Fecha programada original</div>
                        <div className="mt-0.5 text-sm font-black text-slate-800">{formatDDMM(fechaOriginal)}</div>
                    </div>

                    {isMove && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-600">Nueva fecha programada</label>
                            <input
                                type="date"
                                value={fechaNueva}
                                onChange={(event) => setFechaNueva(event.target.value)}
                                className="h-[38px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-marca-secundario focus:ring-2 focus:ring-marca-secundario/20"
                            />
                            {weekendWarning && (
                                <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs font-bold text-amber-700">
                                    <Icon name="warning" size="xs" />
                                    La fecha elegida cae en fin de semana.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-600">{isMove ? 'Motivo' : 'Motivo obligatorio'}</label>
                        <textarea
                            value={motivo}
                            onChange={(event) => setMotivo(event.target.value)}
                            rows={3}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-marca-secundario focus:ring-2 focus:ring-marca-secundario/20"
                            placeholder="Ajuste por operación"
                        />
                    </div>

                    <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">
                        {isMove
                            ? 'Esta acción solo afecta este periodo. La programación base no cambia.'
                            : 'No se generará mantenimiento para este periodo. No generará alerta negativa.'}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button type="button" variant="cancelar" onClick={onClose} disabled={submitting}>Cancelar</Button>
                    <Button type="submit" variant="primario" disabled={disabled} isLoading={submitting}>
                        {isMove ? 'Mover este mes' : 'Omitir este mes'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};
