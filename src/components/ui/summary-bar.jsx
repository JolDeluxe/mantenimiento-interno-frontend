import { cn } from '@/utils/cn';

// Diccionario Clean UI: Bordes sutiles, sombras difusas, gradientes ligeros y micro-interacciones de escala
const VARIANTS = {
    por_defecto: {
        desktopBase: "bg-white border border-slate-200/80 text-slate-600 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 active:shadow-sm",
        desktopActive: "bg-gradient-to-b from-marca-primario to-marca-primario/90 border border-marca-primario text-white shadow-md shadow-marca-primario/25 active:scale-[0.98]",
        mobileBase: "bg-white border border-slate-200/80 text-slate-600 shadow-sm active:scale-[0.98]",
        mobileActive: "bg-gradient-to-b from-marca-primario to-marca-primario/90 border border-marca-primario text-white shadow-md shadow-marca-primario/25 active:scale-[0.98]",
    },
    gris: {
        desktopBase: "bg-white border border-gray-200/80 text-gray-600 shadow-sm hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 active:shadow-sm",
        desktopActive: "bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-800 text-white shadow-md shadow-gray-900/20 active:scale-[0.98]",
        mobileBase: "bg-white border border-gray-200/80 text-gray-600 shadow-sm active:scale-[0.98]",
        mobileActive: "bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-800 text-white shadow-md shadow-gray-900/20 active:scale-[0.98]",
    },
    ambar: {
        desktopBase: "bg-white border border-amber-200/80 text-amber-700 shadow-sm hover:shadow-md hover:border-amber-300 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 active:shadow-sm",
        desktopActive: "bg-gradient-to-b from-amber-500 to-amber-600 border border-amber-600 text-white shadow-md shadow-amber-500/25 active:scale-[0.98]",
        mobileBase: "bg-white border border-amber-200/80 text-amber-700 shadow-sm active:scale-[0.98]",
        mobileActive: "bg-gradient-to-b from-amber-500 to-amber-600 border border-amber-600 text-white shadow-md shadow-amber-500/25 active:scale-[0.98]",
    },
    amarillo: {
        desktopBase: "bg-white border border-yellow-200/80 text-yellow-700 shadow-sm hover:shadow-md hover:border-yellow-300 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 active:shadow-sm",
        desktopActive: "bg-gradient-to-b from-yellow-400 to-yellow-500 border border-yellow-500 text-white shadow-md shadow-yellow-500/25 active:scale-[0.98]",
        mobileBase: "bg-white border border-yellow-200/80 text-yellow-700 shadow-sm active:scale-[0.98]",
        mobileActive: "bg-gradient-to-b from-yellow-400 to-yellow-500 border border-yellow-500 text-white shadow-md shadow-yellow-500/25 active:scale-[0.98]",
    },
    azul: {
        desktopBase: "bg-white border border-blue-200/80 text-blue-700 shadow-sm hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 active:shadow-sm",
        desktopActive: "bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-600 text-white shadow-md shadow-blue-500/25 active:scale-[0.98]",
        mobileBase: "bg-white border border-blue-200/80 text-blue-700 shadow-sm active:scale-[0.98]",
        mobileActive: "bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-600 text-white shadow-md shadow-blue-500/25 active:scale-[0.98]",
    },
    rosa: {
        desktopBase: "bg-white border border-rose-200/80 text-rose-700 shadow-sm hover:shadow-md hover:border-rose-300 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 active:shadow-sm",
        desktopActive: "bg-gradient-to-b from-rose-500 to-rose-600 border border-rose-600 text-white shadow-md shadow-rose-500/25 active:scale-[0.98]",
        mobileBase: "bg-white border border-rose-200/80 text-rose-700 shadow-sm active:scale-[0.98]",
        mobileActive: "bg-gradient-to-b from-rose-500 to-rose-600 border border-rose-600 text-white shadow-md shadow-rose-500/25 active:scale-[0.98]",
    },
    esmeralda: {
        desktopBase: "bg-white border border-emerald-200/80 text-emerald-700 shadow-sm hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 active:shadow-sm",
        desktopActive: "bg-gradient-to-b from-emerald-500 to-emerald-600 border border-emerald-600 text-white shadow-md shadow-emerald-500/25 active:scale-[0.98]",
        mobileBase: "bg-white border border-emerald-200/80 text-emerald-700 shadow-sm active:scale-[0.98]",
        mobileActive: "bg-gradient-to-b from-emerald-500 to-emerald-600 border border-emerald-600 text-white shadow-md shadow-emerald-500/25 active:scale-[0.98]",
    },
    indigo: {
        desktopBase: "bg-white border border-indigo-200/80 text-indigo-700 shadow-sm hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 active:shadow-sm",
        desktopActive: "bg-gradient-to-b from-indigo-500 to-indigo-600 border border-indigo-600 text-white shadow-md shadow-indigo-500/25 active:scale-[0.98]",
        mobileBase: "bg-white border border-indigo-200/80 text-indigo-700 shadow-sm active:scale-[0.98]",
        mobileActive: "bg-gradient-to-b from-indigo-500 to-indigo-600 border border-indigo-600 text-white shadow-md shadow-indigo-500/25 active:scale-[0.98]",
    },
    rojo: {
        desktopBase: "bg-white border border-red-200/80 text-red-700 shadow-sm hover:shadow-md hover:border-red-300 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 active:shadow-sm",
        desktopActive: "bg-gradient-to-b from-red-500 to-red-600 border border-red-600 text-white shadow-md shadow-red-500/25 active:scale-[0.98]",
        mobileBase: "bg-white border border-red-200/80 text-red-700 shadow-sm active:scale-[0.98]",
        mobileActive: "bg-gradient-to-b from-red-500 to-red-600 border border-red-600 text-white shadow-md shadow-red-500/25 active:scale-[0.98]",
    }
};

export const SummaryBar = ({
    items = [],
    activeId = null,
    onSelect,
    loading = false,
    className,
    separateFirstMobile = false
}) => {
    if (!items.length) return null;

    let gridColsClass = "grid-cols-2 lg:grid-cols-4";
    if (items.length === 1) gridColsClass = "grid-cols-1 max-w-xs mx-auto";
    else if (items.length === 2) gridColsClass = "grid-cols-2 max-w-xl mx-auto";
    else if (items.length === 3) gridColsClass = "grid-cols-3 max-w-3xl mx-auto";
    else if (items.length === 4) gridColsClass = "grid-cols-2 lg:grid-cols-4";
    else if (items.length === 5) gridColsClass = "grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
    else if (items.length >= 6) gridColsClass = "grid-cols-2 md:grid-cols-3 xl:grid-cols-6";

    // ── 📱 Sub-componente Móvil Compacto ─────────────────────────────────────
    const renderMobileItem = (item) => {
        const isActive = activeId === item.id;
        const styles = VARIANTS[item.color] || VARIANTS.por_defecto;

        return (
            <div
                key={item.id}
                onClick={() => !loading && !isActive && onSelect?.(item.id)}
                className={cn(
                    "flex justify-between items-center w-full max-w-[16rem] px-5 py-2.5 rounded-full select-none",
                    isActive || loading ? "cursor-default" : "cursor-pointer",
                    "transition-all duration-200 ease-out will-change-transform",
                    isActive ? styles.mobileActive : styles.mobileBase,
                    loading && !isActive && "opacity-50 cursor-wait",
                    item.className
                )}
            >
                <span className={cn("text-[13px] font-semibold tracking-tight", item.labelClassName)}>
                    {item.label}
                </span>
                <span className={cn("text-base font-bold opacity-90 drop-shadow-sm", isActive && "text-white", item.valueClassName)}>
                    {loading ? "..." : item.value}
                </span>
            </div>
        );
    };

    return (
        <div className={cn("w-full", className)}>

            {/* 💻 VISTA ESCRITORIO */}
            <div className={cn("hidden lg:grid gap-4 mb-4", gridColsClass)}>
                {items.map((item) => {
                    const isActive = activeId === item.id;
                    const styles = VARIANTS[item.color] || VARIANTS.por_defecto;

                    return (
                        <div
                            key={item.id}
                            onClick={() => !loading && !isActive && onSelect?.(item.id)}
                            className={cn(
                                "flex flex-col justify-center items-center py-4 px-3 rounded-2xl select-none",
                                isActive || loading ? "cursor-default" : "cursor-pointer",
                                "transition-all duration-200 ease-out will-change-transform",
                                isActive ? styles.desktopActive : styles.desktopBase,
                                loading && !isActive && "opacity-50 cursor-wait active:translate-y-0 active:scale-100",
                                item.className
                            )}
                        >
                            <span className={cn(
                                "text-[11px] font-bold uppercase tracking-wider opacity-80 mb-1.5",
                                item.labelClassName
                            )}>
                                {item.label}
                            </span>
                            <span className={cn(
                                "text-3xl font-extrabold font-mono leading-none tracking-tight drop-shadow-sm",
                                item.valueClassName
                            )}>
                                {loading ? "-" : item.value}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* 📱 VISTA MÓVIL */}
            <div className="lg:hidden flex flex-col items-center px-4 space-y-3 mb-5">
                {separateFirstMobile && items.length > 1 ? (
                    <>
                        <div className="w-full flex justify-center mb-1">
                            {renderMobileItem(items[0])}
                        </div>
                        <div className="flex flex-col items-center space-y-3 w-full">
                            {items.slice(1).map(renderMobileItem)}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center space-y-3 w-full">
                        {items.map(renderMobileItem)}
                    </div>
                )}
            </div>

        </div>
    );
};