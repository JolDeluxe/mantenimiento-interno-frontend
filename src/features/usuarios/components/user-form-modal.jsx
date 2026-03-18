// src/features/usuarios/components/user-form-modal.jsx

import { useState, useEffect, useRef } from 'react';
import { Input, Label, Select } from '@/components/form/z_index';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Icon } from '@/components/ui/z_index';

const ROL_MAP = {
    TECNICO: 'Técnico',
    COORDINADOR_MTTO: 'Coordinador Mtto',
    JEFE_MTTO: 'Jefe Mtto',
    CLIENTE_INTERNO: 'Cliente Interno',
    SUPER_ADMIN: 'Super Admin',
};

const sanitizeUsername = (text) =>
    text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');

const MAX_NOMBRE = 60;

export const UserFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    usuarioAEditar,
    currentUser,
    departamentos,
    submitting,
}) => {
    const esEdicion = Boolean(usuarioAEditar);
    const esSuperAdmin = currentUser?.rol === 'SUPER_ADMIN';
    const esJefe = currentUser?.rol === 'JEFE_MTTO';
    const fileInputRef = useRef(null);

    const [nombre, setNombre] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('');
    const [cargo, setCargo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [departamentoId, setDepartamentoId] = useState('');
    const [imagenPreview, setImagenPreview] = useState(null);
    const [imagenFile, setImagenFile] = useState(undefined);
    const [usernameEdited, setUsernameEdited] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [backendError, setBackendError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setSubmitted(false);
        setBackendError('');

        if (esEdicion) {
            setNombre(usuarioAEditar.nombre || '');
            setUsername(usuarioAEditar.username || '');
            setEmail(usuarioAEditar.email || '');
            setPassword('');
            setRol(usuarioAEditar.rol || '');
            setCargo(usuarioAEditar.cargo || '');
            setTelefono(usuarioAEditar.telefono || '');
            setDepartamentoId(usuarioAEditar.departamentoId ? String(usuarioAEditar.departamentoId) : '');
            setImagenPreview(usuarioAEditar.imagen || null);
            setImagenFile(undefined);
            setUsernameEdited(true);
        } else {
            setNombre('');
            setUsername('');
            setEmail('');
            setPassword('');
            setRol('');
            setCargo('');
            setTelefono('');
            setImagenPreview(null);
            setImagenFile(undefined);
            setUsernameEdited(false);
            setDepartamentoId('');
        }
    }, [isOpen, esEdicion, usuarioAEditar]);

    // ── [CAMBIO] Limpiar departamento si el rol cambia a uno no-CLIENTE_INTERNO
    // en modo edición, para no enviar datos obsoletos al backend.
    const handleRolChange = (e) => {
        const nuevoRol = e.target.value;
        setRol(nuevoRol);
        if (esEdicion && nuevoRol !== 'CLIENTE_INTERNO') {
            setDepartamentoId('');
        }
    };

    const rolesDisponibles = [
        { value: 'TECNICO', label: ROL_MAP.TECNICO, visible: true },
        { value: 'COORDINADOR_MTTO', label: ROL_MAP.COORDINADOR_MTTO, visible: true },
        { value: 'JEFE_MTTO', label: ROL_MAP.JEFE_MTTO, visible: esSuperAdmin || usuarioAEditar?.rol === 'JEFE_MTTO' },
        { value: 'CLIENTE_INTERNO', label: ROL_MAP.CLIENTE_INTERNO, visible: esSuperAdmin || usuarioAEditar?.rol === 'CLIENTE_INTERNO' },
        { value: 'SUPER_ADMIN', label: ROL_MAP.SUPER_ADMIN, visible: esSuperAdmin || usuarioAEditar?.rol === 'SUPER_ADMIN' },
    ].filter((r) => r.visible);

    const requiereEmail = rol && rol !== 'TECNICO';

    // ── [CAMBIO] Dos conceptos separados:
    // requiereDepartamento → la validación obliga a seleccionar uno
    // departamentoEditable → el select está habilitado para interacción
    //
    // En creación (SUPER_ADMIN): el campo está habilitado para todos los roles
    // que no sean SUPER_ADMIN, porque el admin asigna el depto en ese momento.
    //
    // En edición: el campo solo es editable si el rol es CLIENTE_INTERNO.
    // Para roles de Mantenimiento el depto es fijo y el backend lo rechaza.
    const requiereDepartamento = rol === 'CLIENTE_INTERNO';
    const departamentoEditable = esEdicion
        ? rol === 'CLIENTE_INTERNO'
        : rol !== '' && rol !== 'SUPER_ADMIN';

    const handleNombreChange = (e) => {
        const val = e.target.value;
        if (val.length > MAX_NOMBRE) return;
        setNombre(val);
        if (!esEdicion && !usernameEdited) {
            const parts = val.trim().split(/\s+/);
            const base = parts.length >= 2 ? parts[0] + parts[1] : parts[0] ?? '';
            setUsername(sanitizeUsername(base));
            setBackendError('');
        }
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagenFile(file);
            setImagenPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveFoto = () => {
        setImagenFile(null);
        setImagenPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getFormErrors = () => {
        const e = {};
        if (!nombre.trim()) e.nombre = 'El nombre es obligatorio.';
        if (!esEdicion && !password.trim()) e.password = 'Contraseña obligatoria (Mínimo 6 chars).';
        if (password && password.length < 6) e.password = 'Mínimo 6 caracteres.';
        if (!rol) e.rol = 'Selecciona un rol.';

        if (requiereEmail) {
            if (!email.trim()) {
                e.email = 'El correo es obligatorio para este rol.';
            } else if (!email.endsWith('@cuadra.com.mx')) {
                e.email = 'Solo corporativos (@cuadra.com.mx).';
            }
        }

        // ── [CAMBIO] Solo se valida departamento si el rol es CLIENTE_INTERNO
        if (esSuperAdmin && requiereDepartamento && !departamentoId) {
            e.departamento = 'Selecciona un departamento.';
        }

        return e;
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setBackendError('');

        const errors = getFormErrors();
        if (Object.keys(errors).length > 0) return;

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('rol', rol);

        if (username) formData.append('username', username);
        if (email) formData.append('email', email);
        if (password) formData.append('password', password);
        if (cargo) formData.append('cargo', cargo);
        if (telefono) formData.append('telefono', telefono);

        // ── [CAMBIO] departamentoId solo viaja al backend cuando:
        // - JEFE crea usuario (usa su propio dept)
        // - El rol es CLIENTE_INTERNO (único rol con dept variable)
        // Para roles de Mantenimiento en creación por SUPER_ADMIN,
        // el SUPER_ADMIN puede asignar el depto directamente.
        if (!esEdicion && esJefe && currentUser?.departamentoId) {
            formData.append('departamentoId', currentUser.departamentoId);
        } else if (departamentoId && (requiereDepartamento || (!esEdicion && departamentoEditable))) {
            formData.append('departamentoId', departamentoId);
        }

        if (imagenFile) {
            formData.append('imagen', imagenFile, imagenFile.name);
        } else if (imagenFile === null && esEdicion) {
            formData.append('imagen', 'null');
        }

        try {
            await onSuccess(formData);
        } catch (err) {
            const data = err?.response?.data;
            let msg = data?.error || data?.message || 'Error al procesar la solicitud.';
            if (data?.errors && Array.isArray(data.errors)) {
                msg = data.errors[0].message;
            }
            const lc = msg.toLowerCase();
            if (lc.includes('username') && (lc.includes('existe') || lc.includes('uso'))) {
                setBackendError(`El usuario "${username}" ya está en uso.`);
            } else {
                setBackendError(msg);
            }
        }
    };

    const fe = submitted ? getFormErrors() : {};

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalHeader title={esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={onClose} />

            <ModalBody>
                <div className="space-y-6">

                    {backendError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-semibold flex items-center gap-2">
                            <Icon name="error" /> {backendError}
                        </div>
                    )}

                    {/* ── FOTO Y NOMBRE ── */}
                    <div className="flex flex-col md:flex-row gap-5 items-start">
                        <div className="flex flex-col items-center gap-2 shrink-0 w-full md:w-auto">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFotoChange}
                            />
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer group shadow-sm hover:border-marca-primario transition-colors"
                            >
                                {imagenPreview ? (
                                    <img src={imagenPreview} className="w-full h-full object-cover" alt="Perfil" />
                                ) : (
                                    <Icon name="add_a_photo" className="text-slate-400 text-3xl group-hover:text-marca-primario" />
                                )}
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold">
                                    <Icon name="upload" className="text-xl mb-1" />
                                    Subir
                                </div>
                            </div>
                            {imagenPreview && (
                                <button onClick={handleRemoveFoto} className="text-xs text-rose-600 hover:text-rose-800 font-bold">
                                    Quitar Foto
                                </button>
                            )}
                        </div>

                        <div className="flex-1 w-full space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="u-nombre" error={!!fe.nombre}>Nombre Completo *</Label>
                                    <span className={`text-[10px] font-bold ${nombre.length >= MAX_NOMBRE ? 'text-estado-rechazado' : 'text-slate-400'}`}>
                                        {nombre.length}/{MAX_NOMBRE}
                                    </span>
                                </div>
                                <Input
                                    id="u-nombre"
                                    value={nombre}
                                    onChange={handleNombreChange}
                                    error={!!fe.nombre}
                                    helperText={fe.nombre}
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="u-username">Usuario (Opcional)</Label>
                                <Input
                                    id="u-username"
                                    value={username}
                                    onChange={(e) => { setUsername(sanitizeUsername(e.target.value)); setUsernameEdited(true); }}
                                    placeholder="Autogenerado si se deja en blanco"
                                    className="font-codigo"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── ROL Y DEPARTAMENTO ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="u-rol" error={!!fe.rol}>Nivel de Acceso (Rol) *</Label>
                            {/* ── [CAMBIO] handleRolChange en lugar de setter directo */}
                            <Select
                                id="u-rol"
                                value={rol}
                                onChange={handleRolChange}
                                error={!!fe.rol}
                                helperText={fe.rol}
                            >
                                <option value="" disabled>Selecciona un rol…</option>
                                {rolesDisponibles.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </Select>
                        </div>

                        {esSuperAdmin && (
                            <div className="flex flex-col gap-1.5">
                                {/* ── [CAMBIO] Label y hint dinámicos según departamentoEditable */}
                                <Label
                                    htmlFor="u-dept"
                                    error={!!fe.departamento}
                                    className={!departamentoEditable ? 'opacity-40' : ''}
                                >
                                    Departamento{requiereDepartamento ? ' *' : ''}
                                    {esEdicion && !departamentoEditable && (
                                        <span className="ml-1 text-[10px] font-normal text-slate-400 normal-case">
                                            (fijo para este rol)
                                        </span>
                                    )}
                                </Label>
                                {/* ── [CAMBIO] disabled usa departamentoEditable */}
                                <Select
                                    id="u-dept"
                                    value={departamentoId}
                                    onChange={(e) => setDepartamentoId(e.target.value)}
                                    disabled={!departamentoEditable}
                                    error={!!fe.departamento}
                                    helperText={fe.departamento}
                                >
                                    <option value="">Selecciona…</option>
                                    {departamentos.map((d) => (
                                        <option key={d.id} value={d.id}>{d.nombre}</option>
                                    ))}
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* ── CONTACTO ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="u-email" error={!!fe.email}>
                                Correo Electrónico {requiereEmail && '*'}
                            </Label>
                            <Input
                                id="u-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                                error={!!fe.email}
                                helperText={fe.email || (requiereEmail ? 'Requerido para administradores' : 'Opcional para Técnicos')}
                                placeholder="usuario@cuadra.com.mx"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="u-telefono">Teléfono (Opcional)</Label>
                            <Input
                                id="u-telefono"
                                type="tel"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="Ej. 4771234567"
                                maxLength={10}
                            />
                        </div>
                    </div>

                    {/* ── SEGURIDAD Y CARGO ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="u-cargo">Puesto / Cargo (Opcional)</Label>
                            <Input
                                id="u-cargo"
                                value={cargo}
                                onChange={(e) => setCargo(e.target.value)}
                                placeholder="Ej. Eléctrico Industrial"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="u-pass" error={!!fe.password}>
                                Contraseña {esEdicion ? <span className="font-normal text-slate-400 normal-case text-[10px]">(Dejar vacío para conservar)</span> : '*'}
                            </Label>
                            <Input
                                id="u-pass"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={!!fe.password}
                                helperText={fe.password}
                                placeholder={esEdicion ? '••••••••' : 'Mínimo 6 caracteres'}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={submitting}>
                    Cancelar
                </Button>
                <Button
                    variant="guardar"
                    icon="save"
                    onClick={handleSubmit}
                    isLoading={submitting}
                >
                    {esEdicion ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};