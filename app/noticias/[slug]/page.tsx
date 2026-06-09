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
      <main>
        {/* Breadcrumb */}
        <section className="article-breadcrumb">
          <div className="container">
            <nav className="article-breadcrumb__nav">
              <Link href="/" className="article-breadcrumb__link">
                Inicio
              </Link>
              <span className="article-breadcrumb__separator">/</span>
              <Link href="/noticias" className="article-breadcrumb__link">
                Noticias
              </Link>
              <span className="article-breadcrumb__separator">/</span>
              <span className="article-breadcrumb__current">
                {article.category_name || 'Artículo'}
              </span>
            </nav>
          </div>
        </section>

        {/* Article Header */}
        <article className="article-detail">
          <div className="container">
            <div className="article-detail__wrapper">
              {/* Category Badge */}
              {article.category_name && (
                <div className="article-detail__category">
                  <span
                    className="article-detail__category-badge"
                    style={{ backgroundColor: article.category_color || '#3B82F6' }}
                  >
                    {article.category_name}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="article-detail__title">
                {article.title}
              </h1>

              {/* Meta Info */}
              <div className="article-detail__meta">
                <div className="article-detail__meta-item">
                  <svg className="article-detail__meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{article.author_name || 'Redacción ETF Nexo'}</span>
                </div>
                <div className="article-detail__meta-item">
                  <svg className="article-detail__meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <time dateTime={dateToFormat || undefined}>
                    {publishedDate}
                  </time>
                </div>
                {article.views_count !== null && article.views_count > 0 && (
                  <div className="article-detail__meta-item">
                    <svg className="article-detail__meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{article.views_count} vistas</span>
                  </div>
                )}
              </div>

              {/* Featured Image */}
              {article.featured_image_url && (
                <div className="article-image article-image--featured">
                  <Image
                    src={article.featured_image_url}
                    alt={article.title || 'Imagen destacada'}
                    fill
                    priority
                  />
                </div>
              )}

              {/* Excerpt */}
              {article.excerpt && (
                <div className="article-detail__excerpt">
                  <p>{article.excerpt}</p>
                </div>
              )}

              {/* Content */}
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: article.content || '' }}
              />

              {/* Source Link */}
              {article.source_url && article.source_name && (
                <div className="article-detail__source">
                  <p className="article-detail__source-label">
                    Fuente original:
                  </p>
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article-detail__source-link"
                  >
                    <span>{article.source_name}</span>
                    <svg className="article-detail__source-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Tags */}
              {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
                <div className="article-detail__tags">
                  <h3 className="article-detail__tags-title">
                    Etiquetas:
                  </h3>
                  <div className="article-detail__tags-list">
                    {article.tags.map((tag: any) => (
                      <span
                        key={tag.id}
                        className="article-detail__tag"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related ETFs */}
              {article.related_etfs && Array.isArray(article.related_etfs) && article.related_etfs.length > 0 && (
                <div className="article-detail__related">
                  <h3 className="article-detail__related-title">
                    ETFs relacionados:
                  </h3>
                  <div className="article-detail__related-grid">
                    {article.related_etfs.map((etf: any) => (
                      <Link
                        key={etf.isin}
                        href={`/etfs/${etf.isin}`}
                        className="article-detail__related-card"
                      >
                        <div>
                          <p className="article-detail__related-ticker">{etf.ticker}</p>
                          <p className="article-detail__related-name">{etf.name}</p>
                        </div>
                        <svg className="article-detail__related-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to News */}
              <div className="article-detail__back">
                <Link href="/noticias" className="article-detail__back-link">
                  <svg className="article-detail__back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Volver a Noticias</span>
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* CTA Section */}
        <section className="noticias-cta">
          <div className="container noticias-cta__container">
            <h2 className="noticias-cta__title">
              ¿Buscas los mejores ETFs?
            </h2>
            <p className="noticias-cta__description">
              Descubre nuestro ranking completo de ETFs evaluados con nuestro algoritmo propietario ETFNexo Score
            </p>
            <Link href="/rankings" className="btn-primary">
              Ver Rankings de ETFs
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
