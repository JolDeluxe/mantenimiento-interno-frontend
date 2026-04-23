import { useState, useEffect } from 'react';
import { getTecnicoDetalle } from '../../api/metricas-api';
import { Icon, Skeleton, Modal, ModalHeader, ModalBody, ModalFooter, Button, SummaryBar } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const COLOR_MAP = {
    green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-400' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500' },
    neutral: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', bar: 'bg-slate-400' },
};

const formatMins = (m) => {
    if (!m || m === 0) return '0 min';
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
};

const EvolucionBadge = ({ scoreActual, scorePrevio, filtro }) => {
    if (scorePrevio === null || scorePrevio === undefined) {
        return (
            <span className="text-[10px] text-slate-400 font-medium italic">Sin comparativo previo</span>
        );
    }

    const diff = Number((scoreActual - scorePrevio).toFixed(1));
    const sube = diff > 0;
    const igual = diff === 0;

    let textoPeriodo = "período anterior";
    if (filtro?.fechaInicio && filtro?.fechaFin) textoPeriodo = "semana anterior";
    else if (filtro?.month > 0) textoPeriodo = "mes anterior";
    else if (filtro?.year) textoPeriodo = "año anterior";

    return (
        <div className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
            igual ? 'bg-slate-50 text-slate-500 border-slate-200' :
                sube ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-red-50 text-red-700 border-red-200'
        )}>
            <Icon name={igual ? 'remove' : sube ? 'trending_up' : 'trending_down'} size="xs" />
            <span>{igual ? 'Sin cambio' : `${sube ? '+' : ''}${diff}% vs ${textoPeriodo}`}</span>
            <span className="font-normal opacity-70">({scorePrevio}% → {scoreActual}%)</span>
        </div>
    );
};

const VersusBar = ({ labelA, labelB, valA = 0, valB = 0 }) => {
    const total = valA + valB;
    const pctA = total > 0 ? Math.round((valA / total) * 100) : 0;
    const pctB = total > 0 ? 100 - pctA : 0;

    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                <Icon name="analytics" size="sm" className="text-slate-300 mb-1" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin métricas</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                <span className="text-emerald-700">{pctA}% {labelA} ({valA})</span>
                <span className="text-red-700">{labelB} ({valB}) {pctB}%</span>
            </div>
            <div className="flex h-3 w-full rounded-full overflow-hidden">
                <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${pctA}%` }} />
                <div className="bg-red-500 transition-all duration-700" style={{ width: `${pctB}%` }} />
            </div>
        </div>
    );
};

const AnalisisTiempos = ({ estimadoMins, realMins }) => {
    const tieneData = estimadoMins > 0 || realMins > 0;

    if (!tieneData) {
        return (
            <div className="flex flex-col items-center justify-center py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl m-1">
                <Icon name="timer_off" size="md" className="text-slate-300 mb-1.5" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin registro de tiempos</span>
            </div>
        );
    }

    const sinEstimacion = estimadoMins === 0 && realMins > 0;
    const diff = realMins - estimadoMins;
    const sePaso = diff > 0;
    const pctDiff = estimadoMins > 0 ? Math.round((Math.abs(diff) / estimadoMins) * 100) : 0;

    // Motor de Severidad para Tiempos Excedidos
    let clasesEstado = "";
    let iconoEstado = "";

    if (sinEstimacion) {
        clasesEstado = "bg-slate-100 text-slate-600 border-slate-200";
        iconoEstado = "info";
    } else if (diff === 0) {
        clasesEstado = "bg-slate-100 text-slate-600 border-slate-200";
        iconoEstado = "check";
    } else if (sePaso) {
        // Reglas de tolerancia (Gradient Scale)
        if (pctDiff <= 15) {
            clasesEstado = "bg-amber-50 text-amber-700 border-amber-200";
            iconoEstado = "schedule";
        } else if (pctDiff <= 30) {
            clasesEstado = "bg-orange-50 text-orange-700 border-orange-200";
            iconoEstado = "warning";
        } else if (pctDiff <= 50) {
            clasesEstado = "bg-red-50 text-red-700 border-red-200";
            iconoEstado = "error";
        } else {
            // Alerta Crítica > 50%
            clasesEstado = "bg-rose-100 text-rose-800 border-rose-300 font-extrabold";
            iconoEstado = "dangerous";
        }
    } else {
        // Ahorro de tiempo
        clasesEstado = "bg-emerald-50 text-emerald-700 border-emerald-200";
        iconoEstado = "task_alt";
    }

    return (
        <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 m-1">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo Estimado</span>
                    <span className="text-sm font-bold text-slate-700">{formatMins(estimadoMins)}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo Real</span>
                    <span className="text-sm font-bold text-slate-900">{formatMins(realMins)}</span>
                </div>
            </div>

            <div className={cn(
                "flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold border transition-colors",
                clasesEstado
            )}>
                <Icon name={iconoEstado} size="xs" />
                {sinEstimacion ? (
                    `Inversión de ${formatMins(realMins)} (Sin estimación)`
                ) : diff === 0 ? (
                    "Tiempo exacto al estimado"
                ) : sePaso ? (
                    `Se excedió por ${formatMins(diff)} (${pctDiff}% arriba)`
                ) : (
                    `Ahorró ${formatMins(Math.abs(diff))} (${pctDiff}% debajo)`
                )}
            </div>
        </div>
    );
};

const GraficaRendimiento = ({ grafico = [] }) => {
    if (!grafico || grafico.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl h-48">
                <Icon name="insights" size="lg" className="text-slate-300 mb-2" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gráfica no disponible</span>
            </div>
        );
    }

    return (
        <div className="flex items-end justify-between gap-1.5 h-48 pt-8 pb-1">
            {grafico.map((punto, idx) => {
                const colorBarra = punto.noData
                    ? 'bg-slate-200'
                    : (punto.score >= 80 ? 'bg-emerald-400' : punto.score >= 60 ? 'bg-amber-400' : 'bg-red-400');

                const altura = punto.noData ? '10%' : `${Math.max(punto.score, 5)}%`;

                return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-2 group h-full">
                        <div className="relative w-full flex justify-center items-end h-full bg-slate-50/50 rounded-t-md border border-b-0 border-slate-100/60">
                            <div className="absolute -top-7 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap shadow-md">
                                {punto.noData ? 'Sin datos' : `${punto.score}%`}
                            </div>
                            <div
                                className={cn("w-full max-w-[28px] rounded-t-sm transition-all duration-700", colorBarra)}
                                style={{ height: altura }}
                            />
                        </div>
                        <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase truncate w-full text-center shrink-0">
                            {punto.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export const TecnicoDetalleModal = ({ tecnico, filtro, onClose }) => {
    const [detalle, setDetalle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!tecnico) return;
        setLoading(true);
        setError(null);

        const params = {};
        if (filtro?.fechaInicio && filtro?.fechaFin) {
            params.fechaInicio = filtro.fechaInicio;
            params.fechaFin = filtro.fechaFin;
        } else {
            if (filtro?.year) params.year = filtro.year;
            if (filtro?.month) params.month = filtro.month;
        }

        getTecnicoDetalle(tecnico.id, params)
            .then((res) => setDetalle(res?.data ?? null))
            .catch(() => setError('No se pudo cargar el detalle del técnico.'))
            .finally(() => setLoading(false));
    }, [tecnico, filtro]);

    const r = detalle?.rendimiento;
    const t = detalle?.tiempos || {};
    const c = detalle?.cargaActual;
    const grafico = detalle?.grafico || [];

    const esVistaMensual = filtro?.month > 0 && !filtro?.fechaInicio;

    const sinTareasTerminadas = !r?.totalTerminadas || r.totalTerminadas === 0;
    const colorKpi = sinTareasTerminadas ? 'neutral' : (r?.scoreColor || 'neutral');
    const cx = COLOR_MAP[colorKpi] || COLOR_MAP.neutral;

    const itemsCarga = [];
    if (c?.estados) {
        if (c.estados.ASIGNADA) itemsCarga.push({ id: 'ASIGNADA', label: 'Asignadas', value: c.estados.ASIGNADA, color: 'info' });
        if (c.estados.EN_PROGRESO) itemsCarga.push({ id: 'EN_PROGRESO', label: 'En Progreso', value: c.estados.EN_PROGRESO, color: 'warning' });
        if (c.estados.EN_PAUSA) itemsCarga.push({ id: 'EN_PAUSA', label: 'En Pausa', value: c.estados.EN_PAUSA, color: 'neutral' });
        if (c.estados.RESUELTO) itemsCarga.push({ id: 'RESUELTO', label: 'Resueltas', value: c.estados.RESUELTO, color: 'success' });
        if (c.estados.CERRADO) itemsCarga.push({ id: 'CERRADO', label: 'Cerradas', value: c.estados.CERRADO, color: 'success' });
    }

    return (
        <Modal isOpen onClose={onClose} className="md:max-w-3xl">
            <ModalHeader
                title={loading ? 'Cargando perfil…' : `Reporte de Rendimiento`}
                onClose={onClose}
            />
            <ModalBody className="p-4 md:p-6 bg-slate-50/50">
                {loading ? (
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100">
                            <Skeleton className="w-14 h-14 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-40 rounded-md" />
                                <Skeleton className="h-3 w-24 rounded-md" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-24 rounded-xl" />
                            <Skeleton className="h-24 rounded-xl" />
                        </div>
                        <Skeleton className="h-40 rounded-xl" />
                        <Skeleton className="h-32 rounded-xl" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center py-10 gap-3 text-slate-400">
                        <Icon name="error" size="xl" className="text-red-400" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                ) : detalle ? (
                    <div className="flex flex-col gap-6">

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <div className="flex items-center gap-4">
                                {detalle.tecnico.imagen ? (
                                    <img
                                        src={detalle.tecnico.imagen}
                                        alt={detalle.tecnico.nombre}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-sm shrink-0"
                                        onError={(e) => { e.target.src = '/img/perfil-no-foto.webp'; }}
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-marca-primario/10 flex items-center justify-center text-xl font-black text-marca-primario shrink-0">
                                        {detalle.tecnico.nombre?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-black text-slate-900 truncate">{detalle.tecnico.nombre}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{detalle.tecnico.cargo || detalle.tecnico.rol}</p>
                                    <div className="mt-2 inline-flex items-center gap-2 flex-wrap">
                                        <EvolucionBadge
                                            scoreActual={r.scoreAjustado}
                                            scorePrevio={r.scorePeriodoAnterior}
                                            filtro={filtro}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end shrink-0 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Volumen Evaluado</span>
                                <span className="text-lg font-black font-mono text-slate-800 leading-none">
                                    {r.totalTerminadas} <span className="text-xs text-slate-500 font-bold">tareas</span>
                                </span>
                                {r.totalTerminadas < 3 && r.totalTerminadas > 0 && (
                                    <div className="mt-1.5 flex items-center gap-1 text-[9px] font-black text-amber-700 bg-amber-100/50 border border-amber-200 px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                        <Icon name="warning" size="xs" className="scale-75" />
                                        Muestra insuficiente
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tarjetas de KPIs Principales */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className={cn('rounded-xl p-4 border flex flex-col gap-1 shadow-sm transition-all', cx.bg, cx.border, sinTareasTerminadas && 'opacity-80 border-dashed border-2')}>
                                <span className={cn('text-[10px] font-black uppercase tracking-widest', cx.text)}>Score Ajustado</span>
                                <span className={cn('text-4xl font-black font-mono mt-1', sinTareasTerminadas ? 'text-slate-300' : cx.text)}>
                                    {sinTareasTerminadas ? '—' : `${r.scoreAjustado}%`}
                                </span>
                                <span className={cn('text-xs font-bold mt-1 opacity-80', cx.text)}>
                                    Promedio del Equipo: {r.promedioEquipo}%
                                </span>
                            </div>

                            <div className={cn('rounded-xl p-4 border flex flex-col gap-1 shadow-sm transition-all', sinTareasTerminadas ? 'bg-slate-50 border-dashed border-2 border-slate-200' : 'bg-white border-slate-200')}>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tasa Aceptación</span>
                                <span className={cn(
                                    'text-4xl font-black font-mono mt-1',
                                    sinTareasTerminadas ? 'text-slate-300' :
                                        r.tasaAceptacion >= 80 ? 'text-emerald-600' :
                                            r.tasaAceptacion >= 60 ? 'text-amber-600' : 'text-red-600'
                                )}>
                                    {sinTareasTerminadas ? '—' : `${r.tasaAceptacion}%`}
                                </span>
                                <span className="text-xs font-bold mt-1 text-slate-400">
                                    Trabajos aprobados sin rechazo
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-3">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Icon name="schedule" size="xs" /> Auditoría de Tiempo
                                </h4>
                                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-0.5 h-full">
                                    <AnalisisTiempos
                                        estimadoMins={t.totalEstimadoMins}
                                        realMins={t.totalRealMins}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Icon name="verified" size="xs" /> Cumplimiento de Entregas
                                </h4>
                                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col justify-center h-full gap-4">
                                    <VersusBar
                                        labelA="A Tiempo"
                                        labelB="Fuera de Tiempo"
                                        valA={t.entregasA_Tiempo ?? 0}
                                        valB={t.entregasFuera_Tiempo ?? 0}
                                    />
                                    <div className="w-full h-px bg-slate-100" />
                                    <VersusBar
                                        labelA="En Plan"
                                        labelB="Fuera de Plan"
                                        valA={t.planeadoA_Tiempo ?? 0}
                                        valB={t.planeadoFuera_Tiempo ?? 0}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Icon name="assignment" size="xs" /> Estado Operativo Actual (Carga)
                            </h4>
                            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                {itemsCarga.length > 0 ? (
                                    <SummaryBar items={itemsCarga} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-400 py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                        <Icon name="check_circle" size="md" className="text-emerald-400 mb-1.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Bandeja Limpia</span>
                                        <span className="text-xs font-medium mt-0.5">El colaborador no tiene tareas pendientes.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!esVistaMensual && (
                            <div className="flex flex-col gap-3">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Icon name="insights" size="xs" /> Histórico del Período
                                </h4>
                                <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                                    <GraficaRendimiento grafico={grafico} />
                                </div>
                            </div>
                        )}

                        {detalle.topTareas?.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Icon name="star" size="xs" /> Actividades Frecuentes
                                </h4>
                                <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100">
                                    {detalle.topTareas.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors rounded-lg">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-slate-800 truncate">
                                                    {item.categoria || 'General'}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.clasificacion}</span>
                                            </div>
                                            <span className="text-xs font-black font-mono text-marca-primario bg-marca-primario/10 px-3 py-1.5 rounded-lg border border-marca-primario/20 shrink-0 ml-2">
                                                {item.cantidad}×
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                ) : null}
            </ModalBody>
            <ModalFooter className="bg-white border-t border-slate-200">
                <Button variant="cancelar" onClick={onClose} className="w-full md:w-auto">Cerrar Reporte</Button>
            </ModalFooter>
        </Modal>
    );
};