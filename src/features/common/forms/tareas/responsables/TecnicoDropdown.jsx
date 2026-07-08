import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { WorkloadBadge } from './WorkloadBadge';

export const TecnicoDropdown = ({ opciones, onAdd, disabled, onToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false); onToggle?.(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onToggle]);

    const toggle = () => {
        if (disabled) return;
        const next = !isOpen;
        setIsOpen(next);
        onToggle?.(next);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={toggle} className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-sm border rounded-lg transition-colors",
                disabled ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-white border-slate-300 hover:border-marca-primario text-slate-700 cursor-pointer"
            )}>
                <div className="flex items-center gap-2">
                    <Icon name="engineering" size="sm" className={disabled ? "text-slate-400" : "text-slate-500"} />
                    <span>Añadir técnico...</span>
                </div>
                <Icon name={isOpen ? "expand_less" : "expand_more"} size="sm" />
            </div>
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {opciones.length === 0 ? (
                        <div className="p-3 text-sm text-center text-slate-500">No hay más técnicos disponibles</div>
                    ) : (
                        opciones.map(opt => {
                            const t = opt.tecnico;
                            const wl = t.workload || { asignadas: 0, enProgreso: 0, enPausa: 0 };
                            const sinTareas = wl.asignadas === 0 && wl.enProgreso === 0 && wl.enPausa === 0;
                            return (
                                <button key={opt.value} type="button"
                                    onClick={() => { onAdd(opt.value); setIsOpen(false); onToggle?.(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left cursor-pointer border-b border-slate-100 last:border-0">
                                    {t.imagen ? (
                                        <img src={t.imagen} alt={t.nombre}
                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/img/perfil-no-foto.webp'; }} />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-marca-primario/10 flex items-center justify-center text-xs font-bold text-marca-primario shrink-0">
                                            {t.nombre?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-sm font-semibold text-slate-800 truncate">{t.nombre}</span>
                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                            {t.cargo && <span className="text-[10px] text-slate-400 truncate">{t.cargo}</span>}
                                            {sinTareas ? (
                                                <span className="text-[10px] text-estado-resuelto italic">Sin tareas</span>
                                            ) : (
                                                <>
                                                    {wl.asignadas > 0 && <WorkloadBadge label="Asig." count={wl.asignadas} colorClass="bg-estado-asignada/10 text-estado-asignada" />}
                                                    {wl.enProgreso > 0 && <WorkloadBadge label="Prog." count={wl.enProgreso} colorClass="bg-estado-en-progreso/10 text-estado-en-progreso" />}
                                                    {wl.enPausa > 0 && <WorkloadBadge label="Pausa" count={wl.enPausa} colorClass="bg-estado-en-pausa/10 text-estado-en-pausa" />}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};
