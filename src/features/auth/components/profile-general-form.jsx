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
  // 🔥 ESTADO ORIGINAL: Guardamos la foto intacta de los datos para saber si hubo cambios
  const [initialData, setInitialData] = useState({ nombre: '', username: '', email: '', telefono: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (profile) {
      const data = {
        nombre: profile.nombre || '',
        username: profile.username || '',
        email: profile.email || '',
        telefono: profile.telefono || ''
      };
      setFormData(data);
      setInitialData(data); // Establecemos la foto original al cargar
    }
  }, [profile]);

  useEffect(() => {
    if (error?.message) {
      const msg = error.message.toLowerCase();
      let handled = false;

      if (msg.includes('correo')) {
        setFormErrors(prev => ({ ...prev, email: error.message }));
        handled = true;
      }
      
      if (msg.includes('usuario ya existe') || msg.includes('nombre de usuario')) {
        setFormErrors(prev => ({ ...prev, username: error.message }));
        handled = true;
      }

      if (handled && clearError) {
        clearError(); 
      }
    }
  }, [error, clearError]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre?.trim()) {
      errors.nombre = 'El nombre completo es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.length > 100) {
      errors.nombre = 'Límite excedido (máx 100 caracteres)';
    }
    
    if (!formData.username?.trim()) {
      errors.username = 'El usuario es obligatorio';
    } else if (/\s/.test(formData.username)) {
      errors.username = 'El usuario no puede contener espacios';
    } else if (formData.username.length > 50) {
      errors.username = 'Límite excedido (máx 50 caracteres)';
    }

    if (!formData.email?.trim()) {
      errors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Formato de correo inválido';
    } else if (!formData.email.endsWith('@cuadra.com.mx')) {
      errors.email = 'Solo se permiten correos corporativos (@cuadra.com.mx)';
    } else if (formData.email.length > 100) {
      errors.email = 'Límite excedido (máx 100 caracteres)';
    }

    if (formData.telefono && formData.telefono.trim() !== '') {
      if (formData.telefono.length < 10) {
        errors.telefono = 'Faltan dígitos (requiere 10)';
      } else if (formData.telefono.length > 10) {
        errors.telefono = 'Sobran dígitos (máx 10)';
      }
    }

    return errors;
  };

  const handleChange = (field, value) => {
    let finalValue = value;

    if (field === 'telefono') {
      finalValue = value.replace(/\D/g, ''); 
      if (finalValue.length > 11) finalValue = finalValue.substring(0, 11); 
    } 
    else if (field === 'username') {
      finalValue = value.replace(/\s/g, ''); 
      if (finalValue.length > 51) finalValue = finalValue.substring(0, 51);
    } 
    else if (field === 'nombre') {
      if (finalValue.length > 101) finalValue = finalValue.substring(0, 101);
    } 
    else if (field === 'email') {
      finalValue = value.replace(/\s/g, ''); 
      if (finalValue.length > 101) finalValue = finalValue.substring(0, 101);
    }

    setFormData(prev => ({ ...prev, [field]: finalValue }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return setFormErrors(errors);
    onSave(formData);
  };

  // 🔥 LÓGICA DE BLOQUEO AVANZADA ("DIRTY STATE")
  const isMissingRequiredFields = !formData.nombre?.trim() || !formData.username?.trim() || !formData.email?.trim();
  const isDataUnchanged = JSON.stringify(formData) === JSON.stringify(initialData);
  const isSaveDisabled = updating || isMissingRequiredFields || isDataUnchanged;

  return (
    <div className="space-y-6">
      {/* Nuevo Diseño de Alerta copiado del Login */}
      {error && !formErrors.email && !formErrors.username && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-estado-rechazado rounded-r-[--radius-cuadra] flex items-center justify-between text-estado-rechazado text-sm font-bold shadow-sm">
          <div className="flex items-center gap-3">
            <Icon name="error" size="20px" fill={true} />
            <span>{error.message}</span>
          </div>
          {clearError && (
            <button 
              onClick={clearError} 
              className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer"
              title="Descartar mensaje"
            >
              <Icon name="close" size="18px" />
            </button>
          )}
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="nombre" error={!!formErrors.nombre || formData.nombre.length > 100}>Nombre Completo</Label>
            <span className={`text-[10px] font-bold tracking-wider ${formData.nombre.length > 100 ? 'text-red-500' : 'text-gray-400'}`}>
              {formData.nombre.length}/100
            </span>
          </div>
          <Input 
            id="nombre" 
            value={formData.nombre} 
            onChange={(e) => handleChange('nombre', e.target.value)} 
            error={!!formErrors.nombre || formData.nombre.length > 100}
            helperText={formErrors.nombre}
            disabled={updating} 
            placeholder="Ej. Juan Pérez"
            maxLength={101}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="username" error={!!formErrors.username || formData.username.length > 50}>Nombre de Usuario</Label>
              <span className={`text-[10px] font-bold tracking-wider ${formData.username.length > 50 ? 'text-red-500' : 'text-gray-400'}`}>
                {formData.username.length}/50
              </span>
            </div>
            <Input 
              id="username" 
              value={formData.username} 
              onChange={(e) => handleChange('username', e.target.value)} 
              error={!!formErrors.username || formData.username.length > 50}
              helperText={formErrors.username}
              disabled={updating} 
              placeholder="Ej. juanperez"
              maxLength={51}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="telefono" error={!!formErrors.telefono || formData.telefono.length > 10}>Teléfono de Contacto</Label>
              <span className={`text-[10px] font-bold tracking-wider ${formData.telefono.length > 10 ? 'text-red-500' : 'text-gray-400'}`}>
                {formData.telefono.length}/10
              </span>
            </div>
            <Input 
              id="telefono" 
              type="tel"
              value={formData.telefono} 
              onChange={(e) => handleChange('telefono', e.target.value)} 
              error={!!formErrors.telefono || formData.telefono.length > 10}
              helperText={formErrors.telefono}
              disabled={updating} 
              placeholder="10 dígitos"
              maxLength={11}
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="email" error={!!formErrors.email || formData.email.length > 100}>Correo Electrónico del Sistema</Label>
            <span className={`text-[10px] font-bold tracking-wider ${formData.email.length > 100 ? 'text-red-500' : 'text-gray-400'}`}>
              {formData.email.length}/100
            </span>
          </div>
          <Input 
            id="email" 
            type="email" 
            value={formData.email} 
            onChange={(e) => handleChange('email', e.target.value)} 
            error={!!formErrors.email || formData.email.length > 100}
            helperText={formErrors.email}
            disabled={updating} 
            placeholder="ejemplo@cuadra.com.mx"
            maxLength={101}
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
          disabled={isSaveDisabled}
          className="text-xs px-5 py-0.5 h-auto"
        >
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
};