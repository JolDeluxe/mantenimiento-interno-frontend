import React, { useState } from 'react';
import { Card, CardBody, Button, Icon, Spinner, Badge } from '@/components/ui/z_index';
import { ProfileAvatar } from '../components/profile-avatar';
import { ProfileGeneralForm } from '../components/profile-general-form';
import { ProfilePasswordForm } from '../components/profile-password-form';
import { ProfileInfoCard } from '../components/profile-info-card';

export const ProfileDesktop = ({ 
  profile, loading, updating, uploadingImage, error, success, onUpdate, onAvatarUpload, onAvatarDelete, clearError 
}) => {
  const [editing, setEditing] = useState(false);
  const [activeMenu, setActiveMenu] = useState('general');

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Spinner size="lg" /></div>;
  if (!profile) return <div className="text-center text-red-600 p-10"><Icon name="error" size="lg"/><p>Error al cargar el perfil</p></div>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      
      {/* 1. ENCABEZADO: Avatar Izquierda, Datos Derecha */}
      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-xl">
        <CardBody className="p-8 flex flex-row items-center gap-8">
          <div className="shrink-0">
            <ProfileAvatar 
              imagen={profile.imagen} 
              nombre={profile.nombre} 
              onUpload={onAvatarUpload} 
              onDelete={onAvatarDelete} 
              loading={uploadingImage} 
            />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-start w-full">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">{profile.nombre}</h2>
                <p className="text-lg font-medium text-gray-500">@{profile.username}</p>
              </div>
              <Badge className="bg-marca-primario/10 text-marca-primario border border-marca-primario/20 px-3 py-1 font-bold">
                {profile.rol.replace(/_/g, ' ')}
              </Badge>
            </div>

            <div className="mt-5 flex flex-wrap gap-6 text-sm text-gray-600 font-medium">
              <span className="flex items-center gap-2">
                <Icon name="business" size="sm" className="text-gray-400" /> 
                {profile.departamento?.nombre || 'Sin Departamento'}
              </span>
              <span className="flex items-center gap-2">
                <Icon name="work" size="sm" className="text-gray-400" /> 
                {profile.cargo || 'Sin Cargo Asignado'}
              </span>
              <span className="flex items-center gap-2">
                <Icon name="mail" size="sm" className="text-gray-400" /> 
                {profile.email}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. CONTROLES: Botones Pegados (Segmented Control) y Acciones */}
      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl shadow-sm border border-gray-100">
        <div className="inline-flex bg-gray-100 p-1.5 rounded-lg border border-gray-200">
          <button 
            onClick={() => { setActiveMenu('general'); setEditing(false); clearError?.(); }}
            className={`cursor-pointer flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
              activeMenu === 'general' 
                ? 'bg-marca-primario text-white shadow-md scale-[1.02]' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            <Icon name="person" size="sm" /> Datos Generales
          </button>
          <button 
            onClick={() => { setActiveMenu('security'); setEditing(false); clearError?.(); }}
            className={`cursor-pointer flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
              activeMenu === 'security' 
                ? 'bg-marca-primario text-white shadow-md scale-[1.02]' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            <Icon name="lock" size="sm" /> Seguridad
          </button>
        </div>

        {activeMenu === 'general' && !editing && (
          <Button 
            onClick={() => setEditing(true)} 
            variant="outline"
            className="text-white border-marca-primario hover:bg-marca-primario-hover text-xs px-4 py-1 h-auto mr-1"
          >
            <Icon name="edit" size="xs" className="mr-1" /> Editar Información
          </Button>
        )}
      </div>

      {/* 3. CONTENIDO: Información o Formulario */}
      <Card className="shadow-sm border-none bg-white rounded-xl">
        <CardBody className="p-8">
          {activeMenu === 'general' ? (
            editing ? (
              <ProfileGeneralForm 
                profile={profile} 
                onSave={async (d) => { if (await onUpdate(d)) setEditing(false); }} 
                onCancel={() => { setEditing(false); clearError?.(); }} 
                updating={updating} 
                error={error} 
                clearError={clearError}
              />
            ) : (
              <ProfileInfoCard profile={profile} />
            )
          ) : (
             <div className="max-w-300 mx-auto">
                <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                  <Icon name="password" size="sm" className="text-marca-primario"/> 
                  Actualizar Contraseña
                </h3>
                <ProfilePasswordForm 
                  onSave={async (d) => { if (await onUpdate(d)) setActiveMenu('general'); }} 
                  onCancel={() => { setActiveMenu('general'); clearError?.(); }} 
                  updating={updating} 
                  error={error} 
                  clearError={clearError}
                />
             </div>
          )}
        </CardBody>
      </Card>
      
    </div>
  );
};