import { Icon } from '@/components/ui/z_index';
import { Label, Select } from '@/components/form/z_index';
import { buildOptionLabel } from './helpers';

const MobileTecnicoChip = ({ tecnico, onRemove }) => (
    <span className="inline-flex items-center gap-1.5 pl-1.5 pr-1 py-0.5 rounded-full text-xs font-bold bg-marca-primario/10 text-marca-primario border border-marca-primario/20">
        {tecnico?.imagen ? (
            <img src={tecnico.imagen} alt="" className="w-4 h-4 rounded-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/img/perfil-no-foto.webp'; }} />
        ) : (
            <div className="w-4 h-4 rounded-full bg-marca-primario/20 flex items-center justify-center text-[8px] font-black">
                {tecnico?.nombre?.charAt(0).toUpperCase() ?? '?'}
            </div>
        )}
        <span>{tecnico?.nombre ?? '…'}</span>
        <button
            type="button"
            onClick={onRemove}
            className="flex items-center justify-center w-4 h-4 rounded-full bg-marca-primario/20 hover:bg-marca-primario/40 transition-colors cursor-pointer"
        >
            <Icon name="close" size="xs" />
        </button>
    </span>
);

export const ResponsablesMobileSection = ({
    responsables,
    opcionesDisponibles,
    tecnicoMap,
    disabled,
    onAddTecnico,
    onRemoveTecnico,
}) => (
    <div className="flex flex-col gap-2">
        <Label htmlFor="tf-tecnicos-add">Técnicos asignados (opcional)</Label>

        <Select
            id="tf-tecnicos-add"
            value=""
            onChange={(e) => onAddTecnico(e.target.value)}
            disabled={disabled || opcionesDisponibles.length === 0}
        >
            <option value="" disabled hidden>
                {opcionesDisponibles.length === 0 ? 'Todos asignados' : 'Seleccionar técnico…'}
            </option>
            {opcionesDisponibles.map((t) => (
                <option key={t.id} value={String(t.id)}>
                    {buildOptionLabel(t)}
                </option>
            ))}
        </Select>

        {responsables.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80 min-h-12">
                {responsables.map((id) => (
                    <MobileTecnicoChip
                        key={id}
                        tecnico={tecnicoMap[id]}
                        onRemove={() => onRemoveTecnico(id)}
                    />
                ))}
            </div>
        ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-dashed border-slate-250 text-slate-400 text-xs italic min-h-12">
                <Icon name="engineering" size="sm" />
                Sin técnicos asignados (la tarea quedará PENDIENTE)
            </div>
        )}
    </div>
);
