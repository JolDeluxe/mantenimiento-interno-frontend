import { useNavigate } from 'react-router-dom';
import { Icon, Button } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const getEstadoVisual = (tarea) => {
    if (tarea.historial && tarea.historial.length > 0) return { label: 'Rechazada', color: 'text-red-700 bg-red-50 border-red-200', icon: 'error' };
    if (!tarea.fechaVencimiento) return { label: 'Sin Fecha', color: 'text-slate-500 bg-slate-50 border-slate-200', icon: 'schedule' };

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(tarea.fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0);

    if (vencimiento < hoy) return { label: 'Atrasada', color: 'text-orange-700 bg-orange-50 border-orange-200', icon: 'warning' };
    if (vencimiento.getTime() === hoy.getTime()) return { label: 'Para Hoy', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: 'today' };
    return { label: 'Próxima', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: 'event' };
};

export const TecnicoTareasHoy = ({ tareas = [], onVerDetalle }) => {
    const navigate = useNavigate();
    const listaTareas = Array.isArray(tareas) ? tareas : [];
    const hayTareas = listaTareas.length > 0;

    return (
        <div className="max-sm:bg-white/60 max-sm:backdrop-blur-2xl max-sm:border-white/40 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 h-full">

            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Icon name="today" size="xs" /> Tablero de Acción
                </h4>
                {hayTareas && (
                    <span className="bg-marca-primario/10 text-marca-primario text-[10px] items-center font-black px-2.5 py-0.5 rounded-full border border-marca-primario/20 shadow-sm">
                        {listaTareas.length}
                    </span>
                )}
            </div>

            {/* Listado Principal */}
            <div className="flex-1 flex flex-col min-h-[200px]">
                {hayTareas ? (
                    <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                        {listaTareas.slice(0, 5).map((tarea) => {
                            const visual = getEstadoVisual(tarea);

                            return (
                                <div key={tarea.id} className="flex flex-col p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-300 transition-colors shadow-sm gap-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex flex-col min-w-0 flex-1 pr-2">
                                            <span className="text-xs font-bold text-slate-700 line-clamp-2 leading-tight">
                                                {tarea.titulo || 'Tarea sin título'}
                                            </span>
                                        </div>

                                        {/* Botón que notifica al Padre */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                // Llama a la función inyectada por el componente padre
                                                if (onVerDetalle) onVerDetalle(tarea.id);
                                            }}
                                            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-marca-primario hover:border-marca-primario/30 hover:bg-white shadow-sm transition-all cursor-pointer pointer-events-auto"
                                            title="Ver detalles del ticket"
                                        >
                                            <div className="pointer-events-none flex items-center justify-center">
                                                <Icon name="visibility" size="xs" />
                                            </div>
                                        </button>
                                    </div>

                                    {/* Footer del Item */}
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            {tarea.prioridad || 'NORMAL'}
                                        </span>
                                        <div className={cn("flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border", visual.color)}>
                                            <Icon name={visual.icon} size="xs" className="scale-75" />
                                            {visual.label}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {listaTareas.length > 5 && (
                            <div className="text-center mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                + {listaTareas.length - 5} tareas en cola
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-4 text-center gap-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                            <Icon name="task_alt" size="lg" className="text-emerald-300" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-bold text-slate-500">Todo al día</p>
                            <p className="text-xs font-semibold text-slate-400">Sin pendientes inmediatos</p>
                        </div>
                    </div>
                )}
            </div>

            <Button
                variant="accion"
                className="w-full mt-auto shrink-0"
                onClick={() => navigate('/app/tickets')}
            >
                {hayTareas ? 'Ir a mi tablero de tickets' : 'Ver todos los tickets'}
            </Button>
        </div>
    );
};