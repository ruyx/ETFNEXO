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

async function importGoogleSheet() {
  console.log('📥 Importando noticias desde Google Sheet...\n')

  // Descargar CSV
  console.log('🔄 Descargando CSV...')
  const response = await fetch(GSHEET_CSV_URL)
  const csvText = await response.text()

  // Parse CSV (simple)
  const lines = csvText.split('\n').filter(l => l.trim())
  console.log(`📄 ${lines.length} líneas en el CSV\n`)

  const articles = []

  // Saltar header (primera línea)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]

    // CSV simple parse (puede mejorar con library si hay comillas)
    const parts = line.split(',')

    if (parts.length < 3) continue

    const priority = parts[0]
    const dateStr = parts[1]
    const url = parts[2]
    const author = parts[3] || ''

    if (!url || !url.startsWith('http')) continue

    // Extraer título de la URL
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(p => p)
    const slugFromUrl = pathParts[pathParts.length - 1]
    const title = slugFromUrl
      .replace(/-/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .substring(0, 200)

    const slug = slugify(title)
    const publishedAt = parseCSVDate(dateStr)

    articles.push({
      title,
      slug,
      content: `Artículo importado desde ${urlObj.hostname}`,
      excerpt: `Noticia sobre ETFs del ${dateStr}`,
      source_url: url,
      source_name: null, // Google Sheet
      author_name: author || null,
      published_at: publishedAt.toISOString(),
      status: 'published',
      featured_image_url: null
    })
  }

  console.log(`📊 ${articles.length} artículos parseados\n`)

  // Insertar en BD
  let inserted = 0
  let skipped = 0

  for (const article of articles) {
    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('news_articles')
      .select('id')
      .eq('source_url', article.source_url)
      .single()

    if (existing) {
      skipped++
      console.log(`⏭️  ${article.title} (ya existe)`)
      continue
    }

    // Insertar
    const { error } = await supabase
      .from('news_articles')
      .insert(article)

    if (error) {
      console.error(`❌ Error insertando "${article.title}":`, error.message)
    } else {
      inserted++
      console.log(`✅ ${article.title}`)
    }
  }

  console.log(`\n📊 RESUMEN:`)
  console.log(`   Total en CSV: ${articles.length}`)
  console.log(`   Insertados: ${inserted}`)
  console.log(`   Omitidos (ya existían): ${skipped}`)

  // Verificar total en BD
  const { count } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  console.log(`   Total en BD ahora: ${count}\n`)
}

importGoogleSheet().catch(console.error)
