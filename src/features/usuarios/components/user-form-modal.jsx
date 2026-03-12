// src/features/usuarios/components/user-form-modal.jsx
import { useState, useEffect } from 'react';
import { Input, Label, Select } from '@/components/form/z_index';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Icon } from '@/components/ui/z_index';

// ─── Roles reales del enum Prisma ─────────────────────────────────────────────
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

    const [nombre, setNombre] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('');
    const [departamentoId, setDepartamentoId] = useState('');
    const [usernameEdited, setUsernameEdited] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [backendError, setBackendError] = useState('');

    // ── Reset al abrir ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        setSubmitted(false);
        setBackendError('');

        if (esEdicion) {
            setNombre(usuarioAEditar.nombre);
            setUsername(usuarioAEditar.username);
            setPassword('');
            setRol(usuarioAEditar.rol);
            setDepartamentoId(
                usuarioAEditar.departamentoId ? String(usuarioAEditar.departamentoId) : ''
            );
            setUsernameEdited(true);
        } else {
            setNombre('');
            setUsername('');
            setPassword('');
            setRol('');
            setUsernameEdited(false);
            setDepartamentoId(
                esJefe && currentUser?.departamentoId
                    ? String(currentUser.departamentoId)
                    : ''
            );
        }
    }, [isOpen, esEdicion, usuarioAEditar, esJefe, currentUser]);

    // ── Roles disponibles según jerarquía ─────────────────────────────────────
    const rolesDisponibles = [
        { value: 'TECNICO', label: ROL_MAP.TECNICO, visible: true },
        { value: 'COORDINADOR_MTTO', label: ROL_MAP.COORDINADOR_MTTO, visible: true },
        { value: 'JEFE_MTTO', label: ROL_MAP.JEFE_MTTO, visible: esSuperAdmin || usuarioAEditar?.rol === 'JEFE_MTTO' },
        { value: 'CLIENTE_INTERNO', label: ROL_MAP.CLIENTE_INTERNO, visible: esSuperAdmin || usuarioAEditar?.rol === 'CLIENTE_INTERNO' },
        { value: 'SUPER_ADMIN', label: ROL_MAP.SUPER_ADMIN, visible: esSuperAdmin || usuarioAEditar?.rol === 'SUPER_ADMIN' },
    ].filter((r) => r.visible);

    // ── Lógica departamento ────────────────────────────────────────────────────
    const requiereDepartamento = rol !== 'SUPER_ADMIN' && rol !== '';
    const departamentoDisabled = esJefe; // El jefe solo puede asignar su propio depto

    // ── Auto-username ─────────────────────────────────────────────────────────
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

    const handleUsernameChange = (e) => {
        setUsername(sanitizeUsername(e.target.value));
        setUsernameEdited(true);
        setBackendError('');
    };

    // ── Validación frontend (mínima, el backend es la verdad) ─────────────────
    const getFormErrors = () => {
        const e = {};
        if (!nombre.trim()) e.nombre = 'El nombre es obligatorio.';
        if (!username.trim()) e.username = 'El usuario es obligatorio.';
        if (!esEdicion && !password.trim()) e.password = 'La contraseña es obligatoria.';
        if (!rol) e.rol = 'Selecciona un rol.';
        if (requiereDepartamento && !departamentoId) e.dept = 'El departamento es obligatorio para este rol.';
        return e;
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setBackendError('');
        const errors = getFormErrors();
        if (Object.keys(errors).length > 0) return;

        const payload = {
            nombre,
            username,
            rol,
            departamentoId: requiereDepartamento && departamentoId ? Number(departamentoId) : null,
        };
        if (password.trim()) payload.password = password;

        try {
            await onSuccess(payload);
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                'Error al procesar la solicitud.';
            const lc = msg.toLowerCase();
            if (lc.includes('unique') || lc.includes('ya existe') || lc.includes('duplicado')) {
                setBackendError(`El usuario "${username}" ya está en uso.`);
            } else {
                throw err;
            }
        }
    };

    const fe = submitted ? getFormErrors() : {};

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalHeader onClose={onClose}>
                {esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
            </ModalHeader>

            <ModalBody>
                <div className="space-y-5">
                    {/* ── Identidad ────────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="u-nombre" error={!!fe.nombre}>Nombre Completo</Label>
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
                                placeholder="Nombre completo"
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="u-username" error={!!fe.username || !!backendError}>
                                Usuario (Login)
                            </Label>
                            <Input
                                id="u-username"
                                value={username}
                                onChange={handleUsernameChange}
                                error={!!fe.username || !!backendError}
                                helperText={fe.username || backendError}
                                placeholder="usuario"
                                autoComplete="off"
                                className="font-codigo"
                            />
                            {!fe.username && !backendError && (
                                <p className="text-[10px] text-amber-600 flex items-center gap-1 font-medium">
                                    <Icon name="info" size="xs" /> Necesario para iniciar sesión.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ── Acceso y Ubicación ───────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="u-rol" error={!!fe.rol}>Nivel de Acceso (Rol)</Label>
                            <Select
                                id="u-rol"
                                value={rol}
                                onChange={(e) => setRol(e.target.value)}
                                error={!!fe.rol}
                                helperText={fe.rol}
                            >
                                <option value="" disabled>Selecciona un rol…</option>
                                {rolesDisponibles.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label
                                htmlFor="u-dept"
                                error={!!fe.dept}
                                className={!requiereDepartamento ? 'opacity-40' : ''}
                            >
                                Departamento
                            </Label>
                            <Select
                                id="u-dept"
                                value={departamentoId}
                                onChange={(e) => setDepartamentoId(e.target.value)}
                                disabled={!requiereDepartamento || departamentoDisabled}
                                error={!!fe.dept}
                                helperText={fe.dept}
                            >
                                {esJefe ? (
                                    <option value={currentUser?.departamentoId ?? ''}>
                                        {currentUser?.departamento?.nombre ?? 'Mi Departamento'}
                                    </option>
                                ) : (
                                    <>
                                        <option value="">Selecciona…</option>
                                        {departamentos.map((d) => (
                                            <option key={d.id} value={d.id}>{d.nombre}</option>
                                        ))}
                                    </>
                                )}
                            </Select>
                            {esJefe && (
                                <p className="text-[10px] text-slate-400 font-medium">
                                    Solo puedes asignar usuarios a tu departamento.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ── Contraseña ───────────────────────────────────────────── */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="u-pass" error={!!fe.password}>
                            Contraseña{' '}
                            {esEdicion && (
                                <span className="font-normal text-slate-400 normal-case text-[11px]">
                                    (dejar vacío para mantener actual)
                                </span>
                            )}
                        </Label>
                        <Input
                            id="u-pass"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={!!fe.password}
                            helperText={fe.password}
                            placeholder={esEdicion ? '••••••••' : 'Contraseña segura'}
                            autoComplete="new-password"
                        />
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
                    disabled={submitting}
                >
                    {esEdicion ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};