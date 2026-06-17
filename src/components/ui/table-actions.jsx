// src/components/ui/table-actions.jsx
import { cn } from "@/utils/cn";
import { Icon } from "./icon";
import { Tooltip } from "./tooltip";

const ACTION_CONFIG = {
    ver_detalle: {
        icon: "visibility",
        tooltip: "Ver detalles",
        variant: "dark",
        className: "text-slate-600 hover:bg-slate-600/10",
    },
    editar: {
        icon: "edit",
        tooltip: "Editar",
        variant: "dark",
        className: "text-amber-500 hover:bg-amber-500/10",
    },
    borrar: {
        icon: "delete",
        tooltip: "Borrar",
        variant: "dark",
        className: "text-estado-rechazado hover:bg-estado-rechazado/10",
    },
    toggle_estatus_desactivar: {
        icon: "person_remove",
        tooltip: "Desactivar usuario",
        variant: "dark",
        className: "text-estado-rechazado hover:bg-estado-rechazado/10",
    },
    toggle_estatus_activar: {
        icon: "person_add",
        tooltip: "Activar usuario",
        variant: "dark",
        className: "text-estado-resuelto hover:bg-estado-resuelto/10",
    },
    // ── Acciones de Tickets ──
    asignar_tecnico: {
        icon: "engineering",
        tooltip: "Asignar técnico",
        variant: "dark",
        className: "text-estado-asignada hover:bg-estado-asignada/10",
    },
    cambiar_estado: {
        icon: "swap_horiz",
        tooltip: "Cambiar estado",
        variant: "dark",
        className: "text-estado-en-progreso hover:bg-estado-en-progreso/10",
    },
    revisar_ticket: {
        icon: "fact_check",
        tooltip: "Revisar",
        variant: "dark",
        className: "text-estado-resuelto hover:bg-estado-resuelto/10",
    },
    cancelar_ticket: {
        icon: "cancel",
        tooltip: "Cancelar ticket",
        variant: "error",
        className: "text-red-700 hover:bg-red-500/10",
    },
};

export const TableActions = ({ row, actions = [] }) => {
    return (
        <div className="flex items-center justify-center gap-1.5">
            {actions.map(({ key, enabled, hidden, onClick, tooltip: tooltipOverride }) => {
                if (hidden || !enabled) return null;

                let config = ACTION_CONFIG[key];
                if (!config) return null;

                if (key === 'cambiar_estado' && row?.estado) {
                    if (row.estado === 'ASIGNADA') {
                        config = {
                            icon: 'play_arrow',
                            tooltip: 'Iniciar tarea',
                            variant: 'dark',
                            className: 'text-estado-asignada hover:bg-estado-asignada/10'
                        };
                    } else if (row.estado === 'EN_PROGRESO' || row.estado === 'EN_PROCESO') {
                        config = {
                            icon: 'check_circle',
                            tooltip: 'Finalizar tarea',
                            variant: 'dark',
                            className: 'text-estado-resuelto hover:bg-estado-resuelto/10'
                        };
                    } else if (row.estado === 'EN_PAUSA') {
                        config = {
                            icon: 'play_arrow',
                            tooltip: 'Reanudar tarea',
                            variant: 'dark',
                            className: 'text-estado-asignada hover:bg-estado-asignada/10'
                        };
                    } else if (row.estado === 'RECHAZADO') {
                        config = {
                            icon: 'replay',
                            tooltip: 'Reiniciar tarea',
                            variant: 'dark',
                            className: 'text-estado-rechazado hover:bg-estado-rechazado/10'
                        };
                    }
                }

                const tooltip = tooltipOverride ?? config.tooltip;

                return (
                    <Tooltip
                        key={key}
                        text={tooltip}
                        variant={config.variant || 'default'}
                        // Reducción drástica del tamaño del Tooltip:
                        className="text-[13px] px-2 py-0.5 font-bold tracking-tight"
                    >
                        <button
                            onClick={() => onClick?.(row)}
                            className={cn(
                                "p-1.5 rounded-md transition-colors cursor-pointer", // Padding del botón intacto
                                config.className
                            )}
                        >
                            <Icon name={config.icon} size="sm" /> {/* Icono intacto */}
                        </button>
                    </Tooltip>
                );
            })}
        </div>
    );
};