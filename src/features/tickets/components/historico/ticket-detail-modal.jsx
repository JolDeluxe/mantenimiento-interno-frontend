import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Icon, Button } from '@/components/ui/z_index';
import { TicketStatusBadge, TicketPriorityBadge } from './ticket-status-badge';
import { formatFecha, formatFechaHora, isPastDate } from '@/lib/date';
import { TicketTimeline } from './ticket-timeline';
import { useAuthStore } from '@/stores/auth-store';

// ── DataRow ────────────────────────────────────────────────────────────────
const DataRow = ({ icon, label, value, fallback = 'No registrado' }) => (
    <div className="flex gap-3 items-start">
        <div className="mt-0.5 text-slate-400 shrink-0">
            <Icon name={icon} size="sm" />
        </div>
        <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="text-sm font-medium text-slate-800 mt-0.5 wrap-break-word">
                {value || <span className="text-slate-400 italic font-normal">{fallback}</span>}
            </span>
        </div>
    </div>
);

// ── Visor de imagen a pantalla completa (Usando Modal) ──────────────────────
const ImageViewer = ({ images, index, onClose, onNavigate }) => {
    const isOpen = index !== null && images?.length > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
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
                        className="absolute left-2 md:left-6 flex items-center justify-center shrink-0 w-10 h-10 md:w-12 md:h-12 text-white bg-black/40 hover:bg-black/60 rounded-full z-50 active:scale-90 cursor-pointer transition-colors pointer-events-auto"
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
                        className="absolute right-2 md:right-6 flex items-center justify-center shrink-0 w-10 h-10 md:w-12 md:h-12 text-white bg-black/40 hover:bg-black/60 rounded-full z-50 active:scale-90 cursor-pointer transition-colors pointer-events-auto"
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
    const visible = urls.slice(0, 4);
    const extra = urls.length - 4;
    return (
        <div className="flex items-center gap-2 flex-wrap mt-3">
            {visible.map((url, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onExpand(i)}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white/60 hover:border-white transition-all group shrink-0 cursor-pointer shadow-md bg-black/10"
                >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                        <Icon name="zoom_in" size="sm" className="text-white opacity-0 group-hover:opacity-100 drop-shadow" />
                    </div>
                    {i === 3 && extra > 0 && (
                        <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                            <span className="text-white text-sm font-extrabold drop-shadow">+{extra}</span>
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
};

// ── Configuración de banners contextuales por estado ───────────────────────
const ESTADO_CONTEXT_CONFIG = {
    EN_PAUSA: {
        icon: 'pause_circle',
        label: 'Motivo de la pausa',
        cls: 'bg-slate-100 border-slate-300',
        iconCls: 'text-slate-500',
        textCls: 'text-slate-700',
        labelCls: 'text-slate-500',
        borderLeftCls: 'bg-slate-400'
    },
    RECHAZADO: {
        icon: 'report',
        label: 'Motivo del rechazo',
        cls: 'bg-red-50 border-red-200',
        iconCls: 'text-red-600',
        textCls: 'text-red-800',
        labelCls: 'text-red-600',
        borderLeftCls: 'bg-red-400'
    },
    RESUELTO: {
        icon: 'check_circle',
        label: 'Resolución del técnico',
        cls: 'bg-green-50 border-green-200',
        iconCls: 'text-green-600',
        textCls: 'text-green-800',
        labelCls: 'text-green-600',
        borderLeftCls: 'bg-green-500'
    },
    EN_PROGRESO: {
        icon: 'play_circle',
        label: 'Progreso registrado',
        cls: 'bg-purple-50 border-purple-200',
        iconCls: 'text-purple-600',
        textCls: 'text-purple-800',
        labelCls: 'text-purple-600',
        borderLeftCls: 'bg-purple-500'
    },
    CERRADO: {
        icon: 'lock',
        label: 'Nota de cierre',
        cls: 'bg-gray-100 border-gray-300',
        iconCls: 'text-gray-600',
        textCls: 'text-gray-800',
        labelCls: 'text-gray-600',
        borderLeftCls: 'bg-gray-400'
    },
};

const EVIDENCIA_TIPO = {
    RESUELTO: 'EVIDENCIA_SOLUCION',
    RECHAZADO: 'EVIDENCIA_RECHAZO',
    CERRADO: 'EVIDENCIA_CIERRE',
    EN_PROGRESO: 'EVIDENCIA_AVANCE',
};

const getContextualEntry = (historial, estado) => {
    if (!historial?.length || !estado) return null;
    return historial.find(h => h.estadoNuevo === estado) ?? null;
};

const getContextualImages = (entry, ticket) => {
    if (entry?.imagenes?.length > 0) {
        return entry.imagenes.map(i => (typeof i === 'string' ? i : i?.url)).filter(Boolean);
    }
    const tipoFiltro = EVIDENCIA_TIPO[ticket?.estado];
    if (tipoFiltro && ticket?.imagenes?.length > 0) {
        return ticket.imagenes
            .filter(img => img.tipo === tipoFiltro)
            .map(img => img.url)
            .filter(Boolean);
    }
    return [];
};

const ParsedNote = ({ notaRaw, config }) => {
    if (!notaRaw) return null;

    let cleanNota = notaRaw;
    let timeBadge = null;
    let isRutina = false;
    let isInspeccion = false;

    // 1. Limpieza de cambios de estado técnicos
    const stateChangeRegex = /Cambio de estado:\s*[A-Z_]+\s*→\s*[A-Z_]+:?\s*/i;
    cleanNota = cleanNota.replace(stateChangeRegex, '').trim();

    // 2. Extracción de Tiempo Manual (Formatos variados: [TIEMPO_MANUAL:15] o [TIEMPO_MANUAL:15 min])
    const manualTimeRegex = /\[TIEMPO_MANUAL:\s*([^\]]+)\]/i;
    const manualTimeMatch = cleanNota.match(manualTimeRegex);
    if (manualTimeMatch) {
        timeBadge = manualTimeMatch[1].trim();
        if (!timeBadge.toLowerCase().includes('min')) timeBadge += ' min';
        cleanNota = cleanNota.replace(manualTimeRegex, '').trim();
    }

    // 3. Fallback para formato antiguo de tiempo
    const oldTimeRegex = /Tiempo declarado manualmente:\s*(\d+\s*minutos?)/i;
    const oldTimeMatch = cleanNota.match(oldTimeRegex);
    if (oldTimeMatch && !timeBadge) {
        timeBadge = oldTimeMatch[1];
        cleanNota = cleanNota.replace(oldTimeRegex, '').trim();
    }

    // 4. Extracción de Inspección/Rutina
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

    // Limpieza final de caracteres sobrantes
    cleanNota = cleanNota.replace(/^[-:]\s*/, '').trim();
    if (!cleanNota) cleanNota = "Sin observaciones adicionales";

    const isDefault = cleanNota === "Sin observaciones adicionales";

    return (
        <div className="flex flex-col gap-2.5 my-1">
            <div className="bg-white/60 px-4 py-3 rounded-xl border border-black/5 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${config.borderLeftCls}`}></div>
                <p className={`text-sm font-medium leading-relaxed ${isDefault ? 'text-slate-400 italic font-normal' : config.textCls}`}>
                    {cleanNota}
                </p>
            </div>

            <div className="flex flex-wrap gap-2 items-center mt-1">
                {timeBadge && (
                    <div className="flex items-center gap-1.5 bg-white border border-black/10 px-2.5 py-1 rounded-md shadow-sm animate-in zoom-in duration-300">
                        <Icon name="timer" size="sm" className="text-orange-500" fill />
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">
                            {timeBadge} <span className="text-orange-600 ml-0.5">(Manual)</span>
                        </span>
                    </div>
                )}
                {isInspeccion && (
                    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md shadow-sm animate-in zoom-in duration-300">
                        <Icon name="fact_check" size="sm" className="text-blue-600" fill />
                        <span className="text-[10px] font-black text-blue-700 uppercase tracking-tight">
                            Inspección
                        </span>
                    </div>
                )}
                {isRutina && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md shadow-sm animate-in zoom-in duration-300">
                        <Icon name="event_available" size="sm" className="text-emerald-600" fill />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">
                            Rutina
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

const ContextualBanner = ({ ticket, onImageExpand }) => {
    const config = ESTADO_CONTEXT_CONFIG[ticket.estado];
    if (!config) return null;

    const entry = getContextualEntry(ticket.historial, ticket.estado);
    const images = getContextualImages(entry, ticket);
    const nota = entry?.nota;
    const actor = entry?.usuario;

    if (!nota && images.length === 0) return null;

    return (
        <div className={`flex flex-col gap-3 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${config.cls}`}>
            <div className="flex items-center gap-2">
                <Icon name={config.icon} size="sm" className={config.iconCls} fill />
                <span className={`text-[10px] font-extrabold uppercase tracking-widest ${config.labelCls}`}>
                    {config.label}
                </span>
            </div>

            <ParsedNote notaRaw={nota} config={config} />

            {images.length > 0 && (
                <MiniImageGrid urls={images} onExpand={(i) => onImageExpand(images, i)} />
            )}

            {actor && (
                <div className="flex items-center gap-2 pt-2 mt-1 border-t border-black/5">
                    {actor.imagen ? (
                        <img
                            src={actor.imagen}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover border border-white/50 shrink-0 shadow-sm"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-black/10`}>
                            <Icon name="person" size="xs" className={config.iconCls} />
                        </div>
                    )}
                    <span className={`text-xs font-semibold ${config.textCls} opacity-90`}>
                        {actor.nombre}
                    </span>
                    {entry?.createdAt && (
                        <span className={`text-[10px] font-bold ${config.textCls} opacity-60 ml-auto shrink-0 tracking-wide uppercase`}>
                            {formatFechaHora(entry.createdAt)}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Modal principal ─────────────────────────────────────────────────────────
export const TicketDetailModal = ({ isOpen, onClose, ticket }) => {
    const { user } = useAuthStore();
    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const [visor, setVisor] = useState({ images: [], index: null });

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setMostrarHistorial(false);
                setVisor({ images: [], index: null });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!ticket) return null;

    const creador = ticket.creador;
    const responsables = ticket.responsables ?? [];
    const tieneHistorial = ticket.historial && ticket.historial.length > 0;
    const esTecnico = user?.rol === 'TECNICO';

    const entryResuelto = getContextualEntry(ticket.historial, 'RESUELTO');
    const fechaFinalizada = entryResuelto?.createdAt;

    // Detección mejorada de Tiempo Manual: Revisa el flag y también escanea las notas por tags
    const esTiempoManual = Boolean(
        ticket.historial?.some(h => 
            h.esTiempoManual === true || 
            /\[TIEMPO_MANUAL:/i.test(h.nota || '')
        )
    );

    const handleImageExpand = (images, index) => setVisor({ images, index });

    const renderDetalleCreador = () => {
        if (!creador) return null;
        const esInterno = ['JEFE', 'COORDINADOR', 'ADMIN'].includes(creador.rol?.toUpperCase());

        if (esInterno) {
            return (
                <div className="flex flex-col">
                    <span className="text-sm">{creador.nombre}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{creador.rol || 'Staff Interno'}</span>
                </div>
            );
        }

        return (
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">{creador.nombre}</span>
                {creador.email && <span className="text-xs text-slate-500 font-normal mt-0.5">{creador.email}</span>}
                {creador.telefono && <span className="text-xs text-slate-500 font-normal">{creador.telefono}</span>}
            </div>
        );
    };

    const isResolvedOrClosed = ticket.estado === 'RESUELTO' || ticket.estado === 'CERRADO';
    let statusRetraso = null;

    if (ticket.fechaVencimiento) {
        if (isResolvedOrClosed && fechaFinalizada) {
            const fVenc = new Date(ticket.fechaVencimiento).setHours(0, 0, 0, 0);
            const fFin = new Date(fechaFinalizada).setHours(0, 0, 0, 0);
            if (fFin > fVenc) {
                statusRetraso = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border bg-red-50 text-red-700 border-red-200 uppercase tracking-wide">
                        Entregada con Retraso
                    </span>
                );
            } else {
                statusRetraso = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border bg-green-50 text-green-700 border-green-200 uppercase tracking-wide">
                        Entregada a Tiempo
                    </span>
                );
            }
        } else if (!isResolvedOrClosed && isPastDate(ticket.fechaVencimiento)) {
            statusRetraso = (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border bg-red-100 text-red-800 border-red-300 uppercase tracking-wide">
                    Atrasada
                </span>
            );
        }
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                /* En desktop ampliamos el ancho del modal para que los paneles se acomoden sin compactarse, 
                   y quitamos toda atadura de altura para que el scroll nativo fluya si hace falta. */
                className={`transition-all duration-300 ease-in-out w-full ${mostrarHistorial ? 'md:max-w-5xl lg:max-w-[1100px]' : 'md:max-w-3xl lg:max-w-4xl'}`}
            >
                <ModalHeader title={`Detalle — #${ticket.id}`} onClose={onClose} />

                {/* Quitamos los bloqueos y restauramos el comportamiento estándar */}
                <ModalBody>
                    <div className="flex flex-col lg:flex-row gap-8 items-start">

                        {/* Panel izquierdo: información principal */}
                        <div className="flex-1 w-full min-w-0 flex flex-col gap-5">

                            <div className="flex flex-wrap items-center gap-2">
                                <TicketStatusBadge estado={ticket.estado} />
                                <TicketPriorityBadge prioridad={ticket.prioridad} />
                                {ticket.tipo && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border bg-slate-100 text-slate-600 border-slate-200 uppercase tracking-wide">
                                        {ticket.tipo}
                                    </span>
                                )}
                                {statusRetraso}
                            </div>

                            <ContextualBanner ticket={ticket} onImageExpand={handleImageExpand} />

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-3">
                                    {ticket.titulo}
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                    {ticket.descripcion}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                                        <Icon name="location_on" size="sm" className="text-marca-primario" />
                                        Ubicación
                                    </h4>
                                    <DataRow icon="factory" label="Planta" value={ticket.planta} />
                                    <DataRow icon="place" label="Área" value={ticket.area} />
                                    <DataRow icon="category" label="Clasificación" value={ticket.clasificacion} />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                                        <Icon name="group" size="sm" className="text-marca-primario" />
                                        Personal
                                    </h4>
                                    <DataRow icon="person" label="Reportado por" value={renderDetalleCreador()} />
                                    <DataRow
                                        icon="engineering"
                                        label="Técnico(s) asignado(s)"
                                        value={responsables.length > 0 ? responsables.map(r => r.nombre).join(', ') : null}
                                        fallback="Sin asignar"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                                        <Icon name="schedule" size="sm" className="text-marca-primario" />
                                        Tiempos
                                    </h4>
                                    <DataRow icon="calendar_today" label="Creado" value={formatFechaHora(ticket.createdAt)} />
                                    {fechaFinalizada && (
                                        <DataRow icon="task_alt" label="Finalizado" value={formatFechaHora(fechaFinalizada)} />
                                    )}
                                    <DataRow icon="event" label="Vencimiento" value={formatFecha(ticket.fechaVencimiento)} fallback="Sin fecha límite" />
                                    <DataRow icon="timer" label="Tiempo estimado" value={ticket.tiempoEstimado ? `${ticket.tiempoEstimado} min` : null} fallback="No especificado" />

                                    <DataRow
                                        icon="hourglass_bottom"
                                        label="Tiempo real"
                                        value={ticket.duracionReal ? (
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={
                                                    ticket.tiempoEstimado
                                                        ? (ticket.duracionReal > ticket.tiempoEstimado ? 'text-red-600 font-bold' : 'text-green-600 font-bold')
                                                        : 'text-slate-800 font-bold'
                                                }>
                                                    {ticket.duracionReal} min
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest border ${esTiempoManual ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                    {esTiempoManual ? 'Manual' : 'Automático'}
                                                </span>
                                            </div>
                                        ) : null}
                                        fallback="Sin registro"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Panel derecho: línea de tiempo condicional. Fluye naturalmente de arriba hacia abajo sin scrollbars internos forzados. */}
                        {mostrarHistorial && !esTecnico && (
                            <div className="w-full lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-6">
                                <TicketTimeline historial={ticket.historial} responsables={responsables} />
                            </div>
                        )}

                    </div>
                </ModalBody>

                <ModalFooter className="flex justify-end w-full">
                    {tieneHistorial && !esTecnico && (
                        <Button
                            variant="accion"
                            size="sm"
                            icon={mostrarHistorial ? 'visibility_off' : 'history'}
                            onClick={() => setMostrarHistorial(prev => !prev)}
                        >
                            {mostrarHistorial ? 'Ocultar línea de tiempo' : 'Ver línea de tiempo'}
                        </Button>
                    )}
                </ModalFooter>
            </Modal>

            <ImageViewer
                images={visor.images}
                index={visor.index}
                onClose={() => setVisor({ images: [], index: null })}
                onNavigate={(i) => setVisor(prev => ({ ...prev, index: i }))}
            />
        </>
    );
};