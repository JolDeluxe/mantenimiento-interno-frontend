// src/features/hoy/views/hoy-mantenimientos-desktop.jsx
import React, { useMemo } from 'react';
import { Icon } from '@/components/ui/z_index';
import { RefreshFab } from '@/components/ui/z_index';
import { HoyAddButton } from '../components/hoy-mantenimientos/hoy-add-button';
import { HoyFilterBar } from '../components/hoy-mantenimientos/hoy-filter-bar';
import { HoySummaryBar } from '../components/hoy-mantenimientos/hoy-summary-bar';
import { TicketsEmptyState } from '../components/tickets-empty-state';
import { HoyTicketTable } from '../components/hoy-mantenimientos/hoy-ticket-table';
import { ROLES_ADMIN } from '../constants';
import { cn } from '@/utils/cn';
import { HoyAprobarPanel } from '../components/hoy-mantenimientos/hoy-aprobar-panel';

const DateToggle = ({ selected, onChange, totalHoy, totalManana, totalAtrasadas }) => (
    <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1 shadow-sm">
        {[
            { value: 0, label: 'Hoy', icon: 'today', count: totalHoy, alert: totalAtrasadas > 0 },
            { value: 1, label: 'Mañana', icon: 'event', count: totalManana, alert: false },
        ].map(({ value, label, icon, count, alert }) => (
            <button
                key={value}
                type="button"
                onClick={() => onChange(value)}
                className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 relative cursor-pointer',
                    selected === value
                        ? 'bg-marca-secundario text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                )}
            >
                <Icon name={icon} size="sm" />
                <span>{label}</span>
                {count > 0 && (
                    <span className={cn(
                        'min-w-5 h-5 px-1.5 rounded-full text-[10px] font-extrabold flex items-center justify-center border-2 border-white leading-none shadow-sm',
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

export const HoyMantenimientosDesktop = ({
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
        <div className="flex flex-col gap-5 relative">
            <div>
                <h2 className="fuente-titulos text-2xl text-marca-primario uppercase tracking-wide">Mantenimientos de Maquinaria del Día</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                    {loading ? 'Cargando…' : (
                        <>
                            {tickets.length} mantenimiento{tickets.length !== 1 ? 's' : ''}
                            {dateOffset === 0 ? ' para hoy' : ' para mañana'}
                            {dateOffset === 0 && totalAtrasadas > 0 && (
                                <span className="ml-2 font-semibold text-estado-rechazado">· {totalAtrasadas} atrasado{totalAtrasadas !== 1 ? 's' : ''}</span>
                            )}
                        </>
                    )}
                </p>
            </div>

            <HoyAprobarPanel toApproveCount={toApproveCount} currentUser={currentUser} />

            <HoySummaryBar totalParaSummary={totalParaSummary} conteos={conteos} filtroActual={filtroEstado} onFilterChange={onEstadoChange} loading={loading} />

            <div className="flex items-center justify-between w-full gap-4 flex-wrap">
                <DateToggle selected={dateOffset} onChange={onDateOffsetChange} totalHoy={totalHoy} totalManana={totalManana} totalAtrasadas={totalAtrasadas} />
                <div className="flex items-center gap-2">
                    {puedeCrear && <HoyAddButton onClick={onOpenCreate} isMobile={false} />}
                </div>
            </div>

            <HoyFilterBar
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
                vistaEquipo={vistaEquipo}
                onVistaEquipoChange={onVistaEquipoChange}
                equipoCount={equipoCount}
                misTareasCount={misTareasCount}
                existenciaGlobal={existenciaGlobal}
                totalAtrasadasGlobal={totalAtrasadasGlobal}
                currentUser={currentUser}
                onOpenDrawerAmnistia={onOpenDrawerAmnistia}
                hideStatusFilter
            />

            {!loading && tickets.length === 0 ? (
                <div className="mt-8">
                    <TicketsEmptyState
                        isFiltering={isFilteringActive}
                        onClearFilters={handleClearFilters}
                        onRefresh={onRefresh}
                        mensaje={dateOffset === 0 ? "Sin mantenimientos para hoy" : "Sin mantenimientos para mañana"}
                        subtexto="No hay mantenimientos programados para esta fecha."
                        icon={dateOffset === 0 ? "today" : "event"}
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {/* SECCIÓN 1: AGENDA CRONOLÓGICA */}
                    {agendaTickets.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                                <Icon name="schedule" className="text-marca-secundario shrink-0" />
                                <h3 className="font-bold text-slate-800 text-sm uppercase">Agenda Programada (Cronológica)</h3>
                            </div>
                            <HoyTicketTable
                                tickets={agendaTickets}
                                loading={loading}
                                submitting={submitting}
                                currentUser={currentUser}
                                tecnicos={tecnicos}
                                highlightId={highlightId}
                                onSave={onSave}
                                onChangeStatus={onChangeStatus}
                            />
                        </div>
                    )}

                    {/* SECCIÓN 2: COLA DE TRABAJO */}
                    {(colaTickets.length > 0 || agendaTickets.length === 0) && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                                <Icon name="view_list" className="text-slate-500 shrink-0" />
                                <h3 className="font-bold text-slate-800 text-sm uppercase">Cola de Trabajo (On-Demand / Sin Hora)</h3>
                            </div>
                            <HoyTicketTable
                                tickets={colaTickets}
                                loading={loading}
                                submitting={submitting}
                                currentUser={currentUser}
                                tecnicos={tecnicos}
                                highlightId={highlightId}
                                onSave={onSave}
                                onChangeStatus={onChangeStatus}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
