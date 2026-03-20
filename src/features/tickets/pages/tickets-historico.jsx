import React from 'react';
import { Icon } from '@/components/ui/z_index';

export default function TicketsHistoricoPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Icon name="history" size="48px" className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Histórico General</h2>
            <p className="text-slate-500 max-w-md">
                (En construcción) Aquí vivirá la tabla con el volumen pesado para auditorías.
            </p>
        </div>
    );
}