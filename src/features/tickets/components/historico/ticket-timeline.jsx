import { useState } from 'react';
import { createPortal } from 'react-dom';
import { formatFechaHora } from '@/lib/date';
import { Icon, Modal } from '@/components/ui/z_index';
import { TicketStatusBadge } from './ticket-status-badge';

const ROL_LABEL = {
    SUPER_ADMIN: 'Super Admin',
    JEFE_MTTO: 'Jefe Mtto',
    COORDINADOR_MTTO: 'Coordinador',
    TECNICO: 'Técnico',
    CLIENTE_INTERNO: 'Cliente',
};

// ── Visor de imagen a pantalla completa ────────────────
const ImageViewer = ({ images, index, onClose, onNavigate }) => {
    const isOpen = index !== null && images?.length > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            // Anulamos la caja blanca del Modal estándar para volverlo Lightbox
            className="bg-transparent shadow-none w-full max-w-none h-full flex items-center justify-center p-0"
        >
            <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">

                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50 pointer-events-auto">
                    {images?.length > 1 ? (
                        <span className="text-white/80 text-sm font-bold bg-black/40 px-3 py-1 rounded-full drop-shadow">
                            {index + 1} / {images.length}
                        </span>
                    ) : <div />}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center justify-center shrink-0 w-10 h-10 text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors active:scale-90 cursor-pointer"
                    >
                        <Icon name="close" size="md" />
                    </button>
                </div>

                {/* Left Arrow */}
                {images?.length > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onNavigate((index - 1 + images.length) % images.length); }}
                        className="absolute left-2 md:left-6 text-white bg-black/40 hover:bg-black/60 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center z-50 active:scale-90 cursor-pointer transition-colors pointer-events-auto"
                    >
                        <Icon name="chevron_left" size="md" />
                    </button>
                )}

                {/* Imagen */}
                {isOpen && (
                    <img
                        key={index}
                        src={images[index]}
                        alt="Evidencia visual"
                        className="max-w-[95vw] max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    />
                )}

                {/* Right Arrow */}
                {images?.length > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onNavigate((index + 1) % images.length); }}
                        className="absolute right-2 md:right-6 text-white bg-black/40 hover:bg-black/60 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center z-50 active:scale-90 cursor-pointer transition-colors pointer-events-auto"
                    >
                        <Icon name="chevron_right" size="md" />
                    </button>
                )}
            </div>
        </Modal>
    );
};

// ── Mini galería de thumbnails ──────────────────────────────────────────────
const MiniImageGrid = ({ urls, onExpand }) => {
    if (!urls?.length) return null;
    const visible = urls.slice(0, 3);
    const extra = urls.length - 3;
    return (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {visible.map((url, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onExpand(i)}
                    className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 hover:border-marca-primario/60 hover:shadow-md transition-all group shrink-0 cursor-pointer bg-slate-100"
                >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Icon name="zoom_in" size="xs" className="text-white opacity-0 group-hover:opacity-100 drop-shadow" />
                    </div>
                    {i === 2 && extra > 0 && (
                        <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                            <span className="text-white text-xs font-extrabold drop-shadow">+{extra}</span>
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
};

// ── Entrada individual de la línea de tiempo ────────────────────────────────
const TimelineEntry = ({ h, isActual, isInicio, isLast, onExpand, responsables }) => {
    const isStateChange = h.estadoAnterior && h.estadoNuevo && h.estadoAnterior !== h.estadoNuevo;
    const isCreacion = h.tipo === 'CREACION' || !h.estadoAnterior;
    const imgUrls = h.imagenes
        ? h.imagenes.map(i => (typeof i === 'string' ? i : i?.url)).filter(Boolean)
        : [];

    // Limpieza agresiva de metadatos y strings crudos de auditoría del backend
    let cleanNota = h.nota || '';
    let timeBadge = null;
    let isRutina = false;
    let isInspeccion = false;

    // 1. Extracción de Tiempo Manual
    const manualTimeRegex = /\[TIEMPO_MANUAL:\s*([^\]]+)\]/i;
    const manualTimeMatch = cleanNota.match(manualTimeRegex);
    if (manualTimeMatch) {
        timeBadge = manualTimeMatch[1].trim();
        if (!timeBadge.toLowerCase().includes('min')) timeBadge += ' min';
        cleanNota = cleanNota.replace(manualTimeRegex, '').trim();
    }

    // 2. Extracción de Inspección/Rutina
    const inspeccionRegex = /\(Cierre automático por Inspección\)/i;
    if (inspeccionRegex.test(cleanNota)) {
        isInspeccion = true;
        cleanNota = cleanNota.replace(inspeccionRegex, '').trim();
    }

    const rutinaRegex = /\[RUTINA\]|\(Rutina Completada\)/i;
    if (rutinaRegex.test(cleanNota)) {
        isRutina = true;
        cleanNota = cleanNota.replace(rutinaRegex, '').trim();
    }

    // 3. Limpieza de otros metadatos
    cleanNota = cleanNota.replace(/Tiempo declarado manualmente:\s*\d+\s*minutos?/i, '');
    cleanNota = cleanNota.replace(/Cambio de estado:\s*[A-Z_]+\s*→\s*[A-Z_]+:?\s*/i, '');
    cleanNota = cleanNota.replace(/Edición \([A-Z_]+\):\s*/i, '');
    cleanNota = cleanNota.replace(/^[-:]\s*/, '').trim();

    return (
        <li className="relative flex gap-3 pb-5 last:pb-0">
            {/* Línea vertical conectora */}
            {!isLast && (
                <div className="absolute left-[13px] top-8 bottom-0 w-0.5 bg-slate-200 z-0" />
            )}

            {/* Dot */}
            <div className={`
                relative shrink-0 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center mt-0.5 z-10 shadow-sm
                ${isActual
                    ? 'bg-marca-primario ring-2 ring-marca-primario/25 ring-offset-1'
                    : isInicio
                        ? 'bg-emerald-500'
                        : 'bg-slate-300'
                }
            `}>
                <Icon
                    name={isActual ? 'radio_button_checked' : isInicio ? 'flag' : 'adjust'}
                    size="xs"
                    className="text-white"
                />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0 pt-0.5">
                {/* Etiquetas Estado actual / Creación */}
                {(isActual || (isInicio && !isActual)) && (
                    <div className="flex gap-1.5 mb-1.5">
                        {isActual && (
                            <span className="text-[9px] font-extrabold bg-marca-primario text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Estado actual
                            </span>
                        )}
                        {isInicio && !isActual && (
                            <span className="text-[9px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Creación
                            </span>
                        )}
                    </div>
                )}

                {/* Transición de estado */}
                {isStateChange ? (
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        <TicketStatusBadge estado={h.estadoAnterior} />
                        <Icon name="arrow_forward" size="xs" className="text-slate-400 shrink-0" />
                        <TicketStatusBadge estado={h.estadoNuevo} />
                    </div>
                ) : isCreacion ? (
                    <div className="flex flex-col gap-1.5 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                <Icon name="add_circle" size="xs" />
                                Ticket creado
                            </span>
                            {h.estadoNuevo && <TicketStatusBadge estado={h.estadoNuevo} />}
                        </div>
                        {responsables?.length > 0 && (
                            <div className="text-[11px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-1.5 rounded-md w-full break-words mt-1">
                                <span className="font-bold mr-1">Asignado a:</span>
                                <span className="leading-relaxed text-slate-500">
                                    {responsables.map(r => r.nombre).join(', ')}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 mb-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                            <Icon name="edit" size="xs" />
                            Actualización
                        </span>
                        {h.estadoNuevo && h.estadoNuevo === h.estadoAnterior && (
                            <TicketStatusBadge estado={h.estadoNuevo} />
                        )}
                    </div>
                )}

                {/* Nota */}
                {cleanNota && (
                    <p className="text-xs text-slate-600 bg-slate-50 border-l-2 border-slate-300 px-3 py-2 rounded-r-lg leading-relaxed mb-2 italic">
                        "{cleanNota}"
                    </p>
                )}

                {/* Badges Visuales para metadatos extraídos */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {timeBadge && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 text-[9px] font-bold uppercase">
                            <Icon name="timer" size="xs" />
                            {timeBadge} (Manual)
                        </span>
                    )}
                    {isInspeccion && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold uppercase">
                            <Icon name="fact_check" size="xs" />
                            Inspección
                        </span>
                    )}
                    {isRutina && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase">
                            <Icon name="event_available" size="xs" />
                            Rutina
                        </span>
                    )}
                </div>

                {/* Imágenes */}
                {imgUrls.length > 0 && (
                    <MiniImageGrid urls={imgUrls} onExpand={(i) => onExpand(imgUrls, i)} />
                )}

                {/* Actor + timestamp */}
                <div className="flex items-center gap-2 mt-2.5">
                    {h.usuario?.imagen ? (
                        <img
                            src={h.usuario.imagen}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <Icon name="person" size="xs" className="text-slate-400" />
                        </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] text-slate-700 font-semibold truncate">
                                {h.usuario?.nombre || 'Sistema'}
                            </span>
                            {h.usuario?.rol && (
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                                    {ROL_LABEL[h.usuario.rol] ?? h.usuario.rol}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                            {formatFechaHora(h.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        </li>
    );
};

// ── Componente principal ────────────────────────────────────────────────────
export const TicketTimeline = ({ historial, responsables = [] }) => {
    const [filtro, setFiltro] = useState('ESTADO');
    const [visor, setVisor] = useState({ images: [], index: null });

    if (!historial || historial.length === 0) return null;

    // historial viene ordenado desc (más reciente primero)
    const isEstadoChange = (h) => h.estadoAnterior && h.estadoNuevo && h.estadoAnterior !== h.estadoNuevo;
    const isCreacion = (h) => h.tipo === 'CREACION' || !h.estadoAnterior;

    const eventosVisibles = filtro === 'COMPLETO'
        ? historial
        : historial.filter(h => isCreacion(h) || isEstadoChange(h));

    const total = eventosVisibles.length;

    return (
        <>
            <div className="w-full lg:w-80 xl:w-96 shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col">

                {/* Header sticky */}
                <div className="px-4 pt-4 pb-3 border-b border-slate-100 bg-slate-50/60 shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Icon name="history" size="sm" className="text-marca-primario" />
                            Línea de Tiempo
                        </h4>
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                            {total} evento{total !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-slate-200/70 p-0.5 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setFiltro('ESTADO')}
                            className={`flex-1 text-[10px] uppercase tracking-wider font-extrabold py-1.5 rounded-md transition-all ${filtro === 'ESTADO' ? 'bg-white shadow-sm text-marca-primario' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Por estado
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltro('COMPLETO')}
                            className={`flex-1 text-[10px] uppercase tracking-wider font-extrabold py-1.5 rounded-md transition-all ${filtro === 'COMPLETO' ? 'bg-white shadow-sm text-marca-primario' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Completo
                        </button>
                    </div>
                </div>

                {/* Eventos */}
                <div className="overflow-y-auto flex-1 max-h-[55vh] px-4 py-4 custom-scrollbar">
                    {total === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-8 italic">
                            Sin eventos para este filtro.
                        </p>
                    ) : (
                        <ol className="flex flex-col">
                            {eventosVisibles.map((h, idx) => (
                                <TimelineEntry
                                    key={h.id}
                                    h={h}
                                    isActual={idx === 0}
                                    isInicio={idx === total - 1}
                                    isLast={idx === total - 1}
                                    onExpand={(imgs, i) => setVisor({ images: imgs, index: i })}
                                    responsables={(idx === total - 1) ? responsables : undefined}
                                />
                            ))}
                        </ol>
                    )}
                </div>
            </div>

            <ImageViewer
                images={visor.images}
                index={visor.index}
                onClose={() => setVisor({ images: [], index: null })}
                onNavigate={(i) => setVisor(prev => ({ ...prev, index: i }))}
            />
        </>
    );
};