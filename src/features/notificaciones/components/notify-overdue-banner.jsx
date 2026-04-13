import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button } from '@/components/ui/z_index';
import { getTickets } from '@/features/tickets/api/tickets-api';
import { cn } from '@/utils/cn';

const ROLES_ADMIN = new Set(['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO']);
const POLL_MS = 5 * 60 * 1000;

export const NotifyOverdueBanner = ({ currentUser }) => {
    const navigate = useNavigate();
    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);

    const [overdue, setOverdue] = useState([]);
    const [bandejaCritica, setBandejaCritica] = useState([]);
    const [dismissedOverdue, setDismissedOverdue] = useState(false);
    const [dismissedBandeja, setDismissedBandeja] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const overdueRes = await getTickets({ vencidos: true, limit: 10 });
            const overdueRaw = Array.isArray(overdueRes.data)
                ? overdueRes.data
                : (overdueRes?.data?.data ?? []);
            setOverdue(overdueRaw);
            setDismissedOverdue((prev) => (overdueRaw.length === 0 ? false : prev));

            if (esAdmin) {
                const bandejaRes = await getTickets({ huerfanos: true, limit: 30 });
                const bandejaRaw = Array.isArray(bandejaRes.data)
                    ? bandejaRes.data
                    : (bandejaRes?.data?.data ?? []);

                const criticas = bandejaRaw.filter((t) => {
                    if (!t.createdAt) return false;
                    const dias = Math.floor((Date.now() - Date.parse(t.createdAt)) / (1000 * 60 * 60 * 24));
                    return dias >= 3;
                });

                setBandejaCritica(criticas);
                setDismissedBandeja((prev) => (criticas.length === 0 ? false : prev));
            }
        } catch {
            // silencioso
        }
    }, [esAdmin]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, POLL_MS);
        const onVisible = () => { if (!document.hidden) fetchData(); };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [fetchData]);

    const totalOverdue = overdue.length;
    const totalBandeja = bandejaCritica.length;

    const showOverdue = !dismissedOverdue && totalOverdue > 0;
    const showBandeja = !dismissedBandeja && totalBandeja > 0;

    if (!showOverdue && !showBandeja) return null;

    return (
        <div className="flex flex-col gap-2 mb-4">
            {showOverdue && (
                <div className="relative flex items-start gap-3 p-4 rounded-xl border border-orange-300/60 bg-orange-50/60 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon name="warning" size="sm" className="text-orange-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-orange-800">
                            {totalOverdue === 1
                                ? '1 tarea atrasada requiere atención'
                                : `${totalOverdue} tareas atrasadas requieren atención`}
                        </p>
                        <p className="text-xs text-orange-600 mt-0.5 line-clamp-1">
                            {overdue.slice(0, 2).map((t) => t.titulo).join(', ')}
                            {totalOverdue > 2 ? ` y ${totalOverdue - 2} más` : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Button
                                variant="editar"
                                size="sm"
                                icon="today"
                                onClick={() => {
                                    const firstId = overdue[0]?.id;
                                    navigate(
                                        totalOverdue === 1 && firstId
                                            ? `/tickets/hoy?highlight=${firstId}`
                                            : '/tickets/hoy'
                                    );
                                }}
                            >
                                {totalOverdue === 1 ? 'Ver tarea' : 'Ver tareas'}
                            </Button>
                        </div>
                    </div>

                    <button
                        onClick={() => setDismissedOverdue(true)}
                        className="absolute top-3 right-3 text-orange-400 hover:text-orange-600 transition-colors cursor-pointer"
                    >
                        <Icon name="close" size="xs" />
                    </button>
                </div>
            )}

            {esAdmin && showBandeja && (
                <div className="relative flex items-start gap-3 p-4 rounded-xl border border-estado-rechazado/30 bg-red-50/60 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon name="inbox" size="sm" className="text-estado-rechazado" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-red-800">
                            {totalBandeja === 1
                                ? '1 ticket crítico sin asignar en bandeja'
                                : `${totalBandeja} tickets críticos sin asignar en bandeja`}
                        </p>
                        <p className="text-xs text-red-600 mt-0.5">
                            {totalBandeja === 1
                                ? 'Lleva 3 o más días sin técnico asignado'
                                : 'Llevan 3 o más días sin técnico asignado'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <Button
                                variant="borrar"
                                size="sm"
                                icon="engineering"
                                onClick={() => navigate('/tickets/bandeja')}
                            >
                                {totalBandeja === 1 ? 'Ir a bandeja' : 'Ver bandeja'}
                            </Button>
                        </div>
                    </div>

                    <button
                        onClick={() => setDismissedBandeja(true)}
                        className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                        <Icon name="close" size="xs" />
                    </button>
                </div>
            )}
        </div>
    );
};