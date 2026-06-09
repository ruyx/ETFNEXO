// ============================================
// ETF Nexo - News Fetcher Edge Function (v2 - Full Content Scraper)
// ============================================
// Descripción: Obtiene noticias de Google News RSS y scrape el contenido completo
// Ejecutar: curl -X POST https://<project-ref>.supabase.co/functions/v1/fetch-news
// Cron: Configurar en Supabase Dashboard

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

// ============================================
// Interfaces
// ============================================
interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source?: string;
  guid?: string;
}

interface NewsSource {
  name: string;
  url: string;
  category: string;
  language: string;
}

interface ScrapedArticle {
  content: string;
  featuredImage: string | null;
  author: string | null;
  finalUrl: string; // URL real después de redirects
}

// ============================================
// Configuración de fuentes RSS
// ============================================
const NEWS_SOURCES: NewsSource[] = [
  // Google News - ETF tradicionales (EXCLUYE crypto)
  {
    name: 'Google News ETF España',
    url: 'https://news.google.com/rss/search?q=ETF+OR+"fondos+cotizados"+-Bitcoin+-crypto+-criptomonedas+-blockchain+-BTC+-ETH+when:7d&hl=es&gl=ES&ceid=ES:es',
    category: 'etfs',
    language: 'es'
  },
  // Google News - Gestoras (EXCLUYE crypto)
  {
    name: 'Google News Gestoras',
    url: 'https://news.google.com/rss/search?q=(BlackRock+OR+Vanguard+OR+iShares+OR+Amundi+OR+Invesco+OR+SPDR)+ETF+-Bitcoin+-crypto+-criptomonedas+when:7d&hl=es&gl=ES&ceid=ES:es',
    category: 'gestoras',
    language: 'es'
  },
  // Google News - ETFs Renta Variable
  {
    name: 'Google News ETF Renta Variable',
    url: 'https://news.google.com/rss/search?q="ETF+renta+variable"+OR+"ETF+acciones"+OR+"ETF+bolsa"+-Bitcoin+-crypto+when:7d&hl=es&gl=ES&ceid=ES:es',
    category: 'etfs',
    language: 'es'
  },
  // Google News - ETFs Renta Fija
  {
    name: 'Google News ETF Renta Fija',
    url: 'https://news.google.com/rss/search?q="ETF+renta+fija"+OR+"ETF+bonos"+OR+"ETF+deuda"+-Bitcoin+-crypto+when:7d&hl=es&gl=ES&ceid=ES:es',
    category: 'etfs',
    language: 'es'
  },
  // Finect - RSS Feed
  {
    name: 'Finect ETFs',
    url: 'https://www.finect.com/rss/etfs',
    category: 'etfs',
    language: 'es'
  }
];

// ============================================
// Filtros Anti-Crypto
// ============================================
const CRYPTO_KEYWORDS = [
  'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'criptomoneda', 'criptomonedas',
  'blockchain', 'cripto', 'criptodivisa', 'altcoin', 'defi', 'nft',
  'binance', 'coinbase', 'solana', 'cardano', 'ripple', 'xrp',
  'dogecoin', 'doge', 'shiba', 'token', 'web3', 'metaverse', 'metaverso',
  'stablecoin', 'usdt', 'usdc', 'mining', 'minería', 'wallet', 'monedero digital'
];

function containsCryptoKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return CRYPTO_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

// ============================================
// Utilidades
// ============================================
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

function extractExcerpt(html: string, maxLength = 200): string {
  let text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();

  if (text.includes('<') || text.includes('href=')) {
    const match = text.match(/target="_blank">([^<]+)</);
    if (match && match[1]) {
      text = match[1].trim();
    }
  }

  text = text.replace(/https?:\/\/[^\s]+/g, '');
  text = text.replace(/\s+/g, ' ').trim();

  return text.length > maxLength
    ? text.substring(0, maxLength) + '...'
    : text;
}

// ============================================
// Content Scraper - Extrae contenido completo del artículo
// ============================================
async function scrapeArticleContent(url: string): Promise<ScrapedArticle> {
  const defaultResult: ScrapedArticle = {
    content: '',
    featuredImage: null,
    author: null,
    finalUrl: url
  };

  try {
    console.log(`🔍 Scraping article: ${url}`);

    // Fetch con headers para evitar bloqueos
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Referer': 'https://www.google.com/'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch article (${response.status}): ${url}`);
      return defaultResult;
    }

    // Obtener URL final después de redirects
    const finalUrl = response.url || url;
    console.log(`📍 Final URL: ${finalUrl}`);

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    if (!doc) {
      console.error('❌ Failed to parse HTML');
      return defaultResult;
    }

    // Estrategias de extracción de contenido (en orden de prioridad)
    let content = '';
    let featuredImage: string | null = null;
    let author: string | null = null;

    // 1. Buscar article tag
    const articleTag = doc.querySelector('article');
    if (articleTag) {
      content = cleanArticleContent(articleTag);
    }

    // 2. Buscar por clases comunes de contenido
    if (!content) {
      const contentSelectors = [
        '.article-content',
        '.post-content',
        '.entry-content',
        '.story-content',
        '.article-body',
        '.post-body',
        '[itemprop="articleBody"]',
        '.content',
        'main article',
        'main .content'
      ];

      for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          content = cleanArticleContent(element);
          if (content.length > 300) break;
        }
      }
    }

    // 3. Fallback: buscar el div/section más largo
    if (!content || content.length < 300) {
      const paragraphs = Array.from(doc.querySelectorAll('p'));
      const longestSection = paragraphs
        .map(p => p.textContent || '')
        .filter(text => text.length > 100)
        .join('\n\n');

      if (longestSection.length > content.length) {
        content = formatTextToHTML(longestSection);
      }
    }

    // Extraer imagen destacada
    const imageSelectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'article img:first-of-type',
      '.featured-image img',
      '.post-thumbnail img',
      '[itemprop="image"]'
    ];

    for (const selector of imageSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const src = element.getAttribute('content') || element.getAttribute('src');
        if (src && isValidImageUrl(src)) {
          featuredImage = normalizeImageUrl(src, url);
          break;
        }
      }
    }

    // Extraer autor
    const authorSelectors = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      '[itemprop="author"]',
      '.author-name',
      '.post-author',
      '.article-author'
    ];

    for (const selector of authorSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        author = element.getAttribute('content') || element.textContent?.trim() || null;
        if (author) break;
      }
    }

    console.log(`✅ Scraped ${content.length} chars, image: ${featuredImage ? 'yes' : 'no'}, author: ${author || 'no'}`);

    return {
      content: content || defaultResult.content,
      featuredImage: featuredImage || defaultResult.featuredImage,
      author: author || defaultResult.author,
      finalUrl: finalUrl
    };

  } catch (error) {
    console.error(`❌ Error scraping article ${url}:`, error);
    return defaultResult;
  }
}

// Limpia el contenido del artículo eliminando elementos no deseados
function cleanArticleContent(element: any): string {
  // Clonar para no modificar el original
  const clone = element.cloneNode(true);

  // Remover elementos no deseados
  const unwantedSelectors = [
    'script',
    'style',
    'nav',
    'header',
    'footer',
    'aside',
    '.advertisement',
    '.ad',
    '.social-share',
    '.related-posts',
    '.comments',
    'iframe',
    'form'
  ];

  unwantedSelectors.forEach(selector => {
    const elements = clone.querySelectorAll(selector);
    elements.forEach((el: any) => el.remove());
  });

  // Obtener HTML limpio
  let html = clone.innerHTML || '';

  // Limpiar atributos peligrosos
  html = html
    .replace(/\son\w+="[^"]*"/g, '') // Remover event handlers
    .replace(/javascript:/gi, '') // Remover javascript: urls
    .replace(/<script[^>]*>.*?<\/script>/gi, ''); // Remover scripts inline

  return html.trim();
}

// Convierte texto plano a HTML con párrafos
function formatTextToHTML(text: string): string {
  return text
    .split('\n\n')
    .filter(p => p.trim().length > 0)
    .map(p => `<p>${p.trim()}</p>`)
    .join('\n');
}

// Valida si una URL es de imagen
function isValidImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) ||
         url.includes('image') ||
         url.includes('photo');
}

// Normaliza URLs relativas a absolutas
function normalizeImageUrl(imageUrl: string, baseUrl: string): string {
  try {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    const base = new URL(baseUrl);
    return new URL(imageUrl, base.origin).toString();
  } catch {
    return imageUrl;
  }
}

// ============================================
// Parser de RSS a JSON
// ============================================
async function parseRSS(url: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ETFNexo-NewsBot/2.0'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    const items: RSSItem[] = [];
    const itemMatches = xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi);

    for (const match of itemMatches) {
      const itemXml = match[1];

      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i)?.[1] || itemXml.match(/<title>(.*?)<\/title>/i)?.[1] || '';
      const link = itemXml.match(/<link>(.*?)<\/link>/i)?.[1] || '';
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i)?.[1] || '';
      const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/i)?.[1] || itemXml.match(/<description>(.*?)<\/description>/i)?.[1] || '';
      const guid = itemXml.match(/<guid.*?>(.*?)<\/guid>/i)?.[1] || link;

      if (title && link) {
        items.push({
          title: title.trim(),
          link: link.trim(),
          pubDate: pubDate.trim(),
          description: description.trim(),
          guid: guid.trim()
        });
      }
    }

    return items;
  } catch (error) {
    console.error(`Error parsing RSS from ${url}:`, error);
    return [];
  }
}

// ============================================
// Procesar y guardar noticias
// ============================================
async function processNews(supabaseClient: any) {
  const results = {
    total: 0,
    inserted: 0,
    skipped: 0,
    filteredCrypto: 0,
    scrapedFull: 0,
    scrapedPartial: 0,
    scrapeFailed: 0,
    errors: 0
  };

  const { data: categories } = await supabaseClient
    .from('news_categories')
    .select('id, slug');

  const categoryMap = new Map(categories?.map((c: any) => [c.slug, c.id]) || []);

  for (const source of NEWS_SOURCES) {
    console.log(`📰 Fetching from: ${source.name}`);

    const items = await parseRSS(source.url);
    results.total += items.length;

    for (const item of items) {
      try {
        // FILTRO 1: Excluir crypto
        if (containsCryptoKeywords(item.title) || containsCryptoKeywords(item.description)) {
          results.filteredCrypto++;
          console.log(`✗ Filtered (crypto): ${item.title.substring(0, 50)}...`);
          continue;
        }

        // SCRAPE del contenido completo primero para obtener URL real
        const scrapedData = await scrapeArticleContent(item.link);

        // FILTRO 2: Verificar duplicados por URL final (después de redirects)
        const { data: existing } = await supabaseClient
          .from('news_articles')
          .select('id')
          .eq('source_url', scrapedData.finalUrl)
          .single();

        if (existing) {
          results.skipped++;
          console.log(`✗ Skipped (duplicate): ${item.title.substring(0, 50)}...`);
          continue;
        }

        if (scrapedData.content && scrapedData.content.length > 500) {
          results.scrapedFull++;
        } else if (scrapedData.content && scrapedData.content.length > 100) {
          results.scrapedPartial++;
        } else {
          results.scrapeFailed++;
        }

        // Crear slug único
        const baseSlug = slugify(item.title);
        let slug = baseSlug;
        let counter = 1;

        while (true) {
          const { data: slugExists } = await supabaseClient
            .from('news_articles')
            .select('id')
            .eq('slug', slug)
            .single();

          if (!slugExists) break;
          slug = `${baseSlug}-${counter++}`;
        }

        // Determinar featured image (prioridad: scraped > placeholder)
        let featuredImage = scrapedData.featuredImage;
        if (!featuredImage) {
          // Placeholder de Unsplash relacionado con finanzas/inversión
          const unsplashIds = [
            'photo-1611974789855-9c2a0a7236a3', // Trading charts
            'photo-1559589689-577aabd1db4f', // Stock market
            'photo-1590283603385-17ffb3a7f29f', // Financial data
            'photo-1460925895917-afdab827c52f', // Business growth
            'photo-1551288049-bebda4e38f71', // Charts and graphs
          ];
          const randomId = unsplashIds[Math.floor(Math.random() * unsplashIds.length)];
          featuredImage = `https://images.unsplash.com/${randomId}?w=800&h=450&fit=crop`;
        }

        // Preparar artículo
        const article = {
          title: item.title,
          slug: slug,
          excerpt: extractExcerpt(scrapedData.content || item.description),
          content: scrapedData.content || item.description,
          featured_image_url: featuredImage,
          category_id: categoryMap.get(source.category) || null,
          source_name: source.name,
          source_url: scrapedData.finalUrl, // Usar URL real después de redirects
          source_published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          status: 'published', // Auto-publicar si tiene contenido completo
          published_at: scrapedData.content.length > 500 ? new Date().toISOString() : null,
          author_name: scrapedData.author || 'Redacción ETF Nexo'
        };

        // Insertar
        const { error } = await supabaseClient
          .from('news_articles')
          .insert(article);

        if (error) {
          console.error('Error inserting article:', error);
          results.errors++;
        } else {
          results.inserted++;
          const status = scrapedData.content.length > 500 ? '✓ FULL' : scrapedData.content.length > 100 ? '⚠ PARTIAL' : '✗ MINIMAL';
          console.log(`${status} Inserted: ${item.title.substring(0, 50)}...`);
        }

      } catch (error) {
        console.error('Error processing item:', error);
        results.errors++;
      }
    }
  }

  return results;
}

// ============================================
// Edge Function Handler
// ============================================
serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🚀 Starting news fetch with full content scraping...');
    const results = await processNews(supabaseClient);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'News fetch completed with content scraping',
        results
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});
