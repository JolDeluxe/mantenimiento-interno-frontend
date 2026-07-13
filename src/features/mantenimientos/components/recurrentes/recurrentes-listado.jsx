import { Table, Icon, Spinner } from '@/components/ui/z_index';
import { formatearFechaTextoLargo } from '../../helpers/fechas';
import { RecurrenteActions } from './recurrente-actions';
import { RecurrenteStatusBadge } from './recurrente-status-badge';
import { frecuenciaLabel } from './recurrentes-utils';

const datePart = (value) => value ? String(value).split('T')[0] : '';

export const RecurrentesListado = ({
    reglas,
    loading,
    submitting,
    canManage,
    onView,
    onEdit,
    onToggleActivo,
    onMaterialize,
}) => {
    const columns = [
        {
            header: 'Código máquina',
            accessorKey: 'maquina.codigo',
            headerClassName: 'w-[10%] min-w-[100px]',
            cell: (row) => <span className="font-black text-slate-800">{row.maquina?.codigo || '-'}</span>
        },
        {
            header: 'Máquina/equipo',
            accessorKey: 'maquina.nombre',
            headerClassName: 'w-[20%] min-w-[200px]',
            cell: (row) => (
                <div>
                    <div className="max-w-[260px] truncate font-bold text-slate-800">{row.maquina?.nombre || '-'}</div>
                    <div className="text-[10px] font-semibold text-slate-400">{row.titulo}</div>
                </div>
            )
        },
        {
            header: 'Área/ubicación',
            accessorKey: 'maquina.area',
            headerClassName: 'w-[15%] min-w-[150px]',
            cell: (row) => (
                <span className="font-semibold text-slate-600">
                    {row.maquina?.planta || '-'} / {row.maquina?.area || '-'}
                </span>
            )
        },
        {
            header: 'Responsable',
            accessorKey: 'tecnicoResponsable.nombre',
            headerClassName: 'w-[15%] min-w-[150px]',
            cell: (row) => <span className="font-semibold text-slate-700">{row.tecnicoResponsable?.nombre || '-'}</span>
        },
        {
            header: 'Frecuencia',
            accessorKey: 'frecuencia',
            headerClassName: 'w-[10%] min-w-[100px]',
            cell: (row) => <span className="font-bold text-slate-700">{frecuenciaLabel(row)}</span>
        },
        {
            header: 'Próxima programación',
            accessorKey: 'proximaFechaEjecucion',
            headerClassName: 'w-[15%] min-w-[150px]',
            cell: (row) => (
                <span className="font-semibold text-slate-700">
                    {formatearFechaTextoLargo(datePart(row.proximaFechaEjecucion)) || '-'}
                </span>
            )
        },
        {
            header: 'Tiempo estimado',
            accessorKey: 'tiempoEstimado',
            headerClassName: 'w-[10%] min-w-[100px]',
            cell: (row) => (
                <span className="font-semibold text-slate-700">
                    {row.tiempoEstimado ? `${row.tiempoEstimado} min` : '-'}
                </span>
            )
        },
        {
            header: 'Estado programación',
            accessorKey: 'activo',
            headerClassName: 'w-[10%] min-w-[120px]',
            cell: (row) => <RecurrenteStatusBadge activo={row.activo} />
        },
        {
            header: 'Observación mensual',
            accessorKey: 'observacion',
            headerClassName: 'w-[10%] min-w-[150px]',
            cell: () => <span className="font-semibold text-slate-400">Generación mensual automática</span>
        },
        {
            header: 'Acciones',
            accessorKey: 'acciones',
            headerClassName: 'w-[10%] min-w-[120px]',
            cell: (row) => (
                <RecurrenteActions
                    regla={row}
                    canManage={canManage}
                    submitting={submitting}
                    onView={onView}
                    onEdit={onEdit}
                    onToggleActivo={onToggleActivo}
                    onMaterialize={onMaterialize}
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
                    <div className="text-sm font-black text-slate-700">Sin programaciones recurrentes</div>
                    <p className="text-xs font-medium text-slate-500">Crea programaciones preventivas para generar mantenimientos cuando corresponda.</p>
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
            hidePagination={true}
            rowClassName={(row) => !row.activo ? 'bg-slate-50/60 opacity-75' : 'bg-white'}
        />
    );
};
