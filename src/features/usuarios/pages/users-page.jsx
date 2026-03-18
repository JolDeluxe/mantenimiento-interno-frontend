// src/features/usuarios/pages/users-page.jsx
import { useState, useEffect, useCallback } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useUsers } from '../hooks/use-users';
import { UsersDesktop } from '../views/users-desktop';
import { UsersMobile } from '../views/users-mobile';
import { UserFormModal } from '../components/user-form-modal';

/**
 * LIMIT controla cuántas filas pide el frontend al backend por página.
 * Ajustar aquí para cambiar el tamaño de página sin tocar nada más.
 * Con 19 usuarios en la BD, usa un valor ≤ 18 para ver la paginación en acción.
 */
const LIMIT = 10;

const UsersPage = () => {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;

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

    // ── Estado de la página ──────────────────────────────────────────────────
    const [query, setQuery] = useState('');
    const [filtroRol, setFiltroRol] = useState('TODOS');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [mostrarInactivos, setMostrarInactivos] = useState(false);
    const [filtroDepto, setFiltroDepto] = useState('');
    const [isMttoFilter, setIsMttoFilter] = useState(false);

    // ── Carga de datos ───────────────────────────────────────────────────────
    const loadUsers = useCallback(() => {
        const params = {
            page,
            limit: LIMIT,
        };

        if (query) params.q = query;
        if (filtroRol !== 'TODOS') params.rol = filtroRol;
        if (mostrarInactivos) params.estado = 'INACTIVO';
        if (sortConfig?.key) {
            params.sort = JSON.stringify([{ [sortConfig.key]: sortConfig.direction }]);
        }
        if (isMttoFilter) {
            params.mtto = true;
        } else if (filtroDepto) {
            params.departamentoId = Number(filtroDepto);
        }

        fetchUsers(params).catch(() => notify.error('Error al cargar usuarios.'));
    }, [page, query, filtroRol, sortConfig, mostrarInactivos, isMttoFilter, filtroDepto, fetchUsers]);

    useEffect(() => { loadUsers(); }, [loadUsers]);
    useEffect(() => { fetchDepartamentos(); }, [fetchDepartamentos]);

    // ── Handlers de filtros (siempre resetean a página 1) ───────────────────
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

    const handleToggleMttoFilter = useCallback(() => {
        setIsMttoFilter(prev => !prev);
        setFiltroRol('TODOS');
        setPage(1);
    }, []);

    const handleDeptoChange = useCallback((id) => {
        setFiltroDepto(id);
        setFiltroRol('TODOS');
        setPage(1);
    }, []);

    const handleToggleInactivos = useCallback(() => {
        setMostrarInactivos(prev => !prev);
        setFiltroRol('TODOS');
        setPage(1);
    }, []);

    // ── Handlers de acciones ────────────────────────────────────────────────
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
            throw err;
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
        } catch {
            notify.error('Error al cambiar el estatus del usuario.');
        }
    };

    // ── Props compartidos para ambas vistas ──────────────────────────────────
    /**
     * Separación explícita de los dos totales:
     *
     *   totalParaSummary → meta.totalAbsoluto
     *     Cuántos usuarios existen en total (sin filtro de rol).
     *     Lo usan las pastillas de la SummaryBar.
     *
     *   totalParaPaginador → meta.totalFiltrado
     *     Cuántos usuarios coinciden con la búsqueda/filtros actuales.
     *     Es el número que determina cuántas páginas hay.
     *     = pagination.total del backend.
     */
    const sharedViewProps = {
        users,
        loading,
        submitting,
        currentUser,
        departamentos,
        page,
        limit: LIMIT,
        totalPages: meta.totalPages,
        totalParaSummary: meta.totalAbsoluto,
        totalParaPaginador: meta.totalFiltrado,
        resumenRoles: meta.resumenRoles,
        sortConfig,
        query,
        filtroRol,
        mostrarInactivos,
        filtroDepto,
        isMttoFilter,
        onToggleMttoFilter: handleToggleMttoFilter,
        onDeptoChange: handleDeptoChange,
        onToggleInactivos: handleToggleInactivos,
        onPageChange: setPage,
        onSortChange: handleSortChange,
        onSearchChange: handleSearchChange,
        onFilterChange: handleFilterChange,
        onSave: handleUpdate,
        onToggleStatus: handleToggleStatus,
        onRefresh: loadUsers,
        onOpenCreate: () => setShowCreate(true),
    };

    return (
        <div className="max-w-full mx-auto">
            <div className="p-2 lg:p-4">
                {isDesktop
                    ? <UsersDesktop {...sharedViewProps} />
                    : <UsersMobile  {...sharedViewProps} />
                }
            </div>

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