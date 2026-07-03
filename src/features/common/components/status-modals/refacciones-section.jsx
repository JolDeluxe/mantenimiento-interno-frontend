import { Button, Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { sanitizeRefacciones } from './refacciones-utils';

export const RefaccionesSection = ({
    usaRefacciones,
    onUsaRefaccionesChange,
    refacciones,
    onRefaccionesChange,
    disabled = false,
}) => {
    const handleAdd = () => {
        onRefaccionesChange([...refacciones, { nombre: '', cantidad: 1, codigo: '' }]);
    };

    const handleRemove = (index) => {
        onRefaccionesChange(refacciones.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        onRefaccionesChange(
            refacciones.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref))
        );
    };

    const hasValidItems = sanitizeRefacciones(refacciones).length > 0;

    return (
        <div className="flex flex-col gap-3 mt-4 border-t border-slate-100 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                        <Icon name="construction" size="xs" className="text-slate-500 shrink-0" />
                        ¿Usó refacciones?
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Actívalo sólo si cambiaste o consumiste piezas.
                    </p>
                </div>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onUsaRefaccionesChange(!usaRefacciones)}
                    className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed',
                        usaRefacciones ? 'bg-marca-secundario' : 'bg-slate-300'
                    )}
                    aria-pressed={usaRefacciones}
                >
                    <span
                        className={cn(
                            'h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform',
                            usaRefacciones ? 'translate-x-5' : 'translate-x-0'
                        )}
                    />
                </button>
            </div>

            {usaRefacciones && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">Refacciones utilizadas *</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            icon="add"
                            onClick={handleAdd}
                            disabled={disabled}
                            className="text-marca-secundario border border-marca-secundario/25 bg-marca-secundario/5 hover:bg-marca-secundario/10 font-bold"
                        >
                            Agregar
                        </Button>
                    </div>

                    {refacciones.length === 0 ? (
                        <p className="text-xs text-estado-rechazado font-bold bg-red-50 border border-red-200 rounded p-2.5 text-center">
                            Agrega al menos una refacción para poder continuar.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                            {refacciones.map((ref, idx) => (
                                <div key={idx} className="flex gap-2 items-center bg-slate-50 border border-slate-200/60 p-2 rounded-lg">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={ref.nombre}
                                            onChange={(e) => handleChange(idx, 'nombre', e.target.value)}
                                            placeholder="Nombre / Repuesto *"
                                            disabled={disabled}
                                            className="w-full text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-marca-secundario bg-white disabled:bg-slate-100"
                                        />
                                    </div>
                                    <div className="w-16">
                                        <input
                                            type="number"
                                            min={1}
                                            value={ref.cantidad}
                                            onChange={(e) => handleChange(idx, 'cantidad', parseInt(e.target.value) || 1)}
                                            placeholder="Cant."
                                            disabled={disabled}
                                            className="w-full text-xs border border-slate-300 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-marca-secundario bg-white disabled:bg-slate-100"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="text"
                                            value={ref.codigo}
                                            onChange={(e) => handleChange(idx, 'codigo', e.target.value)}
                                            placeholder="Código"
                                            disabled={disabled}
                                            className="w-full text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-marca-secundario bg-white disabled:bg-slate-100"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(idx)}
                                        disabled={disabled}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-all shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <Icon name="delete" size="xs" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!hasValidItems && refacciones.length > 0 && (
                        <p className="text-xs text-estado-rechazado font-bold flex items-center gap-1">
                            <Icon name="warning" size="xs" />
                            Captura el nombre de al menos una refacción.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
