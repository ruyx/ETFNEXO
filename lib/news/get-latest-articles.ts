/**
 * Últimas noticias para páginas renderizadas en servidor (home).
 * Misma combinación y orden que /api/v1/noticias: noticias publicadas +
 * entrevistas marcadas "mostrar_en_noticias", fijadas primero y después por
 * fecha de publicación.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import type { NewsArticle } from '@/components/NewsCard';

type Row = Record<string, any>;

function sortArticles(a: Row, b: Row): number {
  if (a.pinned && !b.pinned) return -1;
  if (!a.pinned && b.pinned) return 1;
  if (a.pinned && b.pinned) {
    const aDate = a.pinned_at ? new Date(a.pinned_at).getTime() : 0;
    const bDate = b.pinned_at ? new Date(b.pinned_at).getTime() : 0;
    return bDate - aDate;
  }
  const aPublished = a.published_at ? new Date(a.published_at).getTime() : 0;
  const bPublished = b.published_at ? new Date(b.published_at).getTime() : 0;
  return bPublished - aPublished;
}

export async function getLatestArticles(limit = 12): Promise<NewsArticle[]> {
  // Desarrollo local sin credenciales de Supabase (ver LOCAL_API_PROXY en
  // next.config.mjs): se reutiliza el API público de producción.
  if (process.env.LOCAL_API_PROXY === '1') {
    try {
      const res = await fetch(`https://etfnexo.com/api/v1/noticias?limit=${limit}`, {
        next: { revalidate: 300 },
      });
      const json = await res.json();
      return (json.data ?? []) as NewsArticle[];
    } catch (err) {
      console.error('[getLatestArticles] Error consultando el API de producción:', err);
      return [];
    }
  }

  try {
    const supabase = createAdminClient() as any;
    const [news, interviews] = await Promise.all([
      supabase.from('news_articles_with_metadata').select('*').eq('status', 'published'),
      supabase
        .from('interviews_with_metadata')
        .select('*')
        .eq('status', 'published')
        .eq('mostrar_en_noticias', true),
    ]);

    if (news.error) throw news.error;
    if (interviews.error) {
      console.error('[getLatestArticles] Error en entrevistas:', interviews.error);
    }

    const all: Row[] = [
      ...(news.data ?? []).map((a: Row) => ({ ...a, source_type: 'news' })),
      ...(interviews.data ?? []).map((i: Row) => ({ ...i, source_type: 'interview', excerpt: i.description })),
    ].sort(sortArticles);

    return all.slice(0, limit) as NewsArticle[];
  } catch (err) {
    console.error('[getLatestArticles] Error:', err);
    return [];
  }
}
