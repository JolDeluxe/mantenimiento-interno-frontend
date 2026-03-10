import React, { useState } from 'react';
import { Button, Icon, Spinner } from '@/components/ui/z_index';
import { ProfileSummaryCard } from '../components/profile-summary-card';
import { ProfileInfoCard } from '../components/profile-info-card';
// import { ProfileEditForm } from '../components/profile-edit-form';

export const ProfileMobile = ({ 
  profile, loading, updating, uploadingImage, error, success, onUpdate, onAvatarUpload, onAvatarDelete, clearError 
}) => {
  const [editing, setEditing] = useState(false);

  if (loading) return <div className="flex justify-center p-10"><Spinner size="lg" /></div>;
  if (!profile) return <div className="text-center text-red-600"><Icon name="error" /></div>;

  return (
    <div className="space-y-6">
      <ProfileSummaryCard 
        profile={profile} 
        onAvatarUpload={onAvatarUpload} 
        onAvatarDelete={onAvatarDelete} 
        uploadingImage={uploadingImage} 
      />
      
      {!editing && (
        <Button onClick={() => setEditing(true)} className="w-full bg-marca-primario text-white py-3 shadow-sm hover:shadow-md">
          <Icon name="edit" size="sm" className="mr-2" /> Editar Perfil
        </Button>
      )}

      {editing ? (
        <ProfileEditForm 
          profile={profile} 
          onSave={async (d) => { if (await onUpdate(d)) setEditing(false); }} 
          onCancel={() => { setEditing(false); clearError?.(); }} 
          updating={updating} 
          error={error} 
          clearError={clearError} 
        />
      ) : (
        <ProfileInfoCard profile={profile} />
      )}
    </div>
  );
};