import React from 'react';
import { Icon } from '@/components/ui/z_index';

export default function TicketsHoyPage() {
    return (
        <div className="flex flex-col animate-fade-in pb-24">
            {/* Header de la vista vacía */}
            <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="bg-slate-200/50 p-4 rounded-full mb-4">
                    <Icon name="today" size="48px" className="text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700 mb-2">Tareas de Hoy</h2>
                <p className="text-slate-500 max-w-md px-4 text-sm">
                    (En construcción) Contenido de prueba generado para evaluar la responsividad y el comportamiento sticky del layout.
                </p>
            </div>

            {/* Mock Data para forzar el Scroll */}
            <div className="flex flex-col gap-3 px-1 mt-4">
                {Array.from({ length: 15 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                                TCK-2024-{String(index + 1).padStart(3, '0')}
                            </span>
                            <span className="text-[10px] font-bold bg-marca-primario/10 text-marca-primario px-2 py-0.5 rounded-full">
                                PENDIENTE
                            </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 leading-snug">
                            Revisión de Mantenimiento Equipo #{index + 1}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2">
                            Se requiere inspección física y actualización de la bitácora para asegurar que las métricas operativas se mantengan dentro del umbral permitido.
                        </p>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                            <Icon name="schedule" size="xs" className="text-slate-400" />
                            <span className="text-xs text-slate-400 font-medium">Hace 2 horas</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}