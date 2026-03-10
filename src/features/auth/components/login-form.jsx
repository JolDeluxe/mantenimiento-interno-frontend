import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '../../../components/ui/z_index'; 
import { Input, Label } from '@/components/form/z_index';

export const LoginForm = ({
  formData,
  loading,
  submitted,
  backendError,
  onChange,
  onSubmit,
  onForgot,
}) => {
  const emailError = submitted && !formData.email.trim() ? "El correo o usuario es obligatorio" : null;
  const passwordError = submitted && !formData.password.trim() ? "La contraseña es obligatoria" : null;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <h2 className="fuente-titulos text-3xl font-bold mb-8 text-center text-marca-primario uppercase tracking-widest">
        Iniciar Sesión
      </h2>

      {/* Alerta de Error de Negocio (Backend) */}
      {backendError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-estado-rechazado rounded-r-[--radius-cuadra] flex items-center gap-3 text-estado-rechazado text-sm font-bold shadow-sm">
          <Icon name="error" size="20px" fill={true} />
          <span>{backendError}</span>
        </div>
      )}

      <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
        {/* Campo Correo / Usuario */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" error={!!emailError} className="flex items-center gap-2 font-bold">
            <Icon name="person" size="18px" /> CORREO O USUARIO
          </Label>
          <Input
            id="email"
            type="text"
            name="email"
            placeholder="usuario@cuadra.com.mx"
            value={formData.email}
            onChange={onChange}
            error={!!emailError}
            helperText={emailError}
          />
        </div>

        {/* Campo Contraseña */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" error={!!passwordError} className="flex items-center gap-2 font-bold">
            <Icon name="lock" size="18px" /> CONTRASEÑA
          </Label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={onChange}
            error={!!passwordError}
            helperText={passwordError}
          />
        </div>

        <Button
          type="submit"
          variant="primario"
          isLoading={loading}
          className="mt-4 py-4" 
        >
          Entrar
        </Button>
      </form>

      <div className="mt-8 flex flex-col items-center">
        <Button
          variant="ghost"
          onClick={onForgot}
          className="text-xs border-none hover:bg-transparent hover:text-marca-primario underline decoration-slate-300 underline-offset-4"
        >
          Olvidé mi contraseña
        </Button>
      </div>
    </div>
  );
};