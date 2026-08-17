import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

async function getAuthor(slug: string) {
  try {
    const supabase = createAdminClient();

    const { data: agent, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('slug' as any, slug as any)
      .single();

    if (error || !agent) {
      return null;
    }

    // Obtener artículos del agente
    const { data: articles } = await supabase
      .from('news_articles')
      .select('id, title, slug, excerpt, featured_image_url, published_at, views_count')
      .eq('author_id' as any, (agent as any).id as any)
      .eq('status' as any, 'published' as any)
      .order('published_at', { ascending: false })
      .limit(12);

    return {
      ...(agent as any),
      articles: articles || []
    };
  } catch (error) {
    console.error('Error fetching author:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const author = await getAuthor(params.slug);

  if (!author) {
    return {
      title: 'Autor no encontrado | ETF Nexo',
    };
  }

  return {
    title: `${author.display_name} | ETF Nexo`,
    description: author.bio || `Artículos escritos por ${author.display_name}`,
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const author = await getAuthor(params.slug);

  if (!author) {
    notFound();
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <Header />
      <main className="author-page">
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-8) var(--spacing-4)' }}>
          {/* Author Header */}
          <div className="author-header" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 'var(--spacing-4)',
            marginBottom: 'var(--spacing-8)',
            paddingBottom: 'var(--spacing-6)',
            borderBottom: '1px solid var(--color-slate-200)'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-success))',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
            }}>
              {author.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={author.display_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: 'var(--color-white)'
                }}>
                  {getInitials(author.display_name)}
                </span>
              )}
            </div>

            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--color-slate-900)',
                marginBottom: 'var(--spacing-2)'
              }}>
                {author.display_name}
              </h1>
              {author.bio && (
                <p style={{
                  fontSize: '1.125rem',
                  color: 'var(--color-slate-600)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  {author.bio}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-6)', fontSize: '0.875rem', color: 'var(--color-slate-600)' }}>
              <div>
                <strong style={{ color: 'var(--color-slate-900)' }}>{author.articles_count || 0}</strong> artículos publicados
              </div>
              <div>
                <strong style={{ color: 'var(--color-slate-900)' }}>{author.total_views || 0}</strong> vistas totales
              </div>
            </div>
          </div>

          {/* Articles List */}
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: 'var(--spacing-6)',
            color: 'var(--color-slate-900)'
          }}>
            Artículos Recientes
          </h2>

          {author.articles.length === 0 ? (
            <p style={{ color: 'var(--color-slate-600)', textAlign: 'center', padding: 'var(--spacing-8)' }}>
              Este autor aún no tiene artículos publicados.
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--spacing-6)'
            }}>
              {author.articles.map((article: any) => (
                <Link
                  key={article.id}
                  href={`/noticias/${article.slug}`}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-slate-200)',
                    transition: 'all var(--transition-base)',
                    background: 'var(--color-white)'
                  }}
                  className="noticias-card"
                >
                  {article.featured_image_url && (
                    <div className="noticias-card__image">
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                      />
                    </div>
                  )}
                  <div className="noticias-card__content">
                    <h3 className="noticias-card__title">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="noticias-card__excerpt">
                        {article.excerpt.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}
                      </p>
                    )}
                    <div className="noticias-card__date">
                      {new Date(article.published_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
