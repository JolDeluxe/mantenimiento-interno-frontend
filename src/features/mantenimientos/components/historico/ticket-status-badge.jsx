// src/features/tickets/components/historico/ticket-status-badge.jsx
import { cn } from '@/utils/cn';

const ESTADO_CONFIG = {
    PENDIENTE: { label: 'Pendiente', bg: 'bg-estado-pendiente/10   text-estado-pendiente   border-estado-pendiente/30' },
    ASIGNADA: { label: 'Asignada', bg: 'bg-estado-asignada/10    text-estado-asignada    border-estado-asignada/30' },
    EN_PROGRESO: { label: 'En Progreso', bg: 'bg-estado-en-progreso/10 text-estado-en-progreso border-estado-en-progreso/30' },
    EN_PAUSA: { label: 'En Pausa', bg: 'bg-estado-en-pausa/10    text-estado-en-pausa    border-estado-en-pausa/30' },
    RESUELTO: { label: 'Resuelto', bg: 'bg-estado-resuelto/10    text-estado-resuelto    border-estado-resuelto/30' },
    CERRADO: { label: 'Cerrado', bg: 'bg-estado-cerrado/10     text-estado-cerrado     border-estado-cerrado/30' },
    RECHAZADO: { label: 'Rechazado', bg: 'bg-estado-rechazado/10   text-estado-rechazado   border-estado-rechazado/30' },
    CANCELADA: { label: 'Cancelada', bg: 'bg-estado-cancelada/10   text-estado-cancelada   border-estado-cancelada/30' },
};

const PRIORIDAD_CONFIG = {
    BAJA: { label: 'Baja', cls: 'text-prioridad-baja   bg-prioridad-baja/10   border-prioridad-baja/30' },
    MEDIA: { label: 'Media', cls: 'text-prioridad-media  bg-prioridad-media/10  border-prioridad-media/30' },
    ALTA: { label: 'Alta', cls: 'text-prioridad-alta   bg-prioridad-alta/10   border-prioridad-alta/30' },
    CRITICA: { label: 'Crítica', cls: 'text-prioridad-critica bg-prioridad-critica/10 border-prioridad-critica/30' },
};

export const TicketStatusBadge = ({ estado, className }) => {
    const cfg = ESTADO_CONFIG[estado] ?? { label: estado, bg: 'bg-slate-100 text-slate-600 border-slate-200' };
    return (
        <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide whitespace-nowrap',
            cfg.bg, className
        )}>
            {cfg.label}
        </span>
    );
};

export const TicketPriorityBadge = ({ prioridad, className }) => {
    const cfg = PRIORIDAD_CONFIG[prioridad] ?? { label: prioridad, cls: 'text-slate-600 bg-slate-100 border-slate-200' };
    return (
        <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border whitespace-nowrap',
            cfg.cls, className
        )}>
            {cfg.label}
        </span>
    );
};