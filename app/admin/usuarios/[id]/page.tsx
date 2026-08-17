/**
 * Página de edición de Usuarios
 * /admin/usuarios/[id]
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AvatarUpload from '@/components/admin/AvatarUpload';
import AgentTagInput from '@/components/admin/AgentTagInput';

interface User {
  id: string;
  email: string;
  full_name: string;
  username: string | null;
  role: string;
  bio: string | null;
  agent_id: string | null;
  preferred_currency: string;
  preferred_language: string;
  email_notifications: boolean;
  marketing_emails: boolean;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
}

interface Agent {
  id: string;
  name: string;
  display_name: string;
  role: string;
  slug: string;
}

interface SelectedAgent extends Agent {
  assignment_id?: string;
  assigned_at?: string;
}

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<SelectedAgent[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    username: '',
    role: 'viewer',
    bio: '',
    avatar_url: '',
    preferred_currency: 'EUR',
    preferred_language: 'es',
    email_notifications: true,
    marketing_emails: false
  });

  // Load user data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user
        const userResponse = await fetch(`/api/admin/usuarios/${userId}`);
        const userResult = await userResponse.json();

        if (userResult.error) {
          throw new Error(userResult.error || 'Error al cargar el usuario');
        }

        const userData = userResult.data.user;
        setUser(userData);
        setFormData({
          email: userData.email || '',
          password: '',
          full_name: userData.full_name || '',
          username: userData.username || '',
          role: userData.role || 'viewer',
          bio: userData.bio || '',
          avatar_url: userData.avatar_url || '',
          preferred_currency: userData.preferred_currency || 'EUR',
          preferred_language: userData.preferred_language || 'es',
          email_notifications: userData.email_notifications !== false,
          marketing_emails: userData.marketing_emails || false
        });

        // Load assigned agents
        const agentsResponse = await fetch(`/api/admin/usuarios/${userId}/agents`);
        const agentsResult = await agentsResponse.json();
        if (agentsResult.data?.agents) {
          setSelectedAgents(agentsResult.data.agents.map((a: any) => ({
            id: a.agent_id,
            name: a.name,
            display_name: a.display_name,
            role: a.role,
            slug: a.slug,
            assignment_id: a.id,
            assigned_at: a.assigned_at
          })));
        }

      } catch (err: any) {
        console.error('Error loading user:', err);
        setError(err.message || 'Error al cargar el usuario');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // No enviar password si está vacío
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await fetch(`/api/admin/usuarios/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error || 'Error al actualizar usuario');
      }

      // Success - redirect to users list
      router.push('/admin/usuarios');
      router.refresh();

    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    if (!confirm(`¿Estás seguro de eliminar al usuario "${user.full_name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/usuarios/${userId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error || 'Error al eliminar usuario');
      }

      // Success - redirect to users list
      router.push('/admin/usuarios');
      router.refresh();

    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Error al eliminar usuario');
    } finally {
      setDeleting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'editor': return 'Editor';
      case 'viewer': return 'Lector';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="admin-form-container">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Cargando usuario...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-form-container">
        <div className="admin-alert admin-alert--error">
          <strong>Error:</strong> Usuario no encontrado
        </div>
        <Link href="/admin/usuarios" className="btn-secondary">
          Volver a Usuarios
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-form-container">
      {/* Back link */}
      <Link href="/admin/usuarios" className="admin-form-back-link">
        <ArrowLeft className="w-4 h-4" />
        Volver a Usuarios
      </Link>

      {/* Header */}
      <div className="admin-form-header">
        <div>
          <h1 className="admin-form-title">Editar Usuario: {user.full_name}</h1>
          <p className="admin-form-description">
            Modifica la información del usuario y sus permisos
          </p>
        </div>
        <div className="admin-badge admin-badge--info">
          {user.email_confirmed_at ? 'Email verificado' : 'Email pendiente'}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="admin-alert admin-alert--error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="admin-form admin-form--grid">
        {/* SIDEBAR - Avatar + Info del Usuario */}
        <div className="admin-form-sidebar">
          {/* User Info Card */}
          <div className="admin-avatar-card">
            <div className="admin-avatar-card__preview">
              <div className="admin-avatar-card__placeholder">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt={formData.full_name || 'Avatar'}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                    color: 'var(--color-white)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: '700'
                  }}>
                    {formData.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
            <h3 className="admin-avatar-card__name">{formData.full_name || 'Usuario'}</h3>
            <p className="admin-avatar-card__role">
              {getRoleLabel(formData.role)}
            </p>
            {selectedAgents.length > 0 && (
              <div className="admin-badge admin-badge--success" style={{ marginTop: 'var(--spacing-2)' }}>
                {selectedAgents.length} {selectedAgents.length === 1 ? 'Agente AI' : 'Agentes AI'}
              </div>
            )}
          </div>

          {/* Avatar Upload */}
          <div className="admin-form-section--compact">
            <h2 className="admin-form-section__title">Avatar del Usuario</h2>
            <AvatarUpload
              currentAvatarUrl={formData.avatar_url}
              onAvatarChange={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
              agentSlug={formData.username || user?.id.substring(0, 8)}
            />
          </div>

          {/* Metadata Compacta */}
          <div className="admin-form-section--compact">
            <h2 className="admin-form-section__title">Metadata</h2>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-slate-600)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <div>
                <strong>ID:</strong> {user.id.substring(0, 8)}...
              </div>
              <div>
                <strong>Creado:</strong> {new Date(user.created_at).toLocaleDateString('es-ES')}
              </div>
              {user.last_sign_in_at && (
                <div>
                  <strong>Último acceso:</strong> {new Date(user.last_sign_in_at).toLocaleDateString('es-ES')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN - Formulario Principal */}
        <div className="admin-form-main">
          {/* Información de Acceso */}
          <div className="admin-form-section">
            <h2 className="admin-form-section__title">Información de Acceso</h2>

            <div className="admin-form-grid admin-form-grid--2">
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

              <div className="admin-form-group">
                <label htmlFor="password" className="admin-form-label">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="admin-form-input"
                  placeholder="Dejar vacío para no cambiar"
                  minLength={6}
                />
                <p className="admin-form-hint">
                  Solo completar si deseas cambiar la contraseña (mínimo 6 caracteres)
                </p>
              </div>
            </div>
          </div>

          {/* Información Personal */}
          <div className="admin-form-section">
            <h2 className="admin-form-section__title">Información Personal</h2>

            <div className="admin-form-grid admin-form-grid--2">
              <div className="admin-form-group">
                <label htmlFor="full_name" className="admin-form-label admin-form-label--required">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="admin-form-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="username" className="admin-form-label">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="admin-form-input"
                  placeholder="usuario123"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="bio" className="admin-form-label">
                Biografía
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="admin-form-textarea"
                rows={3}
                placeholder="Breve descripción del usuario..."
              />
            </div>
          </div>

          {/* Permisos y Configuración */}
          <div className="admin-form-section">
            <h2 className="admin-form-section__title">Permisos y Configuración</h2>

            <div className="admin-form-grid admin-form-grid--2">
              <div className="admin-form-group">
                <label htmlFor="role" className="admin-form-label admin-form-label--required">
                  Rol
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="admin-form-select"
                  required
                >
                  <option value="viewer">Lector</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Administrador</option>
                </select>
                <p className="admin-form-hint">
                  {formData.role === 'admin' && 'Acceso total al sistema'}
                  {formData.role === 'editor' && 'Puede crear y editar contenido'}
                  {formData.role === 'viewer' && 'Solo lectura'}
                </p>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Agentes AI Asignados
                </label>
                <AgentTagInput
                  userId={userId}
                  selectedAgents={selectedAgents}
                  onAgentsChange={setSelectedAgents}
                />
              </div>
            </div>

            <div className="admin-form-grid admin-form-grid--2">
              <div className="admin-form-group">
                <label htmlFor="preferred_currency" className="admin-form-label">
                  Moneda Preferida
                </label>
                <select
                  id="preferred_currency"
                  value={formData.preferred_currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_currency: e.target.value }))}
                  className="admin-form-select"
                >
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Dólar</option>
                  <option value="GBP">GBP - Libra</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label htmlFor="preferred_language" className="admin-form-label">
                  Idioma Preferido
                </label>
                <select
                  id="preferred_language"
                  value={formData.preferred_language}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_language: e.target.value }))}
                  className="admin-form-select"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="admin-form-section">
            <h2 className="admin-form-section__title">Notificaciones</h2>

            <div className="admin-form-checkbox-group">
              <label className="admin-form-checkbox">
                <input
                  type="checkbox"
                  checked={formData.email_notifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, email_notifications: e.target.checked }))}
                />
                <div className="admin-form-checkbox__content">
                  <span className="admin-form-checkbox__label">Recibir notificaciones por email</span>
                  <p className="admin-form-checkbox__help">
                    El usuario recibirá emails de notificaciones del sistema
                  </p>
                </div>
              </label>

              <label className="admin-form-checkbox">
                <input
                  type="checkbox"
                  checked={formData.marketing_emails}
                  onChange={(e) => setFormData(prev => ({ ...prev, marketing_emails: e.target.checked }))}
                />
                <div className="admin-form-checkbox__content">
                  <span className="admin-form-checkbox__label">Recibir emails de marketing</span>
                  <p className="admin-form-checkbox__help">
                    El usuario recibirá emails promocionales y de marketing
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="admin-form-actions">
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-danger"
              disabled={saving || deleting}
            >
              {deleting ? 'Eliminando...' : 'Eliminar Usuario'}
            </button>
            <div className="admin-form-actions__right">
              <Link href="/admin/usuarios" className="btn btn-secondary">
                Cancelar
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || deleting}
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
