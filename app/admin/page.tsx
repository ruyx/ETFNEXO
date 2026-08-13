/**
 * Admin Dashboard - Página principal del panel de administración
 * Muestra estadísticas generales y accesos rápidos
 */

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FileText, FileEdit, Folder, Tags, Plus, List, Users, FolderOpen } from 'lucide-react';

export const metadata = {
  title: 'Dashboard Admin - ETF Nexo',
  description: 'Panel de control del administrador'
};

async function getStats() {
  const supabase = await createClient();

  // Obtener estadísticas en paralelo
  const [
    { count: totalArticles },
    { count: publishedArticles },
    { count: draftArticles },
    { count: totalCategories },
    { count: totalTags }
  ] = await Promise.all([
    supabase.from('news_articles').select('*', { count: 'exact', head: true }),
    supabase.from('news_articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('news_articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('news_categories').select('*', { count: 'exact', head: true }),
    supabase.from('news_tags').select('*', { count: 'exact', head: true })
  ]);

  // Obtener artículos recientes
  const { data: recentArticles } = await supabase
    .from('news_articles')
    .select('id, title, status, created_at, author_name')
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    totalArticles: totalArticles || 0,
    publishedArticles: publishedArticles || 0,
    draftArticles: draftArticles || 0,
    totalCategories: totalCategories || 0,
    totalTags: totalTags || 0,
    recentArticles: recentArticles || []
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-header__title">Dashboard</h1>
          <p className="admin-header__description">
            Resumen general del panel de administración
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon">
            <FileText className="w-6 h-6" />
          </div>
          <div className="admin-stat-card__content">
            <p className="admin-stat-card__label">Total Artículos</p>
            <p className="admin-stat-card__value">{stats.totalArticles}</p>
            <p className="admin-stat-card__subtitle">{stats.publishedArticles} publicados</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--warning">
            <FileEdit className="w-6 h-6" />
          </div>
          <div className="admin-stat-card__content">
            <p className="admin-stat-card__label">Borradores</p>
            <p className="admin-stat-card__value">{stats.draftArticles}</p>
            <p className="admin-stat-card__subtitle">Sin publicar</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--success">
            <Folder className="w-6 h-6" />
          </div>
          <div className="admin-stat-card__content">
            <p className="admin-stat-card__label">Categorías</p>
            <p className="admin-stat-card__value">{stats.totalCategories}</p>
            <p className="admin-stat-card__subtitle">Activas</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--info">
            <Tags className="w-6 h-6" />
          </div>
          <div className="admin-stat-card__content">
            <p className="admin-stat-card__label">Etiquetas</p>
            <p className="admin-stat-card__value">{stats.totalTags}</p>
            <p className="admin-stat-card__subtitle">Disponibles</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h2 className="admin-card__title">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/noticias/crear" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Crear Noticia
          </Link>
          <Link href="/admin/noticias" className="btn btn-secondary">
            <List className="w-4 h-4" />
            Ver Noticias
          </Link>
          <Link href="/admin/agentes" className="btn btn-secondary">
            <Users className="w-4 h-4" />
            Gestionar Agentes
          </Link>
          <Link href="/admin/categorias" className="btn btn-secondary">
            <FolderOpen className="w-4 h-4" />
            Gestionar Categorías
          </Link>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="admin-card">
        <h2 className="admin-card__title">Artículos Recientes</h2>
        <div className="admin-list">
          {stats.recentArticles.length === 0 ? (
            <div className="admin-list__empty">
              No hay artículos aún
            </div>
          ) : (
            stats.recentArticles.map((article) => (
              <div key={article.id} className="admin-list__item">
                <div className="admin-list__item-content">
                  <Link
                    href={`/admin/noticias/${article.id}`}
                    className="admin-list__item-title"
                  >
                    {article.title}
                  </Link>
                  <p className="admin-list__item-meta">
                    {article.author_name || 'Sin autor'} •{' '}
                    {new Date(article.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <span
                  className={`admin-badge ${
                    article.status === 'published'
                      ? 'admin-badge--success'
                      : 'admin-badge--inactive'
                  }`}
                >
                  {article.status === 'published' ? 'Publicado' : 'Borrador'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
