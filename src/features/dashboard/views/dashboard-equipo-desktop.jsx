// src/features/dashboard/views/dashboard-equipo-desktop.jsx
import React from 'react';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { TecnicoKpiRow } from '../components/equipo/equipo-tecnico-kpi-row';
import { TecnicoDetalleModal } from '../components/equipo/equipo-detalle-modal';

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

export default function DashboardEquipoDesktop({ loading, tecnicos, operativos, coordinadores, sinRol, filtro, detalleTarget, onViewDetail, onCloseDetail }) {
    return (
        <>
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                {loading ? (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100"><Skeleton className="h-4 w-40" /></div>
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
                        <GrupoEquipo titulo="Personal Operativo" icon="engineering" tecnicos={operativos} onViewDetail={onViewDetail} />
                        <GrupoEquipo titulo="Coordinadores" icon="manage_accounts" tecnicos={coordinadores} onViewDetail={onViewDetail} />
                        <GrupoEquipo titulo="Otros" icon="person" tecnicos={sinRol} onViewDetail={onViewDetail} />
                    </>
                )}
            </div>

            {detalleTarget && (
                <TecnicoDetalleModal tecnico={detalleTarget} filtro={filtro} onClose={onCloseDetail} />
            )}
        </>
    );
}