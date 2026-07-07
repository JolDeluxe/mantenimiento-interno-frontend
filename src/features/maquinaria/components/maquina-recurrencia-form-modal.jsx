// src/features/maquinaria/components/maquina-recurrencia-form-modal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon, Spinner } from '@/components/ui/z_index';
import { getAsignables } from '@/features/mantenimientos/api/mantenimientos-api';
import { getMinDateHoy } from '@/lib/date';

export const MaquinaRecurrenciaFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    regla = null, // Si viene regla, es modo edición
    loading = false
}) => {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [frecuencia, setFrecuencia] = useState('MENSUAL');
    const [intervaloDias, setIntervaloDias] = useState('');
    const [tecnicoResponsableId, setTecnicoResponsableId] = useState('');
    const [prioridad, setPrioridad] = useState('MEDIA');
    const [tiempoEstimado, setTiempoEstimado] = useState('');
    const [proximaFechaEjecucion, setProximaFechaEjecucion] = useState('');
    
    const [tecnicos, setTecnicos] = useState([]);
    const [loadingTecnicos, setLoadingTecnicos] = useState(false);
    const [formError, setFormError] = useState('');

    // Cargar técnicos disponibles al montar
    useEffect(() => {
        if (isOpen) {
            queueMicrotask(() => {
                setLoadingTecnicos(true);
            });
            getAsignables()
                .then(data => {
                    queueMicrotask(() => {
                        setTecnicos(data);
                    });
                })
                .catch(err => console.error('Error al cargar técnicos asignables:', err))
                .finally(() => {
                    queueMicrotask(() => {
                        setLoadingTecnicos(false);
                    });
                });
        }
    }, [isOpen]);

    // Inicializar campos en edición
    useEffect(() => {
        if (isOpen && regla) {
            const datePart = regla.proximaFechaEjecucion ? regla.proximaFechaEjecucion.split('T')[0] : '';
            queueMicrotask(() => {
                setTitulo(regla.titulo || '');
                setDescripcion(regla.descripcion || '');
                setFrecuencia(regla.frecuencia || 'MENSUAL');
                setIntervaloDias(regla.intervaloDias || '');
                setTecnicoResponsableId(regla.tecnicoResponsableId || '');
                setPrioridad(regla.prioridad || 'MEDIA');
                setTiempoEstimado(regla.tiempoEstimado || '');
                setProximaFechaEjecucion(datePart);
                setFormError('');
            });
        } else if (isOpen) {
            queueMicrotask(() => {
                setTitulo('');
                setDescripcion('');
                setFrecuencia('MENSUAL');
                setIntervaloDias('');
                setTecnicoResponsableId('');
                setPrioridad('MEDIA');
                setTiempoEstimado('');
                setProximaFechaEjecucion('');
                setFormError('');
            });
        }
    }, [isOpen, regla]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        // Validaciones del formulario
        if (!titulo.trim() || titulo.trim().length < 3) {
            setFormError('El título es obligatorio y debe tener al menos 3 caracteres.');
            return;
        }
        if (!frecuencia) {
            setFormError('La frecuencia es obligatoria.');
            return;
        }
        if (frecuencia === 'PERSONALIZADA_DIAS' && (!intervaloDias || parseInt(intervaloDias, 10) <= 0)) {
            setFormError('Debe ingresar un intervalo de días válido (mayor a 0).');
            return;
        }
        if (!tecnicoResponsableId) {
            setFormError('Debe asignar un técnico responsable.');
            return;
        }
        if (!proximaFechaEjecucion) {
            setFormError('Debe ingresar la fecha inicial del ciclo.');
            return;
        }

        const hoyLocal = getMinDateHoy();
        if (proximaFechaEjecucion < hoyLocal) {
            const fechaOriginal = regla?.proximaFechaEjecucion ? regla.proximaFechaEjecucion.split('T')[0] : '';
            if (!regla || proximaFechaEjecucion !== fechaOriginal) {
                setFormError('No se permiten fechas iniciales anteriores a hoy.');
                return;
            }
        }

        const payload = {
            titulo: titulo.trim(),
            descripcion: descripcion.trim() || null,
            frecuencia,
            intervaloDias: frecuencia === 'PERSONALIZADA_DIAS' ? parseInt(intervaloDias, 10) : null,
            tecnicoResponsableId: parseInt(tecnicoResponsableId, 10),
            prioridad,
            tiempoEstimado: tiempoEstimado ? parseInt(tiempoEstimado, 10) : null,
            proximaFechaEjecucion: new Date(`${proximaFechaEjecucion}T00:00:00.000Z`).toISOString()
        };

        onSubmit(payload)
            .then(() => onClose())
            .catch(err => {
                setFormError(err.message || 'Ocurrió un error al procesar el formulario.');
            });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-lg">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-2">
                    <Icon name="event_repeat" className="text-marca-primario" />
                    <span className="font-bold text-slate-800">
                        {regla ? 'Editar Mantenimiento Recurrente' : 'Nuevo Mantenimiento Recurrente'}
                    </span>
                </div>
            </ModalHeader>
            <form onSubmit={handleSubmit}>
                <ModalBody className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {formError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
                            <Icon name="error" className="shrink-0" size="sm" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Título de Tarea *</label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej. Cambio de Aceite y Filtros"
                            className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-marca-primario"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Descripción (Opcional)</label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Detalla las instrucciones o checklist para esta tarea recurrente..."
                            rows={3}
                            className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-marca-primario resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Frecuencia *</label>
                            <select
                                value={frecuencia}
                                onChange={(e) => setFrecuencia(e.target.value)}
                                className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-marca-primario"
                            >
                                <option value="SEMANAL">Semanal (Cada 7 días)</option>
                                <option value="QUINCENAL">Quincenal (Cada 14 días)</option>
                                <option value="MENSUAL">Mensual</option>
                                <option value="PERSONALIZADA_DIAS">Personalizada por Días</option>
                            </select>
                        </div>

                        {frecuencia === 'PERSONALIZADA_DIAS' && (
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Intervalo en Días *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={intervaloDias}
                                    onChange={(e) => setIntervaloDias(e.target.value)}
                                    placeholder="N° de días"
                                    className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-marca-primario"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prioridad *</label>
                            <select
                                value={prioridad}
                                onChange={(e) => setPrioridad(e.target.value)}
                                className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-marca-primario"
                            >
                                <option value="BAJA">Baja</option>
                                <option value="MEDIA">Media</option>
                                <option value="ALTA">Alta</option>
                                <option value="CRITICA">Crítica</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Minutos Estimados (Opcional)</label>
                            <input
                                type="number"
                                min="1"
                                value={tiempoEstimado}
                                onChange={(e) => setTiempoEstimado(e.target.value)}
                                placeholder="Ej: 60"
                                className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-marca-primario"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Técnico Responsable *</label>
                            {loadingTecnicos ? (
                                <div className="py-2 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                    <Spinner size="xs" /> Cargando técnicos...
                                </div>
                            ) : (
                                <select
                                    value={tecnicoResponsableId}
                                    onChange={(e) => setTecnicoResponsableId(e.target.value)}
                                    className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-marca-primario"
                                    required
                                >
                                    <option value="">Selecciona técnico...</option>
                                    {tecnicos.map(t => (
                                        <option key={t.id} value={t.id}>{t.nombre}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha de inicio del mantenimiento recurrente *</label>
                            <input
                                type="date"
                                value={proximaFechaEjecucion}
                                min={getMinDateHoy()}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    const hoyLocal = getMinDateHoy();
                                    setProximaFechaEjecucion(v && v < hoyLocal ? hoyLocal : v);
                                }}
                                className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-marca-primario"
                                required
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="flex gap-2 justify-end">
                    <Button
                        type="button"
                        variant="cancelar"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primario"
                        disabled={loading || loadingTecnicos}
                    >
                        {loading ? (
                            <span className="flex items-center gap-1">
                                <Spinner size="xs" /> Guardando...
                            </span>
                        ) : 'Guardar'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};
