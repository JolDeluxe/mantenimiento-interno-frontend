// src/features/common/forms/tareas/fields/ImageUploadField.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Icon } from '@/components/ui/z_index';
import { Label } from '@/components/form/z_index';
import { validateImages } from '../validation';

export const ImageUploadField = ({
    imagenes = [],
    onChange,
    maxImages = 3,
    maxSizeMB = 20,
    disabled = false,
    error,
    className = '',
}) => {
    const fileInputRef = useRef(null);
    const [localError, setLocalError] = useState('');

    // Previews locales en memoria
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        const validFiles = (imagenes || []).filter((f) => f instanceof Blob || f instanceof File);
        const objectUrls = validFiles.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setPreviews(objectUrls);

        return () => {
            objectUrls.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, [imagenes]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;

        const nextFiles = [...imagenes, ...selectedFiles];

        const validationErr = validateImages(nextFiles, { maxImages, maxSizeMB });
        if (validationErr) {
            setLocalError(validationErr);
            e.target.value = '';
            return;
        }

        setLocalError('');
        onChange(nextFiles);
        e.target.value = '';
    };

    const handleRemoveImage = (indexToRemove) => {
        setLocalError('');
        const updated = imagenes.filter((_, idx) => idx !== indexToRemove);
        onChange(updated);
    };

    const hasReachedMax = imagenes.length >= maxImages;
    const displayedError = error || localError;

    return (
        <div className={`flex flex-col gap-1.5${className ? ` ${className}` : ''}`}>
            <div className="flex items-center justify-between">
                <Label error={Boolean(displayedError)}>
                    Evidencia Fotográfica <span className="text-[11px] font-normal text-slate-400 font-sans">(Opcional)</span>
                </Label>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-full">
                    {imagenes.length} / {maxImages}
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                {!hasReachedMax && !disabled && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled}
                        className="w-16 h-16 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100 hover:border-marca-secundario text-slate-500 hover:text-marca-secundario transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed group shadow-2xs"
                        aria-label="Adjuntar fotos"
                        title="Adjuntar fotos (Cámara o Galería)"
                    >
                        <Icon name="add_a_photo" size="sm" className="group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-bold leading-tight">Agregar</span>
                    </button>
                )}

                {previews.map((item, idx) => (
                    <div
                        key={idx}
                        className="relative w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden group shrink-0 shadow-2xs"
                    >
                        <img
                            src={item.url}
                            alt={`evidencia-${idx + 1}`}
                            className="w-full h-full object-cover"
                        />
                        {!disabled && (
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-1 right-1 w-5 h-5 bg-white/90 hover:bg-white text-rose-500 rounded-full flex items-center justify-center shadow-sm opacity-90 hover:opacity-100 transition-all cursor-pointer"
                                aria-label={`Quitar imagen ${idx + 1}`}
                            >
                                <Icon name="close" size="xs" className="scale-75" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,.heic,.heif"
                multiple
                disabled={disabled}
                onChange={handleFileChange}
            />

            {displayedError && (
                <p className="text-xs font-semibold text-rose-600 mt-0.5">
                    {displayedError}
                </p>
            )}
        </div>
    );
};
