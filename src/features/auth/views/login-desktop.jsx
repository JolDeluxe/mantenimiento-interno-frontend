import React from 'react';
import { LoginForm } from '../components/login-form';
import { ForgotPasswordForm } from '../components/forgot-password-form';
import { RegisterForm } from '../components/register-form';

export const LoginDesktop = ({ view, bgImage, onBack, ...formProps }) => {
  return (
    <div
      className="flex items-center justify-center min-h-screen relative bg-cover bg-center bg-no-repeat transition-all duration-100"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative bg-white rounded-lg shadow-2xl w-112.5 p-8 text-slate-800">
        <div className="flex justify-center mb-8">
          <img src="/img/01_Cuadra_Mantnimento.webp" alt="Logo Cuadra" className="w-70 h-auto object-contain" />
        </div>

        {view === 'login' && <LoginForm {...formProps} />}
        {view === 'forgot' && <ForgotPasswordForm onBack={onBack} />}
        {view === 'register' && <RegisterForm {...formProps} onBack={onBack} />}
      </div>
    </div>
  );
};