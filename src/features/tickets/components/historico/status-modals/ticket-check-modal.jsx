// src/features/tickets/components/historico/status-modals/ticket-check-modal.jsx
import { useState, useEffect, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { isPastDate } from '@/lib/date';

export const TicketCheckModal = ({
    isOpen,
    onClose,
    ticket,
    isSubmitting,
    onConfirm,
}) => {
    const [marcada, setMarcada] = useState(false);
    const [archivos, setArchivos] = useState([]);
    const [nota, setNota] = useState('');
    const fileRef = useRef(null);
    const MAX_FOTOS = 3;

    useEffect(() => {
        if (isOpen) {
            setMarcada(false);
            setArchivos([]);
            setNota('');
        }
    }, [isOpen]);

    // Limpiar previews al desmontar
    useEffect(() => {
        return () => {
            archivos.forEach((item) => URL.revokeObjectURL(item.preview));
        };
    }, [archivos]);

    if (!ticket) return null;

    const handleFileChange = (e) => {
        const nuevos = Array.from(e.target.files || []).slice(0, MAX_FOTOS - archivos.length);
        const items = nuevos.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setArchivos((prev) => [...prev, ...items].slice(0, MAX_FOTOS));
        e.target.value = '';
    };

    const handleEliminar = (idx) => {
        setArchivos((prev) => {
            const copia = [...prev];
            URL.revokeObjectURL(copia[idx].preview);
            copia.splice(idx, 1);
            return copia;
        });
    };

    const handleConfirmar = () => {
        const fd = new FormData();
        fd.append('estado', 'CERRADO');
        if (nota.trim()) fd.append('nota', nota.trim());
        archivos.forEach((item) => fd.append('imagenes', item.file, item.file.name));
        onConfirm(ticket.id, fd);
    };

    return (
        <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} className="max-w-sm">
            <ModalHeader
                title="Completar Rutina"
                onClose={() => !isSubmitting && onClose()}
            />
            <ModalBody>
                <div className="flex flex-col items-center gap-6 py-4">

                    {/* Alerta de Retraso */}
                    {isPastDate(ticket?.fechaVencimiento) && (
                        <div className="w-full flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm text-left">
                            <Icon name="warning" size="sm" className="shrink-0 mt-0.5" />
                            <p><strong>¡Atención!</strong> Estás a punto de finalizar esta tarea, pero ya se encuentra <strong>atrasada</strong> según su fecha límite.</p>
                        </div>
                    )}

                    {/* Info del ticket */}
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                            Tarea de Rutina
                        </span>
                        <p className="text-sm font-semibold text-slate-800 leading-snug">
                            {ticket.titulo}
                        </p>
                    </div>

                    {/* Checkbox central interactivo */}
                    <button
                        type="button"
                        onClick={() => setMarcada((prev) => !prev)}
                        aria-pressed={marcada}
                        className={cn(
                            'flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border-2 transition-all duration-300 ease-out cursor-pointer outline-none active:scale-95',
                            'focus-visible:ring-4',
                            marcada
                                ? 'bg-estado-resuelto/10 border-estado-resuelto text-estado-resuelto focus-visible:ring-estado-resuelto/30'
                                : 'bg-white border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-500 focus-visible:ring-slate-300'
                        )}
                    >
                        {/* Ícono SVG checkbox */}
                        <div className={cn(
                            'transition-all duration-300',
                            marcada ? 'scale-110' : 'scale-100'
                        )}>
                            {marcada ? (
                                // check_box filled
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 -960 960 960"
                                    width="64"
                                    height="64"
                                    fill="currentColor"
                                >
                                    <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                                </svg>
                            ) : (
                                // check_box_outline_blank
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 -960 960 960"
                                    width="64"
                                    height="64"
                                    fill="currentColor"
                                >
                                    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z" />
                                </svg>
                            )}
                        </div>

                        <span className={cn(
                            'text-sm font-bold transition-colors duration-200',
                            marcada ? 'text-estado-resuelto' : 'text-slate-500'
                        )}>
                            {marcada ? '¡Completada!' : 'Toca para marcar como completada'}
                        </span>
                    </button>

                    {/* Campos adicionales cuando está marcada */}
                    {marcada && (
                        <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">

                            {/* Nota opcional */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">
                                    Observaciones <span className="font-normal text-slate-400">(opcional)</span>
                                </label>
                                <textarea
                                    rows={2}
                                    value={nota}
                                    onChange={(e) => setNota(e.target.value)}
                                    placeholder="Novedades o comentarios de la rutina…"
                                    className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 focus:border-marca-secundario transition-all"
                                />
                            </div>

                            {/* Evidencia opcional */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">
                                        Evidencia <span className="font-normal text-slate-400">(opcional)</span>
                                    </span>
                                    <span className="text-xs text-slate-400">{archivos.length}/{MAX_FOTOS}</span>
                                </div>

                                {archivos.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {archivos.map((item, idx) => (
                                            <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-200 group shadow-sm">
                                                <img src={item.preview} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleEliminar(idx)}
                                                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-estado-rechazado rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Icon name="close" size="xs" className="text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {archivos.length < MAX_FOTOS && (
                                    <>
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="image/jpeg, image/png, image/webp"
                                            multiple
                                            capture="environment"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileRef.current?.click()}
                                            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-marca-secundario hover:text-marca-secundario transition-colors cursor-pointer"
                                        >
                                            <Icon name="add_a_photo" size="sm" />
                                            Adjuntar foto
                                        </button>
                                    </>
                                )}
                            </div>
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
                    variant="guardar"
                    icon="task_alt"
                    isLoading={isSubmitting}
                    disabled={!marcada}
                    onClick={handleConfirmar}
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                    Marcar Completada
                </Button>
            </ModalFooter>
        </Modal>
    );
};