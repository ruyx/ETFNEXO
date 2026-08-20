'use client';

/**
 * Admin Editar Artículo de Academia - Formulario de edición
 * Versión simplificada para editar artículos educativos
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditAcademiaPageProps {
  params: {
    id: string;
  };
}

export default function EditAcademiaPage({ params }: EditAcademiaPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category_id: '',
    author_id: '',
    difficulty_level: 'beginner',
    estimated_reading_time: '',
    status: 'draft'
  });

  useEffect(() => {
    loadArticle();
  }, [params.id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/academia/${params.id}`);

      if (!response.ok) {
        throw new Error('Error al cargar el artículo');
      }

      const result = await response.json();
      const article = result.data.article;

      setFormData({
        title: article.title || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        category_id: article.category_id || '',
        author_id: article.author_id || '',
        difficulty_level: article.difficulty_level || 'beginner',
        estimated_reading_time: article.estimated_reading_time ? String(article.estimated_reading_time) : '',
        status: article.status || 'draft'
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar el artículo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        estimated_reading_time: formData.estimated_reading_time
          ? parseInt(formData.estimated_reading_time)
          : null
      };

      const response = await fetch(`/api/admin/academia/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el artículo');
      }

      router.push('/admin/academia?updated=true');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el artículo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="admin-form-container">
        <div className="admin-loading">
          <p className="admin-loading__text">Cargando artículo...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="admin-form-container">
        <div className="admin-alert admin-alert--error">
          <strong>Error:</strong> {error}
        </div>
        <Link href="/admin/academia" className="btn btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-form-container">
      {/* Back link */}
      <Link href="/admin/academia" className="admin-form-back-link">
        <ArrowLeft className="w-4 h-4" />
        Volver al listado
      </Link>

      {/* Header */}
      <div className="admin-form-header">
        <div>
          <h1 className="admin-form-title">Editar Artículo de Academia</h1>
          <p className="admin-form-description">
            Modifica el contenido educativo
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="admin-alert admin-alert--error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Información básica</h2>

          {/* Title */}
          <div className="admin-form-field">
            <label className="admin-form-label" htmlFor="title">
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="admin-form-input"
              placeholder="Título del artículo"
            />
          </div>

          {/* Excerpt */}
          <div className="admin-form-field">
            <label className="admin-form-label" htmlFor="excerpt">
              Resumen
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              className="admin-form-textarea"
              placeholder="Resumen corto para listados"
            />
          </div>

          {/* Content */}
          <div className="admin-form-field">
            <label className="admin-form-label" htmlFor="content">
              Contenido * (HTML/Markdown)
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={15}
              className="admin-form-textarea"
              placeholder="Contenido del artículo en HTML o Markdown"
            />
          </div>
        </div>

        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Clasificación</h2>

          {/* Difficulty Level */}
          <div className="admin-form-field">
            <label className="admin-form-label" htmlFor="difficulty_level">
              Nivel de dificultad
            </label>
            <select
              id="difficulty_level"
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleChange}
              className="admin-form-select"
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>

          {/* Reading Time */}
          <div className="admin-form-field">
            <label className="admin-form-label" htmlFor="estimated_reading_time">
              Tiempo de lectura (minutos)
            </label>
            <input
              type="number"
              id="estimated_reading_time"
              name="estimated_reading_time"
              value={formData.estimated_reading_time}
              onChange={handleChange}
              min="1"
              className="admin-form-input"
              placeholder="Ej: 5"
            />
          </div>

          {/* Status */}
          <div className="admin-form-field">
            <label className="admin-form-label" htmlFor="status">
              Estado
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="admin-form-select"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="admin-form-actions">
          <Link href="/admin/academia" className="btn btn-secondary">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
