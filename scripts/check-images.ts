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

async function checkImages() {
  const { data } = await supabase
    .from('news_articles')
    .select('title, featured_image_url, source_name')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10)

  console.log('📊 Primeros 10 artículos:\n')

  data?.forEach((a, i) => {
    console.log(`${i + 1}. ${a.title.substring(0, 60)}`)
    console.log(`   Imagen: ${a.featured_image_url || 'NULL (❌ sin imagen)'}`)
    console.log(`   Fuente: ${a.source_name || 'Sin fuente'}`)
    console.log('')
  })

  // Contar cuántos tienen imagen
  const { count: withImage } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .not('featured_image_url', 'is', null)

  const { count: total } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  console.log(`\n📊 Resumen:`)
  console.log(`   Total de artículos: ${total}`)
  console.log(`   Con imagen: ${withImage}`)
  console.log(`   Sin imagen: ${total! - withImage!}`)
  console.log(`   Porcentaje con imagen: ${Math.round((withImage! / total!) * 100)}%`)
}

checkImages().catch(console.error)
