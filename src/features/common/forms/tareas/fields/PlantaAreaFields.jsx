import React from 'react';
import { Label, Select } from '@/components/form/z_index';
import { Icon } from '@/components/ui/z_index';

/**
 * PlantaAreaFields — campo visual/controlado para Planta y Área/Línea.
 *
 * Se encarga del layout responsive y de agrupar visualmente la ubicación
 * en una card elegante. Toda la lógica de cálculo de opciones, setters y
 * dependencias de maquinaria permanece en el componente padre.
 *
 * Props:
 *  - planta             {string}   — valor seleccionado de planta
 *  - area               {string}   — valor seleccionado de area
 *  - plantas            {array}    — catálogo de plantas
 *  - areasOptions       {array}    — opciones filtradas de áreas
 *  - errorPlanta        {string}   — mensaje de error de planta (fe.planta)
 *  - errorArea          {string}   — mensaje de error de área (fe.area)
 *  - disabledPlanta     {boolean}  — expresión de deshabilitado de planta
 *  - disabledArea       {boolean}  — expresión de deshabilitado de área
 *  - onPlantaChange     {function} — handler para onChange de planta (recibe string)
 *  - onAreaChange       {function} — handler para onChange de área (recibe string)
 *  - layoutClassName    {string}   — clases de grid/layout
 *  - sectionTitle       {string}   — título superior de la sección
 *  - sectionDescription {string}   — descripción corta
 *  - showSectionHeader  {boolean}  — si debe pintar cabecera con icono
 */
export function PlantaAreaFields({
    planta,
    area,
    plantas = [],
    areasOptions = [],
    errorPlanta,
    errorArea,
    disabledPlanta = false,
    disabledArea = false,
    onPlantaChange,
    onAreaChange,
    layoutClassName = 'grid grid-cols-1 md:grid-cols-2 gap-3',
    sectionTitle = 'Ubicación de Atención',
    sectionDescription = 'Especifica la planta y área/línea donde se requiere la intervención.',
    showSectionHeader = true,
}) {
    const hasErrorPlanta = Boolean(errorPlanta);
    const hasErrorArea = Boolean(errorArea);

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {showSectionHeader && (
                <div className="flex items-start gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-marca-primario/10 text-marca-primario flex items-center justify-center shrink-0">
                        <Icon name="location_on" size="sm" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <p className="text-xs font-black text-slate-700 leading-tight">
                            {sectionTitle}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">
                            {sectionDescription}
                        </p>
                    </div>
                </div>
            )}
            
            <div className={layoutClassName}>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="tf-planta" error={hasErrorPlanta}>Planta *</Label>
                    <Select
                        id="tf-planta"
                        value={planta}
                        onChange={(e) => onPlantaChange(e.target.value)}
                        error={hasErrorPlanta}
                        helperText={errorPlanta}
                        disabled={disabledPlanta}
                    >
                        <option value="" disabled hidden>Selecciona planta…</option>
                        {plantas.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="tf-area" error={hasErrorArea}>Área / Línea *</Label>
                    <Select
                        id="tf-area"
                        value={area || ''}
                        onChange={(e) => onAreaChange(e.target.value)}
                        error={hasErrorArea}
                        helperText={errorArea}
                        disabled={disabledArea}
                    >
                        <option value="" disabled hidden>Selecciona área…</option>
                        {areasOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </div>
            </div>
        </div>
    );
}
