import { TableActions } from "@/components/ui/z_index";

export const UserActions = ({
    usuario,
    currentUser,
    onViewDetail,
    onEdit,
    onToggleStatus
}) => {
    const esMismoUsuario = currentUser?.id === usuario.id;
    const esSuperAdmin = currentUser?.rol === "SUPER_ADMIN";
    const esJefeMtto = currentUser?.rol === "JEFE_MTTO";

    // Casteo estricto a Number para evitar falsos negativos lógicos
    const currentDeptoId = currentUser?.departamentoId ? Number(currentUser.departamentoId) : null;

    // Ahora leemos con seguridad el departamentoId que inyectaste en el backend
    const objetivoDeptoId = usuario.departamentoId
        ? Number(usuario.departamentoId)
        : (usuario.departamento?.id ? Number(usuario.departamento.id) : null);

    const mismoDepartamento = currentDeptoId !== null && currentDeptoId === objetivoDeptoId;
    const objetivoAltaJerarquia = usuario.rol === "SUPER_ADMIN" || usuario.rol === "JEFE_MTTO";

    const puedeEditar = esSuperAdmin || esMismoUsuario || (esJefeMtto && mismoDepartamento && !objetivoAltaJerarquia);
    const puedeToggle = (esSuperAdmin || (esJefeMtto && mismoDepartamento && !objetivoAltaJerarquia)) && !esMismoUsuario;

    const estadoActual = usuario.estado || usuario.estatus;

    return (
        <TableActions
            row={usuario}
            actions={[
                {
                    key: "ver_detalle",
                    enabled: true,
                    onClick: onViewDetail,
                },
                {
                    key: "editar",
                    enabled: puedeEditar,
                    onClick: onEdit,
                },
                {
                    key: "toggle_estatus_desactivar",
                    enabled: puedeToggle,
                    hidden: estadoActual !== "ACTIVO",
                    onClick: onToggleStatus,
                },
                {
                    key: "toggle_estatus_activar",
                    enabled: puedeToggle,
                    hidden: estadoActual === "ACTIVO",
                    onClick: onToggleStatus,
                },
            ]}
        />
    );
};