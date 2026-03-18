// src/features/usuarios/components/user-status-badge.jsx

export const UserStatusBadge = ({ estatus, estado }) => {
  // Prisma dicta "estado" como fuente de verdad, soportamos "estatus" por retrocompatibilidad de UI
  const valorDefinitivo = estado || estatus;
  const isActivo = valorDefinitivo === "ACTIVO";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border transition-colors ${isActivo
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shadow-sm ${isActivo ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
      ></span>
      {valorDefinitivo || 'DESCONOCIDO'}
    </span>
  );
};