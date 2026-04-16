import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { formatMins, formatKey, getDesviacionColor } from './area-item';

const DistributionGrid = ({ data, title, icon }) => {
    const entries = Object.entries(data || {}).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return null;

    return (
        <div className="flex flex-col gap-3 bg-white border border-slate-200 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-700">
                <Icon name={icon} size="sm" />
                <span className="text-sm font-bold">{title}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {entries.map(([key, count]) => (
                    <div key={key} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                        <span className="text-xs font-semibold text-slate-600">{formatKey(key)}</span>
                        <span className="text-xs font-black text-marca-primario bg-marca-primario/10 px-1.5 rounded">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const mapTipoName = (tipo) => {
    const t = String(tipo).toUpperCase().trim();
    if (t === 'TICKET') return 'Reportes Cliente';
    if (t === 'PLANEADA') return 'Planeadas';
    if (t === 'EXTRAORDINARIA') return 'Extraordinarias';
    return formatKey(t);
};

export const PlantaDetalle = ({ planta, onClose }) => {
    if (!planta) return null;

    const total = planta.totalTareas || 0;
    const activas = planta.backlogActivo || 0;

    // BLINDAJE DE CACHÉ
    let tiposMap = planta.tipos || {};
    if (Object.keys(tiposMap).length === 0) {
        tiposMap = {
            'TICKET': planta.totalTickets || 0,
            'EXTRAORDINARIA': planta.totalCorrectivosExtraordinarios || 0,
            'PLANEADA': 0
        };
    } else {
        if (tiposMap['TICKET'] === undefined) tiposMap['TICKET'] = 0;
        if (tiposMap['PLANEADA'] === undefined) tiposMap['PLANEADA'] = 0;
        if (tiposMap['EXTRAORDINARIA'] === undefined) tiposMap['EXTRAORDINARIA'] = 0;
    }

    const tiposEntries = Object.entries(tiposMap).sort((a, b) => b[1] - a[1]);

    const tiempoReal = planta.tiemposCerradas?.tiempoRealTotal || 0;
    const tiempoEst = planta.tiemposCerradas?.tiempoEstimadoTotal || 0;
    const cerradasTotales = planta.tiemposCerradas?.cantidad || 0;

    const desvMins = tiempoReal - tiempoEst;
    const isDesvioNegativo = desvMins > 0;
    const colorReal = getDesviacionColor(tiempoReal, tiempoEst);

    return (
        <Modal isOpen onClose={onClose} className="md:max-w-3xl">
            <ModalHeader title={`Reporte Consolidado Planta: ${planta.planta}`} onClose={onClose} />
            <ModalBody className="max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-6 p-1">

                    {/* SECCIÓN 1: VOLUMEN DE CARGA */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">1. Volumen de Carga Consolidado</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
                                <span className="text-3xl font-black text-slate-800 font-mono leading-none">{total}</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Tareas Totales</span>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
                                <span className="text-3xl font-black text-white font-mono leading-none">{activas}</span>
                                <span className="text-[10px] font-bold text-slate-300 uppercase mt-1">Tareas Activas</span>
                            </div>

                            {tiposEntries.map(([tipo, count]) => {
                                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                const isTicket = tipo.toUpperCase() === 'TICKET';

                                return (
                                    <div key={tipo} className={cn(
                                        "border rounded-2xl p-4 flex flex-col justify-center items-center text-center relative overflow-hidden",
                                        isTicket ? "bg-blue-50 border-blue-100" : "bg-white border-slate-200"
                                    )}>
                                        <span className={cn("text-3xl font-black font-mono leading-none", isTicket ? "text-blue-700" : "text-slate-700")}>{count}</span>
                                        <span className={cn("text-[10px] font-bold uppercase mt-1", isTicket ? "text-blue-600" : "text-slate-500")}>
                                            {mapTipoName(tipo)}
                                        </span>
                                        <span className={cn("absolute top-2 right-2 text-[9px] font-bold px-1 rounded",
                                            isTicket ? "bg-blue-200 text-blue-800" : "bg-slate-100 text-slate-500"
                                        )}>{pct}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECCIÓN 2: TIEMPOS OPERATIVOS */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">2. Tiempos Operativos Globales</h4>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                Basado en {cerradasTotales} tareas cerradas
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tiempo Planeado</span>
                                    <span className="text-lg font-black font-mono text-slate-500">{formatMins(tiempoEst)}</span>
                                </div>
                                <div className="w-full h-px bg-slate-100" />
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tiempo Real Total</span>
                                    <span className={cn("text-2xl font-black font-mono", cerradasTotales > 0 ? colorReal : "text-slate-400")}>
                                        {formatMins(tiempoReal)}
                                    </span>
                                </div>
                            </div>
                            <div className={cn(
                                "border p-4 rounded-2xl flex flex-col justify-center",
                                isDesvioNegativo ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
                            )}>
                                <span className={cn("text-[10px] font-bold uppercase", isDesvioNegativo ? "text-red-500" : "text-emerald-600")}>
                                    Desviación Operativa Global
                                </span>
                                <span className={cn("text-3xl font-black font-mono mt-1", isDesvioNegativo ? "text-red-700" : "text-emerald-700")}>
                                    {isDesvioNegativo ? "+" : ""}{formatMins(desvMins)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3 Y 4: DISTRIBUCIONES */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">3. Distribución de Flujo y Clasificación</h4>
                        <DistributionGrid data={planta.estados} title="Estados Actuales en Toda la Planta" icon="timeline" />
                        <DistributionGrid data={planta.clasificaciones} title="Clasificaciones Globales" icon="category" />
                        <DistributionGrid data={planta.categorias} title="Categorías Globales" icon="label" />
                    </div>

                    {/* SECCIÓN 5: FRECUENCIA DE REPORTES */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">4. Frecuencia Mensual Consolidada (Reportes Cliente)</h4>
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                            {planta.frecuenciaTickets && planta.frecuenciaTickets.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                                            <th className="p-3">Clasificación</th>
                                            <th className="p-3">Categoría</th>
                                            <th className="p-3 text-center">Registros Totales</th>
                                            <th className="p-3 text-right">Frecuencia Estimada (Mensual)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {planta.frecuenciaTickets.map((f, idx) => (
                                            <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                                <td className="p-3 text-xs font-semibold text-slate-700">{formatKey(f.clasificacion)}</td>
                                                <td className="p-3 text-xs font-medium text-slate-600">{formatKey(f.categoria)}</td>
                                                <td className="p-3 text-sm font-black font-mono text-slate-800 text-center">{f.cantidadTotal}</td>
                                                <td className="p-3 text-right">
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-marca-primario bg-marca-primario/10 px-2 py-1 rounded-lg">
                                                        <Icon name="event_repeat" size="xs" /> {f.frecuenciaMensualEstimada} reportes/mes
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-6 text-center flex flex-col items-center justify-center">
                                    <Icon name="inbox" size="lg" className="text-slate-300 mb-2" />
                                    <span className="text-sm font-bold text-slate-500">Sin datos de frecuencia</span>
                                    <span className="text-xs text-slate-400">No hay suficientes reportes registrados para calcular una frecuencia mensual.</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="cancelar" onClick={onClose}>Cerrar Reporte</Button>
            </ModalFooter>
        </Modal>
    );
};