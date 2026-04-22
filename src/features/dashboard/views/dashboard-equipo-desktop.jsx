// src/features/dashboard/views/dashboard-equipo-desktop.jsx
import { useState } from 'react';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { EquipoCicloPanel } from '../components/equipo/equipo-ciclo-panel';
import { TecnicoKpiRow } from '../components/equipo/equipo-tecnico-kpi-row';
import { TecnicoDetalleModal } from '../components/equipo/equipo-detalle-modal';
import { EquipoCambioRol } from '../components/equipo/equipo-cambio-rol';
import DashboardEmptyState from '../components/dashboard-empty-state';

const GrupoTabla = ({ titulo, icon, personas, onViewDetail, loading }) => {
    if (!loading && personas.length === 0) return null;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
                <Icon name={icon} size="sm" className="text-marca-primario" />
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">{titulo}</h3>
                <span className="ml-auto text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                    {loading ? '…' : `Total: ${personas.length}`}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-[200px] flex flex-col justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-11 h-11 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-3/4 rounded-md" />
                                    <Skeleton className="h-2 w-1/2 rounded-md" />
                                </div>
                            </div>
                            <Skeleton className="h-1.5 w-full rounded-full" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    ))
                    : personas.map((p, index) => (
                        <TecnicoKpiRow
                            key={p.id}
                            tecnico={p}
                            rank={index + 1}
                            onViewDetail={onViewDetail}
                        />
                    ))
                }
            </div>
        </div>
    );
};

export default function DashboardEquipoDesktop({
    loading, error, tecnicos, coordinadores, promedioGlobal,
    filtro, detalleTarget, onViewDetail, onCloseDetail,
}) {
    const [rolActivo, setRolActivo] = useState('TECNICO');

    // 🚨 REGLA ESTRICTA INFALIBLE: Validar tareas, tickets y el promedio global
    const totalActividad = [...tecnicos, ...coordinadores].reduce((acc, p) => {
        const volumen =
            (p.totalTareas || 0) +
            (p.tareasActivas || 0) +
            (p.tareasTerminadas || 0) +
            (p.tickets || p.tiposTotales?.tickets || 0) +
            (p.total || 0);
        return acc + volumen;
    }, 0);

    const tieneDatos = totalActividad > 0 || (typeof promedioGlobal === 'number' && promedioGlobal > 0);
    const sinDatos = !loading && !tieneDatos;

    const personasActivas = rolActivo === 'TECNICO' ? tecnicos : coordinadores;
    const tituloTabla = rolActivo === 'TECNICO' ? 'Ranking de Técnicos' : 'Ranking de Coordinadores';
    const iconTabla = rolActivo === 'TECNICO' ? 'engineering' : 'manage_accounts';

    return (
        <>
            <div className="flex flex-col gap-8 animate-in fade-in duration-300 pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <EquipoCambioRol rolActivo={rolActivo} setRolActivo={setRolActivo} />
                    {promedioGlobal !== undefined && !sinDatos && (
                        <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right leading-tight">
                                Desempeño<br />Global
                            </span>
                            <span className="text-2xl font-black font-mono text-marca-primario">
                                {promedioGlobal}%
                            </span>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700">
                        <Icon name="error" size="sm" /> {error}
                    </div>
                )}

                {sinDatos && !error ? (
                    <DashboardEmptyState
                        mensaje="Rendimiento no disponible"
                        subtexto="No existen registros de tareas ni tickets procesados por el equipo en este periodo."
                    />
                ) : (
                    <>
                        <EquipoCicloPanel
                            personas={personasActivas}
                            promedioEquipoGlobal={promedioGlobal}
                            loading={loading}
                        />
                        <GrupoTabla
                            titulo={tituloTabla}
                            icon={iconTabla}
                            personas={personasActivas}
                            onViewDetail={onViewDetail}
                            loading={loading}
                        />
                    </>
                )}
            </div>

            {detalleTarget && (
                <TecnicoDetalleModal
                    tecnico={detalleTarget}
                    filtro={filtro}
                    onClose={onCloseDetail}
                />
            )}
        </>
    );
}