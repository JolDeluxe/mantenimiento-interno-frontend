// src/features/tickets/views/tickets-historico-mobile.jsx
import { useState } from 'react';
import { GlassFab, GlassPaginationPill, GlassViewToggle, Icon, Skeleton } from '@/components/ui/z_index';
import { ScrollToTopButton } from '@/components/ui/z_index';
import { TicketSummaryBar } from '../components/historico/ticket-summary-bar';
import { TicketFilterBar } from '../components/historico/ticket-filter-bar';
import { TicketsTable } from '../components/historico/ticket-table';
import { TicketCard } from '../components/historico/ticket-card';
import { TicketFormModal } from '../components/historico/ticket-form-modal';
import { TicketStatusModal } from '../components/historico/ticket-status-modal';
import { TicketDetailModal } from '../components/historico/ticket-detail-modal';
import { TicketAssignModal } from '../components/historico/ticket-assign-modal';
import { TicketReviewModal } from '../components/historico/ticket-review-modal';
import { hardReload } from '@/utils/hard-reload';
import { cn } from '@/utils/cn';

const SKELETON_COUNT = 5;

const CardSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-3 w-2/3 rounded-md" />
            </div>
            <div className="flex flex-col gap-1 shrink-0">
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
            </div>
        </div>
        <div className="space-y-1.5 mb-3">
            <Skeleton className="h-3 w-40 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-md" />
        </div>
        <div className="flex gap-2 pt-3 border-t border-slate-100">
            <Skeleton className="h-8 w-8 rounded-md shrink-0" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-md shrink-0" />
        </div>
    </div>
);

export const TicketsHistoricoMobile = ({
    tickets,
    loading,
    submitting,
    currentUser,
    tecnicos,
    page,
    limit,
    totalPages,
    totalParaSummary,
    totalParaPaginador,
    conteos,
    sortConfig,
    query,
    filtroEstado,
    filtroTipo,
    filtroPrioridad,
    mostrarPapelera,
    onTogglePapelera,
    mostrarRechazadas,
    onToggleRechazadas,
    onPageChange,
    onSortChange,
    onSearchChange,
    onFilterChange,
    onTipoChange,
    onPrioridadChange,
    onSave,
    onChangeStatus,
    onOpenCreate,
    onRefresh,
}) => {
    const [viewMode, setViewMode] = useState('cards');
    const [editTarget, setEditTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [detailTarget, setDetailTarget] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);

    const hasContent = !loading && tickets.length > 0;
    const hasPaginator = hasContent && totalPages > 1;

    const fabAddBottom = hasPaginator ? '104px' : '84px';
    const fabRefreshBottom = hasPaginator ? '164px' : '144px';

    return (
        <>
            {/* ── SummaryBar ── */}
            <div className="mb-3">
                <TicketSummaryBar
                    totalParaSummary={totalParaSummary}
                    conteos={conteos}
                    filtroActual={filtroEstado}
                    onFilterChange={onFilterChange}
                    loading={loading}
                    mostrarPapelera={mostrarPapelera}
                    mostrarRechazadas={mostrarRechazadas}
                />
            </div>

            {/* ── Controles ── */}
            <div className="mb-3 flex flex-col gap-2">
                <TicketFilterBar
                    query={query}
                    onSearchChange={onSearchChange}
                    filtroTipo={filtroTipo}
                    onTipoChange={onTipoChange}
                    filtroPrioridad={filtroPrioridad}
                    onPrioridadChange={onPrioridadChange}
                    mostrarPapelera={mostrarPapelera}
                    onTogglePapelera={onTogglePapelera}
                    mostrarRechazadas={mostrarRechazadas}
                    onToggleRechazadas={onToggleRechazadas}
                    conteos={conteos}
                    mobileSearchOnly={false}
                />

                <div className="flex items-center justify-between gap-3">
                    <GlassViewToggle value={viewMode} onChange={setViewMode} />

                    {/* Chips de tipo/prioridad/papelera para móvil */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <TicketFilterBar
                            query=""
                            onSearchChange={() => { }}
                            filtroTipo={filtroTipo}
                            onTipoChange={onTipoChange}
                            filtroPrioridad={filtroPrioridad}
                            onPrioridadChange={onPrioridadChange}
                            mostrarPapelera={mostrarPapelera}
                            onTogglePapelera={onTogglePapelera}
                            mostrarRechazadas={mostrarRechazadas}
                            onToggleRechazadas={onToggleRechazadas}
                            conteos={conteos}
                            mobileChipsOnly
                        />
                    </div>
                </div>
            </div>

            {/* ── Contenido ── */}
            {viewMode === 'cards' ? (
                <div className={cn('flex flex-col gap-3 px-1 pt-1', hasPaginator ? 'pb-56' : 'pb-44')}>
                    {loading
                        ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <CardSkeleton key={i} />)
                        : tickets.length === 0
                            ? (
                                <div className="flex flex-col items-center justify-center h-44 gap-3 text-slate-400">
                                    <Icon name="search_off" size="xl" />
                                    <p className="text-sm font-medium">Sin resultados</p>
                                </div>
                            )
                            : tickets.map((ticket) => (
                                <TicketCard
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
            ) : (
                <div className={cn('mb-40', hasPaginator && 'mb-52')}>
                    <TicketsTable
                        tickets={tickets}
                        loading={loading}
                        submitting={submitting}
                        currentUser={currentUser}
                        tecnicos={tecnicos}
                        page={page}
                        limit={limit}
                        totalPages={totalPages}
                        totalItems={totalParaPaginador}
                        sortConfig={sortConfig}
                        onPageChange={onPageChange}
                        onSortChange={onSortChange}
                        onSave={onSave}
                        onChangeStatus={onChangeStatus}
                        onRefresh={onRefresh}
                        hidePagination
                    />
                </div>
            )}

            {/* ── Paginador flotante ── */}
            {hasPaginator && (
                <div className="md:hidden">
                    <GlassPaginationPill
                        page={page}
                        totalPages={totalPages}
                        totalItems={totalParaPaginador}
                        onPageChange={onPageChange}
                        loading={loading}
                        bottom="24px"
                    />
                </div>
            )}

            {/* ── FABs ── */}
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
                <GlassFab
                    icon="add"
                    onClick={onOpenCreate}
                    variant="primary"
                    size={56}
                    bottom={fabAddBottom}
                    right="20px"
                />
            </div>

            <div className="md:hidden">
                <ScrollToTopButton bottom={fabAddBottom} left="20px" />
            </div>

            {/* ── Modales ── */}
            <TicketFormModal
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

            <TicketStatusModal
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

            <TicketReviewModal
                isOpen={Boolean(reviewTarget)}
                onClose={() => setReviewTarget(null)}
                ticket={reviewTarget}
                isSubmitting={submitting}
                onConfirm={async (id, payload) => {
                    await onChangeStatus(id, payload);
                    setReviewTarget(null);
                }}
            />

            <TicketStatusModal
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

            <TicketDetailModal
                isOpen={Boolean(detailTarget)}
                onClose={() => setDetailTarget(null)}
                ticket={detailTarget}
            />
        </>
    );
};