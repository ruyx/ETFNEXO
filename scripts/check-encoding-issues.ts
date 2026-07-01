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

async function checkEncoding() {
  console.log('🔍 Verificando problemas de codificación...\n')

  const { data, error } = await supabase
    .from('news_articles')
    .select('id, title, source_name, source_url, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  let issuesFound = 0
  let cleanArticles = 0

  console.log('📰 Últimos 20 artículos:\n')
  data?.forEach((article, idx) => {
    const hasIssue = article.title.includes('Ã') ||
                     article.title.includes('â€') ||
                     article.title.includes('Â') ||
                     article.title.includes('Ã©') ||
                     article.title.includes('Ã³')

    if (hasIssue) {
      issuesFound++
      console.log(`${idx + 1}. ❌ ${article.title}`)
      console.log(`   Fuente: ${article.source_name}`)
      console.log(`   URL: ${article.source_url}`)
      console.log(`   ID: ${article.id}`)
      console.log(`   Fecha: ${article.created_at}\n`)
    } else {
      cleanArticles++
      console.log(`${idx + 1}. ✅ ${article.title.substring(0, 80)}...`)
    }
  })

  console.log('\n📊 Resumen:')
  console.log(`   Total artículos: ${data.length}`)
  console.log(`   Con problemas: ${issuesFound}`)
  console.log(`   Sin problemas: ${cleanArticles}`)

  if (issuesFound > 0) {
    console.log('\n⚠️  PROBLEMA DETECTADO: Codificación UTF-8 incorrecta')
    console.log('   Los caracteres "Ã", "â€", "Â" indican que el texto UTF-8')
    console.log('   está siendo interpretado como ISO-8859-1 (Latin-1)')
    console.log('\n💡 Solución: Corregir la decodificación en la Edge Function')
  }
}

checkEncoding()
