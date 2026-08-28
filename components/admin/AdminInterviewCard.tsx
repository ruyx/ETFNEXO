/**
 * Admin Interview Card - Tarjeta de entrevista para panel de administración
 */

import Link from 'next/link';
import { Calendar, Eye, Pencil, ArrowUpFromLine, ArrowDownToLine, Trash2, Play } from 'lucide-react';

interface AdminInterviewCardProps {
  interview: {
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
  };
  onPublishToggle: () => void;
  onDelete: () => void;
}

export default function AdminInterviewCard({ interview, onPublishToggle, onDelete }: AdminInterviewCardProps) {
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

  // YouTube thumbnail URL
  const thumbnailUrl = `https://img.youtube.com/vi/${interview.youtube_video_id}/mqdefault.jpg`;

  return (
    <div className="card hover-lift bg-white border-slate-200 overflow-hidden flex flex-col h-full">
      {/* YouTube Thumbnail */}
      <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={interview.title}
          className="object-cover transition-transform duration-300"
          style={{ width: '100%', height: '100%' }}
        />
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Meta */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={interview.created_at}>
                {formatDate(interview.created_at)}
              </time>
            </div>
            {interview.category && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-600 font-medium">
                  {interview.category.name}
                </span>
              </>
            )}
          </div>
          {getStatusBadge(interview.status)}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 flex-1">
          {interview.title}
        </h3>

        {/* Slug */}
        <p className="text-xs text-slate-500 font-mono mb-3">
          /{interview.slug}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 mb-4 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{interview.views_count} vistas</span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {interview.youtube_video_id}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <Link
            href={`/entrevistas/${interview.slug}`}
            target="_blank"
            className="admin-action-btn admin-action-btn--view flex-1 justify-center"
            title="Ver entrevista"
          >
            <Eye className="w-4 h-4" />
            <span className="text-xs">Ver</span>
          </Link>
          <Link
            href={`/admin/entrevistas/${interview.id}`}
            className="admin-action-btn admin-action-btn--edit flex-1 justify-center"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
            <span className="text-xs">Editar</span>
          </Link>
          <button
            onClick={onPublishToggle}
            className={`admin-action-btn flex-1 justify-center ${
              interview.status === 'published'
                ? 'admin-action-btn--unpublish'
                : 'admin-action-btn--publish'
            }`}
            title={interview.status === 'published' ? 'Despublicar' : 'Publicar'}
          >
            {interview.status === 'published' ? (
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
