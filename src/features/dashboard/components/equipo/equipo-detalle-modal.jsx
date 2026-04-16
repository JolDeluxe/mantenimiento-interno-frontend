import React, { useState, useEffect } from 'react';
import { getTecnicoDetalle } from '../../api/metricas-api';
import {
    Icon, Skeleton, Modal, ModalHeader, ModalBody, ModalFooter, Button
} from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { EQUIPO_COLOR_MAP } from '../../constants';

const StatBox = ({ label, value, suffix = '', color = 'neutral', footnote }) => {
    const c = EQUIPO_COLOR_MAP[color] || EQUIPO_COLOR_MAP.neutral;
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

export const TecnicoDetalleModal = ({ tecnico, filtro, onClose }) => {
    const [detalle, setDetalle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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
    const colorKpi = d ? (d.kpiPromedio >= 80 ? 'green' : d.kpiPromedio >= 50 ? 'amber' : 'red') : 'neutral';
    const colorRetrabajo = d ? (d.indiceRetrabajo <= 10 ? 'green' : d.indiceRetrabajo <= 30 ? 'amber' : 'red') : 'neutral';
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
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-marca-primario/10 flex items-center justify-center text-xl font-black text-marca-primario uppercase">
                                {d.tecnico.nombre?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-base font-extrabold text-slate-900">{d.tecnico.nombre}</p>
                                <p className="text-xs text-slate-500">{d.tecnico.cargo || d.tecnico.rol}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatBox label="KPI Promedio" value={d.kpiPromedio} suffix="%" color={colorKpi} footnote={`${d.tareasCompletadas} tareas`} />
                            <StatBox label="Retrabajo" value={d.indiceRetrabajo} suffix="%" color={colorRetrabajo} footnote="rechazadas" />
                            <StatBox label="Efic. Estim." value={d.eficienciaEstimacion} suffix="%" color={colorEfic} footnote="vs tiempo" />
                            <StatBox label="Tiempo real" value={tiempoStr} color="neutral" footnote="en período" />
                        </div>
                    </div>
                ) : null}
            </ModalBody>
            <ModalFooter>
                <Button variant="cancelar" onClick={onClose}>Cerrar</Button>
            </ModalFooter>
        </Modal>
    );
};