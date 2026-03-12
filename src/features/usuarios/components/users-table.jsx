import { useState } from "react";
import { toast } from "react-toastify";
import { Icon } from "@/components/ui/z_index";
import { UserStatusBadge } from "./user-status-badge";
import { UserModal } from "./user-modal";
import { UserStatusModal } from "./user-status-modal";
import { usersApi } from "../api/users-api";

export const UsersTable = ({ usuarios, loading, onRecargar, currentUser, departamentos, page, totalPages, onPageChange, sortConfig, onSortChange }) => {
  const [openModalEditar, setOpenModalEditar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [usuarioAConfirmar, setUsuarioAConfirmar] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    onSortChange(key, direction);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <Icon name="swap_vert" className="text-slate-300 text-sm ml-1" />;
    return <Icon name={sortConfig.direction === "asc" ? "arrow_upward" : "arrow_downward"} className="text-marca-primario text-sm ml-1" />;
  };

  const handleConfirmarEstatus = async () => {
    if (!usuarioAConfirmar) return;
    setIsConfirming(true);
    const nuevoEstatus = usuarioAConfirmar.estatus === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    try {
      await usersApi.updateStatus(usuarioAConfirmar.id, nuevoEstatus);
      toast.success(`Estatus actualizado exitosamente.`);
      onRecargar();
      setOpenModalConfirm(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Error al procesar la solicitud.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500 animate-pulse">Cargando terminal de usuarios...</div>;
  }

  const realTotalPages = usuarios.length < 10 ? page : totalPages;

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden lg:block border border-slate-300 rounded-radius-cuadra overflow-hidden bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-300 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort("nombre")}>
                <div className="flex items-center">Nombre {getSortIcon("nombre")}</div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort("username")}>
                <div className="flex items-center">Username {getSortIcon("username")}</div>
              </th>
              <th className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort("rolJerarquia")}>
                <div className="flex items-center justify-center">Rol {getSortIcon("rolJerarquia")}</div>
              </th>
              <th className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort("estatus")}>
                <div className="flex items-center justify-center">Estatus {getSortIcon("estatus")}</div>
              </th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {usuarios.map(row => {
              const puedeEditar = currentUser?.rol === "SUPER_ADMIN" || currentUser?.id === row.id || (currentUser?.rol === "ADMIN" && row.rol !== "ADMIN");
              return (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.nombre}</td>
                  <td className="px-4 py-3 font-mono text-slate-500 text-xs">@{row.username}</td>
                  <td className="px-4 py-3 text-center text-xs font-semibold text-marca-secundario">{row.rol}</td>
                  <td className="px-4 py-3 text-center"><UserStatusBadge estatus={row.estatus} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {puedeEditar ? (
                        <button onClick={() => { setUsuarioSeleccionado(row); setOpenModalEditar(true); }} className="p-1.5 text-marca-primario hover:bg-marca-primario/10 rounded-md transition-colors cursor-pointer">
                          <Icon name="edit" />
                        </button>
                      ) : <Icon name="lock" className="p-1.5 text-slate-300" />}
                      
                      {currentUser?.id !== row.id && puedeEditar && (
                        <button onClick={() => { setUsuarioAConfirmar(row); setOpenModalConfirm(true); }} className={`p-1.5 rounded-md transition-colors cursor-pointer ${row.estatus === "ACTIVO" ? "text-estado-rechazado hover:bg-estado-rechazado/10" : "text-estado-resuelto hover:bg-estado-resuelto/10"}`}>
                          <Icon name={row.estatus === "ACTIVO" ? "person_remove" : "person_add"} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="grid lg:hidden grid-cols-1 md:grid-cols-2 gap-3 p-2">
        {usuarios.map((row) => {
          const puedeEditar = currentUser?.rol === "SUPER_ADMIN" || currentUser?.id === row.id || (currentUser?.rol === "ADMIN" && row.rol !== "ADMIN");
          return (
             <div key={row.id} className="border border-slate-300 shadow-sm p-4 rounded-md bg-white">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-800 text-base leading-snug">{row.nombre}</h3>
                  <UserStatusBadge estatus={row.estatus} />
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p><span className="font-semibold text-slate-700">Usuario:</span> <span className="font-mono text-slate-800">@{row.username}</span></p>
                  <p><span className="font-semibold text-slate-700">Rol:</span> <span className="font-semibold text-marca-secundario">{row.rol}</span></p>
                </div>
                <div className="flex justify-around items-center mt-4 pt-2 border-t border-slate-200">
                   {puedeEditar ? (
                      <button onClick={() => { setUsuarioSeleccionado(row); setOpenModalEditar(true); }} className="flex flex-col items-center text-marca-primario hover:text-marca-primario-hover transition cursor-pointer">
                        <Icon name="edit" />
                        <span className="text-[11px] font-semibold mt-1">Editar</span>
                      </button>
                   ) : (
                      <div className="flex flex-col items-center text-slate-300">
                        <Icon name="lock" />
                        <span className="text-[11px] font-semibold mt-1">Bloqueado</span>
                      </div>
                   )}
                   {currentUser?.id !== row.id && puedeEditar && (
                      <button onClick={() => { setUsuarioAConfirmar(row); setOpenModalConfirm(true); }} className={`flex flex-col items-center transition cursor-pointer ${row.estatus === "ACTIVO" ? "text-estado-rechazado" : "text-estado-resuelto"}`}>
                        <Icon name={row.estatus === "ACTIVO" ? "person_remove" : "person_add"} />
                        <span className="text-[11px] font-semibold mt-1">{row.estatus === "ACTIVO" ? "Desactivar" : "Reactivar"}</span>
                      </button>
                   )}
                </div>
             </div>
          );
        })}
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center bg-slate-50 border border-slate-300 lg:border-t-0 p-3 rounded-b-radius-cuadra mt-3 lg:mt-0">
        <span className="text-xs text-slate-600 font-medium">Página {page} de {realTotalPages} | {usuarios.length} registros</span>
        <div className="flex gap-2">
          <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="px-3 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-slate-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Anterior</button>
          <button onClick={() => onPageChange(page + 1)} disabled={page >= realTotalPages} className="px-3 py-1 bg-marca-primario text-white border border-transparent rounded text-xs hover:bg-marca-primario-hover disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Siguiente</button>
        </div>
      </div>

      <UserModal isOpen={openModalEditar} onClose={() => setOpenModalEditar(false)} onSuccess={onRecargar} usuarioAEditar={usuarioSeleccionado} currentUser={currentUser} departamentos={departamentos} />
      <UserStatusModal isOpen={openModalConfirm} onClose={() => setOpenModalConfirm(false)} onConfirm={handleConfirmarEstatus} usuario={usuarioAConfirmar} isSubmitting={isConfirming} />
    </div>
  );
};