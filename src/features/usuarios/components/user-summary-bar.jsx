// src/features/usuarios/components/user-summary-bar.jsx
/**
 * Roles reales del backend (enum Rol de Prisma):
 * SUPER_ADMIN | JEFE_MTTO | COORDINADOR_MTTO | TECNICO | CLIENTE_INTERNO
 *
 * La barra de resumen filtra por estos valores exactos.
 * El contador usa resumenRoles del meta; si el backend no lo envía, muestra 0.
 */

const ROL_CONFIG = [
    {
        id: 'TODOS',
        label: 'Total',
        desktop: {
            base: 'bg-slate-100 border-slate-300 text-slate-700',
            active: 'bg-slate-700  border-slate-800 text-white shadow-md scale-[1.02]',
        },
        mobile: {
            base: 'bg-slate-100 border-slate-300 text-slate-700',
            active: 'bg-slate-700  border-slate-800 text-white shadow-md',
        },
    },
    {
        id: 'JEFE_MTTO',
        label: 'Jefe Mtto',
        desktop: {
            base: 'bg-marca-primario/5  border-marca-primario/30 text-marca-primario',
            active: 'bg-marca-primario    border-marca-primario    text-white shadow-md scale-[1.02]',
        },
        mobile: {
            base: 'bg-marca-primario/5  border-marca-primario/30 text-marca-primario',
            active: 'bg-marca-primario    border-marca-primario    text-white shadow-md',
        },
    },
    {
        id: 'COORDINADOR_MTTO',
        label: 'Coordinador',
        desktop: {
            base: 'bg-amber-50  border-amber-300 text-amber-800',
            active: 'bg-amber-500 border-amber-600 text-white shadow-md scale-[1.02]',
        },
        mobile: {
            base: 'bg-amber-50  border-amber-300 text-amber-800',
            active: 'bg-amber-500 border-amber-600 text-white shadow-md',
        },
    },
    {
        id: 'TECNICO',
        label: 'Técnico',
        desktop: {
            base: 'bg-blue-50  border-blue-300 text-blue-800',
            active: 'bg-blue-600 border-blue-700 text-white shadow-md scale-[1.02]',
        },
        mobile: {
            base: 'bg-blue-50  border-blue-300 text-blue-800',
            active: 'bg-blue-600 border-blue-700 text-white shadow-md',
        },
    },
    {
        id: 'CLIENTE_INTERNO',
        label: 'Cliente',
        desktop: {
            base: 'bg-rose-50   border-rose-300 text-rose-800',
            active: 'bg-rose-700  border-rose-800 text-white shadow-md scale-[1.02]',
        },
        mobile: {
            base: 'bg-rose-50   border-rose-300 text-rose-800',
            active: 'bg-rose-700  border-rose-800 text-white shadow-md',
        },
    },
];

export const UserSummaryBar = ({
    totalItems,
    resumenRoles,
    filtroActual,
    onFilterChange,
    loading,
}) => {
    const getValue = (id) =>
        id === 'TODOS' ? totalItems : (resumenRoles[id] ?? 0);

    return (
        <>
            {/* ── Desktop ─────────────────────────────────────────────────────── */}
            <div className="hidden lg:grid grid-cols-5 gap-3 mb-3">
                {ROL_CONFIG.map((btn) => {
                    const active = filtroActual === btn.id;
                    return (
                        <button
                            key={btn.id}
                            onClick={() => !loading && onFilterChange(btn.id)}
                            disabled={loading}
                            className={`rounded-xl p-3 text-center border transition-all duration-200 cursor-pointer
                ${active ? btn.desktop.active : btn.desktop.base}
                ${loading ? 'opacity-50 cursor-wait' : 'hover:scale-[1.01]'}`}
                        >
                            <p className="text-[10px] font-bold uppercase tracking-wide opacity-80 leading-tight">
                                {btn.label}
                            </p>
                            <p className="text-2xl font-extrabold mt-1">
                                {loading ? '—' : getValue(btn.id)}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* ── Mobile ──────────────────────────────────────────────────────── */}
            <div className="lg:hidden flex flex-col items-center gap-2 mb-4">
                {/* Total pill */}
                <button
                    onClick={() => !loading && onFilterChange('TODOS')}
                    disabled={loading}
                    className={`flex justify-between items-center w-64 px-5 py-2.5 rounded-full border
            shadow-sm transition-all duration-200 cursor-pointer
            ${filtroActual === 'TODOS' ? ROL_CONFIG[0].mobile.active : ROL_CONFIG[0].mobile.base}
            ${loading ? 'opacity-60' : ''}`}
                >
                    <span className="font-semibold text-sm">Total</span>
                    <span className="font-extrabold text-base">
                        {loading ? '…' : totalItems}
                    </span>
                </button>

                {/* Role pills */}
                {ROL_CONFIG.slice(1).map((btn) => {
                    const active = filtroActual === btn.id;
                    return (
                        <button
                            key={btn.id}
                            onClick={() => !loading && onFilterChange(active ? 'TODOS' : btn.id)}
                            disabled={loading}
                            className={`flex justify-between items-center w-64 px-5 py-2 rounded-full border
                shadow-sm transition-all duration-200 cursor-pointer
                ${active ? btn.mobile.active : btn.mobile.base}
                ${loading ? 'opacity-60' : ''}`}
                        >
                            <span className="font-semibold text-sm">{btn.label}</span>
                            <span className="font-bold text-sm">
                                {loading ? '…' : getValue(btn.id)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </>
    );
};