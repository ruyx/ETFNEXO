import Link from 'next/link'
import { Calendar, ExternalLink } from 'lucide-react'

export interface NewsArticle {
  id: string
  title: string
  slug: string
  content: string
  featured_image_url: string | null
  published_at: string
  author_name: string | null
  source_name: string
  source_url: string
  pinned?: boolean
  pinned_at?: string | null
}

interface NewsCardProps {
  article: NewsArticle
  variant?: 'default' | 'featured' | 'card'
}

export default function NewsCard({
  article,
  variant = 'default'
}: NewsCardProps) {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  const getExcerpt = (content: string, maxLength: number = 150): string => {
    const text = content.replace(/<[^>]*>/g, '').trim()
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  if (variant === 'featured') {
    return (
      <Link href={`/noticias/${article.slug}`} className="block">
        <div className="card hover-lift group cursor-pointer bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 overflow-hidden">
          <div className="grid md:grid-cols-[300px_1fr] gap-6">
            {/* Featured Image */}
            {article.featured_image_url && (
              <div className="relative w-full h-48 md:h-full bg-slate-100 overflow-hidden">
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            )}

            {/* Content */}
            <div className="flex flex-col justify-between py-2">
              <div>
                {/* Meta */}
                <div className="flex items-center gap-3 mb-3">
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
                    {article.source_name}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  {getExcerpt(article.content, 200)}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ExternalLink className="w-3 h-3" />
                  <span>Fuente: <span className="font-medium text-slate-700">{article.source_name}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium group-hover:text-blue-700">
                  Leer en {article.source_name}
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
      <Link href={`/noticias/${article.slug}`} className="block h-full">
        <div className="card hover-lift group cursor-pointer bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 overflow-hidden flex flex-col h-full">
          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          )}

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            {/* Meta */}
            <div className="flex items-center gap-2 mb-3">
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
                {article.source_name}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-3 group-hover:text-blue-600 transition-colors">
              {article.title}
            </h3>

            {/* Excerpt */}
            <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">
              {getExcerpt(article.content, 150)}
            </p>

            {/* Footer */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ExternalLink className="w-3 h-3" />
                <span>Fuente: <span className="font-medium text-slate-700">{article.source_name}</span></span>
              </div>
              <div className="text-xs text-blue-600 font-medium group-hover:text-blue-700">
                Leer artículo completo en {article.source_name} →
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Default variant (compact)
  return (
    <Link href={`/noticias/${article.slug}`} className="block">
      <div className="card hover-lift group cursor-pointer bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 overflow-hidden">
        <div className="flex gap-4">
          {/* Thumbnail */}
          {article.featured_image_url && (
            <div className="relative w-24 h-24 flex-shrink-0 bg-slate-100 rounded overflow-hidden">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
              {/* Title */}
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                {getExcerpt(article.content, 120)}
              </p>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
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
                <ExternalLink className="w-2.5 h-2.5" />
                <span className="font-medium">{article.source_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
