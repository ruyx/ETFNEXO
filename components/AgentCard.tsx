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
      <div className="card hover-lift group cursor-pointer bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 overflow-hidden flex flex-col h-full">
        {/* Avatar */}
        <div className="relative w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex items-center justify-center">
          {agent.avatar_url ? (
            <img
              src={agent.avatar_url}
              alt={agent.display_name}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <User className="w-20 h-20" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Name and Status */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {agent.display_name}
              </h3>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  agent.is_active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {agent.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="text-xs text-slate-500">@{agent.slug}</p>
          </div>

          {/* Role Badge */}
          <div className="mb-3">
            <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
              {getRoleLabel(agent.role)}
            </span>
          </div>

          {/* Bio */}
          {agent.bio && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-3 flex-1">
              {agent.bio}
            </p>
          )}

          {/* Expertise Tags */}
          {agent.expertise && agent.expertise.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                {agent.expertise.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {agent.expertise.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
                    +{agent.expertise.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Artículos</span>
              <span className="text-sm font-semibold text-slate-900 tabular-nums">
                {agent.articles_count || 0}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Vistas</span>
              <span className="text-sm font-semibold text-slate-900 tabular-nums">
                {(agent.total_views || 0).toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-blue-600 font-medium group-hover:text-blue-700">
              Editar →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
