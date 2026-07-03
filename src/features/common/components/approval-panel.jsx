// src/features/common/components/approval-panel.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { getTickets } from '@/features/tickets/api/tickets-api';

const rolesSupervisor = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];
const APPROVAL_COUNT_TTL_MS = 30000;
let approvalCountCache = { value: 0, fetchedAt: 0, promise: null };

const getCachedApprovalCount = () => (
    Date.now() - approvalCountCache.fetchedAt < APPROVAL_COUNT_TTL_MS
        ? approvalCountCache.value
        : 0
);

const getTotal = (response) => {
    if (typeof response?.pagination?.total === 'number') return response.pagination.total;
    if (typeof response?.meta?.totalFiltrado === 'number') return response.meta.totalFiltrado;
    if (Array.isArray(response?.data)) return response.data.length;
    if (Array.isArray(response)) return response.length;
    return 0;
};

export const ApprovalPanel = ({
    toApproveCount,
    currentUser,
    targetPath = '/aprobar',
    isMobile = false,
    label = 'tareas',
    singularLabel = 'tarea',
}) => {
    const navigate = useNavigate();
    const esSupervisor = rolesSupervisor.includes(currentUser?.rol);
    const localCount = Number(toApproveCount) || 0;
    const [globalCount, setGlobalCount] = useState(getCachedApprovalCount);

    useEffect(() => {
        let cancelled = false;

        if (!esSupervisor || localCount > 0) {
            return undefined;
        }

        const now = Date.now();
        if (now - approvalCountCache.fetchedAt < APPROVAL_COUNT_TTL_MS) {
            return undefined;
        }

        if (!approvalCountCache.promise) {
            approvalCountCache.promise = getTickets({ estado: 'RESUELTO', page: 1, limit: 1 })
                .then((response) => {
                    approvalCountCache.value = getTotal(response);
                    approvalCountCache.fetchedAt = Date.now();
                    return approvalCountCache.value;
                })
                .catch(() => {
                    approvalCountCache.value = 0;
                    approvalCountCache.fetchedAt = Date.now();
                    return 0;
                })
                .finally(() => {
                    approvalCountCache.promise = null;
                });
        }

        approvalCountCache.promise
            .then((response) => {
                if (!cancelled) setGlobalCount(response);
            });

        return () => {
            cancelled = true;
        };
    }, [esSupervisor, localCount]);

    const count = localCount > 0 ? localCount : globalCount;

    if (!esSupervisor || count <= 0) {
        return null;
    }

    return (
        <div
            onClick={() => navigate(targetPath)}
            className={cn(
                'relative overflow-hidden flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer group shadow-sm select-none',
                'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/15 hover:to-teal-500/15 border-emerald-500/20 hover:border-emerald-500/30',
                isMobile ? 'mx-1 mt-1' : 'w-full'
            )}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500" />

            <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-estado-resuelto text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                    <Icon name="fact_check" size="md" className="text-white" fill />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-slate-800 leading-snug">
                        {count === 1
                            ? `Hay 1 ${singularLabel} resuelta esperando tu aprobación`
                            : `Hay ${count} ${label} resueltas esperando tu aprobación`
                        }
                    </span>
                    <span className="text-xs font-semibold text-slate-500 mt-0.5 opacity-90">
                        Haz clic aquí para revisar y cerrar o rebotar las tareas del equipo.
                    </span>
                </div>
            </div>

            <button
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-emerald-500/10 text-estado-resuelto shadow-sm transition-all duration-300 group-hover:bg-estado-resuelto group-hover:text-white group-hover:scale-105 group-hover:shadow-md cursor-pointer relative z-10 shrink-0"
            >
                <Icon name="arrow_forward" size="sm" />
            </button>
        </div>
    );
};
