import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Variables de entorno faltantes')
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

async function checkNewsDetailed() {
  console.log('🔍 Análisis Detallado de Noticias\n')

  // Total de noticias
  const { count: totalCount } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  console.log(`📊 Total noticias publicadas: ${totalCount}\n`)

  // Por fuente
  const { data: bySource } = await supabase
    .from('news_articles')
    .select('source_name')
    .eq('status', 'published')

  const sourceCounts = new Map<string, number>()
  bySource?.forEach(article => {
    const source = article.source_name || 'Sin fuente (Google Sheet)'
    sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1)
  })

  console.log('📰 Por Fuente:')
  Array.from(sourceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      const isRSS = ['Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia', 'Fundssociety', 'Cincodias'].includes(source)
      const emoji = isRSS ? '❌' : '✅'
      console.log(`   ${emoji} ${source}: ${count}`)
    })

  // Todas las noticias con detalles
  const { data: allNews } = await supabase
    .from('news_articles')
    .select('id, title, slug, source_name, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  console.log(`\n📋 Todas las Noticias (${allNews?.length || 0}):\n`)
  allNews?.forEach((article, index) => {
    const isRSS = article.source_name && ['Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia', 'Fundssociety', 'Cincodias'].includes(article.source_name)
    const emoji = isRSS ? '❌' : '✅'
    console.log(`${index + 1}. ${emoji} ${article.title}`)
    console.log(`   Fuente: ${article.source_name || 'Google Sheet'}`)
    console.log(`   Publicado: ${article.published_at || article.created_at}`)
    console.log(`   URL: /noticias/${article.slug}`)
    console.log('')
  })

  // Verificar si hay límite de 20 en alguna parte
  console.log('\n⚠️  ANÁLISIS DE LÍMITES:')
  if (allNews && allNews.length === 20) {
    console.log('❌ Hay exactamente 20 noticias - posible límite hardcoded')
  } else if (allNews && allNews.length > 20) {
    console.log(`✅ Hay ${allNews.length} noticias - no hay límite de 20 en BD`)
  } else if (allNews && allNews.length < 20) {
    console.log(`ℹ️  Solo hay ${allNews.length} noticias en total`)
  }
}

checkNewsDetailed().catch(console.error)
