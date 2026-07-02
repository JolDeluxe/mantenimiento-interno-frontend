// src/features/calendario/views/calendario-desktop.jsx
import React from 'react';
import { InteractiveCalendar } from '@/components/ui/interactive-calendar';
import { CalendarioFilterBar } from '../components/calendario-filter-bar';
import { CalendarItemActions } from '../components/calendar-item-actions';

export const CalendarioDesktop = ({
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
        <div className="flex flex-col gap-4 relative">
            <CalendarioFilterBar
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
                isMobile={false}
                renderActions={(item) => (
                    <CalendarItemActions
                        ticket={item.raw}
                        currentUser={currentUser}
                        onEdit={setEditTarget}
                        onAssign={setAssignTarget}
                        onChangeStatus={setStatusTarget}
                        onReview={setReviewTarget}
                        onCancel={setCancelTarget}
                    />
                )}
            />
        </div>
    );
};
