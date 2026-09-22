/**
 * Página de edición de Autores de Entrevistas
 * /admin/autores-entrevistas/[id]/editar
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AvatarUpload from '@/components/admin/AvatarUpload';

interface InterviewAuthor {
  id: string;
  name: string;
  slug: string;
  display_name: string;
  bio: string | null;
  expertise: string[] | null;
  avatar_url: string | null;
  role: string;
  email: string | null;
  signature: string | null;
  social_links: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  } | null;
  is_active: boolean;
  can_publish: boolean;
  interviews_count: number;
}

export default function EditarAutorEntrevistaPage() {
  const router = useRouter();
  const params = useParams();
  const authorId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [author, setAuthor] = useState<InterviewAuthor | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    display_name: '',
    bio: '',
    expertise: [] as string[],
    expertiseInput: '',
    role: 'editor' as 'editor' | 'analyst' | 'journalist' | 'guest',
    email: '',
    signature: '',
    avatar_url: '',
    is_active: true,
    can_publish: true,
    social_links: {
      twitter: '',
      linkedin: '',
      website: ''
    }
  });

  // Load author data
  useEffect(() => {
    const loadAuthor = async () => {
      try {
        const response = await fetch(`/api/admin/autores-entrevistas/${authorId}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Error al cargar el autor');
        }

        const authorData = result.data.author;
        setAuthor(authorData);
        setFormData({
          name: authorData.name,
          slug: authorData.slug,
          display_name: authorData.display_name,
          bio: authorData.bio || '',
          expertise: authorData.expertise || [],
          expertiseInput: '',
          role: authorData.role,
          email: authorData.email || '',
          signature: authorData.signature || '',
          avatar_url: authorData.avatar_url || '',
          is_active: authorData.is_active,
          can_publish: authorData.can_publish,
          social_links: {
            twitter: authorData.social_links?.twitter || '',
            linkedin: authorData.social_links?.linkedin || '',
            website: authorData.social_links?.website || ''
          }
        });
      } catch (err: any) {
        console.error('Error loading interview author:', err);
        setError(err.message || 'Error al cargar el autor');
      } finally {
        setLoading(false);
      }
    };

    loadAuthor();
  }, [authorId]);

  // Handle expertise tags
  const addExpertise = () => {
    if (formData.expertiseInput.trim() && !formData.expertise.includes(formData.expertiseInput.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, prev.expertiseInput.trim()],
        expertiseInput: ''
      }));
    }
  };

  const removeExpertise = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(s => s !== skill)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExpertise();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validations
      if (!formData.name.trim()) {
        throw new Error('El nombre es obligatorio');
      }

      // Prepare social links (only include non-empty values)
      const socialLinks: any = {};
      if (formData.social_links.twitter.trim()) {
        socialLinks.twitter = formData.social_links.twitter.trim();
      }
      if (formData.social_links.linkedin.trim()) {
        socialLinks.linkedin = formData.social_links.linkedin.trim();
      }
      if (formData.social_links.website.trim()) {
        socialLinks.website = formData.social_links.website.trim();
      }

      // Prepare data
      const authorData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        display_name: formData.display_name.trim(),
        bio: formData.bio.trim() || null,
        expertise: formData.expertise.length > 0 ? formData.expertise : [],
        role: formData.role,
        email: formData.email.trim() || null,
        signature: formData.signature.trim() || null,
        avatar_url: formData.avatar_url.trim() || null,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        is_active: formData.is_active,
        can_publish: formData.can_publish
      };

      const response = await fetch(`/api/admin/autores-entrevistas/${authorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authorData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar el autor');
      }

      // Success - redirect to authors list
      router.push('/admin/autores-entrevistas');
      router.refresh();

    } catch (err: any) {
      console.error('Error updating interview author:', err);
      setError(err.message || 'Error al actualizar el autor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!author) return;

    const confirmMessage = author.interviews_count > 0
      ? `¿Estás seguro de eliminar a ${author.display_name}? Este autor tiene ${author.interviews_count} entrevista(s) publicada(s). Las entrevistas NO se eliminarán, pero perderán la referencia al autor.`
      : `¿Estás seguro de eliminar a ${author.display_name}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/autores-entrevistas/${authorId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar el autor');
      }

      // Success - redirect to authors list
      router.push('/admin/autores-entrevistas');
      router.refresh();

    } catch (err: any) {
      console.error('Error deleting interview author:', err);
      setError(err.message || 'Error al eliminar el autor');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-form-container">
        <div className="admin-loading">Cargando autor...</div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="admin-form-container">
        <div className="admin-alert admin-alert--error">
          <strong>Error:</strong> Autor no encontrado
        </div>
        <Link href="/admin/autores-entrevistas" className="btn btn-secondary">
          Volver a Autores
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-form-container">
      {/* Back link */}
      <Link href="/admin/autores-entrevistas" className="admin-form-back-link">
        <ArrowLeft className="w-4 h-4" />
        Volver a Autores
      </Link>

      {/* Header */}
      <div className="admin-form-header">
        <div>
          <h1 className="admin-form-title">Editar Autor: {author.display_name}</h1>
          <p className="admin-form-description">
            Modifica la información del autor/redactor de entrevistas
          </p>
        </div>
        {author.interviews_count > 0 && (
          <div className="admin-badge admin-badge--info">
            {author.interviews_count} entrevista(s) publicada(s)
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="admin-alert admin-alert--error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="admin-form admin-form--grid">
        {/* SIDEBAR - Avatar + Info Básica */}
        <div className="admin-form-sidebar">
          {/* Avatar Card Destacado */}
          <div className="admin-avatar-card">
            <div className="admin-avatar-card__preview">
              {formData.avatar_url ? (
                <div className="admin-avatar-card__image-container">
                  <img
                    src={formData.avatar_url}
                    alt={formData.display_name}
                    className="admin-avatar-card__image"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
                    className="admin-avatar-card__remove"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="admin-avatar-card__placeholder">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="admin-avatar-card__name">{formData.display_name || 'Nuevo Autor'}</h3>
            <p className="admin-avatar-card__role">
              {formData.role === 'editor' ? 'Editor' :
               formData.role === 'analyst' ? 'Analista' :
               formData.role === 'journalist' ? 'Periodista' : 'Invitado'}
            </p>
            <div className="admin-avatar-card__upload" style={{ width: '100%' }}>
              <AvatarUpload
                currentAvatarUrl={formData.avatar_url}
                onAvatarChange={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
                agentSlug={formData.slug}
              />
            </div>
          </div>

          {/* Info Básica Compacta */}
          <div className="admin-form-section--compact">
            <h2 className="admin-form-section__title">Información Básica</h2>

            <div className="admin-form-group">
              <label htmlFor="name" className="admin-form-label admin-form-label--required">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="admin-form-input"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="display_name" className="admin-form-label admin-form-label--required">
                Nombre para Mostrar
              </label>
              <input
                type="text"
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                className="admin-form-input"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="slug" className="admin-form-label admin-form-label--required">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="admin-form-input"
                required
              />
              <p className="admin-form-help">
                /autores/{formData.slug || '...'}
              </p>
            </div>

            <div className="admin-form-group">
              <label htmlFor="email" className="admin-form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="role" className="admin-form-label admin-form-label--required">
                Rol
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                className="admin-form-select"
                required
              >
                <option value="editor">Editor</option>
                <option value="analyst">Analista</option>
                <option value="journalist">Periodista</option>
                <option value="guest">Invitado</option>
              </select>
            </div>
          </div>
        </div>

        {/* MAIN - Perfil + Experticia + Redes Sociales + Permisos */}
        <div className="admin-form-main">
          {/* Perfil */}
          <div className="admin-form-section--compact">
            <h2 className="admin-form-section__title">Perfil</h2>

            <div className="admin-form-group">
              <label htmlFor="bio" className="admin-form-label">
                Biografía
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="admin-form-input admin-form-input--textarea"
                rows={6}
                placeholder="Describe la experiencia y especialidad del autor..."
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="signature" className="admin-form-label">
                Firma
              </label>
              <input
                type="text"
                id="signature"
                value={formData.signature}
                onChange={(e) => setFormData(prev => ({ ...prev, signature: e.target.value }))}
                className="admin-form-input"
                placeholder="— Nombre, Título en ETF Nexo"
              />
            </div>
          </div>

          {/* Experticia */}
          <div className="admin-form-section--compact">
            <h2 className="admin-form-section__title">Áreas de Experticia</h2>

            <div className="admin-tag-input">
              <input
                type="text"
                id="expertise"
                value={formData.expertiseInput}
                onChange={(e) => setFormData(prev => ({ ...prev, expertiseInput: e.target.value }))}
                onKeyDown={handleKeyDown}
                className="admin-form-input"
                placeholder="Escribe y presiona Enter..."
              />
              <button
                type="button"
                onClick={addExpertise}
                className="btn btn-secondary btn-sm"
              >
                Añadir
              </button>
            </div>

            {formData.expertise.length > 0 && (
              <div className="admin-tag-list">
                {formData.expertise.map((skill) => (
                  <span key={skill} className="admin-tag">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeExpertise(skill)}
                      className="admin-tag__remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Redes Sociales */}
          <div className="admin-form-section--compact">
            <h2 className="admin-form-section__title">Redes Sociales</h2>

            <div className="admin-form-group">
              <label htmlFor="twitter" className="admin-form-label">
                Twitter/X
              </label>
              <input
                type="text"
                id="twitter"
                value={formData.social_links.twitter}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  social_links: { ...prev.social_links, twitter: e.target.value }
                }))}
                className="admin-form-input"
                placeholder="https://twitter.com/usuario"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="linkedin" className="admin-form-label">
                LinkedIn
              </label>
              <input
                type="text"
                id="linkedin"
                value={formData.social_links.linkedin}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  social_links: { ...prev.social_links, linkedin: e.target.value }
                }))}
                className="admin-form-input"
                placeholder="https://linkedin.com/in/usuario"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="website" className="admin-form-label">
                Sitio Web Personal
              </label>
              <input
                type="text"
                id="website"
                value={formData.social_links.website}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  social_links: { ...prev.social_links, website: e.target.value }
                }))}
                className="admin-form-input"
                placeholder="https://ejemplo.com"
              />
            </div>
          </div>

          {/* Permisos */}
          <div className="admin-form-section--compact">
            <h2 className="admin-form-section__title">Permisos</h2>

            <div className="admin-form-checkbox-group">
              <label className="admin-form-checkbox">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                <div className="admin-form-checkbox__content">
                  <span className="admin-form-checkbox__label">Autor activo</span>
                  <p className="admin-form-checkbox__help">
                    Aparecerá en listados y podrá ser seleccionado
                  </p>
                </div>
              </label>

              <label className="admin-form-checkbox">
                <input
                  type="checkbox"
                  checked={formData.can_publish}
                  onChange={(e) => setFormData(prev => ({ ...prev, can_publish: e.target.checked }))}
                />
                <div className="admin-form-checkbox__content">
                  <span className="admin-form-checkbox__label">Puede publicar</span>
                  <p className="admin-form-checkbox__help">
                    Puede ser asignado como redactor de entrevistas
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions - Span full grid */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="admin-form-actions">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="btn btn-danger"
            >
              {deleting ? 'Eliminando...' : 'Eliminar Autor'}
            </button>
            <div className="admin-form-actions__right">
              <Link href="/admin/autores-entrevistas" className="btn btn-secondary">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving || deleting}
                className="btn btn-primary"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
