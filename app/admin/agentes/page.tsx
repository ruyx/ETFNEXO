/**
 * Página de gestión de Agentes AI
 * /admin/agentes
 */

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

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
  is_active: boolean;
  can_publish: boolean;
  signature: string;
  articles_count: number;
  total_views: number;
  created_at: string;
}

export default async function AgentesPage() {
  const supabase = await createClient();

  // Obtener agentes
  const { data: agents, error } = await supabase
    .from('ai_agents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching agents:', error);
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Agentes AI</h1>
          <p className="admin-page-description">
            Gestiona los agentes de inteligencia artificial que pueden publicar artículos
          </p>
        </div>
        <Link href="/admin/agentes/crear" className="btn btn--primary">
          + Nuevo Agente
        </Link>
      </div>

      {/* Stats Cards */}
      {agents && agents.length > 0 && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Total Agentes</p>
            <p className="admin-stat-card__value">{agents.length}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Agentes Activos</p>
            <p className="admin-stat-card__value">
              {agents.filter(a => a.is_active).length}
            </p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Artículos Publicados</p>
            <p className="admin-stat-card__value">
              {agents.reduce((sum, a) => sum + (a.articles_count || 0), 0)}
            </p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Vistas Totales</p>
            <p className="admin-stat-card__value">
              {agents.reduce((sum, a) => sum + (a.total_views || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Agents Table */}
      <div className="admin-table-container">
        {!agents || agents.length === 0 ? (
          <div className="admin-empty-state">
            <p className="admin-empty-state__title">No hay agentes creados</p>
            <p className="admin-empty-state__description">
              Crea tu primer agente AI para comenzar a publicar artículos
            </p>
            <Link href="/admin/agentes/crear" className="btn btn--primary">
              Crear Primer Agente
            </Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Agente</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Experticia</th>
                <th>Artículos</th>
                <th>Vistas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent: Agent) => (
                <tr key={agent.id}>
                  <td>
                    <span
                      className={`admin-badge ${
                        agent.is_active ? 'admin-badge--success' : 'admin-badge--error'
                      }`}
                    >
                      {agent.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-user">
                      {agent.avatar_url ? (
                        <img
                          src={agent.avatar_url}
                          alt={agent.display_name}
                          className="admin-table-user__avatar"
                        />
                      ) : (
                        <div className="admin-table-user__avatar admin-table-user__avatar--placeholder">
                          {agent.display_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="admin-table-user__name">{agent.display_name}</p>
                        <p className="admin-table-user__meta">@{agent.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="admin-table-cell--muted">{agent.email}</td>
                  <td>
                    <span className="admin-badge admin-badge--info">
                      {agent.role === 'analyst' ? 'Analista' :
                       agent.role === 'editor' ? 'Editor' :
                       'Investigador'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-tag-list">
                      {agent.expertise?.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="admin-tag admin-tag--compact">
                          {skill}
                        </span>
                      ))}
                      {agent.expertise?.length > 2 && (
                        <span className="admin-tag admin-tag--compact admin-tag--muted">
                          +{agent.expertise.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="admin-table-cell--number">
                    {agent.articles_count || 0}
                  </td>
                  <td className="admin-table-cell--number">
                    {(agent.total_views || 0).toLocaleString()}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Link
                        href={`/admin/agentes/${agent.id}/editar`}
                        className="admin-table-action"
                        title="Editar"
                      >
                        ✏️
                      </Link>
                      <Link
                        href={`/agentes/${agent.slug}`}
                        className="admin-table-action"
                        title="Ver perfil"
                        target="_blank"
                      >
                        👁️
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
