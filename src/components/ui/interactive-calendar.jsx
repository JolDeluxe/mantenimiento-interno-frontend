// src/components/ui/interactive-calendar.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Icon, Button, Spinner } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const COLOR_MAP = {
    PENDIENTE: 'bg-estado-pendiente/10 text-estado-pendiente hover:bg-estado-pendiente/25 border-estado-pendiente',
    ASIGNADA: 'bg-estado-asignada/10 text-estado-asignada hover:bg-estado-asignada/25 border-estado-asignada',
    EN_PROGRESO: 'bg-estado-en-progreso/10 text-estado-en-progreso hover:bg-estado-en-progreso/25 border-estado-en-progreso',
    EN_PAUSA: 'bg-estado-en-pausa/10 text-estado-en-pausa hover:bg-estado-en-pausa/25 border-estado-en-pausa',
    RESUELTO: 'bg-estado-resuelto/10 text-estado-resuelto hover:bg-estado-resuelto/25 border-estado-resuelto',
    CERRADO: 'bg-estado-cerrado/10 text-estado-cerrado hover:bg-estado-cerrado/25 border-estado-cerrado',
    RECHAZADO: 'bg-estado-rechazado/10 text-estado-rechazado hover:bg-estado-rechazado/25 border-estado-rechazado',
    CANCELADA: 'bg-estado-cancelada/10 text-estado-cancelada hover:bg-estado-cancelada/25 border-estado-cancelada',
};

const DOT_COLOR_MAP = {
    PENDIENTE: 'bg-estado-pendiente',
    ASIGNADA: 'bg-estado-asignada',
    EN_PROGRESO: 'bg-estado-en-progreso',
    EN_PAUSA: 'bg-estado-en-pausa',
    RESUELTO: 'bg-estado-resuelto',
    CERRADO: 'bg-estado-cerrado',
    RECHAZADO: 'bg-estado-rechazado',
    CANCELADA: 'bg-estado-cancelada',
};

export const InteractiveCalendar = ({
    items = [],
    view: controlledView,
    onViewChange,
    currentDate: controlledDate,
    onNavigate,
    onDayClick,
    onItemClick,
    renderBadge,
    renderActions,
    isLoading = false,
    isMobile = false,
}) => {
    const [localView, setLocalView] = useState('week');
    const [localDate, setLocalDate] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState(new Date().toLocaleDateString('en-CA'));

    const activeView = controlledView || localView;
    const activeDate = useMemo(() => {
        const raw = controlledDate || localDate;
        return raw instanceof Date ? raw : new Date(raw);
    }, [controlledDate, localDate]);

    // Update selected date if range changes
    useEffect(() => {
        const dStr = activeDate.toLocaleDateString('en-CA');
        setSelectedDateStr(dStr);
    }, [activeDate]);

    const handleViewChange = (v) => {
        if (onViewChange) onViewChange(v);
        else setLocalView(v);
    };

    const handleNavigate = (newDate) => {
        if (onNavigate) onNavigate(newDate);
        else setLocalDate(newDate);
    };

    // Calculate grid days
    const gridDays = useMemo(() => {
        if (activeView === 'week') {
            const dayOfWeekIndex = activeDate.getDay() - 1 === -1 ? 6 : activeDate.getDay() - 1;
            const startOfWeek = new Date(activeDate);
            startOfWeek.setDate(activeDate.getDate() - dayOfWeekIndex);

            const days = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(startOfWeek);
                d.setDate(startOfWeek.getDate() + i);
                days.push(d);
            }
            return days;
        } else {
            const year = activeDate.getFullYear();
            const month = activeDate.getMonth();
            const firstDay = new Date(year, month, 1);
            let firstDayOfWeekIndex = firstDay.getDay() - 1;
            if (firstDayOfWeekIndex === -1) firstDayOfWeekIndex = 6;

            const startGridDate = new Date(firstDay);
            startGridDate.setDate(firstDay.getDate() - firstDayOfWeekIndex);

            const days = [];
            for (let i = 0; i < 42; i++) {
                const d = new Date(startGridDate);
                d.setDate(startGridDate.getDate() + i);
                days.push(d);
            }
            return days;
        }
    }, [activeView, activeDate]);

    // Group items by date string
    const itemsByDate = useMemo(() => {
        const map = {};
        items.forEach((item) => {
            if (!item.date) return;
            const dStr = item.date;
            if (!map[dStr]) map[dStr] = [];
            map[dStr].push(item);
        });
        return map;
    }, [items]);

    // Nav actions
    const handlePrev = () => {
        const next = new Date(activeDate);
        if (activeView === 'week') {
            next.setDate(activeDate.getDate() - 7);
        } else {
            next.setMonth(activeDate.getMonth() - 1);
        }
        handleNavigate(next);
    };

    const handleNext = () => {
        const next = new Date(activeDate);
        if (activeView === 'week') {
            next.setDate(activeDate.getDate() + 7);
        } else {
            next.setMonth(activeDate.getMonth() + 1);
        }
        handleNavigate(next);
    };

    const handleToday = () => {
        const today = new Date();
        handleNavigate(today);
        setSelectedDateStr(today.toLocaleDateString('en-CA'));
    };

    // Label formatted
    const titleLabel = useMemo(() => {
        if (activeView === 'week') {
            const start = gridDays[0];
            const end = gridDays[6];
            if (!start || !end) return '';
            
            if (start.getFullYear() !== end.getFullYear()) {
                return `${MONTHS[start.getMonth()]} ${start.getFullYear()} - ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
            }
            if (start.getMonth() !== end.getMonth()) {
                return `${MONTHS[start.getMonth()]} - ${MONTHS[end.getMonth()]} ${start.getFullYear()}`;
            }
            return `${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
        } else {
            return `${MONTHS[activeDate.getMonth()]} ${activeDate.getFullYear()}`;
        }
    }, [activeView, activeDate, gridDays]);

    const activeDayItems = useMemo(() => {
        return itemsByDate[selectedDateStr] || [];
    }, [itemsByDate, selectedDateStr]);

    const isFutureOrToday = useMemo(() => {
        if (!selectedDateStr) return false;
        const selected = new Date(selectedDateStr + 'T00:00:00');
        const todayStr = new Date().toLocaleDateString('en-CA');
        const today = new Date(todayStr + 'T00:00:00');
        return selected >= today;
    }, [selectedDateStr]);

    return (
        <div className={cn(
            "bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm flex flex-col w-full",
            activeView === 'month' ? 'min-h-[350px]' : 'min-h-0'
        )}>
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-2.5 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <Button variant="ghost" size="sm" onClick={handlePrev} className="bg-slate-50 border border-slate-200 h-8 w-8 p-0 flex items-center justify-center cursor-pointer">
                        <Icon name="chevron_left" size="sm" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleNext} className="bg-slate-50 border border-slate-200 h-8 w-8 p-0 flex items-center justify-center cursor-pointer">
                        <Icon name="chevron_right" size="sm" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleToday} className="bg-slate-50 border border-slate-200 font-bold px-2.5 h-8 cursor-pointer text-xs">
                        Hoy
                    </Button>
                    <span className="text-sm font-extrabold text-slate-800 ml-2 select-none uppercase tracking-tight">
                        {titleLabel}
                    </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <div className="inline-flex bg-slate-100 border border-slate-200/60 p-0.5 rounded-lg shadow-inner">
                        <button
                            type="button"
                            onClick={() => handleViewChange('week')}
                            className={cn(
                                'px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer',
                                activeView === 'week' ? 'bg-white text-marca-primario shadow-sm' : 'text-slate-500 hover:text-slate-800'
                            )}
                        >
                            Semana
                        </button>
                        <button
                            type="button"
                            onClick={() => handleViewChange('month')}
                            className={cn(
                                'px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer',
                                activeView === 'month' ? 'bg-white text-marca-primario shadow-sm' : 'text-slate-500 hover:text-slate-800'
                            )}
                        >
                            Mes
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            <div className="relative flex-1 flex flex-col">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center backdrop-blur-[1px] transition-all rounded-xl">
                        <div className="flex flex-col items-center gap-2">
                            <Spinner size="sm" className="text-marca-primario" />
                            <span className="text-[10px] font-bold text-slate-400">Actualizando...</span>
                        </div>
                    </div>
                )}

                {/* Calendar Grid */}
                <div className="flex-1 flex flex-col w-full overflow-hidden">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 gap-1 mb-1 text-center">
                        {DAYS_OF_WEEK.map((day) => (
                            <div key={day} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-0.5 select-none">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className={cn(
                        'grid grid-cols-7 gap-1',
                        activeView === 'month' ? 'auto-rows-fr flex-1' : 'min-h-0'
                    )}>
                        {gridDays.map((dateObj, idx) => {
                            const dStr = dateObj.toLocaleDateString('en-CA');
                            const dayNum = dateObj.getDate();
                            const isToday = new Date().toLocaleDateString('en-CA') === dStr;
                            const isSelected = selectedDateStr === dStr;
                            const isCurrentMonth = dateObj.getMonth() === activeDate.getMonth();
                            const dayItems = itemsByDate[dStr] || [];

                            if (isMobile) {
                                return (
                                    <button
                                        key={`${dStr}-${idx}`}
                                        type="button"
                                        onClick={() => {
                                            setSelectedDateStr(dStr);
                                            const selectedDate = new Date(dStr + 'T00:00:00');
                                            const todayStr = new Date().toLocaleDateString('en-CA');
                                            const today = new Date(todayStr + 'T00:00:00');
                                            if (selectedDate >= today && dayItems.length === 0) {
                                                if (onDayClick) onDayClick(dStr);
                                            }
                                        }}
                                        className={cn(
                                            'aspect-square flex flex-col items-center justify-between p-0.5 rounded-lg border transition-all cursor-pointer relative',
                                            isSelected
                                                ? 'bg-marca-primario/10 border-marca-primario/40 ring-1 ring-marca-primario'
                                                : isToday
                                                    ? 'bg-slate-50 border-marca-secundario text-marca-secundario'
                                                    : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700',
                                            !isCurrentMonth && 'opacity-30'
                                        )}
                                    >
                                        <span className={cn(
                                            'text-[10px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full leading-none mt-0.5',
                                            isToday && !isSelected && 'bg-marca-secundario text-white',
                                            isSelected && 'bg-marca-primario text-white'
                                        )}>
                                            {dayNum}
                                        </span>
                                        {/* Status Dots */}
                                        <div className="flex gap-0.5 mt-auto mb-0.5 max-w-full overflow-hidden shrink-0">
                                            {dayItems.slice(0, 3).map((item, i) => (
                                                <span
                                                    key={item.id || i}
                                                    className={cn('w-1 h-1 rounded-full shrink-0', DOT_COLOR_MAP[item.colorKey] || 'bg-slate-400')}
                                                />
                                            ))}
                                            {dayItems.length > 3 && (
                                                <span className="w-1 h-1 rounded-full bg-slate-500 shrink-0"></span>
                                            )}
                                        </div>
                                    </button>
                                );
                            }

                            // Desktop layout
                            return (
                                <div
                                    key={`${dStr}-${idx}`}
                                    onClick={() => setSelectedDateStr(dStr)}
                                    className={cn(
                                        'min-h-[75px] lg:min-h-[95px] bg-white border rounded-xl p-1 flex flex-col gap-0.5 transition-all group relative cursor-pointer',
                                        isSelected
                                            ? 'bg-marca-primario/5 border-marca-primario ring-1 ring-marca-primario'
                                            : isToday
                                                ? 'bg-slate-50/40 border-marca-secundario/40 text-marca-secundario'
                                                : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-700',
                                        !isCurrentMonth && 'opacity-40'
                                    )}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className={cn(
                                            'text-[10px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full select-none leading-none',
                                            isToday && 'bg-marca-secundario text-white font-black',
                                        )}>
                                            {dayNum}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => onDayClick && onDayClick(dStr)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5 hover:bg-slate-150 rounded text-slate-400 hover:text-marca-primario"
                                            title="Programar tarea para este día"
                                        >
                                            <Icon name="add" size="xs" />
                                        </button>
                                    </div>

                                    {/* Task list container */}
                                    <div className="flex-1 min-h-0 flex flex-col gap-0.5 overflow-y-auto no-scrollbar">
                                        {dayItems.slice(0, 3).map((item) => {
                                            const colorCls = COLOR_MAP[item.colorKey] || 'bg-slate-100 text-slate-600 border-slate-200';
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => onItemClick && onItemClick(item)}
                                                    className={cn(
                                                        'text-[9px] font-bold px-1.5 py-0.5 rounded-r border-l-2 truncate cursor-pointer transition-all leading-normal select-none shadow-sm',
                                                        colorCls
                                                    )}
                                                    title={item.title}
                                                >
                                                    {item.title}
                                                </div>
                                            );
                                        })}
                                        {dayItems.length > 3 && (
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedDateStr(dStr); }}
                                                className="text-[8px] font-extrabold text-marca-primario hover:underline text-left cursor-pointer pl-0.5 mt-0.5"
                                            >
                                                + {dayItems.length - 3} más
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Day detail explorer (Desktop/Mobile) */}
            {selectedDateStr && (
                <div className="mt-2.5 border-t border-slate-100 pt-2.5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <Icon name="event_note" size="sm" className="text-slate-500" />
                            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-tight">
                                {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </h4>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                {activeDayItems.length}
                            </span>
                        </div>
                        {isFutureOrToday && (
                            <Button
                                size="xs"
                                variant="primario"
                                onClick={() => onDayClick && onDayClick(selectedDateStr)}
                                className="text-[9px] py-0.5 px-2 font-bold cursor-pointer h-6 flex items-center"
                            >
                                + Programar
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto no-scrollbar">
                        {activeDayItems.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic text-center py-2.5 bg-slate-50/50 rounded-lg">No hay tareas programadas para este día.</p>
                        ) : (
                            activeDayItems.map((item) => {
                                const colorCls = COLOR_MAP[item.colorKey] || 'bg-slate-100 text-slate-600 border-slate-200';
                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-colors"
                                    >
                                        <div 
                                            onClick={() => onItemClick && onItemClick(item)}
                                            className="flex-1 min-w-0 flex flex-col gap-0.5 cursor-pointer"
                                        >
                                            <span className="text-[11px] font-bold text-slate-800 leading-snug truncate">
                                                {item.title}
                                            </span>
                                            {item.raw?.tipo && (
                                                <span className="text-[9px] text-slate-400">
                                                    {item.raw?.tipo} {item.raw?.clasificacion ? `· ${item.raw.clasificacion}` : ''}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            {renderActions && renderActions(item)}
                                            <span className={cn(
                                                'text-[8px] font-black uppercase px-1.5 py-0.5 rounded border tracking-wide whitespace-nowrap shrink-0',
                                                colorCls
                                            )}>
                                                {item.colorKey}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

