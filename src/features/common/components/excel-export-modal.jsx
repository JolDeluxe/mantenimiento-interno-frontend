// src/features/common/components/excel-export-modal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Icon, Button } from '@/components/ui/z_index';
import { Select, Input, Label } from '@/components/form/z_index';
import { formatFechaNumerica } from '@/lib/date';
import api from '@/lib/axios';
import { notify } from '@/components/notification/adaptive-notify';
import { cn } from '@/utils/cn';

const ESTADOS = [
    { value: 'TODOS', label: 'Todos los estados' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'ASIGNADA', label: 'Asignada' },
    { value: 'EN_PROGRESO', label: 'En progreso' },
    { value: 'EN_PAUSA', label: 'En pausa' },
    { value: 'RECHAZADO', label: 'Rechazado' },
    { value: 'RESUELTO', label: 'Resuelto' },
    { value: 'CERRADO', label: 'Cerrado' },
    { value: 'CANCELADA', label: 'Cancelada' },
];

const CLASIFICACIONES = [
    { value: 'TODAS', label: 'Todas las clasificaciones' },
    { value: 'PREVENTIVO', label: 'Preventivo' },
    { value: 'CORRECTIVO', label: 'Correctivo' },
    { value: 'RUTINA', label: 'Rutina' },
];

const PLANTAS = [
    { value: 'TODAS', label: 'Todas las plantas' },
    { value: 'KAPPA', label: 'Kappa' },
    { value: 'OMEGA', label: 'Omega' },
    { value: 'SIGMA', label: 'Sigma' },
    { value: 'LAMBDA', label: 'Lambda' },
];

const TIPOS_FECHA = [
    { value: 'CREACION', label: 'Fecha de Creación' },
    { value: 'VENCIMIENTO', label: 'Fecha de Vencimiento' },
    { value: 'CONCLUSION', label: 'Fecha de Finalización' },
];

export const ExcelExportModal = ({
    isOpen,
    onClose,
    defaultClasificacion = '', // 'CORRECTIVO' o 'PREVENTIVO'
    scope = 'general', // 'mantenimientos' o 'actividades' o 'general'
    currentFilters = {}, // filtros aplicados actualmente en la tabla
}) => {
    const [periodType, setPeriodType] = useState('ACTUAL'); // 'ACTUAL', 'DIA', 'SEMANA', 'MES', 'RANGO'
    const [dateType, setDateType] = useState('CREACION'); // 'CREACION', 'VENCIMIENTO', 'CONCLUSION'
    const [fechaDia, setFechaDia] = useState(new Date().toISOString().split('T')[0]);
    const [fechaSemanaInicio, setFechaSemanaInicio] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [rangoInicio, setRangoInicio] = useState(new Date().toISOString().split('T')[0]);
    const [rangoFin, setRangoFin] = useState(new Date().toISOString().split('T')[0]);

    // Filtros extra
    const [clasificacion, setClasificacion] = useState(defaultClasificacion || 'TODAS');
    const [estado, setEstado] = useState('TODOS');
    const [planta, setPlanta] = useState('TODAS');
    const [isExporting, setIsExporting] = useState(false);

    // Actualizar clasificación si cambia la default
    useEffect(() => {
        if (defaultClasificacion) {
            setClasificacion(defaultClasificacion);
        } else {
            setClasificacion('TODAS');
        }
    }, [defaultClasificacion, isOpen]);

    if (!isOpen) return null;

    // Calcular fechas del rango de semana
    const getWeekRangeText = () => {
        if (!fechaSemanaInicio) return '';
        const start = new Date(fechaSemanaInicio);
        const end = new Date(fechaSemanaInicio);
        end.setDate(end.getDate() + 6);
        return `${formatFechaNumerica(start)} al ${formatFechaNumerica(end)}`;
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Construir payload
            const params = { page: 1, limit: 10000 };

            if (scope) params.scope = scope;

            // Filtros demográficos
            if (clasificacion && clasificacion !== 'TODAS') params.clasificacion = clasificacion;
            if (estado && estado !== 'TODOS') params.estado = estado;
            if (planta && planta !== 'TODAS') params.planta = planta;

            // Tipo de fecha
            const dateKeyStart = dateType === 'CREACION' ? 'fechaInicio' : (dateType === 'VENCIMIENTO' ? 'vencimientoDesde' : 'finalizadoDesde');
            const dateKeyEnd = dateType === 'CREACION' ? 'fechaFin' : (dateType === 'VENCIMIENTO' ? 'vencimientoHasta' : 'finalizadoHasta');

            if (periodType === 'DIA') {
                if (fechaDia) {
                    params[dateKeyStart] = fechaDia;
                    params[dateKeyEnd] = fechaDia;
                }
            } else if (periodType === 'SEMANA') {
                if (fechaSemanaInicio) {
                    params[dateKeyStart] = fechaSemanaInicio;
                    const end = new Date(fechaSemanaInicio);
                    end.setDate(end.getDate() + 6);
                    params[dateKeyEnd] = end.toISOString().split('T')[0];
                }
            } else if (periodType === 'MES') {
                params.year = selectedYear;
                if (selectedMonth > 0) {
                    params.month = selectedMonth;
                }
            } else if (periodType === 'RANGO') {
                if (rangoInicio) params[dateKeyStart] = rangoInicio;
                if (rangoFin) params[dateKeyEnd] = rangoFin;
            } else if (periodType === 'ACTUAL') {
                // Combinamos los filtros actuales de la pantalla
                Object.assign(params, currentFilters);
                params.page = 1;
                params.limit = 10000;
            }

            // Realizar llamada al API
            const response = await api.get('/api/tickets', { params });
            const records = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

            if (records.length === 0) {
                notify.info('No se encontraron registros para los filtros seleccionados.');
                setIsExporting(false);
                return;
            }

            // Generar CSV
            const headers = [
                'ID',
                'Título',
                'Estado',
                'Prioridad',
                'Tipo',
                'Clasificación',
                'Máquina',
                'Planta',
                'Área',
                'Responsables',
                'Creación',
                'Vencimiento',
                'Finalización',
                'Paro Producción',
                'Duración Real (Min)'
            ];

            const rows = records.map(t => [
                t.id,
                `"${(t.titulo || '').replace(/"/g, '""')}"`,
                t.estado || '',
                t.prioridad || '',
                t.tipo === 'TICKET' ? 'REPORTE' : (t.tipo || ''),
                t.clasificacion || '',
                t.maquina?.codigo || 'N/A',
                t.planta || '',
                t.area || '',
                `"${(t.responsables?.map(r => r.nombre).join(', ') || 'Sin asignar').replace(/"/g, '""')}"`,
                formatFechaNumerica(t.createdAt),
                formatFechaNumerica(t.fechaVencimiento),
                formatFechaNumerica(t.finalizadoAt) || 'N/A',
                t.paroProduccion ? 'SÍ' : 'NO',
                t.duracionReal ?? 0
            ]);

            // prepend BOM \uFEFF for Excel Spanish characters compatibility
            const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            // Nombre de archivo descriptivo
            const fileNameScope = scope === 'mantenimientos' ? 'mantenimientos' : 'tickets';
            const fileNameClasif = clasificacion !== 'TODAS' ? `_${clasificacion.toLowerCase()}` : '';
            link.setAttribute('href', url);
            link.setAttribute('download', `reporte_${fileNameScope}${fileNameClasif}_${Date.now()}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            notify.success(`Exportación de ${records.length} registros completada con éxito.`);
            onClose();
        } catch (err) {
            console.error('Error al exportar reporte:', err);
            notify.error('Ocurrió un error al generar la exportación.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">
            <ModalHeader title="Exportar Reporte a Excel" onClose={onClose} />
            <ModalBody className="space-y-4">
                {/* 1. Selector de tipo de periodo */}
                <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Periodo de Exportación
                    </Label>
                    <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                        {[
                            { id: 'ACTUAL', label: 'Actual', icon: 'filter_alt' },
                            { id: 'DIA', label: 'Día', icon: 'today' },
                            { id: 'SEMANA', label: 'Semana', icon: 'date_range' },
                            { id: 'MES', label: 'Mes', icon: 'calendar_month' },
                            { id: 'RANGO', label: 'Rango', icon: 'date_range' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setPeriodType(opt.id)}
                                className={cn(
                                    "flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer outline-none border border-transparent",
                                    periodType === opt.id
                                        ? "bg-white text-marca-primario shadow-sm border-slate-200"
                                        : "text-slate-500 hover:bg-white/50"
                                )}
                            >
                                <Icon name={opt.icon} size="xs" className="mb-0.5" />
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Tipo de fecha a evaluar */}
                {periodType !== 'ACTUAL' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                        <div>
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                Filtrar Por Tipo de Fecha
                            </Label>
                            <Select
                                value={dateType}
                                onChange={(e) => setDateType(e.target.value)}
                                className="h-10 text-xs font-bold"
                            >
                                {TIPOS_FECHA.map(tf => (
                                    <option key={tf.value} value={tf.value}>{tf.label}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                )}

                {/* 3. Inputs dinámicos según el periodo */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[90px] flex flex-col justify-center">
                    {periodType === 'ACTUAL' && (
                        <div className="flex items-start gap-3 animate-in fade-in duration-300">
                            <Icon name="info" className="text-blue-500 shrink-0 mt-0.5" size="sm" />
                            <div>
                                <p className="text-xs font-bold text-slate-700">Filtros de la tabla activa</p>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Se exportará la totalidad de registros que coincidan con los filtros y la búsqueda textual aplicados actualmente en la pantalla de fondo.
                                </p>
                            </div>
                        </div>
                    )}

                    {periodType === 'DIA' && (
                        <div className="space-y-1.5 animate-in slide-in-from-left duration-250">
                            <Label className="text-[11px] font-bold text-slate-400 uppercase">Selecciona el día</Label>
                            <Input
                                type="date"
                                value={fechaDia}
                                onChange={(e) => setFechaDia(e.target.value)}
                                className="h-10 text-xs font-semibold"
                            />
                        </div>
                    )}

                    {periodType === 'SEMANA' && (
                        <div className="space-y-2 animate-in slide-in-from-left duration-250">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-[11px] font-bold text-slate-400 uppercase">Día de Inicio de la Semana</Label>
                                <Input
                                    type="date"
                                    value={fechaSemanaInicio}
                                    onChange={(e) => setFechaSemanaInicio(e.target.value)}
                                    className="h-10 text-xs font-semibold"
                                />
                            </div>
                            {fechaSemanaInicio && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600">
                                    <Icon name="calendar_today" size="xs" className="text-slate-400" />
                                    <span className="text-xs font-bold uppercase tracking-wide">
                                        Rango a exportar: <span className="text-marca-primario">{getWeekRangeText()}</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {periodType === 'MES' && (
                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-left duration-250">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-400 uppercase">Mes</Label>
                                <Select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="h-10 text-xs font-semibold"
                                >
                                    {[
                                        { value: 1, label: 'Enero' },
                                        { value: 2, label: 'Febrero' },
                                        { value: 3, label: 'Marzo' },
                                        { value: 4, label: 'Abril' },
                                        { value: 5, label: 'Mayo' },
                                        { value: 6, label: 'Junio' },
                                        { value: 7, label: 'Julio' },
                                        { value: 8, label: 'Agosto' },
                                        { value: 9, label: 'Septiembre' },
                                        { value: 10, label: 'Octubre' },
                                        { value: 11, label: 'Noviembre' },
                                        { value: 12, label: 'Diciembre' },
                                    ].map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-400 uppercase">Año</Label>
                                <Select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="h-10 text-xs font-semibold"
                                >
                                    {Array.from({ length: 6 }).map((_, i) => {
                                        const y = new Date().getFullYear() - 4 + i;
                                        return <option key={y} value={y}>{y}</option>;
                                    })}
                                </Select>
                            </div>
                        </div>
                    )}

                    {periodType === 'RANGO' && (
                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-left duration-250">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-400 uppercase">Desde</Label>
                                <Input
                                    type="date"
                                    value={rangoInicio}
                                    onChange={(e) => setRangoInicio(e.target.value)}
                                    className="h-10 text-xs font-semibold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-400 uppercase">Hasta</Label>
                                <Input
                                    type="date"
                                    value={rangoFin}
                                    onChange={(e) => setRangoFin(e.target.value)}
                                    className="h-10 text-xs font-semibold"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Filtros adicionales condicionales */}
                {periodType !== 'ACTUAL' && (
                    <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 animate-in fade-in duration-300">
                        <div>
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                Clasificación
                            </Label>
                            <Select
                                value={clasificacion}
                                onChange={(e) => setClasificacion(e.target.value)}
                                disabled={Boolean(defaultClasificacion)}
                                className="h-10 text-xs font-bold"
                            >
                                {CLASIFICACIONES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                Estado
                            </Label>
                            <Select
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                className="h-10 text-xs font-bold"
                            >
                                {ESTADOS.map(es => (
                                    <option key={es.value} value={es.value}>{es.label}</option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                Planta
                            </Label>
                            <Select
                                value={planta}
                                onChange={(e) => setPlanta(e.target.value)}
                                className="h-10 text-xs font-bold"
                            >
                                {PLANTAS.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={isExporting}
                    className="cursor-pointer"
                >
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    onClick={handleExport}
                    isLoading={isExporting}
                    className="flex items-center gap-1.5 font-bold cursor-pointer bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                >
                    <Icon name="download" size="xs" />
                    <span>Exportar Excel</span>
                </Button>
            </ModalFooter>
        </Modal>
    );
};
