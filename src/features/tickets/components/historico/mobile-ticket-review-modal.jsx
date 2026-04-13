// src/features/tickets/components/historico/mobile-ticket-review-modal.jsx
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Label, Input } from '@/components/form/z_index';
import { isPastDate, formatFechaHora } from '@/lib/date';
import { cn } from '@/utils/cn';

// Helper local para formatear los minutos del sistema
const formatMins = (mins) => {
    if (!mins) return '0 min';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h} h ${m} min` : `${h} h`;
};

const NativeImageStack = ({ images, onExpand, sensitivity = 50 }) => {
    const [stack, setStack] = useState(() => images.map((url, i) => ({ id: i, originalIndex: i, url })));
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const startPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        setStack(images.map((url, i) => ({ id: i, originalIndex: i, url })));
    }, [images]);

    const handleStart = (clientX, clientY) => {
        startPos.current = { x: clientX, y: clientY };
        setIsDragging(true);
    };

    const handleMove = (clientX, clientY) => {
        if (!isDragging) return;
        setDragPos({
            x: clientX - startPos.current.x,
            y: clientY - startPos.current.y,
        });
    };

    const handleEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        if (Math.abs(dragPos.x) > sensitivity || Math.abs(dragPos.y) > sensitivity) {
            setStack(prev => {
                const newStack = [...prev];
                const top = newStack.shift();
                newStack.push(top);
                return newStack;
            });
        }
        setDragPos({ x: 0, y: 0 });
    };

    if (!stack.length) return null;

    return (
        <div className="relative w-48 h-48 sm:w-52 sm:h-52 mx-auto my-6 select-none touch-none">
            {stack.map((card, index) => {
                const isTop = index === 0;

                // Lógica de arrastre plano sin alteración de escala
                const rotateZ = isTop && isDragging ? (dragPos.x * 0.05) : index * 4;
                const scale = 1 - (index * 0.06);

                const x = isTop && isDragging ? dragPos.x : 0;
                const y = isTop && isDragging ? dragPos.y : 0;

                return (
                    <div
                        key={card.id}
                        className={`absolute inset-0 rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white group ${isTop ? 'cursor-grab active:cursor-grabbing touch-none' : 'pointer-events-none'}`}
                        style={{
                            zIndex: stack.length - index,
                            transformOrigin: '90% 90%',
                            transform: `translate(${x}px, ${y}px) scale(${scale}) rotateZ(${rotateZ}deg)`,
                            transition: isDragging && isTop ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            willChange: 'transform'
                        }}
                        onTouchStart={(e) => isTop && handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                        onTouchMove={(e) => isTop && handleMove(e.touches[0].clientX, e.touches[0].clientY)}
                        onTouchEnd={() => isTop && handleEnd()}

                        onMouseDown={(e) => isTop && handleStart(e.clientX, e.clientY)}
                        onMouseMove={(e) => isTop && handleMove(e.clientX, e.clientY)}
                        onMouseUp={() => isTop && handleEnd()}
                        onMouseLeave={() => isTop && handleEnd()}

                        onClick={() => {
                            if (isTop && Math.abs(dragPos.x) < 5 && Math.abs(dragPos.y) < 5) {
                                onExpand(card.originalIndex);
                            }
                        }}
                    >
                        <img
                            src={card.url}
                            alt={`Evidencia ${index}`}
                            className="w-full h-full object-cover pointer-events-none"
                            draggable={false}
                        />

                        {isTop && !isDragging && (
                            <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                <div className="opacity-0 md:group-hover:opacity-100 bg-white/90 backdrop-blur text-slate-800 p-3 rounded-full shadow-lg transition-opacity">
                                    <Icon name="zoom_in" size="sm" />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {stack.length > 1 && (
                <div className="absolute -bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        Arrastra para pasar
                    </span>
                </div>
            )}
        </div>
    );
};

export const MobileTicketReviewModal = ({
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
    const actorResolucion = resolucion?.usuario || resolucion?.actor || null;
    const fechaResolucion = resolucion?.createdAt || null;

    // Lógica DTO: El frontend es ciego, obedece al boolean de la Base de Datos
    const isManual = Boolean(resolucion?.esTiempoManual);
    const tiempoAMostrar = formatMins(ticket?.duracionReal || 0);

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
                    title={`Resolución — #${ticket.id}`}
                    onClose={() => !isSubmitting && onClose()}
                />
                <ModalBody>
                    <div className="flex flex-col gap-6">

                        {isPastDate(ticket?.fechaVencimiento) && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm">
                                <Icon name="warning" size="sm" className="shrink-0 mt-0.5" />
                                <p><strong>¡Aviso de Retraso!</strong> Esta tarea fue entregada por el técnico <strong>fuera de tiempo</strong> según su fecha de vencimiento.</p>
                            </div>
                        )}

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Detalles del ticket</p>
                            <p className="text-sm font-semibold text-slate-800 leading-snug">{ticket.titulo}</p>
                            {ticket.responsables?.length > 0 && (
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                                    <Icon name="engineering" size="xs" className="text-blue-500" />
                                    {ticket.responsables.map((r) => r.nombre).join(', ')}
                                </p>
                            )}
                        </div>

                        {(notaTecnico || imagenesEvidenciaUrls?.length > 0 || actorResolucion) && (
                            <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 shadow-sm">
                                <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Icon name="info" size="xs" /> Evidencia del Técnico
                                </p>

                                {/* Banner Indicador de Tiempo (Manual vs Sistema) Adaptado a Móvil */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", isManual ? "bg-amber-100" : "bg-blue-100")}>
                                            <Icon name={isManual ? "edit_note" : "timer"} size="sm" className={isManual ? "text-amber-600" : "text-blue-600"} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                Tiempo total
                                            </span>
                                            <span className="text-sm font-extrabold font-mono text-slate-700">
                                                {tiempoAMostrar}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={cn("px-2 py-1 rounded text-[9px] font-extrabold uppercase tracking-wider text-center self-start sm:self-auto", isManual ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-600 border border-blue-100")}>
                                        {isManual ? 'Registro Manual' : 'Medido por Sistema'}
                                    </div>
                                </div>

                                {notaTecnico && (
                                    <div className="relative mb-4">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-300 rounded-l-md"></div>
                                        <p className="text-sm text-slate-700 italic bg-white p-3 pl-4 rounded-md border border-slate-100 shadow-sm leading-relaxed">
                                            "{notaTecnico}"
                                        </p>
                                    </div>
                                )}

                                {imagenesEvidenciaUrls?.length > 0 && (
                                    <div className="flex flex-col items-center pb-2">
                                        <NativeImageStack
                                            images={imagenesEvidenciaUrls}
                                            onExpand={(originalIndex) => setPreviewIndex(originalIndex)}
                                        />
                                    </div>
                                )}

                                {/* Perfil de Actor que resolvió */}
                                {actorResolucion && (
                                    <div className="flex items-center gap-2 pt-3 mt-1 border-t border-blue-200/50">
                                        {actorResolucion.imagen ? (
                                            <img
                                                src={actorResolucion.imagen}
                                                alt=""
                                                className="w-6 h-6 rounded-full object-cover border border-white shrink-0 shadow-sm"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
                                                <Icon name="person" size="xs" />
                                            </div>
                                        )}
                                        <span className="text-xs font-semibold text-slate-700 opacity-90">
                                            {actorResolucion.nombre}
                                        </span>
                                        {fechaResolucion && (
                                            <span className="text-[10px] font-bold text-slate-500 opacity-80 ml-auto shrink-0 tracking-wide uppercase">
                                                {formatFechaHora(fechaResolucion)}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <Label error={!!error}>Decisión de conformidad *</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setDecision('RECHAZADO'); setError(null); }}
                                    disabled={isSubmitting}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all shadow-sm
                                        ${decision === 'RECHAZADO'
                                            ? 'bg-red-50/50 border-red-500 text-red-700'
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-red-300'
                                        }`}
                                >
                                    <Icon name="cancel" size="lg" fill={decision === 'RECHAZADO'} />
                                    <span className="text-xs font-bold uppercase tracking-wide">Rechazar</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setDecision('CERRADO'); setError(null); }}
                                    disabled={isSubmitting}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all shadow-sm
                                        ${decision === 'CERRADO'
                                            ? 'bg-emerald-50/50 border-emerald-500 text-emerald-700'
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'
                                        }`}
                                >
                                    <Icon name="check_circle" size="lg" fill={decision === 'CERRADO'} />
                                    <span className="text-xs font-bold uppercase tracking-wide">Aprobar</span>
                                </button>
                            </div>
                            {error && <p className="text-xs text-red-600 font-bold mt-1 animate-in slide-in-from-top-1">{error}</p>}
                        </div>

                        <div className="flex flex-col gap-1.5 pb-4">
                            <Label htmlFor="rev-nota">
                                {decision === 'RECHAZADO' ? 'Motivo del rechazo *' : 'Comentarios finales (opcional)'}
                            </Label>
                            <Input
                                id="rev-nota"
                                multiline
                                value={nota}
                                onChange={(e) => setNota(e.target.value)}
                                placeholder={
                                    decision === 'RECHAZADO'
                                        ? 'Explica qué debe corregir el técnico...'
                                        : 'Añade una nota para el historial...'
                                }
                                disabled={isSubmitting}
                            />
                        </div>

                    </div>
                </ModalBody>
                <ModalFooter>
                    <div className="w-full flex gap-3">
                        <div className="flex-1">
                            <Button className="w-full" variant="cancelar" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                        </div>
                        <div className="flex-1">
                            <Button
                                className="w-full"
                                variant={decision === 'RECHAZADO' ? 'borrar' : 'guardar'}
                                icon={decision === 'RECHAZADO' ? 'cancel' : 'check_circle'}
                                isLoading={isSubmitting}
                                onClick={handleSubmit}
                            >
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </ModalFooter>
            </Modal>

            {previewIndex !== null && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] flex flex-col bg-black animate-in fade-in duration-200">

                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
                        <span className="text-white font-medium text-sm drop-shadow-md">
                            {previewIndex + 1} de {imagenesEvidenciaUrls.length}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPreviewIndex(null)}
                            className="text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors active:scale-95"
                        >
                            <Icon name="close" size="md" />
                        </button>
                    </div>

                    <div className="flex-1 w-full h-full flex items-center justify-center relative touch-none">
                        <img
                            key={previewIndex}
                            src={imagenesEvidenciaUrls[previewIndex]}
                            alt={`Evidencia ampliada`}
                            className="w-full h-full object-contain animate-in zoom-in-95 duration-200"
                        />

                        {imagenesEvidenciaUrls.length > 1 && (
                            <>
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
                                    onClick={() => setPreviewIndex((prev) => (prev - 1 + imagenesEvidenciaUrls.length) % imagenesEvidenciaUrls.length)}
                                />
                                <div
                                    className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
                                    onClick={() => setPreviewIndex((prev) => (prev + 1) % imagenesEvidenciaUrls.length)}
                                />
                            </>
                        )}
                    </div>

                    {imagenesEvidenciaUrls.length > 1 && (
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 z-10">
                            <button
                                type="button"
                                className="text-white bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 transition-all shadow-lg"
                                onClick={() => setPreviewIndex((prev) => (prev - 1 + imagenesEvidenciaUrls.length) % imagenesEvidenciaUrls.length)}
                            >
                                <Icon name="chevron_left" size="xl" />
                            </button>
                            <button
                                type="button"
                                className="text-white bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 transition-all shadow-lg"
                                onClick={() => setPreviewIndex((prev) => (prev + 1) % imagenesEvidenciaUrls.length)}
                            >
                                <Icon name="chevron_right" size="xl" />
                            </button>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </>
    );
};