'use client';

/**
 * InterviewForm - Formulario para crear/editar entrevistas
 * Incluye YouTube embed, repeater para puntos clave, y extracción automática de video ID
 */

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Eye, Plus, Trash2, Youtube } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  color_hex: string;
}

interface KeyPoint {
  id: string;
  text: string;
}

interface InterviewFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function InterviewForm({ initialData, isEditing = false }: InterviewFormProps) {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState(initialData?.youtube_video_id || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>(
    initialData?.key_points || []
  );
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || '');

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[áäà]/g, 'a')
        .replace(/[éëè]/g, 'e')
        .replace(/[íïì]/g, 'i')
        .replace(/[óöò]/g, 'o')
        .replace(/[úüù]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [title, isEditing]);

  // Extract YouTube video ID from URL
  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Handle YouTube URL input
  useEffect(() => {
    if (youtubeUrl) {
      const videoId = extractYoutubeId(youtubeUrl);
      if (videoId) {
        setYoutubeVideoId(videoId);
      }
    }
  }, [youtubeUrl]);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingData(true);
    try {
      const response = await fetch('/api/admin/entrevistas/categorias');
      if (response.ok) {
        const result = await response.json();
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Key points handlers
  const addKeyPoint = () => {
    setKeyPoints([...keyPoints, { id: Date.now().toString(), text: '' }]);
  };

  const updateKeyPoint = (id: string, text: string) => {
    setKeyPoints(keyPoints.map(kp => kp.id === id ? { ...kp, text } : kp));
  };

  const removeKeyPoint = (id: string) => {
    setKeyPoints(keyPoints.filter(kp => kp.id !== id));
  };

  // Form submission
  const handleSubmit = async (e: FormEvent, shouldPublish = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isEditing
        ? `/api/admin/entrevistas/${initialData.id}`
        : `/api/admin/entrevistas/${Date.now()}`;

      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        title,
        slug,
        description,
        youtube_video_id: youtubeVideoId,
        category_id: categoryId || null,
        status: shouldPublish ? 'published' : status,
        key_points: keyPoints.filter(kp => kp.text.trim()),
        meta_title: metaTitle,
        meta_description: metaDescription
      };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Error al guardar entrevista');
      }

      router.push('/admin/entrevistas?created=true');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la entrevista');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-form-layout">
        {/* Main Content */}
        <div className="admin-form-main">
          {/* Basic Info Section */}
          <div className="admin-form-section">
            <h2 className="admin-form-section__title">Información Básica</h2>

            <div className="admin-form-group">
              <label htmlFor="title" className="admin-form-label">
                Título de la Entrevista
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="admin-form-input"
                required
                placeholder="Ej: Entrevista con John Doe sobre ETFs sostenibles"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="slug" className="admin-form-label">
                Slug (URL)
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="admin-form-input admin-form-input--mono"
                required
                placeholder="entrevista-john-doe-etfs-sostenibles"
              />
              <p className="admin-form-help">
                URL: /entrevistas/{slug || 'slug-aqui'}
              </p>
            </div>

            <div className="admin-form-group">
              <label htmlFor="description" className="admin-form-label">
                Descripción
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="admin-form-textarea"
                rows={4}
                placeholder="Breve descripción de la entrevista..."
              />
            </div>
          </div>

          {/* YouTube Section */}
          <div className="admin-form-section">
            <h2 className="admin-form-section__title">
              <Youtube className="w-5 h-5" />
              Video de YouTube
            </h2>

            <div className="admin-form-group">
              <label htmlFor="youtubeUrl" className="admin-form-label">
                URL de YouTube
              </label>
              <input
                id="youtubeUrl"
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="admin-form-input"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="admin-form-help">
                Pega la URL del video de YouTube y el ID se extraerá automáticamente
              </p>
            </div>

            {youtubeVideoId && (
              <>
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    ID del Video (auto-extraído)
                  </label>
                  <input
                    type="text"
                    value={youtubeVideoId}
                    onChange={(e) => setYoutubeVideoId(e.target.value)}
                    className="admin-form-input admin-form-input--mono"
                    placeholder="dQw4w9WgXcQ"
                  />
                </div>

                {/* YouTube Embed Preview */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Vista Previa</label>
                  <div className="aspect-video bg-slate-100 rounded overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                      title="YouTube video preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Key Points Section (Resumen Exprés) */}
          <div className="admin-form-section">
            <h2 className="admin-form-section__title">Puntos Clave (Resumen Exprés)</h2>

            <div className="space-y-3">
              {keyPoints.map((kp, index) => (
                <div key={kp.id} className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-slate-100 rounded text-sm font-semibold text-slate-600">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={kp.text}
                    onChange={(e) => updateKeyPoint(kp.id, e.target.value)}
                    className="admin-form-input flex-1"
                    placeholder="Punto clave de la entrevista..."
                  />
                  <button
                    type="button"
                    onClick={() => removeKeyPoint(kp.id)}
                    className="admin-action-btn admin-action-btn--delete"
                    title="Eliminar punto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addKeyPoint}
              className="btn btn-secondary mt-3"
            >
              <Plus className="w-4 h-4" />
              Agregar Punto Clave
            </button>
          </div>

          {/* SEO Section */}
          <div className="admin-form-section--compact">
            <h2 className="admin-form-section__title">SEO</h2>

            <div className="admin-form-group">
              <label htmlFor="metaTitle" className="admin-form-label">
                Meta Title
              </label>
              <input
                id="metaTitle"
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="admin-form-input"
                maxLength={60}
                placeholder={title || 'Título SEO'}
              />
              <p className="admin-form-help">
                {metaTitle.length}/60 caracteres
              </p>
            </div>

            <div className="admin-form-group">
              <label htmlFor="metaDescription" className="admin-form-label">
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="admin-form-textarea"
                maxLength={160}
                rows={3}
                placeholder={description || 'Descripción SEO'}
              />
              <p className="admin-form-help">
                {metaDescription.length}/160 caracteres
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="admin-form-sidebar">
          {/* Publish Options */}
          <div className="admin-form-section--compact">
            <h2 className="admin-form-section__title">Publicación</h2>

            <div className="admin-form-group">
              <label htmlFor="status" className="admin-form-label">
                Estado
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="admin-form-select"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label htmlFor="category" className="admin-form-label">
                Categoría
              </label>
              {loadingData ? (
                <div className="admin-form-help">Cargando...</div>
              ) : (
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="admin-form-select"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="admin-form-actions">
        <div className="admin-form-actions__group">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-ghost"
            disabled={loading}
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>

        <div className="admin-form-actions__right">
          {!isEditing && status === 'draft' && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, true)}
              disabled={loading}
              className="btn btn-secondary"
            >
              <Eye className="w-4 h-4" />
              Publicar Ahora
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </form>
  );
}
