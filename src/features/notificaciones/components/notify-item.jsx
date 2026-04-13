import { Icon, Button } from '@/components/ui/z_index';
import { formatRelativo } from '@/lib/date';
import { cn } from '@/utils/cn';

const ROLES_ADMIN = new Set(['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO']);

export const TIPO_CONFIG = {
    NUEVO_REPORTE: { icon: 'report', color: 'text-estado-pendiente', bg: 'bg-estado-pendiente/10', label: 'Nuevo reporte' },
    TAREA_ASIGNADA: { icon: 'engineering', color: 'text-estado-asignada', bg: 'bg-estado-asignada/10', label: 'Tarea asignada' },
    TAREA_INICIADA: { icon: 'play_circle', color: 'text-estado-en-progreso', bg: 'bg-estado-en-progreso/10', label: 'Tarea iniciada' },
    TAREA_PAUSADA: { icon: 'pause_circle', color: 'text-estado-en-pausa', bg: 'bg-estado-en-pausa/10', label: 'Tarea pausada' },
    TAREA_RESUELTA: { icon: 'check_circle', color: 'text-estado-resuelto', bg: 'bg-estado-resuelto/10', label: 'Tarea resuelta' },
    TAREA_CERRADA: { icon: 'done_outline', color: 'text-estado-resuelto', bg: 'bg-estado-resuelto/10', label: 'Tarea cerrada' },
    TAREA_RECHAZADA: { icon: 'cancel', color: 'text-estado-rechazado', bg: 'bg-estado-rechazado/10', label: 'Tarea rechazada' },
    TAREA_CANCELADA: { icon: 'block', color: 'text-estado-cancelada', bg: 'bg-estado-cancelada/10', label: 'Tarea cancelada' },
    TAREA_MODIFICADA: { icon: 'edit', color: 'text-prioridad-media', bg: 'bg-prioridad-media/10', label: 'Tarea modificada' },
    TAREA_REASIGNADA: { icon: 'swap_horiz', color: 'text-estado-asignada', bg: 'bg-estado-asignada/10', label: 'Reasignación' },
    REVISION_PENDIENTE: { icon: 'fact_check', color: 'text-estado-resuelto', bg: 'bg-estado-resuelto/10', label: 'Revisión pendiente' },
    EQUIPO_RECHAZO: { icon: 'warning', color: 'text-estado-rechazado', bg: 'bg-estado-rechazado/10', label: 'Rechazo del equipo' },
};

const buildAcciones = (notif, rol) => {
    const { tipo, tareaId, accionada } = notif;

    if (!tareaId) return [];

    const esTecnico = rol === 'TECNICO';
    const esAdmin = ROLES_ADMIN.has(rol);
    const esJefe = rol === 'JEFE_MTTO';
    const esCoord = rol === 'COORDINADOR_MTTO';

    const verDetalle = (label = 'Ver detalles') => ({
        key: 'ver_detalle',
        label,
        icon: 'visibility',
        variant: 'ghost',
        isStatus: false,
    });

    const irAHoy = (label = 'Ir a mis tareas') => ({
        key: 'ir_a_hoy',
        label,
        icon: 'today',
        variant: 'accion',
        isStatus: false,
    });

    const chip = (label, icon, chipClass) => ({
        key: '_chip',
        label,
        icon,
        isStatus: true,
        chipClass,
    });

    switch (tipo) {
        case 'TAREA_ASIGNADA':
            if (accionada) {
                return [
                    verDetalle(),
                    chip('Tarea iniciada', 'play_circle', 'bg-estado-en-progreso/10 text-estado-en-progreso border-estado-en-progreso/30'),
                ];
            }
            if (esTecnico || esAdmin) {
                return [
                    verDetalle(),
                    { key: 'iniciar', label: 'Iniciar', icon: 'play_arrow', variant: 'accion', isStatus: false, isCTA: true },
                ];
            }
            return [verDetalle()];

        case 'TAREA_CANCELADA':
            return [verDetalle()];

        case 'TAREA_RECHAZADA':
            if (esTecnico) {
                return [
                    verDetalle('Ver motivo'),
                    irAHoy('Ir a mis tareas'),
                ];
            }
            if (esAdmin) {
                return [
                    verDetalle('Ver motivo'),
                    irAHoy('Ver tarea'),
                ];
            }
            return [verDetalle('Ver motivo')];

        case 'TAREA_CERRADA':
            return [verDetalle()];

        case 'TAREA_MODIFICADA':
        case 'TAREA_REASIGNADA':
            return [verDetalle()];

        case 'REVISION_PENDIENTE':
        case 'TAREA_RESUELTA':
            if (accionada) {
                return [
                    verDetalle(),
                    chip('Revisada', 'check_circle', 'bg-estado-resuelto/10 text-estado-resuelto border-estado-resuelto/30'),
                ];
            }
            if (esAdmin || esJefe || esCoord) {
                return [
                    verDetalle(),
                    { key: 'revisar', label: 'Revisar', icon: 'fact_check', variant: 'guardar', isStatus: false, isCTA: true },
                ];
            }
            return [verDetalle()];

        case 'EQUIPO_RECHAZO':
            if (esAdmin) {
                return [
                    verDetalle('Ver motivo'),
                    irAHoy('Ver tarea'),
                ];
            }
            return [verDetalle('Ver motivo')];

        case 'NUEVO_REPORTE':
            if (esAdmin) {
                return [
                    verDetalle(),
                    { key: 'ir_a_bandeja', label: 'Ver en bandeja', icon: 'inbox', variant: 'accion', isStatus: false },
                ];
            }
            return tareaId ? [verDetalle()] : [];

        case 'TAREA_INICIADA':
        case 'TAREA_PAUSADA':
            return [verDetalle()];

        default:
            return tareaId ? [verDetalle()] : [];
    }
};

export const NotifyItem = ({
    notificacion,
    currentUser,
    onAction,
    onMarkRead,
    variant = 'desktop',
}) => {
    const cfg = TIPO_CONFIG[notificacion.tipo] ?? TIPO_CONFIG.NUEVO_REPORTE;
    const acciones = buildAcciones(notificacion, currentUser?.rol);

    const handleAction = (actionKey) => {
        if (!notificacion.leida) onMarkRead?.(notificacion.id);
        onAction?.(notificacion, actionKey);
    };

    const renderAccion = (accion) => {
        if (accion.isStatus) {
            return (
                <span
                    key={accion.key}
                    className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border',
                        accion.chipClass ?? 'bg-estado-resuelto/10 text-estado-resuelto border-estado-resuelto/30'
                    )}
                >
                    <Icon name={accion.icon} size="xs" />
                    {accion.label}
                </span>
            );
        }
        return (
            <Button
                key={accion.key}
                variant={accion.variant}
                size="sm"
                icon={accion.icon}
                onClick={() => handleAction(accion.key)}
            >
                {accion.label}
            </Button>
        );
    };

    if (variant === 'mobile') {
        return (
            <div
                className={cn(
                    'relative rounded-2xl p-4 border transition-all',
                    notificacion.leida
                        ? 'bg-white border-slate-200'
                        : 'bg-blue-50/50 border-estado-asignada/25 shadow-sm'
                )}
            >
                {!notificacion.leida && (
                    <div className="absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full bg-estado-asignada" />
                )}

                <div className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', cfg.bg)}>
                        <Icon name={cfg.icon} size="sm" className={cfg.color} />
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                        <p className={cn('text-sm font-bold leading-snug', notificacion.leida ? 'text-slate-700' : 'text-slate-900')}>
                            {notificacion.titulo}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-3">
                            {notificacion.cuerpo}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                            <Icon name="schedule" size="xs" />
                            {formatRelativo(notificacion.createdAt)}
                        </p>
                    </div>
                </div>

                {acciones.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
                        {acciones.map(renderAccion)}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex items-start gap-4 px-5 py-4 border-b border-slate-100 last:border-0 transition-colors',
                notificacion.leida ? 'hover:bg-slate-50/70' : 'bg-blue-50/25 hover:bg-blue-50/50'
            )}
        >
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5', cfg.bg)}>
                <Icon name={cfg.icon} size="sm" className={cfg.color} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <p className={cn('text-sm font-bold', notificacion.leida ? 'text-slate-700' : 'text-slate-900')}>
                        {notificacion.titulo}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        {!notificacion.leida && (
                            <div className="w-2 h-2 rounded-full bg-estado-asignada" />
                        )}
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                            {formatRelativo(notificacion.createdAt)}
                        </span>
                    </div>
                </div>

                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                    {notificacion.cuerpo}
                </p>

                {acciones.length > 0 && (
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        {acciones.map(renderAccion)}
                    </div>
                )}
            </div>
        </div>
    );
};