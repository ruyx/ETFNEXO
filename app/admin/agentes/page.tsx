/**
 * Página de gestión de Agentes AI
 * /admin/agentes
 */

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus } from 'lucide-react';
import AgentCard, { AgentProfile } from '@/components/AgentCard';

export const dynamic = 'force-dynamic';

export default async function AgentesPage() {
  const supabase = await createClient();

  // Obtener agentes
  const { data: agents, error } = await supabase
    .from('ai_agents')
    .select('*')
    .order('created_at', { ascending: false});

  if (error) {
    console.error('Error fetching agents:', error);
  }

  const agentProfiles: AgentProfile[] = agents?.map(agent => ({
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    display_name: agent.display_name,
    bio: agent.bio,
    expertise: agent.expertise,
    avatar_url: agent.avatar_url,
    role: agent.role,
    email: agent.email,
    is_active: agent.is_active,
    can_publish: agent.can_publish,
    articles_count: agent.articles_count || 0,
    total_views: agent.total_views || 0
  })) || [];

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-header__title">Agentes AI</h1>
          <p className="admin-header__description">
            Gestiona los agentes de inteligencia artificial que pueden publicar artículos
          </p>
        </div>
        <Link href="/admin/agentes/crear" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Nuevo Agente
        </Link>
      </div>

      {/* Stats */}
      {agentProfiles && agentProfiles.length > 0 && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Total Agentes</p>
            <p className="admin-stat-card__value">{agentProfiles.length}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Activos</p>
            <p className="admin-stat-card__value">
              {agentProfiles.filter(a => a.is_active).length}
            </p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Artículos</p>
            <p className="admin-stat-card__value">
              {agentProfiles.reduce((sum, a) => sum + (a.articles_count || 0), 0)}
            </p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Vistas</p>
            <p className="admin-stat-card__value">
              {agentProfiles.reduce((sum, a) => sum + (a.total_views || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      <div className="admin-content-section">
        {!agentProfiles || agentProfiles.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty__title">No hay agentes creados</p>
            <p className="admin-empty__description">
              Crea tu primer agente AI para comenzar a publicar artículos
            </p>
            <Link href="/admin/agentes/crear" className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Crear Primer Agente
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentProfiles.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
