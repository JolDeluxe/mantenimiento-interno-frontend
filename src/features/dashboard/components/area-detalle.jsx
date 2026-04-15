import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { formatMins } from './planta-detalle';

export const AreaDetalle = ({ area, plantaName, onClose }) => {
    if (!area) return null;

    const pctTickets = area.total > 0 ? Math.round((area.totalTickets / area.total) * 100) : 0;
    const pctCorrectivos = area.total > 0 ? Math.round((area.totalCorrectivos / area.total) * 100) : 0;

    const desvMins = area.tiempoRealTotal - area.tiempoEstimadoTotal;
    const isDesvioNegativo = desvMins > 0;

    return (
        <Modal isOpen onClose={onClose} className="md:max-w-xl">
            <ModalHeader
                title={`Área: ${area.area}`}
                onClose={onClose}
            />
            <ModalBody>
                <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-2 bg-marca-primario/5 border border-marca-primario/20 px-3 py-2 rounded-xl">
                        <Icon name="domain" size="xs" className="text-marca-primario" />
                        <span className="text-xs font-bold text-marca-primario">Pertenece a: {plantaName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Volumen Total</span>
                            <span className="text-4xl font-black text-slate-800 font-mono leading-none">{area.total}</span>
                            <span className="text-xs font-semibold text-slate-500 mt-1">Incidencias</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resolución (MTTR)</span>
                            <span className="text-3xl font-black text-slate-800 font-mono leading-none">{formatMins(area.mttrMins)}</span>
                            <span className="text-xs font-semibold text-slate-500 mt-1">Tiempo promedio</span>
                        </div>
                    </div>

                    {/* Desglose de Tipos */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-700">Clasificación de carga</span>
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Icon name="confirmation_number" size="xs" className="text-blue-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800">Reportes (Tickets)</span>
                                        <span className="text-[10px] text-slate-500 font-medium">Levantados por usuarios</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-black font-mono text-slate-800">{area.totalTickets}</span>
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 rounded">{pctTickets}%</span>
                                </div>
                            </div>

                            <div className="w-full h-px bg-slate-100" />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                                        <Icon name="build" size="xs" className="text-orange-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800">Correctivas</span>
                                        <span className="text-[10px] text-slate-500 font-medium">Fallas imprevistas</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-black font-mono text-slate-800">{area.totalCorrectivos}</span>
                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 rounded">{pctCorrectivos}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desviación */}
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-700">Desviación Operativa</span>
                            <span className="text-[10px] text-slate-500">Real: {formatMins(area.tiempoRealTotal)} | Est: {formatMins(area.tiempoEstimadoTotal)}</span>
                        </div>
                        <span className={cn(
                            "text-xl font-black font-mono px-3 py-1 rounded-xl",
                            isDesvioNegativo ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                            {isDesvioNegativo ? "+" : ""}{formatMins(desvMins)}
                        </span>
                    </div>

                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="cancelar" onClick={onClose}>Cerrar</Button>
            </ModalFooter>
        </Modal>
    );
};