import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

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
  const { data: noticias } = await supabase
    .from('news_articles')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1000)

  const noticiasPages: MetadataRoute.Sitemap = (noticias || []).map((article) => ({
    url: `${baseUrl}/noticias/${article.slug}`,
    lastModified: new Date(article.updated_at || article.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Fetch entrevistas
  const { data: entrevistas } = await supabase
    .from('interviews')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(500)

  const entrevistasPages: MetadataRoute.Sitemap = (entrevistas || []).map((interview) => ({
    url: `${baseUrl}/entrevistas/${interview.slug}`,
    lastModified: new Date(interview.updated_at || interview.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Fetch academia
  const { data: academia } = await supabase
    .from('academy_articles')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(500)

  const academiaPages: MetadataRoute.Sitemap = (academia || []).map((article) => ({
    url: `${baseUrl}/academia/${article.slug}`,
    lastModified: new Date(article.updated_at || article.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...noticiasPages, ...entrevistasPages, ...academiaPages]
}
