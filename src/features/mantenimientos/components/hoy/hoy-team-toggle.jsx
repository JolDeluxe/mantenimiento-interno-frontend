// src/features/tickets/components/hoy/hoy-team-toggle.jsx
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const Badge = ({ count, active }) => {
    if (!count || count <= 0) return null;
    return (
        <span className={cn(
            "ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none min-w-[18px] text-center transition-all duration-300",
            active 
                ? "bg-marca-primario text-white shadow-sm scale-110" 
                : "bg-slate-200 text-slate-500 opacity-80"
        )}>
            {count}
        </span>
    );
};

export const HoyTeamToggle = ({ vistaEquipo, onChange, isMobile = false, misTareasCount = 0, equipoCount = 0 }) => {
    return (
        <div className={cn(
            "flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner transition-all",
            isMobile ? "w-full" : "w-72"
        )}>
            <button
                type="button"
                onClick={() => onChange(false)}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer",
                    !vistaEquipo 
                        ? "bg-white text-marca-primario shadow-sm scale-[1.02]" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
            >
                <Icon name="person" size="xs" className={!vistaEquipo ? "text-marca-primario" : "text-slate-400"} />
                <span>Mis Tareas</span>
                <Badge count={misTareasCount} active={!vistaEquipo} />
            </button>
            <button
                type="button"
                onClick={() => onChange(true)}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer",
                    vistaEquipo 
                        ? "bg-white text-marca-primario shadow-sm scale-[1.02]" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
            >
                <Icon name="groups" size="xs" className={vistaEquipo ? "text-marca-primario" : "text-slate-400"} />
                <span>Equipo</span>
                <Badge count={equipoCount} active={vistaEquipo} />
            </button>
        </div>
    );
};

