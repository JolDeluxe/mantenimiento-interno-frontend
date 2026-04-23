import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Badge, Button, Skeleton } from '@/components/ui/z_index';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/utils/cn';

export const PrincipalUrgentes = ({ urgentes = [], loading = false }) => {
    const navigate = useNavigate();

    const irATareasDeHoy = () => {
        navigate('/tickets/hoy');
    };

    // 1. PRIMERO INTERCEPTAMOS LA CARGA
    if (loading) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[250px]">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                    <h3 className="text-sm font-black text-slate-300 uppercase tracking-tight flex items-center gap-2">
                        <Icon name="notification_important" size="sm" />
                        Atención Inmediata
                    </h3>
                    <Skeleton className="h-5 w-8 rounded-full shadow-sm" />
                </div>

                <div className="flex flex-col divide-y divide-slate-100 flex-1 overflow-y-auto pointer-events-none">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="p-4 flex flex-col gap-2.5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-col gap-1.5 flex-1 mt-0.5">
                                    <Skeleton className="h-3 w-full rounded-full" />
                                    <Skeleton className="h-3 w-2/3 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-16 rounded-md shrink-0" />
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Skeleton className="h-3 w-3 rounded-full shrink-0" />
                                <Skeleton className="h-2 w-24 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-full py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-center shrink-0">
                    <Skeleton className="h-3 w-36 rounded-full" />
                </div>
            </div>
        );
    }

    // 2. LUEGO EVALUAMOS SI ESTÁ VACÍO
    if (urgentes.length === 0) {
        return (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center shadow-sm flex flex-col justify-center h-full min-h-[250px]">
                <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <Icon name="check_circle" />
                </div>
                <h4 className="text-emerald-800 font-bold text-sm">Todo bajo control</h4>
                <p className="text-emerald-600 text-xs mt-1 mb-5">No tienes tareas próximas a vencer.</p>

                <div className="flex justify-center">
                    <Button variant="accion" icon="event_available" onClick={irATareasDeHoy}>
                        Ver tareas de hoy
                    </Button>
                </div>
            </div>
        );
    }

    // 3. FINALMENTE RENDERIZAMOS LOS DATOS REALES
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[250px]">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight flex items-center gap-2">
                    <Icon name="notification_important" size="sm" className="text-red-500" />
                    Atención Inmediata
                </h3>
                <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    {urgentes.length} {urgentes.length === 6 ? '+' : ''}
                </span>
            </div>

            <div className="flex flex-col divide-y divide-slate-100 flex-1 overflow-y-auto">
                {urgentes.slice(0, 5).map(tarea => {
                    const date = new Date(tarea.fechaVencimiento);
                    const isVencida = isPast(date) && !isToday(date);

                    let dateLabel = format(date, "d MMM", { locale: es });
                    if (isToday(date)) dateLabel = 'Hoy';
                    if (isTomorrow(date)) dateLabel = 'Mañana';

                    return (
                        <div key={tarea.id} className="p-4 flex flex-col gap-2 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <span className="text-xs font-bold text-slate-700 line-clamp-2 leading-tight">
                                    {tarea.titulo}
                                </span>
                                <Badge estado={tarea.estado} className="scale-90 origin-top-right shrink-0" />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest",
                                isVencida ? "text-red-600" : "text-amber-600"
                            )}>
                                <Icon name="event" size="xs" />
                                Vence: {dateLabel}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={irATareasDeHoy}
                className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-marca-primario transition-colors duration-300 shrink-0 group cursor-pointer"
            >
                Ir a la bandeja de hoy
                <span className="transition-transform duration-300 group-hover:translate-x-1.5 flex items-center">
                    <Icon name="arrow_forward" size="xs" />
                </span>
            </button>
        </div>
    );
};