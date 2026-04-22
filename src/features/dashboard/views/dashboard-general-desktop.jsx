import React from 'react';
import { GeneralMetricasHeader } from '../components/general/general-metricas-header';
import { TarjetaKpi } from '../components/general/general-kpi-card';
import { GeneralTiemposCard } from '../components/general/general-tiempos-card';
import { GeneralListaBarrasCard } from '../components/general/general-lista-barras-card';
import DashboardEmptyState from '../components/dashboard-empty-state';

export default function DashboardGeneralDesktop({ data, loading }) {
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
        <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-10">
            {!tieneDatos && !loading ? (
                <DashboardEmptyState
                    mensaje="Visión General no disponible"
                    subtexto="No se detectaron tareas ni tickets generados en el periodo seleccionado."
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 xl:grid-cols-6 gap-4">
                        <GeneralMetricasHeader
                            totalGeneradas={resumen.totalGeneradas}
                            totalTerminadas={resumen.totalTerminadas}
                            isMobile={false}
                        />

                        <div className="xl:col-span-4 grid grid-cols-4 gap-4">
                            <TarjetaKpi icono="speed" etiqueta="KPI Global" valor={resumen.kpiGlobal} color={resumen.kpiColor} cargando={loading} />
                            <TarjetaKpi icono="verified" etiqueta="Aceptación" valor={resumen.tasaAceptacion} sufijo="%" color={resumen.tasaAceptacionColor} cargando={loading} />
                            <TarjetaKpi icono="timer" etiqueta="Cumplimiento" valor={resumen.indiceCumplimiento} sufijo="%" color={resumen.indiceCumplimientoColor} cargando={loading} />
                            <TarjetaKpi
                                icono="history_toggle_off"
                                etiqueta="Exceso de Tiempo"
                                valor={resumen.desviacionEstimacionGlobal !== null && resumen.desviacionEstimacionGlobal > 0 ? `+${resumen.desviacionEstimacionGlobal}` : (resumen.desviacionEstimacionGlobal ?? 'N/A')}
                                sufijo={resumen.desviacionEstimacionGlobal !== null ? '%' : ''}
                                color={resumen.desviacionColor}
                                cargando={loading}
                                notaPie={resumen.desviacionEstimacionGlobal !== null ? "Por encima de lo planeado" : ""}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GeneralTiemposCard rendimiento={rendimiento} loading={loading} isMobile={false} />
                        <GeneralListaBarrasCard titulo="Distribución por Tipo" icono="category" colorIcono="text-indigo-600" datos={tipos} colorBarra="bg-indigo-500" loading={loading} isMobile={false} />
                        <GeneralListaBarrasCard titulo="Tareas Activas" icono="assignment" colorIcono="text-amber-500" datos={activas.desglose} valorExtra={activas.total} colorBarra="bg-amber-400" loading={loading} isMobile={false} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GeneralListaBarrasCard titulo="Top 5 Categorías" icono="donut_large" colorIcono="text-emerald-600" datos={topCategorias} colorBarra="bg-emerald-400" loading={loading} isMobile={false} />
                        <GeneralListaBarrasCard titulo="Top 5 Clasificaciones" icono="list_alt" colorIcono="text-sky-600" datos={topClasificaciones} colorBarra="bg-sky-400" loading={loading} isMobile={false} />
                    </div>
                </>
            )}
        </div>
    );
}