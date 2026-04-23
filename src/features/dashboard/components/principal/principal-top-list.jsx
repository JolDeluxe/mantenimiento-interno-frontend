import React from 'react';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

// ── Helpers Visuales ──
const getRankStyles = (index) => {
    switch (index) {
        case 0: return 'bg-amber-100 text-amber-600 border-amber-200 shadow-sm'; // Oro
        case 1: return 'bg-slate-200 text-slate-600 border-slate-300 shadow-sm'; // Plata
        case 2: return 'bg-orange-100 text-orange-700 border-orange-200 shadow-sm'; // Bronce
        default: return 'bg-white text-slate-400 border-slate-200'; // Estándar
    }
};

const getInitials = (name) => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
};

export const PrincipalTopList = ({ titulo, items = [], type = "count", icon = "star", loading = false }) => {

    // ── ESTADO DE CARGA (SKELETONS) ──
    if (loading) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full min-h-[250px] overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg shadow-sm shrink-0" />
                    <Skeleton className="h-4 w-32 rounded-md" />
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1 pointer-events-none">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                <Skeleton className="h-3 w-24 rounded-full" />
                            </div>
                            <Skeleton className="w-10 h-6 rounded-lg shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── ESTADO VACÍO ──
    if (!items || items.length === 0) return null;

    // ── ESTADO CON DATOS ──
    const maxValor = type === 'kpi' ? 100 : (items[0]?.cantidad || 1);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full min-h-[250px] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200 text-amber-500">
                    <Icon name={icon} size="sm" />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                    {titulo}
                </h3>
            </div>

            <div className="p-4 flex flex-col gap-3 flex-1">
                {items.map((item, idx) => {
                    const isKpi = type === "kpi";
                    const valor = isKpi ? item.kpi : item.cantidad;
                    const pct = Math.min((valor / maxValor) * 100, 100);

                    let barColor = "bg-slate-100/60";
                    let valColor = "text-slate-700 bg-white border-slate-200";

                    if (isKpi) {
                        if (valor >= 80) {
                            barColor = "bg-emerald-50/80";
                            valColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
                        } else if (valor >= 50) {
                            barColor = "bg-amber-50/80";
                            valColor = "text-amber-700 bg-amber-50 border-amber-200";
                        } else {
                            barColor = "bg-red-50/80";
                            valColor = "text-red-700 bg-red-50 border-red-200";
                        }
                    }

                    return (
                        <div
                            key={idx}
                            className="relative overflow-hidden bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300"
                        >
                            <div
                                className={cn("absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out", barColor)}
                                style={{ width: `${pct}%` }}
                            />

                            <div className="relative z-10 flex items-center gap-3">
                                <div className={cn("flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black border", getRankStyles(idx))}>
                                    {idx + 1}
                                </div>

                                {isKpi ? (
                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-500 shadow-sm group-hover:bg-white transition-colors shrink-0">
                                        {getInitials(item.nombre)}
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm group-hover:bg-white transition-colors shrink-0">
                                        <Icon name={icon === 'domain' ? 'business' : 'folder'} size="xs" />
                                    </div>
                                )}

                                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight leading-tight line-clamp-2">
                                    {item.nombre}
                                </span>
                            </div>

                            <div className={cn("relative z-10 px-2.5 py-1 rounded-lg border shadow-sm flex items-center gap-0.5 shrink-0", valColor)}>
                                <span className="text-xs font-black font-mono">{valor}</span>
                                {isKpi && <span className="text-[10px] font-bold">%</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};