import { Card, CardBody, Button, Icon, Skeleton } from '@/components/ui/z_index';
import { NotifyItem } from '../components/notify-item';
import { NotifyEmptyState } from '../components/notify-empty-state';
import { NotifyFilterBar } from '../components/notify-filter-bar';
import { NotifyOverdueBanner } from '../components/notify-overdue-banner';

export const NotifyDesktop = ({
    notificaciones,
    loading,
    loadingMore,
    submitting,
    currentUser,
    meta,
    soloNoLeidas,
    filtroTipo,
    hasMore,
    onToggleNoLeidas,
    onTipoChange,
    onLoadMore,
    onAction,
    onMarkRead,
    onMarkAll,
}) => {
    return (
        <div className="max-w-full mx-auto w-full space-y-4">
            <NotifyOverdueBanner currentUser={currentUser} />

            <NotifyFilterBar
                soloNoLeidas={soloNoLeidas}
                filtroTipo={filtroTipo}
                noLeidas={meta.noLeidas}
                onToggle={onToggleNoLeidas}
                onTipoChange={onTipoChange}
                onMarkAll={onMarkAll}
                submitting={submitting}
            />

            <Card className="min-h-[500px]">
                <CardBody className="p-0">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-4 p-5 border-b border-slate-100">
                                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                            </div>
                        ))
                    ) : notificaciones.length === 0 ? (
                        <NotifyEmptyState soloNoLeidas={soloNoLeidas} />
                    ) : (
                        <div className="flex flex-col">
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

                            {hasMore && (
                                <div className="flex justify-center py-6 border-t border-slate-100 bg-slate-50/50">
                                    <Button
                                        variant="accion"
                                        onClick={onLoadMore}
                                        isLoading={loadingMore}
                                        icon="expand_more"
                                        className="rounded-full px-6"
                                    >
                                        Cargar más notificaciones
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};