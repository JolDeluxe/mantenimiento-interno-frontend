import React from 'react';
import { Card, CardBody, Badge, Icon } from '@/components/ui/z_index';
import { ProfileAvatar } from './profile-avatar';

export const ProfileSummaryCard = ({
  profile,
  onAvatarUpload,
  onAvatarDelete,
  uploadingImage
}) => {
  if (!profile) return null;

  const getEstadoBadgeColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo': return 'bg-green-100 text-green-700';
      case 'inactivo': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const formatRol = (rol) => {
    const rolesMap = {
      'SUPER_ADMIN': 'Super Admin',
      'JEFE_MTTO': 'Jefe Mtto',
      'COORDINADOR_MTTO': 'Coordinador',
      'TECNICO': 'Técnico',
      'CLIENTE_INTERNO': 'Cliente Interno'
    };
    return rolesMap[rol] || rol;
  };

  return (
    <Card className="bg-white shadow-md">
      <CardBody className="flex flex-col items-center gap-6 p-6">
        <ProfileAvatar
          imagen={profile.imagen}
          nombre={profile.nombre}
          onUpload={onAvatarUpload}
          onDelete={onAvatarDelete}
          loading={uploadingImage}
        />

        <div className="w-full text-center space-y-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{profile.nombre}</h2>
            <p className="text-sm text-gray-500">{profile.username}</p>
          </div>

          <div className="flex justify-center">
            <Badge className="bg-marca-primario text-white">
              {formatRol(profile.rol)}
            </Badge>
          </div>

          {profile.departamento && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
              <Icon name="business" size="sm" />
              <span>{profile.departamento.nombre}</span>
            </div>
          )}

          <div className="flex justify-center">
            <Badge className={getEstadoBadgeColor(profile.estado)}>
              {profile.estado}
            </Badge>
          </div>
        </div>

        <div className="w-full h-px bg-gray-200" />

        <div className="w-full grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-600">Cargo</p>
            <p className="text-sm font-medium text-gray-900 truncate" title={profile.cargo || '—'}>
              {profile.cargo || '—'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-600">Teléfono</p>
            <p className="text-sm font-medium text-gray-900 truncate" title={profile.telefono || '—'}>
              {profile.telefono || '—'}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};