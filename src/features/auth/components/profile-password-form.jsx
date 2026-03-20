import React, { useState, useEffect } from 'react';
import { Input, Label } from '@/components/form/z_index';
import { Button, Icon } from '@/components/ui/z_index';

export const ProfilePasswordForm = ({
  onSave,
  onCancel,
  updating,
  error,
  clearError
}) => {
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (error?.message) {
      const msg = error.message.toLowerCase();
      if (msg.includes('contraseña actual')) {
        setFormErrors(prev => ({ ...prev, currentPassword: error.message }));
        if (clearError) clearError();
      }
    }
  }, [error, clearError]);

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Debes ingresar tu contraseña actual';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'La nueva contraseña es obligatoria';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Debe tener al menos 6 caracteres';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return errors;
  };

  const handleChange = (field, value) => {
    // Bloqueo de espacios físicos en las contraseñas
    const finalValue = value.replace(/\s/g, '');

    setPasswordData(prev => ({ ...prev, [field]: finalValue }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = () => {
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) return setFormErrors(errors);

    onSave({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const isSaveDisabled = updating || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword;

  return (
    <div className="space-y-6 max-w-full">
      {error && !formErrors.currentPassword && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <Icon name="error" className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-extrabold text-red-900 text-sm">No se pudo procesar la solicitud</h4>
            <p className="text-xs text-red-700 mt-1 font-medium">{error.message}</p>
            {clearError && (
              <button onClick={clearError} className="text-[10px] text-red-600 hover:text-red-800 mt-3 font-bold uppercase tracking-widest transition-colors">
                Descartar mensaje
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-8 py-6 md:px-12 md:py-8 text-sm text-amber-900 flex flex-col items-center justify-center text-center gap-4 mb-8 shadow-sm">
        <Icon name="gpp_maybe" size="lg" className="text-amber-600 shrink-0 scale-125" />
        <p className="leading-relaxed font-medium max-w-sm">
          Por protocolos de seguridad, requerimos tu contraseña actual para autorizar cualquier cambio de credenciales.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="currentPassword" error={!!formErrors.currentPassword}>Contraseña Actual</Label>
          <Input
            id="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => handleChange('currentPassword', e.target.value)}
            error={!!formErrors.currentPassword}
            helperText={formErrors.currentPassword}
            disabled={updating}
            placeholder="Ingresa tu contraseña vigente"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="newPassword" error={!!formErrors.newPassword}>Nueva Contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              error={!!formErrors.newPassword}
              helperText={formErrors.newPassword}
              disabled={updating}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword" error={!!formErrors.confirmPassword}>Confirmar Nueva Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={updating}
              placeholder="Repite tu nueva contraseña"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-gray-100">
        <Button
          onClick={onCancel}
          variant="cancelar"
          size="sm"
          disabled={updating}
        >
          Cancelar
        </Button>

        <Button
          onClick={handleSubmit}
          variant="guardar"
          size="sm"
          icon="save"
          iconSize="md"
          isLoading={updating}
          disabled={isSaveDisabled}
        >
          Actualizar
        </Button>
      </div>
    </div>
  );
};