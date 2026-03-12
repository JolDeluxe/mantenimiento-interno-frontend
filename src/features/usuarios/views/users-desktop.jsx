// src/features/usuarios/views/users-desktop.jsx
import { useState } from 'react';
import { Badge, Button, Icon, Tooltip, Skeleton } from '@/components/ui/z_index';
import { UserFormModal } from '../components/user-form-modal';
import { UserStatusModal } from '../components/user-status-modal';

// ─── Mapeos presentacionales ──────────────────────────────────────────────────
const ROL_LABEL = {
    SUPER_ADMIN: 'Super Admin',
    JEFE_MTTO: 'Jefe Mtto',
    COORDINADOR_MTTO: 'Coordinador',
    TECNICO: 'Técnico',
    CLIENTE_INTERNO: 'Cliente Interno',
};

const ROL_COLOR = {
    SUPER_ADMIN: 'bg-marca-primario/10 text-marca-primario   border-marca-primario/20',
    JEFE_MTTO: 'bg-marca-primario/5  text-marca-primario   border-marca-primario/15',
    COORDINADOR_MTTO: 'bg-amber-100         text-amber-800        border-amber-200',
    TECNICO: 'bg-blue-100          text-blue-800         border-blue-200',
    CLIENTE_INTERNO: 'bg-rose-100          text-rose-800         border-rose-200',
};

// ─── Reglas de permisos (solo presentación) ───────────────────────────────────
const puedeEditar = (me, row) => {
    if (me?.rol === 'SUPER_ADMIN') return true;
    if (Number(me?.id) === Number(row.id)) return true;
    if (me?.rol === 'JEFE_MTTO' && row.rol !== 'JEFE_MTTO' && row.rol !== 'SUPER_ADMIN') return true;
    return false;
};

const puedeCambiarEstado = (me, row) => {
    if (Number(me?.id) === Number(row.id)) return false;
    if (me?.rol === 'SUPER_ADMIN') return true;
    if (me?.rol === 'JEFE_MTTO' && row.rol !== 'JEFE_MTTO' && row.rol !== 'SUPER_ADMIN') return true;
    return false;
};

// ─── Ícono de ordenamiento ────────────────────────────────────────────────────
const SortIcon = ({ columnKey, sortConfig }) => {
    if (sortConfig?.key !== columnKey)
        return <span className="text-slate-300 text-[10px] ml-1">⇅</span>;
    return (
        <span className="text-marca-primario ml-1">
            {sortConfig.direction === 'asc' ? '↑' : '↓'}
        </span>
    );
};

// ─── Columnas ordenables ──────────────────────────────────────────────────────
const TH = ({ label, columnKey, sortable, sortConfig, onSortChange, align = 'left' }) => (
    <th
        onClick={() => sortable && onSortChange(columnKey, sortConfig?.key === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc')}
        className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-600 border-b border-slate-200
      bg-slate-50 whitespace-nowrap select-none
      text-${align}
      ${sortable ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''}`}
    >
        {label}
        {sortable && <SortIcon columnKey={columnKey} sortConfig={sortConfig} />}
    </th>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export const UsersDesktop = ({
    users,
    loading,
    submitting,
    currentUser,
    departamentos,
    page,
    totalPages,
    sortConfig,
    onPageChange,
    onSortChange,
    onSave,
    onToggleStatus,
}) => {
    const [editTarget, setEditTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);

    const handleStatusConfirm = async () => {
        if (!statusTarget) return;
        const nuevoEstado = statusTarget.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        await onToggleStatus(statusTarget.id, nuevoEstado);
        setStatusTarget(null);
    };

    return (
        <>
            {/* ── Tabla ──────────────────────────────────────────────────────────── */}
            <div className="w-full rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto max-h-[calc(100vh-340px)] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr>
                                <TH label="Nombre" columnKey="nombre" sortable sortConfig={sortConfig} onSortChange={onSortChange} />
                                <TH label="Usuario" columnKey="username" sortable sortConfig={sortConfig} onSortChange={onSortChange} />
                                <TH label="Departamento" columnKey="departamento" />
                                <TH label="Rol" columnKey="rol" sortable sortConfig={sortConfig} onSortChange={onSortChange} align="center" />
                                <TH label="Estado" columnKey="estado" sortable sortConfig={sortConfig} onSortChange={onSortChange} align="center" />
                                <TH label="Acciones" columnKey="acciones" align="center" />
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                // Skeleton rows
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <Skeleton className="h-4 w-full rounded" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Icon name="search_off" size="xl" />
                                            <p className="text-sm font-medium">No hay usuarios que coincidan con los filtros.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                                        {/* Nombre */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {/* Avatar inicial */}
                                                {row.imagen ? (
                                                    <img
                                                        src={row.imagen}
                                                        alt={row.nombre}
                                                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-xs font-extrabold text-slate-500">
                                                        {row.nombre?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate">{row.nombre}</p>
                                                    {row.cargo && (
                                                        <p className="text-[11px] text-slate-400 truncate">{row.cargo}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Username */}
                                        <td className="px-4 py-3">
                                            <span className="font-codigo text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                @{row.username}
                                            </span>
                                        </td>

                                        {/* Departamento */}
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {row.departamento?.nombre ?? (
                                                <span className="text-slate-300 italic text-xs">Sin asignar</span>
                                            )}
                                        </td>

                                        {/* Rol */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full border
                        ${ROL_COLOR[row.rol] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                {ROL_LABEL[row.rol] ?? row.rol}
                                            </span>
                                        </td>

                                        {/* Estado */}
                                        <td className="px-4 py-3 text-center">
                                            <Badge status={row.estado === 'ACTIVO' ? 'activo' : 'inactivo'}>
                                                {row.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Editar */}
                                                {puedeEditar(currentUser, row) ? (
                                                    <Tooltip content="Editar usuario">
                                                        <button
                                                            onClick={() => setEditTarget(row)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-amber-400
                                text-amber-600 hover:bg-amber-600 hover:text-white transition-all duration-150 cursor-pointer"
                                                        >
                                                            <Icon name="edit" size="sm" />
                                                        </button>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip content="Sin permisos">
                                                        <span className="w-7 h-7 flex items-center justify-center text-slate-300">
                                                            <Icon name="lock" size="sm" />
                                                        </span>
                                                    </Tooltip>
                                                )}

                                                {/* Cambiar estado */}
                                                {puedeCambiarEstado(currentUser, row) && (
                                                    <Tooltip content={row.estado === 'ACTIVO' ? 'Desactivar' : 'Reactivar'}>
                                                        <button
                                                            onClick={() => setStatusTarget(row)}
                                                            className={`w-7 h-7 flex items-center justify-center rounded-lg border
                                transition-all duration-150 cursor-pointer
                                ${row.estado === 'ACTIVO'
                                                                    ? 'border-red-400 text-red-600 hover:bg-red-600 hover:text-white'
                                                                    : 'border-emerald-400 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                                                }`}
                                                        >
                                                            <Icon name={row.estado === 'ACTIVO' ? 'person_off' : 'person_check'} size="sm" />
                                                        </button>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Paginación ────────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span>
                            Página <strong className="text-slate-800">{page}</strong> de{' '}
                            <strong className="text-slate-800">{totalPages}</strong>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="bg-slate-200/70 px-2 py-0.5 rounded-full">
                            {users.length} {users.length === 1 ? 'usuario' : 'usuarios'} en esta página
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300
                rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-marca-primario border border-transparent
                rounded-lg hover:bg-marca-primario-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Modales ───────────────────────────────────────────────────────── */}
            <UserFormModal
                isOpen={Boolean(editTarget)}
                onClose={() => setEditTarget(null)}
                usuarioAEditar={editTarget}
                currentUser={currentUser}
                departamentos={departamentos}
                submitting={submitting}
                onSuccess={async (payload) => {
                    await onSave(editTarget.id, payload);
                    setEditTarget(null);
                }}
            />

            <UserStatusModal
                isOpen={Boolean(statusTarget)}
                onClose={() => setStatusTarget(null)}
                onConfirm={handleStatusConfirm}
                usuario={statusTarget}
                submitting={submitting}
            />
        </>
    );
};