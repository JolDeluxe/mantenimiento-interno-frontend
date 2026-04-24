import { useState, useEffect, useMemo } from 'react';
import { getTecnicoDetalle } from '../../../api/metricas-api';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { getMinDateHoy } from '@/lib/date';
import { cn } from '@/utils/cn';
import { TecnicoTareasHoy } from './tecnico-tareas-hoy';

// IMPORTAMOS EL MODAL EN EL PADRE
import { PrincipalDetailModal } from '../principal-detail-modal';

// --- Sub-componentes modulares privados (Pure UI) ---
const EvolucionBadge = ({ scoreActual = 0, scorePrevio = null }) => {
    if (scorePrevio === null || scorePrevio === undefined) return <span className="text-[9px] sm:text-xs text-slate-400 font-medium italic mt-1">Sin comparativo</span>;
    const diff = Number((scoreActual - scorePrevio).toFixed(1));
    const sube = diff > 0;
    const igual = diff === 0;
    return (
        <div className={cn('flex items-center gap-1 mt-1 w-fit rounded-full border font-bold max-w-full overflow-hidden transition-colors px-1.5 py-0.5 text-[8.5px] sm:px-2 sm:py-1 sm:text-xs', igual ? 'bg-slate-50 text-slate-500 border-slate-200' : sube ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200')}>
            <Icon name={igual ? 'remove' : sube ? 'trending_up' : 'trending_down'} size="xs" className="shrink-0 scale-75 sm:scale-100" />
            <span className="sm:hidden whitespace-nowrap truncate tracking-tight">{igual ? 'Sin cambio' : `${sube ? '+' : ''}${diff}% vs mes ant. (${scorePrevio})`}</span>
            <span className="hidden sm:inline whitespace-nowrap">{igual ? 'Sin cambio' : `${sube ? '+' : ''}${diff}% vs mes anterior`}</span>
            {!igual && <span className="hidden sm:inline font-normal opacity-70 whitespace-nowrap">({scorePrevio}%)</span>}
        </div>
    );
};

const AnalisisTiempos = ({ estimadoMins, realMins }) => {
    if (!estimadoMins && !realMins) return <div className="p-4 text-xs text-slate-400 font-bold text-center">Sin registros de tiempo</div>;
    const formatMins = (m) => m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
    return (
        <div className="flex items-center justify-between p-3">
            <div className="flex flex-col"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Real</span><span className="text-xl font-black font-mono text-slate-800">{formatMins(realMins ?? 0)}</span></div>
            <Icon name="compare_arrows" size="sm" className="text-slate-300" />
            <div className="flex flex-col items-end"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimado</span><span className="text-xl font-black font-mono text-slate-500">{formatMins(estimadoMins ?? 0)}</span></div>
        </div>
    );
};

const VersusBar = ({ labelA, labelB, valA = 0, valB = 0 }) => {
    const total = valA + valB;
    const pctA = total === 0 ? 0 : Math.round((valA / total) * 100);
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">{labelA} ({valA})</span>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">({valB}) {labelB}</span>
            </div>
            <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100">
                <div className="bg-emerald-400 transition-all duration-700" style={{ width: `${pctA}%` }} />
                <div className="bg-red-400 transition-all duration-700" style={{ width: `${100 - pctA}%` }} />
            </div>
        </div>
    );
};

// --- Componente Maestro ---
export const PrincipalTecnicoDetalle = ({ tecnicoId, loadingState, errorState }) => {
    const [detalle, setDetalle] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [errorData, setErrorData] = useState(null);

    // 🧠 ESTADO DEL MODAL EN EL PADRE
    const [ticketDetalleId, setTicketDetalleId] = useState(null);

    useEffect(() => {
        if (!tecnicoId) return;
        setLoadingData(true);
        const [year, month] = getMinDateHoy().split('-');
        getTecnicoDetalle(tecnicoId, { year: Number(year), month: Number(month) })
            .then(res => setDetalle(res?.data ?? null))
            .catch(() => setErrorData('No se pudieron cargar tus métricas.'))
            .finally(() => setLoadingData(false));
    }, [tecnicoId]);

    const isLoading = loadingState || loadingData;
    const hasError = errorState || errorData;

    if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
    if (hasError) return <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700 shadow-sm"><Icon name="error" size="sm" /> {hasError}</div>;
    if (!detalle) return null;

    const r = detalle.rendimiento || {};
    const t = detalle.tiempos || {};
    const sinTareasTerminadas = !r.totalTerminadas || r.totalTerminadas === 0;

    const getScoreStyles = (score) => {
        if (score >= 80) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' };
        if (score >= 60) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' };
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
    };
    const cx = getScoreStyles(r.scoreAjustado || 0);

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 animate-in fade-in duration-500 relative">
            <div className="lg:col-span-8 flex flex-col gap-6">

                {/* Header Técnico */}
                <div className="max-sm:bg-white/60 max-sm:backdrop-blur-2xl max-sm:border-white/40 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-4">
                        {detalle.tecnico?.imagen ? (
                            <img src={detalle.tecnico.imagen} alt={detalle.tecnico.nombre} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-sm shrink-0" onError={(e) => { e.target.src = '/img/perfil-no-foto.webp'; }} />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-marca-primario/10 flex items-center justify-center text-xl font-black text-marca-primario shrink-0 border border-marca-primario/20">
                                {detalle.tecnico?.nombre?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-lg font-black text-slate-900 truncate">{detalle.tecnico?.nombre}</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{detalle.tecnico?.cargo || detalle.tecnico?.rol}</p>
                            <div className="mt-2 inline-flex items-center gap-2 flex-wrap">
                                <EvolucionBadge scoreActual={r.scoreAjustado} scorePrevio={r.scorePeriodoAnterior} />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Volumen Evaluado</span>
                        <span className="text-2xl font-black font-mono text-slate-800 leading-none">{r.totalTerminadas || 0} <span className="text-xs text-slate-500 font-bold ml-0.5">tareas</span></span>
                        {(r.totalTerminadas < 3 && r.totalTerminadas > 0) && <div className="mt-2 flex items-center gap-1 text-[9px] font-black text-amber-700 bg-amber-100/50 border border-amber-200 px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider"><Icon name="warning" size="xs" className="scale-75" /> Muestra insuficiente</div>}
                    </div>
                </div>

                {/* Tarjetas KPIs */}
                <div className="grid grid-cols-2 gap-4">
                    <div className={cn('rounded-2xl p-5 flex flex-col gap-1 shadow-sm transition-all', sinTareasTerminadas ? 'bg-slate-50 border-dashed border-2 border-slate-200 opacity-80' : cn(cx.bg, cx.border, 'border'))}>
                        <span className={cn('text-[10px] font-black uppercase tracking-widest', sinTareasTerminadas ? 'text-slate-500' : cx.text)}>Score Ajustado</span>
                        <span className={cn('text-4xl font-black font-mono mt-1', sinTareasTerminadas ? 'text-slate-300' : cx.text)}>{sinTareasTerminadas ? '—' : `${r.scoreAjustado}%`}</span>
                        <span className={cn('text-xs font-bold mt-1 opacity-80', sinTareasTerminadas ? 'text-slate-400' : cx.text)}>Promedio Equipo: {r.promedioEquipo}%</span>
                    </div>

                    <div className={cn('rounded-2xl p-3 sm:p-5 border flex flex-col gap-1 shadow-sm transition-all h-full', sinTareasTerminadas ? 'bg-slate-50 border-dashed border-2 border-slate-200' : 'bg-white border-slate-200')}>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate">Tasa Aceptación</span>
                        <span className={cn('text-3xl sm:text-4xl font-black font-mono mt-1', sinTareasTerminadas ? 'text-slate-300' : r.tasaAceptacion >= 80 ? 'text-emerald-600' : r.tasaAceptacion >= 60 ? 'text-amber-600' : 'text-red-600')}>{sinTareasTerminadas ? '—' : `${r.tasaAceptacion}%`}</span>
                        <div className="mt-auto pt-3 w-full min-w-0">
                            {sinTareasTerminadas ? (
                                <div className="w-full bg-slate-100/50 border border-slate-100 p-2 rounded-lg text-center text-[10px] font-bold text-slate-400">Sin trabajos evaluados</div>
                            ) : (
                                <div className="flex items-center w-full bg-slate-50 border border-slate-100 p-1 sm:p-1.5 rounded-xl shadow-inner min-w-0">
                                    <div className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 text-[8.5px] sm:text-[10px] font-bold text-emerald-700 px-0.5 min-w-0">
                                        <Icon name="check_circle" size="xs" className="scale-[0.6] sm:scale-75 shrink-0" />
                                        <span className="truncate leading-none pt-px">{r.aprobadas} <span className="hidden sm:inline">a la primera</span><span className="sm:hidden">OK</span></span>
                                    </div>
                                    {r.rechazadas > 0 && (
                                        <><div className="w-px h-4 sm:h-5 bg-slate-200 shrink-0" /><div className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 text-[8.5px] sm:text-[10px] font-bold text-red-700 px-0.5 min-w-0"><Icon name="cancel" size="xs" className="scale-[0.6] sm:scale-75 shrink-0" /><span className="truncate leading-none pt-px">{r.rechazadas} <span className="hidden sm:inline">con rechazo</span><span className="sm:hidden">Rech.</span></span></div></>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* <div className="lg:hidden w-full">
                    <TecnicoTareasHoy
                        tareas={detalle.tareasPendientes || []}
                        onVerDetalle={(id) => setTicketDetalleId(id)}
                    />
                </div> */}

                {/* Auditoría */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 px-1"><Icon name="schedule" size="xs" /> Auditoría de Tiempo</h4>
                        <div className="max-sm:bg-white/60 max-sm:backdrop-blur-2xl max-sm:border-white/40 bg-white border border-slate-200 rounded-2xl shadow-sm p-1.5 h-full"><AnalisisTiempos estimadoMins={t.totalEstimadoMins} realMins={t.totalRealMins} /></div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 px-1"><Icon name="verified" size="xs" /> Cumplimiento de Entregas</h4>
                        <div className="max-sm:bg-white/60 max-sm:backdrop-blur-2xl max-sm:border-white/40 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col justify-center h-full gap-5">
                            <VersusBar labelA="A Tiempo" labelB="Con Atraso" valA={t.entregasA_Tiempo} valB={t.entregasFuera_Tiempo} />
                            <div className="w-full h-px bg-slate-100" />
                            <VersusBar labelA="En Plan" labelB="Fuera de Plan" valA={t.planeadoA_Tiempo} valB={t.planeadoFuera_Tiempo} />
                        </div>
                    </div>
                </div>
            </div>


            {/* <div className="hidden lg:block lg:col-span-4">
                <TecnicoTareasHoy
                    tareas={detalle.tareasPendientes || []}
                    onVerDetalle={(id) => setTicketDetalleId(id)}
                />
            </div>

            {ticketDetalleId !== null && (
                <PrincipalDetailModal
                    ticketId={ticketDetalleId}
                    isOpen={ticketDetalleId !== null}
                    onClose={() => setTicketDetalleId(null)}
                />
            )} */}
        </div>

    );
};