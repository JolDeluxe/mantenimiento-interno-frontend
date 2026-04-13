// src/features/notificaciones/components/notify-config.js
export const TIPO_CONFIG = {
    NUEVO_REPORTE:     { icon: 'report',         color: 'text-estado-pendiente',   bg: 'bg-estado-pendiente/10',   label: 'Nuevo reporte'        },
    TAREA_ASIGNADA:    { icon: 'engineering',    color: 'text-estado-asignada',    bg: 'bg-estado-asignada/10',    label: 'Tarea asignada'       },
    TAREA_INICIADA:    { icon: 'play_circle',    color: 'text-estado-en-progreso', bg: 'bg-estado-en-progreso/10', label: 'Tarea iniciada'       },
    TAREA_PAUSADA:     { icon: 'pause_circle',   color: 'text-estado-en-pausa',    bg: 'bg-estado-en-pausa/10',    label: 'Tarea pausada'        },
    TAREA_RESUELTA:    { icon: 'check_circle',   color: 'text-estado-resuelto',    bg: 'bg-estado-resuelto/10',    label: 'Tarea resuelta'       },
    TAREA_CERRADA:     { icon: 'done_outline',   color: 'text-estado-resuelto',    bg: 'bg-estado-resuelto/10',    label: 'Tarea cerrada' },
    TAREA_RECHAZADA:   { icon: 'cancel',         color: 'text-estado-rechazado',   bg: 'bg-estado-rechazado/10',   label: 'Tarea rechazada'      },
    TAREA_CANCELADA:   { icon: 'block',          color: 'text-estado-cancelada',   bg: 'bg-estado-cancelada/10',   label: 'Tarea cancelada'      },
    TAREA_MODIFICADA:  { icon: 'edit',           color: 'text-prioridad-media',    bg: 'bg-prioridad-media/10',    label: 'Tarea modificada'     },
    TAREA_REASIGNADA:  { icon: 'swap_horiz',     color: 'text-estado-asignada',    bg: 'bg-estado-asignada/10',    label: 'Reasignación'         },
    REVISION_PENDIENTE:{ icon: 'fact_check',     color: 'text-estado-resuelto',    bg: 'bg-estado-resuelto/10',    label: 'Revisión pendiente'   },
    EQUIPO_RECHAZO:    { icon: 'warning',        color: 'text-estado-rechazado',   bg: 'bg-estado-rechazado/10',   label: 'Rechazo del equipo'   },
};