// src/features/tickets/components/historico/status-modals/ticket-pausa-modal.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Label } from '@/components/form/z_index';
import { cn } from '@/utils/cn';
import { isPastDate, isoToDateInput, fechaInputToISOLocal } from '@/lib/date';

// ── Constantes de Tiempo ───────────────────────────────────────────────────
const MIN_TECNICO = 5;
const MAX_EXTRA_ESTIMADO = 60;
const MAX_SIN_ESTIMADO = 480;
const MAX_DURATION_MINS = 540; // 9 horas

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

const formatMinsFull = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const durationStr = h > 0
        ? (m > 0 ? `${h} h ${m} min` : `${h} h`)
        : `${m} min`;
    return `${durationStr} (${mins} min)`;
};

const evaluarTiempo = (mins, ticket) => {
    const fechaVencimiento = ticket.fechaLimite || ticket.fechaVencimiento;

    if (fechaVencimiento && isPastDate(fechaVencimiento)) {
        return {
            alerta: true,
            tipo: 'alto',
            mensaje: 'La tarea ha superado su fecha límite en el calendario.',
        };
    }

    const tiempoEstimado = ticket.tiempoEstimado;

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
    const [mode, setMode] = useState('duration'); // 'duration' | 'range'
    const [startTime, setStartTime] = useState('07:00');
    const [endTime, setEndTime] = useState('08:00');

    const horas = Math.floor(totalMins / 60);
    const minutos = totalMins % 60;

    useEffect(() => {
        if (mode === 'range') {
            const [h1, m1] = startTime.split(':').map(Number);
            const [h2, m2] = endTime.split(':').map(Number);
            let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (diff < 0) diff += 1440; // Cruzó medianoche
            onChange(diff);
        }
    }, [startTime, endTime, mode]);

    const selectCls =
        'border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 appearance-none cursor-pointer';

    return (
        <div className="flex flex-col gap-4">
            <div className="flex p-1 bg-slate-100 rounded-lg self-start">
                <button
                    type="button"
                    onClick={() => setMode('duration')}
                    className={cn(
                        'px-3 py-1.5 text-xs font-bold rounded-md transition-all',
                        mode === 'duration' ? 'bg-white text-marca-primario shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    )}
                >
                    Duración
                </button>
                <button
                    type="button"
                    onClick={() => setMode('range')}
                    className={cn(
                        'px-3 py-1.5 text-xs font-bold rounded-md transition-all',
                        mode === 'range' ? 'bg-white text-marca-primario shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    )}
                >
                    Rango horario
                </button>
            </div>

            {mode === 'duration' ? (
                <div className="flex items-end gap-4 animate-in fade-in slide-in-from-left-2 duration-200">
                    <div className="flex flex-col gap-1.5 items-center">
                        <select
                            value={horas}
                            onChange={(e) => onChange(Number(e.target.value) * 60 + minutos)}
                            className={selectCls}
                        >
                            {Array.from({ length: 10 }, (_, i) => (
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
                </div>
            ) : (
                <div className="flex items-end gap-3 animate-in fade-in slide-in-from-right-2 duration-200">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Inicio</span>
                        <input
                            type="time"
                            min="07:00"
                            max="20:00"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className={selectCls}
                        />
                    </div>
                    <span className="text-slate-300 pb-2">a</span>
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Fin</span>
                        <input
                            type="time"
                            min="07:00"
                            max="20:00"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className={selectCls}
                        />
                    </div>
                </div>
            )}

            {/* Mensajes de validación */}
            <div className="flex flex-col gap-1">
                {totalMins > MAX_DURATION_MINS && (
                    <p className="text-[10px] text-estado-rechazado font-bold flex items-center gap-1">
                        <Icon name="error" size="xs" />
                        Máximo permitido: 9 horas.
                    </p>
                )}
                {mode === 'range' && (startTime < '07:00' || endTime > '20:00' || startTime > '20:00' || endTime < '07:00') && (
                    <p className="text-[10px] text-estado-rechazado font-bold flex items-center gap-1">
                        <Icon name="info" size="xs" />
                        Rango permitido: 07:00 AM a 08:00 PM.
                    </p>
                )}
            </div>
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
    const [accion, setAccion] = useState(null);

    const [nota, setNota] = useState('');
    const [archivos, setArchivos] = useState([]);
    const [notaResolver, setNotaResolver] = useState('');
    const [elapsedMins, setElapsedMins] = useState(0);
    const [evaluacion, setEvaluacion] = useState(null);
    const [timePhase, setTimePhase] = useState('confirmado');
    const [tiempoManualMins, setTiempoManualMins] = useState(0);
    const [fechaFinManual, setFechaFinManual] = useState('');

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
            setFechaFinManual('');
        }
    }, [isOpen]);

    if (!ticket) return null;

    const minDate = isoToDateInput(ticket.createdAt);
    const maxDate = isoToDateInput(new Date().toISOString());
    const isFechaFinValida = fechaFinManual && fechaFinManual >= minDate && fechaFinManual <= maxDate;

    const obtenerTiempoEnPausa = () => {
        const ahora = Date.now();
        const ultimoIntervalo = ticket.intervalos
            ?.filter((i) => i.fin)
            .sort((a, b) => new Date(b.fin) - new Date(a.fin))[0];

        if (!ultimoIntervalo) return null;

        const msEnPausa = ahora - new Date(ultimoIntervalo.fin).getTime();
        const diasEnPausa = Math.floor(msEnPausa / (1000 * 60 * 60 * 24)) + 1;

        return diasEnPausa === 1 ? '1 día en pausa' : `${diasEnPausa} días en pausa`;
    };

    const handleSelectReanudar = () => {
        setAccion(accion === 'reanudar' ? null : 'reanudar');
        setNota('');
    };

    const handleSelectResolver = () => {
        if (accion === 'resolver') {
            setAccion(null);
            return;
        }
        setAccion('resolver');
        const mins = calcElapsedMins(ticket);
        setElapsedMins(mins);
        const ev = evaluarTiempo(mins, ticket);
        setEvaluacion(ev);

        // Intercepción Liquid UI: Si es 0 min, saltamos la confirmación y forzamos manual
        if (mins === 0) {
            setTiempoManualMins(60);
            if (ev?.tipo === 'alto') {
                setFechaFinManual(isoToDateInput(new Date().toISOString()));
                setTimePhase('atrasada_fecha');
            } else {
                setTimePhase('manual');
            }
        } else {
            setTimePhase(ev.alerta ? 'preguntando' : 'confirmado');
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
            fd.append('nota', nota.trim() || 'Tarea reanudada.');
        } else if (accion === 'resolver') {
            fd.append('estado', 'RESUELTO');
            if (notaResolver.trim()) fd.append('nota', notaResolver.trim());

            let timePayload = {};
            if (timePhase === 'manual') {
                timePayload = { duracionManualMinutos: tiempoManualMins };
            } else if (timePhase === 'atrasada_fecha' && isFechaFinValida) {
                timePayload = {
                    finManual: new Date(fechaInputToISOLocal(fechaFinManual)).toISOString(),
                    duracionManualMinutos: tiempoManualMins
                };
            }

            if (Object.keys(timePayload).length > 0) {
                fd.append('registroTiempoManual', JSON.stringify(timePayload));
            }
            archivos.forEach((item) => fd.append('imagenes', item.file, item.file.name));
        }

        onConfirm(ticket.id, fd);
    };

    let tiempoDisplay = formatMinsFull(elapsedMins);
    if (timePhase === 'manual' || timePhase === 'atrasada_fecha') {
        tiempoDisplay = formatMinsFull(tiempoManualMins);
    }

    const isAtrasada = evaluacion?.tipo === 'alto';
    const disableConfirm = !accion || (accion === 'resolver' && (
        timePhase === 'preguntando' ||
        ((timePhase === 'manual' || timePhase === 'atrasada_fecha') && tiempoManualMins === 0) ||
        (timePhase === 'atrasada_fecha' && !isFechaFinValida) ||
        (timePhase === 'confirmado' && elapsedMins === 0)
    ));

    return (
        <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()}>
            <ModalHeader title="Tarea en Pausa" onClose={() => !isSubmitting && onClose()} />
            <ModalBody>
                <div className="flex flex-col gap-5 py-2">

                    {/* Alerta de Retraso Global para el Modal */}
                    {isPastDate(ticket?.fechaVencimiento) && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm text-left">
                            <Icon name="warning" size="sm" className="shrink-0 mt-0.5" />
                            <p><strong>¡Atención!</strong> La tarea que estás gestionando ya se encuentra <strong>atrasada</strong>.</p>
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-estado-en-pausa/15 flex items-center justify-center">
                            <Icon name="pause_circle" size="32px" className="text-estado-en-pausa" fill />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{ticket.titulo}</p>
                            {obtenerTiempoEnPausa() && (
                                <p className="text-xs text-estado-en-pausa font-bold mt-1 flex items-center justify-center gap-1">
                                    <Icon name="schedule" size="xs" /> {obtenerTiempoEnPausa()}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button type="button" onClick={handleSelectReanudar} disabled={isSubmitting}
                            className={cn("flex items-center gap-4 p-4 rounded-xl border-2 transition-all active:scale-95 w-full text-left",
                                accion === 'reanudar' ? "border-estado-asignada bg-estado-asignada/10 ring-4 ring-estado-asignada/20" : "border-slate-200 bg-white")}>
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                accion === 'reanudar' ? "bg-estado-asignada text-white shadow-md" : "bg-estado-asignada/15 text-estado-asignada")}>
                                <Icon name="play_circle" size="24px" fill={accion === 'reanudar'} />
                            </div>
                            <div>
                                <p className={cn("text-sm font-bold", accion === 'reanudar' ? "text-estado-asignada" : "text-slate-700")}>Reanudar tarea</p>
                                <p className="text-xs text-slate-500 mt-0.5">El cronómetro continuará su curso</p>
                            </div>
                        </button>

                        <button type="button" onClick={handleSelectResolver} disabled={isSubmitting}
                            className={cn("flex items-center gap-4 p-4 rounded-xl border-2 transition-all active:scale-95 w-full text-left",
                                accion === 'resolver' ? "border-estado-resuelto bg-estado-resuelto/10 ring-4 ring-estado-resuelto/20" : "border-slate-200 bg-white")}>
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                accion === 'resolver' ? "bg-estado-resuelto text-white shadow-md" : "bg-estado-resuelto/10 text-estado-resuelto")}>
                                <Icon name="check_circle" size="24px" fill={accion === 'resolver'} />
                            </div>
                            <div>
                                <p className={cn("text-sm font-bold", accion === 'resolver' ? "text-estado-resuelto" : "text-slate-700")}>Resolver directamente</p>
                                <p className="text-xs text-slate-500 mt-0.5">Finalizar la actividad ahora</p>
                            </div>
                        </button>
                    </div>

                    {accion === 'reanudar' && (
                        <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200 mt-1 text-left">
                            <Label>Nota de reanudación <span className="font-normal text-slate-400">(opcional)</span></Label>
                            <textarea rows={3} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="¿Alguna observación al retomar?"
                                className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm resize-none bg-white focus:ring-2 focus:ring-marca-secundario/30 outline-none" />
                        </div>
                    )}

                    {accion === 'resolver' && (
                        <div className="w-full flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-200 mt-1">
                            {timePhase === 'preguntando' && (
                                <div className="flex flex-col gap-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                                            <Icon name="timer" size="sm" className="text-amber-700" fill />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-amber-800">{isAtrasada ? '¿La tarea se entregó fuera de tiempo?' : '¿El tiempo registrado es correcto?'}</p>
                                            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                                {isAtrasada ? `Supera el límite. Puedes ingresar el día y el tiempo real trabajado.` : evaluacion.mensaje}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-center py-2">
                                        <span className="text-4xl font-extrabold font-mono text-amber-700">{formatMins(elapsedMins)}</span>
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Sistema</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            variant="accion"
                                            className="bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
                                            onClick={() => setTimePhase('confirmado')}
                                        >
                                            <Icon name="check" size="xs" />
                                            {isAtrasada ? 'Sí, con atraso' : 'Sí, es correcto'}
                                        </Button>
                                        <Button
                                            variant="accion"
                                            className="bg-amber-600 text-white hover:bg-amber-700"
                                            onClick={() => {
                                                if (isAtrasada) {
                                                    setFechaFinManual(isoToDateInput(new Date().toISOString()));
                                                    setTimePhase('atrasada_fecha');
                                                } else {
                                                    const base = elapsedMins > 0 ? elapsedMins : 60;
                                                    setTiempoManualMins(Math.min(Math.round(base / 5) * 5, 1435) || 60);
                                                    setTimePhase('manual');
                                                }
                                            }}
                                        >
                                            <Icon name="edit" size="xs" />
                                            No, corregir
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {timePhase === 'manual' && (
                                <div className="flex flex-col gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left">
                                    <p className="text-sm font-bold text-slate-700">Tiempo real trabajado</p>
                                    <TimePicker totalMins={tiempoManualMins} onChange={setTiempoManualMins} />
                                </div>
                            )}

                            {timePhase === 'atrasada_fecha' && (
                                <div className="flex flex-col gap-6 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                    {/* Resumen de entrega y estimación */}
                                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vencimiento</span>
                                            <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                                <Icon name="event_busy" size="xs" className="text-estado-rechazado" />
                                                {ticket.fechaVencimiento ? new Date(ticket.fechaVencimiento).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : 'Sin fecha'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1 text-right">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duración estimada</span>
                                            <span className="text-sm font-bold text-slate-700 flex items-center justify-end gap-1.5">
                                                <Icon name="history" size="xs" className="text-slate-400" />
                                                {ticket.tiempoEstimado ? formatMins(ticket.tiempoEstimado) : 'No estimada'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 border-b border-slate-200 pb-5">
                                        <Label>Día que la terminaste *</Label>
                                        <input type="date" min={minDate} max={maxDate} value={fechaFinManual} onChange={(e) => setFechaFinManual(e.target.value)}
                                            className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-marca-secundario/30" />
                                        {!isFechaFinValida && (
                                            <p className="text-xs text-estado-rechazado font-bold flex items-center gap-1 mt-1">
                                                <Icon name="warning" size="xs" />
                                                La fecha debe estar entre la creación del ticket y hoy.
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <p className="text-sm font-bold text-slate-700">Tiempo invertido ese día</p>
                                        <TimePicker totalMins={tiempoManualMins} onChange={setTiempoManualMins} />
                                    </div>
                                </div>
                            )}

                            {timePhase !== 'preguntando' && (
                                <div className="flex flex-col gap-4 text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 px-3 sm:px-4 py-3 bg-estado-resuelto/10 border border-estado-resuelto/20 rounded-xl">
                                        <span className="text-xs sm:text-sm font-medium text-slate-700 flex flex-wrap items-center gap-1.5 sm:gap-2">
                                            <Icon name="timer" size="sm" className="text-estado-resuelto shrink-0" />
                                            <span>Tiempo total a registrar</span>
                                            {(timePhase === 'manual' || timePhase === 'atrasada_fecha') && (
                                                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                    Manual
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-base sm:text-lg font-extrabold font-mono text-estado-resuelto self-start sm:self-auto ml-5 sm:ml-0">
                                            {tiempoDisplay}
                                        </span>
                                    </div>

                                    {/* NUEVA VALIDACIÓN VISUAL AQUÍ */}
                                    {timePhase === 'confirmado' && elapsedMins === 0 && (
                                        <p className="text-xs text-estado-rechazado font-bold flex items-center gap-1 -mt-2">
                                            <Icon name="warning" size="xs" />
                                            El tiempo debe ser mayor a 0 minutos para poder resolver.
                                        </p>
                                    )}

                                    <Label>Nota de resolución <span className="font-normal text-slate-400">(opcional)</span></Label>
                                    <textarea rows={3} value={notaResolver} onChange={(e) => setNotaResolver(e.target.value)} placeholder="Acciones realizadas..."
                                        className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm resize-none bg-white focus:ring-2 focus:ring-marca-secundario/30 outline-none" />
                                    <EvidenceSection archivos={archivos} onAgregar={handleAgregar} onEliminar={handleEliminar} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                <Button variant={accion === 'resolver' ? 'guardar' : 'accion'} isLoading={isSubmitting} disabled={disableConfirm} onClick={handleConfirmar}>
                    Confirmar
                </Button>
            </ModalFooter>
        </Modal>
    );
};