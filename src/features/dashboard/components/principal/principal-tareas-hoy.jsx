// src/features/dashboard/components/principal/principal-tareas-hoy.jsx
import { useNavigate } from 'react-router-dom';
import { Icon, Button, Skeleton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const CHIP_CONFIG = {
    ASIGNADA: { label: 'asig.', cls: 'bg-blue-100   text-blue-700   border-blue-200' },
    EN_PROGRESO: { label: 'en progreso', cls: 'bg-violet-100 text-violet-700 border-violet-200', pulse: true },
    EN_PAUSA: { label: 'en pausa', cls: 'bg-slate-200  text-slate-600  border-slate-300' },
    RECHAZADO: { label: 'rechazada/s', cls: 'bg-red-100    text-red-700    border-red-200', pulse: true },
};

export const PrincipalTareasHoy = ({ conteosPorEstado = {}, loading = false }) => {
    const navigate = useNavigate();

    const asignadas = conteosPorEstado.ASIGNADA ?? 0;
    const enProgreso = conteosPorEstado.EN_PROGRESO ?? 0;
    const enPausa = conteosPorEstado.EN_PAUSA ?? 0;
    const rechazadas = conteosPorEstado.RECHAZADO ?? 0;

    const total = asignadas + enProgreso + enPausa + rechazadas;

    const hayAlerta = rechazadas > 0;
    const hayProgreso = enProgreso > 0 && !hayAlerta;

    if (loading) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-44 rounded-md" />
                </div>
                <Skeleton className="h-9 w-24 rounded-xl shrink-0" />
            </div>
        );
    }

    if (total === 0) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 md:p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <Icon name="check_circle" size="lg" className="text-emerald-600" fill />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-emerald-800 uppercase tracking-wide">
                        Tareas de Hoy
                    </p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">
                        Sin tareas activas · Todo bajo control
                    </p>
                </div>
                <Button
                    variant="guardar"
                    size="sm"
                    icon="today"
                    onClick={() => navigate('/tickets/hoy')}
                    className="shrink-0"
                >
                    Ver Bandeja
                </Button>
            </div>
        );
    }

    const theme = hayAlerta
        ? {
            border: 'border-red-300',
            bg: 'bg-red-50',
            iconBg: 'bg-red-100',
            iconName: 'warning',
            iconCls: 'text-red-600',
            title: 'text-red-900',
            btn: 'borrar',
        }
        : hayProgreso
            ? {
                border: 'border-violet-200',
                bg: 'bg-violet-50',
                iconBg: 'bg-violet-100',
                iconName: 'play_circle',
                iconCls: 'text-violet-600',
                title: 'text-violet-900',
                btn: 'progreso',
            }
            : {
                border: 'border-blue-200',
                bg: 'bg-blue-50',
                iconBg: 'bg-blue-100',
                iconName: 'assignment_turned_in',
                iconCls: 'text-blue-600',
                title: 'text-blue-900',
                btn: 'accion',
            };

    const chips = [
        { key: 'ASIGNADA', count: asignadas },
        { key: 'EN_PROGRESO', count: enProgreso },
        { key: 'EN_PAUSA', count: enPausa },
        { key: 'RECHAZADO', count: rechazadas },
    ].filter(c => c.count > 0);

    return (
        <div className={cn(
            'rounded-2xl p-4 md:p-5 shadow-sm flex items-center gap-4 border',
            theme.bg, theme.border
        )}>
            <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                theme.iconBg
            )}>
                <Icon name={theme.iconName} size="lg" className={theme.iconCls} fill />
            </div>

            <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-black uppercase tracking-wide', theme.title)}>
                    Tareas de Hoy
                </p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {chips.map(({ key, count }) => {
                        const cfg = CHIP_CONFIG[key];
                        return (
                            <span
                                key={key}
                                className={cn(
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    cfg.cls,
                                    cfg.pulse && 'animate-pulse'
                                )}
                            >
                                {count} {cfg.label}
                            </span>
                        );
                    })}
                </div>
            </div>

            <Button
                variant={theme.btn}
                size="sm"
                icon="arrow_forward"
                onClick={() => navigate('/tickets/hoy')}
                className="shrink-0"
            >
                Ir Ahora
            </Button>
        </div>
    );
};