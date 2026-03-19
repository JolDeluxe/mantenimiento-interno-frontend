// src/features/usuarios/views/users-desktop.jsx
import { UsersTable } from '../components/users-table';
import { UserFilterBar } from '../components/user-filter-bar';
import { UserSummaryBar } from '../components/user-summary-bar';
import { UserAddButton } from '../components/user-add-button';
import { RefreshFab } from '@/components/ui/z_index';

export const UsersDesktop = ({
    users,
    loading,
    submitting,
    currentUser,
    departamentos,
    page,
    limit,
    totalPages,
    sortConfig,
    query,
    filtroRol,
    totalParaSummary,      // ← para SummaryBar: total sin filtro de rol
    totalParaPaginador,    // ← para la tabla: total filtrado (mueve el paginador)
    resumenRoles,
    mostrarInactivos,
    filtroDepto,
    isMttoFilter,
    onToggleMttoFilter,
    onDeptoChange,
    onToggleInactivos,
    onPageChange,
    onSortChange,
    onSearchChange,
    onFilterChange,
    onSave,
    onToggleStatus,
    onRefresh,
    onOpenCreate,
}) => {
    return (
        <div className="flex flex-col gap-4">


            <RefreshFab bottom="32px" right="32px" size={48} />

            <UserSummaryBar
                currentUser={currentUser}
                total={totalParaSummary}
                conteos={resumenRoles}
                filtroActual={filtroRol}
                onFilterChange={onFilterChange}
                loading={loading}
                mostrarInactivos={mostrarInactivos}
                isMttoFilter={isMttoFilter}
                filtroDepto={filtroDepto}
                departamentos={departamentos}
            />

            <UserAddButton onClick={onOpenCreate} />


            <UserFilterBar
                currentUser={currentUser}
                query={query}
                departamentos={departamentos}
                onSearchChange={onSearchChange}
                mostrarInactivos={mostrarInactivos}
                onToggleInactivos={onToggleInactivos}
                filtroDepto={filtroDepto}
                onDeptoChange={onDeptoChange}
                isMttoFilter={isMttoFilter}
                onToggleMttoFilter={onToggleMttoFilter}
            />

            <UsersTable
                usuarios={users}
                loading={loading}
                submitting={submitting}
                currentUser={currentUser}
                departamentos={departamentos}
                page={page}
                limit={limit}
                totalPages={totalPages}
                totalItems={totalParaPaginador}
                sortConfig={sortConfig}
                onPageChange={onPageChange}
                onSortChange={onSortChange}
                onSave={onSave}
                onToggleStatus={onToggleStatus}
                onRefresh={onRefresh}
            />
        </div>
    );
};