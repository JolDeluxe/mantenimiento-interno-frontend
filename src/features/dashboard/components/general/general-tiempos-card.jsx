// src/features/dashboard/components/general/general-tiempos-card.jsx
import { Icon, Skeleton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

export const GeneralTiemposCard = ({ rendimiento = {}, loading = false, isMobile = false }) => {
    // 🚨 Calcular si existen tiempos evaluados reales
    const totalEvaluadas =
        (rendimiento.aTiempo?.cantidad || 0) +
        (rendimiento.tarde?.cantidad || 0) +
        (rendimiento.deAcuerdo?.cantidad || 0) +
        (rendimiento.excedidas?.cantidad || 0);

    const tieneDatos = totalEvaluadas > 0;

    return (
        <div className={cn("bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full", isMobile ? "p-4" : "p-6")}>
            <div className={cn("flex items-center gap-2 border-b border-slate-100", isMobile ? "mb-3 pb-2" : "mb-5 pb-3")}>
                <Icon name="monitoring" size="sm" className="text-slate-600" />
                <h3 className={cn("font-bold text-slate-800", isMobile ? "text-xs" : "text-sm")}>Evaluación de Tiempos</h3>
            </div>

            {loading ? <Skeleton className={cn("rounded-xl", isMobile ? "h-20" : "h-32")} /> : !tieneDatos ? (
                // 🚨 Sub-Estado Vacío para Tiempos (Reemplaza los 0%)
                <div className={cn(
                    "flex flex-col items-center justify-center flex-1 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50",
                    isMobile ? "py-6 gap-2 mt-2" : "py-8 gap-3 mt-2"
                )}>
                    <div className={cn("bg-slate-100 rounded-full flex items-center justify-center", isMobile ? "w-10 h-10" : "w-12 h-12")}>
                        <Icon name="timer_off" size={isMobile ? "md" : "lg"} className="text-slate-300" />
                    </div>
                    <span className={cn("font-bold text-slate-500", isMobile ? "text-[10px]" : "text-xs")}>Sin evaluaciones</span>
                    <p className="text-[10px] text-slate-400 font-medium px-4 text-center">No hay tiempos registrados en este periodo</p>
                </div>
            ) : (
                <div className={cn("flex flex-col flex-1 justify-center", isMobile ? "gap-3" : "gap-4")}>

                    <div className="flex flex-col gap-1">
                        <span className={cn("font-bold text-slate-400 uppercase tracking-widest", isMobile ? "text-[9px]" : "text-[10px]")}>Contra Fecha Límite</span>
                        <div className={cn("flex flex-col bg-slate-50 border border-slate-100 rounded-xl", isMobile ? "gap-1 p-2" : "gap-1.5 p-3")}>
                            <div className="flex justify-between items-center">
                                <span className={cn("font-bold text-emerald-700", isMobile ? "text-[10px]" : "text-xs")}>A Tiempo</span>
                                <div className={cn("flex items-center", isMobile ? "gap-1.5" : "gap-2")}>
                                    <span className={cn("text-emerald-600/70 font-bold", isMobile ? "text-[9px]" : "text-[10px]")}>{rendimiento.aTiempo?.porcentaje ?? 0}%</span>
                                    <span className={cn("font-mono font-black text-emerald-700", isMobile ? "text-xs" : "text-base")}>{rendimiento.aTiempo?.cantidad ?? 0}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={cn("font-bold text-amber-700", isMobile ? "text-[10px]" : "text-xs")}>Tarde</span>
                                <div className={cn("flex items-center", isMobile ? "gap-1.5" : "gap-2")}>
                                    <span className={cn("text-amber-600/70 font-bold", isMobile ? "text-[9px]" : "text-[10px]")}>{rendimiento.tarde?.porcentaje ?? 0}%</span>
                                    <span className={cn("font-mono font-black text-amber-700", isMobile ? "text-xs" : "text-base")}>{rendimiento.tarde?.cantidad ?? 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={cn("flex flex-col gap-1", isMobile ? "mt-1" : "mt-2")}>
                        <span className={cn("font-bold text-slate-400 uppercase tracking-widest", isMobile ? "text-[9px]" : "text-[10px]")}>Contra Tiempo Estimado</span>
                        <div className={cn("flex flex-col bg-slate-50 border border-slate-100 rounded-xl", isMobile ? "gap-1 p-2" : "gap-1.5 p-3")}>
                            <div className="flex justify-between items-center">
                                <span className={cn("font-bold text-emerald-700", isMobile ? "text-[10px]" : "text-xs")}>De Acuerdo Estimación</span>
                                <div className={cn("flex items-center", isMobile ? "gap-1.5" : "gap-2")}>
                                    <span className={cn("text-emerald-600/70 font-bold", isMobile ? "text-[9px]" : "text-[10px]")}>{rendimiento.deAcuerdo?.porcentaje ?? 0}%</span>
                                    <span className={cn("font-mono font-black text-emerald-700", isMobile ? "text-xs" : "text-base")}>{rendimiento.deAcuerdo?.cantidad ?? 0}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={cn("font-bold text-red-700", isMobile ? "text-[10px]" : "text-xs")}>Excedieron Estimación</span>
                                <div className={cn("flex items-center", isMobile ? "gap-1.5" : "gap-2")}>
                                    <span className={cn("text-red-600/70 font-bold", isMobile ? "text-[9px]" : "text-[10px]")}>{rendimiento.excedidas?.porcentaje ?? 0}%</span>
                                    <span className={cn("font-mono font-black text-red-700", isMobile ? "text-xs" : "text-base")}>{rendimiento.excedidas?.cantidad ?? 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};