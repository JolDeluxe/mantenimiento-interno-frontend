export const RecurrenteStatusBadge = ({ regla }) => {
    const archived = Boolean(regla?.archivadoAt);
    const paused = !archived && !regla?.activo;
    const tone = archived ? 'border-slate-300 bg-slate-100 text-slate-600' : paused ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700';
    const label = archived ? 'Cancelada' : paused ? 'Pausada' : 'Activa';
    return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${tone}`}>{label}</span>;
};
