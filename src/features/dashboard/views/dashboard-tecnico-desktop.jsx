// src/features/dashboard/views/dashboard-tecnico-desktop.jsx
import React from 'react';
import { Icon, Skeleton, Button } from '@/components/ui/z_index';
import { PrincipalTecnicoDetalle } from '../components/principal/tecnico/principal-tecnico-detalle';

export default function DashboardTecnicoDesktop({ data, loading, error, currentUser, onRefresh }) {
    // O Controlador Desktop atua como um invólucro (shell) puro.
    // Apenas injeta o layout global e passa o contexto de dados para o domínio.
    return (
        <div className="flex flex-col w-full max-w-full mx-auto animate-in fade-in duration-300 pb-10">
            {/* ── Encabezado Principal ── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                        <h3 className="fuente-titulos text-3xl text-marca-primario uppercase tracking-wide">
                            Tu rendimiento personal
                        </h3>

                        {/* Skeleton adaptado exactamente al tamaño y estilo de la pastilla final */}
                        {loading ? (
                            <Skeleton className="h-[28px] w-32 rounded-full border border-slate-100 shadow-sm" />
                        ) : data?.periodo ? (
                            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                                {data.periodo.etiqueta}
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 px-4 py-3 mb-6 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700 shadow-sm">
                    <Icon name="error" size="sm" className="shrink-0" /> {error}
                </div>
            )}

            {currentUser?.id && (
                <PrincipalTecnicoDetalle
                    tecnicoId={currentUser.id}
                    loadingState={loading}
                    errorState={error}
                    tareasConteo={data?.conteosPorEstado}
                    onRefresh={onRefresh}
                />
            )}
        </div>
    );
}