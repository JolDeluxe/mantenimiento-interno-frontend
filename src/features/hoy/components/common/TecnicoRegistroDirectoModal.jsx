// src/features/hoy/components/common/TecnicoRegistroDirectoModal.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Label, Select } from '@/components/form/z_index';
import { MaquinaSelectField } from '@/features/common/forms/tareas/fields/MaquinaSelectField';
import { getAllMaquinas } from '@/features/maquinaria/api/maquinaria-api';
import { filterMaquinasParaMantenimiento, buildMaquinaOptions } from '@/features/common/forms/tareas/utils/maquinas-filter-utils';
import { AREAS } from '@/features/common/constants/catalogos-tareas';
import { createTicketTecnico } from '@/features/tickets/api/tickets-api';
import { isQueuedResult, notifyQueuedResult } from '@/features/tickets/utils/offline-result';
import { notify } from '@/components/notification/adaptive-notify';
import { cn } from '@/utils/cn';
import { isoToDateInput, localMXTimeToISO } from '@/lib/date';

const addDaysToDateInput = (dateStr, days) => {
    const date = new Date(`${dateStr}T12:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
};

// ── Time picker (igual que en ticket-progress-modal) ────────────────────────
const MAX_DURATION_MINS = 960; // 16 horas

const TimePicker = ({ totalMins, onChange, onRangeChange }) => {
    const [mode, setMode] = useState('duration'); // 'duration' | 'range'
    const [startTime, setStartTime] = useState('07:00');
    const [endTime, setEndTime] = useState('08:00');

    const horas   = Math.floor(totalMins / 60);
    const minutos = totalMins % 60;

    useEffect(() => {
        if (mode === 'range') {
            const [h1, m1] = startTime.split(':').map(Number);
            const [h2, m2] = endTime.split(':').map(Number);
            let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (diff < 0) diff += 1440;
            onChange(diff);
            onRangeChange?.({ mode: 'range', startTime, endTime });
        } else {
            onRangeChange?.({ mode: 'duration' });
        }
    }, [startTime, endTime, mode, onChange, onRangeChange]);

    const selectCls =
        'border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 appearance-none cursor-pointer';

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg w-full sm:w-auto sm:self-start">
                <button
                    type="button"
                    onClick={() => setMode('duration')}
                    className={cn(
                        'px-3 py-2 text-xs font-bold rounded-md transition-all',
                        mode === 'duration' ? 'bg-white text-marca-primario shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    )}
                >
                    Duración
                </button>
                <button
                    type="button"
                    onClick={() => setMode('range')}
                    className={cn(
                        'px-3 py-2 text-xs font-bold rounded-md transition-all',
                        mode === 'range' ? 'bg-white text-marca-primario shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    )}
                >
                    Rango horario
                </button>
            </div>

            {mode === 'duration' ? (
                <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <select
                            value={horas}
                            onChange={(e) => onChange(Number(e.target.value) * 60 + minutos)}
                            className={selectCls}
                        >
                            {Array.from({ length: 17 }, (_, i) => (
                                <option key={i} value={i}>{i} h</option>
                            ))}
                        </select>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horas</span>
                    </div>
                    <span className="text-2xl text-slate-300 font-thin pb-5">:</span>
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <select
                            value={minutos}
                            onChange={(e) => onChange(horas * 60 + Number(e.target.value))}
                            className={selectCls}
                        >
                            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                                <option key={m} value={m}>{String(m).padStart(2, '0')} min</option>
                            ))}
                        </select>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minutos</span>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 sm:gap-3 animate-in fade-in slide-in-from-right-2 duration-200">
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Inicio</span>
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={selectCls} />
                    </div>
                    <span className="text-slate-300 pb-2 text-center">a</span>
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Fin</span>
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={selectCls} />
                    </div>
                </div>
            )}

            {totalMins > MAX_DURATION_MINS && (
                <p className="text-[10px] text-estado-rechazado font-bold flex items-center gap-1">
                    <Icon name="error" size="xs" />
                    Máximo permitido: 16 horas.
                </p>
            )}
        </div>
    );
};

// ── Sección de fotos ─────────────────────────────────────────────────────────
const FotoSection = ({ archivos, onAgregar, onEliminar }) => {
    const fileRef = useRef(null);
    const MAX_FOTOS = 3;

    const handleFileChange = (e) => {
        const nuevos = Array.from(e.target.files || []).slice(0, MAX_FOTOS - archivos.length);
        const items = nuevos.map((file) => ({ file, preview: URL.createObjectURL(file) }));
        onAgregar(items);
        e.target.value = '';
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Icon name="photo_camera" size="sm" className="text-slate-400" />
                    Fotos de referencia / evidencia
                    <span className="text-xs font-normal text-slate-400">(opcional)</span>
                </span>
                <span className={cn('text-xs font-bold tabular-nums', archivos.length >= MAX_FOTOS ? 'text-estado-rechazado' : 'text-slate-400')}>
                    {archivos.length}/{MAX_FOTOS}
                </span>
            </div>

            {archivos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {archivos.map((item, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 group shadow-sm">
                            <img src={item.preview} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <button
                                type="button"
                                onClick={() => onEliminar(idx)}
                                className="absolute top-1 right-1 w-5 h-5 bg-estado-rechazado rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                                <Icon name="close" size="xs" className="text-white" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {archivos.length < MAX_FOTOS && (
                <>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFileChange} />
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-marca-secundario hover:text-marca-secundario transition-colors cursor-pointer"
                    >
                        <Icon name="add_a_photo" size="sm" />
                        {archivos.length === 0 ? 'Agregar fotos' : 'Agregar más fotos'}
                    </button>
                </>
            )}
        </div>
    );
};

// ── Componente principal ─────────────────────────────────────────────────────
export const TecnicoRegistroDirectoModal = ({ isOpen, onClose, onSuccess }) => {
    // ── Ubicación ──────────────────────────────────────────────────────────
    const [tipoUbicacion, setTipoUbicacion] = useState('MAQUINA'); // 'MAQUINA' | 'AREA'
    const [maquinaId, setMaquinaId]         = useState('');
    const [clasificacion, setClasificacion] = useState('CORRECTIVO');
    const [area, setArea]                   = useState('');

    // Máquinas
    const [maquinasRaw, setMaquinasRaw]         = useState([]);
    const [loadingMaquinas, setLoadingMaquinas] = useState(false);

    // ── Contenido ──────────────────────────────────────────────────────────
    const [titulo, setTitulo]             = useState('');
    // Cuando yaTerminado=true → este campo es la "nota de cierre" (historial)
    // Cuando yaTerminado=false → es la "descripción" del trabajo a realizar
    const [textoLibre, setTextoLibre]     = useState('');

    const [archivos, setArchivos]         = useState([]);

    // ── Estado de realización ──────────────────────────────────────────────
    const [yaTerminado, setYaTerminado]                           = useState(true);
    const [duracionMinutos, setDuracionMinutos]                   = useState(30);
    const [tiempoRange, setTiempoRange]                           = useState(null);
    const [maquinaOperativaAlResolver, setMaquinaOperativaAlResolver] = useState(false);
    const [paroProduccion, setParoProduccion]                     = useState(false);
    const [fechaParoProduccion, setFechaParoProduccion]           = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors]         = useState({});

    const esCorrectivoDeMaquina = tipoUbicacion === 'MAQUINA' && Boolean(maquinaId) && clasificacion === 'CORRECTIVO';

    // ── Reset al abrir/cerrar ───────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) {
            setTipoUbicacion('MAQUINA');
            setMaquinaId('');
            setClasificacion('CORRECTIVO');
            setArea('');
            setTitulo('');
            setTextoLibre('');
            setArchivos(prev => { prev.forEach(i => URL.revokeObjectURL(i.preview)); return []; });
            setYaTerminado(true);
            setDuracionMinutos(30);
            setTiempoRange(null);
            setMaquinaOperativaAlResolver(false);
            setParoProduccion(false);
            setFechaParoProduccion('');
            setErrors({});
            return;
        }

        let isMounted = true;
        setLoadingMaquinas(true);
        getAllMaquinas()
            .then((data) => {
                if (isMounted) {
                    const list = Array.isArray(data) ? data : (data?.data || []);
                    setMaquinasRaw(list);
                }
            })
            .catch((err) => console.error('Error al cargar máquinas:', err))
            .finally(() => { if (isMounted) setLoadingMaquinas(false); });

        return () => { isMounted = false; };
    }, [isOpen]);

    const opcionesMaquinas    = useMemo(() => buildMaquinaOptions(Array.isArray(maquinasRaw) ? maquinasRaw : []), [maquinasRaw]);
    const maquinaSeleccionada = useMemo(() => maquinasRaw.find((m) => String(m.id) === String(maquinaId)) || null, [maquinasRaw, maquinaId]);
    const areasOptions        = useMemo(() => AREAS.map((a) => ({ value: a, label: a })), []);

    const handleAgregar  = useCallback((items) => setArchivos((prev) => [...prev, ...items].slice(0, 3)), []);
    const handleEliminar = useCallback((idx) => setArchivos((prev) => { const c = [...prev]; URL.revokeObjectURL(c[idx].preview); c.splice(idx, 1); return c; }), []);

    // ── Validación ──────────────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (tipoUbicacion === 'MAQUINA') {
            if (!maquinaId) errs.maquinaId = 'Selecciona una máquina.';
        } else {
            if (!area) errs.area = 'Selecciona el área o línea.';
        }
        if (!titulo.trim() || titulo.trim().length < 3) errs.titulo = 'El título debe tener al menos 3 caracteres.';
        if (yaTerminado && (duracionMinutos <= 0 || duracionMinutos > MAX_DURATION_MINS)) {
            errs.duracion = duracionMinutos > MAX_DURATION_MINS ? 'Máximo 16 horas (960 min).' : 'Indica el tiempo invertido.';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('titulo', titulo.trim());
            
            // Si ya terminó, el texto escrito es la NOTA de cierre para el historial.
            // Si está pendiente, es la DESCRIPCIÓN del trabajo a realizar.
            if (textoLibre.trim()) {
                if (yaTerminado) {
                    fd.append('nota', textoLibre.trim());
                } else {
                    fd.append('descripcion', textoLibre.trim());
                }
            }

            if (tipoUbicacion === 'MAQUINA' && maquinaSeleccionada) {
                fd.append('maquinaId',   String(maquinaSeleccionada.id));
                fd.append('clasificacion', clasificacion);
                fd.append('categoria',   'MAQUINARIA');
                fd.append('planta',      maquinaSeleccionada.planta || 'PLANTA_1');
                fd.append('area',        maquinaSeleccionada.area   || '');

                if (clasificacion === 'CORRECTIVO') {
                    fd.append('paroProduccion', String(paroProduccion));
                    if (paroProduccion && fechaParoProduccion) {
                        fd.append('fechaParoProduccion', new Date(fechaParoProduccion).toISOString());
                    }
                    if (yaTerminado) {
                        fd.append('impactoConfirmado', paroProduccion ? 'PARO_TOTAL' : 'SIN_PARO');
                        fd.append('maquinaOperativaAlResolver', String(maquinaOperativaAlResolver));
                    }
                }
            } else {
                fd.append('categoria', 'INFRAESTRUCTURA');
                fd.append('planta',   'PLANTA_1');
                fd.append('area',     area);
            }

            fd.append('yaTerminado', String(yaTerminado));
            if (yaTerminado) {
                fd.append('duracionMinutos', String(duracionMinutos));
                // Si usó rango horario, enviar inicioManual y finManual en formato ISO
                if (tiempoRange?.mode === 'range' && tiempoRange.startTime && tiempoRange.endTime) {
                    const dateStr = isoToDateInput(new Date());
                    const endDate = tiempoRange.endTime <= tiempoRange.startTime ? addDaysToDateInput(dateStr, 1) : dateStr;
                    const inicioISO = localMXTimeToISO(dateStr, tiempoRange.startTime);
                    const finISO = localMXTimeToISO(endDate, tiempoRange.endTime);
                    if (inicioISO && finISO) {
                        fd.append('inicioManual', inicioISO);
                        fd.append('finManual', finISO);
                    }
                }
            }

            archivos.forEach((item) => {
                if (item.file instanceof File || item.file instanceof Blob) {
                    fd.append('imagenes', item.file, item.file.name);
                }
            });

            const response = await createTicketTecnico(fd);

            if (isQueuedResult(response)) {
                notifyQueuedResult(response);
            } else {
                notify.success(
                    yaTerminado
                        ? '¡Trabajo terminado y registrado correctamente!'
                        : 'Tarea creada y asignada a tu lista de hoy.'
                );
            }

            onClose();
            if (onSuccess) onSuccess(response);
        } catch (error) {
            console.error('Error al registrar trabajo:', error);
            notify.error(error?.response?.data?.error || error?.message || 'Error al guardar el trabajo.');
        } finally {
            setSubmitting(false);
        }
    };

    const duracionInvalida = yaTerminado && (duracionMinutos <= 0 || duracionMinutos > MAX_DURATION_MINS);

    return (
        <Modal isOpen={isOpen} onClose={() => !submitting && onClose()} className="w-full max-w-xl">
            <ModalHeader
                title="Registrar mi trabajo"
                onClose={() => !submitting && onClose()}
            />

            <ModalBody>
                <div className="flex flex-col gap-4 py-1">

                    {/* ── 1. ¿DÓNDE SE REALIZÓ O REALIZARÁ? ────────────────────────── */}
                    <div className="flex flex-col gap-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            ¿Dónde se realizó o realizará?
                        </p>

                        {/* Tipo: Máquina vs Área */}
                        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => { setTipoUbicacion('MAQUINA'); setErrors(e => ({ ...e, area: null })); }}
                                className={cn(
                                    'flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-md transition-all',
                                    tipoUbicacion === 'MAQUINA' ? 'bg-white text-marca-primario shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                )}
                            >
                                <Icon name="precision_manufacturing" size="sm" />
                                En Máquina
                            </button>
                            <button
                                type="button"
                                onClick={() => { setTipoUbicacion('AREA'); setErrors(e => ({ ...e, maquinaId: null })); }}
                                className={cn(
                                    'flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-md transition-all',
                                    tipoUbicacion === 'AREA' ? 'bg-white text-marca-primario shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                )}
                            >
                                <Icon name="domain" size="sm" />
                                En Área / Planta
                            </button>
                        </div>

                        {tipoUbicacion === 'MAQUINA' ? (
                            <div className="flex flex-col gap-3">
                                <MaquinaSelectField
                                    label="Máquina *"
                                    value={maquinaId}
                                    options={opcionesMaquinas}
                                    onChange={(val) => { setMaquinaId(val); if (errors.maquinaId) setErrors(e => ({ ...e, maquinaId: null })); }}
                                    error={errors.maquinaId}
                                    searching={loadingMaquinas}
                                    showBIContext={false}
                                    maquinaInfo={maquinaSeleccionada ? {
                                        codigo: maquinaSeleccionada.codigo,
                                        planta: maquinaSeleccionada.planta,
                                        area:   maquinaSeleccionada.area,
                                    } : null}
                                />

                                {maquinaSeleccionada && (
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Tipo de intervención</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setClasificacion('CORRECTIVO')}
                                                className={cn(
                                                    'py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer',
                                                    clasificacion === 'CORRECTIVO'
                                                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                )}
                                            >
                                                <Icon name="report_problem" size="sm" className="text-amber-600" />
                                                Correctivo / Falla
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setClasificacion('PREVENTIVO')}
                                                className={cn(
                                                    'py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer',
                                                    clasificacion === 'PREVENTIVO'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-500'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                )}
                                            >
                                                <Icon name="build_circle" size="sm" className="text-blue-600" />
                                                Preventivo / Servicio
                                            </button>
                                        </div>

                                        {/* Toggle de paro de producción (opcional, no obligatorio) */}
                                        {esCorrectivoDeMaquina && (
                                            <div className="flex flex-col gap-2.5 pt-1 animate-in fade-in duration-200">
                                                <button
                                                    type="button"
                                                    onClick={() => setParoProduccion(prev => !prev)}
                                                    className={cn(
                                                        'flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer',
                                                        paroProduccion
                                                            ? 'bg-red-50 border-red-200 text-red-900 ring-1 ring-red-300'
                                                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                                                    )}
                                                >
                                                    <span className={cn(
                                                        'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                                                        paroProduccion
                                                            ? 'bg-red-600 border-red-600 text-white'
                                                            : 'bg-white border-slate-300 text-transparent'
                                                    )}>
                                                        <Icon name="check" size="xs" />
                                                    </span>
                                                    <span className="flex flex-col gap-0.5">
                                                        <span className={cn('text-xs font-bold', paroProduccion ? 'text-red-800' : 'text-slate-800')}>
                                                            ¿La falla causó paro de producción?
                                                        </span>
                                                        <span className="text-[11px] text-slate-500 leading-tight">
                                                            {paroProduccion
                                                                ? 'La máquina se registrará con afectación a producción y cálculo de paro.'
                                                                : 'Mantenimiento correctivo sin interrupción total de la línea de producción.'}
                                                        </span>
                                                    </span>
                                                </button>

                                                {/* Fecha inicio del paro (solo si el técnico marcó que hubo paro) */}
                                                {paroProduccion && (
                                                    <div className="flex flex-col gap-1.5 pl-8 animate-in fade-in duration-200">
                                                        <Label htmlFor="tec-paro">
                                                            Inicio del paro
                                                            <span className="ml-1 text-xs font-normal text-slate-400">(deja vacío = ahora mismo)</span>
                                                        </Label>
                                                        <input
                                                            id="tec-paro"
                                                            type="datetime-local"
                                                            value={fechaParoProduccion}
                                                            max={new Date().toISOString().slice(0, 16)}
                                                            onChange={(e) => setFechaParoProduccion(e.target.value)}
                                                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-500"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tec-area" error={!!errors.area}>Área / Línea *</Label>
                                <Select
                                    id="tec-area"
                                    value={area}
                                    onChange={(e) => { setArea(e.target.value); if (errors.area) setErrors(err => ({ ...err, area: null })); }}
                                    error={!!errors.area}
                                    helperText={errors.area}
                                >
                                    <option value="" disabled hidden>Selecciona área…</option>
                                    {areasOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* ── 2. ¿CUÁL ES EL ESTADO DE ESTE TRABAJO? ─────────────────── */}
                    <div className="flex flex-col gap-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            ¿Cuál es el estado de este trabajo?
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setYaTerminado(true)}
                                className={cn(
                                    'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 active:scale-95 cursor-pointer',
                                    yaTerminado
                                        ? 'border-estado-resuelto bg-estado-resuelto/5'
                                        : 'border-slate-200 bg-white hover:border-estado-resuelto/50 hover:bg-estado-resuelto/5'
                                )}
                            >
                                <div className="w-12 h-12 rounded-full bg-estado-resuelto/10 flex items-center justify-center">
                                    <Icon name="check_circle" size="28px" className="text-estado-resuelto" fill />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-700">Ya lo terminé</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">Se cerrará inmediatamente</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setYaTerminado(false)}
                                className={cn(
                                    'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 active:scale-95 cursor-pointer',
                                    !yaTerminado
                                        ? 'border-marca-primario bg-marca-primario/5'
                                        : 'border-slate-200 bg-white hover:border-marca-primario/50 hover:bg-marca-primario/5'
                                )}
                            >
                                <div className="w-12 h-12 rounded-full bg-marca-primario/10 flex items-center justify-center">
                                    <Icon name="pending_actions" size="28px" className="text-marca-primario" fill />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-700">Todavía falta</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">Quedará en tu lista de hoy</p>
                                </div>
                            </button>
                        </div>

                        {/* Info cuando está pendiente */}
                        {!yaTerminado && (
                            <div className="flex items-start gap-3 px-3 py-2.5 bg-blue-50 border border-blue-200/80 rounded-xl animate-in fade-in duration-200">
                                <Icon name="info" size="sm" className="text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-900 font-medium leading-relaxed">
                                    La tarea se creará como <strong>Asignada para ti</strong> y aparecerá de inmediato en tu lista de hoy.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── 3. ¿QUÉ TRABAJO SE REALIZÓ O REALIZARÁ? ───────────────── */}
                    <div className="flex flex-col gap-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            ¿Qué trabajo se realizó o realizará?
                        </p>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tec-titulo" error={!!errors.titulo}>Título *</Label>
                            <input
                                id="tec-titulo"
                                type="text"
                                maxLength={255}
                                placeholder="Ej. Cambio de banda, reparación de fuga, ajuste de guías…"
                                value={titulo}
                                onChange={(e) => { setTitulo(e.target.value); if (errors.titulo) setErrors(err => ({ ...err, titulo: null })); }}
                                className={cn(
                                    'w-full border rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 transition-all',
                                    errors.titulo
                                        ? 'border-red-400 focus:ring-red-200'
                                        : 'border-slate-300 focus:ring-marca-secundario/30 focus:border-marca-secundario'
                                )}
                            />
                            {errors.titulo && (
                                <p className="text-xs text-estado-rechazado font-bold flex items-center gap-1">
                                    <Icon name="warning" size="xs" />{errors.titulo}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tec-desc">
                                {yaTerminado ? 'Nota de cierre' : 'Descripción / notas'}
                                <span className="ml-1 text-xs font-normal text-slate-400">
                                    {yaTerminado ? '(opcional — se guardará en el historial de cierre)' : '(opcional)'}
                                </span>
                            </Label>
                            <textarea
                                id="tec-desc"
                                rows={2}
                                maxLength={500}
                                placeholder={
                                    yaTerminado
                                        ? 'Detalles del trabajo realizado, observaciones de cierre…'
                                        : 'Detalles breves del trabajo a realizar…'
                                }
                                value={textoLibre}
                                onChange={(e) => setTextoLibre(e.target.value)}
                                className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 focus:border-marca-secundario transition-all"
                            />
                        </div>

                        <FotoSection archivos={archivos} onAgregar={handleAgregar} onEliminar={handleEliminar} />
                    </div>

                    {/* ── 4. TIEMPO INVERTIDO (solo si ya terminado) ────────────────── */}
                    {yaTerminado && (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-2">
                                <Icon name="nest_clock_farsight_analog" size="sm" className="text-marca-primario" />
                                <p className="text-sm font-bold text-slate-700">Tiempo invertido *</p>
                            </div>

                            <TimePicker
                                totalMins={duracionMinutos}
                                onChange={setDuracionMinutos}
                                onRangeChange={setTiempoRange}
                            />

                            {duracionMinutos === 0 && (
                                <p className="text-xs text-estado-rechazado font-bold flex items-center gap-1 -mt-2">
                                    <Icon name="warning" size="xs" />
                                    El tiempo debe ser mayor a 0 minutos.
                                </p>
                            )}
                            {errors.duracion && (
                                <p className="text-xs text-estado-rechazado font-bold flex items-center gap-1 -mt-2">
                                    <Icon name="warning" size="xs" />{errors.duracion}
                                </p>
                            )}

                            {/* Resumen tiempo */}
                            {duracionMinutos > 0 && !duracionInvalida && (
                                <div className="flex items-center justify-between px-3 py-2 bg-estado-resuelto/10 border border-estado-resuelto/20 rounded-xl">
                                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Icon name="timer" size="sm" className="text-estado-resuelto" />
                                        Tiempo a registrar
                                    </span>
                                    <span className="text-base font-extrabold font-mono text-estado-resuelto">
                                        {duracionMinutos < 60
                                            ? `${duracionMinutos} min`
                                            : `${Math.floor(duracionMinutos / 60)} h ${duracionMinutos % 60 > 0 ? `${duracionMinutos % 60} min` : ''}`}
                                    </span>
                                </div>
                            )}

                            {/* Máquina operativa (correctivo + maquina + terminado) */}
                            {esCorrectivoDeMaquina && (
                                <button
                                    type="button"
                                    onClick={() => setMaquinaOperativaAlResolver(prev => !prev)}
                                    className={cn(
                                        'flex items-start gap-3 p-3 rounded-lg border text-left transition-colors cursor-pointer animate-in fade-in duration-200',
                                        maquinaOperativaAlResolver
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                            : 'bg-red-50 border-red-200 text-red-800'
                                    )}
                                >
                                    <span className={cn(
                                        'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0',
                                        maquinaOperativaAlResolver ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-red-300 text-transparent'
                                    )}>
                                        <Icon name="check" size="xs" />
                                    </span>
                                    <span className="flex flex-col gap-0.5">
                                        <span className="text-xs font-bold">Máquina funcional y probada</span>
                                        <span className="text-[10px] leading-tight text-slate-500">
                                            Confirmo que se realizaron pruebas y la máquina quedó operativa.
                                        </span>
                                    </span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </ModalBody>

            <ModalFooter>
                <Button
                    variant="cancelar"
                    onClick={onClose}
                    disabled={submitting}
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                    Cancelar
                </Button>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    isLoading={submitting}
                    disabled={submitting || duracionInvalida}
                    variant={yaTerminado ? 'guardar' : 'primario'}
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                    {yaTerminado ? 'Registrar trabajo terminado' : 'Guardar tarea pendiente'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};
