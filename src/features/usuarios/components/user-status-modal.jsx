import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from "@/components/ui/z_index";

export const UserStatusModal = ({ isOpen, onClose, onConfirm, usuario, isSubmitting }) => {
  if (!usuario) return null;
  const esActivo = usuario.estatus === "ACTIVO";

  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()}>
      <ModalHeader 
        title={esActivo ? "Confirmar desactivación" : "Confirmar reactivación"} 
        onClose={() => !isSubmitting && onClose()} 
      />
      <ModalBody>
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
          <Icon 
            name={esActivo ? "warning" : "check_circle"} 
            size="64px"
            className={esActivo ? "text-estado-rechazado" : "text-estado-resuelto"} 
          />
          <div className="text-slate-700">
            <p>¿Seguro que deseas <strong>{esActivo ? "ELIMINAR" : "REACTIVAR"}</strong> al usuario?</p>
            <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 mt-3">
              <span className="block font-bold text-slate-900 text-lg">{usuario.nombre}</span>
              <span className="block text-sm text-slate-500 font-mono">@{usuario.username}</span>
            </div>
            {esActivo && (
              <p className="text-xs text-estado-rechazado font-bold mt-4 bg-red-50 p-2 rounded-sm border border-red-100">
                ⚠️ Perderá acceso inmediato al sistema corporativo.
              </p>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
        <Button 
          variant={esActivo ? "borrar" : "guardar"} 
          onClick={onConfirm} 
          isLoading={isSubmitting}
        >
          {esActivo ? "Sí, Desactivar" : "Sí, Reactivar"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};