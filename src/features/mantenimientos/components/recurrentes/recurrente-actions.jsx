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
    <div className="flex items-center gap-1.5">
        <button
            type="button"
            onClick={() => onView(regla)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            title="Ver detalle"
        >
            <Icon name="visibility" size="16px" />
        </button>

        {canManage && (
            <>
                <button
                    type="button"
                    onClick={() => onEdit(regla)}
                    disabled={submitting}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    title="Editar regla"
                >
                    <Icon name="edit" size="16px" />
                </button>
                <button
                    type="button"
                    onClick={() => onToggleActivo(regla)}
                    disabled={submitting}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-50 ${
                        regla.activo
                            ? 'border-red-100 bg-white text-red-600 hover:bg-red-50'
                            : 'border-emerald-100 bg-white text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={regla.activo ? 'Pausar regla' : 'Activar regla'}
                >
                    <Icon name={regla.activo ? 'pause' : 'play_arrow'} size="16px" />
                </button>
                {regla.activo && (
                    <button
                        type="button"
                        onClick={() => onMaterialize(regla)}
                        disabled={submitting}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-marca-primario/20 bg-marca-primario/10 px-2 text-[10px] font-black uppercase tracking-wide text-marca-primario hover:bg-marca-primario/15 disabled:opacity-50"
                        title="Materializar ciclo actual o vencido"
                    >
                        <Icon name="bolt" size="14px" />
                        Generar
                    </button>
                )}
            </>
        )}
    </div>
);
