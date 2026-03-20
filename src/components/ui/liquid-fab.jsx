import LiquidGlass from 'liquid-glass-react';
import { Icon } from './icon';
import { cn } from '@/utils/cn';

/**
 * Botón de acción flotante con efecto Liquid Glass estilo iOS.
 *
 * Props:
 *   icon            → nombre del ícono Material Symbols
 *   onClick         → handler de click
 *   disabled        → boolean
 *   isLoading       → boolean (muestra spinner girando)
 *   bottom          → rem units como string "5" = bottom-5 (default)
 *   right           → rem units como string "5" = right-5 (default)
 *   left            → rem units como string (opcional, sobreescribe right)
 *   size            → tamaño del botón en px (default 56)
 *   displacementScale → intensidad del efecto (default 60)
 *   blurAmount      → nivel de frost (default 0.07)
 *   saturation      → saturación (default 140)
 *   zIndex          → z-index del contenedor (default 50)
 *   className       → clases extra para el wrapper
 */
export const LiquidFab = ({
    icon,
    onClick,
    disabled = false,
    isLoading = false,
    bottom = '5',   // rem * 4 → bottom-5 = 20px... pasamos como px
    right,
    left,
    size = 56,
    displacementScale = 60,
    blurAmount = 0.07,
    saturation = 140,
    zIndex = 50,
    className,
}) => {
    // Convertimos los rem-based shorthand a píxeles reales para inline style
    const positionStyle = {
        position: 'fixed',
        zIndex,
        bottom: bottom ? `${Number(bottom) * 4}px` : undefined,
        right: right ? `${Number(right) * 4}px` : undefined,
        left: left ? `${Number(left) * 4}px` : undefined,
    };

    return (
        <div style={positionStyle} className={cn('touch-none', className)}>
            <LiquidGlass
                cornerRadius={size}
                padding="0"
                displacementScale={disabled ? 0 : displacementScale}
                blurAmount={blurAmount}
                saturation={saturation}
                aberrationIntensity={1.5}
                elasticity={0.18}
                overLight={false}
                onClick={!disabled && !isLoading ? onClick : undefined}
                style={{
                    width: size,
                    height: size,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: disabled ? 0.45 : 1,
                    transition: 'opacity 0.2s',
                }}
            >
                <Icon
                    name={isLoading ? 'progress_activity' : icon}
                    size="md"
                    className={cn(
                        'text-white drop-shadow-sm select-none',
                        isLoading && 'animate-spin'
                    )}
                />
            </LiquidGlass>
        </div>
    );
};

/**
 * Versión pill para la paginación flotante con Liquid Glass.
 * Renderiza un contenedor horizontal con controles de paginación.
 *
 * Props:
 *   page          → página activa
 *   totalPages    → total de páginas
 *   totalItems    → registros totales (opcional, para label)
 *   onPageChange  → (newPage) => void
 *   loading       → boolean
 */
export const LiquidPaginationPill = ({
    page,
    totalPages,
    totalItems,
    onPageChange,
    loading = false,
}) => {
    if (!totalPages || totalPages <= 1) return null;

    const isFirst = page <= 1;
    const isLast = page >= totalPages;

    const goTo = (newPage) => {
        if (loading || newPage < 1 || newPage > totalPages) return;
        onPageChange(newPage);
    };

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 pb-2">
            <LiquidGlass
                cornerRadius={100}
                padding="8px 16px"
                displacementScale={50}
                blurAmount={0.06}
                saturation={140}
                aberrationIntensity={1}
                elasticity={0.12}
                overLight={false}
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => goTo(page - 1)}
                        disabled={isFirst || loading}
                        className="flex items-center justify-center w-7 h-7 rounded-full text-white active:scale-90 transition-all disabled:opacity-30"
                        aria-label="Página anterior"
                    >
                        <Icon name="chevron_left" size="sm" className="text-white" />
                    </button>

                    <div className="text-center min-w-16">
                        <p className="text-xs font-bold text-white leading-tight">
                            {page} / {totalPages}
                        </p>
                        {totalItems > 0 && (
                            <p className="text-[10px] text-white/70 leading-tight">
                                {totalItems} registros
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => goTo(page + 1)}
                        disabled={isLast || loading}
                        className="flex items-center justify-center w-7 h-7 rounded-full text-white active:scale-90 transition-all disabled:opacity-30"
                        aria-label="Página siguiente"
                    >
                        <Icon name="chevron_right" size="sm" className="text-white" />
                    </button>
                </div>
            </LiquidGlass>
        </div>
    );
};