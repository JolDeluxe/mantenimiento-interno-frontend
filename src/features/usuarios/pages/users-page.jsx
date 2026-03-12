// src/features/usuarios/pages/users-page.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { Button, Icon } from '@/components/ui/z_index';
import { useUsers } from '../hooks/use-users';
import { UsersDesktop } from '../views/users-desktop';
import { UsersMobile } from '../views/users-mobile';
import { UserSummaryBar } from '../components/user-summary-bar';
import { UserFilterBar } from '../components/user-filter-bar';
import { UserFormModal } from '../components/user-form-modal';

const LIMIT = 10;

const UsersPage = () => {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;

    // ── Store ─────────────────────────────────────────────────────────────────
    const {
        users,
        departamentos,
        meta,
        loading,
        submitting,
        fetchUsers,
        fetchDepartamentos,
        createUser,
        updateUser,
        toggleStatus,
    } = useUsers();

    // ── Filtros y paginación ───────────────────────────────────────────────────
    const [query, setQuery] = useState('');
    const [filtroRol, setFiltroRol] = useState('TODOS');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });

    // ── Modal alta ─────────────────────────────────────────────────────────────
    const [showCreate, setShowCreate] = useState(false);

    // ── Fetch principal ────────────────────────────────────────────────────────
    const loadUsers = useCallback(() => {
        const params = {
            page,
            limit: LIMIT,
            q: query || undefined,
            rol: filtroRol !== 'TODOS' ? filtroRol : undefined,
            sortBy: sortConfig.key,
            sortOrder: sortConfig.direction,
        };
        fetchUsers(params).catch(() => notify.error('Error al cargar usuarios.'));
    }, [page, query, filtroRol, sortConfig, fetchUsers]);

    useEffect(() => {
        loadUsers(); console.log('🔍 users state:', users);
        console.log('🔍 meta state:', meta);
    }, [loadUsers]);

    // Departamentos se cargan una sola vez
    useEffect(() => { fetchDepartamentos(); }, [fetchDepartamentos]);

    // ── Handlers de filtros (reset page) ──────────────────────────────────────
    const handleSearchChange = useCallback((q) => {
        setQuery(q);
        setPage(1);
    }, []);

    const handleFilterChange = useCallback((rol) => {
        setFiltroRol(rol);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((key, direction) => {
        setSortConfig({ key, direction });
        setPage(1);
    }, []);

    // ── Mutaciones ─────────────────────────────────────────────────────────────
    const handleCreate = async (payload) => {
        try {
            await createUser(payload);
            notify.success('Usuario creado correctamente.');
            setShowCreate(false);
            loadUsers();
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                'Error al crear el usuario.';
            notify.error(msg);
            throw err; // Propaga para que el modal maneje inline si es duplicado
        }
    };

    const handleUpdate = async (id, payload) => {
        try {
            await updateUser(id, payload);
            notify.success('Usuario actualizado correctamente.');
            loadUsers();
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                'Error al actualizar el usuario.';
            notify.error(msg);
            throw err;
        }
    };

    const handleToggleStatus = async (id, estatus) => {
        try {
            await toggleStatus(id, estatus);
            const label = estatus === 'ACTIVO' ? 'reactivado' : 'desactivado';
            notify.success(`Usuario ${label} correctamente.`);
            loadUsers();
        } catch (err) {
            notify.error('Error al cambiar el estatus del usuario.');
        }
    };

    // ── Total de páginas (calculado desde meta) ───────────────────────────────
    const totalPages = useMemo(
        () => Math.max(1, Math.ceil((meta.totalItems ?? 0) / LIMIT)),
        [meta.totalItems]
    );

    // ── Props compartidas entre vistas ────────────────────────────────────────
    const sharedViewProps = {
        users,
        loading,
        submitting,
        currentUser,
        departamentos,
        page,
        totalPages,
        sortConfig,
        onPageChange: setPage,
        onSortChange: handleSortChange,
        onSave: handleUpdate,
        onToggleStatus: handleToggleStatus,
        onRefresh: loadUsers,
    };

    return (
        <div className="space-y-4 max-w-full mx-auto">


            {/* ── Panel principal ────────────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {/* Barra de resumen + filtros */}
                <div className="p-4 border-b border-slate-100 space-y-3 sticky top-0 bg-white z-20">
                    <UserSummaryBar
                        totalItems={meta.totalItems ?? 0}
                        resumenRoles={meta.resumenRoles ?? {}}
                        filtroActual={filtroRol}
                        onFilterChange={handleFilterChange}
                        loading={loading}
                    />
                    <div className="flex items-center justify-between gap-3">
                        <UserFilterBar onSearchChange={handleSearchChange} />
                        {/* Refresh — Solo desktop, en mobile hay FAB */}
                        <button
                            onClick={loadUsers}
                            disabled={loading}
                            className={`hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-500
                hover:text-marca-primario transition-colors px-2 py-1 rounded-lg
                hover:bg-slate-50 ${loading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            <Icon name="refresh" size="xs" className={loading ? 'animate-spin' : ''} />
                            Actualizar
                        </button>
                        <div className="flex items-center justify-between">

                            {/* Botón "Nuevo" — Desktop fijo aquí, Mobile flotante abajo */}
                            <Button
                                variant="guardar"
                                icon="person_add"
                                onClick={() => setShowCreate(true)}
                                className="hidden lg:inline-flex"
                            >
                                Nuevo Usuario
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Contenido de vista */}
                <div className="p-2 lg:p-4">
                    {isDesktop ? (
                        <UsersDesktop {...sharedViewProps} />
                    ) : (
                        <UsersMobile {...sharedViewProps} />
                    )}
                </div>
            </div>

            {/* ── Botón Nuevo flotante (solo mobile) ───────────────────────── */}
            <button
                onClick={() => setShowCreate(true)}
                className="lg:hidden fixed bottom-20 right-5 z-50 flex items-center gap-2
          bg-estado-resuelto text-white font-bold text-sm
          px-4 py-3 rounded-full shadow-xl
          hover:bg-green-600 active:scale-95 transition-all"
            >
                <Icon name="person_add" size="sm" />
                Nuevo
            </button>

            {/* ── Modal Alta ────────────────────────────────────────────────── */}
            <UserFormModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                usuarioAEditar={null}
                currentUser={currentUser}
                departamentos={departamentos}
                submitting={submitting}
                onSuccess={handleCreate}
            />
        </div>
    );
};

export default UsersPage;