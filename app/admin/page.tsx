/**
 * Admin Dashboard - Página principal del panel de administración
 * Muestra estadísticas generales y accesos rápidos
 */

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

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

  const statCards = [
    {
      title: 'Total Artículos',
      value: stats.totalArticles,
      subtitle: `${stats.publishedArticles} publicados`,
      color: 'bg-blue-500',
      icon: '📰'
    },
    {
      title: 'Borradores',
      value: stats.draftArticles,
      subtitle: 'Sin publicar',
      color: 'bg-yellow-500',
      icon: '✏️'
    },
    {
      title: 'Categorías',
      value: stats.totalCategories,
      subtitle: 'Activas',
      color: 'bg-green-500',
      icon: '📁'
    },
    {
      title: 'Etiquetas',
      value: stats.totalTags,
      subtitle: 'Disponibles',
      color: 'bg-purple-500',
      icon: '🏷️'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Resumen general del panel de administración
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`rounded-md p-3 ${stat.color}`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd>
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stat.subtitle}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/noticias/crear"
            className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            ➕ Crear Noticia
          </Link>
          <Link
            href="/admin/noticias"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            📋 Ver Noticias
          </Link>
          <Link
            href="/admin/categorias"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            🗂️ Gestionar Categorías
          </Link>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Artículos Recientes
          </h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {stats.recentArticles.length === 0 ? (
            <li className="px-6 py-4 text-sm text-gray-500 text-center">
              No hay artículos aún
            </li>
          ) : (
            stats.recentArticles.map((article) => (
              <li key={article.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/noticias/${article.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate block"
                    >
                      {article.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {article.author_name || 'Sin autor'} •{' '}
                      {new Date(article.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {article.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
