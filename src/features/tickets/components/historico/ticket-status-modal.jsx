// src/features/tickets/components/historico/ticket-status-modal.jsx
import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Label, Select, Input } from '@/components/form/z_index';

// Máquina de transiciones espejo del helper.ts del backend
const TRANSICIONES = {
    PENDIENTE: ['ASIGNADA', 'CANCELADA'],
    ASIGNADA: ['EN_PROGRESO', 'PENDIENTE', 'RESUELTO', 'CERRADO', 'CANCELADA'],
    EN_PROGRESO: ['EN_PAUSA', 'RESUELTO'],
    EN_PAUSA: ['EN_PROGRESO', 'RESUELTO'],
    RESUELTO: ['CERRADO', 'RECHAZADO'],
    RECHAZADO: ['EN_PROGRESO', 'CANCELADA'],
    CERRADO: [],
    CANCELADA: [],
};

const ESTADO_LABEL = {
    PENDIENTE: 'Pendiente', ASIGNADA: 'Asignada', EN_PROGRESO: 'En Progreso',
    EN_PAUSA: 'En Pausa', RESUELTO: 'Resuelto', CERRADO: 'Cerrado',
    RECHAZADO: 'Rechazado', CANCELADA: 'Cancelada',
};

/**
 * Props:
 *   forcedEstado  → cuando se pasa, el selector de estado se omite y se usa este valor fijo.
 *                   Útil para el flujo de cancelación rápida desde ticket-table.
 */
export const TicketStatusModal = ({
    isOpen,
    onClose,
    ticket,
    onConfirm,
    isSubmitting,
    currentUser,
    forcedEstado,
}) => {
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [nota, setNota] = useState('');
    const [duracionMinutos, setDuracionMinutos] = useState('');
    const [errors, setErrors] = useState({});

    // Cuando hay forcedEstado, lo precargamos automáticamente
    const estadoFinal = forcedEstado || nuevoEstado;

    useEffect(() => {
        if (isOpen && ticket) {
            setNuevoEstado(forcedEstado || '');
            setNota('');
            setDuracionMinutos('');
            setErrors({});
        }
    }, [isOpen, ticket, forcedEstado]);

    if (!ticket) return null;

    const estadosDisponibles = TRANSICIONES[ticket.estado] ?? [];
    const esCliente = currentUser?.rol === 'CLIENTE_INTERNO';
    const estadosFiltrados = esCliente
        ? estadosDisponibles.filter((e) => ['CERRADO', 'RECHAZADO'].includes(e))
        : estadosDisponibles;

    const mostrarTiempoManual = ['RESUELTO', 'CERRADO'].includes(estadoFinal);

    const esCancelacion = forcedEstado === 'CANCELADA';

    const handleSubmit = () => {
        const e = {};
        if (!estadoFinal) e.nuevoEstado = 'Selecciona el nuevo estado.';
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

    // ── Variante cancelación rápida ───────────────────────────────────────
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

    // ── Variante estándar de cambio de estado ─────────────────────────────
    return (
        <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()}>
            <ModalHeader
                title={`Actualizar estado — #${ticket.id}`}
                onClose={() => !isSubmitting && onClose()}
            />
            <ModalBody>
                <div className="flex flex-col gap-5">

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="ts-estado" error={!!errors.nuevoEstado}>
                            Nuevo estado *
                        </Label>
                        <Select
                            id="ts-estado"
                            value={nuevoEstado}
                            onChange={(e) => {
                                setNuevoEstado(e.target.value);
                                setErrors((prev) => ({ ...prev, nuevoEstado: undefined }));
                            }}
                            error={!!errors.nuevoEstado}
                            helperText={errors.nuevoEstado}
                            disabled={isSubmitting}
                        >
                            <option value="" disabled>
                                Estado actual: {ESTADO_LABEL[ticket.estado]}…
                            </option>
                            {estadosFiltrados.map((e) => (
                                <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
                            ))}
                        </Select>
                    </div>

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

                    {mostrarTiempoManual && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-slate-700">
                                <Icon name="timer" size="sm" className="text-marca-primario" />
                                <span className="text-sm font-bold">Ajuste de tiempo (si olvidaste el timer)</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Si no iniciaste el cronómetro, declara aquí los minutos trabajados. Déjalo en blanco para usar el tiempo medido automáticamente.
                            </p>
                            <div className="flex flex-col gap-1.5 mt-1">
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
                <Button variant="guardar" icon="check" isLoading={isSubmitting} onClick={handleSubmit}>
                    Guardar cambios
                </Button>
            </ModalFooter>
        </Modal>
    );
};