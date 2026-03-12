// src/features/usuarios/views/users-mobile.jsx
import { useState } from 'react';
import { Badge, Button, Icon, Skeleton } from '@/components/ui/z_index';
import { UserFormModal } from '../components/user-form-modal';
import { UserStatusModal } from '../components/user-status-modal';

const ROL_LABEL = {
    SUPER_ADMIN: 'Super Admin',
    JEFE_MTTO: 'Jefe Mtto',
    COORDINADOR_MTTO: 'Coordinador',
    TECNICO: 'Técnico',
    CLIENTE_INTERNO: 'Cliente Interno',
};

const ROL_TEXT_COLOR = {
    SUPER_ADMIN: 'text-marca-primario',
    JEFE_MTTO: 'text-marca-primario',
    COORDINADOR_MTTO: 'text-amber-700',
    TECNICO: 'text-blue-700',
    CLIENTE_INTERNO: 'text-rose-800',
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

export const UsersMobile = ({
    users,
    loading,
    submitting,
    currentUser,
    departamentos,
    page,
    totalPages,
    onPageChange,
    onSave,
    onToggleStatus,
    onRefresh,
}) => {
    const [editTarget, setEditTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);

    const handleStatusConfirm = async () => {
        if (!statusTarget) return;
        const nuevoEstado = statusTarget.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        await onToggleStatus(statusTarget.id, nuevoEstado);
        setStatusTarget(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-3 px-1 pt-1 pb-24">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                        <Skeleton className="h-3 w-1/3 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (!users.length) {
        return (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                <Icon name="search_off" size="xl" />
                <p className="text-sm font-medium">Sin resultados</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-3 px-1 pt-1 pb-32">
                {users.map((row) => (
                    <div key={row.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        {/* Cabecera */}
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-extrabold text-slate-900 text-base leading-tight">{row.nombre}</p>
                            {/* Campo del backend es 'estado' */}
                            <Badge status={row.estado === 'ACTIVO' ? 'activo' : 'inactivo'}>
                                {row.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </div>

                        {/* Datos */}
                        <div className="space-y-1 text-sm text-slate-600 mb-4">
                            <p className="flex items-center gap-2">
                                <Icon name="alternate_email" size="xs" className="text-slate-400" />
                                <span className="font-codigo text-xs">{row.username}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <Icon name="badge" size="xs" className="text-slate-400" />
                                <span className={`font-bold text-xs ${ROL_TEXT_COLOR[row.rol] ?? 'text-slate-600'}`}>
                                    {ROL_LABEL[row.rol] ?? row.rol}
                                </span>
                            </p>
                            {row.departamento?.nombre && (
                                <p className="flex items-center gap-2">
                                    <Icon name="business" size="xs" className="text-slate-400" />
                                    <span className="text-xs">{row.departamento.nombre}</span>
                                </p>
                            )}
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                            {puedeEditar(currentUser, row) ? (
                                <Button
                                    variant="editar" icon="edit" size="sm"
                                    onClick={() => setEditTarget(row)}
                                    className="flex-1 text-xs"
                                >
                                    Editar
                                </Button>
                            ) : (
                                <div className="flex-1 flex items-center justify-center gap-1 text-slate-300 text-xs py-1">
                                    <Icon name="lock" size="xs" /> Bloqueado
                                </div>
                            )}

                            {puedeCambiarEstado(currentUser, row) && (
                                <Button
                                    variant={row.estado === 'ACTIVO' ? 'borrar' : 'guardar'}
                                    icon={row.estado === 'ACTIVO' ? 'person_off' : 'person_check'}
                                    size="sm"
                                    onClick={() => setStatusTarget(row)}
                                    className="flex-1 text-xs"
                                >
                                    {row.estado === 'ACTIVO' ? 'Desactivar' : 'Reactivar'}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="fixed bottom-20 left-0 right-0 flex justify-center z-40 pb-2">
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-2 shadow-lg">
                        <Button variant="cancelar" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="!py-1 !px-3 text-xs">‹</Button>
                        <span className="text-xs font-bold text-slate-700 min-w-[4rem] text-center">{page} / {totalPages}</span>
                        <Button variant="accion" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="!py-1 !px-3 text-xs">›</Button>
                    </div>
                </div>
            )}

            {/* FAB Refresh */}
            <button
                onClick={onRefresh}
                disabled={loading}
                className={`fixed bottom-36 right-5 z-50 w-12 h-12 rounded-full shadow-xl
          flex items-center justify-center bg-marca-primario text-white
          hover:bg-marca-primario-hover transition-all duration-200
          ${loading ? 'opacity-70 cursor-wait' : 'active:scale-95'}`}
            >
                <Icon name="refresh" size="sm" className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Modales */}
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