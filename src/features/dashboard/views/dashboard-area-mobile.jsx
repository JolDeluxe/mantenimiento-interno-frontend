import React from 'react';
import { Icon, Skeleton, GlassFab } from '@/components/ui/z_index';
import { PlantaRow } from '../components/area/planta-row';
import { PlantaDetalle } from '../components/area/area-detalle-planta';
import { AreaDetalle } from '../components/area/area-detalle-area';
import DashboardEmptyState from '../components/dashboard-empty-state';
import { hardReload } from '@/utils/hard-reload';

const SkeletonPlanta = () => (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-2.5 w-28 rounded-full" />
            </div>
            <Skeleton className="w-4 h-4 rounded" />
        </div>
        <div className="flex gap-1.5 px-4 pb-3">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
        </div>
    </div>
);

export default function DashboardAreaMobile({
    loading,
    metricasPorPlanta = [],
    plantaDetalle,
    areaDetalle,
    onOpenPlanta,
    onOpenArea,
    onClosePlanta,
    onCloseArea,
    onRefresh
}) {
    const totalTareas = metricasPorPlanta.reduce((acc, p) => acc + (p.totalTareas || 0), 0);
    const tieneDatos = totalTareas > 0;

    return (
        <>
            <div className="flex flex-col gap-4 pb-32 animate-in fade-in duration-300">
                <div className="flex flex-col gap-0.5 px-1">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">
                        Métricas Operativas
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Rendimiento por Planta y Área
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <SkeletonPlanta key={i} />)
                    ) : tieneDatos ? (
                        metricasPorPlanta.map((planta, idx) => (
                            <PlantaRow
                                key={idx}
                                planta={planta}
                                onOpenPlanta={onOpenPlanta}
                                onOpenArea={onOpenArea}
                                isMobile
                            />
                        ))
                    ) : (
                        <DashboardEmptyState
                            isMobile
                            mensaje="Centros Operativos sin datos"
                            subtexto="No se registraron tareas en este periodo."
                        />
                    )}
                </div>

                {plantaDetalle && (
                    <PlantaDetalle planta={plantaDetalle} onClose={onClosePlanta} />
                )}
                {areaDetalle && (
                    <AreaDetalle
                        area={areaDetalle}
                        plantaName={areaDetalle.plantaName}
                        onClose={onCloseArea}
                    />
                )}
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
        </>
    );
}