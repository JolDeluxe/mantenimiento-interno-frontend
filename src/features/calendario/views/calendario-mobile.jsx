// src/features/calendario/views/calendario-mobile.jsx
import React from 'react';
import { InteractiveCalendar } from '@/components/ui/interactive-calendar';
import { MobileCalendarioFilterBar } from '../components/mobile-calendario-filter-bar';
import { CalendarItemActions } from '../components/calendar-item-actions';
import { GlassFab } from '@/components/ui/z_index';
import { hardReload } from '@/utils/hard-reload';


export const CalendarioMobile = ({
    currentUser,
    calendarItems,
    calendarDate,
    onCalendarNavigate,
    calendarView,
    onCalendarViewChange,
    onCalendarDayClick,
    onCalendarItemClick,
    loading,
    tecnicos,
    // Acciones
    setEditTarget,
    setAssignTarget,
    setStatusTarget,
    setAdminCloseTarget,
    setReviewTarget,
    setCancelTarget,
    // Filtros
    scope,
    onScopeChange,
    filtroEstado,
    onFilterChange,
    filtroTipo,
    onTipoChange,
    filtroPrioridad,
    onPrioridadChange,
    filtroCategoria,
    onCategoriaChange,
    filtroClasificacion,
    onClasificacionChange,
    filtroResponsable,
    onResponsableChange,
    filtroPlanta,
    onPlantaChange,
    filtroArea,
    onAreaChange,
    query,
    onSearchChange,
    onClearFilters,
    isFiltering
}) => {
    return (
        <div className="flex flex-col gap-2 relative">
            <div className="px-1 mb-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos uppercase">
                    Calendario
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium leading-snug">
                    Consulta la programación de actividades, mantenimientos y entregas del equipo.
                </p>
            </div>

            <MobileCalendarioFilterBar
                scope={scope}
                onScopeChange={onScopeChange}
                filtroEstado={filtroEstado}
                onFilterChange={onFilterChange}
                filtroTipo={filtroTipo}
                onTipoChange={onTipoChange}
                filtroPrioridad={filtroPrioridad}
                onPrioridadChange={onPrioridadChange}
                filtroCategoria={filtroCategoria}
                onCategoriaChange={onCategoriaChange}
                filtroClasificacion={filtroClasificacion}
                onClasificacionChange={onClasificacionChange}
                filtroResponsable={filtroResponsable}
                onResponsableChange={onResponsableChange}
                filtroPlanta={filtroPlanta}
                onPlantaChange={onPlantaChange}
                filtroArea={filtroArea}
                onAreaChange={onAreaChange}
                query={query}
                onSearchChange={onSearchChange}
                tecnicos={tecnicos}
                onClearFilters={onClearFilters}
                isFiltering={isFiltering}
            />

            <InteractiveCalendar
                items={calendarItems}
                view={calendarView}
                onViewChange={onCalendarViewChange}
                currentDate={calendarDate}
                onNavigate={onCalendarNavigate}
                onDayClick={onCalendarDayClick}
                onItemClick={onCalendarItemClick}
                isLoading={loading}
                isMobile={true}
                renderActions={(item) => (
                    item.isProgramacion ? null : (
                    <CalendarItemActions
                        ticket={item.raw}
                        currentUser={currentUser}
                        onEdit={setEditTarget}
                        onAssign={setAssignTarget}
                        onChangeStatus={setStatusTarget}
                        onAdminClose={setAdminCloseTarget}
                        onReview={setReviewTarget}
                        onCancel={setCancelTarget}
                    />
                    )
                )}
            />

            <div className="lg:hidden">
                <GlassFab
                    icon="refresh"
                    onClick={hardReload}
                    isLoading={loading}
                    variant="neutral"
                    size={50}
                    bottom="84px"
                    right="20px"
                />
            </div>
        </div>
    );
};
