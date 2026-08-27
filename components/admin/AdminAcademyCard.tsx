/**
 * Admin Academy Card - Tarjeta de artículo de Academia para panel de administración
 * Basado en AdminNewsCard pero adaptado para Academia
 */

import Link from 'next/link';
import { Calendar, Eye, Pencil, ArrowUpFromLine, ArrowDownToLine, Trash2, Clock, Signal } from 'lucide-react';
import DifficultyBadge from '../DifficultyBadge';

interface AdminAcademyCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    published_at: string | null;
    views_count: number;
    featured_image_url?: string | null;
    pinned?: boolean;
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
  };
  onPublishToggle: () => void;
  onDelete: () => void;
}

export default function AdminAcademyCard({ article, onPublishToggle, onDelete }: AdminAcademyCardProps) {
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

  const authorName = article.author?.display_name || article.author?.name || 'Sin autor';

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
            {article.pinned && (
              <>
                <span className="text-xs font-semibold text-blue-600">Fijado</span>
                <span className="text-slate-300">•</span>
              </>
            )}
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

        {/* Stats & Badges */}
        <div className="flex items-center gap-3 mb-4 text-xs text-slate-600 flex-wrap">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{article.views_count} lecturas</span>
          </div>
          <div>Por {authorName}</div>
          {article.difficulty_level && (
            <DifficultyBadge level={article.difficulty_level} size="sm" />
          )}
          {article.estimated_reading_time && (
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{article.estimated_reading_time} min</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <Link
            href={`/academia/${article.slug}`}
            target="_blank"
            className="admin-action-btn admin-action-btn--view flex-1 justify-center"
            title="Ver artículo"
          >
            <Eye className="w-4 h-4" />
            <span className="text-xs">Ver</span>
          </Link>
          <Link
            href={`/admin/academia/${article.id}`}
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
