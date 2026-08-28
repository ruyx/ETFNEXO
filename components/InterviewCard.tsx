import Link from 'next/link';
import { Calendar, Eye, Play } from 'lucide-react';

export interface Interview {
  id: string;
  title: string;
  slug: string;
  description: string;
  youtube_video_id: string;
  published_at: string;
  views_count: number;
  category_name?: string | null;
  category_color?: string | null;
}

interface InterviewCardProps {
  interview: Interview;
  variant?: 'default' | 'featured';
}

export default function InterviewCard({
  interview,
  variant = 'default'
}: InterviewCardProps) {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // YouTube thumbnail URL
  const thumbnailUrl = `https://img.youtube.com/vi/${interview.youtube_video_id}/maxresdefault.jpg`;

  if (variant === 'featured') {
    return (
      <Link href={`/entrevistas/${interview.slug}`} className="block">
        <div className="card hover-lift group cursor-pointer bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 overflow-hidden">
          <div className="grid md:grid-cols-[400px_1fr] gap-6">
            {/* YouTube Thumbnail */}
            <div className="relative w-full h-64 md:h-full bg-slate-100 overflow-hidden">
              <img
                src={thumbnailUrl}
                alt={interview.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between py-2">
              <div>
                {/* Category Badge */}
                {interview.category_name && (
                  <div className="mb-3">
                    <span
                      className="inline-block px-3 py-1 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: interview.category_color || 'var(--color-primary)' }}
                    >
                      {interview.category_name}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 line-clamp-2 text-slate-900">
                  {interview.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  {interview.description}
                </p>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <time dateTime={interview.published_at}>
                    {formatDate(interview.published_at)}
                  </time>
                </div>
                {interview.views_count > 0 && (
                  <>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{interview.views_count} vistas</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant (vertical card)
  return (
    <Link href={`/entrevistas/${interview.slug}`} className="block h-full">
      <div className="card hover-lift group cursor-pointer bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 overflow-hidden flex flex-col h-full">
        {/* YouTube Thumbnail */}
        <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={interview.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Category Badge */}
          {interview.category_name && (
            <div className="mb-3">
              <span
                className="inline-block px-2 py-1 text-xs font-semibold rounded-full text-white"
                style={{ backgroundColor: interview.category_color || 'var(--color-primary)' }}
              >
                {interview.category_name}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-base font-bold mb-2 line-clamp-2 text-slate-900 flex-1">
            {interview.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
            {interview.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              <time dateTime={interview.published_at}>
                {formatDate(interview.published_at)}
              </time>
            </div>
            {interview.views_count > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3 h-3" />
                  <span>{interview.views_count}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
