import { Icon, Button } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { TIPO_CONFIG } from './notify-config';

const TIPO_OPTIONS = [
    { value: '', label: 'Todos los tipos' },
    { value: 'TAREA_ASIGNADA', label: 'Asignadas' },
    { value: 'REVISION_PENDIENTE', label: 'Por revisar' },
    { value: 'TAREA_RECHAZADA', label: 'Rechazadas' },
    { value: 'TAREA_RESUELTA', label: 'Resueltas' },
    { value: 'TAREA_CANCELADA', label: 'Canceladas' },
    { value: 'EQUIPO_RECHAZO', label: 'Rechazo de equipo' },
    { value: 'NUEVO_REPORTE', label: 'Nuevos reportes' },
];

export const NotifyFilterBar = ({
    soloNoLeidas,
    onToggleNoLeidas,
    filtroTipo,
    onTipoChange,
    noLeidas = 0,
    onMarkAll,
    submitting,
}) => (
    <div className="flex flex-col gap-3 pb-3 border-b border-slate-200 mb-0">
        <div className="flex items-center gap-3 flex-wrap">

            {/* Toggle No Leídas */}
            <Button
                variant={soloNoLeidas ? 'accion' : 'ghost'}
                size="sm"
                icon={soloNoLeidas ? 'close' : 'mark_email_unread'}
                onClick={onToggleNoLeidas}
                isActive={soloNoLeidas}
            >
                No leídas
                {noLeidas > 0 && !soloNoLeidas && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-estado-rechazado text-white text-[9px] font-extrabold leading-none">
                        {noLeidas > 99 ? '99+' : noLeidas}
                    </span>
                )}
            </Button>

            {/* Select tipo */}
            <div className="relative">
                <select
                    value={filtroTipo}
                    onChange={(e) => onTipoChange(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 cursor-pointer h-[34px]"
                >
                    {TIPO_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <Icon name="expand_more" size="xs" className="text-slate-400" />
                </div>
            </div>

            {/* Marcar todas como leídas */}
            {noLeidas > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    icon="done_all"
                    onClick={onMarkAll}
                    isLoading={submitting}
                    className="ml-auto"
                >
                    Marcar todas como leídas
                </Button>
            )}
        </div>
    </div>
);