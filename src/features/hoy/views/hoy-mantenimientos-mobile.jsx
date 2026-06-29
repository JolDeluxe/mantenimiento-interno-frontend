// src/features/hoy/views/hoy-mantenimientos-mobile.jsx
import React, { useState, useMemo } from 'react';
import { GlassFab, Icon, Skeleton, ScrollToTopButton } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { HoyTicketCard } from '../components/hoy-mantenimientos/hoy-ticket-card';
import { HoyDetailModal } from '../components/hoy-mantenimientos/hoy-detail-modal';
import { MobileHoyFormModal } from '../components/hoy-mantenimientos/mobile-hoy-form-modal';
import { TicketAssignModal } from '@/features/tickets/components/historico/ticket-assign-modal';
import { HoyStatusModal } from '../components/hoy-mantenimientos/hoy-status-modal';
import { MobileTicketReviewModal } from '@/features/tickets/components/historico/mobile-ticket-review-modal';
import { MobileHoyFilterBar } from '../components/hoy-mantenimientos/mobile-hoy-filter-bar';
import { HoySummaryBar } from '../components/hoy-mantenimientos/hoy-summary-bar';
import { HoyTeamToggle } from '../components/hoy-mantenimientos/hoy-team-toggle';
import { TicketsEmptyState } from '../components/tickets-empty-state';
import { ROLES_ADMIN } from '../constants';
import { cn } from '@/utils/cn';
import { hardReload } from '@/utils/hard-reload';
import { HoyAprobarPanel } from '../components/hoy-mantenimientos/hoy-aprobar-panel';

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

const DateToggle = ({ selected, onChange, totalHoy, totalManana, totalAtrasadas }) => (
    <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1 shadow-sm w-full">
        {[
            { value: 0, label: 'Hoy', icon: 'today', count: totalHoy, alert: totalAtrasadas > 0 },
            { value: 1, label: 'Mañana', icon: 'event', count: totalManana, alert: false },
        ].map(({ value, label, icon, count, alert }) => (
            <button
                key={value}
                type="button"
                onClick={() => onChange(value)}
                className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 relative cursor-pointer',
                    selected === value
                        ? 'bg-marca-secundario text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-55'
                )}
            >
                <Icon name={icon} size="sm" />
                <span>{label}</span>
                {count > 0 && (
                    <span className={cn(
                        'min-w-4 h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center border border-white leading-none shadow-sm',
                        selected === value
                            ? 'bg-white text-marca-secundario'
                            : alert ? 'bg-estado-rechazado text-white animate-pulse' : 'bg-slate-200 text-slate-600'
                    )}>
                        {count}
                    </span>
                )}
            </button>
        ))}
    </div>
);

export const HoyMantenimientosMobile = ({
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

    // --- SEPARACIÓN DE AGENDA Y COLA ---
    const agendaTickets = useMemo(() => tickets.filter(t => t.horaInicioProgramada), [tickets]);
    const colaTickets = useMemo(() => tickets.filter(t => !t.horaInicioProgramada), [tickets]);

    return (
        <div className="flex flex-col gap-4 animate-fade-in pb-28">
            <div className="flex flex-col gap-2">
                <DateToggle selected={dateOffset} onChange={onDateOffsetChange} totalHoy={totalHoy} totalManana={totalManana} totalAtrasadas={totalAtrasadas} />
                <HoyTeamToggle value={vistaEquipo} onChange={onVistaEquipoChange} misCount={misTareasCount} eqCount={equipoCount} currentUser={currentUser} />
            </div>

            <HoyAprobarPanel toApproveCount={toApproveCount} currentUser={currentUser} isMobile />

            <HoySummaryBar totalParaSummary={totalParaSummary} conteos={conteos} filtroActual={filtroEstado} onFilterChange={onEstadoChange} loading={loading} />

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
                        mensaje={dateOffset === 0 ? "Sin mantenimientos para hoy" : "Sin mantenimientos para mañana"}
                        subtexto="No hay mantenimientos programados."
                        icon={dateOffset === 0 ? "today" : "event"}
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* SECCIÓN 1: AGENDA CRONOLÓGICA */}
                    {agendaTickets.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5 px-1">
                                <Icon name="schedule" className="text-marca-secundario shrink-0" size="sm" />
                                <h3 className="font-bold text-slate-800 text-xs uppercase">Agenda Programada</h3>
                            </div>
                            <div className="flex flex-col gap-3">
                                {agendaTickets.map(ticket => (
                                    <HoyTicketCard
                                        key={ticket.id}
                                        ticket={ticket}
                                        currentUser={currentUser}
                                        tecnicos={tecnicos}
                                        highlightId={highlightId}
                                        onSave={onSave}
                                        onChangeStatus={onChangeStatus}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN 2: COLA DE TRABAJO */}
                    {(colaTickets.length > 0 || agendaTickets.length === 0) && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5 px-1">
                                <Icon name="view_list" className="text-slate-500 shrink-0" size="sm" />
                                <h3 className="font-bold text-slate-800 text-xs uppercase">Cola de Trabajo (Sin Hora)</h3>
                            </div>
                            <div className="flex flex-col gap-3">
                                {colaTickets.map(ticket => (
                                    <HoyTicketCard
                                        key={ticket.id}
                                        ticket={ticket}
                                        currentUser={currentUser}
                                        tecnicos={tecnicos}
                                        highlightId={highlightId}
                                        onSave={onSave}
                                        onChangeStatus={onChangeStatus}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {puedeCrear && (
                <div className="lg:hidden">
                    <GlassFab onClick={onOpenCreate} icon="add" bottom="84px" />
                </div>
            )}

            <ScrollToTopButton bottom="84px" />
        </div>
    );
};
