// src/features/hoy/views/hoy-todas-desktop.jsx
import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { RefreshFab } from '@/components/ui/z_index';
import { HoyFilterBar } from '../components/common/hoy-filter-bar';
import { HoySummaryBar } from '../components/common/hoy-summary-bar';
import { TicketsEmptyState } from '@/features/common/components/tickets-empty-state';
import { HoyTicketTable } from '../components/common/hoy-ticket-table';
import { ROLES_ADMIN } from '@/features/common/constants/catalogos-tareas';
import { cn } from '@/utils/cn';
import { HoyAprobarPanel } from '../components/common/hoy-aprobar-panel';
import { getHoyEmptyCopy, getHoyEmptyIcon, getHoyPeriodoLabel, getHoyVistaOptions } from '../utils/date-filters';

const DateToggle = ({ selected, onChange, totalHoy, totalManana, totalSemana, totalPrimeraVista, totalAtrasadas }) => (
    <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1 shadow-sm">
        {getHoyVistaOptions('general').map(({ id, label, icon }, index) => {
            const count = index === 0 ? totalPrimeraVista : id === 'hoy' ? totalHoy : id === 'manana' ? totalManana : totalSemana;
            const alert = id === 'activas' && totalAtrasadas > 0;
            return (
            <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 relative cursor-pointer',
                    selected === id
                        ? 'bg-marca-secundario text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                )}
            >
                <Icon name={icon} size="sm" />
                <span>{label}</span>
                {count > 0 && (
                    <span className={cn(
                        'min-w-5 h-5 px-1.5 rounded-full text-[10px] font-extrabold flex items-center justify-center border-2 border-white leading-none shadow-sm',
                        selected === id
                            ? 'bg-white text-marca-secundario'
                            : alert ? 'bg-estado-rechazado text-white animate-pulse' : 'bg-slate-200 text-slate-600'
                    )}>
                        {count}
                    </span>
                )}
            </button>
        )})}
    </div>
);

export const HoyTodasDesktop = ({
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
    totalVistaActiva,
    totalAtrasadas,
}) => {
    const totalPeriodo = totalVistaActiva;

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
        <div className="flex flex-col gap-5 relative">

            <HoyAprobarPanel toApproveCount={toApproveCount} currentUser={currentUser} />

            <div>
                <h2 className="fuente-titulos text-2xl text-marca-primario uppercase tracking-wide">Todas las Tareas del Día</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                    {loading ? 'Cargando…' : (
                        <>
                            {totalPeriodo} tarea{totalPeriodo !== 1 ? 's' : ''}
                            {' '}{getHoyPeriodoLabel(vistaActiva)}
                            {puedeFiltrarAtrasadasRechazadas && totalAtrasadas > 0 && (
                                <span className="ml-2 font-semibold text-estado-rechazado">· {totalAtrasadas} atrasada{totalAtrasadas !== 1 ? 's' : ''}</span>
                            )}
                        </>
                    )}
                </p>
            </div>

            <HoySummaryBar totalParaSummary={totalParaSummary} conteos={conteos} filtroActual={filtroEstado} onFilterChange={onEstadoChange} loading={loading} mostrarRechazadas={mostrarRechazadas} />

            <div className="flex items-center justify-between w-full gap-4 flex-wrap">
                <DateToggle selected={vistaActiva} onChange={onVistaActivaChange} totalHoy={totalHoy} totalManana={totalManana} totalSemana={totalSemana} totalPrimeraVista={totalPrimeraVista} totalAtrasadas={totalAtrasadas} />
                {/* <div className="flex items-center gap-2">
                    {puedeCrear && <HoyAddButton onClick={onOpenCreate} isMobile={false} />}
                </div> */}
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
                puedeFiltrarAtrasadasRechazadas={puedeFiltrarAtrasadasRechazadas}
                hideStatusFilter
            />

            {!loading && tickets.length === 0 ? (
                <div className="mt-8">
                    <TicketsEmptyState
                        isFiltering={isFilteringActive}
                        onClearFilters={handleClearFilters}
                        onRefresh={onRefresh}
                        mensaje={getHoyEmptyCopy(vistaActiva, 'tareas')}
                        subtexto="No hay actividades ni mantenimientos programados para esta fecha."
                        icon={getHoyEmptyIcon(vistaActiva)}
                    />
                </div>
            ) : (
                <HoyTicketTable
                    tickets={tickets}
                    loading={loading}
                    submitting={submitting}
                    currentUser={currentUser}
                    tecnicos={tecnicos}
                    highlightId={highlightId}
                    onSave={onSave}
                    onChangeStatus={onChangeStatus}
                    scope="general"
                />
            )}
        </div>
    );
};

