// src/features/dashboard/components/area/area-detalle-area.jsx
import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const formatMins = (mins) => {
    if (!mins || mins === 0) return '—';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const topN = (obj = {}, n = 6) =>
    Object.entries(obj).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a).slice(0, n);

const ProgressBar = ({ pct: p, colorClass = 'bg-marca-primario' }) => (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex-1">
        <div className={cn('h-full rounded-full transition-all', colorClass)} style={{ width: `${Math.min(p, 100)}%` }} />
    </div>
);

const BarRow = ({ label, count, total, colorClass }) => {
    const p = total > 0 ? Math.round((count / total) * 100) : 0;
    if (count === 0) return null;
    return (
        <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold text-slate-600 w-28 truncate shrink-0">{label}</span>
            <ProgressBar pct={p} colorClass={colorClass} />
            <span className="text-[11px] font-black text-slate-700 tabular-nums w-8 text-right">{count}</span>
            <span className="text-[10px] text-slate-400 w-8 text-right">{p}%</span>
        </div>
    );
};

const renderTextoFrecuencia = (estadoFrecuencia, frecuenciaDias) => {
    switch (estadoFrecuencia) {
        case 'NORMAL':
            return <span className="text-slate-800">1 ticket cada <span className="font-black">{frecuenciaDias}</span> días</span>;
        case 'UNICO':
            return <span className="text-amber-600 font-bold">Único evento histórico</span>;
        case 'MISMO_DIA':
            return <span className="text-red-600 font-bold">Múltiples en el mismo día</span>;
        default:
            return <span className="text-slate-400">Sin datos históricos suficientes</span>;
    }
};

const ESTADOS_CONFIG = {
    PENDIENTE: 'bg-slate-100 text-slate-600 border-slate-200',
    ASIGNADA: 'bg-blue-50 text-blue-600 border-blue-200',
    EN_PROGRESO: 'bg-amber-50 text-amber-600 border-amber-200',
    EN_PAUSA: 'bg-orange-50 text-orange-600 border-orange-200',
    RESUELTO: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    CERRADO: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    RECHAZADO: 'bg-red-50 text-red-600 border-red-200',
};

const CLASI_COLORS = {
    CORRECTIVO: 'bg-red-400', PREVENTIVO: 'bg-blue-400',
    INSPECCION: 'bg-violet-400', MEJORA: 'bg-emerald-400',
    INFRAESTRUCTURA: 'bg-amber-400', RUTINA: 'bg-slate-400',
};

const Section = ({ title, icon, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <Icon name={icon} size="sm" className="text-marca-primario" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wide">{title}</span>
                </div>
                <Icon name="expand_more" size="sm" className={cn('text-slate-400 transition-transform duration-200', open && 'rotate-180')} />
            </button>
            {open && <div className="p-4">{children}</div>}
        </div>
    );
};

export const AreaDetalle = ({ area, plantaName, onClose }) => {
    if (!area) return null;

    const {
        totalTareas = 0,
        tareasActivas = 0,
        tiposTotales = {},
        estados = {},
        clasificaciones = {},
        tiempos = {},
        frecuenciaGeneral = {},
        frecuenciaTickets = [],
    } = area;

    const sumaTipos = (tiposTotales?.tickets || 0) + (tiposTotales?.planeadas || 0) + (tiposTotales?.extraordinarias || 0);
    const totalReal = Math.max(totalTareas, sumaTipos);

    const { tiempoRealTotal = 0, tiempoEstimadoTotal = 0, alertaTiempo } = tiempos;

    const sinEstimacion = tiempoEstimadoTotal === 0 && tiempoRealTotal > 0;
    const diff = tiempoRealTotal - tiempoEstimadoTotal;
    const sePaso = diff > 0;
    const pctDiff = tiempoEstimadoTotal > 0 ? Math.round((Math.abs(diff) / tiempoEstimadoTotal) * 100) : 0;

    let clasesEstado = "";
    let iconoEstado = "";
    let textoEstado = "";

    if (sinEstimacion) {
        clasesEstado = "bg-slate-100 text-slate-600 border-slate-200";
        iconoEstado = "info";
        textoEstado = "Tiempo invertido sin estimación global previa";
    } else if (diff === 0) {
        clasesEstado = "bg-slate-100 text-slate-600 border-slate-200";
        iconoEstado = "check";
        textoEstado = "Operación global exacta al tiempo estimado";
    } else if (sePaso) {
        textoEstado = `Tiempo global excedido en un ${pctDiff}%`;
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
            clasesEstado = "bg-rose-100 text-rose-800 border-rose-300 font-extrabold";
            iconoEstado = "dangerous";
        }
    } else {
        clasesEstado = "bg-emerald-50 text-emerald-700 border-emerald-200";
        iconoEstado = "task_alt";
        textoEstado = `Ahorro del ${pctDiff}% sobre el tiempo estimado global`;
    }

    return (
        <Modal isOpen={Boolean(area)} onClose={onClose} className="max-w-2xl w-full">
            <ModalHeader title={`${area.area}`} onClose={onClose} />

            <ModalBody className="p-0">
                <div className="flex flex-col gap-4 p-5">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold -mb-1">
                        <Icon name="factory" size="xs" />
                        <span className="uppercase tracking-wide">{plantaName}</span>
                        <Icon name="chevron_right" size="xs" />
                        <span className="text-slate-600 uppercase tracking-wide">{area.area}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Tareas</p>
                            <p className={cn("text-2xl font-black", totalReal > 0 ? "text-slate-800" : "text-slate-300")}>
                                {totalReal > 0 ? totalReal : '—'}
                            </p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                            <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider mb-1">Activas</p>
                            <p className={cn("text-2xl font-black", tareasActivas > 0 ? "text-amber-600" : "text-amber-600/40")}>
                                {tareasActivas}
                            </p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center">
                            <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider mb-1">Reportes</p>
                            <p className={cn("text-2xl font-black", (tiposTotales?.tickets || 0) > 0 ? "text-blue-600" : "text-blue-600/40")}>
                                {tiposTotales?.tickets || 0}
                            </p>
                        </div>
                    </div>

                    <Section title="Distribución de estados" icon="category">
                        {totalReal > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(estados).filter(([, count]) => count > 0).map(([estado, count]) => {
                                    const style = ESTADOS_CONFIG[estado] || 'bg-slate-100 text-slate-600 border-slate-200';
                                    return (
                                        <span key={estado} className={cn('px-3 py-1.5 rounded-full border text-[11px] font-black tracking-wide', style)}>
                                            {estado.replace('_', ' ')} : {count}
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl m-1">
                                <Icon name="inbox" size="md" className="text-slate-300 mb-1.5" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin tareas registradas</span>
                            </div>
                        )}
                    </Section>

                    {frecuenciaGeneral?.totalHistorico > 0 && (
                        <Section title="Frecuencia Histórica Real" icon="confirmation_number">
                            <div className="flex flex-col gap-3">
                                {/* Métrica General Histórica */}
                                <div className="flex items-center justify-between px-4 py-3 rounded-xl border bg-slate-50 border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <Icon name="history" size="md" className="text-slate-500" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Promedio General del Área</p>
                                            <p className="text-sm">
                                                {renderTextoFrecuencia(frecuenciaGeneral.estadoFrecuencia, frecuenciaGeneral.frecuenciaDias)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Histórico</p>
                                        <p className="text-sm font-black text-slate-700">{frecuenciaGeneral.totalHistorico} reportes</p>
                                    </div>
                                </div>

                                {/* Patrones Específicos */}
                                {frecuenciaTickets.length > 0 && (
                                    <div className="flex flex-col gap-1.5 mt-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                                            Patrones más frecuentes
                                        </p>
                                        {frecuenciaTickets.slice(0, 5).map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-slate-200">
                                                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                                                    {i + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide truncate">
                                                        {item.clasificacion} · {item.categoria}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                                        Total: <span className="font-bold">{item.cantidadTotal}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right text-xs shrink-0 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100">
                                                    {renderTextoFrecuencia(item.estadoFrecuencia, item.frecuenciaDias)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Section>
                    )}

                    <Section title="Evaluación de tiempos totales" icon="timer">
                        {(tiempoRealTotal > 0 || tiempoEstimadoTotal > 0) ? (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tiempo Real Invertido</p>
                                        <p className={cn("text-xl font-black", alertaTiempo ? 'text-red-600' : 'text-slate-800')}>
                                            {formatMins(tiempoRealTotal)}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tiempo Estimado Global</p>
                                        <p className="text-xl font-black text-slate-800">{formatMins(tiempoEstimadoTotal)}</p>
                                    </div>
                                </div>

                                {(tiempoEstimadoTotal > 0 || tiempoRealTotal > 0) && (
                                    <div className={cn('flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors', clasesEstado)}>
                                        <Icon name={iconoEstado} size="md" />
                                        <div className="flex-1">
                                            <p className="text-sm font-black">
                                                {textoEstado}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl m-1">
                                <Icon name="timer_off" size="md" className="text-slate-300 mb-1.5" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin registro de tiempos</span>
                            </div>
                        )}
                    </Section>

                    <Section title="Distribución por clasificación" icon="label">
                        {Object.keys(clasificaciones).filter(k => clasificaciones[k] > 0).length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {topN(clasificaciones).map(([clas, count]) => (
                                    <BarRow key={clas} label={clas} count={count} total={totalReal} colorClass={CLASI_COLORS[clas] || 'bg-slate-400'} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl m-1">
                                <Icon name="label_off" size="md" className="text-slate-300 mb-1.5" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin clasificaciones</span>
                            </div>
                        )}
                    </Section>

                </div>
            </ModalBody>
        </Modal>
    );
};