import React, { useState, useEffect } from 'react';
import { Input, Label } from '@/components/form/z_index';
import { Button, Icon } from '@/components/ui/z_index';

export const ProfileGeneralForm = ({
  profile,
  onSave,
  onCancel,
  updating,
  error,
  clearError
}) => {
  const [formData, setFormData] = useState({ nombre: '', username: '', email: '', telefono: '' });
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
    if (!formData.nombre?.trim()) errors.nombre = 'El nombre completo es obligatorio';
    
    if (!formData.username?.trim()) {
      errors.username = 'El usuario es obligatorio';
    } else if (/\s/.test(formData.username)) {
      errors.username = 'El usuario no puede contener espacios';
    }

    if (!formData.email?.trim()) {
      errors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Formato de correo inválido';
    }

    if (formData.telefono && formData.telefono.trim() !== '') {
      const digitos = formData.telefono.replace(/\D/g, '');
      if (digitos.length < 10) {
        errors.telefono = 'Debe contener al menos 10 dígitos';
      }
    }

    return errors;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return setFormErrors(errors);
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      {error && (
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

      <div className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nombre" error={!!formErrors.nombre}>Nombre Completo</Label>
          <Input 
            id="nombre" 
            value={formData.nombre} 
            onChange={(e) => handleChange('nombre', e.target.value)} 
            error={!!formErrors.nombre}
            helperText={formErrors.nombre}
            disabled={updating} 
            placeholder="Ej. Juan Pérez"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username" error={!!formErrors.username}>Nombre de Usuario</Label>
            <Input 
              id="username" 
              value={formData.username} 
              onChange={(e) => handleChange('username', e.target.value)} 
              error={!!formErrors.username}
              helperText={formErrors.username}
              disabled={updating} 
              placeholder="Ej. juanperez"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="telefono" error={!!formErrors.telefono}>Teléfono de Contacto</Label>
            <Input 
              id="telefono" 
              type="tel"
              value={formData.telefono} 
              onChange={(e) => handleChange('telefono', e.target.value)} 
              error={!!formErrors.telefono}
              helperText={formErrors.telefono}
              disabled={updating} 
              placeholder="10 dígitos"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" error={!!formErrors.email}>Correo Electrónico del Sistema</Label>
          <Input 
            id="email" 
            type="email" 
            value={formData.email} 
            onChange={(e) => handleChange('email', e.target.value)} 
            error={!!formErrors.email}
            helperText={formErrors.email}
            disabled={updating} 
            placeholder="ejemplo@cuadra.com"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100">
        <Button 
          onClick={onCancel} 
          variant="cancelar" 
          disabled={updating}
          className="text-xs px-4 py-0.5 h-auto"
        >
          Cancelar
        </Button>
        
        <Button 
          onClick={handleSubmit} 
          variant="guardar" 
          icon="save"
          isLoading={updating}
          className="text-xs px-5 py-0.5 h-auto"
        >
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
};