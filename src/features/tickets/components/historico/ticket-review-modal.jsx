// src/features/tickets/components/historico/ticket-review-modal.jsx
import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Label, Input } from '@/components/form/z_index';

/**
 * Modal de revisión/validación de un ticket RESUELTO.
 * El actor (cliente o supervisor) decide: CERRAR (conforme) o RECHAZAR (no conforme).
 *
 * Genera un FormData compatible con el contrato changeStatusSchema del backend:
 *   { estado: 'CERRADO' | 'RECHAZADO', nota?: string }
 */
export const TicketReviewModal = ({
    isOpen,
    onClose,
    ticket,
    onConfirm,
    isSubmitting,
}) => {
    const [nota, setNota] = useState('');
    const [decision, setDecision] = useState(null); // 'CERRADO' | 'RECHAZADO'
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setNota('');
            setDecision(null);
            setError(null);
        }
    }, [isOpen]);

    if (!ticket) return null;

    const handleSubmit = () => {
        if (!decision) {
            setError('Selecciona una decisión para continuar.');
            return;
        }
        const formData = new FormData();
        formData.append('estado', decision);
        if (nota.trim()) formData.append('nota', nota.trim());
        onConfirm(ticket.id, formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()}>
            <ModalHeader
                title={`Revisar resolución — #${ticket.id}`}
                onClose={() => !isSubmitting && onClose()}
            />
            <ModalBody>
                <div className="flex flex-col gap-5">

                    {/* Resumen del ticket */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Ticket resuelto</p>
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{ticket.titulo}</p>
                        {ticket.responsables?.length > 0 && (
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <Icon name="engineering" size="xs" />
                                {ticket.responsables.map((r) => r.nombre).join(', ')}
                            </p>
                        )}
                    </div>

                    {/* Decisión */}
                    <div className="flex flex-col gap-2">
                        <Label error={!!error}>¿El trabajo fue satisfactorio? *</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => { setDecision('CERRADO'); setError(null); }}
                                disabled={isSubmitting}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer
                  ${decision === 'CERRADO'
                                        ? 'bg-estado-resuelto/10 border-estado-resuelto text-estado-resuelto'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-estado-resuelto/40'
                                    }`}
                            >
                                <Icon name="check_circle" size="lg" fill={decision === 'CERRADO'} />
                                <span className="text-sm font-bold">Conforme</span>
                                <span className="text-[10px] font-medium opacity-70 text-center">Cerrar ticket como resuelto</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => { setDecision('RECHAZADO'); setError(null); }}
                                disabled={isSubmitting}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer
                  ${decision === 'RECHAZADO'
                                        ? 'bg-estado-rechazado/10 border-estado-rechazado text-estado-rechazado'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-estado-rechazado/40'
                                    }`}
                            >
                                <Icon name="cancel" size="lg" fill={decision === 'RECHAZADO'} />
                                <span className="text-sm font-bold">No conforme</span>
                                <span className="text-[10px] font-medium opacity-70 text-center">Rechazar y pedir corrección</span>
                            </button>
                        </div>
                        {error && <p className="text-xs text-estado-rechazado font-bold">{error}</p>}
                    </div>

                    {/* Nota */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="rev-nota">
                            {decision === 'RECHAZADO' ? 'Motivo del rechazo *' : 'Nota de cierre (opcional)'}
                        </Label>
                        <Input
                            id="rev-nota"
                            multiline
                            value={nota}
                            onChange={(e) => setNota(e.target.value)}
                            placeholder={
                                decision === 'RECHAZADO'
                                    ? 'Explica qué faltó o qué debe corregirse…'
                                    : 'Observaciones finales o confirmación de conformidad…'
                            }
                            disabled={isSubmitting}
                        />
                    </div>

                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                <Button
                    variant={decision === 'RECHAZADO' ? 'borrar' : 'guardar'}
                    icon={decision === 'RECHAZADO' ? 'cancel' : 'check_circle'}
                    isLoading={isSubmitting}
                    onClick={handleSubmit}
                >
                    {decision === 'RECHAZADO' ? 'Rechazar trabajo' : 'Cerrar ticket'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};