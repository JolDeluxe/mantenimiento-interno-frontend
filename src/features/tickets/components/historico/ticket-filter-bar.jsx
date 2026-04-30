import { useState, useEffect } from 'react';
import { Icon, Button, SearchableSelect } from '@/components/ui/z_index';
import { Select, Input } from '@/components/form/z_index';
import { TIPOS, PRIORIDADES, CLASIFICACIONES, PLANTAS, AREAS, AREAS_POR_PLANTA } from '../../constants';
import { cn } from '@/utils/cn';
import { getDateRange, formatFechaNumerica } from '@/lib/date';

const MicrosoftExcel = (props) => (
    <svg {...props} viewBox="0 0 486 500">
        <defs>
            <radialGradient id="microsoft_excel__a" cx="-746.66" cy="781.44" r="13.89" fx="-746.66" fy="781.44" gradientTransform="matrix(-28.32596 -29.80763 -23.11916 21.97986 -2596.39 -38900.31)" gradientUnits="userSpaceOnUse">
                <stop offset=".06" stopColor="#379539" />
                <stop offset=".42" stopColor="#297c2d" />
                <stop offset=".7" stopColor="#15561c" />
            </radialGradient>
            <radialGradient id="microsoft_excel__b" cx="-773.19" cy="771.25" r="13.89" fx="-773.19" fy="771.25" gradientTransform="matrix(-11.97612 -11.58137 -8.95853 9.26806 -2155.12 -15858.88)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#073b10" />
                <stop offset=".99" stopColor="#084a13" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="microsoft_excel__f" cx="-824.11" cy="810.99" r="13.89" fx="-824.11" fy="810.99" gradientTransform="matrix(-9.02 0 0 19.09 -7120.4 -15378.69)" gradientUnits="userSpaceOnUse">
                <stop offset=".29" stopColor="#4eb43b" />
                <stop offset="1" stopColor="#72cc61" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="microsoft_excel__h" cx="-769.14" cy="808.9" r="13.89" fx="-769.14" fy="808.9" gradientTransform="matrix(-16.9077 -13.68182 13.64112 -16.86345 -23523.37 3309.71)" gradientUnits="userSpaceOnUse">
                <stop offset=".44" stopColor="#79e96d" />
                <stop offset="1" stopColor="#d0eb76" />
            </radialGradient>
            <radialGradient id="microsoft_excel__i" cx="-675.64" cy="793.28" r="13.89" fx="-675.64" fy="793.28" gradientTransform="matrix(15.99196 15.99755 45.54153 -45.54797 -25315.85 47178.18)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#20a85e" />
                <stop offset=".94" stopColor="#09442a" />
            </radialGradient>
            <radialGradient id="microsoft_excel__j" cx="-657.62" cy="853.99" r="13.89" fx="-657.62" fy="853.99" gradientTransform="matrix(0 11.2 12.9 0 -10902.85 7734.8)" gradientUnits="userSpaceOnUse">
                <stop offset=".58" stopColor="#33a662" stopOpacity="0" />
                <stop offset=".97" stopColor="#98f0b0" />
            </radialGradient>
            <linearGradient id="microsoft_excel__c" x1="69.43" x2="260.84" y1="210.33" y2="210.33" gradientTransform="matrix(1 0 0 -1 0 502)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#52d17c" />
                <stop offset=".33" stopColor="#4aa647" />
            </linearGradient>
            <linearGradient id="microsoft_excel__d" x1="194.4" x2="194.4" y1="335.33" y2="161.68" gradientTransform="matrix(1 0 0 -1 0 502)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#29852f" />
                <stop offset=".5" stopColor="#4aa647" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="microsoft_excel__e" x1="80.49" x2="311.45" y1="297.22" y2="497.54" gradientTransform="matrix(1 0 0 -1 0 502)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#66d052" />
                <stop offset="1" stopColor="#85e972" />
            </linearGradient>
            <linearGradient id="microsoft_excel__g" x1="182.11" x2="69.43" y1="377" y2="377" gradientTransform="matrix(1 0 0 -1 0 502)" gradientUnits="userSpaceOnUse">
                <stop offset=".18" stopColor="#c0e075" stopOpacity="0" />
                <stop offset="1" stopColor="#d1eb95" />
            </linearGradient>
        </defs>
        <path d="M69.43 159.72c0-34.52 27.98-62.5 62.49-62.5h354.09v361.11c0 23.01-18.65 41.67-41.66 41.67H152.74c-46.01 0-83.31-37.31-83.31-83.33V159.72Z" style={{ fill: "url(#microsoft_excel__a)" }} />
        <path d="M69.43 159.72c0-34.52 27.98-62.5 62.49-62.5h354.09v361.11c0 23.01-18.65 41.67-41.66 41.67H152.74c-46.01 0-83.31-37.31-83.31-83.33V159.72Z" style={{ fill: "url(#microsoft_excel__b)", fillOpacity: ".7" }} />
        <path d="M69.43 229.17c0-34.52 27.98-62.5 62.49-62.5h187.46c-23.01 0-41.66 18.66-41.66 41.67v83.33c0 23.01-18.65 41.67-41.66 41.67h-83.31c-46.01 0-83.31 37.31-83.31 83.33v-187.5Z" style={{ fill: "url(#microsoft_excel__c)" }} />
        <path d="M69.43 229.17c0-34.52 27.98-62.5 62.49-62.5h187.46c-23.01 0-41.66 18.66-41.66 41.67v83.33c0 23.01-18.65 41.67-41.66 41.67h-83.31c-46.01 0-83.31 37.31-83.31 83.33v-187.5Z" style={{ fill: "url(#microsoft_excel__d)", fillOpacity: ".3" }} />
        <path d="M69.43 83.33C69.43 37.31 106.73 0 152.74 0h166.63v166.67H152.74c-46.01 0-83.31 37.31-83.31 83.33V83.33Z" style={{ fill: "url(#microsoft_excel__e)" }} />
        <path d="M69.43 83.33C69.43 37.31 106.73 0 152.74 0h166.63v166.67H152.74c-46.01 0-83.31 37.31-83.31 83.33V83.33Z" style={{ fill: "url(#microsoft_excel__f)" }} />
        <path d="M69.43 83.33C69.43 37.31 106.73 0 152.74 0h166.63v166.67H152.74c-46.01 0-83.31 37.31-83.31 83.33V83.33Z" style={{ fill: "url(#microsoft_excel__g)" }} />
        <rect width="208.29" height="166.67" x="277.71" rx="41.66" ry="41.66" style={{ fill: "url(#microsoft_excel__h)" }} />
        <rect width="222.17" height="222.22" y="236.11" rx="45.13" ry="45.13" style={{ fill: "url(#microsoft_excel__i)" }} />
        <rect width="222.17" height="222.22" y="236.11" rx="45.13" ry="45.13" style={{ fillOpacity: ".3", fill: "url(#microsoft_excel__j)" }} />
        <path d="M169.48 410.71h-34.25l-21.5-40.47c-.77-1.42-1.36-2.54-1.77-3.37-.35-.88-.74-1.89-1.15-3.01h-.35c-.53 1.42-1.03 2.57-1.5 3.45-.47.89-1.03 1.98-1.68 3.28l-22.3 40.11h-32.3l38.76-63.58-36.1-63.4h33.8l19.11 36.13c.77 1.48 1.42 2.78 1.95 3.9.59 1.06 1.18 2.33 1.77 3.81h.35l1.95-4.07c.53-1 1.24-2.33 2.12-3.98l19.82-35.77h32.21l-36.63 62.43 37.7 64.55Z" style={{ fill: "#fff" }} />
    </svg>
);

const normalizeOpts = (opts = []) => opts.map(o => {
    if (typeof o === 'string') return { value: o, label: o };
    return { value: String(o.value ?? o.id), label: String(o.label ?? o.nombre) };
});

const DateRangeSelect = ({ label, icon, value, onChange, quickOptions }) => {
    const [isCustom, setIsCustom] = useState(value.type === 'CUSTOM');

    const handleQuickChange = (newType) => {
        if (newType === 'CUSTOM') {
            setIsCustom(true);
            onChange({ ...value, type: 'CUSTOM' });
        } else if (newType === '' || !newType) {
            setIsCustom(false);
            onChange({ type: '', start: '', end: '' });
        } else {
            setIsCustom(false);
            const range = getDateRange(newType);
            onChange({ type: newType, start: range.startDate, end: range.endDate });
        }
    };

    return (
        <div className="flex flex-col gap-1.5 min-w-48 flex-1">
            <Select
                icon={icon}
                value={value.type}
                onChange={(e) => handleQuickChange(e.target.value)}
                onClear={() => handleQuickChange('')}
                className="font-bold text-[11px] uppercase tracking-wide"
            >
                <option value="">{label}...</option>
                {quickOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
                <option value="CUSTOM">PERSONALIZADO</option>
            </Select>

            {value.type && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg animate-in fade-in duration-300">
                    <Icon name="calendar_today" size="[10px]" className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                        {value.start ? formatFechaNumerica(value.start) : '...'} - {value.end ? formatFechaNumerica(value.end) : '...'}
                    </span>
                </div>
            )}

            {isCustom && (
                <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Input
                        type="date"
                        value={value.start}
                        onChange={(e) => onChange({ ...value, start: e.target.value })}
                        className="h-8 text-[10px] px-2 py-1 font-bold border-slate-200"
                    />
                    <span className="text-slate-400 text-[10px] font-bold">AL</span>
                    <Input
                        type="date"
                        value={value.end}
                        onChange={(e) => onChange({ ...value, end: e.target.value })}
                        className="h-8 text-[10px] px-2 py-1 font-bold border-slate-200"
                    />
                </div>
            )}
        </div>
    );
};

const rolesAdmin = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];

const SearchInput = ({ localValue, onChange, onClear, className = "w-full" }) => (
    <div className={`relative ${className}`}>
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="search" size="sm" className="text-slate-400" />
        </div>
        <input
            type="text"
            value={localValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar ticket, área, ID…"
            className="w-full pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                       focus:outline-none focus:ring-2 focus:ring-marca-secundario/20
                       focus:border-marca-secundario transition-all placeholder:text-slate-400 h-9.5"
        />
        {localValue && (
            <button
                onClick={onClear}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400 cursor-pointer"
            >
                <Icon name="close" size="xs" />
            </button>
        )}
    </div>
);

export const TicketFilterBar = ({
    currentUser,
    query, onSearchChange,
    filtroTipo, onTipoChange,
    filtroPrioridad, onPrioridadChange,
    filtroResponsable, onResponsableChange, opcionesResponsables = [],
    filtroPlanta, onPlantaChange,
    filtroArea, onAreaChange,
    filtroClasificacion, onClasificacionChange,
    filtroProgramacion, onProgramacionChange,
    filtroConclusion, onConclusionChange,
    mostrarAtrasadas, onToggleAtrasadas,
    mostrarPapelera, onTogglePapelera,
    mostrarRechazadas, onToggleRechazadas,
    existenciaGlobal = {},
    totalAtrasadasGlobal = 0,
    onExport
}) => {
    const [localValue, setLocalValue] = useState(query || '');

    useEffect(() => {
        setLocalValue(query || '');
    }, [query]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== query) onSearchChange(localValue);
        }, 450);
        return () => clearTimeout(timer);
    }, [localValue, query, onSearchChange]);

    const totalRechazadas = existenciaGlobal['RECHAZADO'] ?? 0;
    const totalAtrasadas = totalAtrasadasGlobal;
    const rolesAdmin = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];
    const puedeExportar = currentUser && rolesAdmin.includes(currentUser.rol);

    const searchProps = {
        localValue,
        onChange: setLocalValue,
        onClear: () => setLocalValue(''),
    };

    const handlePlantaChange = (nuevaPlanta) => {
        onPlantaChange(nuevaPlanta);
        onAreaChange('');
    };

    const areasDisponibles = (filtroPlanta && AREAS_POR_PLANTA[filtroPlanta])
        ? AREAS_POR_PLANTA[filtroPlanta]
        : AREAS;

    const progOptions = [
        { label: 'HOY', value: 'HOY' },
        { label: 'MAÑANA', value: 'MANANA' },
        { label: 'ESTA SEMANA', value: 'ESTA_SEMANA' },
    ];

    const concOptions = [
        { label: 'HOY', value: 'HOY' },
        { label: 'AYER', value: 'AYER' },
        { label: 'ESTA SEMANA', value: 'ESTA_SEMANA' },
    ];

    return (
        <div className="flex flex-col gap-3 w-full pt-2">
            <div className="flex items-center gap-3 w-full">
                <SearchInput {...searchProps} className="flex-1 max-w-md min-w-50" />

                <div className="flex items-center gap-3 flex-none ml-auto">
                    <div className="relative">
                        <Button
                            variant="filtro_gris"
                            isActive={mostrarAtrasadas}
                            icon={mostrarAtrasadas ? 'close' : 'warning'}
                            size="sm"
                            onClick={onToggleAtrasadas}
                            className={`w-34 flex-none justify-center h-9.5 ${mostrarAtrasadas ? 'bg-amber-500 hover:bg-amber-600 text-white border-transparent ring-0' : ''}`}
                        >
                            Atrasadas
                        </Button>
                        {totalAtrasadas > 0 && !mostrarAtrasadas && (
                            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold border-2 border-white shadow-md z-10 pointer-events-none leading-none">
                                {totalAtrasadas}
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        <Button
                            variant="filtro_rechazado"
                            isActive={mostrarRechazadas}
                            icon={mostrarRechazadas ? 'close' : 'block'}
                            size="sm"
                            onClick={onToggleRechazadas}
                            className="w-34 flex-none justify-center h-9.5"
                        >
                            Rechazadas
                        </Button>
                        {totalRechazadas > 0 && !mostrarRechazadas && (
                            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold border-2 border-white shadow-md z-10 pointer-events-none leading-none">
                                {totalRechazadas}
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        <Button
                            variant="filtro_gris"
                            isActive={mostrarPapelera}
                            icon={mostrarPapelera ? 'close' : 'delete'}
                            size="sm"
                            onClick={onTogglePapelera}
                            className="w-34 flex-none justify-center h-9.5"
                        >
                            Canceladas
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-2.5 w-full flex-wrap">
                <div className="min-w-40 flex-1 lg:flex-none">
                    <SearchableSelect
                        options={TIPOS}
                        value={filtroTipo}
                        onChange={onTipoChange}
                        placeholder="TIPO..."
                        icon="category"
                        allOptionText="TODOS LOS TIPOS"
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                    />
                </div>

                <div className="min-w-40 flex-1 lg:flex-none">
                    <SearchableSelect
                        options={PRIORIDADES}
                        value={filtroPrioridad}
                        onChange={onPrioridadChange}
                        placeholder="PRIORIDAD..."
                        icon="flag"
                        allOptionText="TODAS"
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                    />
                </div>

                <div className="min-w-44 flex-1 lg:flex-none">
                    <SearchableSelect
                        options={CLASIFICACIONES}
                        value={filtroClasificacion}
                        onChange={onClasificacionChange}
                        placeholder="CLASIFICACIÓN..."
                        icon="style"
                        allOptionText="TODAS"
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                    />
                </div>

                <div className="min-w-48 flex-1 lg:flex-none">
                    <SearchableSelect
                        options={normalizeOpts(opcionesResponsables)}
                        value={filtroResponsable ? String(filtroResponsable) : ''}
                        onChange={onResponsableChange}
                        placeholder="RESPONSABLE..."
                        icon="person"
                        allOptionText="CUALQUIERA"
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                    />
                </div>

                <div className="min-w-40 flex-1 lg:flex-none">
                    <SearchableSelect
                        options={normalizeOpts(PLANTAS)}
                        value={filtroPlanta ? String(filtroPlanta) : ''}
                        onChange={handlePlantaChange}
                        placeholder="PLANTA..."
                        icon="domain"
                        allOptionText="TODAS"
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                    />
                </div>

                <div className="min-w-40 flex-1 lg:flex-none">
                    <SearchableSelect
                        options={normalizeOpts(areasDisponibles)}
                        value={filtroArea ? String(filtroArea) : ''}
                        onChange={onAreaChange}
                        placeholder="ÁREA..."
                        icon="place"
                        allOptionText="TODAS"
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                    />
                </div>

                <DateRangeSelect
                    label="FECHA DE CONCLUCIÓN"
                    icon="event_note"
                    value={filtroProgramacion}
                    onChange={onProgramacionChange}
                    quickOptions={progOptions}
                />

                <DateRangeSelect
                    label="CONCLUIDAS"
                    icon="task_alt"
                    value={filtroConclusion}
                    onChange={onConclusionChange}
                    quickOptions={concOptions}
                />

                {puedeExportar && (
                    <div className="flex-none self-start h-9.5">
                        <button
                            type="button"
                            onClick={onExport}
                            className={cn(
                                "h-full px-4 flex items-center justify-center gap-2",
                                "bg-white border border-slate-200 rounded-xl shadow-sm",
                                "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/80 hover:border-emerald-300",
                                "transition-all duration-200 group active:scale-95 cursor-pointer outline-none"
                            )}
                        >
                            <MicrosoftExcel className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                            <span className="font-extrabold text-[11px] uppercase tracking-wider mt-[1px]">
                                Exportar
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
