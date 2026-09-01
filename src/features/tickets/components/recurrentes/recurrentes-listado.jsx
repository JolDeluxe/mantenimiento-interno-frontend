import { Icon, Table } from '@/components/ui/z_index';
import { RecurrenteActions } from './recurrente-actions';
import { RecurrenteStatusBadge } from './recurrente-status-badge';
import { fecha, frecuenciaLabel, horarioODuracion, responsablesLabel } from './recurrentes-utils';

export const RecurrentesListado = ({
    reglas,
    loading,
    submitting,
    canManage,
    onView,
    onEdit,
    onToggleActivo,
    onCancel,
    onRestore,
}) => {
    const columns = [
        {
            header: 'Actividad',
            accessorKey: 'titulo',
            headerClassName: 'w-[24%] min-w-[240px]',
            cell: (row) => (
                <div className="min-w-0">
                    <div className="max-w-[320px] truncate font-black uppercase text-slate-800">{row.titulo}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                        <Icon name="label" size="12px" />
                        <span>{row.categoria || '-'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Estado',
            accessorKey: 'activo',
            headerClassName: 'w-[9%] min-w-[110px]',
            cell: (row) => <RecurrenteStatusBadge regla={row} />
        },
        {
            header: 'Responsables',
            accessorKey: 'responsables',
            headerClassName: 'w-[18%] min-w-[180px]',
            cell: (row) => (
                <span className="line-clamp-2 font-semibold text-slate-700">
                    {responsablesLabel(row.responsables)}
                </span>
            )
        },
        {
            header: 'Area',
            accessorKey: 'area',
            headerClassName: 'w-[15%] min-w-[150px]',
            cell: (row) => (
                <span className="font-semibold text-slate-600">{row.area || '-'}</span>
            )
        },
        {
            header: 'Frecuencia',
            accessorKey: 'unidad',
            headerClassName: 'w-[11%] min-w-[120px]',
            cell: (row) => <span className="font-bold text-slate-700">{frecuenciaLabel(row)}</span>
        },
        {
            header: 'Proxima',
            accessorKey: 'proximaFechaEjecucion',
            headerClassName: 'w-[12%] min-w-[130px]',
            cell: (row) => <span className="font-semibold text-slate-700">{fecha(row.proximaFechaEjecucion)}</span>
        },
        {
            header: 'Horario / duracion',
            accessorKey: 'tiempoEstimado',
            headerClassName: 'w-[12%] min-w-[140px]',
            cell: (row) => <span className="font-semibold text-slate-700">{horarioODuracion(row)}</span>
        },
        {
            header: 'Acciones',
            accessorKey: 'acciones',
            headerClassName: 'w-[10%] min-w-[150px]',
            align: 'right',
            cell: (row) => (
                <RecurrenteActions
                    regla={row}
                    canManage={canManage}
                    submitting={submitting}
                    onView={onView}
                    onEdit={onEdit}
                    onToggleActivo={onToggleActivo}
                    onCancel={onCancel}
                    onRestore={onRestore}
                />
            )
        }
    ];

    if (!loading && !reglas.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
                <div className="rounded-full border border-slate-200 bg-slate-50 p-3 text-slate-400">
                    <Icon name="event_repeat" size="md" />
                </div>
                <div>
                    <div className="text-sm font-black text-slate-700">Sin actividades recurrentes</div>
                    <p className="text-xs font-medium text-slate-500">Crea plantillas recurrentes para generar actividades cuando corresponda.</p>
                </div>
            </div>
        );
    }

    return (
        <Table
            columns={columns}
            data={reglas}
            loading={loading}
            keyField="id"
            hidePagination
            rowClassName={(row) => row.archivadoAt
                ? 'bg-slate-50/80 text-slate-500'
                : !row.activo
                    ? 'bg-slate-50/60 opacity-80'
                    : 'bg-white hover:bg-slate-50'}
        />
    );
};
