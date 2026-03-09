import React from 'react';
import { Icon } from '@/components/ui/z_index';

export const ProfileInfoCard = ({ profile }) => {
  if (!profile) return null;

  const InfoBlock = ({ label, value, readOnly }) => (
    <div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-50/50 border border-gray-100 relative group transition-colors hover:bg-gray-50">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value || '—'}</span>
      {readOnly && (
        <Icon name="lock" size="xs" className="absolute top-4 right-4 text-gray-300 opacity-50 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Datos Personales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoBlock label="Nombre Completo" value={profile.nombre} />
          <InfoBlock label="Usuario" value={profile.username} />
          <InfoBlock label="Correo Electrónico" value={profile.email} />
          <InfoBlock label="Teléfono" value={profile.telefono} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
          <Icon name="security" size="sm" className="text-gray-400" /> Datos Corporativos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoBlock label="Rol Asignado" value={formatRol(profile.rol)} readOnly />
          <InfoBlock label="Departamento" value={profile.departamento?.nombre} readOnly />
          <InfoBlock label="Cargo Oficial" value={profile.cargo} readOnly />
          <InfoBlock label="Estado de Cuenta" value={profile.estado} readOnly />
        </div>
      </div>

      <div className="flex items-center gap-6 pt-4 text-xs text-gray-400 font-medium">
        <span className="flex items-center gap-1"><Icon name="calendar_today" size="xs"/> Ingreso: {new Date(profile.createdAt || Date.now()).toLocaleDateString('es-MX')}</span>
        <span className="flex items-center gap-1"><Icon name="update" size="xs"/> Última Modificación: {new Date(profile.updatedAt || Date.now()).toLocaleDateString('es-MX')}</span>
      </div>
    </div>
  );
};

const formatRol = (rol) => {
  const rolesMap = {
    'SUPER_ADMIN': 'Super Admin',
    'JEFE_MTTO': 'Jefe Mantenimiento',
    'COORDINADOR_MTTO': 'Coordinador Mantenimiento',
    'TECNICO': 'Técnico',
    'CLIENTE_INTERNO': 'Cliente Interno'
  };
  return rolesMap[rol] || rol;
};