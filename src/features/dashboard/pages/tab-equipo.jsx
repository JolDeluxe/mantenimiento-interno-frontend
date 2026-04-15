import React, { useState, useCallback } from 'react';
import { useDashboardContext } from '../context/dashboard-context';
import { TecnicoKpiRow } from '../components/tecnico-kpi-row';
import { getTecnicoDetalle } from '../api/metricas-api';
import {
    Icon, Skeleton, Modal, ModalHeader, ModalBody, ModalFooter, Button
} from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const COLOR_MAP = {
    green: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    amber: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    red: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    neutral: { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
};

// ── Sección por grupo de rol ──────────────────────────────────────────────────
const GrupoEquipo = ({ titulo, icon, tecnicos, onViewDetail }) => {
    if (tecnicos.length === 0) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/60">
                <Icon name={icon} size="sm" className="text-marca-primario" />
                <h3 className="text-sm font-bold text-slate-800">{titulo}</h3>
                <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                    {tecnicos.length}
                </span>
            </div>
            <div className="px-5 py-1">
                {tecnicos.map((t) => (
                    <TecnicoKpiRow key={t.id} tecnico={t} onViewDetail={onViewDetail} />
                ))}
            </div>
        </div>
    );
};

// ── Mini stat box para el modal ───────────────────────────────────────────────
const StatBox = ({ label, value, suffix = '', color = 'neutral', footnote }) => {
    const c = COLOR_MAP[color] || COLOR_MAP.neutral;
    return (
        <div className={cn('rounded-xl p-4 border flex flex-col gap-1', c.bg, c.border)}>
            <span className={cn('text-[10px] font-bold uppercase tracking-wider', c.text)}>{label}</span>
            <div className="flex items-end gap-1">
                <span className={cn('text-3xl font-extrabold font-mono leading-none', c.text)}>
                    {value ?? '—'}
                </span>
                {value !== null && value !== undefined && suffix && (
                    <span className={cn('text-sm font-bold mb-0.5', c.text)}>{suffix}</span>
                )}
            </div>
            {footnote && <span className="text-[10px] text-slate-400">{footnote}</span>}
        </div>
    );
};

// ── Modal de detalle del técnico ──────────────────────────────────────────────
const TecnicoDetalleModal = ({ tecnico, filtro, onClose }) => {
    const [detalle, setDetalle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        if (!tecnico) return;
        setLoading(true);
        setError(null);

        const params = {};
        if (filtro.fechaInicio && filtro.fechaFin) {
            params.fechaInicio = filtro.fechaInicio;
            params.fechaFin = filtro.fechaFin;
        } else {
            if (filtro.year) params.year = filtro.year;
            if (filtro.month) params.month = filtro.month;
        }

        getTecnicoDetalle(tecnico.id, params)
            .then((res) => setDetalle(res?.data ?? null))
            .catch(() => setError('No se pudo cargar el detalle.'))
            .finally(() => setLoading(false));
    }, [tecnico, filtro]);

    const d = detalle;

    // Prevención de crasheos validando correctamente la existencia de 'd'
    const colorKpi = d ? (d.kpiPromedio >= 80 ? 'green' : d.kpiPromedio >= 50 ? 'amber' : 'red') : 'neutral';

    const colorRetrabajo = d
        ? (d.indiceRetrabajo <= 10 ? 'green' : d.indiceRetrabajo <= 30 ? 'amber' : 'red')
        : 'neutral';

    const colorEfic = d && d.eficienciaEstimacion !== null
        ? (d.eficienciaEstimacion >= 70 ? 'green' : d.eficienciaEstimacion >= 40 ? 'amber' : 'red')
        : 'neutral';

    const mins = d?.minutosReales ?? 0;
    const tiempoStr = mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;

    return (
        <Modal isOpen onClose={onClose} className="md:max-w-2xl">
            <ModalHeader
                title={loading ? 'Cargando...' : `Detalle — ${d?.tecnico?.nombre ?? tecnico.nombre}`}
                onClose={onClose}
            />
            <ModalBody>
                {loading ? (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                        </div>
                        <Skeleton className="h-32 rounded-xl" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center py-8 gap-3 text-slate-400">
                        <Icon name="error" size="xl" className="text-red-400" />
                        <p className="text-sm">{error}</p>
                    </div>
                ) : d ? (
                    <div className="flex flex-col gap-5">
                        {/* Perfil */}
                        <div className="flex items-center gap-3">
                            {d.tecnico.imagen ? (
                                <img
                                    src={d.tecnico.imagen}
                                    alt={d.tecnico.nombre}
                                    className="w-14 h-14 rounded-full object-cover border border-slate-200"
                                    onError={(e) => { e.target.src = '/img/perfil-no-foto.webp'; }}
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-marca-primario/10 flex items-center justify-center text-xl font-black text-marca-primario">
                                    {d.tecnico.nombre?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-base font-extrabold text-slate-900">{d.tecnico.nombre}</p>
                                <p className="text-xs text-slate-500">{d.tecnico.cargo || d.tecnico.rol}</p>
                                {!d.datosSuficientes && (
                                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5 mt-1">
                                        <Icon name="warning" size="xs" /> Datos insuficientes — resultado orientativo
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* KPIs principales */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatBox
                                label="KPI Promedio"
                                value={d.kpiPromedio}
                                suffix="%"
                                color={colorKpi}
                                footnote={`${d.tareasCompletadas} tareas`}
                            />
                            <StatBox
                                label="Índice Retrabajo"
                                value={d.indiceRetrabajo}
                                suffix="%"
                                color={colorRetrabajo}
                                footnote="tareas rechazadas"
                            />
                            <StatBox
                                label="Efic. Estimación"
                                value={d.eficienciaEstimacion ?? '—'}
                                suffix={d.eficienciaEstimacion !== null ? '%' : ''}
                                color={colorEfic}
                                footnote="dentro del tiempo"
                            />
                            <StatBox
                                label="Tiempo real"
                                value={tiempoStr}
                                suffix=""
                                color="neutral"
                                footnote="en el período"
                            />
                        </div>

                        {/* Distribución por clasificación */}
                        {Object.keys(d.distribucionClasificacion).length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Distribución por clasificación
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(d.distribucionClasificacion).map(([clas, count]) => (
                                        <div
                                            key={clas}
                                            className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1"
                                        >
                                            <span className="text-[10px] font-bold text-slate-600 uppercase">{clas}</span>
                                            <span className="text-[10px] font-extrabold text-marca-primario font-mono">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Últimas tareas */}
                        {d.tareasRecientes.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Tareas recientes
                                </p>
                                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                                    {d.tareasRecientes.map((t) => (
                                        <div key={t.id} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                                            <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">#{t.id}</span>
                                            <span className="text-xs text-slate-700 font-medium flex-1 truncate">{t.titulo}</span>
                                            <div className={cn(
                                                'shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full',
                                                t.colorKpi === 'green' ? 'bg-emerald-100 text-emerald-700' :
                                                    t.colorKpi === 'amber' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                            )}>
                                                {t.kpi}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </ModalBody>
            <ModalFooter>
                <Button variant="cancelar" onClick={onClose}>Cerrar</Button>
            </ModalFooter>
        </Modal>
    );
};

// ── Pestaña principal ─────────────────────────────────────────────────────────
export default function TabEquipo() {
    const { data, loading, filtro } = useDashboardContext();
    const tecnicos = data?.kpiPorTecnico ?? [];

    const [detalleTarget, setDetalleTarget] = useState(null);

    const handleViewDetail = useCallback((tecnico) => {
        setDetalleTarget(tecnico);
    }, []);

    const operativos = tecnicos.filter((t) => t.rol === 'TECNICO');
    const coordinadores = tecnicos.filter((t) => t.rol === 'COORDINADOR_MTTO' || t.rol === 'JEFE_MTTO');
    const sinRol = tecnicos.filter((t) => !['TECNICO', 'COORDINADOR_MTTO', 'JEFE_MTTO'].includes(t.rol));

    return (
        <>
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                {loading ? (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <div className="px-5 py-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-100">
                                    <Skeleton className="w-9 h-9 rounded-full" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-3 w-32 rounded-md" />
                                        <Skeleton className="h-2 w-full rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : tecnicos.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
                        <Icon name="engineering" size="xl" />
                        <p className="text-sm font-medium">Sin datos de equipo en este período.</p>
                    </div>
                ) : (
                    <>
                        <GrupoEquipo
                            titulo="Personal Operativo"
                            icon="engineering"
                            tecnicos={operativos}
                            onViewDetail={handleViewDetail}
                        />
                        <GrupoEquipo
                            titulo="Coordinadores"
                            icon="manage_accounts"
                            tecnicos={coordinadores}
                            onViewDetail={handleViewDetail}
                        />
                        <GrupoEquipo
                            titulo="Otros"
                            icon="person"
                            tecnicos={sinRol}
                            onViewDetail={handleViewDetail}
                        />
                    </>
                )}
            </div>

            {detalleTarget && (
                <TecnicoDetalleModal
                    tecnico={detalleTarget}
                    filtro={filtro}
                    onClose={() => setDetalleTarget(null)}
                />
            )}
        </>
    );
}