import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    transport: ws as any
  }
})

async function checkSources() {
  console.log('📊 Consultando distribución de noticias por fuente...\n')

  const { data, error } = await supabase
    .from('news_articles')
    .select('source_name, source_url, featured_image_url, status')
    .eq('status', 'published')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  // Agrupar por fuente
  const sources = data.reduce((acc: any, article) => {
    const source = article.source_name || 'Sin fuente'
    if (!acc[source]) {
      acc[source] = { total: 0, withImage: 0 }
    }
    acc[source].total++
    if (article.featured_image_url) {
      acc[source].withImage++
    }
    return acc
  }, {})

  // Ordenar por total
  const sorted = Object.entries(sources)
    .map(([name, stats]: any) => ({ name, ...stats }))
    .sort((a: any, b: any) => b.total - a.total)

  console.log('Distribución por fuente:')
  console.log('─'.repeat(60))
  sorted.forEach((source: any) => {
    console.log(`${source.name.padEnd(30)} ${source.total} artículos (${source.withImage} con imagen)`)
  })
  console.log('─'.repeat(60))
  console.log(`\nTOTAL: ${data.length} artículos publicados`)
}

checkSources().catch(console.error)
