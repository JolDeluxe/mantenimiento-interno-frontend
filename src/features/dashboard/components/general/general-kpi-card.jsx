// src/features/dashboard/components/general/general-kpi-card.jsx
import { Icon, Skeleton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const MAPA_COLORES = {
    verde: {
        acentoPill: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        textoDestacado: 'text-emerald-600',
        lineaSuperior: 'bg-emerald-400',
    },
    ambar: {
        acentoPill: 'bg-amber-50 text-amber-600 border border-amber-100',
        textoDestacado: 'text-amber-600',
        lineaSuperior: 'bg-amber-400',
    },
    rojo: {
        acentoPill: 'bg-red-50 text-red-600 border border-red-100',
        textoDestacado: 'text-red-600',
        lineaSuperior: 'bg-red-400',
    },
    neutral: {
        acentoPill: 'bg-slate-50 text-slate-500 border border-slate-200',
        textoDestacado: 'text-slate-500',
        lineaSuperior: 'bg-slate-300',
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

    // 🚨 REGLA: Detectar ausencia real de métricas
    const isEmpty = valor === null || valor === undefined || valor === 'N/A' || valor === '';

    if (cargando) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-3 w-24 rounded-full" />
                </div>
                <Skeleton className="h-10 w-20 rounded-md mt-1" />
            </div>
        );
    }

    return (
        <div className={cn(
            'bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-3 relative overflow-hidden transition-all',
            (!datosSuficientes || isEmpty) && 'opacity-80 border-dashed border-2 border-slate-300'
        )}>
            <div className={cn("absolute top-0 left-0 w-full h-1", estilo.lineaSuperior)} />

            <div className="flex items-center gap-3">
                <div className={cn('h-10 w-10 flex items-center justify-center rounded-xl', estilo.acentoPill)}>
                    <Icon name={icono} size="sm" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    {etiqueta}
                </span>
            </div>

            <div className="flex items-baseline gap-1.5 mt-1">
                <span className={cn(
                    "text-4xl font-black font-mono tracking-tight leading-none",
                    isEmpty ? "text-slate-300" : "text-slate-800"
                )}>
                    {isEmpty ? '—' : valor}
                </span>
                {!isEmpty && sufijo && (
                    <span className={cn('text-lg font-bold', estilo.textoDestacado)}>
                        {sufijo}
                    </span>
                )}
            </div>

            {notaPie && !isEmpty && (
                <p className="text-[10px] text-slate-400 font-medium">{notaPie}</p>
            )}

            {!datosSuficientes && !isEmpty && (
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
                    <Icon name="warning" size="xs" />
                    Muestra insuficiente
                </div>
            )}
        </div>
    );
};