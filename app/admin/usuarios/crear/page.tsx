'use client';

/**
 * Página de creación de Usuarios
 * /admin/usuarios/crear
 */

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  display_name: string;
  role: string;
}

export default function CrearUsuarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    username: '',
    role: 'viewer',
    bio: '',
    agent_id: '',
    preferred_currency: 'EUR',
    preferred_language: 'es',
    email_notifications: true,
    marketing_emails: false
  });

  // Load agents
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        const result = await response.json();
        if (result.data) {
          setAgents(result.data);
        }
      } catch (error) {
        console.error('Error loading agents:', error);
      }
    };

    loadAgents();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validations
      if (!formData.email.trim()) {
        throw new Error('El email es obligatorio');
      }
      if (!formData.password || formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      if (!formData.full_name.trim()) {
        throw new Error('El nombre completo es obligatorio');
      }

      const response = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error || 'Error al crear usuario');
      }

      // Success - redirect to users list
      router.push('/admin/usuarios');
      router.refresh();

    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      {/* Back link */}
      <Link href="/admin/usuarios" className="admin-form-back-link">
        <ArrowLeft className="w-4 h-4" />
        Volver a Usuarios
      </Link>

      {/* Header */}
      <div className="admin-form-header">
        <h1 className="admin-form-title">Crear Nuevo Usuario</h1>
        <p className="admin-form-description">
          Crea un nuevo usuario y asigna permisos y configuración
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
        {/* Información de Acceso */}
        <div className="admin-form-section">
          <h2 className="admin-form-section__title">Información de Acceso</h2>

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
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password" className="admin-form-label admin-form-label--required">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="admin-form-input"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
            <p className="admin-form-help">
              La contraseña debe tener al menos 6 caracteres
            </p>
          </div>
        </div>

        {/* Información Personal */}
        <div className="admin-form-section">
          <h2 className="admin-form-section__title">Información Personal</h2>

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
              placeholder="Juan Pérez"
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
              placeholder="juanperez"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="bio" className="admin-form-label">
              Biografía
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="admin-form-input admin-form-input--textarea"
              rows={4}
              placeholder="Breve descripción del usuario..."
            />
          </div>
        </div>

        {/* Permisos y Configuración */}
        <div className="admin-form-section">
          <h2 className="admin-form-section__title">Permisos y Configuración</h2>

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
            <p className="admin-form-help">
              {formData.role === 'admin' && 'Acceso total al sistema'}
              {formData.role === 'editor' && 'Puede crear y editar contenido'}
              {formData.role === 'viewer' && 'Solo lectura'}
            </p>
          </div>

          <div className="admin-form-group">
            <label htmlFor="agent_id" className="admin-form-label">
              Agente AI Asignado
            </label>
            <select
              id="agent_id"
              value={formData.agent_id}
              onChange={(e) => setFormData(prev => ({ ...prev, agent_id: e.target.value }))}
              className="admin-form-select"
            >
              <option value="">Sin agente asignado</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.display_name} ({agent.role})
                </option>
              ))}
            </select>
            <p className="admin-form-help">
              Agente AI que este usuario gestiona (opcional)
            </p>
          </div>

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

        {/* Form Actions */}
        <div className="admin-form-actions">
          <Link href="/admin/usuarios" className="btn btn-secondary">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creando...' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}
