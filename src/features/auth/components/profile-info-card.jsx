import React from 'react';
import { Icon, Badge } from '@/components/ui/z_index';

export const ProfileInfoCard = ({ profile }) => {
  if (!profile) return null;

  const InfoBlock = ({ label, value, readOnly }) => (
    <div className="flex flex-col gap-1.5 p-5 rounded-xl bg-gray-50/50 border border-gray-100 relative group transition-colors hover:bg-gray-50">
      <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value || 'No registrado'}</span>
      {readOnly && (
        <Icon name="lock" size="xs" className="absolute top-5 right-5 text-gray-300 opacity-50 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
          <Icon name="contact_phone" size="sm" className="text-gray-400" /> Información de Contacto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InfoBlock label="Teléfono Fijo / Móvil" value={profile.telefono} />
          <InfoBlock label="Correo de Sistema" value={profile.email} readOnly />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
          <Icon name="admin_panel_settings" size="sm" className="text-gray-400" /> Estado de la Cuenta
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5 p-5 rounded-xl bg-gray-50/50 border border-gray-100">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Estado Actual</span>
            <div className="mt-1">
              <Badge className={profile.estado?.toLowerCase() === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {profile.estado}
              </Badge>
            </div>
          </div>
          <InfoBlock label="Rol en Sistema" value={profile.rol.replace(/_/g, ' ')} readOnly />
        </div>
      </div>

      {/* <div className="flex items-center justify-between pt-6 mt-4 border-t border-gray-100 text-xs text-gray-400 font-medium">
        <span className="flex items-center gap-1.5"><Icon name="calendar_today" size="xs"/> Miembro desde: {new Date(profile.createdAt || Date.now()).toLocaleDateString('es-MX')}</span>
        <span className="flex items-center gap-1.5"><Icon name="update" size="xs"/> Última Modificación: {new Date(profile.updatedAt || Date.now()).toLocaleDateString('es-MX')}</span>
      </div> */}
    </div>
  );
};