// src/features/usuarios/components/user-summary-bar.jsx
import { useMemo } from 'react';
import { SummaryBar, Skeleton } from '@/components/ui/z_index';

const ROLES_MTTO = new Set(['SUPER_ADMIN', 'CLIENTE_INTERNO']);
const ROLES_NO_MTTO = new Set(['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO', 'TODOS']);
const ROLES_JEFE = new Set(['TODOS', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO']);

// Replica exacta del chip desktop: py-4 px-3 rounded-2xl, label 11px, valor 3xl
const SummaryBarSkeleton = ({ count = 6 }) => {
    const gridClass = {
        1: 'grid-cols-1 max-w-xs mx-auto',
        2: 'grid-cols-2 max-w-xl mx-auto',
        3: 'grid-cols-3 max-w-3xl mx-auto',
        4: 'grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
        6: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
    }[count] || 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6';

    return (
        <>
            {/* Desktop */}
            <div className={`hidden lg:grid gap-4 mb-4 ${gridClass}`}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex flex-col justify-center items-center py-4 px-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                        <Skeleton className="h-[11px] w-16 rounded-full mb-3" />
                        <Skeleton className="h-9 w-12 rounded-md" />
                    </div>
                ))}
            </div>
            {/* Mobile */}
            <div className="lg:hidden flex flex-col items-center px-4 space-y-3 mb-5">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center w-full max-w-[16rem] px-5 py-2.5 rounded-full bg-white border border-slate-200/80 shadow-sm">
                        <Skeleton className="h-3 w-16 rounded-full" />
                        <Skeleton className="h-4 w-8 rounded-md" />
                    </div>
                ))}
            </div>
        </>
    );
};

export const UserSummaryBar = ({
    currentUser,
    total,
    conteos = {},
    filtroActual,
    onFilterChange,
    loading,
    mostrarInactivos,
    isMttoFilter,
    filtroDepto,
    departamentos,
}) => {
    const rol = currentUser?.rol;

    if (rol !== 'SUPER_ADMIN' && rol !== 'JEFE_MTTO') return null;

    if (loading && total === 0 && Object.keys(conteos).length === 0) {
        const count = rol === 'JEFE_MTTO' ? 4 : mostrarInactivos ? 1 : 6;
        return <SummaryBarSkeleton count={count} />;
    }

    const totalReal = total || Object.values(conteos).reduce((acc, v) => acc + (v || 0), 0);

    if (mostrarInactivos) {
        return (
            <SummaryBar
                items={[{ id: 'INACTIVOS', label: 'Total Inactivos', value: totalReal, color: 'rojo' }]}
                activeId="INACTIVOS"
                onSelect={() => { }}
                loading={loading}
                separateFirstMobile={true}
            />
        );
    }

    const deptoSeleccionado = useMemo(
        () => departamentos?.find(d => String(d.id) === String(filtroDepto)),
        [departamentos, filtroDepto]
    );

    const esDeptoMantenimiento = isMttoFilter ||
        (deptoSeleccionado?.nombre?.toLowerCase().includes('mantenimiento') ?? false);

    const esOtroDepto = !!filtroDepto && !esDeptoMantenimiento;

    const allItems = [
        { id: 'TODOS', label: 'Total', value: totalReal, color: 'gris' },
        { id: 'SUPER_ADMIN', label: 'Super Admin', value: conteos['SUPER_ADMIN'] || 0, color: 'esmeralda' },
        { id: 'JEFE_MTTO', label: 'Jefe Mtto', value: conteos['JEFE_MTTO'] || 0, color: 'amarillo' },
        { id: 'COORDINADOR_MTTO', label: 'Coordinador', value: conteos['COORDINADOR_MTTO'] || 0, color: 'indigo' },
        { id: 'TECNICO', label: 'Técnico', value: conteos['TECNICO'] || 0, color: 'azul' },
        { id: 'CLIENTE_INTERNO', label: 'Cliente', value: conteos['CLIENTE_INTERNO'] || 0, color: 'rosa' },
    ];

    const items = allItems.filter(({ id }) => {
        if (rol === 'SUPER_ADMIN') {
            if (esDeptoMantenimiento) return !ROLES_MTTO.has(id);
            if (esOtroDepto) return !ROLES_NO_MTTO.has(id);
            return true;
        }
        if (rol === 'JEFE_MTTO') return ROLES_JEFE.has(id);
        return false;
    });

    const visibleIds = new Set(items.map(i => i.id));
    const activeId = visibleIds.has(filtroActual) ? filtroActual : 'TODOS';

    return (
        <SummaryBar
            items={items}
            activeId={activeId}
            onSelect={onFilterChange}
            loading={loading}
            separateFirstMobile={true}
        />
    );
};