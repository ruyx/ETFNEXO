import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws as any }
})

async function checkArticle() {
  const { data, error } = await supabase
    .from('news_articles')
    .select('slug, title, content, excerpt, featured_image_url, source_name, source_url')
    .eq('status', 'published')
    .limit(3)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`\n📊 Analizando ${data.length} artículos...\n`)

  data.forEach((article, i) => {
    console.log(`[${i+1}] ${article.title}`)
    console.log(`    Slug: ${article.slug}`)
    console.log(`    Source: ${article.source_name}`)
    console.log(`    Source URL: ${article.source_url}`)
    console.log(`    ✨ Featured Image: ${article.featured_image_url ? '✅ SI' : '❌ NO'}`)
    console.log(`    📝 Excerpt: ${article.excerpt?.length || 0} chars ${article.excerpt ? '✅' : '❌'}`)
    console.log(`    📄 Content: ${article.content?.length || 0} chars ${article.content ? '✅' : '❌'}`)

    if (article.content) {
      console.log(`    Preview: ${article.content.substring(0, 100)}...`)
    }
    console.log('')
  })
}

checkArticle().catch(console.error)
