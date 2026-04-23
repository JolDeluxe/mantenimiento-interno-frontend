import { GlassFab, Icon, Skeleton, ScrollToTopButton, Spinner } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { NotifyItem } from '../components/notify-item';
import { NotifyEmptyState } from '../components/notify-empty-state';
import { NotifyOverdueBanner } from '../components/notify-overdue-banner';
import { hardReload } from '@/utils/hard-reload';
import { cn } from '@/utils/cn';

const CardSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
        </div>
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
    </div>
);

const GlassToggle = ({ soloNoLeidas, onToggle, noLeidas }) => {
    const containerStyle = {
        display: 'inline-flex',
        padding: 4,
        borderRadius: 14,
        gap: 3,
        position: 'relative',
        overflow: 'hidden',
        ...glassBase('light'),
    };

    const buildBtnStyle = (active) =>
        active
            ? { ...glassBase('primary'), borderRadius: 10, position: 'relative', overflow: 'hidden' }
            : { borderRadius: 10, background: 'transparent', border: '1px solid transparent', position: 'relative' };

    const options = [
        { label: 'Todas', active: !soloNoLeidas, badge: null },
        { label: 'No leídas', active: soloNoLeidas, badge: noLeidas },
    ];

    return (
        <div style={containerStyle}>
            <GlassSheen />
            {options.map((opt, i) => (
                <button
                    key={i}
                    onClick={() => { if (i === 0 && soloNoLeidas) onToggle(); if (i === 1 && !soloNoLeidas) onToggle(); }}
                    style={buildBtnStyle(opt.active)}
                    className="flex items-center gap-1.5 px-3 py-1.5 transition-all duration-200 active:scale-95 outline-none select-none relative z-10"
                >
                    {opt.active && <GlassSheen />}
                    <span className={cn('text-xs font-bold relative z-10 transition-colors', opt.active ? 'text-white' : 'text-slate-600')}>
                        {opt.label}
                    </span>
                    {opt.badge > 0 && !opt.active && (
                        <span className="relative z-10 text-[9px] font-extrabold px-1 py-0.5 rounded-md bg-red-100 text-red-600 leading-none">
                            {opt.badge > 99 ? '99+' : opt.badge}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

export const NotifyMobile = ({
    notificaciones,
    loading,
    loadingMore,
    submitting,
    currentUser,
    meta,
    soloNoLeidas,
    hasMore,
    onToggleNoLeidas,
    onLoadMore,
    onAction,
    onMarkRead,
    onMarkAll,
}) => {
    // Al eliminar la paginación inferior, los botones flotantes bajan.
    const baseBottom = 84;
    const fabMarkBottom = `${baseBottom}px`;
    const fabRefreshBottom = meta.noLeidas > 0 ? `${baseBottom + 60}px` : fabMarkBottom;

    return (
        <>
            <div className="flex items-center justify-between mb-3">
                <GlassToggle
                    soloNoLeidas={soloNoLeidas}
                    onToggle={onToggleNoLeidas}
                    noLeidas={meta.noLeidas}
                />
                {meta.noLeidas > 0 && (
                    <p className="text-xs text-estado-asignada font-semibold">
                        {meta.noLeidas} sin leer
                    </p>
                )}
            </div>

            <NotifyOverdueBanner currentUser={currentUser} />

            <div className="flex flex-col gap-3 px-1 pt-1 pb-32">
                {loading && notificaciones.length === 0
                    ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                    : notificaciones.length === 0
                        ? <NotifyEmptyState soloNoLeidas={soloNoLeidas} />
                        : notificaciones.map((n) => (
                            <NotifyItem
                                key={n.id}
                                notificacion={n}
                                currentUser={currentUser}
                                onAction={onAction}
                                onMarkRead={onMarkRead}
                                variant="mobile"
                            />
                        ))
                }

                {hasMore && (
                    <div className="mt-2 flex justify-center pb-4">
                        <button
                            onClick={onLoadMore}
                            disabled={loadingMore}
                            style={glassBase('light')}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-extrabold text-slate-700 active:scale-95 transition-all shadow-sm min-w-[200px]"
                        >
                            {loadingMore ? <Spinner size="sm" /> : <Icon name="expand_more" size="sm" />}
                            Cargar más
                        </button>
                    </div>
                )}
            </div>

            <GlassFab
                icon="refresh"
                onClick={hardReload}
                isLoading={loading && !loadingMore}
                variant="neutral"
                size={50}
                bottom={fabRefreshBottom}
                right="20px"
            />

            {meta.noLeidas > 0 && (
                <GlassFab
                    icon="done_all"
                    onClick={onMarkAll}
                    isLoading={submitting}
                    variant="action"
                    size={56}
                    bottom={fabMarkBottom}
                    right="20px"
                />
            )}

            <ScrollToTopButton bottom={fabMarkBottom} left="20px" />
        </>
    );
};