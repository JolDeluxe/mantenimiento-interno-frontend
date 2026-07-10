import { Icon, Spinner } from '@/components/ui/z_index';
import { formatearFechaTextoLargo } from '../../helpers/fechas';
import { RecurrenteActions } from './recurrente-actions';
import { RecurrenteStatusBadge } from './recurrente-status-badge';
import { frecuenciaLabel } from './recurrentes-utils';

const datePart = (value) => value ? String(value).split('T')[0] : '';

export const RecurrentesListado = ({
    reglas,
    loading,
    submitting,
    canManage,
    onView,
    onEdit,
    onToggleActivo,
    onMaterialize,
}) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-500">
                <Spinner size="sm" className="mr-2" />
                <span className="text-xs font-black uppercase tracking-wide">Cargando reglas...</span>
            </div>
        );
    }

    if (!reglas.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
                <div className="rounded-full border border-slate-200 bg-slate-50 p-3 text-slate-400">
                    <Icon name="event_repeat" size="md" />
                </div>
                <div>
                    <div className="text-sm font-black text-slate-700">Sin reglas recurrentes</div>
                    <p className="text-xs font-medium text-slate-500">Crea reglas preventivas para generar ciclos automaticamente.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left">
                    <thead className="bg-slate-50">
                        <tr className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-3">Codigo maquina</th>
                            <th className="px-3 py-3">Maquina/equipo</th>
                            <th className="px-3 py-3">Area/ubicacion</th>
                            <th className="px-3 py-3">Responsable</th>
                            <th className="px-3 py-3">Frecuencia</th>
                            <th className="px-3 py-3">Proxima ejecucion</th>
                            <th className="px-3 py-3">Tiempo estimado</th>
                            <th className="px-3 py-3">Estado regla</th>
                            <th className="px-3 py-3">Ticket pendiente actual</th>
                            <th className="px-3 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reglas.map((regla) => (
                            <tr key={regla.id} className={!regla.activo ? 'bg-slate-50/60 opacity-75' : 'bg-white'}>
                                <td className="px-3 py-3 text-xs font-black text-slate-800">{regla.maquina?.codigo || '-'}</td>
                                <td className="px-3 py-3">
                                    <div className="max-w-[260px] truncate text-xs font-bold text-slate-800">{regla.maquina?.nombre || '-'}</div>
                                    <div className="text-[10px] font-semibold text-slate-400">{regla.titulo}</div>
                                </td>
                                <td className="px-3 py-3 text-xs font-semibold text-slate-600">
                                    {regla.maquina?.planta || '-'} / {regla.maquina?.area || '-'}
                                </td>
                                <td className="px-3 py-3 text-xs font-semibold text-slate-700">{regla.tecnicoResponsable?.nombre || '-'}</td>
                                <td className="px-3 py-3 text-xs font-bold text-slate-700">{frecuenciaLabel(regla)}</td>
                                <td className="px-3 py-3 text-xs font-semibold text-slate-700">
                                    {formatearFechaTextoLargo(datePart(regla.proximaFechaEjecucion)) || '-'}
                                </td>
                                <td className="px-3 py-3 text-xs font-semibold text-slate-700">
                                    {regla.tiempoEstimado ? `${regla.tiempoEstimado} min` : '-'}
                                </td>
                                <td className="px-3 py-3">
                                    <RecurrenteStatusBadge activo={regla.activo} />
                                </td>
                                <td className="px-3 py-3 text-xs font-semibold text-slate-400">No disponible</td>
                                <td className="px-3 py-3">
                                    <RecurrenteActions
                                        regla={regla}
                                        canManage={canManage}
                                        submitting={submitting}
                                        onView={onView}
                                        onEdit={onEdit}
                                        onToggleActivo={onToggleActivo}
                                        onMaterialize={onMaterialize}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
