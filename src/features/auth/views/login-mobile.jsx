import React from 'react';
import { LoginForm } from '../components/login-form';
import { ForgotPasswordForm } from '../components/forgot-password-form';
import { RegisterForm } from '../components/register-form';

export const LoginMobile = ({ view, bgImage, onBack, ...formProps }) => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen relative bg-cover bg-center bg-no-repeat p-4 transition-all duration-500"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs"></div>

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-100 p-6 sm:p-8 text-slate-800">
        <div className="flex justify-center mb-6">
          <img src="/img/01_Cuadra_Mantnimento.webp" alt="Logo Cuadra" className="w-60 h-auto object-contain" />
        </div>

        {view === 'login' && <LoginForm {...formProps} />}
        {view === 'forgot' && <ForgotPasswordForm onBack={onBack} />}
        {view === 'register' && <RegisterForm {...formProps} onBack={onBack} />}
      </div>
    </div>
  );
};