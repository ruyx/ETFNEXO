// @ts-nocheck
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import AdSlot from '@/components/AdSlot';
import FixedTopBanner from '@/components/FixedTopBanner';
import DifficultyBadge from '@/components/DifficultyBadge';
import ReadingTimeBadge from '@/components/ReadingTimeBadge';
import ArticleDetailWithFAQ from '@/components/ArticleDetailWithFAQ';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatArticleContent } from '@/lib/format-article-content';

// Revalidate every hour to ensure fresh content from database
export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

// Fetch article data directly from Supabase
async function getArticle(slug: string) {
  try {
    const supabase = createAdminClient();

    const { data: article, error } = await supabase
      .from('academy_articles_with_metadata')
      .select('*')
      .eq('slug' as any, slug as any)
      .eq('status' as any, 'published' as any)
      .single();

    if (error || !article) {
      console.error(`Failed to fetch academy article ${slug}:`, error);
      return null;
    }

    return article;
  } catch (error) {
    console.error('Error fetching academy article:', error);
    return null;
  }
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: 'Artículo no encontrado | ETF Nexo',
    };
  }

  return {
    title: `${article.title} | Academia ETF Nexo`,
    description: article.excerpt || article.meta_description || undefined,
    openGraph: {
      title: article.meta_title || article.title || undefined,
      description: article.meta_description || article.excerpt || undefined,
      images: article.featured_image_url ? [article.featured_image_url] : [],
    },
  };
}

// Función para obtener iniciales del nombre
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export default async function AcademiaDetailPage({ params }: PageProps) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  // Format date
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Fecha no disponible';

  // Determinar autor (agente AI)
  const displayAuthorName = article.agent_display_name || article.agent_name || 'ETF Nexo';
  const authorSlug = article.agent_slug || null;
  const authorAvatar = article.agent_avatar_url || null;

  // Link a perfil del autor
  const authorLink = authorSlug ? `/autores/${authorSlug}` : null;

  return (
    <>
      <Header />

      {/* Banner Fixed Encima del Breadcrumb */}
      <FixedTopBanner placement="article_top" />

      <main>
        {/* Breadcrumb */}
        <section className="article-breadcrumb">
          <div className="container">
            <nav className="article-breadcrumb__nav">
              <Link href="/" className="article-breadcrumb__link">
                Inicio
              </Link>
              <span className="article-breadcrumb__separator">/</span>
              <Link href="/academia" className="article-breadcrumb__link">
                Academia
              </Link>
              <span className="article-breadcrumb__separator">/</span>
              <span className="article-breadcrumb__current">
                {article.category_name || 'Artículo'}
              </span>
            </nav>
          </div>
        </section>

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

        {/* Infinite Scroll Component with FAQ */}
        <ArticleDetailWithFAQ initialArticle={article} basePath="academia">
          {/* Article Header */}
          <article className="article-detail">
            <div className="container">
              <div className="article-detail__wrapper">
                {/* Category Badge & Difficulty */}
                <div className="article-detail__category" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {article.category_name && (
                    <span
                      className="article-detail__category-badge"
                      style={{ backgroundColor: article.category_color || 'var(--color-success)' }}
                    >
                      {article.category_name}
                    </span>
                  )}
                  {article.difficulty_level && (
                    <DifficultyBadge level={article.difficulty_level} size="md" />
                  )}
                  {article.estimated_reading_time && (
                    <ReadingTimeBadge minutes={article.estimated_reading_time} size="md" />
                  )}
                </div>

                {/* Title */}
                <h1 className="article-detail__title">
                  {article.title}
                </h1>

                {/* Meta Info */}
                <div className="article-detail__meta">
                  <div className="article-detail__meta-item article-detail__author">
                    {authorLink ? (
                      <Link
                        href={authorLink}
                        className="article-detail__author-link"
                      >
                        <div className="article-detail__author-avatar">
                          {authorAvatar ? (
                            <img
                              src={authorAvatar}
                              alt={displayAuthorName}
                              className="article-detail__author-avatar-img"
                            />
                          ) : (
                            <span className="article-detail__author-avatar-initials">
                              {getInitials(displayAuthorName)}
                            </span>
                          )}
                        </div>
                        <span className="article-detail__author-name">{displayAuthorName}</span>
                      </Link>
                    ) : (
                      <div className="article-detail__author-link">
                        <div className="article-detail__author-avatar">
                          {authorAvatar ? (
                            <img
                              src={authorAvatar}
                              alt={displayAuthorName}
                              className="article-detail__author-avatar-img"
                            />
                          ) : (
                            <span className="article-detail__author-avatar-initials">
                              {getInitials(displayAuthorName)}
                            </span>
                          )}
                        </div>
                        <span className="article-detail__author-name">{displayAuthorName}</span>
                      </div>
                    )}
                  </div>
                  <div className="article-detail__meta-item">
                    <svg className="article-detail__meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <time dateTime={article.published_at || undefined}>
                      {publishedDate}
                    </time>
                  </div>
                  {article.views_count !== null && article.views_count > 0 && (
                    <div className="article-detail__meta-item">
                      <svg className="article-detail__meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{article.views_count} lecturas</span>
                    </div>
                  )}
                </div>

                {/* Featured Image */}
                {article.featured_image_url && (
                  <div className="article-image article-image--featured">
                    <img
                      src={article.featured_image_url}
                      alt={article.featured_image_alt || article.title || 'Imagen destacada'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                {/* Excerpt */}
                {article.excerpt && (
                  <div className="article-detail__excerpt">
                    <p dangerouslySetInnerHTML={{
                      __html: article.excerpt.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
                    }} />
                  </div>
                )}

                {/* Content - Always show */}
                {article.content && (
                  <div
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: formatArticleContent(article.content) }}
                  />
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
                          key={etf.id}
                          href={`/etfs/${etf.isin}`}
                          className="article-detail__related-card"
                        >
                          <div>
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

                {/* Prerequisites - Educational Path */}
                {article.prerequisites && Array.isArray(article.prerequisites) && article.prerequisites.length > 0 && (
                  <div className="article-detail__related academia-prerequisites">
                    <div className="academia-prerequisites__header">
                      <div className="academia-prerequisites__icon">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className="article-detail__related-title">
                        📚 Requisitos previos - Ruta de aprendizaje
                      </h3>
                    </div>
                    <p className="academia-prerequisites__description">
                      Para aprovechar al máximo este artículo, te recomendamos leer primero:
                    </p>
                    <div className="article-detail__related-grid">
                      {article.prerequisites.map((slug: string, index: number) => (
                        <Link
                          key={slug}
                          href={`/academia/${slug}`}
                          className="article-detail__related-card academia-prerequisites__card"
                        >
                          <div className="academia-prerequisites__badge">
                            Paso {index + 1}
                          </div>
                          <div>
                            <p className="article-detail__related-name">{slug}</p>
                          </div>
                          <svg className="article-detail__related-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Back to Academia */}
                <div className="article-detail__back">
                  <Link href="/academia" className="article-detail__back-link">
                    <svg className="article-detail__back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Volver a Academia</span>
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </ArticleDetailWithFAQ>
      </main>
    </>
  );
}
