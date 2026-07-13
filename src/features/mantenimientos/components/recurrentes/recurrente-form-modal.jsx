import { useEffect, useMemo, useState } from 'react';
import { Button, Icon, Modal, ModalBody, ModalFooter, ModalHeader, SearchableSelect, Spinner } from '@/components/ui/z_index';
import { getMaquinas } from '@/features/maquinaria/api/maquinaria-api';
import { getAsignables } from '@/features/mantenimientos/api/mantenimientos-api';
import { filterMaquinasParaMantenimiento } from '@/features/common/forms/tareas/utils/maquinas-filter-utils';
import { getMinDateHoy } from '@/lib/date';

const FRECUENCIAS = [
    { value: 'SEMANAL', label: 'Semanal' },
    { value: 'QUINCENAL', label: 'Quincenal' },
    { value: 'MENSUAL', label: 'Mensual' },
    { value: 'PERSONALIZADA_DIAS', label: 'Personalizada por dias' },
];

const PRIORIDADES = [
    { value: 'BAJA', label: 'Baja' },
    { value: 'MEDIA', label: 'Media' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'CRITICA', label: 'Critica' },
];

const datePart = (value) => value ? String(value).split('T')[0] : '';

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
    const [formError, setFormError] = useState('');

    const [maquinaId, setMaquinaId] = useState('');
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [tecnicoResponsableId, setTecnicoResponsableId] = useState('');
    const [frecuencia, setFrecuencia] = useState('MENSUAL');
    const [intervaloDias, setIntervaloDias] = useState('');
    const [proximaFechaEjecucion, setProximaFechaEjecucion] = useState('');
    const [prioridad, setPrioridad] = useState('MEDIA');
    const [tiempoEstimado, setTiempoEstimado] = useState('');
    const [activo, setActivo] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        queueMicrotask(() => setLoadingCatalogos(true));
        Promise.all([
            getMaquinas({ limit: 500 }),
            getAsignables(),
        ])
            .then(([maquinasRes, tecnicosRes]) => {
                const maquinasData = Array.isArray(maquinasRes?.data) ? maquinasRes.data : Array.isArray(maquinasRes?.data?.data) ? maquinasRes.data.data : Array.isArray(maquinasRes) ? maquinasRes : [];
                const tecnicosData = Array.isArray(tecnicosRes) ? tecnicosRes : Array.isArray(tecnicosRes?.data) ? tecnicosRes.data : [];
                setMaquinas(filterMaquinasParaMantenimiento(maquinasData, regla?.maquinaId));
                setTecnicos(tecnicosData);
            })
            .catch(() => setFormError('Error al cargar catalogos.'))
            .finally(() => setLoadingCatalogos(false));
    }, [isOpen, regla]);

    useEffect(() => {
        if (!isOpen) return;
        queueMicrotask(() => {
            setFormError('');
            setMaquinaId(regla?.maquinaId ? String(regla.maquinaId) : '');
            setTitulo(regla?.titulo || '');
            setDescripcion(regla?.descripcion || '');
            setTecnicoResponsableId(regla?.tecnicoResponsableId ? String(regla.tecnicoResponsableId) : regla?.tecnicoResponsable?.id ? String(regla.tecnicoResponsable.id) : '');
            setFrecuencia(regla?.frecuencia || 'MENSUAL');
            setIntervaloDias(regla?.intervaloDias ? String(regla.intervaloDias) : '');
            setProximaFechaEjecucion(datePart(regla?.proximaFechaEjecucion));
            setPrioridad(regla?.prioridad || 'MEDIA');
            setTiempoEstimado(regla?.tiempoEstimado ? String(regla.tiempoEstimado) : '');
            setActivo(regla?.activo ?? true);
        });
    }, [isOpen, regla]);

    const maquinaOptions = useMemo(() => maquinas.map((maquina) => ({
        value: String(maquina.id),
        label: `${maquina.codigo || 'SIN CODIGO'} - ${maquina.nombre || 'Sin nombre'}`,
        ...maquina,
    })), [maquinas]);

    const tecnicoOptions = useMemo(() => tecnicos.map((tecnico) => ({
        value: String(tecnico.id),
        label: `${tecnico.nombre}${tecnico.cargo ? ` - ${tecnico.cargo}` : ''}`,
    })), [tecnicos]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError('');

        if (!maquinaId) return setFormError('Selecciona una maquina.');
        if (titulo.trim().length < 3) return setFormError('El titulo debe tener al menos 3 caracteres.');
        if (!tecnicoResponsableId) return setFormError('Selecciona responsable tecnico.');
        if (!proximaFechaEjecucion) return setFormError('Selecciona fecha inicial programada.');
        if (proximaFechaEjecucion < getMinDateHoy()) return setFormError('No se permiten fechas anteriores a hoy.');
        if (frecuencia === 'PERSONALIZADA_DIAS' && (!intervaloDias || Number(intervaloDias) <= 0)) {
            return setFormError('Indica intervalo de dias mayor a 0.');
        }

        const payload = {
            maquinaId: Number(maquinaId),
            titulo: titulo.trim(),
            descripcion: descripcion.trim() || null,
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
            setFormError(err?.message || 'Error al guardar programacion preventiva.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl">
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
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Maquina *</label>
                            <SearchableSelect
                                options={maquinaOptions}
                                value={maquinaId}
                                onChange={setMaquinaId}
                                placeholder={loadingCatalogos ? 'Cargando maquinas...' : 'Selecciona maquina'}
                                searchPlaceholder="Buscar por codigo o nombre..."
                                allOptionText={null}
                                disabled={loadingCatalogos || submitting}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Titulo *</label>
                            <input
                                value={titulo}
                                onChange={(event) => setTitulo(event.target.value)}
                                maxLength={255}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-marca-primario"
                                placeholder="Ej. Preventivo semanal de centro robotizado"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Descripcion</label>
                            <textarea
                                value={descripcion}
                                onChange={(event) => setDescripcion(event.target.value)}
                                rows={3}
                                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-marca-primario"
                                placeholder="Checklist o instrucciones para el mantenimiento..."
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Responsable tecnico *</label>
                            <select
                                value={tecnicoResponsableId}
                                onChange={(event) => setTecnicoResponsableId(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-marca-primario"
                                disabled={loadingCatalogos || submitting}
                            >
                                <option value="">Selecciona tecnico</option>
                                {tecnicoOptions.map((tecnico) => (
                                    <option key={tecnico.value} value={tecnico.value}>{tecnico.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Frecuencia *</label>
                            <select
                                value={frecuencia}
                                onChange={(event) => setFrecuencia(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-marca-primario"
                                disabled={submitting}
                            >
                                {FRECUENCIAS.map((item) => (
                                    <option key={item.value} value={item.value}>{item.label}</option>
                                ))}
                            </select>
                        </div>

                        {frecuencia === 'PERSONALIZADA_DIAS' && (
                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Intervalo dias *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={intervaloDias}
                                    onChange={(event) => setIntervaloDias(event.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-marca-primario"
                                />
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Fecha inicial programada *</label>
                            <input
                                type="date"
                                min={getMinDateHoy()}
                                value={proximaFechaEjecucion}
                                onChange={(event) => setProximaFechaEjecucion(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-marca-primario"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Prioridad</label>
                            <select
                                value={prioridad}
                                onChange={(event) => setPrioridad(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-marca-primario"
                            >
                                {PRIORIDADES.map((item) => (
                                    <option key={item.value} value={item.value}>{item.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Tiempo estimado min</label>
                            <input
                                type="number"
                                min="1"
                                value={tiempoEstimado}
                                onChange={(event) => setTiempoEstimado(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-marca-primario"
                                placeholder="60"
                            />
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
