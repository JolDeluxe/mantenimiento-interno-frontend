import { Icon } from '@/components/ui/z_index';

export const RecurrenteActions = ({
    regla,
    canManage,
    submitting,
    onView,
    onEdit,
    onToggleActivo,
    onCancel,
    onRestore,
}) => (
    <div className="flex items-center justify-center gap-1.5">
        <button
            type="button"
            onClick={() => onView(regla)}
            className="inline-flex rounded-md p-1.5 text-slate-600 transition-colors hover:bg-slate-600/10"
            title="Ver detalle"
            aria-label="Ver detalle"
        >
            <Icon name="visibility" size="sm" />
        </button>

        {canManage && (
            regla.archivadoAt ? (
                <button
                    type="button"
                    onClick={() => onRestore(regla)}
                    disabled={submitting}
                    className="inline-flex rounded-md p-1.5 text-estado-resuelto transition-colors hover:bg-estado-resuelto/10 disabled:opacity-50"
                    title="Restaurar recurrencia"
                    aria-label="Restaurar recurrencia"
                >
                    <Icon name="restore" size="sm" />
                </button>
            ) : (
            <>
                <button
                    type="button"
                    onClick={() => onEdit(regla)}
                    disabled={submitting}
                    className="inline-flex rounded-md p-1.5 text-amber-500 transition-colors hover:bg-amber-500/10 disabled:opacity-50"
                    title="Editar regla"
                    aria-label="Editar regla"
                >
                    <Icon name="edit" size="sm" />
                </button>
                <button
                    type="button"
                    onClick={() => onToggleActivo(regla)}
                    disabled={submitting}
                    className={`inline-flex rounded-md p-1.5 transition-colors disabled:opacity-50 ${
                        regla.activo
                            ? 'text-amber-700 hover:bg-amber-500/10'
                            : 'text-estado-resuelto hover:bg-estado-resuelto/10'
                    }`}
                    title={regla.activo ? 'Pausar recurrencia' : 'Reactivar recurrencia'}
                    aria-label={regla.activo ? 'Pausar recurrencia' : 'Reactivar recurrencia'}
                >
                    <Icon name={regla.activo ? 'pause_circle' : 'play_circle'} size="sm" />
                </button>
                <button
                    type="button"
                    onClick={() => onCancel(regla)}
                    disabled={submitting}
                    className="inline-flex rounded-md p-1.5 text-red-700 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                    title="Cancelar recurrencia"
                    aria-label="Cancelar recurrencia"
                >
                    <Icon name="archive" size="sm" />
                </button>
            </>
            )
        )}
    </div>
);
