// src/features/tickets/components/historico/status-modals/ticket-start-modal.jsx
import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { isPastDate } from '@/lib/date';

export const TicketStartModal = ({
    isOpen,
    onClose,
    ticket,
    isSubmitting,
    onConfirm,
    esReinicio = false,
}) => {
    const [activado, setActivado] = useState(false);
    const [nota, setNota] = useState('');

    useEffect(() => {
        if (isOpen) {
            setActivado(false);
            setNota('');
        }
    }, [isOpen]);

    if (!ticket) return null;

    const handleConfirmar = () => {
        const fd = new FormData();
        fd.append('estado', 'EN_PROGRESO');

        let notaFinal = nota.trim();
        if (esReinicio) {
            notaFinal = notaFinal
                ? `Tarea reactivada. El técnico retomará la corrección.\n\nNotas: ${notaFinal}`
                : 'Tarea reactivada. El técnico retomará la corrección.';
        }

        if (notaFinal) {
            fd.append('nota', notaFinal);
        }

        onConfirm(ticket.id, fd);
    };

    return (
        <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} className="max-w-sm">
            <ModalHeader
                title={esReinicio ? 'Retomar Tarea' : 'Iniciar Tarea'}
                onClose={() => !isSubmitting && onClose()}
            />
            <ModalBody>
                <div className="flex flex-col items-center gap-6 py-4 text-center">

                    {isPastDate(ticket?.fechaVencimiento) && (
                        <div className="w-full flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm text-left">
                            <Icon name="warning" size="sm" className="shrink-0 mt-0.5" />
                            <p><strong>¡Atención!</strong> Estás a punto de {esReinicio ? 'retomar' : 'iniciar'} una tarea que se encuentra con <strong>retraso</strong>.</p>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setActivado((prev) => !prev)}
                        aria-pressed={activado}
                        className={`
                            w-28 h-28 rounded-full flex items-center justify-center
                            transition-all duration-300 ease-out cursor-pointer outline-none
                            active:scale-90 focus-visible:ring-4 focus-visible:ring-estado-asignada/40
                            ${activado
                                ? 'bg-estado-asignada text-white shadow-xl shadow-estado-asignada/30 scale-105'
                                : 'bg-estado-asignada/10 text-estado-asignada border-2 border-dashed border-estado-asignada/40 hover:bg-estado-asignada/20 hover:border-estado-asignada/70'
                            }
                        `}
                    >
                        <Icon
                            name="play_circle"
                            size="56px"
                            fill={activado}
                            weight={activado ? 700 : 400}
                        />
                    </button>

                    <div className="space-y-2 px-2">
                        <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                            {ticket.titulo}
                        </p>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {esReinicio
                                ? 'La tarea volverá a '
                                : 'La tarea pasará a '}
                            <strong className="text-estado-asignada">En Progreso</strong>
                            {' '}y el sistema <strong>comenzará a medir</strong> el tiempo de ejecución.
                        </p>
                        {!activado && (
                            <p className="text-xs text-slate-400 mt-2">
                                Presiona el botón para confirmar que estás listo.
                            </p>
                        )}
                    </div>

                    {activado ? (
                        <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-estado-asignada/10 border border-estado-asignada/20 rounded-full text-sm font-semibold text-estado-asignada">
                                <Icon name="timer" size="sm" />
                                Cronómetro listo para iniciar
                            </div>

                            <div className="w-full text-left mt-2">
                                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                                    Comentarios iniciales <span className="font-normal text-slate-400">(opcional)</span>
                                </label>
                                <textarea
                                    rows={2}
                                    value={nota}
                                    onChange={(e) => setNota(e.target.value)}
                                    placeholder="Alguna observación antes de iniciar..."
                                    className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 focus:border-marca-secundario transition-all"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-full text-sm font-medium text-slate-400">
                            <Icon name="touch_app" size="sm" />
                            Toca el botón para activar
                        </div>
                    )}
                </div>
            </ModalBody>

            <ModalFooter>
                <Button
                    variant="cancelar"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                    Cancelar
                </Button>
                <Button
                    variant="accion"
                    icon="play_arrow"
                    isLoading={isSubmitting}
                    disabled={!activado}
                    onClick={handleConfirmar}
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                    {esReinicio ? 'Retomar ahora' : 'Iniciar ahora'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};