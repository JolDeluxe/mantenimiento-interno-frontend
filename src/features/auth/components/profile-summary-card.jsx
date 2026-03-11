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
    <Card className="bg-white shadow-md w-full">
      <CardBody className="flex flex-col items-center gap-5 p-5 w-full">
        <ProfileAvatar
          imagen={profile.imagen}
          nombre={profile.nombre}
          onUpload={onAvatarUpload}
          onDelete={onAvatarDelete}
          loading={uploadingImage}
        />

        <div className="w-full text-center space-y-3 flex flex-col items-center">
          <div className="w-full px-1">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 break-words text-balance leading-tight">
              {profile.nombre}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 break-words mt-1">
              {profile.username}
            </p>
          </div>

          <div className="flex justify-center w-full">
            <Badge className="bg-marca-primario text-white text-center whitespace-normal break-words">
              {formatRol(profile.rol)}
            </Badge>
          </div>

          {profile.departamento && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700 w-full px-2">
              <Icon name="business" size="sm" className="shrink-0 text-gray-400" />
              <span className="break-words text-center text-balance">
                {profile.departamento.nombre}
              </span>
            </div>
          )}

          <div className="flex justify-center w-full">
            <Badge className={getEstadoBadgeColor(profile.estado)}>
              {profile.estado}
            </Badge>
          </div>
        </div>

        <div className="w-full h-px bg-gray-200" />

        <div className="w-full grid grid-cols-2 gap-3 text-center">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col items-center justify-center w-full">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mb-1">Cargo</p>
            <p className="text-xs sm:text-sm font-medium text-gray-900 w-full wrap-break-words text-balance">
              {profile.cargo || '—'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col items-center justify-center w-full">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mb-1">Teléfono</p>
            <p className="text-xs sm:text-sm font-medium text-gray-900 w-full wrap-break-words text-balance">
              {profile.telefono || '—'}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};