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
import TicketsAprobarPage from '@/features/tickets/pages/tickets-aprobar';
import TicketsHistoricoPage from '@/features/tickets/pages/tickets-historico';
import TicketsBandejaGeneralPage from '@/features/bandeja-general/pages/tickets-bandeja-general';

import MantenimientosPage from '@/features/mantenimientos/pages/mantenimientos-page';
import MantenimientosAprobarPage from '@/features/mantenimientos/pages/mantenimientos-aprobar';
import MantenimientosBandejaPage from '@/features/mantenimientos/pages/mantenimientos-bandeja';
import MantenimientosCorrectivosPage from '@/features/mantenimientos/pages/mantenimientos-correctivos';
import MantenimientosPreventivosPage from '@/features/mantenimientos/pages/mantenimientos-preventivos';
import MantenimientosHistoricoPage from '@/features/mantenimientos/pages/mantenimientos-historico';

import HoyPage from '@/features/hoy/pages/hoy-page';
import HoyTodasPage from '@/features/hoy/pages/hoy-todas';
import HoyActividadesPage from '@/features/hoy/pages/hoy-actividades';
import HoyMantenimientosPage from '@/features/hoy/pages/hoy-mantenimientos';

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
  hoy: MODULES_CONFIG.find(m => m.id === 'hoy')?.allowedRoles || [],
  hoyTodas: MODULES_CONFIG.find(m => m.id === 'hoy')?.children?.find(c => c.id === 'hoy-todas')?.allowedRoles || [],
  hoyActividades: MODULES_CONFIG.find(m => m.id === 'hoy')?.children?.find(c => c.id === 'hoy-actividades')?.allowedRoles || [],
  hoyMantenimientos: MODULES_CONFIG.find(m => m.id === 'hoy')?.children?.find(c => c.id === 'hoy-mantenimientos')?.allowedRoles || [],
  tickets: MODULES_CONFIG.find(m => m.id === 'tickets')?.allowedRoles || [],
  ticketsBandeja: MODULES_CONFIG.find(m => m.id === 'tickets')?.children?.find(c => c.id === 'tickets-bandeja')?.allowedRoles || [],
  ticketsAprobar: MODULES_CONFIG.find(m => m.id === 'tickets')?.children?.find(c => c.id === 'tickets-aprobar')?.allowedRoles || [],
  ticketsHistorico: MODULES_CONFIG.find(m => m.id === 'tickets')?.children?.find(c => c.id === 'tickets-historico')?.allowedRoles || [],
  mantenimientos: MODULES_CONFIG.find(m => m.id === 'mantenimientos')?.allowedRoles || [],
  mantenimientosBandeja: MODULES_CONFIG.find(m => m.id === 'mantenimientos')?.children?.find(c => c.id === 'mantenimientos-bandeja')?.allowedRoles || [],
  mantenimientosAprobar: MODULES_CONFIG.find(m => m.id === 'mantenimientos')?.children?.find(c => c.id === 'mantenimientos-aprobar')?.allowedRoles || [],
  mantenimientosCorrectivos: MODULES_CONFIG.find(m => m.id === 'mantenimientos')?.children?.find(c => c.id === 'mantenimientos-correctivos')?.allowedRoles || [],
  mantenimientosPreventivos: MODULES_CONFIG.find(m => m.id === 'mantenimientos')?.children?.find(c => c.id === 'mantenimientos-preventivos')?.allowedRoles || [],
  mantenimientosHistorico: MODULES_CONFIG.find(m => m.id === 'mantenimientos')?.children?.find(c => c.id === 'mantenimientos-historico')?.allowedRoles || [],
  bandeja: MODULES_CONFIG.find(m => m.id === 'bandeja')?.allowedRoles || [],
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
          <Route index element={<Navigate to="/hoy" replace />} />

          {/* Dashboard Técnico: Solo SUPER_ADMIN y TECNICO */}
          <Route element={<RoleGuard allowedRoles={ROLES.dashboard} />}>
            <Route path="/dashboard" element={<HomeDashboard />} />
          </Route>

          <Route path="/perfil" element={<ProfilePage />} />

          {/* Módulo: Hoy (Tareas de Hoy Unificadas) */}
          <Route element={<RoleGuard allowedRoles={ROLES.hoy} />}>
            <Route path="/hoy" element={<HoyPage />}>
              <Route index element={<Navigate to="todas" replace />} />

              <Route element={<RoleGuard allowedRoles={ROLES.hoyTodas} />}>
                <Route path="todas" element={<HoyTodasPage />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={ROLES.hoyActividades} />}>
                <Route path="actividades" element={<HoyActividadesPage />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={ROLES.hoyMantenimientos} />}>
                <Route path="mantenimientos" element={<HoyMantenimientosPage />} />
              </Route>
            </Route>
          </Route>

          {/* Módulo: Tickets */}
          <Route element={<RoleGuard allowedRoles={ROLES.tickets} />}>
            <Route path="/tickets" element={<TicketsPage />}>
              <Route index element={<Navigate to="aprobar" replace />} />

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

          {/* Módulo: Mantenimientos */}
          <Route element={<RoleGuard allowedRoles={ROLES.mantenimientos} />}>
            <Route path="/mantenimientos" element={<MantenimientosPage />}>
              <Route index element={<Navigate to="aprobar" replace />} />

              <Route element={<RoleGuard allowedRoles={ROLES.mantenimientosAprobar} />}>
                <Route path="aprobar" element={<MantenimientosAprobarPage />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={ROLES.mantenimientosBandeja} />}>
                <Route path="bandeja" element={<MantenimientosBandejaPage />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={ROLES.mantenimientosCorrectivos} />}>
                <Route path="correctivos" element={<MantenimientosCorrectivosPage />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={ROLES.mantenimientosPreventivos} />}>
                <Route path="preventivos" element={<MantenimientosPreventivosPage />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={ROLES.mantenimientosHistorico} />}>
                <Route path="historico" element={<MantenimientosHistoricoPage />} />
              </Route>
            </Route>
          </Route>

          {/* Bandeja de Entrada General */}
          <Route element={<RoleGuard allowedRoles={ROLES.bandeja} />}>
            <Route path="/bandeja" element={<TicketsBandejaGeneralPage />} />
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