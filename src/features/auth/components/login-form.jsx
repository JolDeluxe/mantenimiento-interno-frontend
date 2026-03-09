import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Input, Label } from '@/components/form/z_index';

export const LoginForm = ({
  formData,
  loading,
  submitted,
  backendError,
  onChange,
  onSubmit,
  onForgot,
  onRegister
}) => {
  // Evaluamos si el error debe mostrarse basado en el estado de "submitted"
  const emailError = submitted && !formData.email.trim() ? "El correo o usuario es obligatorio" : null;
  const passwordError = submitted && !formData.password.trim() ? "La contraseña es obligatoria" : null;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <h2 className="fuente-titulos text-2xl font-bold mb-6 text-center text-marca-primario uppercase">
        Iniciar Sesión
      </h2>

      {/* Renderizado del error del backend (Credenciales incorrectas) */}
      {backendError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600 text-sm font-semibold">
          <Icon name="error" size="20px" fill={true} />
          {backendError}
        </div>
      )}

      <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
        {/* Campo Correo o Usuario */}
        <div>
          <Label htmlFor="email" error={!!emailError} className="flex items-center gap-2">
            <Icon name="mail" size="18px" /> Correo o Usuario
          </Label>
          <Input
            id="email"
            type="text"
            name="email"
            placeholder="usuario o usuario@cuadra.com.mx"
            value={formData.email}
            onChange={onChange}
            error={!!emailError}        // Activa el borde rojo
            helperText={emailError}     // Muestra el texto inferior
          />
        </div>

        {/* Campo Contraseña */}
        <div>
          <Label htmlFor="password" error={!!passwordError} className="flex items-center gap-2">
            <Icon name="lock" size="18px" /> Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={onChange}
            error={!!passwordError}     // Activa el borde rojo
            helperText={passwordError}  // Muestra el texto inferior
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-2 py-3 rounded-md font-bold uppercase tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 ${
            loading
              ? "bg-slate-400 text-white cursor-not-allowed"
              : "bg-marca-primario hover:bg-opacity-90 text-white cursor-pointer"
          }`}
        >
          {loading ? "Conectando..." : "Entrar"}
        </button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={onForgot}
          className="text-sm font-semibold text-marca-acento hover:underline focus:outline-none cursor-pointer flex items-center gap-1"
        >
          Olvidé mi contraseña
        </button>
        
        {/* <button
          type="button"
          onClick={onRegister}
          className="text-sm font-medium text-slate-500 hover:text-marca-primario hover:underline focus:outline-none cursor-pointer flex items-center gap-1"
        >
          <Icon name="person_add" size="16px" />
          ¿No tienes una cuenta? Regístrate aquí
        </button> */}
      </div>
    </div>
  );
};