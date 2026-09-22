'use client';

/**
 * Página de creación de Autores de Entrevistas
 * /admin/autores-entrevistas/crear
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AvatarUpload from '@/components/admin/AvatarUpload';

export default function CrearAutorEntrevistaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData(prev => ({ ...prev, name, slug, display_name: name }));
  };

  // Handle expertise tags
  const addExpertise = () => {
    const trimmedInput = formData.expertiseInput.trim();
    if (trimmedInput && !formData.expertise.includes(trimmedInput)) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, trimmedInput],
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
    setLoading(true);
    setError(null);

    try {
      // Validations
      if (!formData.name.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      if (!formData.slug.trim()) {
        throw new Error('El slug es obligatorio');
      }
      if (!formData.display_name.trim()) {
        throw new Error('El nombre para mostrar es obligatorio');
      }

      // Build final expertise array (include pending input if exists)
      let finalExpertise = [...formData.expertise];
      const trimmedInput = formData.expertiseInput.trim();
      if (trimmedInput && !finalExpertise.includes(trimmedInput)) {
        finalExpertise.push(trimmedInput);
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
        expertise: finalExpertise.length > 0 ? finalExpertise : [],
        role: formData.role,
        email: formData.email.trim() || null,
        signature: formData.signature.trim() || null,
        avatar_url: formData.avatar_url.trim() || null,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        is_active: formData.is_active,
        can_publish: formData.can_publish
      };

      const response = await fetch('/api/admin/autores-entrevistas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authorData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al crear el autor');
      }

      // Success - redirect to authors list
      router.push('/admin/autores-entrevistas');
      router.refresh();

    } catch (err: any) {
      console.error('Error creating interview author:', err);
      setError(err.message || 'Error al crear el autor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      {/* Back link */}
      <Link href="/admin/autores-entrevistas" className="admin-form-back-link">
        <ArrowLeft className="w-4 h-4" />
        Volver a Autores
      </Link>

      {/* Header */}
      <div className="admin-form-header">
        <h1 className="admin-form-title">Crear Nuevo Autor de Entrevistas</h1>
        <p className="admin-form-description">
          Crea un perfil de autor/redactor que podrá ser asignado a las entrevistas
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="admin-alert admin-alert--error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="admin-form">
        {/* Información Básica */}
        <div className="admin-form-section">
          <h2 className="admin-form-section__title">Información Básica</h2>

          {/* Name */}
          <div className="admin-form-group">
            <label htmlFor="name" className="admin-form-label admin-form-label--required">
              Nombre del Autor
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="admin-form-input"
              placeholder="Ej: Juan Pérez, María García"
              required
            />
            <p className="admin-form-help">
              El nombre completo del autor (se generará automáticamente el slug)
            </p>
          </div>

          {/* Slug */}
          <div className="admin-form-group">
            <label htmlFor="slug" className="admin-form-label admin-form-label--required">
              Slug (URL)
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="admin-form-input"
              placeholder="juan-perez"
              required
            />
            <p className="admin-form-help">
              URL del perfil: /autores/{formData.slug || 'slug'}
            </p>
          </div>

          {/* Display Name */}
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
              placeholder="Juan Pérez"
              required
            />
            <p className="admin-form-help">
              El nombre que aparecerá en las entrevistas y en su perfil
            </p>
          </div>

          {/* Email */}
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
              placeholder="juan.perez@etfnexo.com"
            />
          </div>

          {/* Role */}
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

        {/* Perfil y Experticia */}
        <div className="admin-form-section">
          <h2 className="admin-form-section__title">Perfil y Experticia</h2>

          {/* Bio */}
          <div className="admin-form-group">
            <label htmlFor="bio" className="admin-form-label">
              Biografía
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="admin-form-input admin-form-input--textarea"
              rows={8}
              placeholder="Describe la experiencia y especialidad del autor..."
            />
            <p className="admin-form-help">
              Descripción del autor que aparecerá en su perfil
            </p>
          </div>

          {/* Expertise */}
          <div className="admin-form-group">
            <label htmlFor="expertise" className="admin-form-label">
              Áreas de Experticia
            </label>
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

            {/* Tags list */}
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

            <p className="admin-form-help">
              Ej: ETFs, Mercados Financieros, Análisis Técnico, Inversión Pasiva
            </p>
          </div>

          {/* Signature */}
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
              placeholder="— Juan Pérez, Editor de ETF Nexo"
            />
            <p className="admin-form-help">
              Texto que aparecerá al final de las entrevistas del autor
            </p>
          </div>

          {/* Avatar */}
          <div className="admin-form-group">
            <label className="admin-form-label">
              Avatar del Autor
            </label>
            <AvatarUpload
              currentAvatarUrl={formData.avatar_url}
              onAvatarChange={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
              agentSlug={formData.slug || 'new-author'}
            />
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="admin-form-section">
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
        <div className="admin-form-section">
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
                  El autor aparecerá en listados y podrá ser seleccionado
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
                  El autor puede ser asignado como redactor de entrevistas
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="admin-form-actions">
          <Link href="/admin/autores-entrevistas" className="btn btn-secondary">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creando...' : 'Crear Autor'}
          </button>
        </div>
      </form>
    </div>
  );
}
