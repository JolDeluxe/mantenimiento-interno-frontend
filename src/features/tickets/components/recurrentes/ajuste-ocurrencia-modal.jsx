import { useEffect, useMemo, useState } from 'react';
import { Button, Icon, Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/z_index';
import { fechaCorta, getOccurrenceDate, getOccurrenceOriginalDate, isPastMonth, isSameMonth } from './recurrentes-utils';

const isValidDate = (value) => {
    if (!value) return false;
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime());
};

const isWeekend = (value) => {
    if (!value) return false;
    const date = new Date(`${value}T00:00:00`);
    const day = date.getDay();
    return day === 0 || day === 6;
};

export const AjusteOcurrenciaModal = ({ mode, occurrence, isOpen, submitting, error, onClose, onConfirm }) => {
    const moving = mode === 'mover';
    const fechaOriginal = getOccurrenceOriginalDate(occurrence);
    const [fechaNueva, setFechaNueva] = useState(getOccurrenceDate(occurrence));
    const [motivo, setMotivo] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFechaNueva(getOccurrenceDate(occurrence));
        setMotivo('');
    }, [isOpen, occurrence]);

    const motivoLimpio = motivo.trim();
    const motivoMuyLargo = motivoLimpio.length > 250;
    const fechaNuevaValida = moving ? isValidDate(fechaNueva) : true;
    const mismaFecha = moving && fechaNueva === fechaOriginal;
    const mismoMes = moving ? isSameMonth(fechaOriginal, fechaNueva) : true;
    const periodoCerrado = isPastMonth(fechaOriginal);
    const weekendWarning = useMemo(() => moving && isWeekend(fechaNueva), [fechaNueva, moving]);

    const validationMessages = [
        !fechaOriginal ? 'No se encontro la fecha programada original.' : null,
        periodoCerrado ? 'Este periodo ya cerro. No se puede mover ni omitir.' : null,
        moving && !fechaNueva ? 'Selecciona una nueva fecha programada.' : null,
        moving && fechaNueva && !fechaNuevaValida ? 'La nueva fecha no es valida.' : null,
        moving && mismaFecha ? 'La nueva fecha debe ser diferente a la original.' : null,
        moving && fechaNuevaValida && !mismoMes ? 'La nueva fecha debe quedar dentro del mismo mes.' : null,
        motivoLimpio.length < 3 ? 'Escribe un motivo de al menos 3 caracteres.' : null,
        motivoMuyLargo ? 'El motivo no debe pasar de 250 caracteres.' : null,
    ].filter(Boolean);

    const disabled = submitting || validationMessages.length > 0;

    const submit = (event) => {
        event.preventDefault();
        if (disabled) return;
        onConfirm({
            fechaOriginal,
            ...(moving ? { fechaNueva } : {}),
            motivo: motivoLimpio,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
            <form onSubmit={submit}>
                <ModalHeader onClose={onClose}>
                    <div className="flex items-center gap-2">
                        <Icon name={moving ? 'event_repeat' : 'event_busy'} className="text-marca-primario" />
                        <span className="font-bold text-slate-800">{moving ? 'Cambiar fecha programada' : 'Omitir fecha programada'}</span>
                    </div>
                </ModalHeader>
                <ModalBody className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="text-[10px] font-black uppercase text-slate-500">Fecha programada original</div>
                        <div className="mt-0.5 text-sm font-black text-slate-800">{fechaCorta(fechaOriginal)}</div>
                    </div>

                    {moving && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-600">Nueva fecha programada</label>
                            <input
                                type="date"
                                value={fechaNueva}
                                onChange={(event) => setFechaNueva(event.target.value)}
                                className={`h-[38px] w-full rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-marca-secundario focus:ring-2 focus:ring-marca-secundario/20 ${fechaNueva && (!fechaNuevaValida || mismaFecha || !mismoMes) ? 'border-red-400' : 'border-slate-200'}`}
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
                            className={`w-full rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-marca-secundario focus:ring-2 focus:ring-marca-secundario/20 ${motivo.length > 0 && motivoLimpio.length < 3 ? 'border-red-400' : 'border-slate-200'}`}
                            placeholder={moving ? 'Ej. Se mueve por disponibilidad del equipo' : 'Ej. Se omite por paro programado'}
                        />
                    </div>

                    {validationMessages.map((message) => (
                        <div key={message} className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                            <Icon name="error" size="xs" />
                            {message}
                        </div>
                    ))}
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                            {error}
                        </div>
                    )}
                    <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">
                        Esta accion solo afecta esta fecha programada. El patron base no cambia.
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button type="button" variant="cancelar" onClick={onClose} disabled={submitting}>Cancelar</Button>
                    <Button type="submit" variant="guardar" disabled={disabled} isLoading={submitting}>
                        {moving ? 'Cambiar fecha' : 'Omitir fecha'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};
