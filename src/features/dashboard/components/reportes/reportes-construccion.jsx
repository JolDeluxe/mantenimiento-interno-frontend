// src/features/dashboard/components/reportes/reportes-construccion.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button } from '@/components/ui/z_index';

export const ReportesConstruccion = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center text-center py-12 px-4 animate-in fade-in zoom-in-95 duration-500 w-full">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-marca-primario/10 rounded-full flex items-center justify-center mb-5 sm:mb-6 shadow-inner">
                <Icon name="construction" size="xl" className="text-marca-primario" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-wide mb-2 fuente-titulos">
                Módulo en Construcción
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-8 leading-relaxed font-medium">
                Estamos diseñando nuevas métricas y reportes avanzados para brindarte una mejor visibilidad operativa. Esta sección estará disponible en próximas actualizaciones.
            </p>
            <Button
                variant="primario"
                icon="arrow_back"
                onClick={() => navigate('/reportes/general')}
            >
                Volver al inicio
            </Button>
        </div>
    );
};