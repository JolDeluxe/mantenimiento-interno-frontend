// src/features/tickets/components/hoy/hoy-summary-bar.jsx
import { SummaryBar, Skeleton } from '@/components/ui/z_index';

const ESTADOS_ACTIVOS = [
    { id: 'TODOS', label: 'Total', color: 'gris' },
    { id: 'ASIGNADA', label: 'Asignada', color: 'asignada' },
    { id: 'EN_PROGRESO', label: 'En Progreso', color: 'en_progreso' },
    { id: 'EN_PAUSA', label: 'En Pausa', color: 'en_pausa' },
    { id: 'RESUELTO', label: 'Resuelto', color: 'resuelto' },
];

const SummaryBarSkeleton = ({ count }) => (
    <>
        <div className={`hidden lg:grid gap-4 mb-4 grid-cols-${Math.min(count, 5)}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col justify-center items-center py-4 px-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                    <Skeleton className="h-2.5 w-16 rounded-full mb-3" />
                    <Skeleton className="h-9 w-12 rounded-md" />
                </div>
            ))}
        </div>

        <div className="lg:hidden flex flex-col px-4 gap-3 mb-5">
            <div className="w-full">
                <div className="flex justify-between items-center w-full px-3 py-2.5 rounded-full bg-white border border-slate-200/80 shadow-sm">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="h-4 w-8 rounded-md" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
                {Array.from({ length: count - 1 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center w-full px-3 py-2.5 rounded-full bg-white border border-slate-200/80 shadow-sm">
                        <Skeleton className="h-3 w-12 rounded-full" />
                        <Skeleton className="h-4 w-6 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    </>
);

export const HoySummaryBar = ({
    totalParaSummary,
    conteos = {},
    filtroActual,
    onFilterChange,
    loading,
}) => {
    if (loading && totalParaSummary === 0 && Object.keys(conteos).length === 0) {
        return <SummaryBarSkeleton count={5} />;
    }

    const items = ESTADOS_ACTIVOS.map((e) => ({
        ...e,
        value: e.id === 'TODOS' ? totalParaSummary : (conteos[e.id] ?? 0),
    }));

    return (
        <SummaryBar
            items={items}
            activeId={filtroActual ?? 'TODOS'}
            onSelect={onFilterChange}
            loading={loading}
        />
    );
};