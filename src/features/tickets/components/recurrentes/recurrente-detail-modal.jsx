import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Icon, Modal, ModalBody, ModalHeader, Spinner } from '@/components/ui/z_index';
import { RecurrenteStatusBadge } from './recurrente-status-badge';
import { RecurrenteOcurrencias } from './recurrente-ocurrencias';
import { fecha, frecuenciaLabel, horarioODuracion, responsablesLabel } from './recurrentes-utils';

const DataRow = ({ icon, label, value, fallback = 'No registrado' }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-400">
            <Icon name={icon} size="sm" />
        </div>
        <div className="flex min-w-0 flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
            <span className="mt-0.5 text-sm font-medium text-slate-800">
                {value || <span className="font-normal italic text-slate-400">{fallback}</span>}
            </span>
        </div>
    </div>
);

const unwrap = (response, fallback) => response?.data?.data || response?.data || fallback;
const yearRangeParams = (year) => ({ from: `${year}-01-01`, to: `${year}-12-31` });

export const RecurrenteDetailModal = ({
    regla,
    isOpen,
    onClose,
    loadDetail,
    loadProyecciones,
    loadAjustes,
    onMaterialize,
    onMove,
    onOmit,
    onRemove,
    canManage,
    submitting,
}) => {
    const [activeTab, setActiveTab] = useState('info');
    const [detail, setDetail] = useState(regla);
    const [occurrences, setOccurrences] = useState([]);
    const [adjustments, setAdjustments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const refresh = useCallback(async () => {
        if (!regla?.id) return;
        setLoading(true);
        setError('');
        try {
            const [ruleRes, projectionRes, adjustmentRes] = await Promise.all([
                loadDetail(regla.id),
                loadProyecciones(regla.id, yearRangeParams(selectedYear)),
                loadAjustes(regla.id),
            ]);
            setDetail(unwrap(ruleRes, regla));
            setOccurrences(unwrap(projectionRes, []));
            setAdjustments(unwrap(adjustmentRes, []));
        } catch (err) {
            setError(err?.response?.data?.error || err?.response?.data?.message || err.message || 'No se pudo cargar el detalle.');
        } finally {
            setLoading(false);
        }
    }, [loadAjustes, loadDetail, loadProyecciones, regla, selectedYear]);

    useEffect(() => {
        if (!isOpen) return;
        setActiveTab('info');
        setDetail(regla);
    }, [isOpen, regla]);

    useEffect(() => {
        if (isOpen) refresh();
    }, [isOpen, refresh]);

    const activeAdjustments = useMemo(() => (
        adjustments.filter((item) => !item.deletedAt && !item.archivadoAt)
    ), [adjustments]);

    const handleOccurrenceAction = async (callback, item) => {
        await callback(item);
        await refresh();
    };

    if (!regla) return null;

    const current = detail || regla;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-3xl">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-2">
                    <Icon name="event_repeat" className="text-marca-primario" />
                    <span className="font-bold text-slate-800">Detalle actividad recurrente</span>
                </div>
            </ModalHeader>
            <ModalBody className="max-h-[85vh] space-y-4 overflow-y-auto p-6">
                {error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                        <Icon name="error" size="sm" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="mb-6 flex flex-col items-center gap-5 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-start">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-white bg-marca-primario/10 text-marca-primario shadow-md">
                        <Icon name="event_repeat" size="lg" />
                    </div>
                    <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
                        <h3 className="text-xl font-extrabold leading-tight text-slate-900">
                            {current.titulo}
                        </h3>
                        <p className="mt-1 text-sm font-mono text-slate-500">{current.categoria || 'Sin categoria'}</p>
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                            <RecurrenteStatusBadge regla={current} />
                        </div>
                    </div>
                </div>

                <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-100 p-1.5">
                    <button
                        type="button"
                        onClick={() => setActiveTab('info')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black uppercase tracking-wide transition-all ${activeTab === 'info' ? 'border border-slate-200/40 bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Icon name="info" size="xs" />
                        Informacion
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black uppercase tracking-wide transition-all ${activeTab === 'history' ? 'border border-slate-200/40 bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Icon name="calendar_month" size="xs" />
                        Programacion
                    </button>
                </div>

                {activeTab === 'info' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {current.descripcion && (
                            <div className="rounded-xl border border-slate-150 bg-slate-50/50 p-4">
                                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Descripcion</span>
                                <p className="text-sm font-medium leading-relaxed text-slate-750">{current.descripcion}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-8 px-2 md:grid-cols-2">
                            <div className="space-y-5">
                                <h4 className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-bold text-slate-900">
                                    <Icon name="assignment" size="sm" className="text-marca-primario" />
                                    Actividad y responsables
                                </h4>
                                <DataRow icon="label" label="Categoria" value={current.categoria} />
                                <DataRow icon="place" label="Area" value={current.area} />
                                <DataRow icon="groups" label="Responsables" value={responsablesLabel(current.responsables)} />
                            </div>

                            <div className="space-y-5">
                                <h4 className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-bold text-slate-900">
                                    <Icon name="date_range" size="sm" className="text-marca-primario" />
                                    Planificacion
                                </h4>
                                <DataRow icon="sync" label="Frecuencia" value={frecuenciaLabel(current)} />
                                <DataRow icon="event" label="Proxima ejecucion" value={fecha(current.proximaFechaEjecucion)} />
                                <DataRow icon="calendar_today" label="Vigencia" value={`${fecha(current.fechaInicio)} - ${current.fechaFin ? fecha(current.fechaFin) : 'Sin fin'}`} />
                                <DataRow icon="flag" label="Prioridad" value={current.prioridad} />
                                <DataRow icon="schedule" label="Horario / duracion" value={horarioODuracion(current)} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="text-xs font-black uppercase tracking-wide text-slate-500">Fechas programadas</div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedYear((year) => year - 1)}
                                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 active:scale-95"
                                >
                                    <Icon name="chevron_left" size="xs" />
                                </button>
                                <span className="px-2 text-sm font-black text-slate-800">{selectedYear}</span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedYear((year) => year + 1)}
                                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 active:scale-95"
                                >
                                    <Icon name="chevron_right" size="xs" />
                                </button>
                                <Button type="button" variant="cancelar" size="sm" onClick={refresh} disabled={loading}>
                                    {loading ? <Spinner size="xs" /> : 'Actualizar'}
                                </Button>
                            </div>
                        </div>

                        <RecurrenteOcurrencias
                            occurrences={occurrences}
                            loading={loading}
                            canManage={canManage}
                            submitting={submitting}
                            onMaterialize={(item) => handleOccurrenceAction(onMaterialize, item)}
                            onMove={onMove}
                            onOmit={onOmit}
                            onRemove={onRemove}
                        />

                        {activeAdjustments.length > 0 && (
                            <div>
                                <h4 className="mb-2 font-black text-slate-800">Ajustes activos</h4>
                                <div className="space-y-1 text-xs text-slate-600">
                                    {activeAdjustments.map((adjustment) => (
                                        <p key={adjustment.id}>
                                            {adjustment.tipo} · {String(adjustment.fechaOriginal || '').slice(0, 10)}
                                            {adjustment.motivo ? ` · ${adjustment.motivo}` : ''}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};
