'use client';

/**
 * BannerImageUpload - Componente para subir imágenes de banners publicitarios
 * Sube a Supabase Storage bucket 'public/banners'
 */

import { useState, useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface BannerImageUploadProps {
  currentImageUrl: string | null;
  onImageChange: (url: string) => void;
  campaignName?: string;
}

export default function BannerImageUpload({
  currentImageUrl,
  onImageChange,
  campaignName
}: BannerImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validations
    const maxSize = 5 * 1024 * 1024; // 5MB para banners
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      setError('Formato no válido. Usa JPG, PNG, WebP o GIF');
      return;
    }

    if (file.size > maxSize) {
      setError('La imagen no debe superar 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const safeCampaignName = (campaignName || 'banner')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .substring(0, 50);
      const fileName = `${safeCampaignName}-${Date.now()}.${fileExt}`;
      const filePath = `media/${fileName}`;

      console.log('Uploading to Supabase Storage:', { fileName, filePath, fileSize: file.size });

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);

        // Mensajes de error más específicos
        if (uploadError.message?.includes('Bucket not found')) {
          throw new Error('El bucket de almacenamiento no está configurado. Por favor contacta al administrador.');
        }
        if (uploadError.message?.includes('not allowed')) {
          throw new Error('No tienes permisos para subir archivos. Verifica que estés autenticado.');
        }
        if (uploadError.message?.includes('size')) {
          throw new Error('La imagen excede el tamaño máximo permitido (5MB).');
        }

        throw new Error(uploadError.message || 'Error al subir la imagen');
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', publicUrl);

      setPreviewUrl(publicUrl);
      onImageChange(publicUrl);

    } catch (err: any) {
      console.error('Error uploading banner image:', err);

      // Error de red o bloqueado
      if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        setError('Error de conexión. Verifica:\n1. Tu conexión a internet\n2. Que no tengas bloqueadores de anuncios activos\n3. Que Supabase esté configurado correctamente');
      } else {
        setError(err.message || 'Error al subir la imagen');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="banner-image-upload">
      {/* Preview */}
      <div className="banner-image-upload__preview">
        {previewUrl ? (
          <div className="banner-image-upload__image-container">
            <img
              src={previewUrl}
              alt="Banner preview"
              className="banner-image-upload__image"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="banner-image-upload__remove"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="banner-image-upload__placeholder">
            <ImageIcon className="w-12 h-12 text-slate-400" />
            <p className="text-sm text-slate-500 mt-2">
              Sin imagen seleccionada
            </p>
          </div>
        )}
      </div>

      {/* Upload button and info */}
      <div className="banner-image-upload__actions">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="banner-image-upload__input"
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="btn btn-secondary"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Subiendo...' : previewUrl ? 'Cambiar Imagen' : 'Subir Imagen'}
        </button>
        <p className="banner-image-upload__help">
          JPG, PNG, WebP o GIF (máx. 5MB)
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="banner-image-upload__error">
          {error}
        </div>
      )}
    </div>
  );
}
