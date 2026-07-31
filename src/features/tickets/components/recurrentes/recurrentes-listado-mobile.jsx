import { Icon, Spinner } from '@/components/ui/z_index';
import { RecurrenteActions } from './recurrente-actions';
import { RecurrenteStatusBadge } from './recurrente-status-badge';
import { fecha, frecuenciaLabel, horarioODuracion, responsablesLabel } from './recurrentes-utils';

export const RecurrentesListadoMobile = ({
    reglas,
    loading,
    submitting,
    canManage,
    onView,
    onEdit,
    onToggleActivo,
}) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-12 text-slate-500">
                <Spinner size="sm" className="mr-2" />
                <span className="text-xs font-black uppercase tracking-wide">Cargando programaciones...</span>
            </div>
        );
    }

    if (!reglas.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
                <Icon name="event_repeat" size="md" className="text-slate-400" />
                <div>
                    <div className="text-sm font-black text-slate-700">Sin actividades recurrentes</div>
                    <p className="text-xs font-medium text-slate-500">Aun no hay plantillas recurrentes para estos filtros.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 pb-32">
            {reglas.map((regla) => (
                <article
                    key={regla.id}
                    className={`rounded-2xl border bg-white p-4 shadow-sm ${regla.archivadoAt || !regla.activo ? 'border-slate-100 opacity-75' : 'border-slate-200'}`}
                >
                    <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                                {regla.categoria || '-'}
                            </div>
                            <h3 className="truncate text-sm font-black uppercase text-slate-800">
                                {regla.titulo}
                            </h3>
                            <p className="line-clamp-2 text-xs font-semibold text-slate-500">
                                {regla.descripcion || regla.area || 'Sin area'}
                            </p>
                        </div>
                        <RecurrenteStatusBadge regla={regla} />
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-2">
                            <Icon name="person" size="14px" className="text-slate-400" />
                            <span className="line-clamp-1">{responsablesLabel(regla.responsables)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="sync" size="14px" className="text-slate-400" />
                            <span>{frecuenciaLabel(regla)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="calendar_today" size="14px" className="text-slate-400" />
                            <span>{fecha(regla.proximaFechaEjecucion)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="schedule" size="14px" className="text-slate-400" />
                            <span>{horarioODuracion(regla)}</span>
                        </div>
                    </div>

                    <div className="mt-3 border-t border-slate-100 pt-3">
                        <RecurrenteActions
                            regla={regla}
                            canManage={canManage}
                            submitting={submitting}
                            onView={onView}
                            onEdit={onEdit}
                            onToggleActivo={onToggleActivo}
                        />
                    </div>
                </article>
            ))}
        </div>
    );
};
