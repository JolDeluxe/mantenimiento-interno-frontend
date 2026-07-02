// src/features/hoy/views/hoy-actividades-mobile.jsx
import React, { useState, useMemo } from 'react';
import { GlassFab, Icon, Skeleton, ScrollToTopButton } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { ActividadesTicketCard } from '../components/hoy-actividades/actividades-ticket-card';
import { HoyDetailModal } from '../components/common/hoy-detail-modal';
import { MobileHoyFormModal } from '../components/common/mobile-hoy-form-modal';
import { TicketAssignModal } from '@/features/tickets/components/historico/ticket-assign-modal';
import { HoyStatusModal } from '../components/common/hoy-status-modal';
import { MobileTicketReviewModal } from '@/features/tickets/components/historico/mobile-ticket-review-modal';
import { MobileActividadesFilterBar } from '../components/hoy-actividades/mobile-actividades-filter-bar';
import { HoySummaryBar } from '../components/common/hoy-summary-bar';
import { HoyTeamToggle } from '../components/common/hoy-team-toggle';
import { TicketsEmptyState } from '@/features/common/components/tickets-empty-state';
import { ROLES_ADMIN } from '../constants';
import { cn } from '@/utils/cn';
import { HoyAprobarPanel } from '../components/common/hoy-aprobar-panel';

const SKELETON_COUNT = 4;

const CardSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-3">
            <Skeleton className="h-5 w-1/2 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full rounded-md mb-2" />
        <Skeleton className="h-3 w-2/3 rounded-md mb-3" />
        <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
    </div>
);

const GlassDateToggle = ({ selected, onChange, totalHoy, totalManana, totalAtrasadas }) => {
    const options = [
        { id: 0, label: 'Hoy', icon: 'today', count: totalHoy, alert: totalAtrasadas > 0 },
        { id: 1, label: 'Mañana', icon: 'event', count: totalManana, alert: false },
    ];
    const containerStyle = { display: 'inline-flex', padding: 4, borderRadius: 14, gap: 3, position: 'relative', overflow: 'hidden', ...glassBase('light'), width: '100%' };

    return (
        <div style={containerStyle}>
            <GlassSheen />
            {options.map((opt) => {
                const isActive = selected === opt.id;
                const activeStyle = { ...glassBase('primary'), borderRadius: 10, position: 'relative', overflow: 'hidden', flex: 1 };
                const inactiveStyle = { borderRadius: 10, background: 'transparent', border: '1px solid transparent', position: 'relative', flex: 1 };

                return (
                    <button key={opt.id} onClick={() => onChange(opt.id)} style={isActive ? activeStyle : inactiveStyle} className="flex items-center justify-center gap-1.5 py-1.5 transition-all duration-200 active:scale-95 outline-none select-none relative z-10 cursor-pointer">
                        {isActive && <GlassSheen />}
                        <Icon name={opt.icon} size="xs" className={cn('relative z-10 transition-colors', isActive ? 'text-white' : 'text-slate-600')} />
                        <span className={cn('text-xs font-bold relative z-10 transition-colors', isActive ? 'text-white' : 'text-slate-600')}>{opt.label}</span>
                        {opt.count > 0 && (
                            <span className={cn('text-[9px] font-extrabold px-1 py-0.5 rounded-full relative z-10 leading-none', isActive ? 'bg-white/25 text-white' : opt.alert ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-200 text-slate-600')}>{opt.count}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export const HoyActividadesMobile = ({
    tickets = [],
    loading,
    submitting,
    currentUser,
    tecnicos = [],
    query,
    onSearchChange,
    filtroEstado,
    onEstadoChange,
    filtroTipo,
    onTipoChange,
    filtroPrioridad,
    onPrioridadChange,
    filtroCategoria,
    onCategoriaChange,
    filtroResponsable,
    onResponsableChange,
    mostrarAtrasadas,
    onToggleAtrasadas,
    mostrarRechazadas,
    onToggleRechazadas,
    vistaEquipo,
    onVistaEquipoChange,
    equipoCount,
    misTareasCount,
    existenciaGlobal,
    totalAtrasadasGlobal,
    onRefresh,
    onClearFilters,
    highlightId,
    onSave,
    onChangeStatus,
    onOpenCreate,
    toApproveCount,
    onOpenDrawerAmnistia,
    conteos,
    totalParaSummary,
    dateOffset,
    onDateOffsetChange,
    totalHoy,
    totalManana,
    totalAtrasadas,
}) => {
    const puedeCrear = ROLES_ADMIN.has(currentUser?.rol);
    const [detailTarget, setDetailTarget] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);

    const isFilteringActive = !!(
        query.trim() ||
        (filtroEstado && filtroEstado !== 'TODOS') ||
        filtroTipo ||
        filtroPrioridad ||
        filtroCategoria ||
        filtroResponsable ||
        mostrarAtrasadas ||
        mostrarRechazadas
    );

    const handleClearFilters = () => {
        onSearchChange('');
        onEstadoChange('TODOS');
        onTipoChange('');
        onPrioridadChange('');
        onCategoriaChange('');
        onResponsableChange('');
        if (mostrarAtrasadas) onToggleAtrasadas();
        if (mostrarRechazadas) onToggleRechazadas();
        if (onClearFilters) onClearFilters();
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in pb-28">
            <div className="flex flex-col gap-2">
                <GlassDateToggle selected={dateOffset} onChange={onDateOffsetChange} totalHoy={totalHoy} totalManana={totalManana} totalAtrasadas={totalAtrasadas} />
                <HoyTeamToggle value={vistaEquipo} onChange={onVistaEquipoChange} misCount={misTareasCount} eqCount={equipoCount} currentUser={currentUser} />
            </div>

            <HoyAprobarPanel toApproveCount={toApproveCount} currentUser={currentUser} isMobile />

            <HoySummaryBar totalParaSummary={totalParaSummary} conteos={conteos} filtroActual={filtroEstado} onFilterChange={onEstadoChange} loading={loading} />

            <MobileActividadesFilterBar
                query={query}
                onSearchChange={onSearchChange}
                filtroEstado={filtroEstado}
                onEstadoChange={onEstadoChange}
                filtroTipo={filtroTipo}
                onTipoChange={onTipoChange}
                filtroPrioridad={filtroPrioridad}
                onPrioridadChange={onPrioridadChange}
                filtroCategoria={filtroCategoria}
                onCategoriaChange={onCategoriaChange}
                filtroResponsable={filtroResponsable}
                onResponsableChange={onResponsableChange}
                opcionesResponsables={tecnicos}
                mostrarAtrasadas={mostrarAtrasadas}
                onToggleAtrasadas={onToggleAtrasadas}
                mostrarRechazadas={mostrarRechazadas}
                onToggleRechazadas={onToggleRechazadas}
                existenciaGlobal={existenciaGlobal}
                totalAtrasadasGlobal={totalAtrasadasGlobal}
                currentUser={currentUser}
                onOpenDrawerAmnistia={onOpenDrawerAmnistia}
                hideStatusFilter
            />

            {loading ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : tickets.length === 0 ? (
                <div className="mt-10">
                    <TicketsEmptyState
                        isMobile={true}
                        isFiltering={isFilteringActive}
                        onClearFilters={handleClearFilters}
                        onRefresh={onRefresh}
                        mensaje={dateOffset === 0 ? "Sin actividades para hoy" : "Sin actividades para mañana"}
                        subtexto="No hay actividades programadas."
                        icon={dateOffset === 0 ? "today" : "event"}
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {tickets.map(ticket => (
                        <ActividadesTicketCard
                            key={ticket.id}
                            ticket={ticket}
                            currentUser={currentUser}
                            tecnicos={tecnicos}
                            highlightId={highlightId}
                            onSave={onSave}
                            onChangeStatus={setStatusTarget}
                            onViewDetail={setDetailTarget}
                            onEdit={setEditTarget}
                            onAssign={setAssignTarget}
                            onReview={setReviewTarget}
                            onCancel={setCancelTarget}
                        />
                    ))}
                </div>
            )}

            {puedeCrear && (
                <div className="lg:hidden">
                    <GlassFab onClick={onOpenCreate} icon="add" bottom="84px" />
                </div>
            )}

            <ScrollToTopButton bottom="84px" />

            <HoyDetailModal isOpen={Boolean(detailTarget)} onClose={() => setDetailTarget(null)} ticket={detailTarget} />
            <MobileHoyFormModal scope="actividades" isOpen={Boolean(editTarget)} onClose={() => setEditTarget(null)} ticketAEditar={editTarget} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={async (payload) => { await onSave(editTarget.id, payload); setEditTarget(null); }} />
            <TicketAssignModal isOpen={Boolean(assignTarget)} onClose={() => setAssignTarget(null)} ticket={assignTarget} tecnicos={tecnicos} isSubmitting={submitting} onConfirm={async (id, payload) => { await onSave(id, payload); setAssignTarget(null); }} />
            <HoyStatusModal isOpen={Boolean(statusTarget)} onClose={() => setStatusTarget(null)} ticket={statusTarget} currentUser={currentUser} isSubmitting={submitting} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setStatusTarget(null); }} />
            <MobileTicketReviewModal isOpen={Boolean(reviewTarget)} onClose={() => setReviewTarget(null)} ticket={reviewTarget} isSubmitting={submitting} currentUser={currentUser} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setReviewTarget(null); }} />
            <HoyStatusModal isOpen={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} ticket={cancelTarget} currentUser={currentUser} isSubmitting={submitting} forcedEstado="CANCELADA" onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setCancelTarget(null); }} />
        </div>
    );
};
