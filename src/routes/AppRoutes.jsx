import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import ProfilePage from '@/features/auth/pages/profile-page';

// Layouts
import { DashboardLayout } from '@/layouts/dashboard-layout';

// Pages
import LoginPage from '@/features/auth/pages/login-page';
import UsersPage from '@/features/usuarios/pages/users-page';
import HomeDashboard from '@/pages/home-dashboard';
import NotFound from '@/pages/not-found';
import SsoReceiver from '@/pages/sso-receiver';

import TicketsPage from '@/features/tickets/pages/tickets-page';
import TicketsBandejaPage from '@/features/tickets/pages/tickets-bandeja';
import TicketsHoyPage from '@/features/tickets/pages/tickets-hoy';
import TicketsHistoricoPage from '@/features/tickets/pages/tickets-historico';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/sso-receiver" element={<SsoReceiver />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<HomeDashboard />} />
          <Route path="/perfil" element={<ProfilePage />} />

          <Route path="/tickets" element={<TicketsPage />}>
            <Route index element={<Navigate to="hoy" replace />} />
            <Route path="bandeja" element={<TicketsBandejaPage />} />
            <Route path="hoy" element={<TicketsHoyPage />} />
            <Route path="historico" element={<TicketsHistoricoPage />} />
          </Route>

          <Route path="/usuarios" element={<UsersPage />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};