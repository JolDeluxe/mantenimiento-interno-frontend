import { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Label, Input } from '@/components/form/z_index';

export const AdminCloseModal = ({
    isOpen,
    onClose,
    ticket,
    isSubmitting,
    onConfirm,
}) => {
    const [nota, setNota] = useState('');

    useEffect(() => {
        if (isOpen) setNota('');
    }, [isOpen]);

    if (!ticket) return null;

    const notaLimpia = nota.trim();
    const puedeConfirmar = notaLimpia.length > 0 && !isSubmitting;

    const handleConfirmar = () => {
        if (!puedeConfirmar) return;

        const fd = new FormData();
        fd.append('estado', 'CERRADO');
        fd.append('cierreAdministrativo', 'true');
        fd.append('nota', notaLimpia);

        onConfirm(ticket.id, fd);
    };

    return (
        <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} className="max-w-md">
            <ModalHeader title="Cerrar administrativo" onClose={() => !isSubmitting && onClose()} />
            <ModalBody>
                <div className="flex flex-col items-center text-center gap-4 py-2">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <Icon name="rule" size="xl" className="text-slate-600" fill />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-800">
                            Cerrar esta tarea sin registrar tiempo operativo
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <span className="block font-bold text-slate-900 line-clamp-2">{ticket.titulo}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Este cierre es neutral para tiempos: no inicia cronometro, no cierra intervalos y no registra duracion nueva.
                        </p>
                    </div>

                    <div className="w-full flex flex-col gap-1.5 text-left">
                        <Label htmlFor="admin-close-nota">
                            Motivo del cierre <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="admin-close-nota"
                            multiline
                            value={nota}
                            onChange={(e) => setNota(e.target.value)}
                            placeholder="Explica por que se cierra administrativamente..."
                            disabled={isSubmitting}
                        />
                        {!notaLimpia && (
                            <p className="text-[11px] font-medium text-slate-400">
                                La nota es obligatoria para dejar historial del cierre.
                            </p>
                        )}
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>Volver</Button>
                <Button
                    variant="accion"
                    icon="rule"
                    isLoading={isSubmitting}
                    disabled={!puedeConfirmar}
                    onClick={handleConfirmar}
                >
                    Cerrar administrativo
                </Button>
            </ModalFooter>
        </Modal>
    );
};
