'use client';

/**
 * Admin Noticias - Listado de artículos
 * Página para gestionar todos los artículos (ver, editar, eliminar, publicar)
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Plus, Eye, Pencil, ArrowUpFromLine, ArrowDownToLine, Trash2 } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  author_name: string | null;
  created_at: string;
  published_at: string | null;
  views_count: number;
  category: {
    name: string;
    slug: string;
  } | null;
}

export default function AdminNoticiasPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    loadArticles();
  }, [filter, currentPage]);

  useEffect(() => {
    // Check for success messages from URL params
    const created = searchParams.get('created');
    const updated = searchParams.get('updated');

    if (created === 'true') {
      setSuccessMessage('Artículo creado exitosamente');
      // Clear URL params
      router.replace('/admin/noticias', { scroll: false });
    } else if (updated === 'true') {
      setSuccessMessage('Artículo actualizado exitosamente');
      // Clear URL params
      router.replace('/admin/noticias', { scroll: false });
    }
  }, [searchParams]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      let query = supabase
        .from('news_articles')
        .select(`
          *,
          category:news_categories(name, slug)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * 20, currentPage * 20 - 1);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setArticles(data || []);
      setTotalPages(Math.ceil((count || 0) / 20));
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadArticles();
  };

  const handlePublishToggle = async (article: Article) => {
    const willPublish = article.status !== 'published';

    if (confirm(`¿Seguro que quieres ${willPublish ? 'publicar' : 'despublicar'} este artículo?`)) {
      try {
        const response = await fetch(`/api/admin/noticias/${article.id}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publish: willPublish })
        });

        if (!response.ok) throw new Error('Error al cambiar estado');

        loadArticles(); // Recargar lista
      } catch (error) {
        console.error('Error:', error);
        alert('Error al cambiar el estado del artículo');
      }
    }
  };

  const handleDelete = async (article: Article) => {
    if (confirm(`¿Seguro que quieres eliminar "${article.title}"? Esta acción no se puede deshacer.`)) {
      try {
        const response = await fetch(`/api/admin/noticias/${article.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar');

        loadArticles(); // Recargar lista
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el artículo');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      published: 'Publicado',
      draft: 'Borrador',
      archived: 'Archivado'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Noticias</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona todos los artículos del sitio
          </p>
        </div>
        <Link
          href="/admin/noticias/crear"
          className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Crear Noticia
        </Link>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter Tabs */}
          <div className="flex space-x-2">
            {['all', 'published', 'draft', 'archived'].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f as any);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filter === f
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'published' ? 'Publicados' : f === 'draft' ? 'Borradores' : 'Archivados'}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <input
              type="search"
              placeholder="Buscar artículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando artículos...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron artículos</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vistas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {article.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          /{article.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(article.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.category?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.author_name || 'Sin autor'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(article.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.views_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      href={`/noticias/${article.slug}`}
                      target="_blank"
                      className="text-gray-600 hover:text-gray-900 inline-flex"
                      title="Ver artículo"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/noticias/${article.id}`}
                      className="text-blue-600 hover:text-blue-900 inline-flex"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handlePublishToggle(article)}
                      className={`inline-flex ${
                        article.status === 'published'
                          ? 'text-yellow-600 hover:text-yellow-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                      title={article.status === 'published' ? 'Despublicar' : 'Publicar'}
                    >
                      {article.status === 'published' ? (
                        <ArrowUpFromLine className="w-4 h-4" />
                      ) : (
                        <ArrowDownToLine className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(article)}
                      className="text-red-600 hover:text-red-900 inline-flex"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Página <span className="font-medium">{currentPage}</span> de{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
