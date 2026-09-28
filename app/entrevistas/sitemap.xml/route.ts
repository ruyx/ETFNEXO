import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();

  // @ts-ignore - Supabase type instantiation depth limit
  const { data: interviews } = await supabase
    .from('interviews' as any)
    .select('slug, updated_at, published_at')
    .eq('status' as any, 'published' as any)
    .order('published_at', { ascending: false })
    .limit(500);

  const urls = interviews?.map(interview => ({
    url: `https://etfnexo.com/entrevistas/${interview.slug}`,
    lastModified: interview.updated_at || interview.published_at,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  })) || [];

  const xml = generateSitemapXML(urls);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function generateSitemapXML(urls: Array<{url: string; lastModified: string; changeFrequency: string; priority: number}>): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${new Date(u.lastModified).toISOString()}</lastmod>
    <changefreq>${u.changeFrequency}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}
