import Link from 'next/link';
import { User } from 'lucide-react';

export interface AgentProfile {
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
  articles_count: number;
  total_views: number;
}

interface AgentCardProps {
  agent: AgentProfile;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const getRoleLabel = (role: string): string => {
    const roles: Record<string, string> = {
      analyst: 'Analista',
      editor: 'Editor',
      researcher: 'Investigador'
    };
    return roles[role] || role;
  };

  return (
    <Link href={`/admin/agentes/${agent.id}/editar`} className="block h-full">
      <div className="agent-profile-card">
        {/* Card Content */}
        <div className="agent-profile-card__content">
          {/* Avatar Section */}
          <div className="agent-profile-card__header">
            <div className="agent-profile-card__avatar-container">
              {agent.avatar_url ? (
                <img
                  src={agent.avatar_url}
                  alt={agent.display_name}
                  className="agent-profile-card__avatar"
                />
              ) : (
                <div className="agent-profile-card__avatar-placeholder">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="agent-profile-card__status">
              <span className={`admin-badge ${agent.is_active ? 'admin-badge--success' : 'admin-badge--inactive'}`}>
                {agent.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="agent-profile-card__body">
            <h3 className="agent-profile-card__name">
              {agent.display_name}
            </h3>

            <p className="agent-profile-card__username">
              @{agent.slug}
            </p>

            {/* Role Badge */}
            <div className="agent-profile-card__role">
              <span className="admin-badge admin-badge--neutral">
                {getRoleLabel(agent.role)}
              </span>
            </div>

            {/* Bio */}
            {agent.bio && (
              <p className="agent-profile-card__bio">
                {agent.bio}
              </p>
            )}

            {/* Expertise Tags */}
            {agent.expertise && agent.expertise.length > 0 && (
              <div className="agent-profile-card__expertise">
                {agent.expertise.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="agent-profile-card__tag">
                    {skill}
                  </span>
                ))}
                {agent.expertise.length > 3 && (
                  <span className="agent-profile-card__tag agent-profile-card__tag--more">
                    +{agent.expertise.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stats Footer */}
          <div className="agent-profile-card__footer">
            <div className="agent-profile-card__stat">
              <span className="agent-profile-card__stat-value">
                {agent.articles_count || 0}
              </span>
              <span className="agent-profile-card__stat-label">Artículos</span>
            </div>
            <div className="agent-profile-card__stat-divider" />
            <div className="agent-profile-card__stat">
              <span className="agent-profile-card__stat-value">
                {(agent.total_views || 0).toLocaleString()}
              </span>
              <span className="agent-profile-card__stat-label">Vistas</span>
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="agent-profile-card__overlay">
          <span className="agent-profile-card__overlay-text">
            Ver perfil
          </span>
        </div>
      </div>
    </Link>
  );
}
