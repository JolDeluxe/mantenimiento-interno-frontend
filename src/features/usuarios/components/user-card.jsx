// src/features/usuarios/components/user-card.jsx
import { Badge, Icon, Button } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const ROL_LABEL = {
    SUPER_ADMIN: 'Super Admin',
    JEFE_MTTO: 'Jefe Mtto',
    COORDINADOR_MTTO: 'Coordinador',
    TECNICO: 'Técnico',
    CLIENTE_INTERNO: 'Cliente',
};

const ROL_COLOR = {
    SUPER_ADMIN: 'text-marca-primario',
    JEFE_MTTO: 'text-marca-primario',
    COORDINADOR_MTTO: 'text-amber-700',
    TECNICO: 'text-blue-700',
    CLIENTE_INTERNO: 'text-rose-700',
};

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

/**
 * Tarjeta de usuario para vista móvil.
 *
 * Props:
 *   usuario       → objeto de usuario del backend
 *   currentUser   → usuario autenticado (para calcular permisos)
 *   onEdit        → (usuario) => void
 *   onToggleStatus→ (usuario) => void
 *   onViewDetail  → (usuario) => void
 */
export const UserCard = ({ usuario, currentUser, onEdit, onToggleStatus, onViewDetail }) => {
    const canEdit = puedeEditar(currentUser, usuario);
    const canToggle = puedeCambiarEstado(currentUser, usuario);
    const isActive = usuario.estado === 'ACTIVO';

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

            {/* ── Cabecera: avatar + nombre + badge ── */}
            <div
                className="flex items-center gap-3 mb-3 active:opacity-70 transition-opacity"
                onClick={() => onViewDetail?.(usuario)}
            >
                {usuario.imagen ? (
                    <img
                        src={usuario.imagen}
                        alt={`Avatar de ${usuario.nombre}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md shrink-0"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-marca-primario/10 flex items-center justify-center text-marca-primario text-lg font-black border-2 border-white shadow-md shrink-0">
                        {usuario.nombre?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-900 text-base leading-tight truncate">
                        {usuario.nombre}
                    </p>
                    <p className="font-codigo text-xs text-slate-400 mt-0.5 truncate">
                        {usuario.username}
                    </p>
                </div>

                <Badge status={isActive ? 'activo' : 'inactivo'} className="shrink-0">
                    {isActive ? 'Activo' : 'Inactivo'}
                </Badge>
            </div>

            {/* ── Datos secundarios ── */}
            <div className="space-y-1.5 mb-3 ml-1">
                <p className="flex items-center gap-2">
                    <Icon name="badge" size="xs" className="text-slate-300 shrink-0" />
                    <span className={cn('text-xs font-bold', ROL_COLOR[usuario.rol] ?? 'text-slate-600')}>
                        {ROL_LABEL[usuario.rol] ?? usuario.rol}
                    </span>
                </p>

                {usuario.departamento?.nombre && (
                    <p className="flex items-center gap-2">
                        <Icon name="business" size="xs" className="text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-500 truncate">
                            {usuario.departamento.nombre}
                        </span>
                    </p>
                )}

                {usuario.cargo && (
                    <p className="flex items-center gap-2">
                        <Icon name="work" size="xs" className="text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-500 truncate">{usuario.cargo}</span>
                    </p>
                )}
            </div>

            {/* ── Acciones ── */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">

                {/* Botón ver detalle (siempre visible) */}
                <button
                    onClick={() => onViewDetail?.(usuario)}
                    className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 active:scale-95 transition-all"
                >
                    <Icon name="visibility" size="xs" />
                </button>

                {canEdit ? (
                    <button
                        onClick={() => onEdit?.(usuario)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-prioridad-media active:scale-95 transition-all shadow-sm"
                    >
                        <Icon name="edit" size="xs" />
                        <span>Editar</span>
                    </button>
                ) : (
                    <div className="flex-1 flex items-center justify-center gap-1.5 text-slate-300 text-xs py-1.5">
                        <Icon name="lock" size="xs" />
                        <span>Sin permiso</span>
                    </div>
                )}

                {canToggle && (
                    <button
                        onClick={() => onToggleStatus?.(usuario)}
                        className={cn(
                            'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white active:scale-95 transition-all shadow-sm',
                            isActive
                                ? 'bg-estado-rechazado'
                                : 'bg-estado-resuelto'
                        )}
                    >
                        <Icon name={isActive ? 'person_off' : 'person_check'} size="xs" />
                        <span>{isActive ? 'Desactivar' : 'Reactivar'}</span>
                    </button>
                )}
            </div>
        </div>
    );
};