// src/features/hoy/components/common/hoy-aprobar-panel.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

export const HoyAprobarPanel = ({ toApproveCount, currentUser, isMobile = false }) => {
    const navigate = useNavigate();

    // Roles permitidos para ver el panel de aprobación
    const rolesSupervisor = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];
    const esSupervisor = rolesSupervisor.includes(currentUser?.rol);

    if (!esSupervisor || !toApproveCount || toApproveCount <= 0) {
        return null;
    }

    return (
        <div 
            onClick={() => navigate('/tickets/aprobar')}
            className={cn(
                "relative overflow-hidden flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer group shadow-sm select-none",
                "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/15 hover:to-teal-500/15 border-emerald-500/20 hover:border-emerald-500/30",
                isMobile ? "mx-1 mt-1" : "w-full"
            )}
        >
            {/* Ambient Glow / Refracción de Luz */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500" />
            
            <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-estado-resuelto text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                    <Icon name="fact_check" size="md" className="text-white" fill />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-slate-800 leading-snug">
                        {toApproveCount === 1 
                            ? "Hay 1 tarea resuelta esperando tu aprobación"
                            : `Hay ${toApproveCount} tareas resueltas esperando tu aprobación`
                        }
                    </span>
                    <span className="text-xs font-semibold text-slate-500 mt-0.5 opacity-90">
                        Haz clic aquí para revisar y cerrar o rebotar las tareas del equipo.
                    </span>
                </div>
            </div>

            <button
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-emerald-500/10 text-estado-resuelto shadow-sm transition-all duration-300 group-hover:bg-estado-resuelto group-hover:text-white group-hover:scale-105 group-hover:shadow-md cursor-pointer relative z-10 shrink-0"
            >
                <Icon name="arrow_forward" size="sm" />
            </button>
        </div>
    );
};
