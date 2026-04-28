// src/features/dashboard/views/dashboard-tecnico-mobile.jsx
import React from 'react';
import { Icon, Skeleton, GlassFab } from '@/components/ui/z_index';
import { PrincipalTecnicoDetalle } from '../components/principal/tecnico/principal-tecnico-detalle';
import { hardReload } from '@/utils/hard-reload';

export default function DashboardTecnicoMobile({ data, loading, error, currentUser, onRefresh }) {
    // O Controlador Mobile gere a estrutura base, o tratamento de erros global 
    // e injeta o GlassFab (Camada 1), delegando a grelha ao componente mestre.
    return (
        <>
            <div className="flex flex-col pb-28 animate-in fade-in duration-300 px-4 pt-4 relative z-10">

                {/* Cabeçalho da Vista */}
                <div className="flex flex-col gap-1.5 mb-6">
                    <div className="flex items-center justify-between">
                        <h2 className="fuente-titulos text-3xl text-marca-primario uppercase tracking-wide">
                            Panel Operativo
                        </h2>
                        {loading && <Skeleton className="h-6 w-24 rounded-full shadow-sm" />}
                        {!loading && data?.periodo && (
                            <span className="bg-marca-primario/10 text-marca-primario px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-marca-primario/20 shadow-sm">
                                {data.periodo.etiqueta}
                            </span>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 px-3 py-2.5 mb-6 bg-red-50/80 backdrop-blur-md border border-red-200 rounded-xl text-xs font-semibold text-red-700 shadow-sm">
                        <Icon name="error" size="xs" className="shrink-0" /> {error}
                    </div>
                )}

                {currentUser?.id && (
                    <PrincipalTecnicoDetalle
                        tecnicoId={currentUser.id}
                        loadingState={loading}
                        errorState={error}
                        tareasConteo={data?.conteosPorEstado}
                    />
                )}
            </div>

            {/* Elemento Absoluto - Liquid Glass */}
            <GlassFab
                icon="refresh"
                onClick={hardReload}
                isLoading={loading}
                variant="neutral"
                size={56}
                bottom="84px"
                right="20px"
            />
        </>
    );
}