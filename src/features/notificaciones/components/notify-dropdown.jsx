import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button, Skeleton } from '@/components/ui/z_index';
import { getNotificaciones, markAllAsRead } from '../api/notificaciones-api';
import { useNotifyStore } from '@/stores/notify-store';
import { TIPO_CONFIG } from './notify-config';
import { formatRelativo } from '@/lib/date';
import { cn } from '@/utils/cn';

const DropdownSkeleton = () => (
    <div className="flex flex-col divide-y divide-slate-100">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-full rounded-md" />
                    <Skeleton className="h-2.5 w-1/3 rounded-md" />
                </div>
            </div>
        ))}
    </div>
);

export const NotifyDropdown = ({ onClose }) => {
    const navigate = useNavigate();
    const { noLeidas, setNoLeidas, reset } = useNotifyStore();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const res = await getNotificaciones({ limit: 8, page: 1 });
                if (mounted) {
                    setItems(Array.isArray(res.data) ? res.data : []);
                    setNoLeidas(res.noLeidas ?? 0);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [setNoLeidas]);

    const handleMarkAll = async () => {
        setMarking(true);
        try {
            await markAllAsRead();
            setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
            reset();
        } finally {
            setMarking(false);
        }
    };

    const handleGoToAll = () => {
        onClose();
        navigate(`/notificaciones?refresh=${Date.now()}`);
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">Notificaciones</h3>
                    {noLeidas > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-estado-rechazado text-white text-[9px] font-extrabold leading-none">
                            {noLeidas > 99 ? '99+' : noLeidas}
                        </span>
                    )}
                </div>
                {noLeidas > 0 && (
                    <button
                        onClick={handleMarkAll}
                        disabled={marking}
                        className="text-xs font-semibold text-estado-asignada hover:text-marca-primario transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        Marcar todas
                    </button>
                )}
            </div>

            {/* Lista */}
            <div className="overflow-y-auto max-h-[420px] custom-scrollbar">
                {loading ? (
                    <DropdownSkeleton />
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                        <Icon name="notifications_off" size="lg" />
                        <p className="text-xs font-medium">Sin notificaciones recientes</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {items.map((notif) => {
                            const cfg = TIPO_CONFIG[notif.tipo] ?? TIPO_CONFIG.NUEVO_REPORTE;
                            return (
                                <button
                                    key={notif.id}
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        navigate(`/notificaciones?refresh=${Date.now()}`);
                                    }}
                                    className={cn(
                                        'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 cursor-pointer',
                                        !notif.leida && 'bg-blue-50/30 hover:bg-blue-50/50'
                                    )}
                                >
                                    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5', cfg.bg)}>
                                        <Icon name={cfg.icon} size="xs" className={cfg.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={cn('text-xs font-bold leading-snug', notif.leida ? 'text-slate-700' : 'text-slate-900')}>
                                                {notif.titulo}
                                            </p>
                                            {!notif.leida && (
                                                <div className="w-2 h-2 rounded-full bg-estado-asignada shrink-0 mt-1" />
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                            {notif.cuerpo}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            {formatRelativo(notif.createdAt)}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-100 shrink-0">
                <button
                    onClick={handleGoToAll}
                    className="w-full text-xs font-semibold text-estado-asignada hover:text-marca-primario transition-colors text-center cursor-pointer py-1"
                >
                    Ver todas las notificaciones
                </button>
            </div>
        </div>
    );
};