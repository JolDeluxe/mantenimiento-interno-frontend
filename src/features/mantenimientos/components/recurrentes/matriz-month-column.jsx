import { MatrizCell } from './matriz-cell';

export const MatrizMonthColumn = ({
    row,
    mes,
    canManage,
    submitting,
    onGenerate,
    onMove,
    onSkip,
    onRemoveAdjustment,
}) => (
    <td className="min-w-[170px] border-l border-slate-100 px-2 py-3 align-top">
        <MatrizCell
            row={row}
            ejecuciones={row.meses?.[mes.key] || []}
            canManage={canManage}
            submitting={submitting}
            onGenerate={onGenerate}
            onMove={onMove}
            onSkip={onSkip}
            onRemoveAdjustment={onRemoveAdjustment}
        />
    </td>
);
