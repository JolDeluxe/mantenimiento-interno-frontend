// src/features/dashboard/views/dashboard-area-desktop.jsx
import React from 'react';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { PlantaRow } from '../components/area/planta-row';
import { PlantaDetalle } from '../components/area/area-detalle-planta';
import { AreaDetalle } from '../components/area/area-detalle-area';

const SkeletonPlanta = () => (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-3.5 w-24 rounded-full" />
                <Skeleton className="h-2.5 w-36 rounded-full" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="w-4 h-4 rounded" />
        </div>
    </div>
);

export default function DashboardAreaDesktop({
    loading,
    metricasPorPlanta = [],
    plantaDetalle,
    areaDetalle,
    onOpenPlanta,
    onOpenArea,
    onClosePlanta,
    onCloseArea,
}) {
    // 🚨 Cálculo corregido apuntando a la nueva estructura del backend
    const totalTareas = metricasPorPlanta.reduce((acc, p) => acc + (p.totalTareas || 0), 0);
    const totalActivas = metricasPorPlanta.reduce((acc, p) => acc + (p.tareasActivas || 0), 0);
    const totalTickets = metricasPorPlanta.reduce((acc, p) => acc + (p.tiposTotales?.tickets || 0), 0);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">

            {/* Header descriptivo */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-marca-primario/10 rounded-lg">
                            <Icon name="analytics" size="sm" className="text-marca-primario" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                            Métricas por Centro Operativo
                        </h3>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                        Volumen, tiempos y frecuencia de tareas por planta y área.
                    </p>
                </div>

                {/* Resumen global */}
                {!loading && totalTareas > 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-full">{totalTareas} TAREAS</span>
                        <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">{totalActivas} ACTIVAS</span>
                        <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">{totalTickets} REPORTES</span>
                    </div>
                )}
            </div>

            {/* Lista de plantas */}
            <div className="flex flex-col gap-3">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonPlanta key={i} />)
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
                    <div className="flex flex-col items-center justify-center p-16 bg-white border border-dashed border-slate-200 rounded-3xl">
                        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Icon name="search_off" size="xl" className="text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-500">Sin datos en este periodo</p>
                        <p className="text-xs text-slate-400 font-medium mt-1 text-center max-w-xs">
                            Ajusta el filtro de fecha o verifica la conexión con el servidor.
                        </p>
                    </div>
                )}
            </div>

            {/* Modales */}
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
    );
}