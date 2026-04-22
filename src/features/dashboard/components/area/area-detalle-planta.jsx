// src/features/dashboard/components/area/area-detalle-planta.jsx
import { Modal, ModalHeader, ModalBody } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const formatMins = (mins) => {
    if (!mins || mins === 0) return '—';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const ActivasBadge = ({ activas }) => {
    if (activas === 0) return <span className="text-[10px] font-bold text-slate-300">—</span>;
    return (
        <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full text-[10px] font-black">
            {activas} activas
        </span>
    );
};

export const PlantaDetalle = ({ planta, onClose }) => {
    if (!planta) return null;

    const {
        totalTareas = 0,
        tareasActivas = 0,
        tiposTotales = {},
        tiempos = {},
        areas = [],
    } = planta;

    const areasOrdenadas = [...areas].sort((a, b) => b.tareasActivas - a.tareasActivas);

    return (
        <Modal isOpen={Boolean(planta)} onClose={onClose} className="max-w-4xl w-full">
            <ModalHeader title={`Planta ${planta.planta}`} onClose={onClose} />

            <ModalBody className="p-5">
                <div className="flex flex-col gap-6">

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tareas Totales</p>
                            <p className={cn("text-3xl font-black", totalTareas > 0 ? "text-slate-800" : "text-slate-300")}>
                                {totalTareas > 0 ? totalTareas : '—'}
                            </p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                            <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider mb-1">Activas</p>
                            <p className={cn("text-3xl font-black", tareasActivas > 0 ? "text-amber-600" : "text-amber-600/40")}>
                                {tareasActivas > 0 ? tareasActivas : '—'}
                            </p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center">
                            <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider mb-1">Tickets</p>
                            <p className={cn("text-3xl font-black", (tiposTotales?.tickets || 0) > 0 ? "text-blue-600" : "text-blue-600/40")}>
                                {(tiposTotales?.tickets || 0) > 0 ? tiposTotales.tickets : '—'}
                            </p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tiempo Real</p>
                            <p className={cn("text-2xl font-black mt-1", tiempos.alertaTiempo ? 'text-red-600' : 'text-slate-800')}>
                                {formatMins(tiempos.tiempoRealTotal)}
                            </p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tiempo Estimado</p>
                            <p className="text-2xl font-black text-slate-800 mt-1">{formatMins(tiempos.tiempoEstimadoTotal)}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
                            Desglose por Áreas
                        </p>
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Área</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider text-center">Total</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider text-center">Activas</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider text-center">Tipos (reportes / planeadas / extra)</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Real vs Est.</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider text-center">Estado Tiempo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {areasOrdenadas.map((area, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 text-[11px] font-bold text-slate-700">{area.area}</td>
                                            <td className="px-4 py-3 text-[11px] font-black text-slate-700 text-center">
                                                {area.totalTareas > 0 ? area.totalTareas : <span className="text-slate-300">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <ActivasBadge activas={area.tareasActivas} />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2 text-[10px] font-black">
                                                    <span className={area.tiposTotales?.tickets > 0 ? "text-blue-600" : "text-slate-400"}>
                                                        {area.tiposTotales?.tickets || 0}
                                                    </span>
                                                    <span className="text-slate-200">/</span>
                                                    <span className={area.tiposTotales?.planeadas > 0 ? "text-emerald-600" : "text-slate-400"}>
                                                        {area.tiposTotales?.planeadas || 0}
                                                    </span>
                                                    <span className="text-slate-200">/</span>
                                                    <span className={area.tiposTotales?.extraordinarias > 0 ? "text-amber-600" : "text-slate-400"}>
                                                        {area.tiposTotales?.extraordinarias || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex flex-col text-[11px] font-medium">
                                                    <span className={area.tiempos?.alertaTiempo ? 'text-red-600 font-bold' : 'text-slate-800'}>
                                                        Real: {formatMins(area.tiempos?.tiempoRealTotal)}
                                                    </span>
                                                    <span className="text-slate-400">
                                                        Estimado: {formatMins(area.tiempos?.tiempoEstimadoTotal)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {area.tiempos?.alertaTiempo ? (
                                                    <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                                                        Excedido
                                                    </span>
                                                ) : area.tiempos?.tiempoEstimadoTotal > 0 ? (
                                                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                                                        En Tiempo
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 text-[10px] font-bold">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </ModalBody>
        </Modal>
    );
};