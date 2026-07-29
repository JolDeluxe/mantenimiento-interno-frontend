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
    setAdminCloseTarget,
    setReviewTarget,
    setCancelTarget,
    // Filtros
    scope,
    onScopeChange,
    filtroEstado,
    onFilterChange,
    filtroPrioridad,
    onPrioridadChange,
    filtroCategoria,
    onCategoriaChange,
    filtroClasificacion,
    onClasificacionChange,
    filtroResponsable,
    onResponsableChange,
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
                filtroPrioridad={filtroPrioridad}
                onPrioridadChange={onPrioridadChange}
                filtroCategoria={filtroCategoria}
                onCategoriaChange={onCategoriaChange}
                filtroClasificacion={filtroClasificacion}
                onClasificacionChange={onClasificacionChange}
                filtroResponsable={filtroResponsable}
                onResponsableChange={onResponsableChange}
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
        </div>
    );
};
