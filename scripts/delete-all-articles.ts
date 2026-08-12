import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws as any }
})

async function deleteAllArticles() {
  console.log('🗑️  Borrando TODOS los artículos...\n')

  // Contar antes
  const { count: before } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  console.log(`📊 Total artículos antes: ${before}`)

  // Borrar todos
  const { error } = await supabase
    .from('news_articles')
    .delete()
    .eq('status', 'published')

  if (error) {
    console.error('❌ Error borrando:', error)
    return
  }

  // Contar después
  const { count: after } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  console.log(`📊 Total artículos después: ${after}`)
  console.log(`✅ Eliminados: ${(before || 0) - (after || 0)} artículos\n`)
}

deleteAllArticles().catch(console.error)
