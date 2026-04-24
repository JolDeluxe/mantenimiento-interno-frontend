// src/features/dashboard/components/general/general-kpi-card.jsx
import { Icon, Skeleton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const MAPA_COLORES = {
    verde: {
        base: 'bg-emerald-50/50 border-emerald-200/60 text-emerald-700',
        icono: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200',
        sufijo: 'text-emerald-500',
        hover: 'hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-100/50'
    },
    ambar: {
        base: 'bg-amber-50/50 border-amber-200/60 text-amber-700',
        icono: 'bg-amber-100 text-amber-600 group-hover:bg-amber-200',
        sufijo: 'text-amber-500',
        hover: 'hover:bg-amber-50 hover:border-amber-400 hover:shadow-md hover:shadow-amber-100/50'
    },
    rojo: {
        base: 'bg-red-50/50 border-red-200/60 text-red-700',
        icono: 'bg-red-100 text-red-600 group-hover:bg-red-200',
        sufijo: 'text-red-500',
        hover: 'hover:bg-red-50 hover:border-red-400 hover:shadow-md hover:shadow-red-100/50'
    },
    neutral: {
        base: 'bg-slate-50/50 border-slate-200 text-slate-700',
        icono: 'bg-slate-100 text-slate-500 group-hover:bg-slate-200',
        sufijo: 'text-slate-400',
        hover: 'hover:bg-slate-100/80 hover:border-slate-300 hover:shadow-sm'
    },
};

const NORMALIZAR_COLOR = {
    green: 'verde',
    emerald: 'verde',
    amber: 'ambar',
    red: 'rojo',
    neutral: 'neutral',
    verde: 'verde',
    ambar: 'ambar',
    rojo: 'rojo'
};

export const TarjetaKpi = ({
    icono,
    etiqueta,
    valor,
    sufijo = '%',
    color = 'neutral',
    datosSuficientes = true,
    cargando = false,
    notaPie,
}) => {
    const colorTraducido = NORMALIZAR_COLOR[color] || 'neutral';
    const estilo = MAPA_COLORES[colorTraducido] || MAPA_COLORES.neutral;

    const isEmpty = valor === null || valor === undefined || valor === 'N/A' || valor === '';

    if (cargando) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[130px]">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded-xl" />
                </div>
                <Skeleton className="h-10 w-24 rounded-lg mt-4" />
            </div>
        );
    }

    return (
        <div className={cn(
            'group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 ease-out h-full',
            isEmpty ? MAPA_COLORES.neutral.base : estilo.base,
            !isEmpty && estilo.hover,
            (!datosSuficientes || isEmpty) && 'opacity-80 border-dashed border-2'
        )}>
            {/* Header: Etiqueta y el Icono en caja sólida */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500/80 group-hover:text-slate-600 transition-colors">
                    {etiqueta}
                </span>
                <div className={cn(
                    "h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-300 shadow-sm",
                    isEmpty ? MAPA_COLORES.neutral.icono : estilo.icono
                )}>
                    <Icon name={icono} size="sm" />
                </div>
            </div>

            {/* Main Value */}
            <div className="flex items-baseline gap-1">
                <span className={cn(
                    "text-4xl font-black tracking-tighter transition-transform duration-300 group-hover:scale-[1.02] origin-left",
                    isEmpty ? "text-slate-300 font-sans" : "text-slate-800 font-mono"
                )}>
                    {isEmpty ? '—' : valor}
                </span>
                {!isEmpty && sufijo && (
                    <span className={cn('text-sm font-bold', estilo.sufijo)}>
                        {sufijo}
                    </span>
                )}
            </div>

            {/* Footer: Notas y Alertas */}
            <div className="mt-4 min-h-[1.5rem]">
                {!datosSuficientes && !isEmpty ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 border border-amber-200 text-[9px] font-bold text-amber-700 uppercase tracking-tighter shadow-sm">
                        <Icon name="warning" size="xs" />
                        Muestra insuficiente
                    </div>
                ) : (
                    notaPie && !isEmpty && (
                        <div className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors uppercase tracking-tight">
                            {notaPie}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};