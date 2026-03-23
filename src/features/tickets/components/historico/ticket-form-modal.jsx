// src/features/tickets/components/historico/ticket-form-modal.jsx
import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Label, Input, Select } from '@/components/form/z_index';

const PLANTAS = ['KAPPA', 'OMEGA', 'SIGMA', 'LAMBDA', 'ADMINISTRATIVOS', 'GENERAL'];

const CLASIFICACIONES_CLIENTE = [
    { value: 'CORRECTIVO', label: 'Correctivo' },
    { value: 'MEJORA', label: 'Mejora' },
    { value: 'INFRAESTRUCTURA', label: 'Infraestructura' },
];

const CLASIFICACIONES_ADMIN = [
    { value: 'PREVENTIVO', label: 'Preventivo' },
    { value: 'CORRECTIVO', label: 'Correctivo' },
    { value: 'INSPECCION', label: 'Inspección' },
    { value: 'MEJORA', label: 'Mejora' },
    { value: 'INFRAESTRUCTURA', label: 'Infraestructura' },
    { value: 'RUTINA', label: 'Rutina' },
];

const PRIORIDADES = [
    { value: 'BAJA', label: 'Baja' },
    { value: 'MEDIA', label: 'Media' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'CRITICA', label: 'Crítica' },
];

const TIPOS_ADMIN = [
    { value: 'PLANEADA', label: 'Planeada' },
    { value: 'EXTRAORDINARIA', label: 'Extraordinaria' },
];

const ROLES_ADMIN = new Set(['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO']);

const MAX_TITULO = 80;
const MAX_DESCRIPCION = 500;

export const TicketFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    ticketAEditar,
    currentUser,
    tecnicos = [],
    isSubmitting,
}) => {
    const esEdicion = Boolean(ticketAEditar);
    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoria, setCategoria] = useState('');
    const [planta, setPlanta] = useState('');
    const [area, setArea] = useState('');
    const [prioridad, setPrioridad] = useState('MEDIA');
    const [clasificacion, setClasificacion] = useState('');
    const [tipo, setTipo] = useState('PLANEADA');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [tiempoEstimado, setTiempoEstimado] = useState('');
    const [responsables, setResponsables] = useState([]);
    const [backendError, setBackendError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setSubmitted(false);
        setBackendError('');

        if (esEdicion) {
            setTitulo(ticketAEditar.titulo ?? '');
            setDescripcion(ticketAEditar.descripcion ?? '');
            setCategoria(ticketAEditar.categoria ?? '');
            setPlanta(ticketAEditar.planta ?? '');
            setArea(ticketAEditar.area ?? '');
            setPrioridad(ticketAEditar.prioridad ?? 'MEDIA');
            setClasificacion(ticketAEditar.clasificacion ?? '');
            setTipo(ticketAEditar.tipo ?? 'PLANEADA');
            const fv = ticketAEditar.fechaVencimiento
                ? new Date(ticketAEditar.fechaVencimiento).toISOString().split('T')[0]
                : '';
            setFechaVencimiento(fv);
            setTiempoEstimado(ticketAEditar.tiempoEstimado ? String(ticketAEditar.tiempoEstimado) : '');
            setResponsables(ticketAEditar.responsables?.map((r) => String(r.id)) ?? []);
        } else {
            setTitulo(''); setDescripcion(''); setCategoria('');
            setPlanta(''); setArea(''); setPrioridad('MEDIA');
            setClasificacion(''); setTipo('PLANEADA');
            setFechaVencimiento(''); setTiempoEstimado(''); setResponsables([]);
        }
    }, [isOpen, esEdicion, ticketAEditar]);

    const getErrors = () => {
        const e = {};
        if (!titulo.trim() || titulo.length < 3) e.titulo = 'Mínimo 3 caracteres.';
        if (!descripcion.trim() || descripcion.length < 3) e.descripcion = 'Mínimo 3 caracteres.';
        if (!clasificacion) e.clasificacion = 'Selecciona la clasificación.';
        if (!esAdmin) {
            if (!categoria.trim()) e.categoria = 'La categoría es obligatoria.';
            if (!planta.trim()) e.planta = 'Selecciona la planta.';
            if (!area.trim()) e.area = 'El área es obligatoria.';
        }
        return e;
    };

    const handleToggleResponsable = (id) => {
        setResponsables((prev) =>
            prev.includes(String(id)) ? prev.filter((x) => x !== String(id)) : [...prev, String(id)]
        );
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setBackendError('');
        const errors = getErrors();
        if (Object.keys(errors).length > 0) return;

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion);
        formData.append('clasificacion', clasificacion);
        if (categoria) formData.append('categoria', categoria);
        if (planta) formData.append('planta', planta);
        if (area) formData.append('area', area);
        formData.append('prioridad', prioridad);
        if (esAdmin) {
            formData.append('tipo', tipo);
            if (fechaVencimiento) formData.append('fechaVencimiento', fechaVencimiento);
            if (tiempoEstimado) formData.append('tiempoEstimado', tiempoEstimado);
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
    const clasificacionesOpts = esAdmin ? CLASIFICACIONES_ADMIN : CLASIFICACIONES_CLIENTE;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full md:max-w-4xl lg:max-w-5xl">
            <ModalHeader
                title={esEdicion ? 'Editar tarea' : esAdmin ? 'Nueva tarea administrativa' : 'Reportar problema'}
                onClose={onClose}
            />
            <ModalBody>
                <div className="flex flex-col gap-6">

                    {backendError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-semibold flex items-center gap-2">
                            <Icon name="error" size="sm" /> {backendError}
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="tf-titulo" error={!!fe.titulo}>Título *</Label>
                            <span className={`text-[10px] font-bold ${titulo.length >= MAX_TITULO ? 'text-estado-rechazado' : 'text-slate-400'}`}>
                                {titulo.length}/{MAX_TITULO}
                            </span>
                        </div>
                        <Input
                            id="tf-titulo"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value.slice(0, MAX_TITULO))}
                            error={!!fe.titulo}
                            helperText={fe.titulo}
                            placeholder="Ej. Fuga de aire en compresor principal"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-clasificacion" error={!!fe.clasificacion}>Clasificación *</Label>
                            <Select
                                id="tf-clasificacion"
                                value={clasificacion}
                                onChange={(e) => setClasificacion(e.target.value)}
                                error={!!fe.clasificacion}
                                helperText={fe.clasificacion}
                                disabled={isSubmitting}
                            >
                                <option value="" disabled>Selecciona…</option>
                                {clasificacionesOpts.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-prioridad">Prioridad</Label>
                            <Select
                                id="tf-prioridad"
                                value={prioridad}
                                onChange={(e) => setPrioridad(e.target.value)}
                                disabled={isSubmitting}
                            >
                                {PRIORIDADES.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-planta" error={!!fe.planta}>Planta {!esAdmin && '*'}</Label>
                            <Select
                                id="tf-planta"
                                value={planta}
                                onChange={(e) => setPlanta(e.target.value)}
                                error={!!fe.planta}
                                helperText={fe.planta}
                                disabled={isSubmitting}
                            >
                                <option value="">Selecciona…</option>
                                {PLANTAS.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-area" error={!!fe.area}>Área / Línea {!esAdmin && '*'}</Label>
                            <Input
                                id="tf-area"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                error={!!fe.area}
                                helperText={fe.area}
                                placeholder="Ej. Pespunte, Láser, Almacén…"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {!esAdmin && (
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-categoria" error={!!fe.categoria}>Categoría del equipo *</Label>
                            <Input
                                id="tf-categoria"
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                error={!!fe.categoria}
                                helperText={fe.categoria}
                                placeholder="Ej. Eléctrico, Mecánico, Infraestructura…"
                                disabled={isSubmitting}
                            />
                        </div>
                    )}

                    {esAdmin && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-tipo">Tipo de tarea</Label>
                                <Select
                                    id="tf-tipo"
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value)}
                                    disabled={isSubmitting || esEdicion}
                                >
                                    {TIPOS_ADMIN.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-fecha">Fecha de vencimiento</Label>
                                <Input
                                    id="tf-fecha"
                                    type="date"
                                    value={fechaVencimiento}
                                    onChange={(e) => setFechaVencimiento(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-tiempo">Tiempo estimado (min)</Label>
                                <Input
                                    id="tf-tiempo"
                                    type="number"
                                    min="1"
                                    value={tiempoEstimado}
                                    onChange={(e) => setTiempoEstimado(e.target.value)}
                                    placeholder="Ej. 60"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {esAdmin && tecnicos.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <Label>Técnicos asignados (opcional)</Label>
                                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 border border-slate-200 rounded-lg p-2 bg-slate-50">
                                    {tecnicos.map((t) => {
                                        const isSelected = responsables.includes(String(t.id));
                                        return (
                                            <label key={t.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors
                                                ${isSelected ? 'bg-marca-primario/5 border-marca-primario/30 text-marca-primario' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleResponsable(t.id)}
                                                    className="accent-marca-primario w-4 h-4 shrink-0"
                                                />
                                                <span className="text-sm font-medium">{t.nombre}{t.cargo ? ` — ${t.cargo}` : ''}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className={`flex flex-col gap-1.5 ${(!esAdmin || tecnicos.length === 0) ? 'lg:col-span-2' : ''}`}>
                            <div className="flex justify-between items-center">
                                <Label htmlFor="tf-desc" error={!!fe.descripcion}>Descripción *</Label>
                                <span className={`text-[10px] font-bold ${descripcion.length >= MAX_DESCRIPCION ? 'text-estado-rechazado' : 'text-slate-400'}`}>
                                    {descripcion.length}/{MAX_DESCRIPCION}
                                </span>
                            </div>
                            <Input
                                id="tf-desc"
                                multiline
                                rows={esAdmin && tecnicos.length > 0 ? 5 : 4}
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value.slice(0, MAX_DESCRIPCION))}
                                error={!!fe.descripcion}
                                helperText={fe.descripcion}
                                placeholder="Describe el problema o tarea con el mayor detalle posible…"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
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