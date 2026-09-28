import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://etfnexo.com'
  const supabase = createAdminClient()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/noticias`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/entrevistas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/academia`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rankings`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]

  // Fetch noticias
  // @ts-ignore - Supabase type instantiation depth limit
  const { data: noticias } = await supabase
    .from('news_articles' as any)
    .select('slug, updated_at, published_at')
    .eq('status' as any, 'published' as any)
    .order('published_at', { ascending: false })
    .limit(1000)

  const noticiasPages: MetadataRoute.Sitemap = (noticias || []).map((article: any) => ({
    url: `${baseUrl}/noticias/${article.slug}`,
    lastModified: new Date(article.updated_at || article.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Fetch entrevistas
  // @ts-ignore - Supabase type instantiation depth limit
  const { data: entrevistas } = await supabase
    .from('interviews' as any)
    .select('slug, updated_at, published_at')
    .eq('status' as any, 'published' as any)
    .order('published_at', { ascending: false })
    .limit(500)

  const entrevistasPages: MetadataRoute.Sitemap = (entrevistas || []).map((interview: any) => ({
    url: `${baseUrl}/entrevistas/${interview.slug}`,
    lastModified: new Date(interview.updated_at || interview.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Fetch academia
  // @ts-ignore - Supabase type instantiation depth limit
  const { data: academia } = await supabase
    .from('academy_articles' as any)
    .select('slug, updated_at, published_at')
    .eq('status' as any, 'published' as any)
    .order('published_at', { ascending: false })
    .limit(500)

  const academiaPages: MetadataRoute.Sitemap = (academia || []).map((article: any) => ({
    url: `${baseUrl}/academia/${article.slug}`,
    lastModified: new Date(article.updated_at || article.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...noticiasPages, ...entrevistasPages, ...academiaPages]
}
