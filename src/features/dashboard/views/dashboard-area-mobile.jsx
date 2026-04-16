import React from 'react';
import { Icon, Skeleton, GlassFab } from '@/components/ui/z_index';
import { PlantaRow } from '../components/area/planta-row';
import { PlantaDetalle } from '../components/area/area-detalle-planta';
import { AreaDetalle } from '../components/area/area-detalle-area';

export default function DashboardAreaMobile({
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
        <div className="flex flex-col gap-5 pb-32 animate-in fade-in duration-300">
            {/* Capa 1: Header Informativo */}
            <div className="flex flex-col gap-1 px-1">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Eficiencia Operativa</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">KPIs de Resolución por Planta</p>
            </div>

            {/* Capa 4: Contenido Principal */}
            <div className="flex flex-col gap-3">
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                    </div>
                ) : metricasPorPlanta.length > 0 ? (
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
                    <div className="flex flex-col items-center justify-center p-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Icon name="search_off" size="xl" className="text-slate-300 mb-2" />
                        <span className="text-xs font-bold text-slate-400 uppercase">Sin métricas registradas</span>
                    </div>
                )}
            </div>

            {/* Capa 6: Botones Flotantes (Liquid Glass) */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
                <GlassFab
                    icon="refresh"
                    onClick={() => window.location.reload()}
                    variant="secondary"
                />
            </div>

            {/* Modales */}
            {plantaDetalle && <PlantaDetalle planta={plantaDetalle} onClose={onClosePlanta} />}
            {areaDetalle && <AreaDetalle area={areaDetalle} plantaName={areaDetalle.plantaName} onClose={onCloseArea} />}
        </div>
    );
}