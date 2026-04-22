// src/features/dashboard/components/general/general-lista-barras-card.jsx
import { Icon, Skeleton } from '@/components/ui/z_index';
import { GeneralFilaBarra } from './general-fila-barra';
import { cn } from '@/utils/cn';

export const GeneralListaBarrasCard = ({
    titulo, icono, colorIcono = 'text-slate-600', datos = [], colorBarra = 'bg-marca-primario',
    valorExtra = null, mensajeVacio = "Sin registros", loading = false, isMobile = false
}) => {
    return (
        <div className={cn("bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full", isMobile ? "p-4" : "p-6")}>
            <div className={cn("flex items-center gap-2 border-b border-slate-100", isMobile ? "mb-3 pb-2" : "mb-5 pb-3")}>
                <Icon name={icono} size="sm" className={colorIcono} />
                <h3 className={cn("font-bold text-slate-800", isMobile ? "text-xs" : "text-sm")}>{titulo}</h3>

                {/* 🚨 Solo mostrar si hay valor real mayor a 0 */}
                {valorExtra !== null && valorExtra > 0 && (
                    <span className={cn("ml-auto font-black font-mono text-slate-800 leading-none", isMobile ? "text-lg" : "text-2xl")}>
                        {valorExtra}
                    </span>
                )}
            </div>

            {loading ? <Skeleton className={cn("rounded-xl", isMobile ? "h-20" : "h-32")} /> : (
                <div className={cn("flex flex-col flex-1", isMobile ? "gap-2.5" : "gap-4 justify-center")}>
                    {datos.map((item, index) => (
                        <GeneralFilaBarra
                            key={item.nombre || item.estado || index}
                            etiqueta={item.nombre || item.estado}
                            cantidad={item.cantidad}
                            porcentaje={item.porcentaje}
                            colorBarra={colorBarra}
                            isMobile={isMobile}
                        />
                    ))}

                    {/* 🚨 Sub-Estado Vacío Estilizado */}
                    {datos.length === 0 && (
                        <div className={cn(
                            "flex flex-col items-center justify-center flex-1 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50",
                            isMobile ? "py-6 gap-2 mt-2" : "py-8 gap-3 mt-2"
                        )}>
                            {valorExtra === 0 ? (
                                <>
                                    <div className={cn("bg-emerald-100 rounded-full flex items-center justify-center", isMobile ? "w-10 h-10" : "w-12 h-12")}>
                                        <Icon name="check_circle" size={isMobile ? "md" : "lg"} className="text-emerald-500" />
                                    </div>
                                    <span className={cn("font-bold text-emerald-700", isMobile ? "text-[10px]" : "text-xs")}>Bandeja limpia</span>
                                    <p className="text-[10px] text-emerald-600/70 font-medium">Cero elementos pendientes</p>
                                </>
                            ) : (
                                <>
                                    <div className={cn("bg-slate-100 rounded-full flex items-center justify-center", isMobile ? "w-10 h-10" : "w-12 h-12")}>
                                        <Icon name="inbox" size={isMobile ? "md" : "lg"} className="text-slate-300" />
                                    </div>
                                    <span className={cn("font-bold text-slate-500", isMobile ? "text-[10px]" : "text-xs")}>{mensajeVacio}</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};