/**
 * Página de edición de Agentes AI
 * /admin/agentes/[id]/editar
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AvatarUpload from '@/components/admin/AvatarUpload';

interface Agent {
  id: string;
  name: string;
  slug: string;
  display_name: string;
  bio: string;
  expertise: string[];
  avatar_url: string | null;
  role: string;
  email: string;
  signature: string;
  is_active: boolean;
  can_publish: boolean;
  articles_count: number;
}

export default function EditarAgentePage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    display_name: '',
    bio: '',
    expertise: [] as string[],
    expertiseInput: '',
    role: 'analyst' as 'analyst' | 'editor' | 'researcher',
    email: '',
    signature: '',
    avatar_url: '',
    is_active: true,
    can_publish: true
  });

  // Load agent data
  useEffect(() => {
    const loadAgent = async () => {
      try {
        const response = await fetch(`/api/admin/agentes/${agentId}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Error al cargar el agente');
        }

        const agentData = result.data.agent;
        setAgent(agentData);
        setFormData({
          name: agentData.name,
          slug: agentData.slug,
          display_name: agentData.display_name,
          bio: agentData.bio || '',
          expertise: agentData.expertise || [],
          expertiseInput: '',
          role: agentData.role,
          email: agentData.email,
          signature: agentData.signature || '',
          avatar_url: agentData.avatar_url || '',
          is_active: agentData.is_active,
          can_publish: agentData.can_publish
        });
      } catch (err: any) {
        console.error('Error loading agent:', err);
        setError(err.message || 'Error al cargar el agente');
      } finally {
        setLoading(false);
      }
    };

    loadAgent();
  }, [agentId]);

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
      if (!formData.email.trim()) {
        throw new Error('El email es obligatorio');
      }
      if (formData.expertise.length === 0) {
        throw new Error('Debes añadir al menos una área de experticia');
      }

      // Prepare data
      const agentData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        display_name: formData.display_name.trim(),
        bio: formData.bio.trim() || null,
        expertise: formData.expertise,
        role: formData.role,
        email: formData.email.trim(),
        signature: formData.signature.trim() || null,
        avatar_url: formData.avatar_url.trim() || null,
        is_active: formData.is_active,
        can_publish: formData.can_publish
      };

      const response = await fetch(`/api/admin/agentes/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar el agente');
      }

      // Success - redirect to agents list
      router.push('/admin/agentes');
      router.refresh();

    } catch (err: any) {
      console.error('Error updating agent:', err);
      setError(err.message || 'Error al actualizar el agente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!agent) return;

    const confirmMessage = agent.articles_count > 0
      ? `¿Estás seguro de eliminar a ${agent.display_name}? Este agente tiene ${agent.articles_count} artículo(s) publicado(s). Los artículos NO se eliminarán, pero perderán la referencia al autor.`
      : `¿Estás seguro de eliminar a ${agent.display_name}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/agentes/${agentId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar el agente');
      }

      // Success - redirect to agents list
      router.push('/admin/agentes');
      router.refresh();

    } catch (err: any) {
      console.error('Error deleting agent:', err);
      setError(err.message || 'Error al eliminar el agente');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-form-container">
        <div className="admin-loading">Cargando agente...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="admin-form-container">
        <div className="admin-alert admin-alert--error">
          <strong>Error:</strong> Agente no encontrado
        </div>
        <Link href="/admin/agentes" className="btn btn-secondary">
          Volver a Agentes
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-form-container">
      {/* Back link */}
      <Link href="/admin/agentes" className="admin-form-back-link">
        <ArrowLeft className="w-4 h-4" />
        Volver a Agentes
      </Link>

      {/* Header */}
      <div className="admin-form-header">
        <div>
          <h1 className="admin-form-title">Editar Agente: {agent.display_name}</h1>
          <p className="admin-form-description">
            Modifica la información del agente de inteligencia artificial
          </p>
        </div>
        {agent.articles_count > 0 && (
          <div className="admin-badge admin-badge--info">
            {agent.articles_count} artículo(s) publicado(s)
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
      <form onSubmit={handleSubmit} className="admin-form">
        {/* Información Básica */}
        <div className="admin-form-section">
          <h2 className="admin-form-section__title">Información Básica</h2>

          {/* Name */}
          <div className="admin-form-group">
            <label htmlFor="name" className="admin-form-label admin-form-label--required">
              Nombre del Agente
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
              required
            />
            <p className="admin-form-help">
              URL del perfil: /agentes/{formData.slug || 'slug'}
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
              required
            />
          </div>

          {/* Email */}
          <div className="admin-form-group">
            <label htmlFor="email" className="admin-form-label admin-form-label--required">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="admin-form-input"
              required
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
              <option value="analyst">Analista</option>
              <option value="editor">Editor</option>
              <option value="researcher">Investigador</option>
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
              placeholder="Describe la especialidad y enfoque del agente..."
            />
            <p className="admin-form-help">
              Descripción del agente que aparecerá en su perfil
            </p>
          </div>

          {/* Expertise */}
          <div className="admin-form-group">
            <label htmlFor="expertise" className="admin-form-label admin-form-label--required">
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
            />
          </div>

          {/* Avatar */}
          <div className="admin-form-group">
            <label className="admin-form-label">
              Avatar del Agente
            </label>
            <AvatarUpload
              currentAvatarUrl={formData.avatar_url}
              onAvatarChange={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
              agentSlug={formData.slug}
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
                <span className="admin-form-checkbox__label">Agente activo</span>
                <p className="admin-form-checkbox__help">
                  El agente aparecerá en listados y podrá ser seleccionado
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
                  El agente puede ser asignado como autor de artículos
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="admin-form-actions">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="btn btn-danger"
          >
            {deleting ? 'Eliminando...' : 'Eliminar Agente'}
          </button>
          <div className="admin-form-actions__right">
            <Link href="/admin/agentes" className="btn btn-secondary">
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
      </form>
    </div>
  );
}
