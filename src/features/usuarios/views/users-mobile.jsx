import { useState } from 'react';
import { GlassFab, GlassPaginationPill, GlassViewToggle } from '@/components/ui/z_index';
import { ScrollToTopButton } from '@/components/ui/z_index';
import { UserFormModal } from '../components/user-form-modal';
import { UserStatusModal } from '../components/user-status-modal';
import { UserDetailModal } from '../components/user-detail-modal';
import { UserSummaryBar } from '../components/user-summary-bar';
import { UserFilterBar } from '../components/user-filter-bar';
import { UsersTable } from '../components/users-table';
import { MobileUserFilterChips } from '../components/mobile-user-filter-chips';
import { MobileUserCardsContent } from '../components/mobile-user-cards-content';
import { hardReload } from '@/utils/hard-reload';
import { cn } from '@/utils/cn';

export const UsersMobile = ({
    users,
    loading,
    submitting,
    currentUser,
    departamentos,
    page,
    limit,
    totalPages,
    totalParaSummary,
    totalParaPaginador,
    resumenRoles,
    filtroRol,
    query,
    sortConfig,
    mostrarInactivos,
    filtroDepto,
    isMttoFilter,
    onPageChange,
    onSortChange,
    onSave,
    onToggleStatus,
    onRefresh,
    onOpenCreate,
    onFilterChange,
    onSearchChange,
    onToggleInactivos,
    onDeptoChange,
    onToggleMttoFilter,
}) => {
    const [viewMode, setViewMode] = useState('cards');
    const [editTarget, setEditTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [detailTarget, setDetailTarget] = useState(null);

    const hasContent = !loading && users.length > 0;
    const hasPaginator = hasContent && totalPages > 1;

    const handleStatusConfirm = async () => {
        if (!statusTarget) return;
        const nuevoEstado = statusTarget.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        await onToggleStatus(statusTarget.id, nuevoEstado);
        setStatusTarget(null);
    };

    const fabAddBottom = hasPaginator ? '104px' : '84px';
    const fabRefreshBottom = hasPaginator ? '164px' : '144px';

    return (
        <>
            <div className="px-1 mb-4">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos">
                    Usuarios
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium leading-snug">
                    Gestiona los usuarios y sus niveles de acceso.
                </p>
            </div>

            <div className="mb-3">
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
            </div>

            <div className="mb-3 flex flex-col gap-2">
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
                    mobileSearchOnly
                />

                <div className="flex items-center justify-end">
                    <GlassViewToggle value={viewMode} onChange={setViewMode} />
                </div>

                <div className="flex items-center justify-start">
                    <MobileUserFilterChips
                        currentUser={currentUser}
                        departamentos={departamentos}
                        mostrarInactivos={mostrarInactivos}
                        onToggleInactivos={onToggleInactivos}
                        filtroDepto={filtroDepto}
                        onDeptoChange={onDeptoChange}
                        isMttoFilter={isMttoFilter}
                        onToggleMttoFilter={onToggleMttoFilter}
                    />
                </div>
            </div>

            {viewMode === 'cards' ? (
                <MobileUserCardsContent
                    users={users}
                    loading={loading}
                    currentUser={currentUser}
                    hasPaginator={hasPaginator}
                    onEdit={setEditTarget}
                    onToggleStatus={setStatusTarget}
                    onViewDetail={setDetailTarget}
                />
            ) : (
                <div className={cn('mb-40', hasPaginator && 'mb-52')}>
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
                        onRecargar={onRefresh}
                        hidePagination
                    />
                </div>
            )}

            {hasPaginator && (
                <div className="md:hidden">
                    <GlassPaginationPill
                        page={page}
                        totalPages={totalPages}
                        totalItems={totalParaPaginador}
                        onPageChange={onPageChange}
                        loading={loading}
                        bottom="24px"
                    />
                </div>
            )}

            <div className="md:hidden">
                <GlassFab
                    icon="refresh"
                    onClick={hardReload}
                    isLoading={loading}
                    variant="neutral"
                    size={50}
                    bottom={fabRefreshBottom}
                    right="20px"
                />
                <GlassFab
                    icon="add"
                    onClick={onOpenCreate}
                    variant="primary"
                    size={56}
                    bottom={fabAddBottom}
                    right="20px"
                />
            </div>

            <div className="md:hidden">
                <ScrollToTopButton bottom={fabAddBottom} left="20px" />
            </div>

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

            <UserDetailModal
                isOpen={Boolean(detailTarget)}
                onClose={() => setDetailTarget(null)}
                usuario={detailTarget}
            />
        </>
    );
};