// src/routes/AppRoutes.jsx

import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import TicketsAprobarPage from '@/features/tickets/pages/tickets-aprobar';
import TicketsHistoricoPage from '@/features/tickets/pages/tickets-historico';
import NotifyPage from '@/features/notificaciones/pages/notify-page';
import MaquinariaPage from '@/features/maquinaria/pages/maquinaria-page';
import QrBatchPrintPage from '@/features/maquinaria/pages/qr-batch-print-page';

import DashboardPage from '@/features/dashboard/pages/dashboard-page';
import DashboardGeneral from '@/features/dashboard/pages/dashboard-general';
import DashboardEquipo from '@/features/dashboard/pages/dashboard-equipo';
import DashboardArea from '@/features/dashboard/pages/dashboard-area';
import DashboardReportes from '@/features/dashboard/pages/dashboard-reportes';

const ROLES = {
  dashboard: MODULES_CONFIG.find(m => m.id === 'dashboard')?.allowedRoles || [],
  tickets: MODULES_CONFIG.find(m => m.id === 'tickets')?.allowedRoles || [],
  ticketsHoy: MODULES_CONFIG.find(m => m.id === 'tickets')?.children?.find(c => c.id === 'tickets-hoy')?.allowedRoles || [],
  ticketsBandeja: MODULES_CONFIG.find(m => m.id === 'tickets')?.children?.find(c => c.id === 'tickets-bandeja')?.allowedRoles || [],
  ticketsAprobar: MODULES_CONFIG.find(m => m.id === 'tickets')?.children?.find(c => c.id === 'tickets-aprobar')?.allowedRoles || [],
  ticketsHistorico: MODULES_CONFIG.find(m => m.id === 'tickets')?.children?.find(c => c.id === 'tickets-historico')?.allowedRoles || [],
  usuarios: MODULES_CONFIG.find(m => m.id === 'usuarios')?.allowedRoles || [],
  notificaciones: MODULES_CONFIG.find(m => m.id === 'notificaciones')?.allowedRoles || [],
  reportes: MODULES_CONFIG.find(m => m.id === 'reportes')?.allowedRoles || [],
  maquinaria: MODULES_CONFIG.find(m => m.id === 'maquinaria')?.allowedRoles || [],
  reportesGeneral: MODULES_CONFIG.find(m => m.id === 'reportes')?.children?.find(c => c.id === 'reportes-general')?.allowedRoles || [],
  reportesEquipo: MODULES_CONFIG.find(m => m.id === 'reportes')?.children?.find(c => c.id === 'reportes-equipo')?.allowedRoles || [],
  reportesArea: MODULES_CONFIG.find(m => m.id === 'reportes')?.children?.find(c => c.id === 'reportes-area')?.allowedRoles || [],
  reportesCliente: MODULES_CONFIG.find(m => m.id === 'reportes')?.children?.find(c => c.id === 'reportes-cliente')?.allowedRoles || [],
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

          {/* REDIRECCIÓN RAÍZ: Manda a hoy directamente */}
          <Route index element={<Navigate to="/tickets/hoy" replace />} />

          {/* Dashboard Técnico: Solo SUPER_ADMIN y TECNICO */}
          <Route element={<RoleGuard allowedRoles={ROLES.dashboard} />}>
            <Route path="/dashboard" element={<HomeDashboard />} />
          </Route>

          <Route path="/perfil" element={<ProfilePage />} />

          {/* Módulo: Tickets */}
          <Route element={<RoleGuard allowedRoles={ROLES.tickets} />}>
            <Route path="/tickets" element={<TicketsPage />}>
              <Route index element={<Navigate to="hoy" replace />} />

              <Route element={<RoleGuard allowedRoles={ROLES.ticketsHoy} />}>
                <Route path="hoy" element={<TicketsHoyPage />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={ROLES.ticketsAprobar} />}>
                <Route path="aprobar" element={<TicketsAprobarPage />} />
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

          {/* Módulo: Maquinaria */}
          <Route element={<RoleGuard allowedRoles={ROLES.maquinaria} />}>
            <Route path="/maquinaria" element={<MaquinariaPage />} />
            <Route path="/maquinaria/imprimir-qr" element={<QrBatchPrintPage />} />
          </Route>

          {/* Módulo: Notificaciones */}
          <Route element={<RoleGuard allowedRoles={ROLES.notificaciones} />}>
            <Route path="/notificaciones" element={<NotifyPage />} />
          </Route>

          {/* Módulo: Reportes y KPIs */}
          <Route element={<RoleGuard allowedRoles={ROLES.reportes} />}>
            <Route path="/reportes" element={<DashboardPage />}>
              <Route index element={<Navigate to="general" replace />} />
              <Route element={<RoleGuard allowedRoles={ROLES.reportesGeneral} />}>
                <Route path="general" element={<DashboardGeneral />} />
              </Route>
              <Route element={<RoleGuard allowedRoles={ROLES.reportesEquipo} />}>
                <Route path="equipo" element={<DashboardEquipo />} />
              </Route>
              <Route element={<RoleGuard allowedRoles={ROLES.reportesArea} />}>
                <Route path="area" element={<DashboardArea />} />
              </Route>
              <Route element={<RoleGuard allowedRoles={ROLES.reportesCliente} />}>
                <Route path="cliente" element={<DashboardReportes />} />
              </Route>
            </Route>
          </Route>

        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};