import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { RoleGuard } from './RoleGuard';
import { MODULES_CONFIG } from '@/config/modules-config';

import ProfilePage from '@/features/auth/pages/profile-page';
import { DashboardLayout } from '@/layouts/dashboard-layout';

import LoginPage from '@/features/auth/pages/login-page';
import UsersPage from '@/features/usuarios/pages/users-page';
import HomeDashboard from '@/pages/home-dashboard';
import NotFound from '@/pages/not-found';
import SsoReceiver from '@/pages/sso-receiver';

import TicketsPage from '@/features/tickets/pages/tickets-page';
import TicketsBandejaPage from '@/features/tickets/pages/tickets-bandeja';
import TicketsHoyPage from '@/features/tickets/pages/tickets-hoy';
import TicketsHistoricoPage from '@/features/tickets/pages/tickets-historico';
import NotifyPage from '@/features/notificaciones/pages/notify-page';

// Mapeo seguro de la fuente de verdad para inyectar en el router
const ROLES = {
  tickets: MODULES_CONFIG.find(m => m.id === 'tickets')?.allowedRoles || [],
  ticketsHoy: MODULES_CONFIG.find(m => m.id === 'tickets')?.children?.find(c => c.id === 'tickets-hoy')?.allowedRoles || [],
  ticketsBandeja: MODULES_CONFIG.find(m => m.id === 'tickets')?.children?.find(c => c.id === 'tickets-bandeja')?.allowedRoles || [],
  ticketsHistorico: MODULES_CONFIG.find(m => m.id === 'tickets')?.children?.find(c => c.id === 'tickets-historico')?.allowedRoles || [],
  usuarios: MODULES_CONFIG.find(m => m.id === 'usuarios')?.allowedRoles || [],
  notificaciones: MODULES_CONFIG.find(m => m.id === 'notificaciones')?.allowedRoles || [],
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/sso-receiver" element={<SsoReceiver />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* Rutas Base Accesibles */}
          <Route path="/" element={<HomeDashboard />} />
          <Route path="/perfil" element={<ProfilePage />} />

          {/* Módulo: Tickets */}
          <Route element={<RoleGuard allowedRoles={ROLES.tickets} />}>
            <Route path="/tickets" element={<TicketsPage />}>
              <Route index element={<Navigate to="hoy" replace />} />

              <Route element={<RoleGuard allowedRoles={ROLES.ticketsHoy} />}>
                <Route path="hoy" element={<TicketsHoyPage />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={ROLES.ticketsBandeja} />}>
                <Route path="bandeja" element={<TicketsBandejaPage />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={ROLES.ticketsHistorico} />}>
                <Route path="historico" element={<TicketsHistoricoPage />} />
              </Route>
            </Route>
          </Route>

          {/* Módulo: Usuarios */}
          <Route element={<RoleGuard allowedRoles={ROLES.usuarios} />}>
            <Route path="/usuarios" element={<UsersPage />} />
          </Route>

          {/* Módulo: Notificaciones */}
          <Route element={<RoleGuard allowedRoles={ROLES.notificaciones} />}>
            <Route path="/notificaciones" element={<NotifyPage />} />
          </Route>

        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};