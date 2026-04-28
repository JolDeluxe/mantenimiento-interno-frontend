import React from 'react';
import { Icon, Skeleton, RefreshFab } from '@/components/ui/z_index';
import { TarjetaKpi } from '../components/general/general-kpi-card';
import { PrincipalSummaryBar } from '../components/principal/principal-summary-bar';
import { PrincipalUrgentes } from '../components/principal/principal-urgentes';
import { PrincipalTiempos } from '../components/principal/principal-tiempos';
import { PrincipalTopList } from '../components/principal/principal-top-list';
import { cn } from '@/utils/cn';
import { hardReload } from '@/utils/hard-reload';

const ROL_SUBTITULO = {
    TECNICO: 'Tu rendimiento personal',
    JEFE_MTTO: 'Rendimiento del equipo de mantenimiento',
    COORDINADOR_MTTO: 'Vista unificada',
    SUPER_ADMIN: 'Vista global del sistema',
};

export default function DashboardPrincipalDesktop({ data, loading, error, currentUser, onRefresh }) {
    const periodo = data?.periodo;
    const resumen = data?.resumen ?? {};
    const conteosPorEstado = data?.conteosPorEstado ?? {};
    const rol = currentUser?.rol;

    const subtitulo = ROL_SUBTITULO[rol] ?? 'Dashboard';

    const renderTrend = (trend) => {
        if (trend === null || trend === undefined) return null;

        const diff = Number(trend);
        const sube = diff > 0;
        const igual = diff === 0;

        return (
            <div className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border mt-1',
                igual ? 'bg-slate-50 text-slate-500 border-slate-200' :
                    sube ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-red-50 text-red-700 border-red-200'
            )}>
                <Icon
                    name={igual ? 'horizontal_rule' : sube ? 'trending_up' : 'trending_down'}
                    size="xs"
                />
                <span>
                    {igual ? 'Sin cambio' : `${sube ? '+' : ''}${diff}% vs mes anterior`}
                </span>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300 pb-10 relative">
            <RefreshFab bottom="32px" right="32px" size={48} onClick={hardReload} />

            {/* ── Encabezado Principal ── */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                    </div>
                    <div className="flex items-center gap-3">
                        <h3 className="fuente-titulos text-2xl text-marca-primario uppercase tracking-wide">
                            {subtitulo}
                        </h3>
                        {loading && <Skeleton className="h-5 w-24 rounded-full" />}
                        {!loading && periodo && (
                            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-200 shadow-sm">
                                {periodo.etiqueta}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700 shadow-sm">
                    <Icon name="error" size="sm" /> {error}
                </div>
            )}

            {/* ── Malla de KPIs ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <TarjetaKpi
                    icono="speed"
                    etiqueta="KPI Global"
                    valor={resumen.kpiGlobal}
                    color={resumen.kpiColor}
                    datosSuficientes={resumen.kpiDatosSuficientes}
                    cargando={loading}
                    notaPie={renderTrend(resumen.trend)}
                />
                <TarjetaKpi
                    icono="verified"
                    etiqueta="Tasa Aceptación"
                    valor={resumen.tasaAceptacion}
                    sufijo="%"
                    color={resumen.tasaAceptacionColor}
                    datosSuficientes={resumen.kpiDatosSuficientes}
                    cargando={loading}
                />
                <TarjetaKpi
                    icono="timer"
                    etiqueta="Cumplimiento"
                    valor={resumen.indiceCumplimiento}
                    sufijo="%"
                    color={resumen.indiceCumplimientoColor}
                    datosSuficientes={resumen.kpiDatosSuficientes}
                    cargando={loading}
                />
                <TarjetaKpi
                    icono="history_toggle_off"
                    etiqueta="Exceso de Tiempo"
                    valor={resumen.desviacionEstimacionGlobal > 0 ? `+${resumen.desviacionEstimacionGlobal}` : resumen.desviacionEstimacionGlobal}
                    sufijo={resumen.desviacionEstimacionGlobal !== null ? '%' : ''}
                    color={resumen.desviacionColor}
                    datosSuficientes={resumen.kpiDatosSuficientes}
                    cargando={loading}
                    notaPie={resumen.desviacionEstimacionGlobal > 0 ? 'Por encima de lo planeado' : undefined}
                />
            </div>

            {/* ── Grid Principal de Operaciones ── */}
            <div className="flex flex-col gap-6">

                {/* 1. Actividad (Ocupa todo el ancho superior) */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <h3 className="fuente-titulos text-2xl text-marca-primario uppercase tracking-wide">
                            Actividad del mes
                        </h3>
                    </div>
                    <PrincipalSummaryBar
                        conteosPorEstado={conteosPorEstado}
                        totalGeneradas={resumen.totalGeneradas ?? 0}
                        loading={loading}
                    />
                </div>

                {/* 2. Tres Columnas en la misma fila (Desktop) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Columna 1: Urgencias */}
                    <div className="flex flex-col h-full">
                        <PrincipalUrgentes urgentes={data?.urgentes} loading={loading} />
                    </div>

                    {/* Columna 2: Tiempos (Técnicos) / Top Rendimiento (Jefes) */}
                    <div className="flex flex-col gap-6">
                        {(rol === 'TECNICO' || rol === 'COORDINADOR_MTTO') && (
                            <PrincipalTiempos tiempos={data?.tiempos} />
                        )}
                        {(rol === 'JEFE_MTTO' || rol === 'SUPER_ADMIN' || rol === 'COORDINADOR_MTTO') && data?.topEquipo?.length > 0 && (
                            <PrincipalTopList titulo="Top Técnicos" items={data?.topEquipo} type="kpi" icon="military_tech" />
                        )}
                    </div>

                    {/* Columna 3: Top Categorías (Técnicos) / Top Áreas (Jefes) */}
                    <div className="flex flex-col gap-6">
                        {(rol === 'TECNICO' || rol === 'COORDINADOR_MTTO') && data?.topCategorias?.length > 0 && (
                            <PrincipalTopList titulo="Tus Categorías Principales" items={data?.topCategorias} type="count" icon="category" />
                        )}
                        {(rol === 'JEFE_MTTO' || rol === 'SUPER_ADMIN' || rol === 'COORDINADOR_MTTO') && data?.topAreas?.length > 0 && (
                            <PrincipalTopList titulo="Áreas con más tareas" items={data?.topAreas} type="count" icon="domain" />
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}