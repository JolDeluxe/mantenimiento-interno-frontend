// src/features/auth/hooks/use-profile.js
import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { 
  getProfile, 
  updateProfile, 
  uploadProfileImage, 
  deleteProfileImage, 
  changePassword 
} from '../api/profile-api';
import { readSnapshot, writeSnapshot } from '@/lib/idb';

export const useProfile = () => {
  const { user, setUser } = useAuthStore();
  const currentUser = user?.data || user;
  const userId = currentUser?.id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setError(null);

    // 1. Leer caché
    const snapshot = await readSnapshot('perfil', `user_${userId}`);
    if (snapshot?.data) {
        setProfile(snapshot.data);
        if (!snapshot.isStale && !navigator.onLine) return;
    }

    if (!navigator.onLine && snapshot?.data) return;

    try {
        setLoading(true);
        const response = await getProfile(userId);
        const data = response?.data ?? response;
        setProfile(data);
        await writeSnapshot('perfil', data, `user_${userId}`);
    } catch (err) {
        if (!snapshot?.data) {
            setError({ message: err.message || 'Error al cargar perfil', status: err.status });
            setProfile(null);
        }
    } finally {
        setLoading(false);
    }
}, [userId]);

  const handleUpdateProfile = useCallback(async (updatedData) => {
    if (!userId) return false;
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const response = await updateProfile(userId, updatedData);
      const newData = response?.data ?? response;
      
      setProfile(newData);
      
      if (setUser) {
        setUser({ ...currentUser, ...newData });
      }

      setSuccess({ message: 'Perfil actualizado correctamente' });
      return true;
    } catch (err) {
      setError({ message: err.message || 'Error al actualizar perfil', status: err.status, details: err.data });
      return false;
    } finally {
      setUpdating(false);
    }
  }, [userId, currentUser, setUser]);

  const handleUploadImage = useCallback(async (file) => {
    if (!userId) return null;
    try {
      setUploadingImage(true);
      setError(null);
      setSuccess(null);

      const response = await uploadProfileImage(userId, file);
      const newData = response?.data ?? response;

      setProfile(newData);
      
      if (setUser) {
        setUser({ ...currentUser, imagen: newData.imagen });
      }

      setSuccess({ message: 'Imagen de perfil actualizada' });
      return newData.imagen || true;
    } catch (err) {
      setError({ message: err.message || 'Error al subir imagen', status: err.status });
      return null;
    } finally {
      setUploadingImage(false);
    }
  }, [userId, currentUser, setUser]);

  const handleDeleteImage = useCallback(async () => {
    if (!userId) return false;
    try {
      setUploadingImage(true);
      setError(null);
      setSuccess(null);

      const response = await deleteProfileImage(userId);
      const newData = response?.data ?? response;

      setProfile(newData);

      if (setUser) {
        setUser({ ...currentUser, imagen: null });
      }

      setSuccess({ message: 'Imagen de perfil eliminada' });
      return true;
    } catch (err) {
      setError({ message: err.message || 'Error al eliminar imagen', status: err.status });
      return false;
    } finally {
      setUploadingImage(false);
    }
  }, [userId, currentUser, setUser]);

  const handleChangePassword = useCallback(async ({ currentPassword, newPassword }) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const response = await changePassword({ currentPassword, newPassword });
      setSuccess({ message: response?.message || 'Contraseña actualizada correctamente' });
      return true;
    } catch (err) {
      setError({ message: err.message || 'Error al cambiar contraseña', status: err.status, details: err.data });
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);

  // ── Motor Reactivo Offline ─────────────────────────────────────────────
  useEffect(() => {
    const handleSyncComplete = () => {
      console.log('📡 [Hook Profile] Sincronización finalizada. Refrescando perfil...');
      if (profile) {
         fetchProfile();
      }
    };

    window.addEventListener('cuadra-sync-complete', handleSyncComplete);
    return () => window.removeEventListener('cuadra-sync-complete', handleSyncComplete);
  }, [fetchProfile, profile]);

  return {
    profile, loading, updating, uploadingImage, error, success,
    fetchProfile, updateProfile: handleUpdateProfile,
    uploadImage: handleUploadImage, deleteImage: handleDeleteImage,
    changePassword: handleChangePassword, clearError, clearSuccess
  };
};