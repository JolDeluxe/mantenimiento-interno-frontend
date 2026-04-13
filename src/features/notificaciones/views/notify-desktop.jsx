import { Icon, Pagination, Skeleton, RefreshFab } from '@/components/ui/z_index';
import { NotifyItem } from '../components/notify-item';
import { NotifyFilterBar } from '../components/notify-filter-bar';
import { NotifyEmptyState } from '../components/notify-empty-state';
import { NotifyOverdueBanner } from '../components/notify-overdue-banner';

const ListSkeleton = () => (
    <div className="divide-y divide-slate-100">
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-1/2 rounded-md" />
                        <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                    <Skeleton className="h-3 w-3/4 rounded-md" />
                    <div className="flex gap-2 mt-1">
                        <Skeleton className="h-7 w-20 rounded-xl" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export const NotifyDesktop = ({
    notificaciones,
    loading,
    submitting,
    currentUser,
    meta,
    soloNoLeidas,
    filtroTipo,
    page,
    onToggleNoLeidas,
    onTipoChange,
    onPageChange,
    onAction,
    onMarkRead,
    onMarkAll,
}) => (
    <div className="flex flex-col gap-4">
        <RefreshFab bottom="32px" right="32px" size={48} />

        <div>
            <h2 className="fuente-titulos text-2xl text-marca-primario uppercase tracking-wide">
                Notificaciones
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
                {loading ? 'Cargando…' : (
                    <>
                        {meta.noLeidas > 0 && (
                            <><span className="font-bold text-estado-asignada">{meta.noLeidas}</span> sin leer · </>
                        )}
                        {meta.total} en total
                    </>
                )}
            </p>
        </div>

        <NotifyOverdueBanner currentUser={currentUser} />

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 pt-4">
                <NotifyFilterBar
                    soloNoLeidas={soloNoLeidas}
                    onToggleNoLeidas={onToggleNoLeidas}
                    filtroTipo={filtroTipo}
                    onTipoChange={onTipoChange}
                    noLeidas={meta.noLeidas}
                    onMarkAll={onMarkAll}
                    submitting={submitting}
                />
            </div>

            {loading ? (
                <ListSkeleton />
            ) : notificaciones.length === 0 ? (
                <NotifyEmptyState soloNoLeidas={soloNoLeidas} />
            ) : (
                <div className="divide-y divide-slate-100">
                    {notificaciones.map((n) => (
                        <NotifyItem
                            key={n.id}
                            notificacion={n}
                            currentUser={currentUser}
                            onAction={onAction}
                            onMarkRead={onMarkRead}
                            variant="desktop"
                        />
                    ))}
                </div>
            )}

            {meta.totalPages > 1 && (
                <Pagination
                    variant="bar"
                    page={page}
                    totalPages={meta.totalPages}
                    totalItems={meta.total}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    </div>
);