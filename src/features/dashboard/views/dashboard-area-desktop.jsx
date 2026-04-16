import React from 'react';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { PlantaRow } from '../components/area/planta-row';
import { PlantaDetalle } from '../components/area/area-detalle-planta';
import { AreaDetalle } from '../components/area/area-detalle-area';

export default function DashboardAreaDesktop({
    loading,
    metricasPorPlanta = [],
    plantaDetalle,
    areaDetalle,
    onOpenPlanta,
    onOpenArea,
    onClosePlanta,
    onCloseArea
}) {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-marca-primario/10 rounded-lg">
                            <Icon name="analytics" size="sm" className="text-marca-primario" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Eficiencia por Centro Operativo</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-1">Comparativa de tiempos de respuesta y volumen de carga por planta y área.</p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                    </div>
                ) : metricasPorPlanta.length > 0 ? (
                    metricasPorPlanta.map((planta, idx) => (
                        <PlantaRow
                            key={idx}
                            planta={planta}
                            onOpenPlanta={onOpenPlanta}
                            onOpenArea={onOpenArea}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-3xl shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Icon name="search_off" size="xl" className="text-slate-300" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Sin resultados o error de conexión</span>
                        <span className="text-xs text-slate-400 font-medium mt-1 text-center max-w-xs">
                            No se encontraron métricas para este periodo o el endpoint del servidor no está disponible.
                        </span>
                    </div>
                )}
            </div>

            {plantaDetalle && <PlantaDetalle planta={plantaDetalle} onClose={onClosePlanta} />}
            {areaDetalle && <AreaDetalle area={areaDetalle} plantaName={areaDetalle.plantaName} onClose={onCloseArea} />}
        </div>
    );
}