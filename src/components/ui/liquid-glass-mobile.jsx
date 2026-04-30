import { Icon } from './icon';
import { cn } from '@/utils/cn';

// ── Tokens de variantes ────────────────────────────────────────────────────
const GLASS_VARIANTS = {
    primary: { bg: 'rgba(72, 43, 44, 0.78)', shadow: '0 12px 36px rgba(72,43,44,0.40), 0 2px 8px rgba(72,43,44,0.20)' },
    neutral: { bg: 'rgba(100, 116, 139, 0.62)', shadow: '0 10px 30px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12)' },
    action: { bg: 'rgba(59, 130, 246, 0.72)', shadow: '0 10px 30px rgba(59,130,246,0.35), 0 2px 6px rgba(59,130,246,0.18)' },
    success: { bg: 'rgba(16, 185, 129, 0.70)', shadow: '0 10px 30px rgba(16,185,129,0.32), 0 2px 6px rgba(16,185,129,0.16)' },
    danger: { bg: 'rgba(220, 38, 38, 0.72)', shadow: '0 10px 30px rgba(220,38,38,0.30), 0 2px 6px rgba(220,38,38,0.16)' },
    light: { bg: 'rgba(255, 255, 255, 0.45)', shadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)' },
    // NUEVA VARIANTE SURFACE: Especial para Headers y Bottom Navs anclados.
    surface: { bg: 'rgba(235, 227, 218, 0.75)', shadow: '0 -8px 30px rgba(0,0,0,0.06)' },
};

export const glassBase = (variant = 'primary') => {
    const v = GLASS_VARIANTS[variant] || GLASS_VARIANTS.primary;
    const isSurface = variant === 'surface';

    return {
        background: v.bg,
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',

        // Desglose estricto de bordes para evitar la advertencia de colisión en React
        borderTop: isSurface ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.32)',
        borderRight: isSurface ? 'none' : '1px solid rgba(255,255,255,0.32)',
        borderBottom: isSurface ? 'none' : '1px solid rgba(255,255,255,0.32)',
        borderLeft: isSurface ? 'none' : '1px solid rgba(255,255,255,0.32)',

        boxShadow: isSurface
            ? `${v.shadow}, 0 1px 0 rgba(255,255,255,0.48) inset`
            : `${v.shadow}, 0 1px 0 rgba(255,255,255,0.48) inset, 0 -1px 0 rgba(0,0,0,0.08) inset`,
    };
};

export const GlassSheen = () => (
    <div
        aria-hidden="true"
        style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background: 'linear-gradient(148deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 60%)',
            pointerEvents: 'none',
        }}
    />
);

export const GlassPill = ({ children, className }) => (
    <div
        className={cn('inline-flex p-1 rounded-2xl gap-1 relative overflow-hidden shrink-0', className)}
        style={{
            backdropFilter: 'blur(16px) saturate(140%)',
            WebkitBackdropFilter: 'blur(16px) saturate(140%)',
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.30)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.45) inset'
        }}
    >
        {children}
    </div>
);

export const GlassIconChip = ({ icon, isActive, variant = 'primary', onClick }) => {
    const activeStyle = {
        ...glassBase(variant),
        borderRadius: 10,
        position: 'relative',
        overflow: 'hidden',
    };

    const inactiveStyle = {
        ...glassBase('light'),
        borderRadius: 10,
        position: 'relative',
        overflow: 'hidden',
    };

    return (
        <button
            onClick={onClick}
            style={isActive ? activeStyle : inactiveStyle}
            className="flex items-center justify-center w-8 h-8 transition-all duration-200 active:scale-90 outline-none select-none shrink-0"
        >
            <GlassSheen />
            <Icon
                name={icon}
                size="xs"
                className={cn('relative z-10 transition-colors', isActive ? 'text-white' : 'text-slate-600')}
            />
        </button>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// GlassFab
// ─────────────────────────────────────────────────────────────────────────────
export const GlassFab = ({
    icon,
    onClick,
    disabled = false,
    isLoading = false,
    variant = 'primary',
    size = 56,
    bottom = '96px',
    right = '20px',
    left,
    zIndex = 50,
    className,
}) => {
    const style = {
        position: 'fixed',
        bottom,
        zIndex,
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.15s ease, opacity 0.2s',
        opacity: disabled ? 0.45 : 1,
        ...(left ? { left } : { right }),
        ...glassBase(variant),
    };

    return (
        <button
            onClick={!disabled && !isLoading ? onClick : undefined}
            disabled={disabled || isLoading}
            style={style}
            className={cn(
                'active:scale-90 transition-transform select-none outline-none overflow-hidden',
                className
            )}
            aria-label={icon}
        >
            <GlassSheen />
            <Icon
                name={isLoading ? 'progress_activity' : icon}
                size="md"
                className={cn('text-white drop-shadow-sm relative z-10', isLoading && 'animate-spin')}
                weight={500}
            />
        </button>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// GlassPaginationPill
// ─────────────────────────────────────────────────────────────────────────────
export const GlassPaginationPill = ({
    page,
    totalPages,
    totalItems,
    onPageChange,
    loading = false,
    bottom = '100px', // Ajustado predeterminadamente para esquivar el BottomNav
    zIndex = 40,
}) => {
    if (!totalPages || totalPages <= 1) return null;

    const isFirst = page <= 1;
    const isLast = page >= totalPages;

    const goTo = (newPage) => {
        if (loading || newPage < 1 || newPage > totalPages) return;
        onPageChange(newPage);
    };

    const innerStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 18px',
        borderRadius: '100px',
        position: 'relative',
        overflow: 'hidden',
        ...glassBase('primary'),
        boxShadow: `
      0 14px 44px rgba(72,43,44,0.38),
      0 4px 12px rgba(72,43,44,0.18),
      0 1px 0 rgba(255,255,255,0.48) inset,
      0 -1px 0 rgba(0,0,0,0.10) inset
    `,
    };

    const navBtnStyle = (isDisabled) => ({
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: isDisabled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)',
        border: '1px solid rgba(255,255,255,0.28)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled ? 0.35 : 1,
        transition: 'transform 0.12s ease, opacity 0.15s',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
    });

    return (
        <div style={{ position: 'fixed', bottom, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex, paddingBottom: '8px', transition: 'bottom 0.3s ease' }}>
            <div style={innerStyle}>
                <GlassSheen />
                <button
                    style={navBtnStyle(isFirst || loading)}
                    onClick={() => goTo(page - 1)}
                    disabled={isFirst || loading}
                    className="active:scale-90 transition-transform outline-none"
                    aria-label="Página anterior"
                >
                    <GlassSheen />
                    <Icon name="chevron_left" size="sm" className="text-white relative z-10" />
                </button>

                <div style={{ textAlign: 'center', minWidth: 56, position: 'relative', zIndex: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                        {page} / {totalPages}
                    </p>
                    {totalItems > 0 && (
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.70)', margin: 0, lineHeight: 1.4 }}>
                            {totalItems} registros
                        </p>
                    )}
                </div>

                <button
                    style={navBtnStyle(isLast || loading)}
                    onClick={() => goTo(page + 1)}
                    disabled={isLast || loading}
                    className="active:scale-90 transition-transform outline-none"
                    aria-label="Página siguiente"
                >
                    <GlassSheen />
                    <Icon name="chevron_right" size="sm" className="text-white relative z-10" />
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// GlassViewToggle
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_OPTIONS = [
    { id: 'cards', label: 'Cards', icon: 'grid_view' },
    { id: 'table', label: 'Tabla', icon: 'table_rows' },
];

export const GlassViewToggle = ({
    options = DEFAULT_OPTIONS,
    value,
    onChange,
    activeVariant = 'primary',
}) => {
    const containerStyle = {
        display: 'inline-flex',
        padding: 4,
        borderRadius: 14,
        gap: 3,
        position: 'relative',
        overflow: 'hidden',
        ...glassBase('light'),
    };

    return (
        <div style={containerStyle}>
            <GlassSheen />
            {options.map((opt) => {
                const isActive = value === opt.id;

                const activeStyle = {
                    ...glassBase(activeVariant),
                    borderRadius: 10,
                    position: 'relative',
                    overflow: 'hidden',
                };

                const inactiveStyle = {
                    borderRadius: 10,
                    background: 'transparent',
                    border: '1px solid transparent',
                    position: 'relative',
                };

                return (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        style={isActive ? activeStyle : inactiveStyle}
                        className="flex items-center gap-1.5 px-3 py-1.5 transition-all duration-200 active:scale-95 outline-none select-none relative z-10"
                    >
                        {isActive && <GlassSheen />}
                        <Icon
                            name={opt.icon}
                            size="xs"
                            className={cn('relative z-10 transition-colors', isActive ? 'text-white' : 'text-slate-600')}
                        />
                        <span className={cn('text-xs font-bold relative z-10 transition-colors', isActive ? 'text-white' : 'text-slate-600')}>
                            {opt.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// GlassBottomNav & Item (NUEVOS - Estilo iOS)
// ─────────────────────────────────────────────────────────────────────────────
export const GlassBottomNav = ({ children }) => {
    return (
        <div
            className="fixed bottom-0 left-0 w-full z-50 pb-[env(safe-area-inset-bottom)] pt-2 px-2"
            style={glassBase('surface')}
        >
            <nav className="flex items-center justify-around pb-2 relative z-10">
                {children}
            </nav>
        </div>
    );
};

export const GlassBottomNavItem = ({ icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="relative flex flex-col items-center justify-center w-full py-1 outline-none tap-highlight-transparent group"
        >
            {/* Pill activo estilo Material You / iOS Glass */}
            <div
                className={cn(
                    "flex items-center justify-center w-16 h-8 rounded-full transition-all duration-300 relative overflow-hidden",
                    isActive ? "border border-white/20 shadow-inner" : "bg-transparent group-active:bg-white/30"
                )}
                style={isActive ? glassBase('primary') : undefined}
            >
                {isActive && <GlassSheen />}
                <Icon
                    name={icon}
                    size="24px"
                    className={cn(
                        "relative z-10 transition-colors duration-300",
                        isActive ? "text-white drop-shadow-sm" : "text-marca-primario/70"
                    )}
                    weight={isActive ? 600 : 400}
                />
            </div>

            {/* Texto descriptivo */}
            <span
                className={cn(
                    "text-[10px] font-bold mt-1.5 transition-colors duration-300 tracking-wide",
                    isActive ? "text-marca-primario" : "text-marca-primario/60"
                )}
            >
                {label}
            </span>
        </button>
    );
};