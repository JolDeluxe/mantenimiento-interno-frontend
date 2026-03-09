import React, { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Icon, Spinner, Badge } from '@/components/ui/z_index';
import { ProfileAvatar } from '../components/profile-avatar';
import { ProfileEditForm } from '../components/profile-edit-form';
import { ProfileInfoCard } from '../components/profile-info-card';

export const ProfileDesktop = ({ 
  profile, loading, updating, uploadingImage, error, success, onUpdate, onAvatarUpload, onAvatarDelete, clearError 
}) => {
  const [editing, setEditing] = useState(false);
  const [activeMenu, setActiveMenu] = useState('general');

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Spinner size="lg" /></div>;
  if (!profile) return <div className="text-center text-red-600 p-10"><Icon name="error" size="lg"/><p>Error al cargar el perfil</p></div>;

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start w-full">
      
      <aside className="w-full md:w-72 shrink-0 space-y-6">
        <Card className="border-none shadow-sm bg-gray-50/50">
          <CardBody className="p-6 flex flex-col items-center text-center">
            <ProfileAvatar 
              imagen={profile.imagen} 
              nombre={profile.nombre} 
              onUpload={onAvatarUpload} 
              onDelete={onAvatarDelete} 
              loading={uploadingImage} 
            />
            <h2 className="mt-4 text-xl font-extrabold text-gray-900">{profile.nombre}</h2>
            <p className="text-sm font-medium text-gray-500 mb-3">@{profile.username}</p>
            <Badge className="bg-marca-primario/10 text-marca-primario border border-marca-primario/20">
              {profile.rol}
            </Badge>
          </CardBody>
        </Card>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => { setActiveMenu('general'); setEditing(false); clearError?.(); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-all ${
              activeMenu === 'general' 
                ? 'bg-marca-primario text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon name="person" size="sm" /> Información General
          </button>
          <button 
            onClick={() => { setActiveMenu('security'); setEditing(true); clearError?.(); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-all ${
              activeMenu === 'security' 
                ? 'bg-marca-primario text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon name="lock" size="sm" /> Seguridad y Contraseña
          </button>
        </nav>
      </aside>

      <main className="flex-1 w-full min-w-0">
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="border-b border-gray-100 pb-4 flex flex-row items-center justify-between bg-white rounded-t-lg">
            <CardTitle className="text-xl text-gray-800">
              {activeMenu === 'general' ? 'Información General' : 'Seguridad y Acceso'}
            </CardTitle>
            
            {activeMenu === 'general' && !editing && (
              <Button 
                onClick={() => setEditing(true)} 
                variant="outline"
                className="text-marca-primario border-marca-primario hover:bg-marca-primario/5 h-9"
              >
                <Icon name="edit" size="sm" className="mr-2" /> Editar Datos
              </Button>
            )}
          </CardHeader>
          
          <CardBody className="p-6">
            {activeMenu === 'general' ? (
              editing ? (
                <ProfileEditForm 
                  profile={profile} 
                  onSave={async (d) => { if (await onUpdate(d)) setEditing(false); }} 
                  onCancel={() => { setEditing(false); clearError?.(); }} 
                  updating={updating} 
                  error={error} 
                  clearError={clearError}
                  mode="general" 
                />
              ) : (
                <ProfileInfoCard profile={profile} />
              )
            ) : (
               <ProfileEditForm 
                  profile={profile} 
                  onSave={async (d) => { if (await onUpdate(d)) setEditing(false); }} 
                  onCancel={() => { setActiveMenu('general'); setEditing(false); clearError?.(); }} 
                  updating={updating} 
                  error={error} 
                  clearError={clearError}
                  mode="security" 
                />
            )}
          </CardBody>
        </Card>
      </main>

    </div>
  );
};