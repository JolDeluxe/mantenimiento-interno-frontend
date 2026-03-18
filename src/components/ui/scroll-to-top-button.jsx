// src/components/ui/scroll-to-top-button.jsx
import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/z_index';

const glassStyle = {
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.32)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.48) inset, 0 -1px 0 rgba(0,0,0,0.08) inset',
};

const GlassSheen = () => (
    <div
        aria-hidden
        style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
            background: 'linear-gradient(148deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 60%)',
        }}
    />
);

/**
 * Botón flotante liquid-glass que aparece cuando el contenedor scrolleable
 * baja más de `threshold` píxeles. Al hacer clic regresa al tope suavemente.
 *
 * Props:
 *   bottom        → posición CSS bottom   (default '84px')
 *   left          → posición CSS left     (default '20px')
 *   threshold     → px de scroll para aparecer (default 300)
 *   getContainer  → fn que devuelve el elemento scrolleable
 *                   (default: () => document.querySelector('main'))
 */
export const ScrollToTopButton = ({
    bottom = '84px',
    left = '20px',
    threshold = 300,
    getContainer = () => document.querySelector('main'),
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const container = getContainer();
        if (!container) return;
        const onScroll = () => setVisible(container.scrollTop > threshold);
        container.addEventListener('scroll', onScroll, { passive: true });
        return () => container.removeEventListener('scroll', onScroll);
    }, [getContainer, threshold]);

    if (!visible) return null;

    const scrollToTop = () => {
        const container = getContainer();
        container?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            onClick={scrollToTop}
            style={{ bottom, left, position: 'fixed', zIndex: 40, borderRadius: '50%', overflow: 'hidden', ...glassStyle }}
            className="w-10 h-10 flex items-center justify-center text-slate-600
                       active:scale-90 transition-transform duration-200 outline-none select-none"
        >
            <GlassSheen />
            <Icon name="arrow_upward" size="sm" className="relative" />
        </button>
    );
};