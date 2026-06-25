import { createClient } from '@supabase/supabase-js'
import { parseHTML } from 'linkedom'
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

interface ScrapedArticle {
  title: string
  content: string | null
  featuredImage: string | null
  author: string | null
  source: string | null
  finalUrl: string
}

async function scrapeArticleContent(url: string): Promise<ScrapedArticle | null> {
  try {
    console.log(`   🌐 Scrapeando: ${url.substring(0, 80)}...`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
    })

    if (!response.ok) {
      console.error(`   ❌ Error HTTP: ${response.status}`)
      return null
    }

    const html = await response.text()
    const { document: doc } = parseHTML(html)

    // 1. Extraer título
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
    const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content')
    const h1Title = doc.querySelector('h1')?.textContent
    const titleTag = doc.querySelector('title')?.textContent

    const title = ogTitle || twitterTitle || h1Title || titleTag || 'Sin título'

    // 2. Extraer imagen destacada
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
    const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
    const firstImage = doc.querySelector('article img, .article-content img, .post-content img')?.getAttribute('src')

    let featuredImage = ogImage || twitterImage || firstImage || null

    // Convertir a URL absoluta si es relativa
    if (featuredImage && !featuredImage.startsWith('http')) {
      const urlObj = new URL(url)
      featuredImage = new URL(featuredImage, urlObj.origin).toString()
    }

    // 3. Extraer contenido
    const articleTag = doc.querySelector('article')
    const contentDiv = doc.querySelector('.article-content, .post-content, .entry-content, main')

    let content = null
    if (articleTag) {
      content = cleanArticleContent(articleTag)
    } else if (contentDiv) {
      content = cleanArticleContent(contentDiv)
    }

    // 4. Extraer autor
    const ogAuthor = doc.querySelector('meta[property="article:author"]')?.getAttribute('content')
    const authorMeta = doc.querySelector('meta[name="author"]')?.getAttribute('content')
    const authorSpan = doc.querySelector('.author, .by-author, [rel="author"]')?.textContent

    const author = ogAuthor || authorMeta || authorSpan?.trim() || null

    // 5. Extraer fuente/publicación
    const ogSiteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content')
    const publisher = doc.querySelector('meta[property="article:publisher"]')?.getAttribute('content')

    const source = ogSiteName || publisher || new URL(url).hostname.replace('www.', '') || null

    console.log(`   ✅ Scrapeado exitosamente`)
    console.log(`      Título: ${title.substring(0, 60)}...`)
    console.log(`      Imagen: ${featuredImage ? 'SÍ' : 'NO'}`)
    console.log(`      Autor: ${author || 'N/A'}`)
    console.log(`      Fuente: ${source || 'N/A'}`)

    return {
      title: title.trim(),
      content,
      featuredImage,
      author,
      source,
      finalUrl: response.url,
    }
  } catch (error: any) {
    console.error(`   ❌ Error scrapeando: ${error.message}`)
    return null
  }
}

function cleanArticleContent(element: any): string {
  const paragraphs: string[] = []
  const pTags = element.getElementsByTagName('p')

  for (let i = 0; i < pTags.length; i++) {
    const text = pTags[i].textContent?.trim()
    if (text && text.length > 50) {
      paragraphs.push(`<p>${text}</p>`)
    }
  }

  return paragraphs.join('\n') || ''
}

async function updateArticlesWithScraping() {
  console.log('🔄 Actualizando artículos sin imagen con scraping...\n')

  // 1. Obtener todos los artículos sin imagen
  const { data: articles, error } = await supabase
    .from('news_articles')
    .select('id, slug, source_url, title')
    .eq('status', 'published')
    .is('featured_image_url', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error obteniendo artículos:', error)
    return
  }

  if (!articles || articles.length === 0) {
    console.log('✅ No hay artículos sin imagen para actualizar')
    return
  }

  console.log(`📊 ${articles.length} artículos sin imagen encontrados\n`)

  let updated = 0
  let failed = 0

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]
    console.log(`\n[${i + 1}/${articles.length}] Actualizando: ${article.title.substring(0, 60)}...`)

    if (!article.source_url) {
      console.log('   ⚠️  Sin URL - saltando')
      failed++
      continue
    }

    const scraped = await scrapeArticleContent(article.source_url)

    if (!scraped) {
      console.log('   ❌ Scraping falló - saltando')
      failed++
      continue
    }

    // Actualizar artículo en BD
    const { error: updateError } = await supabase
      .from('news_articles')
      .update({
        title: scraped.title,
        content: scraped.content,
        featured_image_url: scraped.featuredImage,
        author_name: scraped.author,
        source_name: scraped.source,
        source_url: scraped.finalUrl,
      })
      .eq('id', article.id)

    if (updateError) {
      console.error(`   ❌ Error actualizando BD:`, updateError)
      failed++
    } else {
      console.log(`   ✅ Actualizado en BD`)
      updated++
    }

    // Pequeña pausa para no sobrecargar los servidores
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log(`\n\n📊 RESUMEN:`)
  console.log(`   ✅ Actualizados: ${updated}`)
  console.log(`   ❌ Fallidos: ${failed}`)
  console.log(`   📝 Total: ${articles.length}`)
}

updateArticlesWithScraping().catch(console.error)
