import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

export const formatMins = (mins) => {
    if (!mins || mins === 0) return '0 min';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const PlantaDetalle = ({ planta, onClose }) => {
    if (!planta) return null;

    const pctTickets = planta.total > 0 ? Math.round((planta.totalTickets / planta.total) * 100) : 0;
    const pctCorrectivos = planta.total > 0 ? Math.round((planta.totalCorrectivos / planta.total) * 100) : 0;

    // Lógica Extra: Desviación de Estimación
    const desvMins = planta.tiempoRealTotal - planta.tiempoEstimadoTotal;
    const isDesvioNegativo = desvMins > 0; // Tardaron más de lo estimado (Malo)

    return (
        <Modal isOpen onClose={onClose} className="md:max-w-2xl">
            <ModalHeader
                title={`Métricas: ${planta.planta}`}
                onClose={onClose}
            />
            <ModalBody>
                <div className="flex flex-col gap-6">

                    {/* Tarjeta de Volumen de Incidencias */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Incidencias</span>
                            <span className="text-4xl font-black text-slate-800 font-mono leading-none">{planta.total}</span>
                            <span className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                                <Icon name="cancel" size="xs" /> {planta.rechazadas} Rechazos totales
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 w-full md:w-64 shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1"><Icon name="confirmation_number" size="xs" /> Reportes</span>
                                    <span className="text-[11px] font-black font-mono">{planta.totalTickets} <span className="text-slate-400 font-medium">({pctTickets}%)</span></span>
                                </div>
                                <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pctTickets}%` }} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-orange-700 flex items-center gap-1"><Icon name="build" size="xs" /> Correctivas</span>
                                    <span className="text-[11px] font-black font-mono">{planta.totalCorrectivos} <span className="text-slate-400 font-medium">({pctCorrectivos}%)</span></span>
                                </div>
                                <div className="w-full h-1.5 bg-orange-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pctCorrectivos}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tarjetas de Tiempos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-marca-primario/10 flex items-center justify-center">
                                    <Icon name="hourglass_bottom" size="sm" className="text-marca-primario" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">Tiempos Totales</span>
                            </div>
                            <div className="flex flex-col gap-1 mt-2">
                                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <span className="text-xs font-semibold text-slate-600">Tiempo Real</span>
                                    <span className="text-sm font-black font-mono text-slate-800">{formatMins(planta.tiempoRealTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded-lg border border-transparent">
                                    <span className="text-xs font-semibold text-slate-500">Tiempo Estimado</span>
                                    <span className="text-sm font-black font-mono text-slate-400">{formatMins(planta.tiempoEstimadoTotal)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <Icon name="speed" size="sm" className="text-emerald-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">Desviación (Real vs Est.)</span>
                            </div>
                            <div className="flex flex-col gap-1 mt-2">
                                <span className={cn(
                                    "text-3xl font-black font-mono leading-none",
                                    isDesvioNegativo ? "text-red-600" : "text-emerald-600"
                                )}>
                                    {isDesvioNegativo ? "+" : ""}{formatMins(desvMins)}
                                </span>
                                <span className="text-xs font-medium text-slate-500">
                                    {isDesvioNegativo
                                        ? "Horas extra no planificadas."
                                        : "Horas ahorradas respecto a estimación."}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="cancelar" onClick={onClose}>Cerrar Detalle</Button>
            </ModalFooter>
        </Modal>
    );
};