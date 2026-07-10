import { Icon } from '@/components/ui/z_index';

export const RecurrenteActions = ({
    regla,
    canManage,
    submitting,
    onView,
    onEdit,
    onToggleActivo,
    onMaterialize,
}) => (
    <div className="flex items-center justify-center gap-1.5">
        <button
            type="button"
            onClick={() => onView(regla)}
            className="inline-flex rounded-md p-1.5 text-slate-600 transition-colors hover:bg-slate-600/10"
            title="Ver detalle"
        >
            <Icon name="visibility" size="sm" />
        </button>

        {canManage && (
            <>
                <button
                    type="button"
                    onClick={() => onEdit(regla)}
                    disabled={submitting}
                    className="inline-flex rounded-md p-1.5 text-amber-500 transition-colors hover:bg-amber-500/10 disabled:opacity-50"
                    title="Editar regla"
                >
                    <Icon name="edit" size="sm" />
                </button>
                <button
                    type="button"
                    onClick={() => onToggleActivo(regla)}
                    disabled={submitting}
                    className={`inline-flex rounded-md p-1.5 transition-colors disabled:opacity-50 ${
                        regla.activo
                            ? 'text-red-700 hover:bg-red-500/10'
                            : 'text-estado-resuelto hover:bg-estado-resuelto/10'
                    }`}
                    title={regla.activo ? 'Pausar regla' : 'Activar regla'}
                >
                    <Icon name={regla.activo ? 'pause_circle' : 'play_circle'} size="sm" />
                </button>
                {regla.activo && (
                    <button
                        type="button"
                        onClick={() => onMaterialize(regla)}
                        disabled={submitting}
                        className="inline-flex rounded-md p-1.5 text-estado-asignada transition-colors hover:bg-estado-asignada/10 disabled:opacity-50"
                        title="Generar mantenimiento"
                    >
                        <Icon name="bolt" size="sm" />
                    </button>
                )}
            </>
        )}
    </div>
);
