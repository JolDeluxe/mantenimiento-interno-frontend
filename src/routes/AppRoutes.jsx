import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

import LoginPage from '@/features/auth/pages/login-page';
import HomeDashboard from '@/pages/home-dashboard';
import NotFound from '@/pages/not-found';
import SsoReceiver from '@/pages/sso-receiver';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* SsoReceiver debe ser 100% independiente de los Guards */}
      <Route path="/sso-receiver" element={<SsoReceiver />} />

      {/* Rutas Públicas */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Rutas Privadas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomeDashboard />} />
      </Route>

      {/* Errores */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};