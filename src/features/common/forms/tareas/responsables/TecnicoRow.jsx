import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { WorkloadBadge } from './WorkloadBadge';

export const TecnicoRow = ({ tecnico, isSelected, onClick }) => {
    const wl = tecnico.workload || { asignadas: 0, enProgreso: 0, enPausa: 0 };
    const sinTareas = wl.asignadas === 0 && wl.enProgreso === 0 && wl.enPausa === 0;
    const totalTareas = wl.asignadas + wl.enProgreso + wl.enPausa;

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-slate-50 last:border-0 cursor-pointer',
                isSelected
                    ? 'bg-marca-primario/8 hover:bg-marca-primario/10'
                    : 'bg-white hover:bg-slate-50'
            )}
        >
            {tecnico.imagen ? (
                <img
                    src={tecnico.imagen}
                    alt={tecnico.nombre}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/img/perfil-no-foto.webp'; }}
                />
            ) : (
                <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0',
                    isSelected ? 'bg-marca-primario text-white' : 'bg-marca-primario/10 text-marca-primario'
                )}>
                    {tecnico.nombre?.charAt(0).toUpperCase() ?? '?'}
                </div>
            )}

            <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                        'text-sm font-bold truncate',
                        isSelected ? 'text-marca-primario' : 'text-slate-800'
                    )}>
                        {tecnico.nombre}
                    </span>
                    {sinTareas ? (
                        <span className="text-[10px] font-bold text-estado-resuelto bg-estado-resuelto/10 px-1.5 py-0.5 rounded-full shrink-0">
                            Sin Tareas
                        </span>
                    ) : (
                        <span className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
                            totalTareas >= 5
                                ? 'bg-estado-rechazado/10 text-estado-rechazado'
                                : totalTareas >= 3
                                    ? 'bg-prioridad-alta/10 text-prioridad-alta'
                                    : 'bg-estado-pendiente/10 text-estado-pendiente'
                        )}>
                            {totalTareas} tarea{totalTareas !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                    {tecnico.cargo && (
                        <span className="text-[10px] text-slate-400 truncate">{tecnico.cargo}</span>
                    )}
                    {!sinTareas && (
                        <>
                            {tecnico.cargo && <span className="text-[10px] text-slate-300">·</span>}
                            {wl.asignadas > 0 && (
                                <WorkloadBadge label="Asig." count={wl.asignadas} colorClass="bg-estado-asignada/10 text-estado-asignada" />
                            )}
                            {wl.enProgreso > 0 && (
                                <WorkloadBadge label="Prog." count={wl.enProgreso} colorClass="bg-estado-en-progreso/10 text-estado-en-progreso" />
                            )}
                            {wl.enPausa > 0 && (
                                <WorkloadBadge label="Pausa" count={wl.enPausa} colorClass="bg-estado-en-pausa/10 text-estado-en-pausa" />
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className={cn(
                'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                isSelected ? 'bg-marca-primario border-marca-primario' : 'border-slate-300 bg-white'
            )}>
                {isSelected && <Icon name="check" size="xs" className="text-white" />}
            </div>
        </button>
    );
};
