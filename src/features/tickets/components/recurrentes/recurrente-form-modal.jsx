import { useEffect, useMemo, useState } from 'react';
import { Button, Icon, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from '@/components/ui/z_index';
import { Label, Select } from '@/components/form/z_index';
import { AREAS, CATEGORIAS_EQUIPO, PRIORIDADES, normalizeAreaName } from '@/features/common/constants/catalogos-tareas';
import { DescripcionField, DurationPicker, PlantaAreaFields, PrioridadField, TituloField } from '@/features/common/forms/tareas/fields';
import { ResponsablesDesktopSection } from '@/features/common/forms/tareas/responsables';
import { getMinDateHoy } from '@/lib/date';
import { cn } from '@/utils/cn';
import { minutesToHHmm, normalizeOptions, UNIDADES_FRECUENCIA } from './recurrentes-utils';

const MAX_TITULO = 255;
const MAX_DESCRIPCION = 1000;

const FRECUENCIAS_ACTIVIDAD = [
    {
        value: 'DIARIA',
        label: 'Diaria',
        description: 'Todos los dias',
        icon: 'today',
        unidad: 'DIA',
        intervalo: 1,
    },
    {
        value: 'SEMANAL',
        label: 'Semanal',
        description: 'Cada semana',
        icon: 'view_week',
        unidad: 'SEMANA',
        intervalo: 1,
    },
    {
        value: 'QUINCENAL',
        label: 'Quincenal',
        description: 'Cada 2 semanas',
        icon: 'date_range',
        unidad: 'SEMANA',
        intervalo: 2,
    },
    {
        value: 'MENSUAL',
        label: 'Mensual',
        description: 'Cada mes',
        icon: 'calendar_month',
        unidad: 'MES',
        intervalo: 1,
    },
    {
        value: 'PERSONALIZADA',
        label: 'Personalizada',
        description: 'Define intervalo',
        icon: 'tune',
        unidad: 'DIA',
        intervalo: 1,
    },
];

const getFrecuenciaFromRule = (regla) => {
    const unidad = regla?.unidad || 'DIA';
    const intervalo = Number(regla?.intervalo || 1);
    if (unidad === 'DIA' && intervalo === 1) return 'DIARIA';
    if (unidad === 'SEMANA' && intervalo === 1) return 'SEMANAL';
    if (unidad === 'SEMANA' && intervalo === 2) return 'QUINCENAL';
    if (unidad === 'MES' && intervalo === 1) return 'MENSUAL';
    return 'PERSONALIZADA';
};

const buildFrecuenciaFields = (frecuencia, unidad, intervalo) => {
    if (frecuencia === 'PERSONALIZADA') {
        return {
            unidad: unidad || 'DIA',
            intervalo: String(intervalo || 1),
        };
    }

    const preset = FRECUENCIAS_ACTIVIDAD.find((item) => item.value === frecuencia) || FRECUENCIAS_ACTIVIDAD[0];
    return {
        unidad: preset.unidad,
        intervalo: String(preset.intervalo),
    };
};

const INITIAL_FORM = {
    titulo: '',
    descripcion: '',
    categoria: '',
    area: '',
    prioridad: 'MEDIA',
    fechaInicio: '',
    fechaFin: '',
    frecuencia: 'DIARIA',
    unidad: 'DIA',
    intervalo: '1',
    tiempoEstimado: '',
    responsables: [],
};

const toDateInput = (value) => value ? String(value).split('T')[0] : '';
const isSundayInputDate = (value) => {
    if (!value) return false;
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 0;
};

const buildFormFromRule = (regla) => {
    if (!regla) return INITIAL_FORM;
    return {
        titulo: regla.titulo || '',
        descripcion: regla.descripcion || '',
        categoria: regla.categoria || '',
        area: regla.area || '',
        prioridad: regla.prioridad || 'MEDIA',
        fechaInicio: toDateInput(regla.fechaInicio),
        fechaFin: toDateInput(regla.fechaFin),
        frecuencia: getFrecuenciaFromRule(regla),
        unidad: regla.unidad || 'DIA',
        intervalo: String(regla.intervalo || 1),
        tiempoEstimado: regla.tiempoEstimado ? String(regla.tiempoEstimado) : '',
        responsables: (regla.responsables || []).map((user) => Number(user.id)).filter(Boolean),
    };
};

const TextInput = ({ value, onChange, placeholder, type = 'text', disabled = false, min, maxLength, error }) => (
    <input
        type={type}
        min={min}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={`w-full rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition disabled:bg-slate-50 disabled:text-slate-400 ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-marca-primario'}`}
        placeholder={placeholder}
    />
);

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
    tecnicos = [],
    submitting = false,
}) => {
    const [form, setForm] = useState(INITIAL_FORM);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
    const esEdicion = Boolean(regla?.id);

    useEffect(() => {
        if (!isOpen) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm(buildFormFromRule(regla));
        setMostrarDescripcion(Boolean(regla?.descripcion));
        setFormError('');
        setFieldErrors({});
    }, [isOpen, regla]);

    const areaOptions = useMemo(() => normalizeOptions(AREAS), []);
    const responsablesIds = useMemo(() => form.responsables.map(String), [form.responsables]);
    const opcionesTecnicos = useMemo(() => (
        tecnicos.map((tecnico) => ({ value: String(tecnico.id), tecnico }))
    ), [tecnicos]);
    const tecnicoMap = useMemo(() => (
        Object.fromEntries(tecnicos.map((tecnico) => [String(tecnico.id), tecnico]))
    ), [tecnicos]);
    const opcionesDisponibles = useMemo(() => (
        opcionesTecnicos.filter((option) => !responsablesIds.includes(option.value))
    ), [opcionesTecnicos, responsablesIds]);

    const clearFieldError = (...keys) => {
        setFieldErrors((prev) => {
            if (!keys.some((key) => prev[key])) return prev;
            const next = { ...prev };
            keys.forEach((key) => delete next[key]);
            return next;
        });
    };
    const update = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (key === 'fechaInicio' || key === 'fechaFin') {
            clearFieldError('fechaInicio', 'fechaFin');
            return;
        }
        clearFieldError(key);
    };
    const updateFrecuencia = (value) => {
        setForm((prev) => ({
            ...prev,
            frecuencia: value,
            ...buildFrecuenciaFields(value, prev.unidad, prev.intervalo),
        }));
        clearFieldError('frecuencia', 'unidad', 'intervalo', 'fechaInicio');
    };
    const addResponsable = (idValue) => {
        const id = Number(idValue);
        setForm((prev) => ({
            ...prev,
            responsables: prev.responsables.includes(id) ? prev.responsables : [...prev.responsables, id],
        }));
        clearFieldError('responsables');
    };
    const removeResponsable = (idValue) => {
        setForm((prev) => ({
            ...prev,
            responsables: prev.responsables.filter((item) => String(item) !== String(idValue)),
        }));
    };

    const validate = () => {
        const titulo = form.titulo.trim();
        const descripcion = form.descripcion.trim();
        const intervalo = Number(form.intervalo);
        const tiempoEstimado = Number(form.tiempoEstimado);
        const errors = {};

        if (titulo.length < 3) errors.titulo = 'El titulo debe tener al menos 3 caracteres.';
        if (titulo.length > MAX_TITULO) errors.titulo = 'El titulo no debe superar 255 caracteres.';
        if (descripcion.length > MAX_DESCRIPCION) errors.descripcion = 'La descripcion no debe superar 1000 caracteres.';
        if (!form.categoria) errors.categoria = 'Selecciona categoria.';
        if (!form.area) errors.area = 'Selecciona area.';
        if (!form.prioridad) errors.prioridad = 'Selecciona prioridad.';
        if (form.responsables.length === 0) errors.responsables = 'Selecciona al menos un responsable.';
        if (!esEdicion && !form.fechaInicio) errors.fechaInicio = 'Selecciona fecha inicial.';
        if (!esEdicion && form.fechaInicio && form.fechaInicio < getMinDateHoy()) errors.fechaInicio = 'No se permiten fechas iniciales anteriores a hoy.';
        if (!esEdicion && !form.frecuencia) errors.frecuencia = 'Selecciona la frecuencia.';
        if (!esEdicion && form.frecuencia === 'PERSONALIZADA' && !form.unidad) errors.unidad = 'Selecciona la unidad de la frecuencia personalizada.';
        if (!esEdicion && (!Number.isInteger(intervalo) || intervalo < 1)) errors.intervalo = 'El intervalo debe ser un entero mayor a 0.';
        if (!esEdicion && isSundayInputDate(form.fechaInicio)) {
            const frequencyFields = buildFrecuenciaFields(form.frecuencia, form.unidad, form.intervalo);
            if (frequencyFields.unidad === 'SEMANA' || (frequencyFields.unidad === 'DIA' && Number(frequencyFields.intervalo) % 7 === 0)) {
                errors.fechaInicio = 'Selecciona otra fecha inicial para esta frecuencia.';
            }
        }
        if (!form.tiempoEstimado || !Number.isFinite(tiempoEstimado) || tiempoEstimado <= 0) {
            errors.tiempoEstimado = 'Indica una duracion estimada positiva.';
        }

        return errors;
    };

    const sectionClass = () => 'space-y-3';

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError('');

        const errors = validate();
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const payload = {
            titulo: form.titulo.trim(),
            descripcion: form.descripcion.trim() || null,
            categoria: form.categoria,
            area: normalizeAreaName(form.area) || form.area,
            prioridad: form.prioridad,
            responsables: form.responsables.map(Number),
            fechaFin: null,
            horaInicio: null,
            horaFin: null,
            tiempoEstimado: form.tiempoEstimado ? Number(form.tiempoEstimado) : null,
        };

        if (!esEdicion) {
            const frequencyFields = buildFrecuenciaFields(form.frecuencia, form.unidad, form.intervalo);
            payload.fechaInicio = form.fechaInicio;
            payload.unidad = frequencyFields.unidad;
            payload.intervalo = Number(frequencyFields.intervalo);
        }

        try {
            await onSubmit(payload);
            onClose();
        } catch (err) {
            setFormError(err?.message || 'Error al guardar actividad recurrente.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-3xl">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-2">
                    <Icon name="event_repeat" className="text-marca-primario" />
                    <span className="font-bold text-slate-800">
                        {esEdicion ? 'Editar actividad recurrente' : 'Nueva actividad recurrente'}
                    </span>
                </div>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
                <ModalBody className="max-h-[74vh] space-y-4 overflow-y-auto p-5">
                    {/* <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                        Actividad recurrente · sin maquina · responsables multiples
                    </div>
                    <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">
                        Captura la duracion estimada. El horario especifico es opcional.
                    </div> */}

                    {formError && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                            <Icon name="error" size="sm" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <section className={sectionClass('actividad')}>
                        <h4 className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-black text-slate-800">
                            <Icon name="assignment" size="sm" className="text-marca-primario" />
                            Datos de la actividad
                        </h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <TituloField
                                    id="ar-titulo"
                                    value={form.titulo}
                                    onChange={(value) => update('titulo', value)}
                                    error={fieldErrors.titulo}
                                    required
                                    maxLength={MAX_TITULO}
                                    placeholder="Ej. Revision semanal de bitacoras"
                                />
                            </div>
                            <div>
                                <Label htmlFor="ar-categoria">Categoria *</Label>
                                <Select
                                    id="ar-categoria"
                                    value={form.categoria}
                                    icon="label"
                                    error={!!fieldErrors.categoria}
                                    helperText={fieldErrors.categoria}
                                    onChange={(event) => update('categoria', event.target.value)}
                                >
                                    <option value="" disabled hidden>Selecciona categoria...</option>
                                    {CATEGORIAS_EQUIPO.map((categoria) => (
                                        <option key={categoria.value} value={categoria.value}>{categoria.label}</option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <PrioridadField
                                    id="ar-prioridad"
                                    options={PRIORIDADES}
                                    value={form.prioridad}
                                    onChange={(value) => update('prioridad', value)}
                                    error={fieldErrors.prioridad}
                                    required
                                    placeholder="Selecciona..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <PlantaAreaFields
                                    area={form.area}
                                    areasOptions={areaOptions}
                                    errorArea={fieldErrors.area}
                                    onAreaChange={(value) => update('area', normalizeAreaName(value) || value)}
                                    layoutClassName="grid grid-cols-1 gap-3"
                                    sectionTitle="Ubicacion de la actividad"
                                    sectionDescription="Especifica el area o linea donde se repetira esta actividad."
                                />
                            </div>
                            {!mostrarDescripcion ? (
                                <div className="md:col-span-2 flex justify-start">
                                    <button
                                        type="button"
                                        onClick={() => setMostrarDescripcion(true)}
                                        className="flex items-center gap-1 rounded-lg border border-marca-primario/10 bg-marca-primario/5 px-3 py-1.5 text-left text-xs font-bold text-marca-primario transition-colors hover:bg-marca-primario/10"
                                    >
                                        <Icon name="add" size="xs" />
                                        Mas detalles (Descripcion)
                                    </button>
                                </div>
                            ) : (
                                <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <DescripcionField
                                        id="ar-descripcion"
                                        value={form.descripcion}
                                        onChange={(value) => update('descripcion', value)}
                                        error={fieldErrors.descripcion}
                                        onRemove={() => {
                                            update('descripcion', '');
                                            setMostrarDescripcion(false);
                                        }}
                                        maxLength={MAX_DESCRIPCION}
                                        rows={2}
                                        placeholder="Checklist o instrucciones para la actividad..."
                                    />
                                </div>
                            )}
                        </div>
                    </section>

                    <section className={sectionClass('responsables')}>
                        <h4 className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-black text-slate-800">
                            <Icon name="groups" size="sm" className="text-marca-primario" />
                            Responsables
                        </h4>
                        <ResponsablesDesktopSection
                            modoCarrito={false}
                            disabled={submitting}
                            isDropdownOpen={isDropdownOpen}
                            onDropdownToggle={setIsDropdownOpen}
                            responsables={responsablesIds}
                            tecnicoMapEdit={tecnicoMap}
                            opcionesDisponiblesEdit={opcionesDisponibles}
                            onAddTecnico={addResponsable}
                            onRemoveTecnico={removeResponsable}
                        />
                        {fieldErrors.responsables && (
                            <p className="text-[10px] text-rose-600 font-bold">{fieldErrors.responsables}</p>
                        )}
                    </section>

                    <section className={sectionClass('frecuencia')}>
                        <h4 className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-black text-slate-800">
                            <Icon name="date_range" size="sm" className="text-marca-primario" />
                            Frecuencia
                        </h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label error={!!fieldErrors.fechaInicio}>Fecha inicial *</Label>
                                <TextInput type="date" min={getMinDateHoy()} disabled={esEdicion} value={form.fechaInicio} onChange={(value) => update('fechaInicio', value)} error={!!fieldErrors.fechaInicio} />
                                {fieldErrors.fechaInicio && <p className="mt-1 text-[10px] font-bold text-rose-600">{fieldErrors.fechaInicio}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <Label error={!!fieldErrors.frecuencia}>Frecuencia *</Label>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                    {FRECUENCIAS_ACTIVIDAD.map((option) => (
                                        <FrequencyOption
                                            key={option.value}
                                            option={option}
                                            selected={form.frecuencia === option.value}
                                            disabled={esEdicion}
                                            onClick={() => updateFrecuencia(option.value)}
                                        />
                                    ))}
                                </div>
                                {fieldErrors.frecuencia && <p className="mt-1 text-[10px] font-bold text-rose-600">{fieldErrors.frecuencia}</p>}
                            </div>
                            {form.frecuencia === 'PERSONALIZADA' && (
                                <>
                                    <div>
                                        <Label error={!!fieldErrors.unidad}>Unidad personalizada *</Label>
                                        <Select
                                            value={form.unidad}
                                            icon="sync"
                                            error={!!fieldErrors.unidad}
                                            helperText={fieldErrors.unidad}
                                            disabled={esEdicion}
                                            onChange={(event) => update('unidad', event.target.value || 'DIA')}
                                        >
                                            {UNIDADES_FRECUENCIA.map((unidad) => (
                                                <option key={unidad.value} value={unidad.value}>{unidad.label}</option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div>
                                        <Label error={!!fieldErrors.intervalo}>Intervalo personalizado *</Label>
                                        <TextInput type="number" min="1" disabled={esEdicion} value={form.intervalo} onChange={(value) => update('intervalo', value)} placeholder="1" error={!!fieldErrors.intervalo} />
                                        {fieldErrors.intervalo && <p className="mt-1 text-[10px] font-bold text-rose-600">{fieldErrors.intervalo}</p>}
                                    </div>
                                </>
                            )}
                        </div>
                        {esEdicion && (
                            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                                Fecha inicial, unidad e intervalo son solo lectura. Para cambiar el patron, archiva esta regla y crea una nueva.
                            </p>
                        )}
                    </section>

                    <section className={sectionClass('horario')}>
                        <h4 className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-black text-slate-800">
                            <Icon name="timer" size="sm" className="text-marca-primario" />
                            Duracion
                        </h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <Label error={!!fieldErrors.tiempoEstimado}>
                                    Tiempo estimado *
                                </Label>
                                <DurationPicker
                                    valueMins={Number(form.tiempoEstimado) || 0}
                                    onChange={(value) => update('tiempoEstimado', String(value || ''))}
                                    disabled={submitting}
                                    error={!!fieldErrors.tiempoEstimado}
                                />
                                {fieldErrors.tiempoEstimado && (
                                    <p className="mt-1 text-[10px] font-bold text-rose-600">
                                        {fieldErrors.tiempoEstimado}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                </ModalBody>

                <ModalFooter className="flex flex-wrap justify-end gap-2">
                    <Button type="button" variant="cancelar" onClick={onClose} disabled={submitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="guardar" disabled={submitting}>
                        {submitting ? <span className="inline-flex items-center gap-1"><Spinner size="xs" /> Guardando</span> : 'Guardar'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};
