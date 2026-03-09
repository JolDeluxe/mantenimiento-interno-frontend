import React, { useState, useEffect } from 'react';
import { Input, Label } from '@/components/form/z_index';
import { Button, Icon, Spinner } from '@/components/ui/z_index';

export const ProfileEditForm = ({
  profile,
  onSave,
  onCancel,
  updating,
  error,
  clearError,
  mode = 'general' 
}) => {
  const [formData, setFormData] = useState({ nombre: '', username: '', email: '', telefono: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        username: profile.username || '',
        email: profile.email || '',
        telefono: profile.telefono || ''
      });
    }
  }, [profile]);

  const validateForm = () => {
    const errors = {};
    if (!formData.nombre?.trim()) errors.nombre = 'El nombre es requerido';
    if (!formData.username?.trim()) errors.username = 'El nombre de usuario es requerido';
    if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email inválido';
    return errors;
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Requerido';
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) errors.newPassword = 'Mínimo 6 caracteres';
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';
    return errors;
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = () => {
    if (mode === 'general') {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) return setFormErrors(errors);
      onSave(formData);
    } else {
      const errors = validatePassword();
      if (Object.keys(errors).length > 0) return setFormErrors(errors);
      onSave({ changePassword: true, ...passwordData });
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <Icon name="error" className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-red-900 text-sm">Error</h4>
            <p className="text-xs text-red-700 mt-1">{error.message}</p>
            {clearError && (
              <button onClick={clearError} className="text-xs text-red-600 hover:text-red-800 mt-2 font-bold uppercase">
                Descartar
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-5">
        {mode === 'general' ? (
          <>
            <div>
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input id="nombre" value={formData.nombre} onChange={(e) => handleFormChange('nombre', e.target.value)} error={formErrors.nombre} disabled={updating} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="username">Usuario</Label>
                <Input id="username" value={formData.username} onChange={(e) => handleFormChange('username', e.target.value)} error={formErrors.username} disabled={updating} />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" value={formData.telefono} onChange={(e) => handleFormChange('telefono', e.target.value)} disabled={updating} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)} error={formErrors.email} disabled={updating} />
            </div>
          </>
        ) : (
          <>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800 flex items-center gap-3 font-medium mb-6">
              <Icon name="warning" size="md" className="text-yellow-600" /> 
              Por seguridad, se requiere tu contraseña actual para confirmar el cambio.
            </div>
            <div>
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={(e) => handlePasswordChange('currentPassword', e.target.value)} error={formErrors.currentPassword} disabled={updating} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => handlePasswordChange('newPassword', e.target.value)} error={formErrors.newPassword} disabled={updating} />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)} error={formErrors.confirmPassword} disabled={updating} />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
        <Button onClick={onCancel} variant="outline" disabled={updating} className="px-6">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={updating} className="bg-marca-primario text-white px-8">
          {updating ? <><Spinner size="sm" className="mr-2" /> Guardando...</> : <><Icon name="save" size="sm" className="mr-2" /> Guardar Cambios</>}
        </Button>
      </div>
    </div>
  );
};