// src/features/tickets/components/historico/ticket-summary-bar.jsx
import { SummaryBar, Skeleton } from '@/components/ui/z_index';

const ESTADOS_ACTIVOS = [
    { id: 'TODOS', label: 'Total', color: 'gris' },
    { id: 'PENDIENTE', label: 'Pendiente', color: 'pendiente' },
    { id: 'ASIGNADA', label: 'Asignada', color: 'asignada' },
    { id: 'EN_PROGRESO', label: 'En Progreso', color: 'en_progreso' },
    { id: 'EN_PAUSA', label: 'En Pausa', color: 'en_pausa' },
    { id: 'RESUELTO', label: 'Resuelto', color: 'resuelto' },
    { id: 'CERRADO', label: 'Cerrado', color: 'cerrado' },
];

// Estados que nunca forman parte del total "activo"
const ESTADOS_EXCLUIDOS_DEL_TOTAL = ['RECHAZADO', 'CANCELADA'];

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

export const TicketSummaryBar = ({
    totalParaSummary,
    conteos = {},
    filtroActual,
    onFilterChange,
    loading,
    mostrarPapelera,
    mostrarRechazadas,
}) => {
    if (loading && totalParaSummary === 0 && Object.keys(conteos).length === 0) {
        const count = mostrarRechazadas ? 1 : mostrarPapelera ? 1 : 7;
        return <SummaryBarSkeleton count={count} />;
    }

    // ── Vista Rechazadas ───────────────────────────────────────────────
    if (mostrarRechazadas) {
        return (
            <SummaryBar
                items={[{ id: 'RECHAZADO', label: 'Total Rechazadas', value: conteos['RECHAZADO'] ?? 0, color: 'rojo' }]}
                activeId="RECHAZADO"
                onSelect={() => { }}
                loading={loading}
            />
        );
    }

    // ── Vista Papelera ─────────────────────────────────────────────────
    if (mostrarPapelera) {
        return (
            <SummaryBar
                items={[{ id: 'CANCELADA', label: 'Total Canceladas', value: conteos['CANCELADA'] ?? 0, color: 'cancelada' }]}
                activeId="CANCELADA"
                onSelect={() => { }}
                loading={loading}
            />
        );
    }

    // ── Vista Normal: solo estados activos ─────────────────────────────
    // El total excluye explícitamente RECHAZADO y CANCELADA
    const totalActivo = ESTADOS_ACTIVOS
        .filter((e) => e.id !== 'TODOS' && !ESTADOS_EXCLUIDOS_DEL_TOTAL.includes(e.id))
        .reduce((acc, e) => acc + (conteos[e.id] ?? 0), 0);

    const items = ESTADOS_ACTIVOS.map((e) => ({
        ...e,
        value: e.id === 'TODOS' ? totalActivo : (conteos[e.id] ?? 0),
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