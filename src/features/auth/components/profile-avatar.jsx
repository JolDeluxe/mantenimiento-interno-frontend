import React, { useState, useRef, useEffect } from 'react';
import { Icon, Spinner } from '@/components/ui/z_index';

export const ProfileAvatar = ({ 
  imagen, 
  nombre,
  onUpload,
  onDelete,
  loading = false 
}) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(imagen);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setPreview(imagen);
  }, [imagen]);

  const handleFileChange = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    await onUpload(file);
  };

  const handleClick = () => fileInputRef.current?.click();
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      
      {/* 1. Contenedor Principal del Avatar */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden cursor-pointer
          ring-4 ring-offset-4 transition-all duration-300 shrink-0 group
          ${isDragging 
            ? 'ring-marca-primario scale-105 shadow-2xl' 
            : 'ring-gray-50 hover:ring-marca-primario/20 shadow-md'
          }
        `}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-20">
            <Spinner size="md" />
          </div>
        )}

        {preview ? (
          <img src={preview} alt={nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
            <Icon name="person" className="text-gray-400 text-6xl" />
          </div>
        )}

        {/* 2. Overlay Interactivo al hacer Hover (Solo para Actualizar) */}
        {!loading && (
          <div className="absolute inset-0 bg-gray-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <Icon name="photo_camera" size="md" className="text-white drop-shadow-md mb-1" />
            <span className="text-white text-[10px] font-extrabold tracking-widest uppercase drop-shadow-md">
              {isDragging ? 'Soltar' : 'Actualizar'}
            </span>
          </div>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg, image/png, image/webp"
        onChange={(e) => handleFileChange(e.target.files?.[0])}
        className="hidden"
      />

      {/* 3. Acción Secundaria y Sutil para Eliminar */}
      {preview && !loading && (
        <button
          onClick={onDelete}
          className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors px-2 py-1 mt-1"
        >
          Remover foto
        </button>
      )}

    </div>
  );
};