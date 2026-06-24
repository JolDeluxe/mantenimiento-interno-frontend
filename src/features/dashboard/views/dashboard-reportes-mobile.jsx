import React from 'react';
import { GlassFab } from '@/components/ui/z_index';
import { ReportesConstruccion } from '../components/reportes/reportes-construccion';
import { hardReload } from '@/utils/hard-reload';

export default function DashboardReportesMobile({ loading, onRefresh }) {
    return (
        <div className="relative pb-28 flex flex-col gap-4">
            <div className="px-1 mb-2">
                <span className="text-[10px] font-extrabold text-marca-primario bg-marca-primario/5 border border-marca-primario/20 px-2 py-1 rounded-md uppercase tracking-wider">
                    Reportes Detallados
                </span>
                <p className="text-xs text-slate-400 mt-2">
                    Generación de informes exportables y análisis avanzado de datos.
                </p>
            </div>

            <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl shadow-sm min-h-[50vh] flex items-center justify-center mx-1 p-4 animate-in fade-in zoom-in-95 duration-500">
                <ReportesConstruccion />
            </div>

            <GlassFab
                icon="refresh"
                onClick={hardReload}
                isLoading={loading}
                variant="neutral"
                size={50}
                bottom="84px"
                right="20px"
            />
        </div>
    );
}