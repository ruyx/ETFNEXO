import Link from 'next/link'
import { Calendar, User } from 'lucide-react'
import DifficultyBadge, { DifficultyLevel } from './DifficultyBadge'
import ReadingTimeBadge from './ReadingTimeBadge'

export interface AcademyArticle {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  featured_image_url: string | null
  published_at: string
  author_name?: string | null
  agent_display_name?: string | null
  category_name?: string | null
  difficulty_level?: DifficultyLevel | null
  estimated_reading_time?: number | null
  pinned?: boolean
}

interface AcademyCardProps {
  article: AcademyArticle
  variant?: 'default' | 'featured' | 'card'
}

export default function AcademyCard({
  article,
  variant = 'default'
}: AcademyCardProps) {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  const getExcerpt = (maxLength: number = 150): string => {
    // Si hay excerpt definido, usarlo (limpiando HTML primero)
    if (article.excerpt) {
      const cleanExcerpt = article.excerpt.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
      if (cleanExcerpt.length <= maxLength) return cleanExcerpt
      return cleanExcerpt.substring(0, maxLength).trim() + '...'
    }

    // Si no, extraer del contenido
    const text = article.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  const authorName = article.agent_display_name || article.author_name || 'ETF Nexo'

  if (variant === 'featured') {
    return (
      <Link href={`/academia/${article.slug}`} className="block">
        <div className="card hover-lift group cursor-pointer bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 overflow-hidden">
          <div className="grid md:grid-cols-[300px_1fr] gap-6">
            {/* Featured Image */}
            {article.featured_image_url && (
              <div className="relative w-full h-48 md:h-full bg-slate-100 overflow-hidden">
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex flex-col justify-between py-2">
              <div>
                {/* Meta & Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {article.pinned && (
                    <>
                      <span className="text-xs font-semibold">Fijado</span>
                      <span className="text-slate-300">•</span>
                    </>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <time dateTime={article.published_at}>
                      {formatDate(article.published_at)}
                    </time>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-600 font-medium">
                    {authorName}
                  </span>
                  {article.difficulty_level && (
                    <>
                      <span className="text-slate-300">•</span>
                      <DifficultyBadge level={article.difficulty_level} size="sm" />
                    </>
                  )}
                  {article.estimated_reading_time && (
                    <>
                      <span className="text-slate-300">•</span>
                      <ReadingTimeBadge minutes={article.estimated_reading_time} size="sm" />
                    </>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 line-clamp-2 academy-title">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  {getExcerpt(200)}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User className="w-3 h-3" />
                  <span>Por: <span className="font-medium text-slate-700">{authorName}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-xs academy-card-link">
                  Leer artículo completo
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Card variant (vertical card with image on top)
  if (variant === 'card') {
    return (
      <Link href={`/academia/${article.slug}`} className="block h-full">
        <div className="card hover-lift group cursor-pointer bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 overflow-hidden flex flex-col h-full">
          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            {/* Meta & Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {article.pinned && (
                <>
                  <span className="text-xs font-semibold">Fijado</span>
                  <span className="text-slate-300">•</span>
                </>
              )}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <time dateTime={article.published_at}>
                  {formatDate(article.published_at)}
                </time>
              </div>
              {article.difficulty_level && (
                <>
                  <span className="text-slate-300">•</span>
                  <DifficultyBadge level={article.difficulty_level} size="sm" />
                </>
              )}
              {article.estimated_reading_time && (
                <>
                  <span className="text-slate-300">•</span>
                  <ReadingTimeBadge minutes={article.estimated_reading_time} size="sm" />
                </>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base font-bold mb-2 line-clamp-3 academy-title">
              {article.title}
            </h3>

            {/* Excerpt */}
            <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">
              {getExcerpt(150)}
            </p>

            {/* Footer */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <User className="w-3 h-3" />
                <span>Por: <span className="font-medium text-slate-700">{authorName}</span></span>
              </div>
              <div className="text-xs academy-card-link">
                Leer artículo completo →
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Default variant (compact)
  return (
    <Link href={`/academia/${article.slug}`} className="block">
      <div className="card hover-lift group cursor-pointer bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 overflow-hidden">
        <div className="flex gap-4">
          {/* Thumbnail */}
          {article.featured_image_url && (
            <div className="relative w-24 h-24 flex-shrink-0 bg-slate-100 rounded overflow-hidden">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
              {/* Title */}
              <h3 className="text-sm font-semibold mb-1.5 line-clamp-2 academy-title">
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                {getExcerpt(120)}
              </p>
            </div>

            {/* Meta & Badges */}
            <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
              {article.pinned && (
                <>
                  <span className="text-[10px] font-semibold">Fijado</span>
                  <span>•</span>
                </>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <time dateTime={article.published_at}>
                  {formatDate(article.published_at)}
                </time>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <User className="w-2.5 h-2.5" />
                <span className="font-medium">{authorName}</span>
              </div>
              {article.difficulty_level && (
                <>
                  <span>•</span>
                  <DifficultyBadge level={article.difficulty_level} size="sm" />
                </>
              )}
              {article.estimated_reading_time && (
                <>
                  <span>•</span>
                  <ReadingTimeBadge minutes={article.estimated_reading_time} size="sm" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
