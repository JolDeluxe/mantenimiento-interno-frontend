// src/features/dashboard/views/dashboard-equipo-mobile.jsx
import React from 'react';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { TecnicoKpiRow } from '../components/equipo/equipo-tecnico-kpi-row';
import { TecnicoDetalleModal } from '../components/equipo/equipo-detalle-modal';

const GrupoEquipoMobile = ({ titulo, icon, tecnicos, onViewDetail }) => {
    if (tecnicos.length === 0) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                <Icon name={icon} size="xs" className="text-marca-primario" />
                <h3 className="text-xs font-bold text-slate-800">{titulo}</h3>
                <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                    {tecnicos.length}
                </span>
            </div>
            <div className="px-3 py-1 flex flex-col gap-1">
                {tecnicos.map((t) => (
                    <TecnicoKpiRow key={t.id} tecnico={t} onViewDetail={onViewDetail} isMobile={true} />
                ))}
            </div>
        </div>
    );
};

export default function DashboardEquipoMobile({ loading, tecnicos, operativos, coordinadores, sinRol, filtro, detalleTarget, onViewDetail, onCloseDetail }) {
    return (
        <>
            <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-8">
                {loading ? (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
                                <Skeleton className="w-8 h-8 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-2 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : tecnicos.length === 0 ? (
                    <div className="flex flex-col items-center py-12 gap-3 text-slate-400">
                        <Icon name="engineering" size="xl" />
                        <p className="text-xs font-medium">Sin datos de equipo.</p>
                    </div>
                ) : (
                    <>
                        <GrupoEquipoMobile titulo="Operativos" icon="engineering" tecnicos={operativos} onViewDetail={onViewDetail} />
                        <GrupoEquipoMobile titulo="Coordinadores" icon="manage_accounts" tecnicos={coordinadores} onViewDetail={onViewDetail} />
                        <GrupoEquipoMobile titulo="Otros" icon="person" tecnicos={sinRol} onViewDetail={onViewDetail} />
                    </>
                )}
            </div>

            {detalleTarget && (
                <TecnicoDetalleModal tecnico={detalleTarget} filtro={filtro} onClose={onCloseDetail} />
            )}
        </>
    );
}