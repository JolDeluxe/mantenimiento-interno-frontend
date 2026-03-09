import axios from '@/lib/axios';

/**
 * Obtiene el perfil de un usuario por su ID
 * @param {string} userId - ID del usuario autenticado
 */
export const getProfile = async (userId) => {
  try {
    const response = await axios.get(`/api/usuarios/${userId}`);
    // Fallback defensivo: si response.data no existe, devuelve la respuesta entera
    return response?.data ?? response; 
  } catch (error) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || 'Error al obtener perfil',
      data: error.response?.data
    };
  }
};

/**
 * Actualiza el perfil de un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} profileData - Datos a actualizar
 */
export const updateProfile = async (userId, profileData) => {
  try {
    const response = await axios.put(`/api/usuarios/${userId}`, profileData);
    return response?.data ?? response;
  } catch (error) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || 'Error al actualizar perfil',
      data: error.response?.data
    };
  }
};

/**
 * Sube o reemplaza la imagen de perfil usando FormData
 * @param {string} userId - ID del usuario
 * @param {File} file - Archivo de imagen
 */
export const uploadProfileImage = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file); // Multer (req.file)
    
    const response = await axios.put(`/api/usuarios/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || 'Error al subir imagen',
      data: error.response?.data
    };
  }
};

/**
 * Elimina la imagen de perfil enviando null al backend
 * @param {string} userId - ID del usuario
 */
export const deleteProfileImage = async (userId) => {
  try {
    const response = await axios.put(`/api/usuarios/${userId}`, { imagen: null });
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || 'Error al eliminar imagen',
      data: error.response?.data
    };
  }
};

/**
 * Cambia la contraseña del usuario (Endpoint dedicado de Auth)
 */
export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await axios.post('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.message || 'Error al cambiar contraseña',
      data: error.response?.data
    };
  }
};

export const getMe = async () => {
  try {
    const response = await axios.get('/api/auth/me');
    return response?.data ?? response; 
  } catch (error) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.message || 'Error al obtener perfil',
      data: error.response?.data
    };
  }
};

export const profileService = {
  getProfile,
  getMe,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
  changePassword
};