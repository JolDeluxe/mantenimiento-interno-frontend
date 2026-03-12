import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "@/components/ui/z_index";
import { Input, Label, Select } from "@/components/form/z_index";
import { usersApi } from "../api/users-api";

export const UserModal = ({ isOpen, onClose, onSuccess, usuarioAEditar, currentUser, departamentos }) => {
  // ... (Misma lógica de estado handleSubmit y useEffect que en el paso anterior)
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [usernameEdited, setUsernameEdited] = useState(false);

  const esSuperAdmin = currentUser?.rol === "SUPER_ADMIN";
  const esAdmin = currentUser?.rol === "ADMIN";
  const requiereDepartamento = rol !== "SUPER_ADMIN" && rol !== "INVITADO" && rol !== "";

  useEffect(() => {
    if (isOpen) {
      setBackendError("");
      if (usuarioAEditar) {
        setNombre(usuarioAEditar.nombre); setUsername(usuarioAEditar.username); setPassword(""); setRol(usuarioAEditar.rol);
        setDepartamentoId(usuarioAEditar.departamentoId ? String(usuarioAEditar.departamentoId) : ""); setUsernameEdited(true);
      } else {
        setNombre(""); setUsername(""); setPassword(""); setRol(""); setUsernameEdited(false);
        setDepartamentoId(esAdmin && currentUser?.departamentoId ? String(currentUser.departamentoId) : "");
      }
    }
  }, [isOpen, usuarioAEditar, currentUser, esAdmin]);

  const handleNombreChange = (e) => {
    const val = e.target.value; setNombre(val);
    if (!usuarioAEditar && !usernameEdited) {
      const parts = val.trim().split(/\s+/);
      const base = parts.length >= 2 ? parts[0] + parts[1] : parts[0];
      setUsername(base.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ""));
      setBackendError("");
    }
  };

  const rolesDisponibles = [ { value: "USUARIO", label: "Operativo" }, { value: "ENCARGADO", label: "Supervisión" } ];
  if (esSuperAdmin || usuarioAEditar?.rol === "ADMIN") rolesDisponibles.push({ value: "ADMIN", label: "Gestión" });
  if (esSuperAdmin || usuarioAEditar?.rol === "SUPER_ADMIN") rolesDisponibles.push({ value: "SUPER_ADMIN", label: "Super Admin" });
  if (esSuperAdmin || usuarioAEditar?.rol === "INVITADO") rolesDisponibles.push({ value: "INVITADO", label: "Invitado" });

  const handleSubmit = async () => {
    if (!nombre.trim() || !username.trim() || !rol || (requiereDepartamento && !departamentoId)) return toast.warning("Complete los campos obligatorios.");
    if (!usuarioAEditar && !password.trim()) return toast.warning("La contraseña es obligatoria.");

    setIsSubmitting(true);
    setBackendError("");

    try {
      const payload = { nombre, username, rol, departamentoId: requiereDepartamento && departamentoId ? Number(departamentoId) : null };
      if (password.trim()) payload.password = password;

      if (usuarioAEditar) {
        await usersApi.update(usuarioAEditar.id, payload);
        toast.success("Usuario actualizado");
      } else {
        await usersApi.create(payload);
        toast.success("Usuario creado");
      }
      onSuccess(); onClose();
    } catch (error) {
      const msg = error.response?.data?.error || "Error de servidor";
      if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("ya existe")) setBackendError(`Usuario "${username}" en uso.`);
      else toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()}>
      <ModalHeader title={usuarioAEditar ? "Editar Usuario" : "Nuevo Usuario"} onClose={() => !isSubmitting && onClose()} />
      <ModalBody>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nombre Completo</Label>
              <Input autoFocus value={nombre} onChange={handleNombreChange} placeholder="Ej. Juan Pérez" />
            </div>
            <div>
              <Label>Usuario (Login)</Label>
              <Input value={username} onChange={(e) => {setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "")); setUsernameEdited(true); setBackendError("");}} className="font-mono text-sm" />
              {backendError && <p className="text-estado-rechazado text-xs mt-1 font-bold">{backendError}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nivel de Acceso (Rol)</Label>
              <Select value={rol} onChange={(e) => setRol(e.target.value)}>
                <option value="" disabled>Seleccione...</option>
                {rolesDisponibles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
            </div>
            <div>
              <Label className={!requiereDepartamento ? 'opacity-50' : ''}>Departamento</Label>
              <Select value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)} disabled={!requiereDepartamento || esAdmin}>
                {esAdmin ? <option value={currentUser?.departamentoId}>{currentUser?.departamento?.nombre || "Mi Departamento"}</option> : <><option value="">Seleccione...</option>{departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}</>}
              </Select>
            </div>
          </div>
          <div>
            <Label>Contraseña {usuarioAEditar && <span className="font-normal text-slate-400">(Dejar en blanco para conservar)</span>}</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="••••••••" />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
        <Button variant="guardar" onClick={handleSubmit} isLoading={isSubmitting}>
          {usuarioAEditar ? "Guardar Cambios" : "Crear Usuario"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};