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
        icon: "trash",
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
    }
};

export const TableActions = ({ row, actions = [] }) => {
    return (
        <div className="flex items-center justify-center gap-1.5">
            {actions.map(({ key, enabled, hidden, onClick, tooltip: tooltipOverride }) => {
                // Si la acción está explícitamente oculta o el usuario no tiene permiso (enabled: false), 
                // abortamos el renderizado para no dejar huecos ni iconos bloqueados.
                if (hidden || !enabled) return null;

                const config = ACTION_CONFIG[key];
                if (!config) return null;

                const tooltip = tooltipOverride ?? config.tooltip;

                return (
                    <Tooltip
                        key={key}
                        text={tooltip}
                        variant={config.variant || 'default'}
                        className="text-sm px-3 py-1.5"
                    >
                        <button
                            onClick={() => onClick?.(row)}
                            className={cn(
                                "p-1.5 rounded-md transition-colors cursor-pointer",
                                config.className
                            )}
                        >
                            <Icon name={config.icon} />
                        </button>
                    </Tooltip>
                );
            })}
        </div>
    );
};