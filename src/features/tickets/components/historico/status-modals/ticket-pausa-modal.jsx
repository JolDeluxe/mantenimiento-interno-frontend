// src/features/tickets/components/historico/status-modals/ticket-pausa-modal.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

// ── Constantes de Tiempo ───────────────────────────────────────────────────
const MIN_TECNICO = 5;
const MAX_EXTRA_ESTIMADO = 60;
const MAX_SIN_ESTIMADO = 480;

// ── Utilidades de tiempo ───────────────────────────────────────────────────
const calcElapsedMins = (ticket) => {
    const acumulado = ticket.duracionReal || 0;
    const abierto = ticket.intervalos?.find((i) => !i.fin);
    if (!abierto) return acumulado;
    const mins = Math.max(0, Math.floor(
        (Date.now() - new Date(abierto.inicio).getTime()) / 60000
    ));
    return acumulado + mins;
};

const formatMins = (mins) => {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h} h ${m} min` : `${h} h`;
};

const evaluarTiempo = (mins, tiempoEstimado) => {
    if (mins < MIN_TECNICO) {
        return {
            alerta: true,
            tipo: 'bajo',
            mensaje: `El tiempo detectado es de solo ${formatMins(mins)}, por debajo del mínimo técnico.`,
        };
    }
    if (tiempoEstimado && mins > tiempoEstimado + MAX_EXTRA_ESTIMADO) {
        return {
            alerta: true,
            tipo: 'alto',
            mensaje: `El tiempo (${formatMins(mins)}) supera en más de 1 h el estimado de ${formatMins(tiempoEstimado)}.`,
        };
    }
    if (!tiempoEstimado && mins > MAX_SIN_ESTIMADO) {
        return {
            alerta: true,
            tipo: 'alto',
            mensaje: `El tiempo registrado (${formatMins(mins)}) es inusualmente alto.`,
        };
    }
    return { alerta: false };
};

// ── Sub-componente: Selector de tiempo ─────────────────────────────────────
const TimePicker = ({ totalMins, onChange }) => {
    const horas = Math.floor(totalMins / 60);
    const minutos = totalMins % 60;

    const selectCls =
        'border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 appearance-none cursor-pointer';

    return (
        <div className="flex items-end gap-4">
            <div className="flex flex-col gap-1.5 items-center">
                <select
                    value={horas}
                    onChange={(e) => onChange(Number(e.target.value) * 60 + minutos)}
                    className={selectCls}
                >
                    {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{i} h</option>
                    ))}
                </select>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horas</span>
            </div>

            <span className="text-2xl text-slate-300 font-thin pb-5">:</span>

            <div className="flex flex-col gap-1.5 items-center">
                <select
                    value={minutos}
                    onChange={(e) => onChange(horas * 60 + Number(e.target.value))}
                    className={selectCls}
                >
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                        <option key={m} value={m}>{String(m).padStart(2, '0')} min</option>
                    ))}
                </select>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minutos</span>
            </div>

            {totalMins > 0 && (
                <div className="pb-5">
                    <span className="text-sm font-bold text-marca-primario font-mono">
                        = {formatMins(totalMins)}
                    </span>
                </div>
            )}
        </div>
    );
};

// ── Sub-componente: Sección de evidencias ────────────────────────────────
const EvidenceSection = ({ archivos, onAgregar, onEliminar }) => {
    const fileRef = useRef(null);
    const MAX_FOTOS = 5;

    const handleFileChange = (e) => {
        const nuevos = Array.from(e.target.files || []).slice(0, MAX_FOTOS - archivos.length);
        const items = nuevos.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        onAgregar(items);
        e.target.value = '';
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Icon name="photo_camera" size="sm" className="text-slate-400" />
                    Evidencia fotográfica
                    <span className="text-xs font-normal text-slate-400">(opcional)</span>
                </span>
                <span className={cn(
                    'text-xs font-bold tabular-nums',
                    archivos.length >= MAX_FOTOS ? 'text-estado-rechazado' : 'text-slate-400'
                )}>
                    {archivos.length}/{MAX_FOTOS}
                </span>
            </div>

            {archivos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {archivos.map((item, idx) => (
                        <div
                            key={idx}
                            className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 group shadow-sm"
                        >
                            <img
                                src={item.preview}
                                alt={`Evidencia ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <button
                                type="button"
                                onClick={() => onEliminar(idx)}
                                className="absolute top-1 right-1 w-5 h-5 bg-estado-rechazado rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
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
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-marca-secundario hover:text-marca-secundario transition-colors cursor-pointer"
                    >
                        <Icon name="add_a_photo" size="sm" />
                        {archivos.length === 0 ? 'Agregar evidencia' : 'Agregar más fotos'}
                    </button>
                </>
            )}
        </div>
    );
};

// ── Componente Principal ─────────────────────────────────────────────────
export const TicketPausaModal = ({
    isOpen,
    onClose,
    ticket,
    isSubmitting,
    onConfirm,
}) => {
    const [accion, setAccion] = useState(null); // 'reanudar' | 'resolver' | null

    // Estados para Reanudar
    const [nota, setNota] = useState('');

    // Estados para Resolver
    const [archivos, setArchivos] = useState([]);
    const [notaResolver, setNotaResolver] = useState('');
    const [elapsedMins, setElapsedMins] = useState(0);
    const [evaluacion, setEvaluacion] = useState(null);
    const [timePhase, setTimePhase] = useState('confirmado');
    const [tiempoManualMins, setTiempoManualMins] = useState(0);

    // Limpieza de Object URLs
    useEffect(() => {
        return () => {
            archivos.forEach((item) => URL.revokeObjectURL(item.preview));
        };
    }, [archivos]);

    useEffect(() => {
        if (isOpen) {
            setAccion(null);
            setNota('');
            setNotaResolver('');
            setArchivos([]);
            setEvaluacion(null);
            setTimePhase('confirmado');
            setTiempoManualMins(0);
        }
    }, [isOpen]);

    if (!ticket) return null;

    const obtenerTiempoEnPausa = () => {
        const ahora = Date.now();
        const ultimoIntervalo = ticket.intervalos
            ?.filter((i) => i.fin)
            .sort((a, b) => new Date(b.fin) - new Date(a.fin))[0];

        if (!ultimoIntervalo) return null;

        const minsEnPausa = Math.floor(
            (ahora - new Date(ultimoIntervalo.fin).getTime()) / 60000
        );
        if (minsEnPausa < 1) return 'Recién pausado';
        if (minsEnPausa < 60) return `${minsEnPausa} min en pausa`;
        const h = Math.floor(minsEnPausa / 60);
        const m = minsEnPausa % 60;
        return m > 0 ? `${h} h ${m} min en pausa` : `${h} h en pausa`;
    };

    const tiempoPausa = obtenerTiempoEnPausa();

    // Handlers
    const handleSelectReanudar = () => {
        if (accion === 'reanudar') {
            setAccion(null);
        } else {
            setAccion('reanudar');
            setNota('');
        }
    };

    const handleSelectResolver = () => {
        if (accion === 'resolver') {
            setAccion(null);
            return;
        }
        setAccion('resolver');
        const mins = calcElapsedMins(ticket);
        setElapsedMins(mins);
        const ev = evaluarTiempo(mins, ticket.tiempoEstimado);
        setEvaluacion(ev);
        if (ev.alerta) {
            setTimePhase('preguntando');
        } else {
            setTimePhase('confirmado');
        }
    };

    const handleAgregar = useCallback((items) => {
        setArchivos((prev) => [...prev, ...items].slice(0, 5));
    }, []);

    const handleEliminar = useCallback((idx) => {
        setArchivos((prev) => {
            const copia = [...prev];
            URL.revokeObjectURL(copia[idx].preview);
            copia.splice(idx, 1);
            return copia;
        });
    }, []);

    const handleConfirmar = () => {
        const fd = new FormData();

        if (accion === 'reanudar') {
            fd.append('estado', 'EN_PROGRESO');
            const notaFinal = nota.trim()
                ? `Tarea reanudada. El cronómetro continúa.\n\nNotas: ${nota.trim()}`
                : 'Tarea reanudada. El cronómetro continúa.';
            fd.append('nota', notaFinal);
        } else if (accion === 'resolver') {
            fd.append('estado', 'RESUELTO');
            if (notaResolver.trim()) {
                fd.append('nota', notaResolver.trim());
            }
            if (timePhase === 'manual' && tiempoManualMins > 0) {
                fd.append(
                    'registroTiempoManual',
                    JSON.stringify({ duracionManualMinutos: tiempoManualMins })
                );
            }
            archivos.forEach((item) => fd.append('imagenes', item.file, item.file.name));
        }

        onConfirm(ticket.id, fd);
    };

    const tiempoDisplay = timePhase === 'manual' ? formatMins(tiempoManualMins) : formatMins(elapsedMins);
    const disableConfirm = !accion || (accion === 'resolver' && (timePhase === 'preguntando' || (timePhase === 'manual' && tiempoManualMins === 0)));

    return (
        <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()}>
            <ModalHeader
                title="Tarea en Pausa"
                onClose={() => !isSubmitting && onClose()}
            />
            <ModalBody>
                <div className="flex flex-col gap-5 py-2">

                    {/* Cabecera */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-estado-en-pausa/15 flex items-center justify-center">
                            <Icon name="pause_circle" size="32px" className="text-estado-en-pausa" fill />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                                {ticket.titulo}
                            </p>
                            {tiempoPausa && (
                                <p className="text-xs text-estado-en-pausa font-bold mt-1 flex items-center justify-center gap-1">
                                    <Icon name="schedule" size="xs" />
                                    {tiempoPausa}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Opciones seleccionables */}
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={handleSelectReanudar}
                            disabled={isSubmitting}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all active:scale-95 cursor-pointer outline-none w-full text-left disabled:opacity-50 disabled:cursor-not-allowed",
                                accion === 'reanudar'
                                    ? "border-estado-asignada bg-estado-asignada/10 ring-4 ring-estado-asignada/20"
                                    : "border-slate-200 bg-white hover:border-estado-asignada/40 hover:bg-estado-asignada/5"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                accion === 'reanudar' ? "bg-estado-asignada text-white shadow-md shadow-estado-asignada/30" : "bg-estado-asignada/15 text-estado-asignada"
                            )}>
                                <Icon name="play_circle" size="24px" fill={accion === 'reanudar'} />
                            </div>
                            <div>
                                <p className={cn("text-sm font-bold transition-colors", accion === 'reanudar' ? "text-estado-asignada" : "text-slate-700")}>
                                    Reanudar tarea
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">El cronómetro continuará desde donde se detuvo</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={handleSelectResolver}
                            disabled={isSubmitting}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all active:scale-95 cursor-pointer outline-none w-full text-left disabled:opacity-50 disabled:cursor-not-allowed",
                                accion === 'resolver'
                                    ? "border-estado-resuelto bg-estado-resuelto/10 ring-4 ring-estado-resuelto/20"
                                    : "border-slate-200 bg-white hover:border-estado-resuelto/40 hover:bg-estado-resuelto/5"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                accion === 'resolver' ? "bg-estado-resuelto text-white shadow-md shadow-estado-resuelto/30" : "bg-estado-resuelto/10 text-estado-resuelto"
                            )}>
                                <Icon name="check_circle" size="24px" fill={accion === 'resolver'} />
                            </div>
                            <div>
                                <p className={cn("text-sm font-bold transition-colors", accion === 'resolver' ? "text-estado-resuelto" : "text-slate-700")}>
                                    Resolver directamente
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">Evaluar tiempo y marcar como terminada</p>
                            </div>
                        </button>
                    </div>

                    {/* Formularios Expandibles */}
                    {accion === 'reanudar' && (
                        <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200 mt-1">
                            <div className="flex items-start gap-3 px-4 py-3 border rounded-xl bg-estado-asignada/10 border-estado-asignada/20">
                                <Icon name="info" size="sm" className="shrink-0 mt-0.5 text-estado-asignada" />
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    El cronómetro de la tarea volverá a correr. Puedes agregar una nota de reanudación si lo deseas.
                                </p>
                            </div>
                            <div className="w-full text-left">
                                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                                    Nota de reanudación <span className="font-normal text-slate-400">(opcional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={nota}
                                    onChange={(e) => setNota(e.target.value)}
                                    placeholder="Describe brevemente por qué se retoma el trabajo..."
                                    className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 focus:border-marca-secundario transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {accion === 'resolver' && (
                        <div className="w-full flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-200 mt-1">
                            {timePhase === 'preguntando' && evaluacion?.alerta && (
                                <div className="flex flex-col gap-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                                            <Icon name="timer" size="sm" className="text-amber-700" fill />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-amber-800">
                                                ¿El tiempo registrado es correcto?
                                            </p>
                                            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                                {evaluacion.mensaje}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-center py-2">
                                        <span className="text-4xl font-extrabold font-mono text-amber-700">
                                            {formatMins(elapsedMins)}
                                        </span>
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">
                                            Tiempo medido por el sistema
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setTimePhase('confirmado')}
                                            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg border-2 border-amber-300 bg-white text-amber-800 text-sm font-bold hover:bg-amber-50 transition-colors cursor-pointer active:scale-95"
                                        >
                                            <Icon name="check" size="sm" />
                                            Sí, es correcto
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const base = elapsedMins > 0 ? elapsedMins : 60;
                                                setTiempoManualMins(Math.round(base / 5) * 5 || 60);
                                                setTimePhase('manual');
                                            }}
                                            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 transition-colors cursor-pointer active:scale-95"
                                        >
                                            <Icon name="edit" size="sm" />
                                            No, corregir
                                        </button>
                                    </div>
                                </div>
                            )}

                            {timePhase === 'manual' && (
                                <div className="flex flex-col gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center gap-2">
                                        <Icon name="nest_clock_farsight_analog" size="sm" className="text-marca-primario" />
                                        <p className="text-sm font-bold text-slate-700">Ingresa el tiempo real trabajado</p>
                                    </div>
                                    <TimePicker totalMins={tiempoManualMins} onChange={setTiempoManualMins} />
                                    {tiempoManualMins === 0 && (
                                        <p className="text-xs text-estado-rechazado font-bold flex items-center gap-1">
                                            <Icon name="warning" size="xs" />
                                            El tiempo debe ser mayor a 0 minutos
                                        </p>
                                    )}
                                </div>
                            )}

                            {timePhase !== 'preguntando' && (
                                <>
                                    <div className="flex items-center justify-between px-4 py-3 bg-estado-resuelto/10 border border-estado-resuelto/20 rounded-xl">
                                        <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Icon name="timer" size="sm" className="text-estado-resuelto" />
                                            Tiempo total a registrar
                                            {timePhase === 'manual' && (
                                                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                    Manual
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-lg font-extrabold font-mono text-estado-resuelto">
                                            {tiempoDisplay}
                                        </span>
                                    </div>

                                    <div className="w-full text-left">
                                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                                            Nota de resolución <span className="font-normal text-slate-400">(opcional)</span>
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={notaResolver}
                                            onChange={(e) => setNotaResolver(e.target.value)}
                                            placeholder="Describe las acciones realizadas para resolver el ticket..."
                                            className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 focus:border-marca-secundario transition-all"
                                        />
                                    </div>

                                    <EvidenceSection
                                        archivos={archivos}
                                        onAgregar={handleAgregar}
                                        onEliminar={handleEliminar}
                                    />
                                </>
                            )}
                        </div>
                    )}

                    {!accion && (
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 mt-2 bg-slate-100 border border-slate-200 rounded-full text-sm font-medium text-slate-400">
                            <Icon name="touch_app" size="sm" />
                            Selecciona una acción para continuar
                        </div>
                    )}
                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button
                    variant={accion === 'resolver' ? 'guardar' : 'accion'}
                    icon={accion === 'resolver' ? 'check_circle' : accion === 'reanudar' ? 'play_circle' : 'touch_app'}
                    isLoading={isSubmitting}
                    disabled={disableConfirm}
                    onClick={handleConfirmar}
                >
                    {accion === 'resolver' ? 'Confirmar resolución' : accion === 'reanudar' ? 'Confirmar reanudación' : 'Selecciona una acción'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};