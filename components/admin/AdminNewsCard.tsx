/**
 * Admin News Card - Tarjeta de noticia para panel de administración
 * Basado en NewsCard pero con acciones de admin
 */

import Link from 'next/link';
import { Calendar, Eye, Pencil, ArrowUpFromLine, ArrowDownToLine, Trash2 } from 'lucide-react';

interface AdminNewsCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    author_name: string | null;
    created_at: string;
    published_at: string | null;
    views_count: number;
    featured_image_url?: string | null;
    category: {
      name: string;
      slug: string;
    } | null;
  };
  onPublishToggle: () => void;
  onDelete: () => void;
}

export default function AdminNewsCard({ article, onPublishToggle, onDelete }: AdminNewsCardProps) {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const classMap = {
      published: 'status-badge--published',
      draft: 'status-badge--draft',
      archived: 'status-badge--archived'
    };

    const labels = {
      published: 'Publicado',
      draft: 'Borrador',
      archived: 'Archivado'
    };

    return (
      <span className={`status-badge ${classMap[status as keyof typeof classMap]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="card hover-lift bg-white border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Featured Image */}
      {article.featured_image_url && (
        <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="object-cover transition-transform duration-300"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Meta */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={article.created_at}>
                {formatDate(article.created_at)}
              </time>
            </div>
            {article.category && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-600 font-medium">
                  {article.category.name}
                </span>
              </>
            )}
          </div>
          {getStatusBadge(article.status)}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 flex-1">
          {article.title}
        </h3>

        {/* Slug */}
        <p className="text-xs text-slate-500 font-mono mb-3">
          /{article.slug}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{article.views_count} vistas</span>
          </div>
          {article.author_name && (
            <div>Por {article.author_name}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <Link
            href={`/noticias/${article.slug}`}
            target="_blank"
            className="admin-action-btn admin-action-btn--view flex-1 justify-center"
            title="Ver artículo"
          >
            <Eye className="w-4 h-4" />
            <span className="text-xs">Ver</span>
          </Link>
          <Link
            href={`/admin/noticias/${article.id}`}
            className="admin-action-btn admin-action-btn--edit flex-1 justify-center"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
            <span className="text-xs">Editar</span>
          </Link>
          <button
            onClick={onPublishToggle}
            className={`admin-action-btn flex-1 justify-center ${
              article.status === 'published'
                ? 'admin-action-btn--unpublish'
                : 'admin-action-btn--publish'
            }`}
            title={article.status === 'published' ? 'Despublicar' : 'Publicar'}
          >
            {article.status === 'published' ? (
              <>
                <ArrowDownToLine className="w-4 h-4" />
                <span className="text-xs">Ocultar</span>
              </>
            ) : (
              <>
                <ArrowUpFromLine className="w-4 h-4" />
                <span className="text-xs">Publicar</span>
              </>
            )}
          </button>
          <button
            onClick={onDelete}
            className="admin-action-btn admin-action-btn--delete"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
