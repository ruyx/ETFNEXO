import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Variables de entorno faltantes')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    transport: ws as any
  }
})

async function identifyNewsSources() {
  console.log('🔍 Analizando fuentes de noticias...\n')

  // Obtener todas las noticias publicadas con su fuente
  const { data: allNews, error } = await supabase
    .from('news_articles')
    .select('id, title, slug, source_name, source_url, published_at, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error al consultar noticias:', error)
    return
  }

  if (!allNews || allNews.length === 0) {
    console.log('ℹ️  No se encontraron noticias publicadas')
    return
  }

  // Clasificar por fuente
  const rssSources = new Set([
    'Funds Society',
    'Finect',
    'Estrategias de Inversión',
    'Expansión',
    'Rankia'
  ])

  const rssArticles: typeof allNews = []
  const googleSheetArticles: typeof allNews = []
  const unknownArticles: typeof allNews = []

  allNews.forEach(article => {
    if (article.source_name && rssSources.has(article.source_name)) {
      rssArticles.push(article)
    } else if (!article.source_name || article.source_name === 'Google Sheets' || article.source_name === 'Manual') {
      googleSheetArticles.push(article)
    } else {
      unknownArticles.push(article)
    }
  })

  // Mostrar estadísticas
  console.log('📊 ESTADÍSTICAS DE FUENTES:\n')
  console.log(`Total artículos publicados: ${allNews.length}`)
  console.log(`├─ Artículos de RSS: ${rssArticles.length} ❌ (NO DESEADOS)`)
  console.log(`├─ Artículos de Google Sheets: ${googleSheetArticles.length} ✅ (DESEADOS)`)
  console.log(`└─ Artículos fuente desconocida: ${unknownArticles.length}\n`)

  // Mostrar detalle de artículos RSS (los que hay que eliminar)
  if (rssArticles.length > 0) {
    console.log('❌ ARTÍCULOS DE RSS QUE HAY QUE ELIMINAR:\n')

    const bySource = new Map<string, typeof allNews>()
    rssArticles.forEach(article => {
      const source = article.source_name || 'Sin fuente'
      if (!bySource.has(source)) {
        bySource.set(source, [])
      }
      bySource.get(source)!.push(article)
    })

    bySource.forEach((articles, source) => {
      console.log(`\n📰 ${source} (${articles.length} artículos):`)
      articles.slice(0, 5).forEach(article => {
        console.log(`   - ${article.title}`)
        console.log(`     ID: ${article.id}`)
        console.log(`     Slug: ${article.slug}`)
        console.log(`     Publicado: ${article.published_at || article.created_at}`)
      })
      if (articles.length > 5) {
        console.log(`   ... y ${articles.length - 5} más`)
      }
    })
  }

  // Mostrar algunos artículos de Google Sheets (verificar que son correctos)
  if (googleSheetArticles.length > 0) {
    console.log('\n✅ ARTÍCULOS DE GOOGLE SHEETS (MANTENER):\n')
    console.log(`Total: ${googleSheetArticles.length} artículos`)
    console.log('\nÚltimos 5:')
    googleSheetArticles.slice(0, 5).forEach(article => {
      console.log(`   - ${article.title}`)
      console.log(`     ID: ${article.id}`)
      console.log(`     Fuente: ${article.source_name || 'Sin fuente (importado)'}`)
      console.log(`     Publicado: ${article.published_at || article.created_at}`)
    })
  }

  // Generar SQL para eliminar artículos RSS
  if (rssArticles.length > 0) {
    console.log('\n\n🗑️  SQL PARA ELIMINAR ARTÍCULOS RSS:\n')
    console.log('-- Ejecutar en Supabase Dashboard → SQL Editor')
    console.log('-- URL: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql\n')

    const rssSourcesList = Array.from(rssSources).map(s => `'${s}'`).join(', ')

    console.log(`-- Eliminar ${rssArticles.length} artículos de RSS`)
    console.log('DELETE FROM news_articles')
    console.log(`WHERE source_name IN (${rssSourcesList});`)
    console.log('\n-- Verificar resultado')
    console.log('SELECT COUNT(*) as total_publicados FROM news_articles WHERE status = \'published\';')
  }

  // Generar SQL para deshabilitar el cron de fetch-news
  console.log('\n\n⏸️  SQL PARA DESHABILITAR FETCH-NEWS CRON:\n')
  console.log('-- Ejecutar en Supabase Dashboard → SQL Editor\n')
  console.log('-- Desactivar el cron job de fetch-news')
  console.log('SELECT cron.unschedule(\'fetch-news-every-6-hours\');')
  console.log('\n-- Verificar que se eliminó')
  console.log('SELECT jobname, schedule, command, active')
  console.log('FROM cron.job')
  console.log('WHERE jobname = \'fetch-news-every-6-hours\';')
  console.log('-- Debería retornar 0 filas')
}

identifyNewsSources().catch(console.error)
