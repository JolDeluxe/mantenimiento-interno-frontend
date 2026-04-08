// src/features/tickets/views/tickets-hoy-mobile.jsx
import { useState } from 'react';
import { GlassFab, GlassPaginationPill, Icon, Skeleton } from '@/components/ui/z_index';
import { ScrollToTopButton } from '@/components/ui/z_index';
import { glassBase, GlassSheen, GlassViewToggle } from '@/components/ui/liquid-glass-mobile';
import { HoyTicketCard } from '../components/hoy/hoy-ticket-card';
import { HoyDetailModal } from '../components/hoy/hoy-detail-modal';
import { MobileHoyFormModal } from '../components/hoy/mobile-hoy-form-modal';
import { TicketAssignModal } from '../components/historico/ticket-assign-modal';
import { HoyStatusModal } from '../components/hoy/hoy-status-modal';
import { MobileTicketReviewModal } from '../components/historico/mobile-ticket-review-modal';
import { hardReload } from '@/utils/hard-reload';
import { ROLES_ADMIN } from '../constants';
import { cn } from '@/utils/cn';

const SKELETON_COUNT = 4;

const CardSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-14 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-3 w-2/3 rounded-md" />
            </div>
            <div className="flex flex-col gap-1 shrink-0">
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
            </div>
        </div>
        <div className="space-y-1.5 mb-3">
            <Skeleton className="h-3 w-36 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
        </div>
        <div className="flex gap-2 pt-3 border-t border-slate-100">
            <Skeleton className="h-8 w-8 rounded-md shrink-0" />
            <div className="flex-1" />
            <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
    </div>
);

const GlassDateToggle = ({ selected, onChange, totalHoy, totalManana }) => {
    const options = [
        { id: 0, label: 'Hoy', icon: 'today', count: totalHoy },
        { id: 1, label: 'Mañana', icon: 'event', count: totalManana },
    ];

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
                const isActive = selected === opt.id;
                const activeStyle = { ...glassBase('primary'), borderRadius: 10, position: 'relative', overflow: 'hidden' };
                const inactiveStyle = { borderRadius: 10, background: 'transparent', border: '1px solid transparent', position: 'relative' };

                return (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        style={isActive ? activeStyle : inactiveStyle}
                        className="flex items-center gap-1.5 px-3 py-1.5 transition-all duration-200 active:scale-95 outline-none select-none relative z-10"
                    >
                        {isActive && <GlassSheen />}
                        <Icon name={opt.icon} size="xs" className={cn('relative z-10 transition-colors', isActive ? 'text-white' : 'text-slate-600')} />
                        <span className={cn('text-xs font-bold relative z-10 transition-colors', isActive ? 'text-white' : 'text-slate-600')}>
                            {opt.label}
                        </span>
                        {opt.count > 0 && (
                            <span className={cn(
                                'text-[9px] font-extrabold px-1 py-0.5 rounded-full relative z-10 leading-none',
                                isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                            )}>
                                {opt.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export const TicketsHoyMobile = ({
    tickets,
    loading,
    submitting,
    currentUser,
    tecnicos,
    dateOffset,
    onDateOffsetChange,
    totalHoy,
    totalManana,
    onSave,
    onChangeStatus,
    onOpenCreate,
}) => {
    const [detailTarget, setDetailTarget] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);

    const puedeCrear = ROLES_ADMIN.has(currentUser?.rol);
    const hasContent = !loading && tickets.length > 0;

    // Cálculo dinámico riguroso (Idéntico a Histórico pero sin paginador)
    const baseBottom = 84;
    const fabAddBottom = `${baseBottom}px`;
    const fabRefreshBottom = puedeCrear ? `${baseBottom + 60}px` : `${baseBottom}px`;

    return (
        <>
            <div className="flex flex-col gap-2.5 mb-3">
                <div className="flex items-center">
                    <GlassDateToggle
                        selected={dateOffset}
                        onChange={onDateOffsetChange}
                        totalHoy={totalHoy}
                        totalManana={totalManana}
                    />
                </div>
            </div>

            <div className={cn('flex flex-col gap-3 px-1 pt-1', 'pb-44')}>
                {loading
                    ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <CardSkeleton key={i} />)
                    : tickets.length === 0
                        ? (
                            <div className="flex flex-col items-center justify-center h-52 gap-4 text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Icon name={dateOffset === 0 ? 'today' : 'event'} size="xl" className="text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-400">
                                    Sin tareas para {dateOffset === 0 ? 'hoy' : 'mañana'}
                                </p>
                            </div>
                        )
                        : tickets.map((ticket) => (
                            <HoyTicketCard
                                key={ticket.id}
                                ticket={ticket}
                                currentUser={currentUser}
                                onViewDetail={setDetailTarget}
                                onEdit={setEditTarget}
                                onAssign={setAssignTarget}
                                onChangeStatus={setStatusTarget}
                                onReview={setReviewTarget}
                                onCancel={setCancelTarget}
                            />
                        ))
                }
            </div>

            {/* Pila Dinámica de FABs Móviles */}
            <div className="md:hidden">
                <GlassFab
                    icon="refresh"
                    onClick={hardReload}
                    isLoading={loading}
                    variant="neutral"
                    size={50}
                    bottom={fabRefreshBottom}
                    right="20px"
                />
                {puedeCrear && (
                    <GlassFab
                        icon="add"
                        onClick={onOpenCreate}
                        variant="primary"
                        size={56}
                        bottom={fabAddBottom}
                        right="20px"
                    />
                )}
            </div>

            <div className="md:hidden">
                <ScrollToTopButton bottom={fabAddBottom} left="20px" />
            </div>

            <HoyDetailModal
                isOpen={Boolean(detailTarget)}
                onClose={() => setDetailTarget(null)}
                ticket={detailTarget}
            />

            <MobileHoyFormModal
                isOpen={Boolean(editTarget)}
                onClose={() => setEditTarget(null)}
                ticketAEditar={editTarget}
                currentUser={currentUser}
                tecnicos={tecnicos}
                isSubmitting={submitting}
                onSuccess={async (payload) => {
                    await onSave(editTarget.id, payload);
                    setEditTarget(null);
                }}
            />

            <TicketAssignModal
                isOpen={Boolean(assignTarget)}
                onClose={() => setAssignTarget(null)}
                ticket={assignTarget}
                tecnicos={tecnicos}
                isSubmitting={submitting}
                onConfirm={async (id, payload) => {
                    await onSave(id, payload);
                    setAssignTarget(null);
                }}
            />

            <HoyStatusModal
                isOpen={Boolean(statusTarget)}
                onClose={() => setStatusTarget(null)}
                ticket={statusTarget}
                currentUser={currentUser}
                isSubmitting={submitting}
                onConfirm={async (id, payload) => {
                    await onChangeStatus(id, payload);
                    setStatusTarget(null);
                }}
            />

            <MobileTicketReviewModal
                isOpen={Boolean(reviewTarget)}
                onClose={() => setReviewTarget(null)}
                ticket={reviewTarget}
                isSubmitting={submitting}
                onConfirm={async (id, payload) => {
                    await onChangeStatus(id, payload);
                    setReviewTarget(null);
                }}
            />

            <HoyStatusModal
                isOpen={Boolean(cancelTarget)}
                onClose={() => setCancelTarget(null)}
                ticket={cancelTarget}
                currentUser={currentUser}
                isSubmitting={submitting}
                forcedEstado="CANCELADA"
                onConfirm={async (id, payload) => {
                    await onChangeStatus(id, payload);
                    setCancelTarget(null);
                }}
            />
        </>
    );
};