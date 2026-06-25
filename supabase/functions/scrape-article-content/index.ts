import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'

interface ScrapedArticle {
  title: string
  content: string
  excerpt: string
  featured_image_url: string | null
  author_name: string | null
  source_name: string | null
  published_at: string | null
}

serve(async (req) => {
  try {
    const { url } = await req.json()

    if (!url || !url.startsWith('http')) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[Scraping] ${url}`)

    // Fetch article HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.status}`)
    }

    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    if (!doc) {
      throw new Error('Failed to parse HTML')
    }

    // Extract data using multiple methods
    const scrapedData: ScrapedArticle = {
      title: extractTitle(doc, url),
      content: extractContent(doc),
      excerpt: extractExcerpt(doc),
      featured_image_url: extractImage(doc, url),
      author_name: extractAuthor(doc),
      source_name: extractSource(doc, url),
      published_at: extractPublishedDate(doc)
    }

    console.log(`[Success] Scraped: ${scrapedData.title}`)

    return new Response(
      JSON.stringify({ success: true, data: scrapedData }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Error]', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Extract title from multiple sources
function extractTitle(doc: any, url: string): string {
  // 1. Open Graph
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
  if (ogTitle) return ogTitle.trim()

  // 2. Twitter Card
  const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content')
  if (twitterTitle) return twitterTitle.trim()

  // 3. Standard title tag
  const titleTag = doc.querySelector('title')?.textContent
  if (titleTag) return titleTag.trim()

  // 4. H1
  const h1 = doc.querySelector('h1')?.textContent
  if (h1) return h1.trim()

  // Fallback: extract from URL
  const urlObj = new URL(url)
  const pathParts = urlObj.pathname.split('/').filter(p => p)
  const slug = pathParts[pathParts.length - 1]
  return slug
    .replace(/-/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Extract main article content
function extractContent(doc: any): string {
  // Common article content selectors
  const selectors = [
    'article',
    '[itemprop="articleBody"]',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.article__body',
    '.content-body',
    'main article',
    '.article-text'
  ]

  for (const selector of selectors) {
    const element = doc.querySelector(selector)
    if (element) {
      // Get all paragraphs
      const paragraphs = element.querySelectorAll('p')
      const content = Array.from(paragraphs)
        .map((p: any) => p.textContent?.trim())
        .filter((text: string) => text && text.length > 50) // Filter out short paragraphs
        .join('\n\n')

      if (content.length > 200) {
        return content.substring(0, 5000) // Limit to 5000 chars
      }
    }
  }

  // Fallback: get all paragraphs from body
  const allParagraphs = doc.querySelectorAll('p')
  const fallbackContent = Array.from(allParagraphs)
    .map((p: any) => p.textContent?.trim())
    .filter((text: string) => text && text.length > 50)
    .slice(0, 10) // Take first 10 paragraphs
    .join('\n\n')

  return fallbackContent.substring(0, 5000) || 'Contenido no disponible'
}

// Extract excerpt/description
function extractExcerpt(doc: any): string {
  // 1. Open Graph description
  const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content')
  if (ogDesc) return ogDesc.trim().substring(0, 300)

  // 2. Meta description
  const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content')
  if (metaDesc) return metaDesc.trim().substring(0, 300)

  // 3. Twitter description
  const twitterDesc = doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content')
  if (twitterDesc) return twitterDesc.trim().substring(0, 300)

  // 4. First paragraph
  const firstP = doc.querySelector('article p, .article-content p, .post-content p')?.textContent
  if (firstP) return firstP.trim().substring(0, 300)

  return 'Sin descripción disponible'
}

// Extract featured image
function extractImage(doc: any, url: string): string | null {
  // 1. Open Graph image
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
  if (ogImage) return makeAbsoluteUrl(ogImage, url)

  // 2. Twitter image
  const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
  if (twitterImage) return makeAbsoluteUrl(twitterImage, url)

  // 3. Article image
  const articleImg = doc.querySelector('article img, .article-content img, .post-content img')?.getAttribute('src')
  if (articleImg) return makeAbsoluteUrl(articleImg, url)

  // 4. First img in body
  const firstImg = doc.querySelector('img')?.getAttribute('src')
  if (firstImg) return makeAbsoluteUrl(firstImg, url)

  return null
}

// Extract author name
function extractAuthor(doc: any): string | null {
  // 1. JSON-LD
  const jsonLd = doc.querySelector('script[type="application/ld+json"]')
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd.textContent)
      if (data.author?.name) return data.author.name
      if (typeof data.author === 'string') return data.author
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  // 2. Meta author
  const metaAuthor = doc.querySelector('meta[name="author"]')?.getAttribute('content')
  if (metaAuthor) return metaAuthor.trim()

  // 3. Common author selectors
  const authorSelectors = [
    '.author-name',
    '.article-author',
    '[rel="author"]',
    '[itemprop="author"]',
    '.byline',
    '.author'
  ]

  for (const selector of authorSelectors) {
    const element = doc.querySelector(selector)
    if (element) {
      const text = element.textContent?.trim()
      if (text && text.length < 100) {
        return text.replace(/^(por|by)\s+/i, '')
      }
    }
  }

  return null
}

// Extract source/publication name
function extractSource(doc: any, url: string): string | null {
  // 1. Open Graph site name
  const ogSite = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content')
  if (ogSite) return ogSite.trim()

  // 2. JSON-LD publisher
  const jsonLd = doc.querySelector('script[type="application/ld+json"]')
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd.textContent)
      if (data.publisher?.name) return data.publisher.name
    } catch (e) {
      // Ignore
    }
  }

  // 3. From domain
  const urlObj = new URL(url)
  const domain = urlObj.hostname.replace(/^www\./, '')

  // Map known domains to readable names
  const domainMap: Record<string, string> = {
    'finect.com': 'Finect',
    'rankia.com': 'Rankia',
    'fundssociety.com': 'Funds Society',
    'morningstar.es': 'Morningstar España',
    'elpais.com': 'El País',
    'expansion.com': 'Expansión',
    'cincodias.elpais.com': 'Cinco Días',
    'eleconomista.es': 'El Economista'
  }

  return domainMap[domain] || domain
}

// Extract published date
function extractPublishedDate(doc: any): string | null {
  // 1. JSON-LD
  const jsonLd = doc.querySelector('script[type="application/ld+json"]')
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd.textContent)
      if (data.datePublished) return new Date(data.datePublished).toISOString()
      if (data.dateCreated) return new Date(data.dateCreated).toISOString()
    } catch (e) {
      // Ignore
    }
  }

  // 2. Meta published time
  const metaPublished = doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content')
  if (metaPublished) return new Date(metaPublished).toISOString()

  // 3. Time tag
  const timeTag = doc.querySelector('time')?.getAttribute('datetime')
  if (timeTag) return new Date(timeTag).toISOString()

  return null
}

// Convert relative URLs to absolute
function makeAbsoluteUrl(imgUrl: string, baseUrl: string): string {
  if (imgUrl.startsWith('http')) return imgUrl

  const base = new URL(baseUrl)

  if (imgUrl.startsWith('//')) {
    return `${base.protocol}${imgUrl}`
  }

  if (imgUrl.startsWith('/')) {
    return `${base.protocol}//${base.host}${imgUrl}`
  }

  return `${base.protocol}//${base.host}/${imgUrl}`
}
