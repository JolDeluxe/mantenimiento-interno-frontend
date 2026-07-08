import { useState, useEffect, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon, SearchableSelect } from '@/components/ui/z_index';
import { MaquinaSelectField, PlantaAreaFields, TiempoHorarioSection } from '@/features/common/forms/tareas/fields';
import { Label, Input, Select } from '@/components/form/z_index';
import { getMinDateHoy, fechaInputToISOLocal, isoToDateInput } from '@/lib/date';
import { validateFechaEdicionNoPasadaSiCambio } from '@/features/common/forms/tareas/validation';
import { PrioridadField, TituloField, DescripcionField, FechaVencimientoField, DurationPicker } from '@/features/common/forms/tareas/fields';
import { ResponsablesMobileSection } from '@/features/common/forms/tareas/responsables';
import { getMaquinaById, getMaquinas } from '@/features/maquinaria/api/maquinaria-api';
import { shouldShowMachineryBlock, canReportProductionHalt, deriveLocationFromMachine, shouldLockLocationByMachine } from '@/features/common/forms/tareas/utils/machinery-utils';
import {
    PLANTAS,
    CLASIFICACIONES_CLIENTE,
    CLASIFICACIONES_ADMIN,
    PRIORIDADES,
    TIPOS_ADMIN,
    ROLES_ADMIN,
    AREAS_POR_PLANTA,
    AREAS,
    CATEGORIAS_EQUIPO
} from '../../constants';
import { cn } from '@/utils/cn';

const MAX_TITULO = 255;
const MAX_DESCRIPCION = 500;

const deducirPlantaDeArea = (areaName, plantaActual) => {
    if (!areaName || typeof areaName !== 'string') return '';
    const areasMap = AREAS_POR_PLANTA || {};

    if (plantaActual && Array.isArray(areasMap[plantaActual]) && areasMap[plantaActual].includes(areaName)) {
        return plantaActual;
    }
    for (const [plantaKey, areasList] of Object.entries(areasMap)) {
        if (Array.isArray(areasList) && areasList.includes(areaName)) {
            return plantaKey;
        }
    }
    return '';
};

export const MobileTicketFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    ticketAEditar,
    currentUser,
    tecnicos = [],
    isSubmitting,
    scope = 'general',
    defaultDate,
    defaultClasificacion,
}) => {
    const esEdicion = Boolean(ticketAEditar);
    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
    const [categoria, setCategoria] = useState('');
    const [planta, setPlanta] = useState('');
    const [area, setArea] = useState('');
    const [prioridad, setPrioridad] = useState('MEDIA');
    const [clasificacion, setClasificacion] = useState('');
    const [tipo, setTipo] = useState('PLANEADA');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [tiempoEstimadoMins, setTiempoEstimadoMins] = useState(0);
    const [responsables, setResponsables] = useState([]);
    const [maquinaId, setMaquinaId] = useState('');
    const [maquinaInfo, setMaquinaInfo] = useState(null);
    const [paroProduccion, setParoProduccion] = useState(false);
    const [impactoProduccionMins, setImpactoProduccionMins] = useState(0);
    const [validatingMaquina, setValidatingMaquina] = useState(false);
    const [opcionesMaquinas, setOpcionesMaquinas] = useState([]);
    const [maquinasRaw, setMaquinasRaw] = useState([]);
    const [backendError, setBackendError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const tecnicoMap = useMemo(() =>
        Object.fromEntries(tecnicos.map((t) => [String(t.id), t])),
        [tecnicos]
    );

    const opcionesDisponibles = useMemo(() =>
        tecnicos.filter((t) => !responsables.includes(String(t.id))),
        [tecnicos, responsables]
    );

    const areasOptions = useMemo(() => {
        const list = (planta && AREAS_POR_PLANTA?.[planta]) ? AREAS_POR_PLANTA[planta] : (AREAS || []);
        return Array.isArray(list) ? list.map(a => ({ value: String(a), label: String(a) })) : [];
    }, [planta]);

    useEffect(() => {
        if (!isOpen) return;
        setSubmitted(false);
        setBackendError('');

        if (esEdicion) {
            setTitulo(ticketAEditar.titulo ?? '');
            setDescripcion(ticketAEditar.descripcion ?? '');
            setMostrarDescripcion(Boolean(ticketAEditar.descripcion && ticketAEditar.descripcion !== 'Sin descripción.'));
            setCategoria(ticketAEditar.categoria ?? '');
            setPlanta(ticketAEditar.planta ?? '');
            setArea(ticketAEditar.area ?? '');
            setPrioridad(ticketAEditar.prioridad ?? 'MEDIA');
            setClasificacion(ticketAEditar.clasificacion ?? '');
            setTipo(ticketAEditar.tipo ?? 'PLANEADA');
            setFechaVencimiento(isoToDateInput(ticketAEditar.fechaVencimiento));
            setTiempoEstimadoMins(ticketAEditar.tiempoEstimado ?? 0);
            setResponsables(ticketAEditar.responsables?.map((r) => String(r.id)) ?? []);
            setMaquinaId(ticketAEditar.maquinaId ? String(ticketAEditar.maquinaId) : '');
            setMaquinaInfo(ticketAEditar.maquina ?? null);
            setParoProduccion(Boolean(ticketAEditar.paroProduccion));
            setImpactoProduccionMins(ticketAEditar.impactoProduccion ?? 0);
        } else {
            setTitulo(''); setDescripcion(''); setCategoria('');
            setMostrarDescripcion(false);
            setPlanta(''); setArea(''); setPrioridad('MEDIA');
            setClasificacion(defaultClasificacion || (scope === 'mantenimientos' ? 'PREVENTIVO' : '')); setTipo('PLANEADA');
            setFechaVencimiento(defaultDate || ''); setTiempoEstimadoMins(0); setResponsables([]);
            setMaquinaId('');
            setMaquinaInfo(null);
            setParoProduccion(false);
            setImpactoProduccionMins(0);
        }
    }, [isOpen, esEdicion, ticketAEditar, scope, defaultDate, defaultClasificacion]);

    const puedeReportarParoProduccion = canReportProductionHalt({ categoria, scope, maquinaId, clasificacion });

    useEffect(() => {
        if (!puedeReportarParoProduccion) {
            setParoProduccion(false);
            setImpactoProduccionMins(0);
        }
    }, [puedeReportarParoProduccion]);

    // Cargar catálogo de máquinas al abrir el modal (Thin Client: se consulta la API)
    useEffect(() => {
        if (!isOpen) return;

        const cargarCatalogoMaquinas = async () => {
            try {
                const res = await getMaquinas({ limit: 500 });
                const list = res?.data?.data || res?.data || [];
                setMaquinasRaw(list);
                const opts = list.map(m => ({
                    value: String(m.id),
                    label: `${m.codigo} - ${m.nombre}`
                }));
                setOpcionesMaquinas(opts);
            } catch (err) {
                console.error("Error al cargar máquinas en modal móvil:", err);
            }
        };

        cargarCatalogoMaquinas();
    }, [isOpen]);

    // Efecto que observa el cambio en maquinaId y realiza validación/autocompletado (Thin Client)
    useEffect(() => {
        if (!maquinaId) {
            setMaquinaInfo(null);
            return;
        }

        const fetchMaquinaInfo = async () => {
            setValidatingMaquina(true);
            try {
                const response = await getMaquinaById(Number(maquinaId));
                if (response?.data?.status === 'success' && response?.data?.data) {
                    const maq = response.data.data;
                    setMaquinaInfo(maq);
                    const loc = deriveLocationFromMachine(maq);
                    setPlanta(loc.planta);
                    setArea(loc.area);
                } else if (response?.data && !response.data.status) {
                    const maq = response.data;
                    setMaquinaInfo(maq);
                    const loc = deriveLocationFromMachine(maq);
                    setPlanta(loc.planta);
                    setArea(loc.area);
                } else {
                    setMaquinaInfo(null);
                }
            } catch (err) {
                console.error("Error al validar máquina en móvil:", err);
                setMaquinaInfo(null);
            } finally {
                setValidatingMaquina(false);
            }
        };

        const timer = setTimeout(fetchMaquinaInfo, 400); // debounce de 400ms
        return () => clearTimeout(timer);
    }, [maquinaId]);

    const getErrors = () => {
        const e = {};
        if (!titulo.trim() || titulo.length < 3) e.titulo = 'Mínimo 3 caracteres.';
        if (descripcion.trim() && descripcion.trim().length < 3) e.descripcion = 'Mínimo 3 caracteres.';
        if (!categoria.trim()) e.categoria = 'La categoría es obligatoria.';
        if (!planta.trim()) e.planta = 'Selecciona la planta.';
        if (!area.trim()) e.area = 'El área es obligatoria.';
        if (maquinaId && !maquinaInfo && !validatingMaquina) {
            e.maquinaId = 'La máquina ingresada no existe.';
        }

        if (scope === 'mantenimientos') {
            if (!maquinaId) {
                e.maquinaId = 'La máquina es obligatoria para mantenimientos.';
            }
            if (!clasificacion) {
                e.clasificacion = 'La clasificación es obligatoria para mantenimientos.';
            }
        }

        if (esAdmin && fechaVencimiento) {
            const fechaOriginal = isoToDateInput(ticketAEditar?.fechaVencimiento);
            const fechaError = validateFechaEdicionNoPasadaSiCambio(fechaVencimiento, fechaOriginal, {
                mensaje: 'No se permiten fechas anteriores a hoy.',
            });
            if (fechaError) {
                e.fechaVencimiento = fechaError;
            }
        }
        return e;
    };

    const handleAddTecnico = (idStr) => {
        if (!idStr || responsables.includes(idStr)) return;
        setResponsables((prev) => [...prev, idStr]);
    };

    const handleRemoveTecnico = (idStr) => {
        setResponsables((prev) => prev.filter((x) => x !== idStr));
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setBackendError('');
        const errors = getErrors();
        if (Object.keys(errors).length > 0) return;

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion.trim() || 'Sin descripción.');
        formData.append('clasificacion', clasificacion);
        if (categoria) formData.append('categoria', categoria);
        if (planta) formData.append('planta', planta);
        if (area) formData.append('area', area);
        formData.append('prioridad', prioridad);
        if (maquinaId) formData.append('maquinaId', maquinaId);
        formData.append('paroProduccion', paroProduccion ? 'true' : 'false');
        if (paroProduccion && impactoProduccionMins > 0) {
            formData.append('impactoProduccion', String(impactoProduccionMins));
        }

        if (esAdmin) {
            formData.append('tipo', tipo);
            if (fechaVencimiento) formData.append('fechaVencimiento', fechaInputToISOLocal(fechaVencimiento));
            if (tiempoEstimadoMins > 0) formData.append('tiempoEstimado', String(tiempoEstimadoMins));
            responsables.forEach((id) => formData.append('responsables', id));
        }

        try {
            await onSuccess(formData);
        } catch (err) {
            const data = err?.response?.data;
            let msg = data?.error || data?.message || 'Error al procesar la solicitud.';
            if (Array.isArray(data?.errors)) msg = data.errors[0].message;
            setBackendError(msg);
        }
    };

    const fe = submitted ? getErrors() : {};
    const hoyLocal = getMinDateHoy(); 
    const mananaLocal = isoToDateInput(Date.now() + 86400000);
    const setToday = () => setFechaVencimiento(hoyLocal);
    const setTomorrow = () => setFechaVencimiento(mananaLocal);
    const isHoy = fechaVencimiento === hoyLocal;
    const isManana = fechaVencimiento === mananaLocal;
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full h-full m-0 rounded-none sm:rounded-xl sm:h-auto">
            <ModalHeader
                title={esEdicion ? 'Editar tarea' : esAdmin ? 'Nuevo mantenimiento' : 'Reportar problema'}
                onClose={onClose}
            />
            <ModalBody>
                <div className="flex flex-col gap-6 pb-4 overflow-x-hidden">

                    {backendError && (
                        <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-md bg-rose-50 border border-rose-200 text-rose-700">
                            <Icon name="error" size="sm" /> {backendError}
                        </div>
                    )}

                    {/* ── TÍTULO ── */}
                    <TituloField
                        id="tf-titulo"
                        value={titulo}
                        onChange={setTitulo}
                        error={fe.titulo}
                        disabled={isSubmitting}
                        required
                        maxLength={MAX_TITULO}
                        label="Título"
                        placeholder="Ej. Fuga de aire en compresor"
                    />

                    {/* ── FILA 1: Prioridad | Categoría | Tipo ── */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        <PrioridadField
                            id="tf-prioridad"
                            value={prioridad}
                            onChange={setPrioridad}
                            options={PRIORIDADES}
                            disabled={isSubmitting}
                            required
                        />
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-cat" error={!!fe.categoria}>Categoría del equipo *</Label>
                            <Select id="tf-cat" value={categoria} onChange={(e) => {
                                const val = e.target.value;
                                setCategoria(val);
                                if (val === 'RUTINA') {
                                    setClasificacion('RUTINA');
                                } else if (val !== 'MAQUINARIA') {
                                    setClasificacion(scope === 'mantenimientos' ? 'PREVENTIVO' : '');
                                }
                                if (val !== 'MAQUINARIA') {
                                    setMaquinaId('');
                                    setMaquinaInfo(null);
                                    setPlanta('');
                                    setArea('');
                                }
                            }}
                                error={!!fe.categoria} helperText={fe.categoria} disabled={isSubmitting}>
                                <option value="" disabled hidden>Selecciona…</option>
                                {CATEGORIAS_EQUIPO.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </Select>
                        </div>
                        {shouldShowMachineryBlock({ categoria, scope }) && (
                            <MaquinaSelectField
                                label={`Maquinaria Relacionada ${scope === 'mantenimientos' ? '*' : ''}`}
                                value={maquinaId}
                                options={opcionesMaquinas}
                                error={fe.maquinaId}
                                disabled={isSubmitting}
                                validating={validatingMaquina}
                                maquinaInfo={maquinaInfo}
                                onChange={(selectedId) => {
                                    if (!selectedId) {
                                        setMaquinaId('');
                                        setMaquinaInfo(null);
                                        setPlanta('');
                                        setArea('');
                                        return;
                                    }
                                    setMaquinaId(selectedId);
                                    const maq = maquinasRaw.find(m => String(m.id) === String(selectedId));
                                    if (maq) {
                                        setMaquinaInfo(maq);
                                        const loc = deriveLocationFromMachine(maq);
                                        setPlanta(loc.planta);
                                        setArea(loc.area);
                                    }
                                }}
                            />
                        )}
                        {shouldShowMachineryBlock({ categoria, scope }) && (scope === 'mantenimientos' || (esEdicion && (ticketAEditar?.clasificacion === 'PREVENTIVO' || ticketAEditar?.clasificacion === 'CORRECTIVO'))) && (
                            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                <Label htmlFor="tf-clasificacion" error={!!fe.clasificacion}>{`Clasificación ${scope === 'mantenimientos' ? '*' : ''}`}</Label>
                                <Select id="tf-clasificacion" value={clasificacion} onChange={(e) => setClasificacion(e.target.value)}
                                    error={!!fe.clasificacion} helperText={fe.clasificacion} disabled={isSubmitting}>
                                    <option value="" disabled hidden>Selecciona…</option>
                                    <option value="PREVENTIVO">Preventivo</option>
                                    <option value="CORRECTIVO">Correctivo</option>
                                </Select>
                            </div>
                        )}
                        {puedeReportarParoProduccion && (
                            <div className={cn(
                                "sm:col-span-2 rounded-xl border p-3.5 flex flex-col gap-3 transition-colors animate-in fade-in slide-in-from-top-1 duration-200",
                                paroProduccion ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"
                            )}>
                                <button
                                    type="button"
                                    onClick={() => setParoProduccion(prev => !prev)}
                                    disabled={isSubmitting}
                                    className="flex items-start gap-3 text-left disabled:opacity-60 cursor-pointer"
                                >
                                    <span className={cn(
                                        "mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                                        paroProduccion ? "bg-red-600 border-red-600 text-white" : "bg-white border-slate-300 text-transparent"
                                    )}>
                                        <Icon name="check" size="xs" />
                                    </span>
                                    <span className="flex flex-col gap-0.5">
                                        <span className={cn("text-sm font-black", paroProduccion ? "text-red-700" : "text-slate-700")}>
                                            La falla detuvo producción
                                        </span>
                                        <span className="text-xs text-slate-500 leading-relaxed">
                                            La máquina quedará como PARO PRODUCCIÓN hasta que mantenimiento confirme operación.
                                        </span>
                                    </span>
                                </button>

                                {paroProduccion && (
                                    <div className="pl-8 flex flex-col gap-1.5">
                                        <Label>Tiempo estimado de impacto</Label>
                                        <DurationPicker
                                            valueMins={impactoProduccionMins}
                                            onChange={setImpactoProduccionMins}
                                            disabled={isSubmitting}
                                            hoursCount={24}
                                            selectBaseClassName="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 disabled:bg-slate-100 disabled:cursor-not-allowed pr-8"
                                            selectNormalClassName=""
                                            iconBaseClassName="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"
                                            iconNormalClassName=""
                                            totalLabelBaseClassName="text-[11px] text-slate-400 flex items-center gap-1"
                                            totalLabelNormalClassName=""
                                        />
                                        <p className="text-[10px] text-slate-400 font-semibold">
                                            Opcional. Sirve para reportes; no afecta el tiempo técnico.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        {esAdmin && (
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-tipo">Tipo de tarea *</Label>
                                <Select id="tf-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} disabled={isSubmitting || esEdicion}>
                                    {TIPOS_ADMIN.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* ── UBICACIÓN (Planta/Área) con PlantaAreaFields ── */}
                    <PlantaAreaFields
                        planta={planta}
                        area={area}
                        plantas={PLANTAS}
                        areasOptions={areasOptions}
                        errorPlanta={fe.planta}
                        errorArea={fe.area}
                        disabledPlanta={isSubmitting || shouldLockLocationByMachine(maquinaInfo)}
                        disabledArea={isSubmitting || shouldLockLocationByMachine(maquinaInfo)}
                        layoutClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        onPlantaChange={(val) => {
                            setPlanta(val);
                            const posibles = (AREAS_POR_PLANTA && AREAS_POR_PLANTA[val]) || AREAS || [];
                            setArea(Array.isArray(posibles) && posibles.length === 1 ? posibles[0] : '');
                        }}
                        onAreaChange={(val) => {
                            setArea(val);
                            if (val) {
                                const plantaDeducida = deducirPlantaDeArea(val, planta);
                                if (plantaDeducida) {
                                    setPlanta(plantaDeducida);
                                }
                            }
                        }}
                    />

                    {/* ── SECCIÓN TIEMPO Y PROGRAMACIÓN con TiempoHorarioSection ── */}
                    {esAdmin && (
                        <TiempoHorarioSection
                            fechaVencimiento={fechaVencimiento}
                            onFechaVencimientoChange={(v) => {
                                setFechaVencimiento(v && v < hoyLocal ? hoyLocal : v);
                            }}
                            fechaMin={hoyLocal}
                            fechaLabel="Fecha vencimiento"
                            fechaError={fe.fechaVencimiento}
                            fechaDisabled={isSubmitting}
                            isToday={isHoy}
                            isTomorrow={isManana}
                            onSetToday={setToday}
                            onSetTomorrow={setTomorrow}
                            quickButtonBaseClassName="text-[10px] font-bold px-2 py-0.5 rounded transition-colors disabled:opacity-50 cursor-pointer"
                            quickButtonInactiveClassName="text-marca-primario bg-marca-primario/10"
                            tiempoEstimadoMins={tiempoEstimadoMins}
                            onTiempoEstimadoChange={setTiempoEstimadoMins}
                            tiempoLabel="Tiempo estimado"
                            tiempoError={fe.tiempoEstimado}
                            tiempoDisabled={isSubmitting}
                            durationHoursCount={24}
                            durationSelectBaseClassName="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 disabled:bg-slate-100 disabled:cursor-not-allowed pr-8"
                            layoutClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        />
                    )}

                    {/* ── ASIGNACIÓN DE TÉCNICOS (Admin) ── */}
                    {esAdmin && tecnicos.length > 0 && (
                        <ResponsablesMobileSection
                            tecnicos={tecnicos}
                            responsables={responsables}
                            opcionesDisponibles={opcionesDisponibles}
                            tecnicoMap={tecnicoMap}
                            disabled={isSubmitting}
                            onAddTecnico={handleAddTecnico}
                            onRemoveTecnico={handleRemoveTecnico}
                        />
                    )}

                    {/* ── DESCRIPCIÓN ── */}
                    {!mostrarDescripcion ? (
                        <div className="flex justify-start">
                            <button
                                type="button"
                                onClick={() => setMostrarDescripcion(true)}
                                className="flex items-center gap-1 text-xs font-bold text-marca-primario hover:text-marca-primario/80 transition-colors bg-marca-primario/5 hover:bg-marca-primario/10 px-3 py-1.5 rounded-lg border border-marca-primario/10 cursor-pointer"
                            >
                                <Icon name="add" size="xs" />
                                Más detalles (Descripción)
                            </button>
                        </div>
                    ) : (
                        <DescripcionField
                            id="tf-desc"
                            value={descripcion}
                            onChange={setDescripcion}
                            onRemove={() => {
                                setDescripcion('');
                                setMostrarDescripcion(false);
                            }}
                            error={fe.descripcion}
                            disabled={isSubmitting}
                            maxLength={MAX_DESCRIPCION}
                            label="Detalles adicionales / Descripción"
                            placeholder="Describe el problema o tarea con el mayor detalle posible…"
                            rows={3}
                            className="animate-in fade-in slide-in-from-top-2 duration-200"
                        />
                    )}

                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                <Button variant="guardar" icon="save" isLoading={isSubmitting} onClick={handleSubmit}>
                    {esEdicion ? 'Guardar cambios' : 'Crear'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};
