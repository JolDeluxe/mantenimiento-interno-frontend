import { useMemo } from 'react';
import { GlassPill, GlassIconChip } from '@/components/ui/z_index';

export const MobileUserFilterChips = ({
    currentUser,
    departamentos,
    mostrarInactivos,
    onToggleInactivos,
    filtroDepto,
    onDeptoChange,
    isMttoFilter,
    onToggleMttoFilter,
}) => {
    const esSuperAdmin = currentUser?.rol === 'SUPER_ADMIN';

    const deptoOptions = useMemo(
        () => departamentos?.map((d) => ({ value: d.id, label: d.nombre })) || [],
        [departamentos]
    );

    return (
        <div className="flex items-center gap-2">
            {esSuperAdmin && (
                <GlassPill>
                    {!filtroDepto && (
                        <GlassIconChip
                            icon="construction"
                            isActive={isMttoFilter}
                            variant="primary"
                            onClick={onToggleMttoFilter}
                        />
                    )}

                    {!isMttoFilter && (
                        <div className="relative">
                            <GlassIconChip
                                icon={filtroDepto ? 'close' : 'business'}
                                isActive={Boolean(filtroDepto)}
                                variant="primary"
                                onClick={() => filtroDepto && onDeptoChange(null)}
                            />
                            {!filtroDepto && (
                                <select
                                    value=""
                                    onChange={(e) => onDeptoChange(e.target.value || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                >
                                    <option value="" disabled>Departamentos...</option>
                                    {deptoOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                </GlassPill>
            )}

            <GlassPill>
                <GlassIconChip
                    icon={mostrarInactivos ? 'person_check' : 'person_off'}
                    isActive={mostrarInactivos}
                    variant="danger"
                    onClick={onToggleInactivos}
                />
            </GlassPill>
        </div>
    );
};