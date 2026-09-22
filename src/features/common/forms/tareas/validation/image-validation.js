// src/features/common/forms/tareas/validation/image-validation.js

const MAX_IMAGE_SIZE_MB = 20;
const HEIC_EXT_PATTERN = /\.(heic|heif)$/i;

/**
 * Valida una lista de archivos de imagen para carga de evidencias.
 * 
 * @param {File[]} [files] - Lista de archivos a validar
 * @param {object} [options] - Opciones de configuración
 * @param {number} [options.maxImages=3] - Cantidad máxima de imágenes permitidas
 * @param {number} [options.maxSizeMB=20] - Tamaño máximo por archivo en MB
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const validateImages = (files, { maxImages = 3, maxSizeMB = MAX_IMAGE_SIZE_MB } = {}) => {
    if (!files || files.length === 0) {
        return null;
    }

    if (files.length > maxImages) {
        return `Solo puedes adjuntar un máximo de ${maxImages} imágenes.`;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (const file of files) {
        if (!file) continue;

        const isImage = file.type?.startsWith('image/') || HEIC_EXT_PATTERN.test(file.name || '');
        if (!isImage) {
            return 'Solo se permiten archivos de imagen (JPEG, PNG, WEBP, HEIC).';
        }

        if (file.size > maxSizeBytes) {
            return `Cada imagen debe pesar máximo ${maxSizeMB} MB. El archivo "${file.name}" supera este límite.`;
        }
    }

    return null;
};
