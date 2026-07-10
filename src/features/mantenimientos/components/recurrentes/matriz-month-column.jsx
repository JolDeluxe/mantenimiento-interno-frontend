import { MatrizCell } from './matriz-cell';

export const MatrizMonthColumn = ({
    row,
    mes,
    canManage,
    submitting,
    onGenerate,
}) => (
    <td className="min-w-[170px] border-l border-slate-100 px-2 py-3 align-top">
        <MatrizCell
            row={row}
            ejecuciones={row.meses?.[mes.key] || []}
            canManage={canManage}
            submitting={submitting}
            onGenerate={onGenerate}
        />
    </td>
);
