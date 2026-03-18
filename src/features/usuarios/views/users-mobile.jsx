// src/features/usuarios/views/users-mobile.jsx
import { useState } from 'react';
import { Icon, Skeleton } from '@/components/ui/z_index';
import { GlassFab, GlassPaginationPill, GlassViewToggle } from '@/components/ui/liquid-glass-mobile';
import { UserCard } from '../components/user-card';
import { UserFormModal } from '../components/user-form-modal';
import { UserStatusModal } from '../components/user-status-modal';
import { UserDetailModal } from '../components/user-detail-modal';
import { UserSummaryBar } from '../components/user-summary-bar';
import { UserFilterBar } from '../components/user-filter-bar';
import { UsersTable } from '../components/users-table';
import { cn } from '@/utils/cn';

const SKELETON_COUNT = 5;

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
            {/* ── 1. ENCABEZADO ── */}
            <div className="px-1 mb-4">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos">
                    Usuarios
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium leading-snug">
                    Gestiona los usuarios y sus niveles de acceso.
                </p>
            </div>

            {/* ── 2. SUMMARY BAR ── */}
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

            {/* ── 3. FILTRO + TOGGLE DE VISTA ── */}
            <div className="mb-3">
                {/*
          glassMode=true → el botón de Inactivos usa estética Glass
          para coincidir visualmente con el toggle de cards/tabla
        */}
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
                    glassMode
                />

                {/* Toggle cards / tabla */}
                <div className="flex justify-end mt-2.5">
                    <GlassViewToggle value={viewMode} onChange={setViewMode} />
                </div>
            </div>

            {/* ── 4. CONTENIDO ── */}
            {viewMode === 'cards' ? (
                <CardsContent
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
                    {/*
            hidePagination=true → suprime la barra de paginación interna.
            La paginación la maneja GlassPaginationPill más abajo.
          */}
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

            {/* ── 5. PAGINACIÓN FLOTANTE ── */}
            {hasPaginator && (
                <GlassPaginationPill
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalParaPaginador}
                    onPageChange={onPageChange}
                    loading={loading}
                    bottom="24px"
                />
            )}

            {/* ── 6. FABS ── */}
            <GlassFab
                icon="refresh"
                onClick={onRefresh}
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

            {/* ── 7. MODALES ── */}
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

// ── Lista de cards ────────────────────────────────────────────────────────────
const CardsContent = ({ users, loading, currentUser, hasPaginator, onEdit, onToggleStatus, onViewDetail }) => {
    const bottomPadding = hasPaginator ? 'pb-56' : 'pb-44';

    if (loading) {
        return (
            <div className={cn('flex flex-col gap-3 px-1 pt-1', bottomPadding)}>
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!users.length) {
        return (
            <div className="flex flex-col items-center justify-center h-44 gap-3 text-slate-400">
                <Icon name="search_off" size="xl" />
                <p className="text-sm font-medium">Sin resultados</p>
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col gap-3 px-1 pt-1', bottomPadding)}>
            {users.map((row) => (
                <UserCard
                    key={row.id}
                    usuario={row}
                    currentUser={currentUser}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                    onViewDetail={onViewDetail}
                />
            ))}
        </div>
    );
};

// ── Skeleton ─────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
            <Skeleton className="h-5 w-14 rounded-md shrink-0" />
        </div>
        <div className="space-y-2 mb-3 ml-1">
            <Skeleton className="h-3 w-28 rounded-md" />
            <Skeleton className="h-3 w-36 rounded-md" />
        </div>
        <div className="flex gap-2 pt-3 border-t border-slate-100">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
        </div>
    </div>
);