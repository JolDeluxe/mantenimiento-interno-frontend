// src/features/common/forms/tareas/responsables/ResponsablesDesktopSection.jsx
import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { Label } from '@/components/form/z_index';
import { cn } from '@/utils/cn';
import { TecnicoDropdown } from './TecnicoDropdown';
import { TecnicoCartSelector } from './TecnicoCartSelector';

const DesktopTecnicoChip = ({ tecnico, onRemove }) => (
    <span className="inline-flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-full text-xs font-bold bg-marca-primario/10 text-marca-primario border border-marca-primario/20">
        {tecnico?.imagen ? (
            <img src={tecnico.imagen} alt={tecnico?.nombre} className="w-5 h-5 rounded-full object-cover" />
        ) : (
            <div className="w-5 h-5 rounded-full bg-marca-primario/20 flex items-center justify-center text-[10px]">
                {tecnico?.nombre?.charAt(0)}
            </div>
        )}
        <span className="pl-1 truncate max-w-[120px]">{tecnico?.nombre}</span>
        <button type="button" onClick={onRemove}
            className="flex items-center justify-center w-4 h-4 rounded-full bg-marca-primario/20 hover:bg-marca-primario/40 transition-colors cursor-pointer shrink-0">
            <Icon name="close" size="xs" />
        </button>
    </span>
);

export const ResponsablesDesktopSection = ({
    modoCarrito,
    error,
    disabled,
    isDropdownOpen,
    onDropdownToggle,
    tecnicos = [],
    tecnicoCartId,
    onTecnicoCartChange,
    deferCartClearSearch = false,
    responsables = [],
    tecnicoMapEdit = {},
    opcionesDisponiblesEdit = [],
    onAddTecnico,
    onRemoveTecnico,
}) => {
    const tecnicoCart = tecnicos.find(t => String(t.id) === String(tecnicoCartId));

    return (
        modoCarrito ? (
            <div className={cn(
                "p-3.5 rounded-xl border flex flex-col gap-3 transition-colors",
                error ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200"
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon name="engineering" size="sm" className={error ? "text-rose-500" : "text-slate-500"} />
                        <span className={cn("text-sm font-bold", error ? "text-rose-700" : "text-slate-700")}>
                            Técnico principal *
                        </span>
                    </div>
                </div>

                <TecnicoCartSelector
                    tecnicos={tecnicos}
                    value={tecnicoCartId}
                    onChange={onTecnicoCartChange}
                    disabled={disabled}
                    placeholder="Buscar y seleccionar técnico..."
                    deferClearSearch={deferCartClearSearch}
                />
                {error && (
                    <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                        <Icon name="error" size="xs" /> {error}
                    </p>
                )}

                {tecnicoCart && (() => {
                    const wl = tecnicoCart.workload;
                    const sinTareas = !wl || (wl.asignadas === 0 && wl.enProgreso === 0 && wl.enPausa === 0);
                    return (
                        <div className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs',
                            sinTareas
                                ? 'bg-estado-resuelto/5 border-estado-resuelto/20 text-estado-resuelto'
                               : 'bg-slate-100 border-slate-200 text-slate-600'
                        )}>
                            <Icon name={sinTareas ? 'check_circle' : 'assignment'} size="xs" className="shrink-0" />
                            {sinTareas ? (
                                <span><strong>{tecnicoCart.nombre}</strong> no tiene tareas activas — ideal para asignar.</span>
                            ) : (
                                <span>
                                    <strong>{tecnicoCart.nombre}</strong> tiene {(wl.asignadas + wl.enProgreso + wl.enPausa)} tarea(s) activa(s).
                                </span>
                            )}
                        </div>
                    );
                })()}
            </div>
        ) : (
            <div className={cn("flex flex-col gap-2 transition-[padding] duration-300", isDropdownOpen ? "pb-[260px]" : "pb-0")}>
                <Label error={!!error}>Técnicos asignados *</Label>
                <TecnicoDropdown
                    opciones={opcionesDisponiblesEdit}
                    onAdd={onAddTecnico}
                    disabled={disabled || opcionesDisponiblesEdit.length === 0}
                    onToggle={onDropdownToggle}
                />
                {error && <p className="text-[10px] text-rose-600 font-bold mt-1">{error}</p>}
                {responsables.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1 p-3 rounded-lg bg-slate-50 border border-slate-200 min-h-12">
                        {responsables.map(id => (
                            <DesktopTecnicoChip
                                key={id}
                                tecnico={tecnicoMapEdit[id]}
                                onRemove={() => onRemoveTecnico(id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-dashed border-slate-300 text-slate-400 text-xs italic min-h-12">
                        <Icon name="engineering" size="sm" /> Sin técnicos asignados
                    </div>
                )}
            </div>
        )
    );
};
