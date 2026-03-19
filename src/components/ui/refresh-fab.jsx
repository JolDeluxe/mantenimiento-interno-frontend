// src/components/ui/refresh-fab.jsx
import { useState } from 'react';
import { Icon } from './icon';
import { cn } from '@/utils/cn';
import { hardReload } from '@/utils/hard-reload';

const glassStyle = {
    background: 'rgba(100, 116, 139, 0.62)',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.32)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.48) inset, 0 -1px 0 rgba(0,0,0,0.08) inset',
};

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

export const RefreshFab = ({
    bottom = '32px',
    right = '32px',
    left,
    size = 50,
    zIndex = 49,
    className,
}) => {
    const [spinning, setSpinning] = useState(false);

    const handleClick = async () => {
        if (spinning) return;
        setSpinning(true);
        await new Promise((r) => setTimeout(r, 300));
        await hardReload();
        setSpinning(false);
    };

    return (
        <button
            onClick={handleClick}
            disabled={spinning}
            style={{
                position: 'fixed',
                bottom,
                zIndex,
                width: size,
                height: size,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: spinning ? 0.7 : 1,
                transition: 'transform 0.15s ease, opacity 0.2s',
                ...(left ? { left } : { right }),
                ...glassStyle,
            }}
            className={cn(
                'active:scale-90 transition-transform select-none outline-none touch-none',
                className
            )}
            aria-label="Recargar aplicación"
        >
            <GlassSheen />
            <Icon
                name="refresh"
                size="md"
                weight={500}
                className={cn('text-white drop-shadow-sm relative', spinning && 'animate-spin')}
            />
        </button>
    );
};