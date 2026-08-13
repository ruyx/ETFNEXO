'use client';

/**
 * ArticleForm - Formulario reutilizable para crear/editar artículos
 * Sigue el sistema de diseño del proyecto (slate/blue, sin emojis)
 */

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Eye, Upload, Tag as TagIcon } from 'lucide-react';

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

interface ArticleFormProps {
  initialData?: {
    id?: string;
    title: string;
    slug?: string;
    excerpt?: string;
    content: string;
    category_id?: string;
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

  // Cargar datos al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);

        // Cargar categorías, etiquetas, agentes y usuario actual en paralelo
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
          setAvailableAgents(agentsData.data.agents || []);
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

  const handleToggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
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
        tags: selectedTags
      };

      // Determinar autor según tipo seleccionado
      if (authorType === 'ai_agent' && selectedAgentId) {
        // Firmar con agente AI
        articleData.author_id = selectedAgentId;
        articleData.author_name = null;
        articleData.author_email = null;
      } else if (authorType === 'current_user' && currentUser) {
        // Firmar con usuario actual
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
    <form onSubmit={(e) => handleSubmit(e, false)} className="admin-form">
      {/* Error Message */}
      {error && (
        <div className="admin-form-error">
          {error}
        </div>
      )}

      {/* Main Content Section */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">Contenido Principal</h2>

        <div className="admin-form-fields">
          {/* Title */}
          <div className="admin-form-field">
            <label htmlFor="title" className="admin-form-label admin-form-label--required">
              Título
            </label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="admin-form-input"
              placeholder="Título del artículo"
            />
          </div>

          {/* Slug */}
          <div className="admin-form-field">
            <label htmlFor="slug" className="admin-form-label">
              Slug (URL)
            </label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="admin-form-input"
              placeholder="Se generará automáticamente si se deja vacío"
            />
            <p className="admin-form-hint">
              URL amigable del artículo. Dejar vacío para generar automáticamente.
            </p>
          </div>

          {/* Excerpt */}
          <div className="admin-form-field">
            <label htmlFor="excerpt" className="admin-form-label">
              Extracto
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="admin-form-input admin-form-input--textarea"
              placeholder="Breve resumen del artículo (opcional)"
            />
            <p className="admin-form-hint">
              {excerpt.length} caracteres. Recomendado: 150-200.
            </p>
          </div>

          {/* Content */}
          <div className="admin-form-field">
            <label htmlFor="content" className="admin-form-label admin-form-label--required">
              Contenido
            </label>
            <textarea
              id="content"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="admin-form-input admin-form-input--textarea admin-form-input--code"
              placeholder="Contenido del artículo en HTML"
            />
            <p className="admin-form-hint">
              Acepta HTML. {content.length} caracteres.
            </p>
          </div>
        </div>
      </div>

      {/* Category and Tags Section */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">Categoría y Etiquetas</h2>

        <div className="admin-form-fields">
          {/* Category */}
          <div className="admin-form-field">
            <label htmlFor="category" className="admin-form-label">
              Categoría
            </label>
            {loadingData ? (
              <div className="admin-form-hint">Cargando categorías...</div>
            ) : (
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="admin-form-select"
              >
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tags */}
          <div className="admin-form-field">
            <label className="admin-form-label">
              Etiquetas
            </label>
            {loadingData ? (
              <div className="admin-form-hint">Cargando etiquetas...</div>
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
                  <p className="admin-form-hint">
                    No hay etiquetas disponibles. Crea una desde la gestión de etiquetas.
                  </p>
                )}
              </div>
            )}
            <p className="admin-form-hint" style={{ marginTop: 'var(--spacing-2)' }}>
              {selectedTags.length} etiqueta(s) seleccionada(s)
            </p>
          </div>
        </div>
      </div>

      {/* Featured Image Section */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">Imagen Destacada</h2>

        <div className="admin-form-fields">
          {/* Image URL */}
          <div className="admin-form-field">
            <label htmlFor="featured_image_url" className="admin-form-label">
              URL de la imagen
            </label>
            <div className="admin-image-upload-group">
              <input
                type="url"
                id="featured_image_url"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                className="admin-form-input"
                style={{ flex: 1 }}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <button
                type="button"
                className="btn btn-secondary"
              >
                <Upload className="w-4 h-4" />
                Subir
              </button>
            </div>
          </div>

          {/* Image Alt */}
          <div className="admin-form-field">
            <label htmlFor="featured_image_alt" className="admin-form-label">
              Texto alternativo
            </label>
            <input
              type="text"
              id="featured_image_alt"
              value={featuredImageAlt}
              onChange={(e) => setFeaturedImageAlt(e.target.value)}
              className="admin-form-input"
              placeholder="Descripción de la imagen para accesibilidad"
            />
          </div>

          {/* Image Preview */}
          {featuredImageUrl && (
            <div className="admin-image-preview">
              <img
                src={featuredImageUrl}
                alt={featuredImageAlt || 'Preview'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Meta & SEO Section */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">SEO y Metadatos</h2>

        <div className="admin-form-fields">
          {/* Meta Title */}
          <div className="admin-form-field">
            <label htmlFor="meta_title" className="admin-form-label">
              Título SEO
            </label>
            <input
              type="text"
              id="meta_title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="admin-form-input"
              placeholder="Se usará el título principal si se deja vacío"
            />
            <p className="admin-form-hint">
              {metaTitle.length} caracteres. Óptimo: 50-60.
            </p>
          </div>

          {/* Meta Description */}
          <div className="admin-form-field">
            <label htmlFor="meta_description" className="admin-form-label">
              Descripción SEO
            </label>
            <textarea
              id="meta_description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              className="admin-form-input admin-form-input--textarea"
              placeholder="Descripción para motores de búsqueda"
            />
            <p className="admin-form-hint">
              {metaDescription.length} caracteres. Óptimo: 150-160.
            </p>
          </div>
        </div>
      </div>

      {/* Author Section */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">Autor</h2>

        <div className="admin-form-fields">
          {/* Author Type Selector */}
          <div className="admin-form-field">
            <label className="admin-form-label">
              Firmar artículo como
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

          {/* Agent Selector (only if ai_agent selected) */}
          {authorType === 'ai_agent' && (
            <div className="admin-form-field">
              <label htmlFor="agent_selector" className="admin-form-label admin-form-label--required">
                Seleccionar Agente
              </label>
              {loadingData ? (
                <div className="admin-form-hint">Cargando agentes...</div>
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
                      {agent.display_name} - {agent.email}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Author Preview */}
          <div className="admin-form-field">
            <div className="card" style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-slate-50)' }}>
              <p className="admin-form-label" style={{ marginBottom: 'var(--spacing-2)' }}>
                Vista previa del autor:
              </p>
              {authorType === 'current_user' && currentUser ? (
                <div>
                  <p className="admin-form-hint" style={{ marginBottom: 'var(--spacing-1)' }}>
                    <strong>{currentUser.name}</strong>
                  </p>
                  <p className="admin-form-hint">{currentUser.email}</p>
                </div>
              ) : authorType === 'ai_agent' && selectedAgentId ? (
                (() => {
                  const selected = availableAgents.find(a => a.id === selectedAgentId);
                  return selected ? (
                    <div>
                      <p className="admin-form-hint" style={{ marginBottom: 'var(--spacing-1)' }}>
                        <strong>{selected.display_name}</strong>
                      </p>
                      <p className="admin-form-hint">{selected.email}</p>
                      <p className="admin-form-hint" style={{ marginTop: 'var(--spacing-2)', fontStyle: 'italic' }}>
                        {selected.signature}
                      </p>
                    </div>
                  ) : <p className="admin-form-hint">Selecciona un agente</p>;
                })()
              ) : (
                <p className="admin-form-hint">Selecciona un tipo de autor</p>
              )}
            </div>
          </div>

          {/* Source Name */}
          <div className="admin-form-field">
            <label htmlFor="source_name" className="admin-form-label">
              Nombre de la fuente
            </label>
            <input
              type="text"
              id="source_name"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="admin-form-input"
              placeholder="Para artículos externos (opcional)"
            />
          </div>

          {/* Source URL */}
          <div className="admin-form-field">
            <label htmlFor="source_url" className="admin-form-label">
              URL de la fuente
            </label>
            <input
              type="url"
              id="source_url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="admin-form-input"
              placeholder="https://fuente.com/articulo"
            />
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">Estado de Publicación</h2>

        <div className="admin-form-field">
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
      </div>

      {/* Action Buttons */}
      <div className="admin-form-actions">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="btn btn-ghost"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>

        <div className="admin-form-actions__group">
          {!isEditing && (
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
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar Borrador'}
          </button>
        </div>
      </div>
    </form>
  );
}
