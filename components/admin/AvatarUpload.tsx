'use client';

import { useState, useRef } from 'react';
import { Upload, X, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  onAvatarChange: (url: string) => void;
  agentSlug?: string;
}

export default function AvatarUpload({ currentAvatarUrl, onAvatarChange, agentSlug }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validations
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      setError('Formato no válido. Usa JPG, PNG, WebP o GIF');
      return;
    }

    if (file.size > maxSize) {
      setError('La imagen no debe superar 2MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${agentSlug || 'agent'}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onAvatarChange(publicUrl);

    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(err.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    onAvatarChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="admin-avatar-upload">
      {/* Preview */}
      <div className="admin-avatar-upload__preview">
        {previewUrl ? (
          <div className="admin-avatar-upload__image-container">
            <img
              src={previewUrl}
              alt="Avatar preview"
              className="admin-avatar-upload__image"
            />
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="admin-avatar-upload__remove"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="admin-avatar-upload__placeholder">
            <User className="w-12 h-12 text-slate-400" />
          </div>
        )}
      </div>

      {/* Upload button */}
      <div className="admin-avatar-upload__actions">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="admin-avatar-upload__input"
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="btn btn--secondary btn--sm"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Subiendo...' : 'Subir Avatar'}
        </button>
        <p className="admin-avatar-upload__help">
          JPG, PNG, WebP o GIF (máx. 2MB)
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="admin-avatar-upload__error">
          {error}
        </div>
      )}
    </div>
  );
}
