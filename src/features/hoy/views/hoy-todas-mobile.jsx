// src/features/hoy/views/hoy-todas-mobile.jsx
import React, { useState } from 'react';
import { GlassFab, Icon, Skeleton, ScrollToTopButton } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { HoyTicketCard } from '../components/common/hoy-ticket-card';
import { TicketDetailModal as HoyDetailModal } from '@/features/common/components/ticket-detail-modal';
import { AdminCloseModal } from '@/features/common/components/admin-close-modal';
import { MobileHoyFormModal } from '../components/common/mobile-hoy-form-modal';
import { TicketAssignModal } from '@/features/common/components/ticket-assign-modal';
import { TicketStatusModal as HoyStatusModal } from '@/features/common/components/status-modal';
import { MobileTicketReviewModal } from '@/features/tickets/components/historico/mobile-ticket-review-modal';
import { MobileHoyFilterBar } from '../components/common/mobile-hoy-filter-bar';
import { HoySummaryBar } from '../components/common/hoy-summary-bar';
import { HoyTeamToggle } from '../components/common/hoy-team-toggle';
import { TicketsEmptyState } from '@/features/common/components/tickets-empty-state';
import { ROLES_ADMIN } from '@/features/common/constants/catalogos-tareas';
import { cn } from '@/utils/cn';
import { HoyAprobarPanel } from '../components/common/hoy-aprobar-panel';
import { hardReload } from '@/utils/hard-reload';
import { getHoyEmptyCopy, getHoyEmptyIcon, getHoyVistaOptions } from '../utils/date-filters';


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

const GlassDateToggle = ({ selected, onChange, totalHoy, totalManana, totalSemana, totalPrimeraVista, totalAtrasadas }) => {
    const options = getHoyVistaOptions('general').map((opt, index) => ({
        ...opt,
        mobileLabel: opt.id === 'activas' ? 'Activas' : opt.id === 'semana' ? 'Semana' : opt.label,
        count: index === 0 ? totalPrimeraVista : opt.id === 'hoy' ? totalHoy : opt.id === 'manana' ? totalManana : totalSemana,
        alert: opt.id === 'activas' && totalAtrasadas > 0,
    }));
    const containerStyle = { padding: 4, borderRadius: 16, position: 'relative', overflow: 'hidden', ...glassBase('light'), width: '100%' };

    return (
        <div style={containerStyle}>
            <GlassSheen />
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none relative z-10">
                {options.map((opt) => {
                    const isActive = selected === opt.id;
                    const activeStyle = { ...glassBase('primary'), borderRadius: 12, position: 'relative', overflow: 'hidden' };
                    const inactiveStyle = { borderRadius: 12, background: 'transparent', border: '1px solid transparent', position: 'relative' };

                    return (
                        <button key={opt.id} onClick={() => onChange(opt.id)} style={isActive ? activeStyle : inactiveStyle} className="min-h-[38px] flex items-center justify-center gap-1.5 px-2.5 py-2 transition-all duration-200 active:scale-[0.98] outline-none select-none cursor-pointer shrink-0 min-w-[72px]">
                            {isActive && <GlassSheen />}
                            <Icon name={opt.icon} size="xs" className={cn('relative z-10 shrink-0 transition-colors', isActive ? 'text-white' : 'text-slate-600')} />
                            <span className={cn('text-[11px] font-extrabold relative z-10 whitespace-nowrap transition-colors', isActive ? 'text-white' : 'text-slate-700')}>{opt.mobileLabel}</span>
                            <span className={cn('min-w-5 h-5 px-1 rounded-full flex items-center justify-center text-[9px] font-black relative z-10 leading-none', isActive ? 'bg-white/25 text-white' : opt.alert ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600')}>
                                {opt.count > 99 ? '99+' : opt.count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export const HoyTodasMobile = ({
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
    toApproveCount,
    onOpenDrawerAmnistia,
    conteos,
    totalParaSummary,
    vistaActiva,
    onVistaActivaChange,
    puedeFiltrarAtrasadasRechazadas,
    totalHoy,
    totalManana,
    totalSemana,
    totalPrimeraVista,
    totalAtrasadas,
}) => {
    const baseBottom = 84;
    const showCreateFab = false;
    const fabAddBottom = `${baseBottom}px`;
    const fabRefreshBottom = showCreateFab ? `${baseBottom + 60}px` : `${baseBottom}px`;
    const [detailTarget, setDetailTarget] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [adminCloseTarget, setAdminCloseTarget] = useState(null);

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

            <HoyAprobarPanel toApproveCount={toApproveCount} currentUser={currentUser} isMobile />


            <div className="flex flex-col gap-2">
                <GlassDateToggle selected={vistaActiva} onChange={onVistaActivaChange} totalHoy={totalHoy} totalManana={totalManana} totalSemana={totalSemana} totalPrimeraVista={totalPrimeraVista} totalAtrasadas={totalAtrasadas} />
                {currentUser?.rol === 'COORDINADOR_MTTO' && (
                    <HoyTeamToggle value={vistaEquipo} onChange={onVistaEquipoChange} misCount={misTareasCount} eqCount={equipoCount} currentUser={currentUser} isMobile />
                )}
            </div>

            <HoySummaryBar totalParaSummary={totalParaSummary} conteos={conteos} filtroActual={filtroEstado} onFilterChange={onEstadoChange} loading={loading} mostrarRechazadas={mostrarRechazadas} />

            <MobileHoyFilterBar
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
                puedeFiltrarAtrasadasRechazadas={puedeFiltrarAtrasadasRechazadas}
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
                        mensaje={getHoyEmptyCopy(vistaActiva, 'tareas')}
                        subtexto="No hay tareas programadas."
                        icon={getHoyEmptyIcon(vistaActiva)}
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {tickets.map(ticket => (
                        <HoyTicketCard
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
                            onAdminClose={setAdminCloseTarget}
                            onReview={setReviewTarget}
                            onCancel={setCancelTarget}
                        />
                    ))}
                </div>
            )}

            {/* {showCreateFab && (
                <div className="lg:hidden">
                    <GlassFab onClick={onOpenCreate} icon="add" bottom={fabAddBottom} />
                </div>
            )} */}

            <div className="lg:hidden">
                <GlassFab
                    icon="refresh"
                    onClick={hardReload}
                    isLoading={loading}
                    variant="neutral"
                    size={50}
                    bottom={fabRefreshBottom}
                    right="20px"
                />
            </div>

            <div className="lg:hidden">
                <ScrollToTopButton bottom={fabAddBottom} left="20px" />
            </div>

            <HoyDetailModal isOpen={Boolean(detailTarget)} onClose={() => setDetailTarget(null)} ticket={detailTarget} />
            <MobileHoyFormModal scope="general" isOpen={Boolean(editTarget)} onClose={() => setEditTarget(null)} ticketAEditar={editTarget} currentUser={currentUser} tecnicos={tecnicos} isSubmitting={submitting} onSuccess={async (payload) => { await onSave(editTarget.id, payload); setEditTarget(null); }} />
            <TicketAssignModal isOpen={Boolean(assignTarget)} onClose={() => setAssignTarget(null)} ticket={assignTarget} tecnicos={tecnicos} isSubmitting={submitting} onConfirm={async (id, payload) => { await onSave(id, payload); setAssignTarget(null); }} />
            <HoyStatusModal isOpen={Boolean(statusTarget)} onClose={() => setStatusTarget(null)} ticket={statusTarget} currentUser={currentUser} isSubmitting={submitting} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setStatusTarget(null); }} />
            <MobileTicketReviewModal isOpen={Boolean(reviewTarget)} onClose={() => setReviewTarget(null)} ticket={reviewTarget} isSubmitting={submitting} currentUser={currentUser} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setReviewTarget(null); }} />
            <HoyStatusModal isOpen={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} ticket={cancelTarget} currentUser={currentUser} isSubmitting={submitting} forcedEstado="CANCELADA" onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setCancelTarget(null); }} />
            <AdminCloseModal isOpen={Boolean(adminCloseTarget)} onClose={() => setAdminCloseTarget(null)} ticket={adminCloseTarget} isSubmitting={submitting} onConfirm={async (id, payload) => { await onChangeStatus(id, payload); setAdminCloseTarget(null); }} />
        </div>
    );
};

