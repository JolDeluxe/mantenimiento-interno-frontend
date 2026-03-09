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
    <div className="flex flex-col items-center gap-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative w-28 h-28 rounded-full overflow-hidden cursor-pointer
          border-4 transition-all shadow-sm bg-gray-50
          ${isDragging 
            ? 'border-marca-primario scale-105' 
            : 'border-gray-100 hover:border-marca-primario'
          }
        `}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <Spinner size="md" />
          </div>
        )}

        {preview ? (
          <img src={preview} alt={nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="person" size="lg" className="text-gray-300 text-5xl" />
          </div>
        )}

        {!loading && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
            <Icon name="photo_camera" size="md" className="text-white drop-shadow-md" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg, image/png, image/webp"
        onChange={(e) => handleFileChange(e.target.files?.[0])}
        className="hidden"
      />

      <div className="flex gap-2">
        <button
          onClick={handleClick}
          disabled={loading}
          className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md bg-marca-primario text-white hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {preview ? 'Cambiar' : 'Subir'} Foto
        </button>

        {preview && (
          <button
            onClick={onDelete}
            disabled={loading}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-all"
          >
            Eliminar
          </button>
        )}
      </div>

      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider text-center">
        JPG, PNG o WebP. Max 5MB.<br/>
        {isDragging && <span className="text-marca-primario">Suelta para cargar</span>}
      </p>
    </div>
  );
};