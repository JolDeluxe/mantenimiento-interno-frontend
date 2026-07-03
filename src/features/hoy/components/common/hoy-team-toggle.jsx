// src/features/hoy/components/common/hoy-team-toggle.jsx
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';

const Badge = ({ count, active, isMobile }) => {
    if (!count || count <= 0) return null;
    if (isMobile) {
        return (
            <span className={cn(
                "ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold leading-none min-w-[16px] text-center transition-all duration-300 relative z-10",
                active 
                    ? "bg-white/25 text-white" 
                    : "bg-slate-200 text-slate-600"
            )}>
                {count}
            </span>
        );
    }
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

export const HoyTeamToggle = ({
    vistaEquipo,
    value,
    onChange,
    isMobile = false,
    misTareasCount = 0,
    misCount,
    equipoCount = 0,
    eqCount
}) => {
    // Soporte para ambos nombres de props usados en el codebase
    const isTeam = vistaEquipo ?? value ?? false;
    const myCount = misTareasCount || misCount || 0;
    const teamCount = equipoCount || eqCount || 0;

    if (isMobile) {
        const containerStyle = { 
            display: 'inline-flex', 
            padding: 4, 
            borderRadius: 14, 
            gap: 3, 
            position: 'relative', 
            overflow: 'hidden', 
            ...glassBase('light'), 
            width: '100%' 
        };

        const activeStyle = { ...glassBase('primary'), borderRadius: 10, position: 'relative', overflow: 'hidden', flex: 1 };
        const inactiveStyle = { borderRadius: 10, background: 'transparent', border: '1px solid transparent', position: 'relative', flex: 1 };

        return (
            <div style={containerStyle}>
                <GlassSheen />
                <button
                    type="button"
                    onClick={() => onChange(false)}
                    style={!isTeam ? activeStyle : inactiveStyle}
                    className="flex items-center justify-center gap-1.5 py-1.5 transition-all duration-200 active:scale-95 outline-none select-none relative z-10 cursor-pointer"
                >
                    {!isTeam && <GlassSheen />}
                    <Icon name="person" size="xs" className={cn('relative z-10 transition-colors', !isTeam ? 'text-white' : 'text-slate-600')} />
                    <span className={cn('text-xs font-bold relative z-10 transition-colors', !isTeam ? 'text-white' : 'text-slate-600')}>Mis Tareas</span>
                    <Badge count={myCount} active={!isTeam} isMobile={true} />
                </button>
                <button
                    type="button"
                    onClick={() => onChange(true)}
                    style={isTeam ? activeStyle : inactiveStyle}
                    className="flex items-center justify-center gap-1.5 py-1.5 transition-all duration-200 active:scale-95 outline-none select-none relative z-10 cursor-pointer"
                >
                    {isTeam && <GlassSheen />}
                    <Icon name="groups" size="xs" className={cn('relative z-10 transition-colors', isTeam ? 'text-white' : 'text-slate-600')} />
                    <span className={cn('text-xs font-bold relative z-10 transition-colors', isTeam ? 'text-white' : 'text-slate-600')}>Equipo</span>
                    <Badge count={teamCount} active={isTeam} isMobile={true} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner transition-all w-72">
            <button
                type="button"
                onClick={() => onChange(false)}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer",
                    !isTeam 
                        ? "bg-white text-marca-primario shadow-sm scale-[1.02]" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
            >
                <Icon name="person" size="xs" className={!isTeam ? "text-marca-primario" : "text-slate-400"} />
                <span>Mis Tareas</span>
                <Badge count={myCount} active={!isTeam} isMobile={false} />
            </button>
            <button
                type="button"
                onClick={() => onChange(true)}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer",
                    isTeam 
                        ? "bg-white text-marca-primario shadow-sm scale-[1.02]" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
            >
                <Icon name="groups" size="xs" className={isTeam ? "text-marca-primario" : "text-slate-400"} />
                <span>Equipo</span>
                <Badge count={teamCount} active={isTeam} isMobile={false} />
            </button>
        </div>
    );
};
