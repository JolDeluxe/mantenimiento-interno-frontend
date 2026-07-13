import { useEffect, useMemo, useState } from 'react';
import { Button, Icon, Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/z_index';
import { formatDDMM } from './matriz-utils';

const isWeekend = (fecha) => {
    if (!fecha) return false;
    const date = new Date(`${fecha}T00:00:00`);
    const day = date.getDay();
    return day === 0 || day === 6;
};

const isSameMonth = (fechaA, fechaB) => {
    if (!fechaA || !fechaB) return false;
    const a = new Date(`${fechaA}T00:00:00`);
    const b = new Date(`${fechaB}T00:00:00`);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
};

const isValidDate = (fecha) => {
    if (!fecha) return false;
    const date = new Date(`${fecha}T00:00:00`);
    return !Number.isNaN(date.getTime());
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
    const motivoLimpio = motivo.trim();
    const motivoMuyLargo = motivoLimpio.length > 250;
    const fechaNuevaValida = isMove ? isValidDate(fechaNueva) : true;
    const mismaFecha = isMove && fechaNueva === fechaOriginal;
    const mismoMes = isMove ? isSameMonth(fechaOriginal, fechaNueva) : true;

    const validationMessages = [
        !fechaOriginal ? 'No se encontró la fecha programada original.' : null,
        isMove && !fechaNueva ? 'Selecciona una nueva fecha programada.' : null,
        isMove && fechaNueva && !fechaNuevaValida ? 'La nueva fecha no es válida.' : null,
        isMove && mismaFecha ? 'La nueva fecha debe ser diferente a la original.' : null,
        isMove && fechaNuevaValida && !mismoMes ? 'La nueva fecha debe quedar dentro del mismo mes.' : null,
        motivoLimpio.length < 3 ? 'Escribe un motivo de al menos 3 caracteres.' : null,
        motivoMuyLargo ? 'El motivo no debe pasar de 250 caracteres.' : null,
    ].filter(Boolean);

    const disabled = submitting || validationMessages.length > 0;

    const handleSubmit = (event) => {
        event.preventDefault();
        if (disabled) return;
        onConfirm({
            fechaOriginal,
            ...(isMove ? { fechaNueva } : {}),
            motivo: motivoLimpio,
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
                        <div className="flex items-center justify-between gap-2">
                            <label className="text-xs font-black uppercase text-slate-600">Motivo obligatorio</label>
                            <span className={`text-[10px] font-black ${motivoMuyLargo ? 'text-red-600' : 'text-slate-400'}`}>
                                {motivoLimpio.length}/250
                            </span>
                        </div>
                        <textarea
                            value={motivo}
                            onChange={(event) => setMotivo(event.target.value)}
                            maxLength={260}
                            rows={3}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-marca-secundario focus:ring-2 focus:ring-marca-secundario/20"
                            placeholder={isMove ? 'Ej. Se mueve por disponibilidad de máquina' : 'Ej. Se omite por paro programado'}
                        />
                    </div>

                    {validationMessages.length > 0 && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                            <div className="mb-1 flex items-center gap-1.5">
                                <Icon name="info" size="xs" />
                                Revisa antes de guardar
                            </div>
                            <ul className="list-disc space-y-0.5 pl-4">
                                {validationMessages.map((message) => (
                                    <li key={message}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">
                        {isMove
                            ? 'Esta acción solo afecta este periodo. La programación base no cambia.'
                            : 'No se generará mantenimiento para este periodo. No generará alerta negativa.'}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button type="button" variant="cancelar" onClick={onClose} disabled={submitting}>Cancelar</Button>
                    <Button type="submit" variant="guardar" disabled={disabled} isLoading={submitting}>
                        {isMove ? 'Mover este mes' : 'Omitir este mes'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};
