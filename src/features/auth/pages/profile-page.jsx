import React, { useEffect } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useProfile } from '../hooks/use-profile';
import { ProfileDesktop } from '../views/profile-desktop';
import { ProfileMobile } from '../views/profile-mobile';
import { notify } from '@/components/notification/adaptive-notify';

const ProfilePage = () => {
  const isDesktop = useIsDesktop();
  
  const {
    profile,
    loading,
    updating,
    uploadingImage,
    error,
    success,
    fetchProfile,
    updateProfile,
    uploadImage,
    deleteImage,
    changePassword,
    clearError,
    clearSuccess
  } = useProfile();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (success?.message) {
      notify.success(success.message);
      const timer = setTimeout(() => clearSuccess?.(), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, clearSuccess]);

useEffect(() => {
    if (error?.message) {
      const msg = error.message.toLowerCase();
      
      // Silenciamos estrictamente los errores que los formularios ya manejan en su propia UI
      const isSilencedError = 
        msg.includes('contraseña') || 
        msg.includes('datos de entrada inválidos') ||
        msg.includes('correo') || // Error silenciado para que lo maneje GeneralForm
        msg.includes('usuario ya existe') || // Error silenciado para que lo maneje GeneralForm
        msg.includes('nombre de usuario'); // Error silenciado para que lo maneje GeneralForm
      
      // Si NO es un error silenciado (ej. 500 Server Error o Red), entonces sí lanzamos el Toast
      if (!isSilencedError) {
        notify.error(error.message);
      }
    }
  }, [error]);

  const viewProps = {
    profile,
    loading,
    updating,
    uploadingImage,
    error,
    success,
    onUpdate: updateProfile,
    onChangePassword: changePassword,
    onAvatarUpload: uploadImage,
    onAvatarDelete: deleteImage,
    clearError,
    clearSuccess
  };

  return (
    <div className="space-y-4 max-w-370 mx-auto">

      {isDesktop ? (
        <ProfileDesktop {...viewProps} />
      ) : (
        <ProfileMobile {...viewProps} />
      )}
    </div>
  );
};

export default ProfilePage;