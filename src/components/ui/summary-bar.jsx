import { cn } from '@/utils/cn';

// Diccionario estricto para que Tailwind v4 compile las clases correctamente sin interpolación dinámica rota
const VARIANTS = {
    default: {
        desktopBase: "border-slate-200 text-slate-500 hover:border-marca-primario/40 hover:shadow-md",
        desktopActive: "bg-marca-primario/5 border-marca-primario text-marca-primario shadow-sm ring-1 ring-marca-primario",
        mobileBase: "bg-white border-slate-200 text-slate-600",
        mobileActive: "bg-marca-primario border-marca-primario text-white shadow-md",
    },
    amber: {
        desktopBase: "border-slate-200 text-slate-500 hover:border-amber-400 hover:shadow-md",
        desktopActive: "bg-amber-50 border-amber-500 text-amber-700 shadow-sm ring-1 ring-amber-500",
        mobileBase: "bg-white border-slate-200 text-slate-600",
        mobileActive: "bg-amber-500 border-amber-600 text-white shadow-md",
    },
    blue: {
        desktopBase: "border-slate-200 text-slate-500 hover:border-blue-400 hover:shadow-md",
        desktopActive: "bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500",
        mobileBase: "bg-white border-slate-200 text-slate-600",
        mobileActive: "bg-blue-600 border-blue-700 text-white shadow-md",
    },
    rose: {
        desktopBase: "border-slate-200 text-slate-500 hover:border-rose-400 hover:shadow-md",
        desktopActive: "bg-rose-50 border-rose-500 text-rose-700 shadow-sm ring-1 ring-rose-500",
        mobileBase: "bg-white border-slate-200 text-slate-600",
        mobileActive: "bg-rose-600 border-rose-700 text-white shadow-md",
    },
    emerald: {
        desktopBase: "border-slate-200 text-slate-500 hover:border-emerald-400 hover:shadow-md",
        desktopActive: "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500",
        mobileBase: "bg-white border-slate-200 text-slate-600",
        mobileActive: "bg-emerald-600 border-emerald-700 text-white shadow-md",
    },
    indigo: {
        desktopBase: "border-slate-200 text-slate-500 hover:border-indigo-400 hover:shadow-md",
        desktopActive: "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500",
        mobileBase: "bg-white border-slate-200 text-slate-600",
        mobileActive: "bg-indigo-600 border-indigo-700 text-white shadow-md",
    },
    red: {
        desktopBase: "border-red-200 text-red-500 hover:border-red-500 hover:shadow-md",
        desktopActive: "bg-red-50 border-red-600 text-red-700 shadow-sm ring-1 ring-red-600",
        mobileBase: "bg-red-50 border-red-200 text-red-700",
        mobileActive: "bg-red-600 border-red-700 text-white shadow-md",
    }
};

export const SummaryBar = ({ items, activeId, onSelect, loading = false, className }) => {

    // Grid dinámico basado en la cantidad de ítems (1 a 4 máximo recomendado)
    const gridColsClass = items.length === 1
        ? "grid-cols-1 max-w-sm mx-auto"
        : items.length === 2
            ? "grid-cols-2 max-w-2xl mx-auto"
            : items.length === 3
                ? "grid-cols-3 max-w-4xl mx-auto"
                : "grid-cols-2 lg:grid-cols-4";

    return (
        <div className={cn("w-full", className)}>

            {/* 💻 VISTA ESCRITORIO (Tarjetas) */}
            <div className={cn("hidden lg:grid gap-4 mb-4", gridColsClass)}>
                {items.map((item) => {
                    const isActive = activeId === item.id;
                    const styles = VARIANTS[item.color || "default"];

                    return (
                        <div
                            key={item.id}
                            onClick={() => !loading && onSelect(item.id)}
                            className={cn(
                                "flex flex-col justify-center items-center p-5 rounded-xl border bg-white cursor-pointer transition-all duration-200",
                                isActive ? styles.desktopActive : styles.desktopBase,
                                loading && "opacity-50 cursor-wait hover:shadow-none hover:border-slate-200"
                            )}
                        >
                            <span className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-1">
                                {item.label}
                            </span>
                            <span className="text-3xl xl:text-4xl font-extrabold font-mono">
                                {loading ? "-" : item.value}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* 📱 VISTA MÓVIL (Píldoras) */}
            <div className="lg:hidden flex flex-col items-center px-4 space-y-2.5 mb-4">
                {items.map((item) => {
                    const isActive = activeId === item.id;
                    const styles = VARIANTS[item.color || "default"];

                    return (
                        <div
                            key={item.id}
                            onClick={() => !loading && onSelect(item.id)}
                            className={cn(
                                "flex justify-between items-center w-full max-w-xs px-5 py-2.5 rounded-full border shadow-sm cursor-pointer transition-all duration-200",
                                isActive ? styles.mobileActive : styles.mobileBase,
                                loading && "opacity-60 cursor-wait"
                            )}
                        >
                            <span className="text-[15px] font-semibold">{item.label}</span>
                            <span className={cn("text-[17px] font-bold opacity-90", isActive && "text-white")}>
                                {loading ? "..." : item.value}
                            </span>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};