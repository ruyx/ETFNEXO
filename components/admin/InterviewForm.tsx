'use client';

/**
 * InterviewForm - Formulario para crear/editar entrevistas
 * Incluye YouTube embed, editor de resumen (excerpt), y extracción automática de video ID
 */

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Eye, Youtube, Plus, Trash2, HelpCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import CategoryManager from '@/components/admin/CategoryManager';

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface FAQ {
  question: string;
  answer: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color_hex: string;
}

interface InterviewFormProps {
  initialData?: any;
  isEditing?: boolean;
  onSubmit?: (data: any) => Promise<void>;
}

export default function InterviewForm({ initialData, isEditing = false, onSubmit }: InterviewFormProps) {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [faqs, setFaqs] = useState<FAQ[]>(initialData?.faq || []);
  const [videoProvider, setVideoProvider] = useState<'youtube' | 'custom'>(initialData?.video_provider || 'youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState(initialData?.youtube_video_id || '');
  const [customIframeCode, setCustomIframeCode] = useState(initialData?.custom_iframe_code || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || '');

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Quill modules configuration
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  }), []);

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'align', 'link', 'blockquote', 'code-block'
  ];

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

  // FAQ handlers
  const addFaq = () => {
    setFaqs(prev => [...prev, { question: '', answer: '' }]);
  };

  const updateFaqQuestion = (index: number, question: string) => {
    setFaqs(prev => prev.map((faq, i) => i === index ? { ...faq, question } : faq));
  };

  const updateFaqAnswer = (index: number, answer: string) => {
    setFaqs(prev => prev.map((faq, i) => i === index ? { ...faq, answer } : faq));
  };

  const removeFaq = (index: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e: FormEvent, shouldPublish = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const interviewData = {
        title,
        slug,
        description,
        faq: faqs.filter(faq => faq.question.trim() && faq.answer.trim()),
        video_provider: videoProvider,
        youtube_video_id: videoProvider === 'youtube' ? youtubeVideoId : null,
        custom_iframe_code: videoProvider === 'custom' ? customIframeCode : null,
        category_id: categoryId || null,
        status: shouldPublish ? 'published' : status,
        meta_title: metaTitle || title,
        meta_description: metaDescription || description
      };

      // Si se proporciona onSubmit, usarlo (para páginas que manejan submit externamente)
      if (onSubmit) {
        await onSubmit(interviewData);
      } else {
        // Fallback a comportamiento antiguo
        const endpoint = isEditing
          ? `/api/admin/entrevistas/${initialData.id}`
          : `/api/admin/entrevistas/${Date.now()}`;

        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(interviewData)
        });

        if (!response.ok) {
          throw new Error('Error al guardar entrevista');
        }

        router.push('/admin/entrevistas?created=true');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la entrevista');
      throw error; // Re-throw para que la página maneje el error
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="admin-form admin-form--grid">
      {/* SIDEBAR - Opciones de publicación */}
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

          <CategoryManager
            categories={categories}
            selectedCategoryId={categoryId}
            onCategoryChange={setCategoryId}
            onCategoriesUpdate={loadCategories}
            apiEndpoint="/api/admin/entrevistas/categorias"
            loading={loadingData}
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
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
                className="admin-form-input"
                style={{ fontFamily: 'monospace' }}
                required
                placeholder="entrevista-john-doe-etfs-sostenibles"
              />
              <p className="admin-form-hint">
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
                className="admin-form-input admin-form-input--textarea"
                rows={4}
                placeholder="Breve descripción de la entrevista..."
              />
            </div>
          </div>

          {/* Video Section */}
          <div className="admin-form-section">
            <h2 className="admin-form-section__title">
              <Youtube className="w-5 h-5" />
              Video de la Entrevista
            </h2>

            {/* Selector de proveedor */}
            <div className="admin-form-group">
              <label htmlFor="videoProvider" className="admin-form-label">
                Tipo de Video
              </label>
              <select
                id="videoProvider"
                value={videoProvider}
                onChange={(e) => setVideoProvider(e.target.value as 'youtube' | 'custom')}
                className="admin-form-select"
              >
                <option value="youtube">YouTube</option>
                <option value="custom">Iframe Personalizado</option>
              </select>
            </div>

            {/* YouTube Fields */}
            {videoProvider === 'youtube' && (
              <>
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
                  <p className="admin-form-hint">
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
                        className="admin-form-input"
                        style={{ fontFamily: 'monospace' }}
                        placeholder="dQw4w9WgXcQ"
                      />
                    </div>

                    {/* YouTube Embed Preview */}
                    <div className="admin-form-group">
                      <label className="admin-form-label">Vista Previa</label>
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        paddingBottom: '56.25%',
                        background: 'var(--color-slate-100)',
                        borderRadius: 'var(--btn-radius)',
                        overflow: 'hidden'
                      }}>
                        <iframe
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0
                          }}
                          src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                          title="YouTube video preview"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Custom Iframe Fields */}
            {videoProvider === 'custom' && (
              <>
                <div className="admin-form-group">
                  <label htmlFor="customIframe" className="admin-form-label">
                    Código HTML del Iframe
                  </label>
                  <textarea
                    id="customIframe"
                    value={customIframeCode}
                    onChange={(e) => setCustomIframeCode(e.target.value)}
                    className="admin-form-input admin-form-input--textarea"
                    style={{ fontFamily: 'monospace', minHeight: '150px' }}
                    rows={8}
                    placeholder='<iframe src="..." width="100%" height="500" ...></iframe>'
                  />
                  <p className="admin-form-hint">
                    Pega el código completo del iframe (Vimeo, Wistia, Loom, etc.)
                  </p>
                </div>

                {/* Custom Iframe Preview */}
                {customIframeCode && (
                  <div className="admin-form-group">
                    <label className="admin-form-label">Vista Previa</label>
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      minHeight: '300px',
                      background: 'var(--color-slate-100)',
                      borderRadius: 'var(--btn-radius)',
                      overflow: 'hidden',
                      padding: 'var(--spacing-4)'
                    }}>
                      <div dangerouslySetInnerHTML={{ __html: customIframeCode }} />
                    </div>
                    <p className="admin-form-hint" style={{ color: 'var(--color-warning)', marginTop: 'var(--spacing-2)' }}>
                      ⚠️ Asegúrate de que el código iframe proviene de una fuente confiable
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* FAQ Section - Resumen Exprés */}
          <div className="admin-form-section--compact">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <HelpCircle className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <h2 className="admin-form-section__title" style={{ marginBottom: 0 }}>
                  Resumen Exprés (FAQ)
                </h2>
              </div>
              <button
                type="button"
                onClick={addFaq}
                className="btn btn-secondary btn-sm"
              >
                <Plus className="w-4 h-4" />
                Agregar Pregunta
              </button>
            </div>

            <p className="admin-form-help" style={{ marginBottom: 'var(--spacing-4)' }}>
              Preguntas y respuestas clave sobre ETFs. Optimizado para SEO y motores de IA.
            </p>

            {faqs.length === 0 ? (
              <div className="article-form-faq-empty">
                <HelpCircle className="w-12 h-12" />
                <p>Sin preguntas frecuentes</p>
                <p className="admin-form-help">
                  Agrega preguntas y respuestas para el resumen exprés de la entrevista
                </p>
              </div>
            ) : (
              <div className="article-form-faq-list">
                {faqs.map((faq, index) => (
                  <div key={index} className="article-form-faq-item">
                    <div className="article-form-faq-item__header">
                      <span className="article-form-faq-item__number">
                        Pregunta {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFaq(index)}
                        className="article-form-faq-item__remove"
                        title="Eliminar pregunta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label admin-form-label--required">
                        Pregunta
                      </label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaqQuestion(index, e.target.value)}
                        className="admin-form-input"
                        placeholder="¿Cuál es...?"
                        required={faqs.length > 0}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label admin-form-label--required">
                        Respuesta
                      </label>
                      <div className="article-form-editor">
                        <ReactQuill
                          theme="snow"
                          value={faq.answer}
                          onChange={(value) => updateFaqAnswer(index, value)}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Escribe la respuesta..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <p className="admin-form-hint">
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
                className="admin-form-input admin-form-input--textarea"
                maxLength={160}
                rows={3}
                placeholder={description || 'Descripción SEO'}
              />
              <p className="admin-form-hint">
                {metaDescription.length}/160 caracteres
              </p>
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
            {loading ? 'Guardando...' : isEditing ? 'Actualizar Entrevista' : 'Crear Entrevista'}
          </button>
        </div>
      </div>
    </form>
  );
}
