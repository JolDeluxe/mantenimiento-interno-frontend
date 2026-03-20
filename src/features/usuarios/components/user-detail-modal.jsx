import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from "@/components/ui/z_index";
import { UserStatusBadge } from "./user-status-badge";

// Componente auxiliar para renderizar cada fila de datos de forma uniforme
const DataRow = ({ icon, label, value, fallback = "No registrado" }) => (
    <div className="flex gap-3 items-start">
        <div className="mt-0.5 text-slate-400">
            <Icon name={icon} size="sm" />
        </div>
        <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="text-sm font-medium text-slate-800 mt-0.5">
                {value || <span className="text-slate-400 italic font-normal">{fallback}</span>}
            </span>
        </div>
    </div>
);

export const UserDetailModal = ({ isOpen, onClose, usuario }) => {
    if (!usuario) return null;

    const inicial = usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : "?";

    const formatFecha = (isoString) => {
        if (!isoString) return null;
        return new Date(isoString).toLocaleDateString("es-MX", {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
            <ModalHeader title="Detalles del Perfil" onClose={onClose} />
            <ModalBody>
                {/* ── Tarjeta de Identidad Principal ── */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                    {usuario.imagen ? (
                        <img
                            src={usuario.imagen}
                            alt={`Avatar de ${usuario.nombre}`}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md shrink-0"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-marca-primario/10 flex items-center justify-center text-marca-primario text-4xl font-black border-4 border-white shadow-md shrink-0">
                            {inicial}
                        </div>
                    )}

                    <div className="flex flex-col items-center sm:items-start flex-1 text-center sm:text-left">
                        <h3 className="text-2xl font-extrabold text-slate-900 leading-tight">
                            {usuario.nombre}
                        </h3>
                        <p className="text-slate-500 font-mono text-sm mt-1">{usuario.username}</p>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                            <span className="px-2.5 py-1 text-xs font-bold bg-slate-200 text-slate-700 rounded-md border border-slate-300 uppercase tracking-wide">
                                {usuario.rol.replace(/_/g, ' ')}
                            </span>
                            <UserStatusBadge estatus={usuario.estado || usuario.estatus} />
                        </div>
                    </div>
                </div>

                {/* ── Cuadrícula de Información Detallada ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">

                    {/* Columna Izquierda: Contacto y Personal */}
                    <div className="space-y-5">
                        <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                            <Icon name="contact_mail" size="sm" className="text-marca-primario" />
                            Información de Contacto
                        </h4>
                        <DataRow icon="mail" label="Correo Corporativo" value={usuario.email} />
                        <DataRow icon="call" label="Teléfono / Extensión" value={usuario.telefono} />
                        <DataRow icon="work" label="Cargo Oficial" value={usuario.cargo} />
                    </div>

                    {/* Columna Derecha: Área de Trabajo y Sistema */}
                    <div className="space-y-5">
                        <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                            <Icon name="domain" size="sm" className="text-marca-primario" />
                            Ubicación
                        </h4>
                        <DataRow
                            icon="business"
                            label="Departamento"
                            value={usuario.departamento?.nombre}
                            fallback="Sin departamento asignado"
                        />
                        {usuario.departamento && (
                            <div className="pl-9 space-y-3">
                                <DataRow icon="factory" label="Planta" value={usuario.departamento.planta} />
                                <DataRow icon="category" label="Tipo de Área" value={usuario.departamento.tipo} />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Metadatos del Sistema ── */}
                {/* <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] font-mono text-slate-400 px-2">
                    <span>Creado: {formatFecha(usuario.createdAt) || "Fecha desconocida"}</span>
                    <span>Actualizado: {formatFecha(usuario.updatedAt) || "Fecha desconocida"}</span>
                </div> */}
            </ModalBody>
            <ModalFooter>
                {/* <Button
                    variant="cancelar"
                    onClick={onClose}
                    icon="close"
                >
                    Cerrar
                </Button> */}
            </ModalFooter>
        </Modal>
    );
};