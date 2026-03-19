// src/features/usuarios/views/users-mobile.jsx
import { useState, useMemo } from 'react';
import { Icon, Skeleton, RefreshFab } from '@/components/ui/z_index';
import { GlassFab, GlassPaginationPill, GlassViewToggle } from '@/components/ui/liquid-glass-mobile';
import { UserCard } from '../components/user-card';
import { UserFormModal } from '../components/user-form-modal';
import { UserStatusModal } from '../components/user-status-modal';
import { UserDetailModal } from '../components/user-detail-modal';
import { UserSummaryBar } from '../components/user-summary-bar';
import { UserFilterBar } from '../components/user-filter-bar';
import { UsersTable } from '../components/users-table';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { hardReload } from '@/utils/hard-reload';
import { cn } from '@/utils/cn';

const SKELETON_COUNT = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Tokens glass (espejo fiel de liquid-glass-mobile internals)
// ─────────────────────────────────────────────────────────────────────────────
const GLASS_VARIANTS = {
    primary: { bg: 'rgba(72,43,44,0.78)', shadow: '0 12px 36px rgba(72,43,44,0.40), 0 2px 8px rgba(72,43,44,0.20)' },
    danger: { bg: 'rgba(220,38,38,0.72)', shadow: '0 10px 30px rgba(220,38,38,0.30), 0 2px 6px rgba(220,38,38,0.16)' },
};

const glassActive = (variant = 'primary') => {
    const v = GLASS_VARIANTS[variant];
    return {
        background: v.bg,
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.32)',
        boxShadow: `${v.shadow}, 0 1px 0 rgba(255,255,255,0.48) inset, 0 -1px 0 rgba(0,0,0,0.08) inset`,
        borderRadius: 10,
        position: 'relative',
        overflow: 'hidden',
    };
};

const glassPill = {
    display: 'inline-flex',
    padding: 4,
    borderRadius: 14,
    gap: 4,
    backdropFilter: 'blur(16px) saturate(140%)',
    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
    background: 'rgba(255,255,255,0.18)',
    border: '1px solid rgba(255,255,255,0.30)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.45) inset',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
};

const GlassSheen = () => (
    <div
        aria-hidden
        style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
            background: 'linear-gradient(148deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 60%)',
        }}
    />
);

// ─────────────────────────────────────────────────────────────────────────────
// GlassIconChip
// ─────────────────────────────────────────────────────────────────────────────
const GlassIconChip = ({ icon, isActive, variant = 'primary', onClick }) => (
    <button
        onClick={onClick}
        style={
            isActive
                ? glassActive(variant)
                : { borderRadius: 10, background: 'transparent', border: '1px solid transparent' }
        }
        className="flex items-center justify-center w-8 h-8 transition-all duration-200 active:scale-90 outline-none select-none shrink-0"
    >
        {isActive && <GlassSheen />}
        <Icon
            name={icon}
            size="xs"
            className={cn('relative transition-colors', isActive ? 'text-white' : 'text-slate-500')}
        />
    </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// MobileFilterChips — Fila C
// Elimina DeptoDropdown. Implementa Overlay Nativo con <select> invisible.
// ─────────────────────────────────────────────────────────────────────────────
const MobileFilterChips = ({
    currentUser,
    departamentos,
    mostrarInactivos,
    onToggleInactivos,
    filtroDepto,
    onDeptoChange,
    isMttoFilter,
    onToggleMttoFilter,
}) => {
    const esSuperAdmin = currentUser?.rol === 'SUPER_ADMIN';

    const deptoOptions = useMemo(
        () => departamentos?.map((d) => ({ value: d.id, label: d.nombre })) || [],
        [departamentos]
    );

    return (
        <div className="flex items-center gap-2">
            {/* Pill: Mantenimiento + Departamento (solo SUPER_ADMIN) */}
            {esSuperAdmin && (
                <div style={glassPill}>
                    {/* Mantenimiento — oculto si hay depto activo */}
                    {!filtroDepto && (
                        <GlassIconChip
                            icon="construction"
                            isActive={isMttoFilter}
                            variant="primary"
                            onClick={onToggleMttoFilter}
                        />
                    )}

                    {/* Departamento — oculto si mtto activo */}
                    {!isMttoFilter && (
                        <div style={{ position: 'relative' }}>
                            <GlassIconChip
                                icon={filtroDepto ? 'close' : 'business'}
                                isActive={Boolean(filtroDepto)}
                                variant="primary"
                                onClick={() => filtroDepto && onDeptoChange(null)}
                            />
                            {!filtroDepto && (
                                <select
                                    value=""
                                    onChange={(e) => onDeptoChange(e.target.value || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                >
                                    <option value="" disabled>Departamentos...</option>
                                    {deptoOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Pill: Inactivos — siempre visible */}
            <div style={glassPill}>
                <GlassIconChip
                    icon={mostrarInactivos ? 'person_check' : 'person_off'}
                    isActive={mostrarInactivos}
                    variant="danger"
                    onClick={onToggleInactivos}
                />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// UsersMobile
// ─────────────────────────────────────────────────────────────────────────────
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

    // FAB derecho — refresh arriba, add abajo
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

            {/* ── 3. CONTROLES ────────────────────────────────────────────────────── */}
            <div className="mb-3 flex flex-col gap-2">
                {/* Fila A — Buscador aislado (mobileSearchOnly) */}
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

                {/* Fila B — selector de vista (derecha) */}
                <div className="flex items-center justify-end">
                    <GlassViewToggle value={viewMode} onChange={setViewMode} />
                </div>

                {/* Fila C — Chips de contexto móviles */}
                <div className="flex items-center justify-start">
                    <MobileFilterChips
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

            {/* ── 6. FABS — columna derecha ── */}
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

            {/* ── 7. SCROLL TO TOP — columna izquierda ── */}
            <div className="md:hidden">
                <ScrollToTopButton bottom={fabAddBottom} left="20px" />
            </div>

            {/* ── 8. MODALES ── */}
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

// ─────────────────────────────────────────────────────────────────────────────
// CardsContent
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// CardSkeleton
// ─────────────────────────────────────────────────────────────────────────────
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