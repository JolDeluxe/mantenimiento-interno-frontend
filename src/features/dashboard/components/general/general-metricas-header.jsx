// src/features/dashboard/components/general/general-metricas-header.jsx
import { cn } from '@/utils/cn';

export const GeneralMetricasHeader = ({ totalGeneradas = 0, totalTerminadas = 0, isMobile = false }) => {
    return (
        <div className={cn(
            "flex items-center justify-between bg-slate-800 rounded-2xl shadow-sm text-white",
            isMobile ? "p-4" : "p-6 xl:col-span-2"
        )}>
            <div className="flex flex-col">
                <span className={cn("font-bold text-slate-400 uppercase tracking-widest", isMobile ? "text-[10px]" : "text-xs")}>Generadas</span>
                <span className={cn(
                    "font-black font-mono leading-none",
                    totalGeneradas > 0 ? "text-white" : "text-slate-600",
                    isMobile ? "text-2xl mt-1" : "text-5xl mt-2"
                )}>
                    {totalGeneradas > 0 ? totalGeneradas : '—'}
                </span>
            </div>
            <div className={cn("w-px bg-slate-700", isMobile ? "h-8 mx-2" : "h-16 mx-4")} />
            <div className="flex flex-col items-end">
                <span className={cn("font-bold text-slate-400 uppercase tracking-widest", isMobile ? "text-[10px]" : "text-xs")}>Terminadas</span>
                <span className={cn(
                    "font-black font-mono leading-none",
                    totalTerminadas > 0 ? "text-emerald-400" : "text-slate-600",
                    isMobile ? "text-2xl mt-1" : "text-5xl mt-2"
                )}>
                    {totalTerminadas > 0 ? totalTerminadas : '—'}
                </span>
            </div>
        </div>
    );
};