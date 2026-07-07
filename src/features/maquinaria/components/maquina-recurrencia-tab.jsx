// src/features/maquinaria/components/maquina-recurrencia-tab.jsx
import React, { useState } from 'react';
import { useMaquinaRecurrencias } from '../hooks/use-maquina-recurrencias';
import { MaquinaRecurrenciaFormModal } from './maquina-recurrencia-form-modal';
import { Button, Icon, Spinner } from '@/components/ui/z_index';
import { formatearFechaTextoLargo } from '@/features/mantenimientos/helpers/fechas';

export const MaquinaRecurrenciaTab = ({ maquinaId, isAdminOrJefe = false }) => {
    const {
        recurrencias,
        loading,
        submitting,
        error,
        createRecurrencia,
        updateRecurrencia,
        deleteRecurrencia,
        materializeRecurrencia
    } = useMaquinaRecurrencias(maquinaId);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedRegla, setSelectedRegla] = useState(null);

    const openCreateForm = () => {
        setSelectedRegla(null);
        setIsFormOpen(true);
    };

    const openEditForm = (regla) => {
        setSelectedRegla(regla);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (payload) => {
        if (selectedRegla) {
            await updateRecurrencia(selectedRegla.id, payload);
        } else {
            await createRecurrencia(payload);
        }
    };

    const handleToggleActivo = async (regla) => {
        const confirmMessage = regla.activo
            ? `¿Está seguro de que desea desactivar esta regla? Los ciclos futuros dejarán de materializarse automáticamente.`
            : `¿Desea activar esta regla de recurrencia?`;
            
        if (window.confirm(confirmMessage)) {
            if (regla.activo) {
                await deleteRecurrencia(regla.id); // delete hace baja lógica
            } else {
                await updateRecurrencia(regla.id, { activo: true });
            }
        }
    };

    const handleMaterializeDemand = async (regla) => {
        const fechaCicloStr = regla.proximaFechaEjecucion.split('T')[0];
        const confirmMessage = `¿Desea materializar manualmente el ticket preventivo para el ciclo del ${formatearFechaTextoLargo(fechaCicloStr)}?`;
        
        if (window.confirm(confirmMessage)) {
            try {
                const res = await materializeRecurrencia(regla.id, fechaCicloStr);
                alert(res?.mensaje || 'Ticket materializado correctamente.');
            } catch (err) {
                alert(err.message || 'Error al materializar el ticket.');
            }
        }
    };

    const getFrecuenciaLabel = (regla) => {
        const map = {
            SEMANAL: 'Semanal',
            QUINCENAL: 'Quincenal',
            MENSUAL: 'Mensual'
        };
        if (regla.frecuencia === 'PERSONALIZADA_DIAS') {
            return `Cada ${regla.intervaloDias} días`;
        }
        return map[regla.frecuencia] || regla.frecuencia;
    };

    const getPrioridadStyle = (prioridad) => {
        const map = {
            BAJA: 'bg-slate-50 text-slate-500 border-slate-200',
            MEDIA: 'bg-blue-50 text-blue-700 border-blue-200',
            ALTA: 'bg-orange-50 text-orange-700 border-orange-200',
            CRITICA: 'bg-rose-50 text-rose-700 border-rose-200'
        };
        return map[prioridad] || 'bg-slate-50 text-slate-600 border-slate-200';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                        <Icon name="event_repeat" size="sm" className="text-slate-500" />
                        Planificación Recurrente
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-none">
                        Define las reglas de mantenimiento preventivo automático.
                    </span>
                </div>

                {isAdminOrJefe && (
                    <Button
                        type="button"
                        variant="primario"
                        size="xs"
                        icon="add"
                        onClick={openCreateForm}
                        disabled={loading || submitting}
                    >
                        Crear regla
                    </Button>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
                    <Icon name="error" className="shrink-0" size="sm" />
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Spinner size="sm" className="text-marca-primario" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Cargando plan de recurrencia...
                    </span>
                </div>
            ) : recurrencias.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recurrencias.map((r) => {
                        const nextDateStr = r.proximaFechaEjecucion.split('T')[0];
                        return (
                            <div
                                key={r.id}
                                className={`border rounded-2xl p-4 bg-white transition-all shadow-sm hover:shadow ${
                                    !r.activo ? 'border-slate-100 opacity-60' : 'border-slate-200/80'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black tracking-wide border ${getPrioridadStyle(r.prioridad)}`}>
                                                {r.prioridad}
                                            </span>
                                            <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-100 border border-slate-200 text-slate-500">
                                                {getFrecuenciaLabel(r)}
                                            </span>
                                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                                r.activo
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-slate-100 text-slate-500 border-slate-300'
                                            }`}>
                                                {r.activo ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-800 leading-snug break-words uppercase">
                                            {r.titulo}
                                        </span>
                                        {r.descripcion && (
                                            <p className="text-[10px] font-medium text-slate-500 mt-1 leading-relaxed line-clamp-2">
                                                {r.descripcion}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 mt-3 pt-3 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                                        <Icon name="person" size="xs" className="text-slate-400" />
                                        <span>Responsable: <strong className="text-slate-800">{r.tecnicoResponsable?.nombre}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                                        <Icon name="calendar_today" size="xs" className="text-slate-400" />
                                        <span>Próximo Ciclo: <strong className="text-slate-800">{formatearFechaTextoLargo(nextDateStr)}</strong></span>
                                    </div>
                                </div>

                                {isAdminOrJefe && (
                                    <div className="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEditForm(r)}
                                                disabled={submitting}
                                                className="inline-flex items-center justify-center p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
                                                title="Editar regla"
                                            >
                                                <Icon name="edit" size="14px" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActivo(r)}
                                                disabled={submitting}
                                                className={`inline-flex items-center justify-center p-1.5 rounded-xl border transition-colors shadow-sm cursor-pointer ${
                                                    r.activo
                                                        ? 'border-red-100 bg-white hover:bg-red-50 text-red-600'
                                                        : 'border-emerald-100 bg-white hover:bg-emerald-50 text-emerald-600'
                                                }`}
                                                title={r.activo ? 'Desactivar regla' : 'Activar regla'}
                                            >
                                                <Icon name={r.activo ? 'toggle_off' : 'toggle_on'} size="14px" />
                                            </button>
                                        </div>

                                        {r.activo && (
                                            <button
                                                type="button"
                                                onClick={() => handleMaterializeDemand(r)}
                                                disabled={submitting}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-marca-primario/10 text-marca-primario hover:bg-marca-primario/15 transition-colors cursor-pointer"
                                            >
                                                <Icon name="bolt" size="12px" />
                                                Materializar ya
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="p-8 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400 gap-3">
                    <div className="p-3 bg-slate-50 rounded-full border border-slate-100 text-slate-400">
                        <Icon name="event_repeat" size="md" />
                    </div>
                    <div className="max-w-xs space-y-1">
                        <span className="text-xs font-bold text-slate-600 block">Sin Plan Recurrente</span>
                        <p className="text-[10px] leading-normal font-medium">
                            Esta máquina no tiene preventivos automáticos programados actualmente.
                        </p>
                    </div>
                    {isAdminOrJefe && (
                        <Button
                            type="button"
                            variant="light"
                            size="xs"
                            icon="add"
                            onClick={openCreateForm}
                            disabled={submitting}
                        >
                            Configurar regla
                        </Button>
                    )}
                </div>
            )}

            {isFormOpen && (
                <MaquinaRecurrenciaFormModal
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={handleFormSubmit}
                    regla={selectedRegla}
                    loading={submitting}
                />
            )}
        </div>
    );
};
