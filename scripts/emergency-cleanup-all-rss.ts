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

async function emergencyCleanup() {
  console.log('🚨 LIMPIEZA DE EMERGENCIA - Eliminando TODAS las noticias RSS\n')

  // Contar antes
  const { count: beforeCount } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  console.log(`📊 Noticias publicadas antes: ${beforeCount}\n`)

  // Todas las fuentes RSS conocidas
  const rssSources = [
    'Funds Society',
    'Finect',
    'Estrategias de Inversión',
    'Expansión',
    'Rankia',
    'Fundssociety',
    'Cincodias',
    'Cinco Dias',
    'FundsPeople'
  ]

  console.log('🗑️  Eliminando noticias de fuentes RSS:')
  rssSources.forEach(source => console.log(`   - ${source}`))
  console.log('')

  // Eliminar TODAS las noticias con source_name en la lista
  const { error: deleteError, count } = await supabase
    .from('news_articles')
    .delete({ count: 'exact' })
    .in('source_name', rssSources)

  if (deleteError) {
    console.error('❌ Error al eliminar:', deleteError)
    return
  }

  console.log(`✅ Eliminadas ${count} noticias RSS\n`)

  // Verificar resultado
  const { count: afterCount } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  console.log(`📊 Noticias publicadas ahora: ${afterCount}`)

  // Mostrar las que quedan (si hay)
  const { data: remaining } = await supabase
    .from('news_articles')
    .select('id, title, source_name')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (remaining && remaining.length > 0) {
    console.log('\n📰 Noticias restantes:')
    remaining.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`)
      console.log(`   Fuente: ${article.source_name || 'Sin fuente (Google Sheet?)'}`)
    })
  } else {
    console.log('\n✅ Base de datos limpia - lista para importar del Google Sheet')
  }
}

emergencyCleanup().catch(console.error)
