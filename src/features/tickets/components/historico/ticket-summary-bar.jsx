// src/features/tickets/components/historico/ticket-summary-bar.jsx
import { SummaryBar, Skeleton } from '@/components/ui/z_index';

/**
 * Estados activos — aparecen en la barra principal de filtros.
 * CANCELADA y RECHAZADO van al toggle de "papelera" (vista separada).
 */
const ESTADOS_ACTIVOS = [
    { id: 'TODOS', label: 'Total', color: 'gris' },
    { id: 'PENDIENTE', label: 'Pendiente', color: 'ambar' },
    { id: 'ASIGNADA', label: 'Asignada', color: 'azul' },
    { id: 'EN_PROGRESO', label: 'En Progreso', color: 'indigo' },
    { id: 'EN_PAUSA', label: 'En Pausa', color: 'gris' },
    { id: 'RESUELTO', label: 'Resuelto', color: 'esmeralda' },
    { id: 'CERRADO', label: 'Cerrado', color: 'por_defecto' },
];

/**
 * Vista de papelera — CANCELADA + RECHAZADO en sus propias pastillas.
 */
const ESTADOS_PAPELERA = [
    { id: 'CANCELADA', label: 'Canceladas', color: 'rojo' },
    { id: 'RECHAZADO', label: 'Rechazados', color: 'rosa' },
];

const SummaryBarSkeleton = ({ count }) => (
    <>
        <div className={`hidden lg:grid gap-4 mb-4 grid-cols-${Math.min(count, 7)}`}>
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

/**
 * Props:
 *   total              → número total (según vista activa)
 *   conteos            → { PENDIENTE: n, ASIGNADA: n, ..., CANCELADA: n, RECHAZADO: n }
 *   filtroActual       → 'TODOS' | EstadoTarea
 *   onFilterChange     → (id: string) => void
 *   loading            → boolean
 *   mostrarPapelera    → boolean — true = muestra CANCELADA + RECHAZADO, false = muestra estados activos
 */
export const TicketSummaryBar = ({
    total,
    conteos = {},
    filtroActual,
    onFilterChange,
    loading,
    mostrarPapelera,
}) => {
    if (loading && total === 0 && Object.keys(conteos).length === 0) {
        return <SummaryBarSkeleton count={mostrarPapelera ? 2 : 7} />;
    }

    // ── Vista papelera: CANCELADA + RECHAZADO ──────────────────────────────
    if (mostrarPapelera) {
        const totalPapelera = (conteos['CANCELADA'] ?? 0) + (conteos['RECHAZADO'] ?? 0);
        const items = [
            { id: 'PAPELERA', label: 'Total papelera', value: totalPapelera, color: 'rojo' },
            { id: 'CANCELADA', label: 'Canceladas', value: conteos['CANCELADA'] ?? 0, color: 'rojo' },
            { id: 'RECHAZADO', label: 'Rechazados', value: conteos['RECHAZADO'] ?? 0, color: 'rosa' },
        ];
        return (
            <SummaryBar
                items={items}
                activeId={filtroActual ?? 'PAPELERA'}
                onSelect={onFilterChange}
                loading={loading}
            />
        );
    }

    // ── Vista normal: estados activos ──────────────────────────────────────
    const totalReal = total ?? ESTADOS_ACTIVOS
        .filter((e) => e.id !== 'TODOS')
        .reduce((a, e) => a + (conteos[e.id] ?? 0), 0);

    const items = ESTADOS_ACTIVOS.map((e) => ({
        ...e,
        value: e.id === 'TODOS' ? totalReal : (conteos[e.id] ?? 0),
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