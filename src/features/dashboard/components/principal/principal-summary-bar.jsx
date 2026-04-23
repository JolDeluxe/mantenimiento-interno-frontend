import { SummaryBar, Skeleton } from '@/components/ui/z_index';

const ESTADOS = [
    { id: 'TODOS', label: 'Total del mes', color: 'gris' },
    { id: 'PENDIENTE', label: 'Pendiente', color: 'pendiente' },
    { id: 'ASIGNADA', label: 'Asignada', color: 'asignada' },
    { id: 'EN_PROGRESO', label: 'En Progreso', color: 'en_progreso' },
    { id: 'EN_PAUSA', label: 'En Pausa', color: 'en_pausa' },
    { id: 'RESUELTO', label: 'Resuelto', color: 'resuelto' },
    { id: 'CERRADO', label: 'Cerrado', color: 'cerrado' },
];

const SummarySkeleton = () => (
    <>
        <div className="hidden lg:grid grid-cols-7 gap-4 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col justify-center items-center py-4 px-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                    <Skeleton className="h-2.5 w-14 rounded-full mb-3" />
                    <Skeleton className="h-8 w-10 rounded-md" />
                </div>
            ))}
        </div>
        <div className="lg:hidden flex flex-col px-4 gap-3 mb-5">
            <div className="w-full">
                <div className="flex justify-between items-center w-full px-3 py-2.5 rounded-full bg-white border border-slate-200/80 shadow-sm">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-4 w-8 rounded-md" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center w-full px-3 py-2.5 rounded-full bg-white border border-slate-200/80 shadow-sm">
                        <Skeleton className="h-3 w-14 rounded-full" />
                        <Skeleton className="h-4 w-6 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    </>
);

export const PrincipalSummaryBar = ({ conteosPorEstado = {}, totalGeneradas = 0, loading = false }) => {
    if (loading) return <SummarySkeleton />;

    const items = ESTADOS.map(e => ({
        ...e,
        value: e.id === 'TODOS' ? totalGeneradas : (conteosPorEstado[e.id] ?? 0),
    }));

    // Sin onSelect → puramente informativo (no filtra)
    return <SummaryBar items={items} activeId={null} loading={false} />;
};