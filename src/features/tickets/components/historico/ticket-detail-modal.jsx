import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Icon, Button } from '@/components/ui/z_index';
import { TicketStatusBadge, TicketPriorityBadge } from './ticket-status-badge';
import { formatFecha, formatFechaHora } from '@/lib/date';
import { TicketTimeline } from './ticket-timeline';

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
        iconCls: 'text-estado-en-pausa',
        textCls: 'text-slate-700',
        labelCls: 'text-slate-500',
    },
    RECHAZADO: {
        icon: 'report',
        label: 'Motivo del rechazo',
        cls: 'bg-red-50 border-red-200',
        iconCls: 'text-estado-rechazado',
        textCls: 'text-red-800',
        labelCls: 'text-red-500',
    },
    RESUELTO: {
        icon: 'check_circle',
        label: 'Resolución del técnico — esperando tu validación',
        cls: 'bg-violet-50 border-violet-200',
        iconCls: 'text-estado-resuelto',
        textCls: 'text-violet-800',
        labelCls: 'text-violet-500',
    },
    EN_PROGRESO: {
        icon: 'play_circle',
        label: 'Progreso registrado',
        cls: 'bg-blue-50 border-blue-200',
        iconCls: 'text-estado-asignada',
        textCls: 'text-blue-800',
        labelCls: 'text-blue-500',
    },
    CERRADO: {
        icon: 'lock',
        label: 'Nota de cierre',
        cls: 'bg-emerald-50 border-emerald-200',
        iconCls: 'text-estado-resuelto',
        textCls: 'text-emerald-800',
        labelCls: 'text-emerald-500',
    },
};

// Tipo de evidencia por estado
const EVIDENCIA_TIPO = {
    RESUELTO: 'EVIDENCIA_SOLUCION',
    RECHAZADO: 'EVIDENCIA_RECHAZO',
    CERRADO: 'EVIDENCIA_CIERRE',
    EN_PROGRESO: 'EVIDENCIA_AVANCE',
};

// Obtiene la entrada de historial más reciente que transicionó AL estado actual
const getContextualEntry = (historial, estado) => {
    if (!historial?.length || !estado) return null;
    return historial.find(h => h.estadoNuevo === estado) ?? null;
};

// Extrae URLs de imágenes: primero desde la entrada de historial, luego desde ticket.imagenes
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

// ── Banner contextual ───────────────────────────────────────────────────────
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
            {/* Cabecera */}
            <div className="flex items-center gap-2">
                <Icon name={config.icon} size="sm" className={config.iconCls} fill />
                <span className={`text-[10px] font-extrabold uppercase tracking-widest ${config.labelCls}`}>
                    {config.label}
                </span>
            </div>

            {/* Nota */}
            {nota && (
                <p className={`text-sm font-medium leading-relaxed ${config.textCls} italic`}>
                    "{nota}"
                </p>
            )}

            {/* Imágenes */}
            {images.length > 0 && (
                <MiniImageGrid urls={images} onExpand={(i) => onImageExpand(images, i)} />
            )}

            {/* Actor que realizó la acción */}
            {actor && (
                <div className="flex items-center gap-2 pt-1 border-t border-black/5">
                    {actor.imagen ? (
                        <img
                            src={actor.imagen}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover border border-white/50 shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-black/10`}>
                            <Icon name="person" size="xs" className={config.iconCls} />
                        </div>
                    )}
                    <span className={`text-xs font-semibold ${config.textCls} opacity-80`}>
                        {actor.nombre}
                    </span>
                    {entry?.createdAt && (
                        <span className={`text-[10px] ${config.textCls} opacity-50 ml-auto shrink-0`}>
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
    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const [visor, setVisor] = useState({ images: [], index: null });

    // Cierra la línea de tiempo siempre que se abra un nuevo ticket
    useEffect(() => {
        if (!isOpen) {
            // Respetamos los 300ms de la animación de salida del modal antes de desmontar el historial
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

    const handleImageExpand = (images, index) => setVisor({ images, index });

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                className={`transition-all duration-300 ease-in-out w-full ${mostrarHistorial ? 'md:max-w-5xl lg:max-w-300' : 'md:max-w-3xl lg:max-w-4xl'}`}
            >
                <ModalHeader title={`Detalle — #${ticket.id}`} onClose={onClose} />

                <ModalBody>
                    <div className="flex flex-col lg:flex-row gap-8 items-start">

                        {/* Panel izquierdo: información principal */}
                        <div className="flex-1 w-full min-w-0 flex flex-col gap-5">

                            {/* Badges de estado / prioridad / tipo */}
                            <div className="flex flex-wrap items-center gap-2">
                                <TicketStatusBadge estado={ticket.estado} />
                                <TicketPriorityBadge prioridad={ticket.prioridad} />
                                {ticket.tipo && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border bg-slate-100 text-slate-600 border-slate-200 uppercase tracking-wide">
                                        {ticket.tipo}
                                    </span>
                                )}
                            </div>

                            {/* Banner contextual basado en estado */}
                            <ContextualBanner ticket={ticket} onImageExpand={handleImageExpand} />

                            {/* Descripción */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-3">
                                    {ticket.titulo}
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                    {ticket.descripcion}
                                </p>
                            </div>

                            {/* Grid de datos: ubicación / personal / tiempos */}
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
                                    <DataRow icon="person" label="Reportado por" value={creador?.nombre} />
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
                                    <DataRow icon="event" label="Vencimiento" value={formatFecha(ticket.fechaVencimiento)} fallback="Sin fecha límite" />
                                    <DataRow icon="timer" label="Tiempo estimado" value={ticket.tiempoEstimado ? `${ticket.tiempoEstimado} min` : null} fallback="No especificado" />
                                    <DataRow icon="hourglass_bottom" label="Tiempo real" value={ticket.duracionReal ? `${ticket.duracionReal} min` : null} fallback="Sin registro" />
                                </div>

                            </div>
                        </div>

                        {/* Panel derecho: línea de tiempo condicional */}
                        {mostrarHistorial && <TicketTimeline historial={ticket.historial} responsables={responsables} />}

                    </div>
                </ModalBody>

                <ModalFooter className="flex justify-end w-full">
                    {tieneHistorial && (
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