export const RecurrenteStatusBadge = ({ activo }) => (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
        activo
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-slate-200 bg-slate-100 text-slate-500'
    }`}>
        {activo ? 'Activa' : 'Pausada'}
    </span>
);
