'use client';

/**
 * Página de creación de Agentes AI - Layout Moderno
 * /admin/agentes/crear
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Briefcase, Shield, Sparkles } from 'lucide-react';
import AvatarUpload from '@/components/admin/AvatarUpload';

export default function CrearAgentePage() {
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
    role: 'analyst' as 'analyst' | 'editor' | 'researcher' | 'journalist' | 'guest',
    agent_type: 'redactor' as 'redactor' | 'educador' | 'entrevistador',
    email: '',
    signature: '',
    avatar_url: '',
    is_active: true,
    can_publish: true
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
      if (!formData.email.trim()) {
        throw new Error('El email es obligatorio');
      }

      // Build final expertise array (include pending input if exists)
      let finalExpertise = [...formData.expertise];
      const trimmedInput = formData.expertiseInput.trim();
      if (trimmedInput && !finalExpertise.includes(trimmedInput)) {
        finalExpertise.push(trimmedInput);
      }

      // Validate expertise
      if (finalExpertise.length === 0) {
        throw new Error('Debes añadir al menos una área de experticia. Escribe una habilidad y presiona Enter o haz clic en Añadir.');
      }

      // Prepare data
      const agentData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        display_name: formData.display_name.trim(),
        bio: formData.bio.trim() || null,
        expertise: finalExpertise,
        role: formData.role,
        agent_type: formData.agent_type,
        email: formData.email.trim(),
        signature: formData.signature.trim() || null,
        avatar_url: formData.avatar_url.trim() || null,
        is_active: formData.is_active,
        can_publish: formData.can_publish
      };

      const response = await fetch('/api/admin/agentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al crear el agente');
      }

      // Success - redirect to agents list
      router.push('/admin/agentes');
      router.refresh();

    } catch (err: any) {
      console.error('Error creating agent:', err);
      setError(err.message || 'Error al crear el agente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      {/* Back link */}
      <Link href="/admin/agentes" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Volver a Agentes</span>
      </Link>

      {/* Header con icono */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Crear Nuevo Agente AI</h1>
            <p className="text-slate-600 mt-1">
              Crea un perfil de agente de inteligencia artificial que podrá publicar contenido
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form - Layout de 2 columnas en pantallas grandes */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Información Básica</h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                    Nombre del Agente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ej: SantIAgo, EstefanIA"
                    required
                  />
                  <p className="mt-1.5 text-sm text-slate-500">
                    El nombre completo del agente (se generará automáticamente el slug)
                  </p>
                </div>

                {/* Slug */}
                <div>
                  <label htmlFor="slug" className="block text-sm font-semibold text-slate-900 mb-2">
                    Slug (URL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                    placeholder="santiago"
                    required
                  />
                  <p className="mt-1.5 text-sm text-slate-500">
                    URL del perfil: <span className="font-mono text-blue-600">/agentes/{formData.slug || 'slug'}</span>
                  </p>
                </div>

                {/* Display Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="display_name" className="block text-sm font-semibold text-slate-900 mb-2">
                      Nombre para Mostrar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="SantIAgo"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="santiago@etfnexo.com"
                      required
                    />
                  </div>
                </div>

                {/* Role & Agent Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="role" className="block text-sm font-semibold text-slate-900 mb-2">
                      Rol <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="analyst">Analista</option>
                      <option value="editor">Editor</option>
                      <option value="researcher">Investigador</option>
                      <option value="journalist">Periodista</option>
                      <option value="guest">Invitado</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="agent_type" className="block text-sm font-semibold text-slate-900 mb-2">
                      Tipo de Agente <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="agent_type"
                      value={formData.agent_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, agent_type: e.target.value as any }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="redactor">Redactor (Noticias)</option>
                      <option value="educador">Educador (Academia)</option>
                      <option value="entrevistador">Entrevistador</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Perfil y Experticia */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Perfil y Experticia</h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-semibold text-slate-900 mb-2">
                    Biografía
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    rows={6}
                    placeholder="Describe la especialidad y enfoque del agente..."
                  />
                  <p className="mt-1.5 text-sm text-slate-500">
                    Descripción del agente que aparecerá en su perfil
                  </p>
                </div>

                {/* Expertise */}
                <div>
                  <label htmlFor="expertise" className="block text-sm font-semibold text-slate-900 mb-2">
                    Áreas de Experticia <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="expertise"
                      value={formData.expertiseInput}
                      onChange={(e) => setFormData(prev => ({ ...prev, expertiseInput: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Escribe y presiona Enter..."
                    />
                    <button
                      type="button"
                      onClick={addExpertise}
                      className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                    >
                      Añadir
                    </button>
                  </div>

                  {/* Tags list */}
                  {formData.expertise.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.expertise.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeExpertise(skill)}
                            className="hover:bg-blue-100 rounded px-1 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-1.5 text-sm text-slate-500">
                    Ej: ETFs, Análisis de Mercados, ESG, Inversión Sostenible
                  </p>
                </div>

                {/* Signature */}
                <div>
                  <label htmlFor="signature" className="block text-sm font-semibold text-slate-900 mb-2">
                    Firma
                  </label>
                  <input
                    type="text"
                    id="signature"
                    value={formData.signature}
                    onChange={(e) => setFormData(prev => ({ ...prev, signature: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="— SantIAgo, Analista de ETFs en ETF Nexo"
                  />
                  <p className="mt-1.5 text-sm text-slate-500">
                    Texto que aparecerá al final de los artículos del agente
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Lateral (1/3) */}
          <div className="space-y-6">
            {/* Avatar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-900">Avatar del Agente</h3>
              </div>
              <div className="p-6">
                <AvatarUpload
                  currentAvatarUrl={formData.avatar_url}
                  onAvatarChange={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
                  agentSlug={formData.slug || 'new-agent'}
                />
              </div>
            </div>

            {/* Permisos */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Permisos</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="mt-0.5 w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  <div className="flex-1">
                    <span className="block font-semibold text-slate-900">Agente activo</span>
                    <p className="text-sm text-slate-500 mt-0.5">
                      El agente aparecerá en listados y podrá ser seleccionado
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.can_publish}
                    onChange={(e) => setFormData(prev => ({ ...prev, can_publish: e.target.checked }))}
                    className="mt-0.5 w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  <div className="flex-1">
                    <span className="block font-semibold text-slate-900">Puede publicar</span>
                    <p className="text-sm text-slate-500 mt-0.5">
                      El agente puede ser asignado como autor de artículos
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions - Sticky bottom */}
        <div className="sticky bottom-0 mt-8 py-6 bg-white border-t border-slate-200 shadow-lg rounded-t-xl">
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/agentes"
              className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creando...' : 'Crear Agente'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
