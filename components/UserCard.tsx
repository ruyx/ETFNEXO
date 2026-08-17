import Link from 'next/link';
import { User } from 'lucide-react';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string | null;
  avatar_url?: string | null;
  role: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  assigned_agents_count?: number;
}

interface UserCardProps {
  user: UserProfile;
}

export default function UserCard({ user }: UserCardProps) {
  const getRoleLabel = (role: string): string => {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      editor: 'Editor',
      viewer: 'Lector',
      redactor: 'Redactor'
    };
    return roles[role] || role;
  };

  const getRoleBadgeClass = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'admin-badge--danger';
      case 'editor':
        return 'admin-badge--warning';
      case 'redactor':
        return 'admin-badge--info';
      default:
        return 'admin-badge--neutral';
    }
  };

  const initials = user.full_name?.charAt(0).toUpperCase() || 'U';
  const isVerified = !!user.email_confirmed_at;

  return (
    <Link href={`/admin/usuarios/${user.id}`} className="block h-full">
      <div className="agent-profile-card">
        {/* Card Content */}
        <div className="agent-profile-card__content">
          {/* Avatar Section */}
          <div className="agent-profile-card__header">
            <div className="agent-profile-card__avatar-container">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
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
              <span className={`admin-badge ${isVerified ? 'admin-badge--success' : 'admin-badge--warning'}`}>
                {isVerified ? 'Verificado' : 'Pendiente'}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="agent-profile-card__body">
            <h3 className="agent-profile-card__name">
              {user.full_name}
            </h3>

            {user.username && (
              <p className="agent-profile-card__username">
                @{user.username}
              </p>
            )}

            {/* Role Badge */}
            <div className="agent-profile-card__role">
              <span className={`admin-badge ${getRoleBadgeClass(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>

            {/* Email */}
            <p className="agent-profile-card__bio">
              {user.email}
            </p>

            {/* Assigned Agents (if available) */}
            {user.assigned_agents_count !== undefined && user.assigned_agents_count > 0 && (
              <div className="agent-profile-card__expertise">
                <span className="agent-profile-card__tag">
                  {user.assigned_agents_count} {user.assigned_agents_count === 1 ? 'Agente' : 'Agentes'} AI
                </span>
              </div>
            )}
          </div>

          {/* Stats Footer */}
          <div className="agent-profile-card__footer">
            <div className="agent-profile-card__stat">
              <span className="agent-profile-card__stat-value">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short'
                    })
                  : '-'}
              </span>
              <span className="agent-profile-card__stat-label">Registrado</span>
            </div>
            <div className="agent-profile-card__stat-divider" />
            <div className="agent-profile-card__stat">
              <span className="agent-profile-card__stat-value">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short'
                    })
                  : 'Nunca'}
              </span>
              <span className="agent-profile-card__stat-label">Último acceso</span>
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="agent-profile-card__overlay">
          <span className="agent-profile-card__overlay-text">
            Editar usuario
          </span>
        </div>
      </div>
    </Link>
  );
}
