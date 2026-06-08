import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { createAdminClient } from '@/lib/supabase/admin';

interface PageProps {
  params: { slug: string };
}

// Fetch article data directly from Supabase
async function getArticle(slug: string) {
  try {
    const supabase = createAdminClient();

    const { data: article, error } = await supabase
      .from('news_articles_with_metadata')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !article) {
      console.error(`Failed to fetch article ${slug}:`, error);
      return null;
    }

    return article;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: 'Noticia no encontrada | ETF Nexo',
    };
  }

  return {
    title: `${article.title} | ETF Nexo`,
    description: article.excerpt || undefined,
    openGraph: {
      title: article.title || undefined,
      description: article.excerpt || undefined,
      images: article.featured_image_url ? [article.featured_image_url] : [],
    },
  };
}

export default async function NoticiaDetailPage({ params }: PageProps) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  // Format date
  const dateToFormat = article.published_at || article.source_published_at;
  const publishedDate = dateToFormat
    ? new Date(dateToFormat).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Fecha no disponible';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-neutral-600">
            <Link href="/" className="hover:text-primary-blue transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/noticias" className="hover:text-primary-blue transition-colors">
              Noticias
            </Link>
            <span>/</span>
            <span className="text-neutral-900">{article.category_name}</span>
          </nav>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Badge */}
        {article.category_name && (
          <div className="mb-6">
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: article.category_color || '#3B82F6' }}
            >
              {article.category_name}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="heading-1 text-neutral-900 mb-6">
          {article.title}
        </h1>

        {/* Meta Info */}
        <div className="flex items-center space-x-6 text-sm text-neutral-600 mb-8 pb-8 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{article.author_name || 'Redacción ETF Nexo'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <time dateTime={dateToFormat || undefined}>
              {publishedDate}
            </time>
          </div>
          {article.views_count !== null && article.views_count > 0 && (
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{article.views_count} vistas</span>
            </div>
          )}
        </div>

        {/* Featured Image */}
        {article.featured_image_url && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <Image
              src={article.featured_image_url}
              alt={article.title || 'Imagen destacada'}
              width={800}
              height={450}
              className="w-full h-auto"
              priority
            />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <div className="mb-8 p-6 bg-primary-blue/5 border-l-4 border-primary-blue rounded-r-lg">
            <p className="text-lg text-neutral-700 italic">
              {article.excerpt}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div
            className="text-neutral-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content || '' }}
          />
        </div>

        {/* Source Link */}
        {article.source_url && (
          <div className="mt-12 pt-8 border-t border-neutral-200">
            <p className="text-sm text-neutral-600 mb-2">
              Fuente original:
            </p>
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary-blue hover:text-primary-orange transition-colors"
            >
              <span>{article.source_name}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}

        {/* Tags */}
        {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-neutral-200">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">
              Etiquetas:
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm hover:bg-neutral-200 transition-colors"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related ETFs */}
        {article.related_etfs && Array.isArray(article.related_etfs) && article.related_etfs.length > 0 && (
          <div className="mt-8 pt-8 border-t border-neutral-200">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">
              ETFs relacionados:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {article.related_etfs.map((etf: any) => (
                <Link
                  key={etf.isin}
                  href={`/etfs/${etf.isin}`}
                  className="p-4 bg-white border border-neutral-200 rounded-lg hover:border-primary-blue hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-neutral-900">{etf.ticker}</p>
                      <p className="text-sm text-neutral-600 line-clamp-1">{etf.name}</p>
                    </div>
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to News */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <Link
            href="/noticias"
            className="inline-flex items-center space-x-2 text-primary-blue hover:text-primary-orange transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Volver a Noticias</span>
          </Link>
        </div>
      </article>
      </div>
    </>
  );
}
