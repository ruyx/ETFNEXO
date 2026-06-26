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

// Fuentes hardcoded a eliminar (las que no vienen del Google Sheet)
const RSS_SOURCES = [
  'Expansión',
  'Finect',
  'Rankia',
  'Funds Society',
  'Estrategias de Inversión',
  'Manual',
  'Redacción ETF Nexo' // Artículos del seed
]

async function cleanupRSSNews() {
  console.log('🗑️  Eliminando noticias de fuentes RSS hardcoded...\n')

  // 1. Contar noticias por fuente ANTES
  console.log('📊 Estado ANTES de la limpieza:')
  const { data: beforeData } = await supabase
    .from('news_articles')
    .select('source_name')
    .eq('status', 'published')

  const beforeCounts = beforeData?.reduce((acc: any, article) => {
    const source = article.source_name || 'Sin fuente'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {})

  Object.entries(beforeCounts || {}).forEach(([source, count]) => {
    console.log(`   ${source}: ${count} artículos`)
  })
  console.log(`   TOTAL: ${beforeData?.length || 0} artículos\n`)

  // 2. Eliminar noticias de fuentes RSS
  console.log('🗑️  Eliminando artículos de fuentes RSS...\n')

  for (const source of RSS_SOURCES) {
    const { data, error } = await supabase
      .from('news_articles')
      .delete()
      .eq('source_name', source)
      .select()

    if (error) {
      console.error(`❌ Error eliminando ${source}:`, error)
    } else {
      console.log(`✅ Eliminados ${data?.length || 0} artículos de "${source}"`)
    }
  }

  // 3. Eliminar artículos SIN fuente
  const { data: noSourceData, error: noSourceError } = await supabase
    .from('news_articles')
    .delete()
    .is('source_name', null)
    .select()

  if (!noSourceError) {
    console.log(`✅ Eliminados ${noSourceData?.length || 0} artículos sin fuente`)
  }

  // 4. Contar noticias DESPUÉS
  console.log('\n📊 Estado DESPUÉS de la limpieza:')
  const { data: afterData } = await supabase
    .from('news_articles')
    .select('source_name')
    .eq('status', 'published')

  const afterCounts = afterData?.reduce((acc: any, article) => {
    const source = article.source_name || 'Sin fuente'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {})

  Object.entries(afterCounts || {}).forEach(([source, count]) => {
    console.log(`   ${source}: ${count} artículos`)
  })
  console.log(`   TOTAL: ${afterData?.length || 0} artículos\n`)

  const deletedCount = (beforeData?.length || 0) - (afterData?.length || 0)
  console.log(`\n✅ Limpieza completada: ${deletedCount} artículos eliminados`)
  console.log('📝 Solo quedan artículos del Google Sheet')
}

cleanupRSSNews().catch(console.error)
