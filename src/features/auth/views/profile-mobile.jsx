import React, { useState } from 'react';
import { Icon, Spinner } from '@/components/ui/z_index';
import { ProfileSummaryCard } from '../components/profile-summary-card';
import { ProfileInfoCard } from '../components/profile-info-card';
import { ProfileGeneralForm } from '../components/profile-general-form';
import { ProfilePasswordForm } from '../components/profile-password-form';

export const ProfileMobile = ({ 
  profile, 
  loading, 
  updating, 
  uploadingImage, 
  error, 
  success, 
  onUpdate, 
  onChangePassword,
  onAvatarUpload, 
  onAvatarDelete, 
  clearError 
}) => {
  const [editing, setEditing] = useState(false);
  const [activeMenu, setActiveMenu] = useState('general');

  if (loading) return <div className="flex justify-center p-10"><Spinner size="lg" /></div>;
  if (!profile) return <div className="text-center text-red-600 p-10"><Icon name="error" size="lg"/></div>;

  return (
    <div className="space-y-5 pb-6">
      
      {/* Encabezado de Vista Móvil */}
      <div className="px-1 mb-2">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Mi Perfil
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-medium leading-snug">
          Gestiona tu información personal y configuración de seguridad.
        </p>
      </div>

      <ProfileSummaryCard 
        profile={profile} 
        onAvatarUpload={onAvatarUpload} 
        onAvatarDelete={onAvatarDelete} 
        uploadingImage={uploadingImage} 
      />
      
      <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => { setActiveMenu('general'); setEditing(false); clearError?.(); }}
            className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-xs font-bold rounded-md transition-all duration-200 ${
              activeMenu === 'general' 
                ? 'bg-marca-primario text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Icon name="person" size="xs" /> General
          </button>
          <button 
            onClick={() => { setActiveMenu('security'); setEditing(false); clearError?.(); }}
            className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-xs font-bold rounded-md transition-all duration-200 ${
              activeMenu === 'security' 
                ? 'bg-marca-primario text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Icon name="lock" size="xs" /> Seguridad
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        {activeMenu === 'general' ? (
          <div className="flex flex-col">
            {!editing && (
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => setEditing(true)} 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider font-extrabold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:text-marca-primario hover:border-marca-primario/30 hover:bg-marca-primario/5 transition-all"
                >
                  <Icon name="edit" size="xs" /> Editar
                </button>
              </div>
            )}

            {editing ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <ProfileGeneralForm 
                  profile={profile} 
                  onSave={async (d) => { if (await onUpdate(d)) setEditing(false); }} 
                  onCancel={() => { setEditing(false); clearError?.(); }} 
                  updating={updating} 
                  error={error} 
                  clearError={clearError} 
                />
              </div>
            ) : (
              <ProfileInfoCard profile={profile} />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="password" size="sm" className="text-marca-primario"/> 
              Actualizar Contraseña
            </h3>
            <ProfilePasswordForm 
              onSave={async (d) => { 
                if (onChangePassword) {
                  if (await onChangePassword(d)) setActiveMenu('general'); 
                }
              }} 
              onCancel={() => { setActiveMenu('general'); clearError?.(); }} 
              updating={updating} 
              error={error} 
              clearError={clearError}
            />
          </div>
        )}
      </div>
    </div>
  );
};