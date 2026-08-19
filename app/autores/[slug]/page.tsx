import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import NewsCard from '@/components/NewsCard';
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
      .select('id, title, slug, content, featured_image_url, published_at, views_count, source_name, source_url, author_name')
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
        <div className="container max-w-7xl mx-auto px-6 py-16">
          {/* Author Header */}
          <div className="author-header flex flex-col items-center text-center gap-6 mb-12 pb-8 border-b border-slate-200">
            <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-500 to-green-500 shadow-xl">
              {author.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={author.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-white">
                  {getInitials(author.display_name)}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-3">
                {author.display_name}
              </h1>
              {author.bio && (
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  {author.bio}
                </p>
              )}
            </div>

            <div className="flex gap-8 text-sm text-slate-600">
              <div>
                <strong className="text-slate-900">{author.articles_count || 0}</strong> artículos publicados
              </div>
              <div>
                <strong className="text-slate-900">{author.total_views || 0}</strong> vistas totales
              </div>
            </div>
          </div>

          {/* Articles List */}
          <h2 className="text-2xl font-bold mb-8 text-slate-900">
            Noticias relacionadas
          </h2>

          {author.articles.length === 0 ? (
            <p className="text-slate-600 text-center py-16">
              Este autor aún no tiene artículos publicados.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {author.articles.map((article: any) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  variant="card"
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
