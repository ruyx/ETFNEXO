import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Noticias ETF | ETF Nexo',
  description: 'Últimas noticias sobre ETFs, fondos cotizados y mercados financieros',
};

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string | null;
  published_at: string;
  category_name: string;
  category_slug: string;
  category_color: string;
  author_name: string;
  views_count: number;
}

// Fetch news articles
async function getNews(limit = 20) {
  // Use absolute URL in production, relative in development
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000';

  try {
    const res = await fetch(`${baseUrl}/api/v1/noticias?limit=${limit}`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      console.error(`Failed to fetch news: ${res.status} ${res.statusText}`);
      return { data: [], count: 0 };
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return { data: [], count: 0 };
  }
}

export default async function NoticiasPage() {
  const { data: articles } = await getNews(20);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="heading-1 text-primary-blue mb-4">
            Noticias sobre ETFs
          </h1>
          <p className="body-large text-neutral-700">
            Mantente informado con las últimas noticias del mundo de los fondos cotizados
          </p>
        </header>

        {/* News Grid */}
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article: NewsArticle) => (
              <Link
                key={article.id}
                href={`/noticias/${article.slug}`}
                className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-200 hover:border-primary-blue"
              >
                {/* Image */}
                {article.featured_image_url && (
                  <div className="relative h-48 overflow-hidden bg-neutral-100">
                    <Image
                      src={article.featured_image_url}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Category Badge */}
                    {article.category_name && (
                      <div className="absolute top-4 left-4">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg"
                          style={{ backgroundColor: article.category_color || '#3B82F6' }}
                        >
                          {article.category_name}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Meta Info */}
                  <div className="flex items-center space-x-4 text-xs text-neutral-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <time dateTime={article.published_at}>
                        {formatDate(article.published_at)}
                      </time>
                    </div>
                    {article.views_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{article.views_count}</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-neutral-900 mb-3 line-clamp-2 group-hover:text-primary-blue transition-colors">
                    {article.title}
                  </h2>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p className="text-sm text-neutral-600 line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>
                  )}

                  {/* Read More */}
                  <div className="flex items-center space-x-2 text-primary-blue group-hover:text-primary-orange transition-colors text-sm font-medium">
                    <span>Leer más</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-neutral-600 mb-4">
              No hay noticias disponibles en este momento
            </p>
            <p className="text-sm text-neutral-500">
              Vuelve pronto para ver las últimas actualizaciones sobre ETFs
            </p>
          </div>
        )}

        {/* Load More (Future Implementation) */}
        {articles && articles.length >= 20 && (
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-orange transition-colors font-medium shadow-md hover:shadow-lg">
              Cargar más noticias
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
