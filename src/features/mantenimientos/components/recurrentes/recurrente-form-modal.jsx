import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Icon, Modal, ModalBody, ModalFooter, ModalHeader, SearchableSelect, Spinner } from '@/components/ui/z_index';
import { Label } from '@/components/form/z_index';
import { getAllMaquinas, getMaquinaById } from '@/features/maquinaria/api/maquinaria-api';
import { getAsignables } from '@/features/mantenimientos/api/mantenimientos-api';
import { DurationPicker, PrioridadField } from '@/features/common/forms/tareas/fields';
import { TecnicoCartSelector } from '@/features/common/forms/tareas/responsables';
import { buildMaquinaOptions, filterMaquinasParaMantenimiento, normalizeMaquinasResponse } from '@/features/common/forms/tareas/utils/maquinas-filter-utils';
import { PRIORIDADES } from '@/features/common/constants/catalogos-tareas';
import { getMinDateHoy } from '@/lib/date';
import { cn } from '@/utils/cn';
import { notify } from '@/components/notification/adaptive-notify';

const FRECUENCIAS = [
    { value: 'SEMANAL', label: 'Semanal', description: 'Cada semana', icon: 'view_week' },
    { value: 'QUINCENAL', label: 'Quincenal', description: 'Cada 2 semanas', icon: 'date_range' },
    { value: 'MENSUAL', label: 'Mensual', description: 'Cada mes', icon: 'calendar_month' },
    { value: 'TRIMESTRAL', label: 'Trimestral', description: 'Cada 3 meses', icon: 'event_repeat' },
    { value: 'PERSONALIZADA_DIAS', label: 'Personalizada', description: 'Define intervalo', icon: 'tune' },
];

const datePart = (value) => value ? String(value).split('T')[0] : '';
const DESCRIPCION_PREVENTIVA = 'Mantenimiento preventivo de maquinaria.';

const FrequencyOption = ({ option, selected, disabled, onClick }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={cn(
            'flex min-h-[74px] min-w-0 items-start gap-2 rounded-xl border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-70',
            selected
                ? 'border-marca-primario bg-marca-primario/5 text-marca-primario shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
        )}
    >
        <Icon name={option.icon} size="18px" className="mt-0.5 shrink-0" />
        <span className="min-w-0 flex-1">
            <span className="block break-words text-xs font-black uppercase leading-tight">{option.label}</span>
            <span className="mt-0.5 block text-[11px] font-semibold leading-tight opacity-80">{option.description}</span>
        </span>
    </button>
);

export const RecurrenteFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    regla = null,
    submitting = false,
}) => {
    const [maquinas, setMaquinas] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [loadingCatalogos, setLoadingCatalogos] = useState(false);
    const [buscandoMaquinas, setBuscandoMaquinas] = useState(false);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [maquinaId, setMaquinaId] = useState('');
    const [tecnicoResponsableId, setTecnicoResponsableId] = useState('');
    const [frecuencia, setFrecuencia] = useState('MENSUAL');
    const [intervaloDias, setIntervaloDias] = useState('');
    const [proximaFechaEjecucion, setProximaFechaEjecucion] = useState('');
    const [prioridad, setPrioridad] = useState('MEDIA');
    const [tiempoEstimado, setTiempoEstimado] = useState('');
    const [activo, setActivo] = useState(true);

    const aplicarCatalogoMaquinas = useCallback((rawList) => {
        setMaquinas(filterMaquinasParaMantenimiento(rawList, regla?.maquinaId));
    }, [regla?.maquinaId]);

    const buscarMaquinasRemoto = useCallback(async (query = '') => {
        setBuscandoMaquinas(true);
        try {
            const params = {};
            if (query.trim()) params.q = query.trim();
            const response = await getAllMaquinas(params);
            const maquinasData = normalizeMaquinasResponse(response);

            const selectedId = regla?.maquinaId;
            if (selectedId && !query.trim() && !maquinasData.some((maquina) => String(maquina.id) === String(selectedId))) {
                const selectedResponse = await getMaquinaById(selectedId);
                const selectedMaquina = selectedResponse?.data?.data || selectedResponse?.data;
                if (selectedMaquina?.id) maquinasData.unshift(selectedMaquina);
            }

            aplicarCatalogoMaquinas(maquinasData);
        } catch {
            setFormError('Error al cargar maquinas.');
        } finally {
            setBuscandoMaquinas(false);
        }
    }, [aplicarCatalogoMaquinas, regla?.maquinaId]);

    useEffect(() => {
        if (!isOpen) return;
        queueMicrotask(() => setLoadingCatalogos(true));
        Promise.all([
            buscarMaquinasRemoto(''),
            getAsignables(),
        ])
            .then(([, tecnicosRes]) => {
                const tecnicosData = Array.isArray(tecnicosRes) ? tecnicosRes : Array.isArray(tecnicosRes?.data) ? tecnicosRes.data : [];
                setTecnicos(tecnicosData);
            })
            .catch(() => setFormError('Error al cargar catalogos.'))
            .finally(() => setLoadingCatalogos(false));
    }, [buscarMaquinasRemoto, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        queueMicrotask(() => {
            setFormError('');
            setFieldErrors({});
            setMaquinaId(regla?.maquinaId ? String(regla.maquinaId) : '');
            setTecnicoResponsableId(regla?.tecnicoResponsableId ? String(regla.tecnicoResponsableId) : regla?.tecnicoResponsable?.id ? String(regla.tecnicoResponsable.id) : '');
            setFrecuencia(regla?.frecuencia || 'MENSUAL');
            setIntervaloDias(regla?.intervaloDias ? String(regla.intervaloDias) : '');
            setProximaFechaEjecucion(datePart(regla?.proximaFechaEjecucion));
            setPrioridad(regla?.prioridad || 'MEDIA');
            setTiempoEstimado(regla?.tiempoEstimado ? String(regla.tiempoEstimado) : '');
            setActivo(regla?.activo ?? true);
        });
    }, [isOpen, regla]);

    const maquinaOptions = useMemo(() => buildMaquinaOptions(maquinas), [maquinas]);

    const maquinaSeleccionada = useMemo(() => (
        maquinas.find((maquina) => String(maquina.id) === String(maquinaId)) || regla?.maquina || null
    ), [maquinaId, maquinas, regla]);

    const tituloPreventivo = maquinaSeleccionada?.codigo
        ? `${maquinaSeleccionada.codigo} Mantenimiento Preventivo`
        : regla?.titulo || 'Mantenimiento Preventivo';

    const clearFieldError = (...keys) => {
        setFieldErrors((prev) => {
            if (!keys.some((key) => prev[key])) return prev;
            const next = { ...prev };
            keys.forEach((key) => delete next[key]);
            return next;
        });
    };

    const handleMaquinaChange = (value) => {
        setMaquinaId(value);
        clearFieldError('maquinaId');
    };

    const handleTecnicoChange = (value) => {
        setTecnicoResponsableId(value);
        clearFieldError('tecnicoResponsableId');
    };

    const handleFrecuenciaChange = (value) => {
        setFrecuencia(value);
        clearFieldError('frecuencia', 'intervaloDias');
        if (value !== 'PERSONALIZADA_DIAS') {
            setIntervaloDias('');
        }
    };

    const handleIntervaloChange = (value) => {
        setIntervaloDias(value);
        clearFieldError('intervaloDias');
    };

    const handleFechaChange = (value) => {
        setProximaFechaEjecucion(value);
        clearFieldError('proximaFechaEjecucion');
    };

    const handleTiempoChange = (value) => {
        setTiempoEstimado(String(value || ''));
        clearFieldError('tiempoEstimado');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError('');
        const errors = {};
        const intervalo = Number(intervaloDias);
        const duracion = Number(tiempoEstimado);

        if (!maquinaId) errors.maquinaId = 'Selecciona una maquina.';
        if (!tecnicoResponsableId) errors.tecnicoResponsableId = 'Selecciona responsable tecnico.';
        if (!frecuencia) errors.frecuencia = 'Selecciona frecuencia.';
        if (!regla && !proximaFechaEjecucion) errors.proximaFechaEjecucion = 'Selecciona fecha inicial programada.';
        if (!regla && proximaFechaEjecucion && proximaFechaEjecucion < getMinDateHoy()) errors.proximaFechaEjecucion = 'No se permiten fechas anteriores a hoy.';
        if (frecuencia === 'PERSONALIZADA_DIAS' && (!Number.isInteger(intervalo) || intervalo <= 0)) {
            errors.intervaloDias = 'Indica intervalo de dias mayor a 0.';
        }
        if (tiempoEstimado && (!Number.isFinite(duracion) || duracion <= 0)) errors.tiempoEstimado = 'La duracion debe ser positiva.';

        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const payload = {
            maquinaId: Number(maquinaId),
            titulo: tituloPreventivo,
            descripcion: DESCRIPCION_PREVENTIVA,
            categoria: 'MAQUINARIA',
            prioridad,
            tiempoEstimado: tiempoEstimado ? Number(tiempoEstimado) : null,
            frecuencia,
            intervaloDias: frecuencia === 'PERSONALIZADA_DIAS' ? Number(intervaloDias) : null,
            tecnicoResponsableId: Number(tecnicoResponsableId),
            proximaFechaEjecucion: new Date(`${proximaFechaEjecucion}T00:00:00.000Z`).toISOString(),
            activo,
        };

        try {
            await onSubmit(payload);
            onClose();
        } catch (err) {
            const backendError = err.response?.data;
            const fallbackMessage = err.message || 'Error al guardar programacion preventiva.';
            let displayMessage = fallbackMessage;

            if (backendError?.details && Array.isArray(backendError.details)) {
                const specificErrors = {};
                backendError.details.forEach((d) => {
                    const fieldName = d.path.join('.');
                    specificErrors[fieldName] = d.message;
                });
                setFieldErrors(specificErrors);
                displayMessage = backendError.details.map(d => d.message).join('. ');
            }

            setFormError(displayMessage);

            notify.error(
                <div className="flex flex-col gap-0.5 font-sans">
                    <span className="font-bold text-xs">No se pudo crear la programación</span>
                    <span className="text-[11px] leading-normal opacity-90">{displayMessage}</span>
                </div>
            );
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-3xl">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-2">
                    <Icon name="event_repeat" className="text-marca-primario" />
                    <span className="font-bold text-slate-800">
                        {regla ? 'Editar programacion preventiva' : 'Nueva programacion preventiva'}
                    </span>
                </div>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
                <ModalBody className="max-h-[74vh] space-y-4 overflow-y-auto p-5">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                        Mantenimiento preventivo recurrente · MAQUINARIA / PREVENTIVO / PLANEADA
                    </div>
                    <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">
                        El sistema generara el mantenimiento del periodo y usara fin de mes como fecha limite mensual.
                    </div>

                    {formError && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                            <Icon name="error" size="sm" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <Label error={!!fieldErrors.maquinaId}>Maquina *</Label>
                            <SearchableSelect
                                options={maquinaOptions}
                                value={maquinaId}
                                onChange={handleMaquinaChange}
                                placeholder={loadingCatalogos ? 'Cargando maquinas...' : 'Selecciona maquina'}
                                searchPlaceholder="Buscar por codigo o nombre..."
                                allOptionText={null}
                                disabled={loadingCatalogos || submitting}
                                isSearching={buscandoMaquinas}
                                onSearchChange={buscarMaquinasRemoto}
                                className={fieldErrors.maquinaId ? 'border-rose-500 focus:ring-2 focus:ring-rose-200' : ''}
                            />
                            {fieldErrors.maquinaId && <p className="mt-1 text-[10px] font-bold text-rose-600">{fieldErrors.maquinaId}</p>}
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4">
                                <Label>Titulo</Label>
                                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
                                    {tituloPreventivo}
                                </div>
                            </div>
                            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4">
                                <Label>Descripcion</Label>
                                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
                                    {DESCRIPCION_PREVENTIVA}
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <Label error={!!fieldErrors.tecnicoResponsableId}>Responsable tecnico *</Label>
                            <TecnicoCartSelector
                                tecnicos={tecnicos}
                                value={tecnicoResponsableId}
                                onChange={handleTecnicoChange}
                                disabled={loadingCatalogos || submitting}
                                placeholder={loadingCatalogos ? 'Cargando tecnicos...' : 'Buscar y seleccionar tecnico...'}
                            />
                            {fieldErrors.tecnicoResponsableId && <p className="mt-1 text-[10px] font-bold text-rose-600">{fieldErrors.tecnicoResponsableId}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <Label error={!!fieldErrors.frecuencia}>Frecuencia *</Label>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                                {FRECUENCIAS.map((item) => (
                                    <FrequencyOption
                                        key={item.value}
                                        option={item}
                                        selected={frecuencia === item.value}
                                        disabled={submitting}
                                        onClick={() => handleFrecuenciaChange(item.value)}
                                    />
                                ))}
                            </div>
                            {fieldErrors.frecuencia && <p className="mt-1 text-[10px] font-bold text-rose-600">{fieldErrors.frecuencia}</p>}
                        </div>

                        {frecuencia === 'TRIMESTRAL' && (
                            <div className="rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-2 text-[11px] font-semibold text-sky-700 leading-normal font-sans">
                                <strong>Trimestral:</strong> Se repite cada 3 meses conservando el día original cuando sea posible.
                            </div>
                        )}

                        {frecuencia === 'PERSONALIZADA_DIAS' && (
                            <div>
                                <Label error={!!fieldErrors.intervaloDias}>Intervalo dias *</Label>
                                <input
                                    type="number"
                                    min="1"
                                    value={intervaloDias}
                                    onChange={(event) => handleIntervaloChange(event.target.value)}
                                    className={cn('w-full rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none', fieldErrors.intervaloDias ? 'border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:border-marca-primario')}
                                />
                                {fieldErrors.intervaloDias && <p className="mt-1 text-[10px] font-bold text-rose-600">{fieldErrors.intervaloDias}</p>}
                            </div>
                        )}

                        <div>
                            <Label error={!!fieldErrors.proximaFechaEjecucion}>Fecha inicial programada *</Label>
                            <input
                                type="date"
                                min={getMinDateHoy()}
                                disabled={loadingCatalogos || submitting || !!regla}
                                value={proximaFechaEjecucion}
                                onChange={(event) => handleFechaChange(event.target.value)}
                                className={cn('w-full rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none disabled:bg-slate-50 disabled:text-slate-400', fieldErrors.proximaFechaEjecucion ? 'border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:border-marca-primario')}
                            />
                            {fieldErrors.proximaFechaEjecucion && <p className="mt-1 text-[10px] font-bold text-rose-600">{fieldErrors.proximaFechaEjecucion}</p>}
                        </div>

                        <div>
                            <PrioridadField
                                id="preventivo-prioridad"
                                value={prioridad}
                                onChange={setPrioridad}
                                options={PRIORIDADES}
                                label="Prioridad"
                            />
                        </div>

                        <div>
                            <Label>Tiempo estimado</Label>
                            <DurationPicker
                                valueMins={Number(tiempoEstimado) || 0}
                                onChange={handleTiempoChange}
                                disabled={submitting}
                                error={!!fieldErrors.tiempoEstimado}
                            />
                            {fieldErrors.tiempoEstimado && <p className="mt-1 text-[10px] font-bold text-rose-600">{fieldErrors.tiempoEstimado}</p>}
                        </div>

                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                            <input
                                type="checkbox"
                                checked={activo}
                                onChange={(event) => setActivo(event.target.checked)}
                                className="h-4 w-4 rounded border-slate-300"
                            />
                            Regla activa
                        </label>
                    </div>
                </ModalBody>

                <ModalFooter className="flex justify-end gap-2">
                    <Button type="button" variant="cancelar" onClick={onClose} disabled={submitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="guardar" disabled={submitting || loadingCatalogos}>
                        {submitting ? <span className="inline-flex items-center gap-1"><Spinner size="xs" /> Guardando</span> : 'Guardar'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};
