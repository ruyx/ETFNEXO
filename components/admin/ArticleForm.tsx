'use client';

/**
 * ArticleForm - Formulario moderno para crear/editar artículos
 * Layout 2 columnas con editores WYSIWYG
 */

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Eye, Upload, Tag as TagIcon, Image as ImageIcon, Plus, Trash2, HelpCircle, Search, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import CategoryManager from '@/components/admin/CategoryManager';

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Category {
  id: string;
  name: string;
  slug: string;
  color_hex: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Agent {
  id: string;
  name: string;
  slug: string;
  display_name: string;
  email: string;
  signature: string;
}

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ArticleFormProps {
  initialData?: {
    id?: string;
    title: string;
    slug?: string;
    excerpt?: string;
    content: string;
    category_id?: string;
    author_id?: string;
    author_name?: string;
    author_email?: string;
    meta_title?: string;
    meta_description?: string;
    featured_image_url?: string;
    featured_image_alt?: string;
    source_name?: string;
    source_url?: string;
    status?: 'draft' | 'published' | 'archived';
    tags?: Tag[];
    relatedEtfs?: string[];
    faq?: FAQ[];
  };
  onSubmit: (data: any) => Promise<void>;
  isEditing?: boolean;
}

export default function ArticleForm({ initialData, onSubmit, isEditing = false }: ArticleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Categorías y etiquetas disponibles
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Agentes y usuario actual
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authorType, setAuthorType] = useState<'ai_agent' | 'current_user'>('current_user');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags?.map(t => t.id) || []
  );
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || '');
  const [featuredImageUrl, setFeaturedImageUrl] = useState(initialData?.featured_image_url || '');
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featured_image_alt || '');
  const [sourceName, setSourceName] = useState(initialData?.source_name || '');
  const [sourceUrl, setSourceUrl] = useState(initialData?.source_url || '');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(initialData?.status || 'draft');
  const [pinned, setPinned] = useState<boolean>((initialData as any)?.pinned || false);
  const [faqs, setFaqs] = useState<FAQ[]>(initialData?.faq || []);

  // Image upload and Pexels states
  const [uploading, setUploading] = useState(false);
  const [showPexelsModal, setShowPexelsModal] = useState(false);
  const [pexelsQuery, setPexelsQuery] = useState('');
  const [pexelsResults, setPexelsResults] = useState<any[]>([]);
  const [pexelsLoading, setPexelsLoading] = useState(false);

  // Control body overflow when modal is open
  useEffect(() => {
    if (showPexelsModal) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, [showPexelsModal]);

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

  // Cargar datos al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);

        const [categoriesRes, tagsRes, agentsRes, userRes] = await Promise.all([
          fetch('/api/admin/categorias'),
          fetch('/api/admin/etiquetas'),
          fetch('/api/admin/agentes'),
          fetch('/api/me')
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data.categories || []);
        }

        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setAvailableTags(tagsData.data.tags || []);
        }

        if (agentsRes.ok) {
          const agentsData = await agentsRes.json();
          // Filtrar solo agentes redactores (para noticias)
          const allAgents = agentsData.data.agents || [];
          const redactorAgents = allAgents.filter((agent: any) => agent.agent_type === 'redactor');
          setAvailableAgents(redactorAgents);
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData.data.user);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Initialize author type when editing article with AI agent author
  useEffect(() => {
    if (initialData?.author_id) {
      setAuthorType('ai_agent');
      setSelectedAgentId(initialData.author_id);
    }
  }, [initialData]);

  // Function to reload categories after CRUD operations
  const loadCategories = async () => {
    try {
      const categoriesRes = await fetch('/api/admin/categorias');
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.data.categories || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
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

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const data = await response.json();
      setFeaturedImageUrl(data.url);
      setFeaturedImageAlt(file.name.replace(/\.[^/.]+$/, ''));
    } catch (err: any) {
      alert(err.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  // Search Pexels images
  const searchPexels = async () => {
    if (!pexelsQuery.trim()) return;

    setPexelsLoading(true);
    try {
      const response = await fetch(
        `/api/pexels/search?query=${encodeURIComponent(pexelsQuery)}&per_page=12`
      );

      if (!response.ok) {
        throw new Error('Failed to search images');
      }

      const data = await response.json();
      setPexelsResults(data.photos);
    } catch (err: any) {
      alert(err.message || 'Error al buscar imágenes');
    } finally {
      setPexelsLoading(false);
    }
  };

  // Select Pexels image
  const selectPexelsImage = (photo: any) => {
    setFeaturedImageUrl(photo.url);
    setFeaturedImageAlt(photo.alt);
    setShowPexelsModal(false);
    setPexelsQuery('');
    setPexelsResults([]);
  };

  const handleSubmit = async (e: FormEvent, publishNow: boolean = false) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const articleData: any = {
        title,
        slug: slug || undefined,
        excerpt: excerpt || undefined,
        content,
        category_id: categoryId || undefined,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt || undefined,
        featured_image_url: featuredImageUrl || undefined,
        featured_image_alt: featuredImageAlt || undefined,
        source_name: sourceName || undefined,
        source_url: sourceUrl || undefined,
        status: publishNow ? 'published' : status,
        pinned,
        tags: selectedTags,
        faq: faqs.filter(faq => faq.question.trim() && faq.answer.trim())
      };

      // Determinar autor según tipo seleccionado
      if (authorType === 'ai_agent' && selectedAgentId) {
        articleData.author_id = selectedAgentId;
        articleData.author_name = null;
        articleData.author_email = null;
      } else if (authorType === 'current_user' && currentUser) {
        articleData.author_id = null;
        articleData.author_name = currentUser.name;
        articleData.author_email = currentUser.email;
      }

      await onSubmit(articleData);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el artículo');
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={(e) => handleSubmit(e, false)} className="admin-form admin-form--grid">
      {/* SIDEBAR - Imagen destacada + Metadata + Opciones */}
      <div className="admin-form-sidebar">
        {/* Featured Image Card */}
        <div className="admin-form-section--compact">
          <h2 className="admin-form-section__title">Imagen Destacada</h2>

          {featuredImageUrl && (
            <div className="article-form-image-preview">
              <img
                src={featuredImageUrl}
                alt={featuredImageAlt || 'Preview'}
                className="article-form-image-preview__img"
              />
              <button
                type="button"
                onClick={() => setFeaturedImageUrl('')}
                className="article-form-image-preview__remove"
              >
                ×
              </button>
            </div>
          )}

          {!featuredImageUrl && (
            <div className="article-form-image-placeholder">
              <ImageIcon className="w-12 h-12" />
              <p>Sin imagen</p>
            </div>
          )}

          {/* Image Upload and Search Buttons */}
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' }}>
            <label className="btn btn-secondary" style={{ flex: 1, cursor: 'pointer' }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <Upload className="w-4 h-4" />
              {uploading ? 'Subiendo...' : 'Subir'}
            </label>
            <button
              type="button"
              onClick={() => setShowPexelsModal(true)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
              disabled={uploading}
            >
              <Search className="w-4 h-4" />
              Pexels
            </button>
          </div>

          <div className="admin-form-group" style={{ marginTop: 'var(--spacing-4)' }}>
            <label htmlFor="featured_image_url" className="admin-form-label">
              URL de imagen
            </label>
            <input
              type="url"
              id="featured_image_url"
              value={featuredImageUrl}
              onChange={(e) => setFeaturedImageUrl(e.target.value)}
              className="admin-form-input"
              placeholder="https://..."
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="featured_image_alt" className="admin-form-label">
              Texto alternativo
            </label>
            <input
              type="text"
              id="featured_image_alt"
              value={featuredImageAlt}
              onChange={(e) => setFeaturedImageAlt(e.target.value)}
              className="admin-form-input"
              placeholder="Descripción"
            />
          </div>
        </div>

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
            <label className="admin-form-label">
              Categoría
            </label>
            <CategoryManager
              categories={categories}
              selectedCategoryId={categoryId}
              onCategoryChange={setCategoryId}
              onCategoriesUpdate={loadCategories}
              apiEndpoint="/api/admin/categorias"
              loading={loadingData}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="slug" className="admin-form-label">
              Slug (URL)
            </label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="admin-form-input"
              placeholder="Auto-generado"
            />
            <p className="admin-form-help">
              /noticias/{slug || '...'}
            </p>
          </div>
        </div>

        {/* SEO Metadata */}
        <div className="admin-form-section--compact">
          <h2 className="admin-form-section__title">SEO</h2>

          <div className="admin-form-group">
            <label htmlFor="meta_title" className="admin-form-label">
              Título SEO
            </label>
            <input
              type="text"
              id="meta_title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="admin-form-input"
              placeholder="Usa el título principal"
            />
            <p className="admin-form-help">
              {metaTitle.length} / 60 caracteres
            </p>
          </div>

          <div className="admin-form-group">
            <label htmlFor="meta_description" className="admin-form-label">
              Descripción SEO
            </label>
            <textarea
              id="meta_description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              className="admin-form-input admin-form-input--textarea"
              placeholder="Descripción para buscadores"
            />
            <p className="admin-form-help">
              {metaDescription.length} / 160 caracteres
            </p>
          </div>
        </div>
      </div>

      {/* MAIN - Contenido principal */}
      <div className="admin-form-main">
        {/* Error Message */}
        {error && (
          <div className="admin-alert admin-alert--error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Content Section */}
        <div className="admin-form-section--compact">
          <h2 className="admin-form-section__title">Contenido</h2>

          <div className="admin-form-group">
            <label htmlFor="title" className="admin-form-label admin-form-label--required">
              Título
            </label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="admin-form-input admin-form-input--large"
              placeholder="Título del artículo"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              Extracto
            </label>
            <div className="article-form-editor">
              <ReactQuill
                theme="snow"
                value={excerpt}
                onChange={setExcerpt}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Breve resumen del artículo..."
              />
            </div>
            <p className="admin-form-help">
              Resumen que aparecerá en listados y redes sociales
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label admin-form-label--required">
              Contenido principal
            </label>
            <div className="article-form-editor article-form-editor--large">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Escribe el contenido del artículo..."
              />
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="admin-form-section--compact">
          <h2 className="admin-form-section__title">Etiquetas</h2>

          {loadingData ? (
            <div className="admin-form-help">Cargando etiquetas...</div>
          ) : (
            <div className="admin-tag-selector">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleTag(tag.id)}
                    className={`admin-tag-button ${
                      isSelected
                        ? 'admin-tag-button--selected'
                        : 'admin-tag-button--unselected'
                    }`}
                  >
                    <TagIcon className="w-3 h-3" />
                    {tag.name}
                  </button>
                );
              })}
              {availableTags.length === 0 && (
                <p className="admin-form-help">
                  No hay etiquetas disponibles
                </p>
              )}
            </div>
          )}
          <p className="admin-form-help" style={{ marginTop: 'var(--spacing-2)' }}>
            {selectedTags.length} seleccionada(s)
          </p>
        </div>

        {/* Author Section */}
        <div className="admin-form-section--compact">
          <h2 className="admin-form-section__title">Autor</h2>

          <div className="admin-form-group">
            <label className="admin-form-label">
              Firmar como
            </label>
            <div className="admin-tag-selector">
              <button
                type="button"
                onClick={() => setAuthorType('current_user')}
                className={`admin-tag-button ${
                  authorType === 'current_user'
                    ? 'admin-tag-button--selected'
                    : 'admin-tag-button--unselected'
                }`}
              >
                Tu perfil
              </button>
              <button
                type="button"
                onClick={() => setAuthorType('ai_agent')}
                className={`admin-tag-button ${
                  authorType === 'ai_agent'
                    ? 'admin-tag-button--selected'
                    : 'admin-tag-button--unselected'
                }`}
              >
                Agente AI
              </button>
            </div>
          </div>

          {authorType === 'ai_agent' && (
            <div className="admin-form-group">
              <label htmlFor="agent_selector" className="admin-form-label admin-form-label--required">
                Seleccionar Agente
              </label>
              {loadingData ? (
                <div className="admin-form-help">Cargando agentes...</div>
              ) : (
                <select
                  id="agent_selector"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="admin-form-select"
                  required={authorType === 'ai_agent'}
                >
                  <option value="">Selecciona un agente</option>
                  {availableAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.display_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Author Preview */}
          <div className="article-form-author-preview">
            {authorType === 'current_user' && currentUser ? (
              <>
                <p className="article-form-author-preview__name">{currentUser.name}</p>
                <p className="article-form-author-preview__email">{currentUser.email}</p>
              </>
            ) : authorType === 'ai_agent' && selectedAgentId ? (
              (() => {
                const selected = availableAgents.find(a => a.id === selectedAgentId);
                return selected ? (
                  <>
                    <p className="article-form-author-preview__name">{selected.display_name}</p>
                    <p className="article-form-author-preview__email">{selected.email}</p>
                    {selected.signature && (
                      <p className="article-form-author-preview__signature">{selected.signature}</p>
                    )}
                  </>
                ) : <p className="admin-form-help">Selecciona un agente</p>;
              })()
            ) : (
              <p className="admin-form-help">Selecciona un autor</p>
            )}
          </div>

          {/* Source (optional) */}
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="source_name" className="admin-form-label">
                Fuente
              </label>
              <input
                type="text"
                id="source_name"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="admin-form-input"
                placeholder="Opcional"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="source_url" className="admin-form-label">
                URL fuente
              </label>
              <input
                type="url"
                id="source_url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="admin-form-input"
                placeholder="https://..."
              />
            </div>
          </div>
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
            Preguntas y respuestas para el resumen rápido. Optimizado para SEO y motores de IA.
          </p>

          {faqs.length === 0 ? (
            <div className="article-form-faq-empty">
              <HelpCircle className="w-12 h-12" />
              <p>Sin preguntas frecuentes</p>
              <p className="admin-form-help">
                Agrega preguntas y respuestas para el resumen exprés del artículo
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

          <p className="admin-form-help" style={{ marginTop: 'var(--spacing-3)' }}>
            {faqs.length} pregunta(s) agregada(s)
          </p>
        </div>
      </div>

      {/* Form Actions - Full width */}
      <div style={{ gridColumn: '1 / -1' }}>
        <div className="admin-form-actions">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="btn btn-secondary"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>

          <div className="admin-form-actions__right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: 'var(--spacing-4)', padding: '8px 16px', border: '1px solid var(--color-slate-200)', borderRadius: '8px', backgroundColor: 'var(--color-slate-50)' }}>
              <label className="admin-form-switch">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                />
                <span className="admin-form-switch-slider"></span>
              </label>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-slate-900)', lineHeight: '1.2' }}>
                  {pinned ? 'Fijado' : 'Fijar al inicio'}
                </div>
              </div>
            </div>
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
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </form>

    {/* Pexels Modal - Outside form for proper z-index stacking */}
    {showPexelsModal && (
      <div className="admin-modal">
        <div className="admin-modal__backdrop" onClick={() => setShowPexelsModal(false)} />
        <div className="admin-modal__content" style={{ maxWidth: '1000px' }}>
          <div className="admin-modal__header">
            <h3 className="admin-modal__title">Buscar Imágenes en Pexels</h3>
            <button
              onClick={() => setShowPexelsModal(false)}
              className="admin-modal__close"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="admin-modal__body">
            {/* Search Bar */}
            <div className="pexels-search">
              <input
                type="text"
                value={pexelsQuery}
                onChange={(e) => setPexelsQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchPexels()}
                placeholder="Buscar imágenes... (ej: finanzas, negocios, tecnología)"
                className="admin-form-input"
              />
              <button
                type="button"
                onClick={searchPexels}
                disabled={pexelsLoading || !pexelsQuery.trim()}
                className="btn btn-primary"
              >
                {pexelsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Buscar
                  </>
                )}
              </button>
            </div>

            {/* Results Grid */}
            {pexelsLoading ? (
              <div className="pexels-loading">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
                <p>Buscando imágenes...</p>
              </div>
            ) : pexelsResults.length > 0 ? (
              <div className="pexels-grid">
                {pexelsResults.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => selectPexelsImage(photo)}
                    className="pexels-card"
                  >
                    <img
                      src={photo.thumbnail}
                      alt={photo.alt}
                    />
                    <div className="pexels-card__info">
                      <span className="pexels-card__photographer">
                        Por {photo.photographer}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : !pexelsLoading && pexelsQuery ? (
              <div className="pexels-empty">
                <ImageIcon className="w-16 h-16" style={{ color: 'var(--color-slate-300)' }} />
                <p>No se encontraron imágenes</p>
                <span>Intenta con otra búsqueda</span>
              </div>
            ) : !pexelsQuery ? (
              <div className="pexels-empty">
                <ImageIcon className="w-16 h-16" style={{ color: 'var(--color-slate-300)' }} />
                <p>Busca imágenes de stock gratis</p>
                <span>Ingresa un término de búsqueda arriba</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
