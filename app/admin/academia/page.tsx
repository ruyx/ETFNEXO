'use client';

/**
 * Admin Academia - Listado de artículos educativos
 * Página para gestionar todos los artículos de Academia (ver, editar, eliminar, publicar)
 * Usa el sistema de diseño ETF Nexo
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Plus } from 'lucide-react';
import AdminAcademyCard from '@/components/admin/AdminAcademyCard';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  published_at: string | null;
  views_count: number;
  featured_image_url?: string | null;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | null;
  estimated_reading_time?: number | null;
  category: {
    name: string;
    slug: string;
  } | null;
  author: {
    name: string;
    display_name: string;
  } | null;
}

export default function AdminAcademiaPage() {
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
      router.replace('/admin/academia', { scroll: false });
    } else if (updated === 'true') {
      setSuccessMessage('Artículo actualizado exitosamente');
      router.replace('/admin/academia', { scroll: false });
    }
  }, [searchParams]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (filter !== 'all') {
        params.set('status', filter);
      }

      if (searchTerm) {
        params.set('search', searchTerm);
      }

      // Call API endpoint (uses admin client, bypasses RLS)
      const response = await fetch(`/api/admin/academia?${params}`);

      if (!response.ok) {
        throw new Error('Error al cargar artículos');
      }

      const result = await response.json();

      setArticles(result.data.articles || []);
      setTotalPages(result.data.pagination.totalPages);
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
        const response = await fetch(`/api/admin/academia/${article.id}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publish: willPublish })
        });

        if (!response.ok) throw new Error('Error al cambiar estado');

        loadArticles();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al cambiar el estado del artículo');
      }
    }
  };

  const handleDelete = async (article: Article) => {
    if (confirm(`¿Seguro que quieres eliminar "${article.title}"? Esta acción no se puede deshacer.`)) {
      try {
        const response = await fetch(`/api/admin/academia/${article.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar');

        loadArticles();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el artículo');
      }
    }
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-header__title">Academia</h1>
          <p className="admin-header__description">
            Gestiona todos los artículos educativos del sitio
          </p>
        </div>
        <Link href="/admin/academia/crear" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Crear Artículo
        </Link>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="admin-success-message">
          <span className="admin-success-message__text">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            className="admin-success-message__close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="admin-filters">
        <div className="admin-filters__content">
          {/* Filter Tabs */}
          <div className="admin-filters__tabs">
            {(['all', 'published', 'draft', 'archived'] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setCurrentPage(1);
                }}
                className={`admin-filters__tab ${
                  filter === f ? 'admin-filters__tab--active' : ''
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'published' ? 'Publicados' : f === 'draft' ? 'Borradores' : 'Archivados'}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="admin-filters__search">
            <input
              type="search"
              placeholder="Buscar artículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-filters__search-input"
            />
          </form>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="admin-loading">
          <p className="admin-loading__text">Cargando artículos...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="admin-empty-state">
          <p className="admin-empty-state__text">No se encontraron artículos</p>
        </div>
      ) : (
        <>
          <div className="admin-cards-grid">
            {articles.map((article) => (
              <AdminAcademyCard
                key={article.id}
                article={article}
                onPublishToggle={() => handlePublishToggle(article)}
                onDelete={() => handleDelete(article)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination" style={{ marginTop: 'var(--spacing-8)' }}>
              <div className="admin-pagination__mobile">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="admin-pagination__btn"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="admin-pagination__btn"
                >
                  Siguiente
                </button>
              </div>
              <div className="admin-pagination__desktop">
                <div className="admin-pagination__info">
                  Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                </div>
                <div className="admin-pagination__controls">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="admin-pagination__btn"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="admin-pagination__btn"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
