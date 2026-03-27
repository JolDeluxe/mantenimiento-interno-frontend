// src/features/tickets/components/historico/ticket-review-modal.jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Label, Input } from '@/components/form/z_index';

/**
 * Modal de revisión/validación de un ticket RESUELTO.
 * El actor (cliente o supervisor) decide: CERRAR (conforme) o RECHAZAR (no conforme).
 * Muestra la evidencia y notas dejadas por el técnico al resolver con galería inmersiva.
 */
export const TicketReviewModal = ({
    isOpen,
    onClose,
    ticket,
    onConfirm,
    isSubmitting,
}) => {
    const [nota, setNota] = useState('');
    const [decision, setDecision] = useState(null);
    const [error, setError] = useState(null);
    const [previewIndex, setPreviewIndex] = useState(null);

    const resolucion = ticket?.historial?.find(h => h.estadoNuevo === 'RESUELTO');
    const notaTecnico = resolucion?.nota || '';

    const imagenesEvidenciaBrutas = resolucion?.imagenes?.length > 0
        ? resolucion.imagenes
        : ticket?.imagenes?.filter(img => img.tipo === 'EVIDENCIA_SOLUCION') || [];

    const imagenesEvidenciaUrls = imagenesEvidenciaBrutas
        .map(img => typeof img === 'string' ? img : img?.url)
        .filter(Boolean);

    useEffect(() => {
        if (isOpen) {
            setNota('');
            setDecision(null);
            setError(null);
            setPreviewIndex(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (previewIndex === null || imagenesEvidenciaUrls.length <= 1) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                setPreviewIndex((prev) => (prev + 1) % imagenesEvidenciaUrls.length);
            } else if (e.key === 'ArrowLeft') {
                setPreviewIndex((prev) => (prev - 1 + imagenesEvidenciaUrls.length) % imagenesEvidenciaUrls.length);
            } else if (e.key === 'Escape') {
                setPreviewIndex(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [previewIndex, imagenesEvidenciaUrls.length]);

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
        <>
            <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()}>
                <ModalHeader
                    title={`Revisar resolución — #${ticket.id}`}
                    onClose={() => !isSubmitting && onClose()}
                />
                <ModalBody>
                    <div className="flex flex-col gap-5">

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

                        {(notaTecnico || imagenesEvidenciaUrls?.length > 0) && (
                            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                                <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Icon name="info" size="xs" /> Evidencia de resolución
                                </p>

                                {notaTecnico && (
                                    <p className="text-sm text-slate-700 italic bg-white p-3 rounded border border-blue-100/50 mb-3 shadow-sm">
                                        "{notaTecnico}"
                                    </p>
                                )}

                                {imagenesEvidenciaUrls?.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                            <Icon name="image" size="xs" /> Archivos adjuntos ({imagenesEvidenciaUrls.length})
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {imagenesEvidenciaUrls.map((url, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => setPreviewIndex(index)}
                                                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group shrink-0 bg-slate-100 flex items-center justify-center cursor-pointer"
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`Evidencia miniatura ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                        <Icon name="zoom_in" className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md scale-75 group-hover:scale-100 transition-all" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <Label error={!!error}>¿El trabajo fue satisfactorio? *</Label>
                            <div className="grid grid-cols-2 gap-3">

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

                            </div>
                            {error && <p className="text-xs text-estado-rechazado font-bold mt-1">{error}</p>}
                        </div>

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

            {previewIndex !== null && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-pointer"
                    onClick={() => setPreviewIndex(null)}
                >
                    <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 md:px-6 pointer-events-none">
                        {imagenesEvidenciaUrls.length > 1 ? (
                            <span className="text-white bg-slate-800/70 px-3 py-1 rounded-full text-sm font-medium pointer-events-auto shadow-lg">
                                {previewIndex + 1} / {imagenesEvidenciaUrls.length}
                            </span>
                        ) : <div />}

                        <button
                            type="button"
                            className="text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all pointer-events-auto shadow-lg shrink-0 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); setPreviewIndex(null); }}
                        >
                            <Icon name="close" size="lg" />
                        </button>
                    </div>

                    {imagenesEvidenciaUrls.length > 1 && (
                        <button
                            type="button"
                            className="absolute left-2 md:left-6 text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all z-10 shrink-0 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPreviewIndex((prev) => (prev - 1 + imagenesEvidenciaUrls.length) % imagenesEvidenciaUrls.length);
                            }}
                        >
                            <Icon name="chevron_left" size="lg" />
                        </button>
                    )}

                    <img
                        key={previewIndex}
                        src={imagenesEvidenciaUrls[previewIndex]}
                        alt={`Evidencia ampliada ${previewIndex + 1}`}
                        className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {imagenesEvidenciaUrls.length > 1 && (
                        <button
                            type="button"
                            className="absolute right-2 md:right-6 text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all z-10 shrink-0 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPreviewIndex((prev) => (prev + 1) % imagenesEvidenciaUrls.length);
                            }}
                        >
                            <Icon name="chevron_right" size="lg" />
                        </button>
                    )}
                </div>,
                document.body
            )}
        </>
    );
};