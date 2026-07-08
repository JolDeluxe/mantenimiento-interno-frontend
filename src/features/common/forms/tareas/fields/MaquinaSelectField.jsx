import { Label } from '@/components/form/z_index';
import { Icon, SearchableSelect } from '@/components/ui/z_index';

/**
 * MaquinaSelectField — campo visual/controlado del selector de maquinaria.
 *
 * Este componente es SOLO visual. No contiene lógica de negocio, side effects,
 * llamadas a API, debounce ni setState propio. Toda la lógica de selección y
 * derivación de ubicación queda en el componente padre.
 *
 * Props:
 *  - value        {string}   — maquinaId actual
 *  - options      {array}    — opcionesMaquinas (ya calculadas por el padre)
 *  - onChange     {function} — callback con side effects, definido en el padre
 *  - label        {string}   — texto del label (el padre calcula asterisco si aplica)
 *  - error        {string}   — mensaje de error de campo (fe.maquinaId)
 *  - disabled     {boolean}  — el padre calcula la expresión completa
 *  - validating   {boolean}  — validatingMaquina
 *  - maquinaInfo  {object|null} — para mostrar el badge de confirmación
 */
export function MaquinaSelectField({
  value,
  options,
  onChange,
  label,
  error,
  disabled,
  validating,
  maquinaInfo,
}) {
  return (
    <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex justify-between items-center">
        <Label htmlFor="tf-maquinaId" error={!!error}>{label}</Label>
        {validating && (
          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 animate-pulse">
            <Icon name="sync" size="xs" className="animate-spin" /> Validando...
          </span>
        )}
      </div>
      <SearchableSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Seleccionar máquina por código o nombre..."
        searchPlaceholder="Buscar por MBCxxxx o nombre..."
        allOptionText={null}
        disabled={disabled}
        icon="precision_manufacturing"
      />
      {error && <p className="text-[10px] text-rose-600 font-bold mt-0.5">{error}</p>}
      {maquinaInfo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-marca-primario/[0.04] border border-marca-primario/10 rounded-xl text-xs text-marca-primario font-semibold mt-1">
          <Icon name="info" size="xs" />
          <span>Máquina validada: <strong>{maquinaInfo.nombre}</strong> ({maquinaInfo.proceso})</span>
        </div>
      )}
    </div>
  );
}
