import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: fetch },
  realtime: { transport: ws as any }
})

async function checkNews() {
  console.log('🔍 Revisando noticias...\n')

  // Últimas noticias publicadas
  const { data: publishedNews, error: pubError } = await supabase
    .from('news_articles')
    .select('id, title, published_at, created_at, status')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(10)

  if (pubError) {
    console.error('❌ Error al obtener noticias publicadas:', pubError)
  } else {
    console.log('📰 Últimas 10 noticias PUBLICADAS:')
    console.log('='.repeat(120))
    publishedNews.forEach((article, i) => {
      const publishDate = article.published_at ? new Date(article.published_at).toISOString().split('T')[0] : 'N/A'
      console.log(`${(i+1).toString().padStart(2)}. [${publishDate}] ${article.title}`)
    })
    console.log('='.repeat(120))
    console.log(`\nTotal de noticias publicadas: ${publishedNews.length}\n`)
  }

  // Noticias pendientes (draft)
  const { data: draftNews, error: draftError } = await supabase
    .from('news_articles')
    .select('id, title, created_at, status')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(10)

  if (draftError) {
    console.error('❌ Error al obtener noticias en borrador:', draftError)
  } else {
    console.log('\n📝 Últimas 10 noticias en BORRADOR (draft):')
    console.log('='.repeat(120))
    draftNews.forEach((article, i) => {
      const createDate = new Date(article.created_at).toISOString().split('T')[0]
      console.log(`${(i+1).toString().padStart(2)}. [${createDate}] ${article.title}`)
    })
    console.log('='.repeat(120))
    console.log(`\nTotal de noticias en borrador: ${draftNews.length}\n`)
  }

  // Estadísticas
  const { count: totalPublished } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const { count: totalDraft } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft')

  const { count: totalScheduled } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled')

  console.log('\n📊 Estadísticas globales:')
  console.log('='.repeat(120))
  console.log(`Total publicadas: ${totalPublished}`)
  console.log(`Total en borrador: ${totalDraft}`)
  console.log(`Total programadas: ${totalScheduled}`)
  console.log('='.repeat(120))

  process.exit(0)
}

checkNews()
