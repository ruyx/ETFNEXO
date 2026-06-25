import Link from 'next/link'
import Image from 'next/image'
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
                <Image
                  src={article.featured_image_url}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex flex-col justify-between py-2">
              <div>
                {/* Meta */}
                <div className="flex items-center gap-3 mb-3">
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
                {article.author_name && (
                  <p className="text-xs text-slate-500">
                    Por <span className="font-medium text-slate-700">{article.author_name}</span>
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium group-hover:text-blue-700">
                  Leer más
                  <ExternalLink className="w-3.5 h-3.5" />
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
              <Image
                src={article.featured_image_url}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            {/* Meta */}
            <div className="flex items-center gap-2 mb-3">
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
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {article.author_name && (
                <p className="text-xs text-slate-500 truncate">
                  Por <span className="font-medium text-slate-700">{article.author_name}</span>
                </p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium group-hover:text-blue-700">
                Leer más
                <ExternalLink className="w-3.5 h-3.5" />
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
              <Image
                src={article.featured_image_url}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="96px"
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
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <time dateTime={article.published_at}>
                  {formatDate(article.published_at)}
                </time>
              </div>
              <span>•</span>
              <span className="font-medium">{article.source_name}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
