import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Select, Input } from '@/components/form/z_index';

export const TicketStatusModal = ({ isOpen, onClose, ticket, onConfirm, isMutating }) => {
    const [estado, setEstado] = useState('');
    const [nota, setNota] = useState('');
    const [duracionManual, setDuracionManual] = useState('');

    useEffect(() => {
        if (isOpen && ticket) {
            setEstado(ticket.estado);
            setNota('');
            setDuracionManual('');
        }
    }, [isOpen, ticket]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { estado, nota };

        // Si resuelve y anexa tiempo manual, preparamos el payload según el contrato Zod
        if (estado === 'RESUELTO' && duracionManual) {
            payload.registroTiempoManual = JSON.stringify({
                duracionManualMinutos: parseInt(duracionManual, 10)
            });
        }

        onConfirm(ticket.id, payload);
    };

    if (!ticket) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader title={`Actualizar Estado - #${ticket.id}`} onClose={onClose} />
                <ModalBody className="flex flex-col gap-4">
                    <Select
                        label="Nuevo Estado"
                        name="estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        options={[
                            { value: 'PENDIENTE', label: 'Pendiente' },
                            { value: 'EN_PROGRESO', label: 'En Progreso' },
                            { value: 'EN_PAUSA', label: 'En Pausa' },
                            { value: 'RESUELTO', label: 'Resuelto' },
                            { value: 'RECHAZADO', label: 'Rechazado' }
                        ]}
                    />

                    <Input
                        label="Nota de Bitácora (Opcional)"
                        name="nota"
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                        placeholder="Describe el avance o motivo de pausa..."
                        multiline
                        rows={3}
                    />

                    {estado === 'RESUELTO' && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mt-2">
                            <h4 className="text-sm font-semibold text-slate-800 flex items-center mb-3">
                                <Icon name="timer" className="mr-2 text-marca-primario" />
                                Ajuste de Tiempo (Olvido)
                            </h4>
                            <p className="text-xs text-slate-500 mb-3">
                                Si olvidaste iniciar el timer, ingresa el tiempo total invertido. Si lo dejas en blanco, se usará el tiempo automático calculado por el sistema.
                            </p>
                            <Input
                                label="Duración Manual (Minutos)"
                                name="duracion"
                                type="number"
                                min="1"
                                max="1440"
                                value={duracionManual}
                                onChange={(e) => setDuracionManual(e.target.value)}
                                placeholder="Ej. 120"
                            />
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button type="button" variante="cancelar" onClick={onClose} disabled={isMutating}>
                        Cancelar
                    </Button>
                    <Button type="submit" variante="guardar" isLoading={isMutating}>
                        Guardar Cambios
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};