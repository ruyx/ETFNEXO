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

const GSHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vStrEBHOhxe_R-p_bbPXzglHsBWHDnCbScB30VGumBKYg2hhFN5cG6OYlQ5PjlZHPXRlGoL1Grl4CTq/pub?output=csv'
const SCRAPER_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/scrape-article-content`

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
}

function parseCSVDate(dateStr: string): Date {
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    return new Date(year, month, day)
  }
  return new Date()
}

interface ScrapedArticle {
  title: string
  content: string
  excerpt: string
  featured_image_url: string | null
  author_name: string | null
  source_name: string | null
  published_at: string | null
}

async function scrapeArticleContent(url: string): Promise<ScrapedArticle | null> {
  try {
    console.log(`   🔍 Scraping: ${url}`)

    const response = await fetch(SCRAPER_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ url })
    })

    if (!response.ok) {
      console.error(`   ❌ Scraper failed: ${response.status}`)
      return null
    }

    const result = await response.json()

    if (result.success && result.data) {
      console.log(`   ✅ Scraped: ${result.data.title}`)
      return result.data
    }

    console.error(`   ❌ Scraper error: ${result.error}`)
    return null
  } catch (error) {
    console.error(`   ❌ Scraping error:`, error)
    return null
  }
}

async function importGoogleSheetWithScraping() {
  console.log('📥 Importando noticias desde Google Sheet CON SCRAPING COMPLETO...\n')

  // Descargar CSV
  console.log('🔄 Descargando CSV...')
  const response = await fetch(GSHEET_CSV_URL)
  const csvText = await response.text()

  // Parse CSV
  const lines = csvText.split('\n').filter(l => l.trim())
  console.log(`📄 ${lines.length} líneas en el CSV\n`)

  const articles = []

  // Saltar header (primera línea)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const parts = line.split(',')

    if (parts.length < 3) continue

    const priority = parts[0]
    const dateStr = parts[1]
    const url = parts[2]
    const authorUrl = parts[3] || ''

    if (!url || !url.startsWith('http')) continue

    console.log(`\n[${i}/${lines.length - 1}] Procesando artículo...`)

    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('news_articles')
      .select('id')
      .eq('source_url', url)
      .single()

    if (existing) {
      console.log(`   ⏭️  Ya existe en BD - saltando`)
      continue
    }

    // Scrapear el contenido completo del artículo
    const scrapedData = await scrapeArticleContent(url)

    if (!scrapedData) {
      console.log(`   ⚠️  Scraping falló - usando datos básicos`)
      // Fallback: crear entrada básica sin scraping
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/').filter(p => p)
      const slugFromUrl = pathParts[pathParts.length - 1]
      const fallbackTitle = slugFromUrl
        .replace(/-/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
        .substring(0, 200)

      articles.push({
        title: fallbackTitle,
        slug: slugify(fallbackTitle),
        content: `Artículo importado desde ${urlObj.hostname}`,
        excerpt: `Noticia sobre ETFs del ${dateStr}`,
        source_url: url,
        source_name: urlObj.hostname,
        author_name: authorUrl || null,
        published_at: parseCSVDate(dateStr).toISOString(),
        status: 'published',
        featured_image_url: null
      })
    } else {
      // Usar datos scrapeados
      articles.push({
        title: scrapedData.title,
        slug: slugify(scrapedData.title),
        content: scrapedData.content,
        excerpt: scrapedData.excerpt,
        source_url: url,
        source_name: scrapedData.source_name,
        author_name: scrapedData.author_name || authorUrl || null,
        published_at: scrapedData.published_at || parseCSVDate(dateStr).toISOString(),
        status: 'published',
        featured_image_url: scrapedData.featured_image_url
      })
    }

    // Pequeña pausa para no saturar el scraper
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log(`\n\n📊 ${articles.length} artículos listos para insertar\n`)

  // Insertar en BD
  let inserted = 0
  let failed = 0

  for (const article of articles) {
    const { error } = await supabase
      .from('news_articles')
      .insert(article)

    if (error) {
      failed++
      console.error(`❌ Error insertando "${article.title}":`, error.message)
    } else {
      inserted++
      console.log(`✅ ${article.title}`)
    }
  }

  console.log(`\n📊 RESUMEN:`)
  console.log(`   Total en CSV: ${lines.length - 1}`)
  console.log(`   Procesados: ${articles.length}`)
  console.log(`   Insertados: ${inserted}`)
  console.log(`   Fallidos: ${failed}`)

  // Verificar total en BD
  const { count } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  console.log(`   Total en BD ahora: ${count}\n`)
}

importGoogleSheetWithScraping().catch(console.error)
