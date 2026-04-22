import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

export default function DashboardEmptyState({ mensaje = "Sin datos en este periodo", subtexto = "Prueba seleccionando otro rango de fechas o verifica la actividad del equipo.", isMobile = false }) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-3xl animate-in fade-in zoom-in duration-500",
            isMobile ? "p-10 my-4" : "p-24 my-6"
        )}>
            <div className={cn(
                "bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner",
                isMobile ? "w-16 h-16" : "w-24 h-24"
            )}>
                <Icon name="analytics" size={isMobile ? "xl" : "custom"} className="text-slate-300" style={!isMobile ? { fontSize: '48px' } : {}} />
            </div>
            <h4 className={cn(
                "font-black text-slate-800 uppercase tracking-tight text-center",
                isMobile ? "text-sm" : "text-xl"
            )}>
                {mensaje}
            </h4>
            <p className={cn(
                "text-slate-400 font-medium mt-2 text-center max-w-sm",
                isMobile ? "text-[11px] leading-relaxed" : "text-sm"
            )}>
                {subtexto}
            </p>
        </div>
    );
}