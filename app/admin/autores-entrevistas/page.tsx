/**
 * Página de gestión de Autores de Entrevistas
 * /admin/autores-entrevistas
 */

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface InterviewAuthor {
  id: string;
  name: string;
  slug: string;
  display_name: string;
  bio: string | null;
  expertise: string[] | null;
  avatar_url: string | null;
  role: string;
  email: string | null;
  is_active: boolean;
  can_publish: boolean;
  interviews_count: number;
  total_views: number;
  created_at: string;
}

export default async function AutoresEntrevistasPage() {
  const supabase = await createClient();

  // Obtener autores
  const { data: authors, error } = await supabase
    .from('interview_authors' as any)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching interview authors:', error);
  }

  const interviewAuthors: InterviewAuthor[] = (authors as InterviewAuthor[]) || [];

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-header__title">Autores de Entrevistas</h1>
          <p className="admin-header__description">
            Gestiona los perfiles de autores y redactores que publican entrevistas
          </p>
        </div>
        <Link href="/admin/autores-entrevistas/crear" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Nuevo Autor
        </Link>
      </div>

      {/* Stats */}
      {interviewAuthors && interviewAuthors.length > 0 && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Total Autores</p>
            <p className="admin-stat-card__value">{interviewAuthors.length}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Activos</p>
            <p className="admin-stat-card__value">
              {interviewAuthors.filter(a => a.is_active).length}
            </p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Entrevistas</p>
            <p className="admin-stat-card__value">
              {interviewAuthors.reduce((sum, a) => sum + (a.interviews_count || 0), 0)}
            </p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Vistas</p>
            <p className="admin-stat-card__value">
              {interviewAuthors.reduce((sum, a) => sum + (a.total_views || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Authors Grid */}
      <div className="admin-content-section">
        {!interviewAuthors || interviewAuthors.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty__title">No hay autores creados</p>
            <p className="admin-empty__description">
              Crea tu primer perfil de autor para comenzar a asignarlos a las entrevistas
            </p>
            <Link href="/admin/autores-entrevistas/crear" className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Crear Primer Autor
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviewAuthors.map((author) => (
              <Link
                key={author.id}
                href={`/admin/autores-entrevistas/${author.id}`}
                className="card hover-lift group cursor-pointer"
              >
                <div className="flex items-start gap-4 p-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {author.avatar_url ? (
                      <img
                        src={author.avatar_url}
                        alt={author.display_name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                        <User className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 truncate">
                        {author.display_name}
                      </h3>
                      {!author.is_active && (
                        <span className="badge badge-inactive">Inactivo</span>
                      )}
                    </div>

                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                      {author.bio || 'Sin biografía'}
                    </p>

                    {/* Expertise Tags */}
                    {author.expertise && author.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {author.expertise.slice(0, 3).map((exp, idx) => (
                          <span key={idx} className="badge badge-primary text-xs">
                            {exp}
                          </span>
                        ))}
                        {author.expertise.length > 3 && (
                          <span className="badge badge-default text-xs">
                            +{author.expertise.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{author.interviews_count || 0} entrevistas</span>
                      <span className="text-slate-300">•</span>
                      <span>{(author.total_views || 0).toLocaleString()} vistas</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
