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

  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags?.map(t => t.id) || []
  );
  const [authorName, setAuthorName] = useState(initialData?.author_name || '');
  const [authorEmail, setAuthorEmail] = useState(initialData?.author_email || '');
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || '');
  const [featuredImageUrl, setFeaturedImageUrl] = useState(initialData?.featured_image_url || '');
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featured_image_alt || '');
  const [sourceName, setSourceName] = useState(initialData?.source_name || '');
  const [sourceUrl, setSourceUrl] = useState(initialData?.source_url || '');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(initialData?.status || 'draft');

  // Cargar categorías y etiquetas al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);

        // Cargar categorías y etiquetas en paralelo
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch('/api/admin/categorias'),
          fetch('/api/admin/etiquetas')
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data.categories || []);
        }

        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setAvailableTags(tagsData.data.tags || []);
        }
      } catch (err) {
        console.error('Error loading categories/tags:', err);
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
      const articleData = {
        title,
        slug: slug || undefined,
        excerpt: excerpt || undefined,
        content,
        category_id: categoryId || undefined,
        author_name: authorName || undefined,
        author_email: authorEmail || undefined,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt || undefined,
        featured_image_url: featuredImageUrl || undefined,
        featured_image_alt: featuredImageAlt || undefined,
        source_name: sourceName || undefined,
        source_url: sourceUrl || undefined,
        status: publishNow ? 'published' : status,
        tags: selectedTags
      };

      await onSubmit(articleData);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el artículo');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Main Content Section */}
      <div className="card">
        <h2 className="heading-4 text-slate-900 mb-6">Contenido Principal</h2>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título del artículo"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-2">
              Slug (URL)
            </label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Se generará automáticamente si se deja vacío"
            />
            <p className="mt-1 text-xs text-slate-500">
              URL amigable del artículo. Dejar vacío para generar automáticamente.
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700 mb-2">
              Extracto
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Breve resumen del artículo (opcional)"
            />
            <p className="mt-1 text-xs text-slate-500">
              {excerpt.length} caracteres. Recomendado: 150-200.
            </p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">
              Contenido <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="Contenido del artículo en HTML"
            />
            <p className="mt-1 text-xs text-slate-500">
              Acepta HTML. {content.length} caracteres.
            </p>
          </div>
        </div>
      </div>

      {/* Category and Tags Section */}
      <div className="card">
        <h2 className="heading-4 text-slate-900 mb-6">Categoría y Etiquetas</h2>

        <div className="space-y-6">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
              Categoría
            </label>
            {loadingData ? (
              <div className="text-sm text-slate-500">Cargando categorías...</div>
            ) : (
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Etiquetas
            </label>
            {loadingData ? (
              <div className="text-sm text-slate-500">Cargando etiquetas...</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleToggleTag(tag.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <TagIcon className="w-3 h-3" />
                      {tag.name}
                    </button>
                  );
                })}
                {availableTags.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No hay etiquetas disponibles. Crea una desde la gestión de etiquetas.
                  </p>
                )}
              </div>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {selectedTags.length} etiqueta(s) seleccionada(s)
            </p>
          </div>
        </div>
      </div>

      {/* Featured Image Section */}
      <div className="card">
        <h2 className="heading-4 text-slate-900 mb-6">Imagen Destacada</h2>

        <div className="space-y-6">
          {/* Image URL */}
          <div>
            <label htmlFor="featured_image_url" className="block text-sm font-medium text-slate-700 mb-2">
              URL de la imagen
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="featured_image_url"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <button
                type="button"
                className="btn-secondary flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Subir
              </button>
            </div>
          </div>

          {/* Image Alt */}
          <div>
            <label htmlFor="featured_image_alt" className="block text-sm font-medium text-slate-700 mb-2">
              Texto alternativo
            </label>
            <input
              type="text"
              id="featured_image_alt"
              value={featuredImageAlt}
              onChange={(e) => setFeaturedImageAlt(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción de la imagen para accesibilidad"
            />
          </div>

          {/* Image Preview */}
          {featuredImageUrl && (
            <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden">
              <img
                src={featuredImageUrl}
                alt={featuredImageAlt || 'Preview'}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Meta & SEO Section */}
      <div className="card">
        <h2 className="heading-4 text-slate-900 mb-6">SEO y Metadatos</h2>

        <div className="space-y-6">
          {/* Meta Title */}
          <div>
            <label htmlFor="meta_title" className="block text-sm font-medium text-slate-700 mb-2">
              Título SEO
            </label>
            <input
              type="text"
              id="meta_title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Se usará el título principal si se deja vacío"
            />
            <p className="mt-1 text-xs text-slate-500">
              {metaTitle.length} caracteres. Óptimo: 50-60.
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <label htmlFor="meta_description" className="block text-sm font-medium text-slate-700 mb-2">
              Descripción SEO
            </label>
            <textarea
              id="meta_description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción para motores de búsqueda"
            />
            <p className="mt-1 text-xs text-slate-500">
              {metaDescription.length} caracteres. Óptimo: 150-160.
            </p>
          </div>
        </div>
      </div>

      {/* Author & Source Section */}
      <div className="card">
        <h2 className="heading-4 text-slate-900 mb-6">Autor y Fuente</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Author Name */}
          <div>
            <label htmlFor="author_name" className="block text-sm font-medium text-slate-700 mb-2">
              Nombre del autor
            </label>
            <input
              type="text"
              id="author_name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Redacción ETF Nexo"
            />
          </div>

          {/* Author Email */}
          <div>
            <label htmlFor="author_email" className="block text-sm font-medium text-slate-700 mb-2">
              Email del autor
            </label>
            <input
              type="email"
              id="author_email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="autor@ejemplo.com"
            />
          </div>

          {/* Source Name */}
          <div>
            <label htmlFor="source_name" className="block text-sm font-medium text-slate-700 mb-2">
              Nombre de la fuente
            </label>
            <input
              type="text"
              id="source_name"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Para artículos externos"
            />
          </div>

          {/* Source URL */}
          <div>
            <label htmlFor="source_url" className="block text-sm font-medium text-slate-700 mb-2">
              URL de la fuente
            </label>
            <input
              type="url"
              id="source_url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://fuente.com/articulo"
            />
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="card">
        <h2 className="heading-4 text-slate-900 mb-6">Estado de Publicación</h2>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
            Estado
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="btn-ghost flex items-center gap-2 w-full sm:w-auto"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>

        <div className="flex gap-3 w-full sm:w-auto">
          {!isEditing && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, true)}
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Publicar Ahora
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar Borrador'}
          </button>
        </div>
      </div>
    </form>
  );
}
