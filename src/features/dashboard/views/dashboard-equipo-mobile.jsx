import { useState } from 'react';
import { Icon, Skeleton, GlassFab } from '@/components/ui/z_index';
import { EquipoCicloPanel } from '../components/equipo/equipo-ciclo-panel';
import { TecnicoKpiRow } from '../components/equipo/equipo-tecnico-kpi-row';
import { TecnicoDetalleModal } from '../components/equipo/equipo-detalle-modal';
import { EquipoCambioRol } from '../components/equipo/equipo-cambio-rol';
import { hardReload } from '@/utils/hard-reload';

const GrupoMobile = ({ titulo, icon, personas, onViewDetail }) => {
    if (personas.length === 0) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                <Icon name={icon} size="xs" className="text-marca-primario" />
                <h3 className="text-xs font-bold text-slate-800">{titulo}</h3>
                <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                    {personas.length}
                </span>
            </div>
            <div className="px-3 py-1">
                {personas.map((p) => (
                    <TecnicoKpiRow key={p.id} tecnico={p} onViewDetail={onViewDetail} />
                ))}
            </div>
        </div>
    );
};

export default function DashboardEquipoMobile({
    loading, error, tecnicos, coordinadores, promedioGlobal,
    filtro, detalleTarget, onViewDetail, onCloseDetail,
}) {
    const [rolActivo, setRolActivo] = useState('TECNICO');

    const sinDatos = !loading && tecnicos.length === 0 && coordinadores.length === 0;
    const personasActivas = rolActivo === 'TECNICO' ? tecnicos : coordinadores;
    const tituloTabla = rolActivo === 'TECNICO' ? 'Técnicos' : 'Coordinadores';
    const iconTabla = rolActivo === 'TECNICO' ? 'engineering' : 'manage_accounts';

    return (
        <>
            <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-28">

                {loading ? (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-3">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                                    <Skeleton className="h-3.5 w-32 rounded-full" />
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <div key={j} className="flex items-center gap-3">
                                            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                            <div className="flex-1 space-y-1.5">
                                                <Skeleton className="h-3 w-24 rounded-md" />
                                                <Skeleton className="h-1.5 w-full rounded-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700 mx-1">
                        <Icon name="error" size="sm" /> {error}
                    </div>
                ) : sinDatos ? (
                    <div className="flex flex-col items-center py-14 gap-3 text-slate-400">
                        <Icon name="engineering" size="xl" />
                        <p className="text-xs font-medium">Sin datos de equipo.</p>
                    </div>
                ) : (
                    <>
                        <EquipoCambioRol rolActivo={rolActivo} setRolActivo={setRolActivo} />

                        <EquipoCicloPanel
                            personas={personasActivas}
                            promedioEquipoGlobal={promedioGlobal}
                            loading={false}
                        />

                        <GrupoMobile
                            titulo={tituloTabla}
                            icon={iconTabla}
                            personas={personasActivas}
                            onViewDetail={onViewDetail}
                        />
                    </>
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