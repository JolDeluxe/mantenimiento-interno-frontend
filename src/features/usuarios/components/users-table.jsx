// src/features/usuarios/components/users-table.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import { Table, Skeleton } from "@/components/ui/z_index";
import { UserStatusBadge } from "./user-status-badge";
import { UserFormModal } from "./user-form-modal";
import { UserStatusModal } from "./user-status-modal";
import { UserDetailModal } from "./user-detail-modal";
import { UserActions } from "./user-actions";
import { updateUserStatus } from "../api/users-api";

/**
 * Props nuevas:
 *   hidePagination → boolean — oculta la barra de paginación interna de <Table />.
 *                              Usar en mobile donde el paginador flotante ya existe.
 *                              Default: false.
 */
export const UsersTable = ({
  usuarios,
  loading,
  onRecargar,
  currentUser,
  departamentos,
  page,
  totalPages,
  totalItems,
  limit = 20,
  onPageChange,
  sortConfig,
  onSortChange,
  onSave,
  submitting,
  hidePagination = false,
}) => {
  const [openModalEditar, setOpenModalEditar] = useState(false);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [openModalDetalle, setOpenModalDetalle] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarioAConfirmar, setUsuarioAConfirmar] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const esSuperAdmin = currentUser?.rol === 'SUPER_ADMIN';

  const handleConfirmarEstatus = async () => {
    if (!usuarioAConfirmar) return;
    setIsConfirming(true);

    const currentStatus = usuarioAConfirmar.estado || usuarioAConfirmar.estatus;
    const nuevoEstatus = currentStatus === "ACTIVO" ? "INACTIVO" : "ACTIVO";

    try {
      await updateUserStatus(usuarioAConfirmar.id, nuevoEstatus);
      toast.success("Estatus actualizado exitosamente.");
      onRecargar?.();
      setOpenModalConfirm(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Error al procesar la solicitud.");
    } finally {
      setIsConfirming(false);
    }
  };

  const allColumns = [
    {
      header: "Perfil",
      accessorKey: "imagen",
      sortable: false,
      align: "center",
      headerClassName: "w-[5%] min-w-[60px]",
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-10 w-10 rounded-full mx-auto" />;
        if (!row.imagen) {
          return (
            <div className="w-10 h-10 rounded-full bg-marca-primario/10 flex items-center justify-center text-marca-primario font-bold border border-marca-primario/20 shadow-sm mx-auto">
              {row.nombre?.charAt(0).toUpperCase() ?? "?"}
            </div>
          );
        }
        return (
          <img
            src={row.imagen}
            alt={`Avatar de ${row.nombre}`}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm mx-auto"
          />
        );
      },
    },
    {
      header: "Usuario",
      accessorKey: "nombre",
      sortable: true,
      headerClassName: "w-[32%] min-w-[180px]",
      cell: (row) => {
        if (row.isSkeleton) return (
          <div className="flex flex-col gap-2 py-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        );
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{row.nombre}</span>
            <span className="font-mono text-slate-500 text-xs">{row.username}</span>
          </div>
        );
      },
    },
    {
      header: "Departamento",
      accessorKey: "departamento",
      sortable: true,
      headerClassName: "w-[20%] min-w-[150px] whitespace-nowrap",
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-4 w-full max-w-[120px]" />;
        return (
          <span className="text-sm font-medium text-slate-700">
            {row.departamento?.nombre || <span className="text-slate-400 italic">Sin departamento</span>}
          </span>
        );
      },
    },
    {
      header: "Rol",
      accessorKey: "rol",
      sortable: true,
      align: "center",
      headerClassName: "w-[15%] min-w-[120px] whitespace-nowrap",
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-6 w-24 mx-auto rounded-md" />;
        return (
          <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 uppercase tracking-wide whitespace-nowrap">
            {row.rol.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      header: "Estatus",
      accessorKey: "estado",
      sortable: false,
      align: "center",
      headerClassName: "w-[12%] min-w-[100px] whitespace-nowrap",
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-6 w-20 mx-auto rounded-full" />;
        return <UserStatusBadge estado={row.estado} estatus={row.estatus} />;
      },
    },
    {
      header: "Acciones",
      accessorKey: "acciones",
      align: "center",
      headerClassName: "w-[16%] min-w-[130px] whitespace-nowrap",
      cell: (row) => {
        if (row.isSkeleton) return (
          <div className="flex gap-2 justify-center">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        );
        return (
          <UserActions
            usuario={row}
            currentUser={currentUser}
            onViewDetail={(r) => { setUsuarioSeleccionado(r); setOpenModalDetalle(true); }}
            onEdit={(r) => { setUsuarioSeleccionado(r); setOpenModalEditar(true); }}
            onToggleStatus={(r) => { setUsuarioAConfirmar(r); setOpenModalConfirm(true); }}
          />
        );
      },
    },
  ];

  const columns = allColumns.filter((col) => {
    if (col.header === "Departamento" && !esSuperAdmin) return false;
    return true;
  });

  const tableData = loading
    ? Array.from({ length: 10 }).map((_, i) => ({ isSkeleton: true, id: `skel-${i}` }))
    : usuarios;

  return (
    <div className="w-full">
      <Table
        columns={columns}
        data={tableData}
        keyField="id"
        loading={false}
        emptyMessage="No hay usuarios que coincidan con los filtros."
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={onPageChange}
        sortConfig={sortConfig}
        hidePagination={hidePagination}
        onSortChange={(key) => {
          const direction =
            sortConfig?.key === key && sortConfig?.direction === "asc" ? "desc" : "asc";
          onSortChange(key, direction);
        }}
      />

      <UserFormModal
        isOpen={openModalEditar}
        onClose={() => { setOpenModalEditar(false); setUsuarioSeleccionado(null); }}
        usuarioAEditar={usuarioSeleccionado}
        currentUser={currentUser}
        departamentos={departamentos}
        submitting={submitting}
        onSuccess={async (payload) => {
          if (usuarioSeleccionado) {
            await onSave(usuarioSeleccionado.id, payload);
            setOpenModalEditar(false);
            setUsuarioSeleccionado(null);
          }
        }}
      />

      <UserStatusModal
        isOpen={openModalConfirm}
        onClose={() => { setOpenModalConfirm(false); setUsuarioAConfirmar(null); }}
        onConfirm={handleConfirmarEstatus}
        usuario={usuarioAConfirmar}
        isSubmitting={isConfirming}
      />

      <UserDetailModal
        isOpen={openModalDetalle}
        onClose={() => { setOpenModalDetalle(false); setUsuarioSeleccionado(null); }}
        usuario={usuarioSeleccionado}
      />
    </div>
  );
};