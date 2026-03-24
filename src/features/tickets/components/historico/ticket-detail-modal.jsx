// src/features/tickets/components/historico/ticket-detail-modal.jsx
import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Icon, Button } from '@/components/ui/z_index';
import { TicketStatusBadge, TicketPriorityBadge } from './ticket-status-badge';
import { formatFechaHora } from '@/lib/date';
import { TicketTimeline } from './ticket-timeline';

const DataRow = ({ icon, label, value, fallback = 'No registrado' }) => (
    <div className="flex gap-3 items-start">
        <div className="mt-0.5 text-slate-400 shrink-0">
            <Icon name={icon} size="sm" />
        </div>
        <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="text-sm font-medium text-slate-800 mt-0.5 break-words">
                {value || <span className="text-slate-400 italic font-normal">{fallback}</span>}
            </span>
        </div>
    </div>
);

export const TicketDetailModal = ({ isOpen, onClose, ticket }) => {
    const [mostrarHistorial, setMostrarHistorial] = useState(false);

    if (!ticket) return null;

    const creador = ticket.creador;
    const responsables = ticket.responsables ?? [];
    const tieneHistorial = ticket.historial && ticket.historial.length > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className={`transition-all duration-300 ease-in-out w-full ${mostrarHistorial ? 'md:max-w-5xl lg:max-w-[1200px]' : 'md:max-w-3xl lg:max-w-4xl'}`}
        >
            <ModalHeader title={`Detalle — #${ticket.id}`} onClose={onClose} />
            <ModalBody>
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* ── PANEL IZQUIERDO: Información Principal ── */}
                    <div className="flex-1 w-full min-w-0 flex flex-col gap-6">

                        <div className="flex flex-wrap items-center gap-2">
                            <TicketStatusBadge estado={ticket.estado} />
                            <TicketPriorityBadge prioridad={ticket.prioridad} />
                            {ticket.tipo && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border bg-slate-100 text-slate-600 border-slate-200 uppercase tracking-wide">
                                    {ticket.tipo}
                                </span>
                            )}
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                            <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-3">{ticket.titulo}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{ticket.descripcion}</p>
                        </div>

                        {/* Grid inamovible de 3 columnas en resoluciones de escritorio completas */}
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
                                    value={responsables.length > 0 ? responsables.map((r) => r.nombre).join(', ') : null}
                                    fallback="Sin asignar"
                                />
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                                    <Icon name="schedule" size="sm" className="text-marca-primario" />
                                    Tiempos
                                </h4>
                                <DataRow icon="calendar_today" label="Creado" value={formatFechaHora(ticket.createdAt)} />
                                <DataRow icon="event" label="Vencimiento" value={formatFechaHora(ticket.fechaVencimiento)} fallback="Sin fecha límite" />
                                <DataRow icon="timer" label="Tiempo estimado" value={ticket.tiempoEstimado ? `${ticket.tiempoEstimado} min` : null} fallback="No especificado" />
                                <DataRow icon="hourglass_bottom" label="Tiempo real" value={ticket.duracionReal ? `${ticket.duracionReal} min` : null} fallback="Sin registro" />
                            </div>

                        </div>
                    </div>

                    {/* ── PANEL DERECHO: Línea de Tiempo Condicional ── */}
                    {mostrarHistorial && <TicketTimeline historial={ticket.historial} />}

                </div>
            </ModalBody>
            <ModalFooter className="flex justify-between items-center w-full">
                <div className="flex-1">
                    {tieneHistorial && (
                        <Button
                            variant="accion"
                            size="sm"
                            icon={mostrarHistorial ? 'visibility_off' : 'history'}
                            onClick={() => setMostrarHistorial(!mostrarHistorial)}
                        >
                            {mostrarHistorial ? 'Ocultar línea de tiempo' : 'Ver línea de tiempo'}
                        </Button>
                    )}
                </div>

                <Button variant="cancelar" size="sm" onClick={onClose}>
                    Cerrar
                </Button>
            </ModalFooter>
        </Modal>
    );
};