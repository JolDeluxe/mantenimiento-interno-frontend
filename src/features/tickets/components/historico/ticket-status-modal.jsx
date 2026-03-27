// src/features/tickets/components/historico/ticket-status-modal.jsx
//
// ORQUESTADOR — Decide qué sub-modal renderizar según el estado y clasificación
// del ticket. Mantiene el contrato externo: onConfirm(id, formData)
//
import { TicketStartModal } from './status-modals/ticket-start-modal';
import { TicketProgressModal } from './status-modals/ticket-progress-modal';
import { TicketPausaModal } from './status-modals/ticket-pausa-modal';
import { TicketCheckModal } from './status-modals/ticket-check-modal';
import { TicketRechazadoModal } from './status-modals/ticket-rechazado-modal'; // <- NUEVO
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Label, Input } from '@/components/form/z_index';
import { useState, useEffect } from 'react';

// ── Tipos de modal que puede despachar el orquestador ─────────────────────
const TIPO = {
    INICIAR: 'INICIAR',       // ASIGNADA → EN_PROGRESO
    REINICIAR: 'REINICIAR',   // RECHAZADO → EN_PROGRESO
    EN_PROGRESO: 'EN_PROGRESO', // EN_PROGRESO → EN_PAUSA | RESUELTO
    RUTINA: 'RUTINA',         // ASIGNADA (RUTINA) → CERRADO
    PAUSA: 'PAUSA',           // EN_PAUSA → EN_PROGRESO | RESUELTO
    CANCELAR: 'CANCELAR',     // Cualquier estado activo → CANCELADA
    ACTIVAR: 'ACTIVAR',       // PENDIENTE → ASIGNADA (con responsables ya asignados)
    INMUTABLE: 'INMUTABLE',   // Estado final — no hay transición posible
    NULO: 'NULO',             // No aplica, no renderizar nada
};

const resolverTipo = (ticket, forcedEstado) => {
    if (forcedEstado === 'CANCELADA') return TIPO.CANCELAR;
    if (!ticket) return TIPO.NULO;

    const { estado, clasificacion } = ticket;

    switch (estado) {
        case 'ASIGNADA':
            return clasificacion === 'RUTINA' ? TIPO.RUTINA : TIPO.INICIAR;
        case 'RECHAZADO':
            return clasificacion === 'RUTINA' ? TIPO.RUTINA : TIPO.REINICIAR;
        case 'EN_PROGRESO':
            return clasificacion === 'RUTINA' ? TIPO.RUTINA : TIPO.EN_PROGRESO;
        case 'EN_PAUSA': return TIPO.PAUSA;
        case 'PENDIENTE': return TIPO.ACTIVAR;
        case 'RESUELTO':
        case 'CERRADO':
        case 'CANCELADA': return TIPO.INMUTABLE;
        default: return TIPO.NULO;
    }
};

// ── Modal inline: Cancelación ─────────────────────────────────────────────
const CancelModal = ({ isOpen, onClose, ticket, isSubmitting, onConfirm }) => {
    const [nota, setNota] = useState('');

    useEffect(() => { if (isOpen) setNota(''); }, [isOpen]);

    if (!ticket) return null;

    const handleSubmit = () => {
        const fd = new FormData();
        fd.append('estado', 'CANCELADA');
        if (nota.trim()) fd.append('nota', nota.trim());
        onConfirm(ticket.id, fd);
    };

    return (
        <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} className="max-w-md">
            <ModalHeader title="Cancelar Ticket" onClose={() => !isSubmitting && onClose()} />
            <ModalBody>
                <div className="flex flex-col items-center text-center gap-4 py-2">
                    <div className="w-16 h-16 rounded-full bg-estado-cancelada/15 flex items-center justify-center">
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
                        <Label htmlFor="cancel-nota">Motivo de cancelación <span className="font-normal text-slate-400">(opcional)</span></Label>
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
};

// ── Modal inline: Activar manualmente (PENDIENTE → ASIGNADA) ─────────────
const ActivarModal = ({ isOpen, onClose, ticket, isSubmitting, onConfirm }) => {
    if (!ticket) return null;

    const handleConfirmar = () => {
        const fd = new FormData();
        fd.append('estado', 'ASIGNADA');
        fd.append('nota', 'Ticket activado manualmente.');
        onConfirm(ticket.id, fd);
    };

    return (
        <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} className="max-w-sm">
            <ModalHeader title="Activar Ticket" onClose={() => !isSubmitting && onClose()} />
            <ModalBody>
                <div className="flex flex-col items-center text-center gap-4 py-4">
                    <div className="w-16 h-16 rounded-full bg-estado-asignada/15 flex items-center justify-center">
                        <Icon name="assignment_turned_in" size="xl" className="text-estado-asignada" fill />
                    </div>
                    <div className="space-y-2 px-2">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-2">{ticket.titulo}</p>
                        <p className="text-sm text-slate-500">
                            El ticket pasará a <strong className="text-estado-asignada">Asignado</strong> y
                            los técnicos asignados serán notificados.
                        </p>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                <Button variant="accion" icon="assignment_turned_in" isLoading={isSubmitting} onClick={handleConfirmar}>
                    Activar ticket
                </Button>
            </ModalFooter>
        </Modal>
    );
};

// ── Modal inline: Estado inmutable ────────────────────────────────────────
const InmutableModal = ({ isOpen, onClose, ticket }) => {
    if (!ticket) return null;

    const LABEL = {
        RESUELTO: 'Resuelto — pendiente de validación del cliente',
        CERRADO: 'Cerrado definitivamente',
        CANCELADA: 'Cancelado',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm">
            <ModalHeader title="Estado del Ticket" onClose={onClose} />
            <ModalBody>
                <div className="flex flex-col items-center text-center gap-4 py-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <Icon name="lock" size="xl" className="text-slate-400" />
                    </div>
                    <div>
                        <p className="text-lg font-extrabold text-slate-800">Estado inmutable</p>
                        <p className="text-sm text-slate-500 mt-1">
                            {LABEL[ticket.estado] || `Este ticket está ${ticket.estado?.toLowerCase()}.`}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                            No se permiten transiciones de estado desde esta vista.
                        </p>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="cancelar" onClick={onClose}>Cerrar</Button>
            </ModalFooter>
        </Modal>
    );
};

// ── ORQUESTADOR PRINCIPAL ─────────────────────────────────────────────────
export const TicketStatusModal = ({
    isOpen,
    onClose,
    ticket,
    currentUser,
    isSubmitting,
    onConfirm,
    forcedEstado,
}) => {
    const tipo = resolverTipo(ticket, forcedEstado);

    // Todas las condiciones comparten los mismos props base
    const baseProps = { isOpen, onClose, ticket, isSubmitting, onConfirm };

    switch (tipo) {
        case TIPO.INICIAR:
            return <TicketStartModal {...baseProps} esReinicio={false} />;

        case TIPO.REINICIAR:
            // SE SUSTITUYE TicketStartModal POR EL NUEVO MODAL ESPECÍFICO
            return <TicketRechazadoModal {...baseProps} />;

        case TIPO.EN_PROGRESO:
            return <TicketProgressModal {...baseProps} />;

        case TIPO.RUTINA:
            return <TicketCheckModal {...baseProps} />;

        case TIPO.PAUSA:
            return <TicketPausaModal {...baseProps} />;

        case TIPO.CANCELAR:
            return <CancelModal {...baseProps} />;

        case TIPO.ACTIVAR:
            return <ActivarModal {...baseProps} />;

        case TIPO.INMUTABLE:
            return <InmutableModal isOpen={isOpen} onClose={onClose} ticket={ticket} />;

        default:
            return null;
    }
};