import { Button, Icon } from '@/components/ui/z_index';

export const RecurrentesToolbar = ({
    query,
    onQueryChange,
    activo,
    onActivoChange,
    onRefresh,
    onCreate,
    canManage,
    loading,
}) => (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-800">
                <Icon name="event_repeat" className="text-marca-primario" />
                Plan recurrente
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
                Reglas preventivas por maquina. No son tickets; generan ciclos.
            </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Buscar regla, maquina o responsable"
                className="min-w-[240px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-marca-primario"
            />
            <select
                value={activo}
                onChange={(event) => onActivoChange(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-marca-primario"
            >
                <option value="true">Activas</option>
                <option value="false">Pausadas</option>
                <option value="">Todas</option>
            </select>
            <Button type="button" variant="light" icon="refresh" onClick={onRefresh} disabled={loading}>
                Actualizar
            </Button>
            {canManage && (
                <Button type="button" variant="primario" icon="add" onClick={onCreate}>
                    Crear regla
                </Button>
            )}
        </div>
    </div>
);
