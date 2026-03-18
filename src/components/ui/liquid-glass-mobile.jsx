import { Icon } from './icon';
import { cn } from '@/utils/cn';

// ── Tokens de variantes ────────────────────────────────────────────────────
const GLASS_VARIANTS = {
    primary: {
        bg: 'rgba(72, 43, 44, 0.78)',
        shadow: '0 12px 36px rgba(72,43,44,0.40), 0 2px 8px rgba(72,43,44,0.20)',
    },
    neutral: {
        bg: 'rgba(100, 116, 139, 0.62)',
        shadow: '0 10px 30px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12)',
    },
    action: {
        bg: 'rgba(59, 130, 246, 0.72)',
        shadow: '0 10px 30px rgba(59,130,246,0.35), 0 2px 6px rgba(59,130,246,0.18)',
    },
    success: {
        bg: 'rgba(16, 185, 129, 0.70)',
        shadow: '0 10px 30px rgba(16,185,129,0.32), 0 2px 6px rgba(16,185,129,0.16)',
    },
    danger: {
        bg: 'rgba(220, 38, 38, 0.72)',
        shadow: '0 10px 30px rgba(220,38,38,0.30), 0 2px 6px rgba(220,38,38,0.16)',
    },
};

const glassBase = (variant = 'primary') => {
    const v = GLASS_VARIANTS[variant] || GLASS_VARIANTS.primary;
    return {
        background: v.bg,
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.32)',
        boxShadow: `${v.shadow}, 0 1px 0 rgba(255,255,255,0.48) inset, 0 -1px 0 rgba(0,0,0,0.08) inset`,
    };
};

// Reflejo especular interno
const GlassSheen = () => (
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
                'active:scale-90 transition-transform select-none outline-none',
                className
            )}
            aria-label={icon}
        >
            <GlassSheen />
            <Icon
                name={isLoading ? 'progress_activity' : icon}
                size="md"
                className={cn('text-white drop-shadow-sm relative', isLoading && 'animate-spin')}
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
    bottom = '24px',
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
    });

    return (
        <div style={{ position: 'fixed', bottom, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex, paddingBottom: '8px' }}>
            <div style={innerStyle}>
                <GlassSheen />
                <button
                    style={navBtnStyle(isFirst || loading)}
                    onClick={() => goTo(page - 1)}
                    disabled={isFirst || loading}
                    className="active:scale-90 transition-transform outline-none"
                    aria-label="Página anterior"
                >
                    <Icon name="chevron_left" size="sm" className="text-white relative" />
                </button>

                <div style={{ textAlign: 'center', minWidth: 56 }}>
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
                    <Icon name="chevron_right" size="sm" className="text-white relative" />
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// GlassViewToggle
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Toggle genérico con glass. Funciona en dos modos:
 *
 * Modo multi-opción (cards / tabla):
 *   options = [{ id, label, icon }]
 *   value   = id activo
 *   onChange(id)
 *
 * Modo toggle único (inactivos ON/OFF):
 *   options = [{ id: 'inactivos', label: 'Inactivos', icon: 'person_off' }]
 *   value   = 'inactivos' (activo) | null (inactivo)
 *   onChange() — sin argumento, el padre maneja el toggle
 *   activeVariant = 'danger' | 'primary' | 'action' | 'success' | 'neutral'
 */
const DEFAULT_OPTIONS = [
    { id: 'cards', label: 'Cards', icon: 'grid_view' },
    { id: 'table', label: 'Tabla', icon: 'table_rows' },
];

export const GlassViewToggle = ({
    options = DEFAULT_OPTIONS,
    value,
    onChange,
    activeVariant = 'primary',   // variante glass del item activo
}) => {
    const containerStyle = {
        display: 'inline-flex',
        padding: 4,
        borderRadius: 14,
        gap: 3,
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        background: 'rgba(255,255,255,0.18)',
        border: '1px solid rgba(255,255,255,0.30)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.45) inset',
        position: 'relative',
        overflow: 'hidden',
    };

    return (
        <div style={containerStyle}>
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
                };

                return (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        style={isActive ? activeStyle : inactiveStyle}
                        className="flex items-center gap-1.5 px-3 py-1.5 transition-all duration-200 active:scale-95 outline-none select-none"
                    >
                        {isActive && <GlassSheen />}
                        <Icon
                            name={opt.icon}
                            size="xs"
                            className={cn('relative transition-colors', isActive ? 'text-white' : 'text-slate-500')}
                        />
                        <span className={cn('text-xs font-bold relative transition-colors', isActive ? 'text-white' : 'text-slate-500')}>
                            {opt.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};