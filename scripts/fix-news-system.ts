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

async function fixNewsSystem() {
  console.log('🚀 INICIANDO CORRECCIÓN DEL SISTEMA DE NOTICIAS\n')
  console.log('📋 REGLA DE ORO: Solo artículos del Google Sheet\n')

  // Paso 1: Contar artículos antes de la limpieza
  console.log('📊 PASO 1: Análisis pre-corrección...\n')

  const { data: beforeNews, error: beforeError } = await supabase
    .from('news_articles')
    .select('id, source_name, status')
    .eq('status', 'published')

  if (beforeError) {
    console.error('❌ Error al consultar noticias:', beforeError)
    return
  }

  const rssSources = ['Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia']
  const rssArticles = beforeNews?.filter(a => a.source_name && rssSources.includes(a.source_name)) || []
  const otherArticles = beforeNews?.filter(a => !a.source_name || !rssSources.includes(a.source_name)) || []

  console.log(`Total artículos publicados: ${beforeNews?.length || 0}`)
  console.log(`├─ De RSS (a eliminar): ${rssArticles.length} ❌`)
  console.log(`└─ Otros (a mantener): ${otherArticles.length}\n`)

  // Paso 2: Eliminar artículos RSS
  console.log('🗑️  PASO 2: Eliminando artículos RSS...\n')

  const { error: deleteError, count } = await supabase
    .from('news_articles')
    .delete({ count: 'exact' })
    .in('source_name', rssSources)

  if (deleteError) {
    console.error('❌ Error al eliminar artículos RSS:', deleteError)
    return
  }

  console.log(`✅ Eliminados ${count || 0} artículos de RSS\n`)

  // Paso 3: Verificar resultado
  console.log('📊 PASO 3: Verificando limpieza...\n')

  const { data: afterNews, error: afterError } = await supabase
    .from('news_articles')
    .select('id, title, source_name, status')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (afterError) {
    console.error('❌ Error al verificar:', afterError)
    return
  }

  const afterRss = afterNews?.filter(a => a.source_name && rssSources.includes(a.source_name)) || []

  console.log(`Total artículos publicados ahora: ${afterNews?.length || 0}`)
  console.log(`├─ De RSS: ${afterRss.length} ${afterRss.length === 0 ? '✅' : '❌'}`)
  console.log(`└─ Otros: ${afterNews?.length || 0}\n`)

  if (afterRss.length > 0) {
    console.log('⚠️  ADVERTENCIA: Aún quedan artículos RSS:')
    afterRss.forEach(a => console.log(`   - ${a.title} (${a.source_name})`))
    console.log('')
  }

  // Mostrar artículos restantes
  if (afterNews && afterNews.length > 0) {
    console.log('📰 Artículos restantes (primeros 10):\n')
    afterNews.slice(0, 10).forEach(a => {
      console.log(`   - ${a.title}`)
      console.log(`     Fuente: ${a.source_name || 'Sin fuente (Google Sheet?)'}`)
    })
    console.log('')
  } else {
    console.log('ℹ️  No quedan artículos publicados. Necesitas importar del Google Sheet.\n')
  }

  // Paso 4: Instrucciones para deshabilitar cron y importar
  console.log('⏸️  PASO 4: Deshabilitar fetch-news cron\n')
  console.log('Ejecuta este SQL en Supabase Dashboard → SQL Editor:')
  console.log('URL: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql\n')
  console.log('```sql')
  console.log('SELECT cron.unschedule(\'fetch-news-every-6-hours\');')
  console.log('```\n')

  console.log('📥 PASO 5: Importar noticias del Google Sheet\n')
  console.log('Ejecuta este comando:\n')
  console.log('```bash')
  console.log(`curl -X POST ${SUPABASE_URL}/functions/v1/import-gsheets-news \\`)
  console.log(`  -H "Authorization: Bearer ${SERVICE_ROLE_KEY.substring(0, 20)}..."`)
  console.log('```\n')

  console.log('✅ LIMPIEZA COMPLETADA\n')
  console.log('📋 Resumen:')
  console.log(`   - Artículos RSS eliminados: ${count || 0}`)
  console.log(`   - Artículos restantes: ${afterNews?.length || 0}`)
  console.log(`   - Próximo paso: Importar del Google Sheet`)
}

fixNewsSystem().catch(console.error)
