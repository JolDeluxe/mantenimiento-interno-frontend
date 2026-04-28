import { Icon, Skeleton, GlassFab } from '@/components/ui/z_index';
import { TarjetaKpi } from '../components/general/general-kpi-card';
import { PrincipalSummaryBar } from '../components/principal/principal-summary-bar';
import { PrincipalUrgentes } from '../components/principal/principal-urgentes';
import { PrincipalTiempos } from '../components/principal/principal-tiempos';
import { PrincipalTopList } from '../components/principal/principal-top-list';
import { cn } from '@/utils/cn';
import { hardReload } from '@/utils/hard-reload';

const ROL_SUBTITULO = {
    TECNICO: 'Tu rendimiento personal',
    JEFE_MTTO: 'Rendimiento del equipo',
    COORDINADOR_MTTO: 'Vista unificada',
    SUPER_ADMIN: 'Vista global del sistema',
};

export default function DashboardPrincipalMobile({ data, loading, error, currentUser, onRefresh }) {
    const periodo = data?.periodo;
    const resumen = data?.resumen ?? {};
    const conteosPorEstado = data?.conteosPorEstado ?? {};
    const rol = currentUser?.rol;

    const subtitulo = ROL_SUBTITULO[rol] ?? 'Dashboard';

    const valorDesviacion =
        resumen.desviacionEstimacionGlobal !== null && resumen.desviacionEstimacionGlobal !== undefined
            ? (resumen.desviacionEstimacionGlobal > 0
                ? `+${resumen.desviacionEstimacionGlobal}`
                : String(resumen.desviacionEstimacionGlobal))
            : null;

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
        <>
            <div className="flex flex-col gap-5 pb-28 animate-in fade-in duration-300">

                {/* ── Encabezado ── */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <h2 className="fuente-titulos text-xl text-marca-primario uppercase tracking-wide">
                            Dashboard Principal
                        </h2>
                        {loading && <Skeleton className="h-6 w-28 rounded-full" />}
                        {!loading && periodo && (
                            <span className="bg-marca-primario/10 text-marca-primario px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-marca-primario/20 shadow-sm">
                                {periodo.etiqueta}
                            </span>
                        )}
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {subtitulo}
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 shadow-sm">
                        <Icon name="error" size="xs" /> {error}
                    </div>
                )}

                {/* ── KPI cards ── */}
                <div className="grid grid-cols-2 gap-3">
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
                        etiqueta="Aceptación"
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
                        etiqueta="Exceso"
                        valor={valorDesviacion}
                        sufijo={resumen.desviacionEstimacionGlobal !== null ? '%' : ''}
                        color={resumen.desviacionColor}
                        datosSuficientes={resumen.kpiDatosSuficientes}
                        cargando={loading}
                        notaPie={resumen.desviacionEstimacionGlobal > 0 ? 'Encima de lo planeado' : undefined}
                    />
                </div>

                {/* ── Actividad del mes ── */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1.5">
                        <Icon name="bar_chart" size="xs" className="text-slate-500" />
                        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Actividad del mes
                            {!loading && resumen.totalGeneradas > 0 && (
                                <span className="ml-1.5 text-slate-400 font-normal normal-case">
                                    — {resumen.totalGeneradas} tareas
                                </span>
                            )}
                        </h3>
                    </div>
                    <PrincipalSummaryBar
                        conteosPorEstado={conteosPorEstado}
                        totalGeneradas={resumen.totalGeneradas ?? 0}
                        loading={loading}
                    />
                </div>

                {/* ── Urgencias ── */}
                <PrincipalUrgentes urgentes={data?.urgentes} loading={loading} />

                {/* ── Tiempos (Solo Técnicos y Coordinadores) ── */}
                {(rol === 'TECNICO' || rol === 'COORDINADOR_MTTO') && (loading || data?.tiempos) && (
                    <PrincipalTiempos tiempos={data?.tiempos} loading={loading} />
                )}

                {/* ── Rankings Top Equipo (Jefes y Coordinadores) ── */}
                {(rol === 'JEFE_MTTO' || rol === 'SUPER_ADMIN' || rol === 'COORDINADOR_MTTO') && (loading || data?.topEquipo?.length > 0) && (
                    <PrincipalTopList titulo="Top Técnicos" items={data?.topEquipo} type="kpi" icon="military_tech" loading={loading} />
                )}

                {/* ── Rankings Top Categorías (Técnicos) ── */}
                {(rol === 'TECNICO' || rol === 'COORDINADOR_MTTO') && (loading || data?.topCategorias?.length > 0) && (
                    <PrincipalTopList titulo="Tus Categorías Principales" items={data?.topCategorias} type="count" icon="category" loading={loading} />
                )}

                {/* ── Rankings Top Áreas (Jefes) ── */}
                {(rol === 'JEFE_MTTO' || rol === 'SUPER_ADMIN' || rol === 'COORDINADOR_MTTO') && (loading || data?.topAreas?.length > 0) && (
                    <PrincipalTopList titulo="Áreas con más reportes" items={data?.topAreas} type="count" icon="domain" loading={loading} />
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