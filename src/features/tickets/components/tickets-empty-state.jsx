import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

export const TicketsEmptyState = ({
    isFiltering,
    isMobile = false,
    mensaje = "Bandeja limpia",
    subtexto = "No hay tickets pendientes o registrados en esta sección por el momento.",
    icon = "done_all"
}) => {
    const title = isFiltering ? 'Sin coincidencias' : mensaje;
    const description = isFiltering ? 'No encontramos tickets que coincidan con los filtros aplicados. Prueba cambiando tu búsqueda.' : subtexto;
    const currentIcon = isFiltering ? 'filter_list_off' : icon;

    return (
        <div className={cn(
            "flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-3xl animate-in fade-in zoom-in duration-500",
            isMobile ? "p-8 my-4" : "p-24 my-6"
        )}>
            {/* Contenedor del ícono ajustado */}
            <div className={cn(
                "bg-slate-50 rounded-full flex items-center justify-center mb-5 shadow-inner",
                isMobile ? "w-14 h-14" : "w-24 h-24"
            )}>
                {/* Ícono con tamaño forzado exacto por clase Tailwind */}
                <Icon
                    name={currentIcon}
                    className={cn(
                        "text-slate-300",
                        isMobile ? "!text-[28px]" : "!text-[64px]"
                    )}
                />
            </div>

            <h4 className={cn(
                "font-black text-slate-800 uppercase tracking-tight text-center",
                isMobile ? "text-sm" : "text-xl"
            )}>
                {title}
            </h4>

            <p className={cn(
                "text-slate-400 font-medium mt-2 text-center max-w-sm",
                isMobile ? "text-[11px] leading-relaxed" : "text-sm"
            )}>
                {description}
            </p>
        </div>
    );
};