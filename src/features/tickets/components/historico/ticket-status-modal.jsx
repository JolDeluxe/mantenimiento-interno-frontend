// src/features/tickets/components/historico/ticket-status-modal.jsx
import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Label, Input } from '@/components/form/z_index';

// ── Definición de transiciones por estado ─────────────────────────────────
// Espejo del helper.ts del backend — el backend sigue siendo el árbitro final.
const MAQUINA_ESTADOS = {
    ASIGNADA: [
        { estado: 'EN_PROGRESO', label: 'Iniciar Tarea', icon: 'play_arrow', variant: 'accion', primary: true },
        { estado: 'CANCELADA', label: 'Cancelar', icon: 'cancel', variant: 'borrar', primary: false },
    ],
    EN_PROGRESO: [
        { estado: 'EN_PAUSA', label: 'Pausar Tarea', icon: 'pause', variant: 'pausa', primary: true },
        { estado: 'RESUELTO', label: 'Marcar como Resuelto', icon: 'check_circle', variant: 'guardar', primary: true },
    ],
    EN_PAUSA: [
        { estado: 'EN_PROGRESO', label: 'Reanudar Tarea', icon: 'play_arrow', variant: 'accion', primary: true },
        { estado: 'RESUELTO', label: 'Resolver', icon: 'check_circle', variant: 'guardar', primary: false },
    ],
    PENDIENTE: [
        { estado: 'ASIGNADA', label: 'Asignar manualmente', icon: 'engineering', variant: 'accion', primary: true },
        { estado: 'CANCELADA', label: 'Cancelar', icon: 'cancel', variant: 'borrar', primary: false },
    ],
    RECHAZADO: [
        { estado: 'EN_PROGRESO', label: 'Reintervenir', icon: 'construction', variant: 'accion', primary: true },
        { estado: 'CANCELADA', label: 'Cancelar', icon: 'cancel', variant: 'borrar', primary: false },
    ],
};

const ESTADOS_INMUTABLES = new Set(['RESUELTO', 'CERRADO', 'CANCELADA']);

const LABEL_ESTADO = {
    PENDIENTE: 'Pendiente',
    ASIGNADA: 'Asignada',
    EN_PROGRESO: 'En Progreso',
    EN_PAUSA: 'En Pausa',
    RESUELTO: 'Resuelto',
    CERRADO: 'Cerrado',
    RECHAZADO: 'Rechazado',
    CANCELADA: 'Cancelada',
};

// ── Componente interno: Botón de transición ───────────────────────────────
const TransicionBtn = ({ transicion, isSelected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`
            flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 w-full text-left
            transition-all duration-150 cursor-pointer active:scale-[0.98] group
            ${isSelected
                ? 'border-marca-primario bg-marca-primario/5 shadow-sm shadow-marca-primario/10'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }
        `}
    >
        <div className={`
            w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors
            ${isSelected ? 'bg-marca-primario text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
        `}>
            <Icon name={transicion.icon} size="sm" fill={isSelected} />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
            <span className={`text-sm font-bold ${isSelected ? 'text-marca-primario' : 'text-slate-800'}`}>
                {transicion.label}
            </span>
            <span className="text-xs text-slate-400 font-mono">→ {LABEL_ESTADO[transicion.estado]}</span>
        </div>

        <div className={`
            shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${isSelected ? 'bg-marca-primario border-marca-primario' : 'border-slate-300 bg-white'}
        `}>
            {isSelected && <Icon name="check" size="xs" className="text-white" />}
        </div>
    </button>
);

export const TicketStatusModal = ({
    isOpen,
    onClose,
    ticket,
    onConfirm,
    isSubmitting,
    currentUser,
    // forcedEstado → omite la selección y pre-establece el estado (ej: cancelación rápida)
    forcedEstado,
}) => {
    const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
    const [nota, setNota] = useState('');
    const [duracionMinutos, setDuracionMinutos] = useState('');
    const [errors, setErrors] = useState({});

    const estadoActual = ticket?.estado;

    useEffect(() => {
        if (isOpen && ticket) {
            setEstadoSeleccionado(forcedEstado || null);
            setNota('');
            setDuracionMinutos('');
            setErrors({});
        }
    }, [isOpen, ticket, forcedEstado]);

    if (!ticket) return null;

    const esImmutable = ESTADOS_INMUTABLES.has(estadoActual);
    const transicionesDisp = MAQUINA_ESTADOS[estadoActual] ?? [];
    const esCancelacion = forcedEstado === 'CANCELADA';
    const estadoFinal = forcedEstado || estadoSeleccionado;

    const mostrarTiempoManual = ['RESUELTO', 'CERRADO'].includes(estadoFinal ?? '');

    const handleSubmit = () => {
        const e = {};
        if (!estadoFinal) e.estado = 'Selecciona una acción para continuar.';
        if (duracionMinutos && (isNaN(Number(duracionMinutos)) || Number(duracionMinutos) < 1)) {
            e.duracion = 'Ingresa un número entero positivo de minutos.';
        }
        if (Object.keys(e).length > 0) return setErrors(e);

        const formData = new FormData();
        formData.append('estado', estadoFinal);
        if (nota.trim()) formData.append('nota', nota.trim());
        if (duracionMinutos) {
            formData.append(
                'registroTiempoManual',
                JSON.stringify({ duracionManualMinutos: parseInt(duracionMinutos, 10) })
            );
        }
        onConfirm(ticket.id, formData);
    };

    // ── Variante: cancelación rápida ──────────────────────────────────────
    if (esCancelacion) {
        return (
            <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} className="max-w-md">
                <ModalHeader title={`Cancelar ticket — #${ticket.id}`} onClose={() => !isSubmitting && onClose()} />
                <ModalBody>
                    <div className="flex flex-col items-center text-center gap-4 py-2">
                        <div className="w-16 h-16 rounded-full bg-estado-cancelada/10 flex items-center justify-center">
                            <Icon name="cancel" size="xl" className="text-estado-cancelada" fill />
                        </div>
                        <div>
                            <p className="text-slate-700 text-sm font-medium">
                                ¿Confirmas que deseas <strong>CANCELAR</strong> este ticket?
                            </p>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-3">
                                <span className="block font-bold text-slate-900">{ticket.titulo}</span>
                            </div>
                        </div>
                        <div className="w-full flex flex-col gap-1.5">
                            <Label htmlFor="cancel-nota">Motivo de cancelación (opcional)</Label>
                            <Input
                                id="cancel-nota"
                                multiline
                                value={nota}
                                onChange={(e) => setNota(e.target.value)}
                                placeholder="Explica por qué se cancela este ticket…"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>Volver</Button>
                    <Button variant="borrar" icon="cancel" isLoading={isSubmitting} onClick={handleSubmit}>
                        Sí, cancelar ticket
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }

    // ── Variante: estado inmutable ────────────────────────────────────────
    if (esImmutable) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
                <ModalHeader title={`Estado — #${ticket.id}`} onClose={onClose} />
                <ModalBody>
                    <div className="flex flex-col items-center text-center gap-4 py-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                            <Icon name="lock" size="xl" className="text-slate-400" />
                        </div>
                        <div>
                            <p className="text-lg font-extrabold text-slate-800">
                                Estado inmutable
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                El ticket está en estado{' '}
                                <span className="font-bold text-slate-700">
                                    {LABEL_ESTADO[estadoActual]}
                                </span>.
                                No se permiten transiciones desde esta vista.
                            </p>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="cancelar" onClick={onClose}>Cerrar</Button>
                </ModalFooter>
            </Modal>
        );
    }

    // ── Variante estándar: máquina de estados visual ──────────────────────
    return (
        <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()}>
            <ModalHeader
                title={`Actualizar estado — #${ticket.id}`}
                onClose={() => !isSubmitting && onClose()}
            />
            <ModalBody>
                <div className="flex flex-col gap-5">

                    {/* Estado actual como referencia visual */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <Icon name="info" size="sm" className="text-slate-400 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado Actual</span>
                            <span className="text-sm font-bold text-slate-800">{LABEL_ESTADO[estadoActual]}</span>
                        </div>
                    </div>

                    {/* Botonera de transiciones */}
                    {transicionesDisp.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            <Label error={!!errors.estado}>Selecciona la acción *</Label>
                            {transicionesDisp.map((tr) => (
                                <TransicionBtn
                                    key={tr.estado}
                                    transicion={tr}
                                    isSelected={estadoSeleccionado === tr.estado}
                                    onClick={() => {
                                        setEstadoSeleccionado(tr.estado);
                                        setErrors((prev) => ({ ...prev, estado: undefined }));
                                    }}
                                />
                            ))}
                            {errors.estado && (
                                <p className="text-xs text-estado-rechazado font-bold mt-1">{errors.estado}</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic text-center py-4">
                            No hay transiciones disponibles para el estado actual.
                        </p>
                    )}

                    {/* Nota de bitácora */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="ts-nota">Nota de bitácora (opcional)</Label>
                        <Input
                            id="ts-nota"
                            multiline
                            value={nota}
                            onChange={(e) => setNota(e.target.value)}
                            placeholder="Describe el avance, motivo de pausa o cierre…"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Ajuste de tiempo manual (solo en estados de resolución) */}
                    {mostrarTiempoManual && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Icon name="timer" size="sm" className="text-marca-primario" />
                                <span className="text-sm font-bold text-slate-700">
                                    Ajuste de tiempo (si olvidaste el timer)
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Si no iniciaste el cronómetro, declara aquí los minutos trabajados.
                                Déjalo en blanco para usar el tiempo medido automáticamente.
                            </p>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="ts-duracion" error={!!errors.duracion}>
                                    Duración manual (minutos)
                                </Label>
                                <Input
                                    id="ts-duracion"
                                    type="number"
                                    min="1"
                                    max="1440"
                                    value={duracionMinutos}
                                    onChange={(e) => {
                                        setDuracionMinutos(e.target.value);
                                        setErrors((prev) => ({ ...prev, duracion: undefined }));
                                    }}
                                    error={!!errors.duracion}
                                    helperText={errors.duracion}
                                    placeholder="Ej. 90"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    )}

                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button
                    variant="guardar"
                    icon="check"
                    isLoading={isSubmitting}
                    onClick={handleSubmit}
                    disabled={!estadoFinal && transicionesDisp.length > 0}
                >
                    Guardar cambios
                </Button>
            </ModalFooter>
        </Modal>
    );
};