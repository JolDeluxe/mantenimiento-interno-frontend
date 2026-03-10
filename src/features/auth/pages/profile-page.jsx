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
      notify.error(error.message);
    }
  }, [error]);

  const handleUpdate = async (data) => {
    if (data.changePassword) {
      return await changePassword(data.currentPassword, data.newPassword);
    }
    return await updateProfile(data);
  };

  const handleAvatarUpload = async (file) => {
    return await uploadImage(file);
  };

  const handleAvatarDelete = async () => {
    return await deleteImage();
  };

  const viewProps = {
    profile,
    loading,
    updating,
    uploadingImage,
    error,
    success,
    onUpdate: handleUpdate,
    onAvatarUpload: handleAvatarUpload,
    onAvatarDelete: handleAvatarDelete,
    clearError,
    clearSuccess
  };

  return (
    <div className="space-y-4 max-w-370 mx-auto">
      <div className="mb-6">
        <p className="text-gray-600 mt-2">
          Gestiona tu información personal y configuración de seguridad
        </p>
      </div>

      {isDesktop ? (
        <ProfileDesktop {...viewProps} />
      ) : (
        <ProfileMobile {...viewProps} />
      )}
    </div>
  );
};

export default ProfilePage;