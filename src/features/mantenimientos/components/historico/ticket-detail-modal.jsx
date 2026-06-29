import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Icon, Button } from '@/components/ui/z_index';
import { TicketStatusBadge, TicketPriorityBadge } from './ticket-status-badge';
import { formatFecha, formatFechaHora } from '@/lib/date';
import { TicketTimeline } from './ticket-timeline';
import { useAuthStore } from '@/stores/auth-store';
import {
    getClasificacionIcon,
    getTipoStyle,
    getCategoriaInfo
} from '../constants';

// ── DataRow ────────────────────────────────────────────────────────────────
const DataRow = ({ icon, label, value, fallback = 'No registrado', colorClass = '' }) => (
    <div className="flex gap-2.5 items-start">
        <div className="mt-0.5 text-slate-400 shrink-0">
            <Icon name={icon} size="sm" />
        </div>
        <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">{label}</span>
            <span className={`text-xs font-semibold text-slate-800 wrap-break-word ${colorClass}`}>
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
        <div className="flex items-center gap-2 flex-wrap mt-2">
            {visible.map((url, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onExpand(i)}
                    className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/60 hover:border-white transition-all group shrink-0 cursor-pointer shadow-sm bg-black/10"
                >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                        <Icon name="zoom_in" size="sm" className="text-white opacity-0 group-hover:opacity-100 drop-shadow" />
                    </div>
                    {i === 3 && extra > 0 && (
                        <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                            <span className="text-white text-xs font-extrabold drop-shadow">+{extra}</span>
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
        cls: 'bg-slate-50 border-slate-200',
        iconCls: 'text-slate-500',
        textCls: 'text-slate-700',
        labelCls: 'text-slate-500',
        borderLeftCls: 'bg-slate-400'
    },
    RECHAZADO: {
        icon: 'report',
        label: 'Motivo del rechazo',
        cls: 'bg-red-50/70 border-red-100',
        iconCls: 'text-red-600',
        textCls: 'text-red-800',
        labelCls: 'text-red-600',
        borderLeftCls: 'bg-red-400'
    },
    RESUELTO: {
        icon: 'check_circle',
        label: 'Resolución del técnico',
        cls: 'bg-green-50/70 border-green-100',
        iconCls: 'text-green-600',
        textCls: 'text-green-800',
        labelCls: 'text-green-600',
        borderLeftCls: 'bg-green-500'
    },
    EN_PROGRESO: {
        icon: 'play_circle',
        label: 'Progreso registrado',
        cls: 'bg-purple-50/70 border-purple-100',
        iconCls: 'text-purple-600',
        textCls: 'text-purple-800',
        labelCls: 'text-purple-600',
        borderLeftCls: 'bg-purple-500'
    },
    CERRADO: {
        icon: 'lock',
        label: 'Nota de cierre',
        cls: 'bg-gray-50 border-gray-200',
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

    // 2. Extracción de Tiempo Manual
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
        <div className="flex flex-col gap-1.5 my-0.5">
            <div className="bg-white/70 px-3 py-2 rounded-lg border border-black/5 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${config.borderLeftCls}`}></div>
                <p className={`text-xs font-medium leading-relaxed ${isDefault ? 'text-slate-400 italic font-normal' : config.textCls}`}>
                    {cleanNota}
                </p>
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
                {timeBadge && (
                    <div className="flex items-center gap-1 bg-white border border-black/10 px-2 py-0.5 rounded shadow-sm animate-in zoom-in duration-300">
                        <Icon name="timer" size="xs" className="text-orange-500" fill />
                        <span className="text-[9px] font-black text-slate-700 uppercase tracking-tight">
                            {timeBadge} <span className="text-orange-600 ml-0.5">(Manual)</span>
                        </span>
                    </div>
                )}
                {isInspeccion && (
                    <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded shadow-sm animate-in zoom-in duration-300">
                        <Icon name="fact_check" size="xs" className="text-blue-600" fill />
                        <span className="text-[9px] font-black text-blue-700 uppercase tracking-tight">
                            Inspección
                        </span>
                    </div>
                )}
                {isRutina && (
                    <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shadow-sm animate-in zoom-in duration-300">
                        <Icon name="event_available" size="xs" className="text-emerald-600" fill />
                        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tight">
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
        <div className={`flex flex-col gap-2 p-3 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-300 ${config.cls}`}>
            <div className="flex items-center gap-1.5">
                <Icon name={config.icon} size="sm" className={config.iconCls} fill />
                <span className={`text-[9px] font-extrabold uppercase tracking-widest ${config.labelCls}`}>
                    {config.label}
                </span>
            </div>

            <ParsedNote notaRaw={nota} config={config} />

            {images.length > 0 && (
                <MiniImageGrid urls={images} onExpand={(i) => onImageExpand(images, i)} />
            )}

            {actor && (
                <div className="flex items-center gap-1.5 pt-1.5 mt-0.5 border-t border-black/5">
                    {actor.imagen ? (
                        <img
                            src={actor.imagen}
                            alt=""
                            className="w-4 h-4 rounded-full object-cover border border-white/50 shrink-0 shadow-sm"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-black/10">
                            <Icon name="person" size="xs" className={config.iconCls} />
                        </div>
                    )}
                    <span className={`text-[10px] font-bold ${config.textCls} opacity-90`}>
                        {actor.nombre}
                    </span>
                    {entry?.createdAt && (
                        <span className={`text-[9px] font-bold ${config.textCls} opacity-60 ml-auto shrink-0 tracking-wide uppercase`}>
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

    const originalFechaStr = ticket.fechaVencimientoOriginal ? formatFecha(ticket.fechaVencimientoOriginal) : '';
    const vencFechaStr = ticket.fechaVencimiento ? formatFecha(ticket.fechaVencimiento) : '';
    const tieneFechaModificada = Boolean(originalFechaStr && originalFechaStr !== vencFechaStr);

    const creador = ticket.creador;
    const responsables = ticket.responsables ?? [];
    const tieneHistorial = ticket.historial && ticket.historial.length > 0;
    const esTecnico = user?.rol === 'TECNICO';

    const entryResuelto = getContextualEntry(ticket.historial, 'RESUELTO');
    const fechaFinalizada = entryResuelto?.createdAt;

    // Detección de Tiempo Manual
    const esTiempoManual = Boolean(
        ticket.historial?.some(h => 
            h.esTiempoManual === true || 
            /\[TIEMPO_MANUAL:/i.test(h.nota || '')
        )
    );

    const handleImageExpand = (images, index) => setVisor({ images, index });

    // Determinar la etiqueta dinámica del creador
    const getCreadorLabel = () => {
        if (!creador) return "Reportado por";
        const esCreadorCliente = creador.rol === 'CLIENTE_INTERNO';
        const esTipoTicket = ticket.tipo === 'TICKET';
        return (esCreadorCliente && esTipoTicket) ? "Reportado por" : "Creado por";
    };

    const renderDetalleCreador = () => {
        if (!creador) return null;
        const esInterno = ['JEFE_MTTO', 'COORDINADOR_MTTO', 'SUPER_ADMIN'].includes(creador.rol);

        if (esInterno) {
            return (
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800 leading-tight">{creador.nombre}</span>
                    <span className="text-[9px] text-brand-dark/70 font-bold uppercase mt-0.5 tracking-wider">{creador.cargo || 'Mantenimiento'}</span>
                </div>
            );
        }

        return (
            <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 leading-tight">{creador.nombre}</span>
                {creador.cargo && <span className="text-[9px] text-slate-500 font-medium mt-0.5">{creador.cargo}</span>}
                {creador.telefono && <span className="text-[10px] text-slate-500 font-normal mt-0.5">{creador.telefono}</span>}
            </div>
        );
    };

    const isResolvedOrClosed = ticket.estado === 'RESUELTO' || ticket.estado === 'CERRADO';
    const esAtrasada = !!ticket.isOverdue;
    
    let statusRetraso = null;
    if (ticket.fechaVencimiento) {
        if (isResolvedOrClosed) {
            if (ticket.isLate) {
                statusRetraso = (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded uppercase shrink-0">
                        <Icon name="timer_off" size="xs" /> Entregada con Retraso
                    </span>
                );
            } else {
                statusRetraso = (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase shrink-0">
                        <Icon name="check_circle" size="xs" /> Entregada a Tiempo
                    </span>
                );
            }
        } else if (esAtrasada) {
            statusRetraso = (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-estado-rechazado bg-estado-rechazado/10 border border-estado-rechazado/20 px-1.5 py-0.5 rounded uppercase shrink-0">
                    <Icon name="warning" size="xs" /> Atrasada
                </span>
            );
        }
    }

    // Lógica comparativa de tiempos
    const renderComparativaTiempos = () => {
        const est = ticket.tiempoEstimado;
        const real = ticket.duracionReal;

        if (!est && !real) {
            return <span className="text-xs text-slate-400 italic">Sin registro de tiempos</span>;
        }

        let porcentajeDif = null;
        let diferenciaCls = 'text-slate-800';
        let badgeMetodo = null;

        if (real > 0) {
            badgeMetodo = (
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest border ${esTiempoManual ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {esTiempoManual ? 'Manual' : 'Medido por Sistema'}
                </span>
            );
        }

        if (est && real) {
            const diff = real - est;
            const pct = Math.round((diff / est) * 100);
            if (diff > 0) {
                porcentajeDif = `+${pct}% de lo estimado`;
                diferenciaCls = 'text-red-600 font-bold';
            } else if (diff < 0) {
                porcentajeDif = `${pct}% de lo estimado`;
                diferenciaCls = 'text-emerald-600 font-bold';
            } else {
                porcentajeDif = 'Exacto al estimado';
                diferenciaCls = 'text-emerald-600 font-bold';
            }
        }

        return (
            <div className="flex flex-col gap-2 bg-slate-50 border border-slate-200/60 rounded-lg p-2.5">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                        <span className="text-slate-500 font-medium block">Estimado:</span>
                        <span className="font-bold text-slate-700">{est ? `${est} min` : 'No especificado'}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 font-medium block">Real transcurrido:</span>
                        <span className={`font-bold ${diferenciaCls}`}>{real ? `${real} min` : 'Pendiente'}</span>
                    </div>
                </div>
                {(porcentajeDif || badgeMetodo) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
                        {badgeMetodo}
                        {porcentajeDif && (
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                                {porcentajeDif}
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                className={`transition-all duration-300 ease-in-out w-full ${mostrarHistorial ? 'md:max-w-5xl lg:max-w-6xl xl:max-w-[1300px]' : 'md:max-w-4xl lg:max-w-5xl'}`}
            >
                <ModalHeader title={`Ticket #${ticket.id}`} onClose={onClose} />

                <ModalBody className="p-4 md:p-5 overflow-y-auto max-h-[82vh]">
                    <div className="flex flex-col lg:flex-row gap-5 items-start">

                        {/* Panel izquierdo: Información Principal */}
                        <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
                            
                            {/* Metadata bar con etiquetas explícitas */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pb-3.5 border-b border-slate-200/80 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado:</span>
                                    <TicketStatusBadge estado={ticket.estado} />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prioridad:</span>
                                    <TicketPriorityBadge prioridad={ticket.prioridad} />
                                </div>
                                {ticket.tipo && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo:</span>
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border leading-none ${getTipoStyle(ticket.tipo)}`}>
                                            {ticket.tipo}
                                        </span>
                                    </div>
                                )}
                                {ticket.clasificacion && ticket.categoria === 'MAQUINARIA' && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clasificación:</span>
                                        <span className="inline-flex items-center gap-1 text-slate-800 font-bold text-xs uppercase">
                                            <Icon name={getClasificacionIcon(ticket.clasificacion)} size="xs" className="text-slate-500 shrink-0" />
                                            <span>{ticket.clasificacion}</span>
                                        </span>
                                    </div>
                                )}
                                {ticket.categoria && (() => {
                                    const catInfo = getCategoriaInfo(ticket.categoria);
                                    return (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoría:</span>
                                            <span className="inline-flex items-center gap-1 text-slate-700 font-bold text-xs uppercase">
                                                <Icon name={catInfo.icon} size="xs" className="text-slate-500 shrink-0" />
                                                <span>{catInfo.label}</span>
                                            </span>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Tarjeta de Título + Descripción + Indicador de Retraso/Alerta */}
                            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                                    <h3 className="text-base font-black text-slate-900 leading-snug">
                                        {ticket.titulo}
                                    </h3>
                                    {statusRetraso}
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                    {ticket.descripcion}
                                </p>
                            </div>

                            <ContextualBanner ticket={ticket} onImageExpand={handleImageExpand} />

                            {/* Fichas técnicas en grilla de 3 columnas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                
                                {/* Tarjeta 1: Ubicación */}
                                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-2">
                                    <h4 className="text-xs font-black text-slate-900 border-b border-slate-200/85 pb-1.5 flex items-center gap-1.5">
                                        <Icon name="location_on" size="xs" className="text-slate-500" />
                                        Ubicación
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <DataRow icon="factory" label="Planta" value={ticket.planta} />
                                        <DataRow icon="place" label="Área" value={ticket.area} />
                                    </div>
                                    {ticket.maquina && (
                                        <div className="pt-2 border-t border-slate-200/60">
                                            <DataRow 
                                                icon="precision_manufacturing" 
                                                label="Maquinaria" 
                                                value={`${ticket.maquina.codigo} - ${ticket.maquina.nombre}`} 
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Tarjeta 2: Personal */}
                                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-2">
                                    <h4 className="text-xs font-black text-slate-900 border-b border-slate-200/85 pb-1.5 flex items-center gap-1.5">
                                        <Icon name="group" size="xs" className="text-slate-500" />
                                        Personal
                                    </h4>
                                    <div className="space-y-3">
                                        <DataRow icon="person" label={getCreadorLabel()} value={renderDetalleCreador()} />
                                        <DataRow
                                            icon="engineering"
                                            label="Personal Asignado"
                                            value={responsables.length > 0 ? responsables.map(r => r.nombre).join(', ') : null}
                                            fallback="Sin asignar"
                                        />
                                    </div>
                                </div>

                                {/* Tarjeta 3: Tiempos y Control */}
                                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-2">
                                    <h4 className="text-xs font-black text-slate-900 border-b border-slate-200/85 pb-1.5 flex items-center gap-1.5">
                                        <Icon name="schedule" size="xs" className="text-slate-500" />
                                        Tiempos y Control
                                    </h4>
                                    <div className="space-y-2.5">
                                        <div className="grid grid-cols-2 gap-3">
                                            <DataRow icon="calendar_today" label="Creado" value={formatFechaHora(ticket.createdAt)} />
                                            <DataRow 
                                                icon="event" 
                                                label="Vence" 
                                                value={
                                                    ticket.fechaVencimiento ? (
                                                        <span className="inline-flex flex-wrap items-center gap-1.5">
                                                            <span className={esAtrasada ? 'text-red-600 font-extrabold' : ''}>
                                                                {vencFechaStr}
                                                            </span>
                                                            {tieneFechaModificada && (
                                                                <span className="text-[10px] font-normal text-slate-400 shrink-0">
                                                                    (Original: {originalFechaStr})
                                                                </span>
                                                            )}
                                                        </span>
                                                    ) : null
                                                } 
                                                fallback="Sin límite" 
                                            />
                                        </div>
                                        {fechaFinalizada && (
                                            <DataRow icon="task_alt" label="Finalizado" value={formatFechaHora(fechaFinalizada)} />
                                        )}
                                        {renderComparativaTiempos()}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Panel de Línea de Tiempo (Historial) - Se inyecta sin doble scrollbars ni constricciones y con espaciador automático */}
                        {mostrarHistorial && !esTecnico && (
                            <TicketTimeline historial={ticket.historial} responsables={responsables} />
                        )}

                    </div>
                </ModalBody>

                <ModalFooter className="flex justify-end gap-2 p-3 border-t border-slate-100">
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