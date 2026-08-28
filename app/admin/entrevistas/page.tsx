'use client';

/**
 * Admin Entrevistas - Listado de entrevistas para gestión
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Plus } from 'lucide-react';
import AdminInterviewCard from '@/components/admin/AdminInterviewCard';

interface Interview {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  published_at: string | null;
  views_count: number;
  youtube_video_id: string;
  category: {
    name: string;
    slug: string;
    color_hex?: string;
  } | null;
}

export default function AdminEntrevistasPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    loadInterviews();
  }, [filter, currentPage]);

  useEffect(() => {
    const created = searchParams.get('created');
    const updated = searchParams.get('updated');

    if (created === 'true') {
      setSuccessMessage('Entrevista creada exitosamente');
      router.replace('/admin/entrevistas', { scroll: false });
    } else if (updated === 'true') {
      setSuccessMessage('Entrevista actualizada exitosamente');
      router.replace('/admin/entrevistas', { scroll: false });
    }
  }, [searchParams]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
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

      const response = await fetch(`/api/admin/entrevistas?${params}`);

      if (!response.ok) {
        throw new Error('Error al cargar entrevistas');
      }

      const result = await response.json();

      setInterviews(result.data.interviews || []);
      setTotalPages(result.data.pagination.totalPages);
    } catch (error) {
      console.error('Error loading interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadInterviews();
  };

  const handlePublishToggle = async (interview: Interview) => {
    const willPublish = interview.status !== 'published';

    if (confirm(`¿Seguro que quieres ${willPublish ? 'publicar' : 'despublicar'} esta entrevista?`)) {
      try {
        const response = await fetch(`/api/admin/entrevistas/${interview.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...interview,
            status: willPublish ? 'published' : 'draft'
          })
        });

        if (!response.ok) throw new Error('Error al cambiar estado');

        loadInterviews();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al cambiar el estado de la entrevista');
      }
    }
  };

  const handleDelete = async (interview: Interview) => {
    if (confirm(`¿Seguro que quieres eliminar "${interview.title}"? Esta acción no se puede deshacer.`)) {
      try {
        const response = await fetch(`/api/admin/entrevistas/${interview.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar');

        loadInterviews();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la entrevista');
      }
    }
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-header__title">Entrevistas</h1>
          <p className="admin-header__description">
            Gestiona todas las entrevistas en video del sitio
          </p>
        </div>
        <Link href="/admin/entrevistas/crear" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Crear Entrevista
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
              placeholder="Buscar entrevistas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-filters__search-input"
            />
          </form>
        </div>
      </div>

      {/* Interviews Grid */}
      {loading ? (
        <div className="admin-loading">
          <p className="admin-loading__text">Cargando entrevistas...</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="admin-empty-state">
          <p className="admin-empty-state__text">No se encontraron entrevistas</p>
        </div>
      ) : (
        <>
          <div className="admin-cards-grid">
            {interviews.map((interview) => (
              <AdminInterviewCard
                key={interview.id}
                interview={interview}
                onPublishToggle={() => handlePublishToggle(interview)}
                onDelete={() => handleDelete(interview)}
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
