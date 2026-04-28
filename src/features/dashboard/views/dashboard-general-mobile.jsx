import React from 'react';
import { GlassFab } from '@/components/ui/z_index';
import { GeneralMetricasHeader } from '../components/general/general-metricas-header';
import { TarjetaKpi } from '../components/general/general-kpi-card';
import { GeneralTiemposCard } from '../components/general/general-tiempos-card';
import { GeneralListaBarrasCard } from '../components/general/general-lista-barras-card';
import DashboardEmptyState from '../components/dashboard-empty-state';
import { hardReload } from '@/utils/hard-reload';

export default function DashboardGeneralMobile({ data, loading, onRefresh }) {
    const {
        resumen = {},
        rendimiento = {},
        activas = { total: 0, desglose: [] },
        tipos = [],
        topCategorias = [],
        topClasificaciones = []
    } = data || {};

    const tieneDatos = !loading && resumen.totalGeneradas > 0;

    return (
        <>
            <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-28">
                {!tieneDatos && !loading ? (
                    <DashboardEmptyState
                        isMobile
                        mensaje="Sin actividad registrada"
                        subtexto="No hay métricas generales para mostrar en este rango."
                    />
                ) : (
                    <>
                        <GeneralMetricasHeader
                            totalGeneradas={resumen.totalGeneradas}
                            totalTerminadas={resumen.totalTerminadas}
                            isMobile={true}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <TarjetaKpi icono="speed" etiqueta="KPI Global" valor={resumen.kpiGlobal} color={resumen.kpiColor} cargando={loading} />
                            <TarjetaKpi icono="verified" etiqueta="Aceptación" valor={resumen.tasaAceptacion} sufijo="%" color={resumen.tasaAceptacionColor} cargando={loading} />
                            <TarjetaKpi icono="timer" etiqueta="Cumplimiento" valor={resumen.indiceCumplimiento} sufijo="%" color={resumen.indiceCumplimientoColor} cargando={loading} />
                            <TarjetaKpi
                                icono="history_toggle_off"
                                etiqueta="Exceso"
                                valor={resumen.desviacionEstimacionGlobal !== null && resumen.desviacionEstimacionGlobal > 0 ? `+${resumen.desviacionEstimacionGlobal}` : (resumen.desviacionEstimacionGlobal ?? 'N/A')}
                                sufijo={resumen.desviacionEstimacionGlobal !== null ? '%' : ''}
                                color={resumen.desviacionColor}
                                cargando={loading}
                            />
                        </div>

                        {(loading || rendimiento) && <GeneralTiemposCard rendimiento={rendimiento} loading={loading} isMobile={true} />}
                        {(loading || tipos.length > 0) && <GeneralListaBarrasCard titulo="Distribución por Tipo" icono="category" colorIcono="text-indigo-600" datos={tipos} colorBarra="bg-indigo-500" loading={loading} isMobile={true} />}
                        {(loading || activas.total > 0) && <GeneralListaBarrasCard titulo="Tareas Activas" icono="assignment" colorIcono="text-amber-500" datos={activas.desglose} valorExtra={activas.total} colorBarra="bg-amber-400" loading={loading} isMobile={true} />}

                        <div className="grid grid-cols-1 gap-4">
                            {(loading || topCategorias.length > 0) && <GeneralListaBarrasCard titulo="Top 5 Categorías" icono="donut_large" colorIcono="text-emerald-600" datos={topCategorias} colorBarra="bg-emerald-400" loading={loading} isMobile={true} />}
                            {(loading || topClasificaciones.length > 0) && <GeneralListaBarrasCard titulo="Top 5 Clasificaciones" icono="list_alt" colorIcono="text-sky-600" datos={topClasificaciones} colorBarra="bg-sky-400" loading={loading} isMobile={true} />}
                        </div>
                    </>
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