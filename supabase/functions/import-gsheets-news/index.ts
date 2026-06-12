// ============================================
// ETF Nexo - Google Sheets News Importer
// ============================================
// Descripción: Importa noticias desde Google Sheets público
// Ejecutar: curl -X POST https://<project-ref>.supabase.co/functions/v1/import-gsheets-news
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

// ============================================
// Interfaces
// ============================================
interface GoogleSheetRow {
  priority: string;
  date: string;
  url: string;
  authorUrl: string;
}

interface ScrapedArticle {
  title: string;
  content: string;
  featuredImage: string | null;
  author: string | null;
  finalUrl: string;
}

// ============================================
// Configuración
// ============================================
const GSHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vStrEBHOhxe_R-p_bbPXzglHsBWHDnCbScB30VGumBKYg2hhFN5cG6OYlQ5PjlZHPXRlGoL1Grl4CTq/pub?output=csv';

// ============================================
// Utilidades (reutilizadas de fetch-news)
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

function extractSourceName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    // Remover www. y obtener el dominio principal
    const domain = hostname.replace('www.', '').split('.')[0];
    // Capitalizar primera letra
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    return 'Fuente Externa';
  }
}

function parseCSVDate(dateStr: string): Date {
  // Formato DD/MM/YYYY -> convertir a ISO
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(); // fallback to today
}

// ============================================
// Content Scraper - Extrae contenido completo del artículo
// ============================================
async function scrapeArticleContent(url: string): Promise<ScrapedArticle> {
  const defaultResult: ScrapedArticle = {
    title: '',
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

    const finalUrl = response.url || url;
    const buffer = await response.arrayBuffer();

    // Intentar decodificar como windows-1252 primero (común en sitios españoles)
    let html: string;
    try {
      const decoder = new TextDecoder('windows-1252');
      html = decoder.decode(buffer);
    } catch {
      const decoder = new TextDecoder('utf-8');
      html = decoder.decode(buffer);
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    if (!doc) {
      console.error('❌ Failed to parse HTML');
      return defaultResult;
    }

    // Extraer título
    let title = '';
    const titleTag = doc.querySelector('h1, .article-title, .post-title, [itemprop="headline"]');
    if (titleTag) {
      title = titleTag.textContent?.trim() || '';
    }
    if (!title) {
      const metaTitle = doc.querySelector('meta[property="og:title"]') as Element;
      if (metaTitle) {
        title = metaTitle.getAttribute('content') || '';
      }
    }
    if (!title) {
      const docTitle = doc.querySelector('title');
      if (docTitle) {
        title = docTitle.textContent?.trim() || '';
      }
    }

    // Extraer contenido
    let content = '';
    const articleTag = doc.querySelector('article');
    if (articleTag) {
      content = cleanArticleContent(articleTag);
    }

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

    // Fallback: buscar párrafos
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
    let featuredImage: string | null = null;
    const ogImage = doc.querySelector('meta[property="og:image"]') as Element;
    if (ogImage) {
      featuredImage = ogImage.getAttribute('content');
    }
    if (!featuredImage) {
      const twitterImage = doc.querySelector('meta[name="twitter:image"]') as Element;
      if (twitterImage) {
        featuredImage = twitterImage.getAttribute('content');
      }
    }
    if (!featuredImage) {
      const firstImg = doc.querySelector('article img, .post-content img, .entry-content img');
      if (firstImg) {
        featuredImage = firstImg.getAttribute('src');
      }
    }

    // Extraer autor
    let author: string | null = null;
    const authorMeta = doc.querySelector('meta[name="author"]') as Element;
    if (authorMeta) {
      author = authorMeta.getAttribute('content');
    }
    if (!author) {
      const authorTag = doc.querySelector('.author-name, .author, [rel="author"], [itemprop="author"]');
      if (authorTag) {
        author = authorTag.textContent?.trim() || null;
      }
    }

    console.log(`✅ Scraped: ${title.substring(0, 50)}...`);

    return {
      title,
      content,
      featuredImage,
      author,
      finalUrl
    };
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error);
    return defaultResult;
  }
}

function cleanArticleContent(element: Element): string {
  // Clonar el elemento para no modificar el DOM original
  const clone = element.cloneNode(true) as Element;

  // Remover scripts, styles, nav, aside, form, etc.
  const unwantedSelectors = [
    'script',
    'style',
    'nav',
    'aside',
    'form',
    'iframe',
    'noscript',
    '.sidebar',
    '.related-posts',
    '.comments',
    '.share-buttons',
    '.advertisement',
    '.ad',
    '.social-share'
  ];

  unwantedSelectors.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });

  // Extraer solo texto de párrafos y encabezados
  const paragraphs = Array.from(clone.querySelectorAll('p, h2, h3, h4, h5, h6, li'));
  const content = paragraphs
    .map(p => {
      const tagName = p.tagName.toLowerCase();
      const text = p.textContent?.trim() || '';

      if (!text) return '';

      // Formatear según el tipo de elemento
      if (tagName.startsWith('h')) {
        return `<${tagName}>${text}</${tagName}>`;
      } else if (tagName === 'li') {
        return `<li>${text}</li>`;
      } else {
        return `<p>${text}</p>`;
      }
    })
    .filter(text => text.length > 20)
    .join('\n');

  return content || '';
}

function formatTextToHTML(text: string): string {
  return text
    .split('\n\n')
    .filter(para => para.trim().length > 0)
    .map(para => `<p>${para.trim()}</p>`)
    .join('\n');
}

// ============================================
// Parser de CSV
// ============================================
async function fetchGoogleSheetCSV(): Promise<GoogleSheetRow[]> {
  console.log('📥 Fetching Google Sheet CSV...');

  const response = await fetch(GSHEET_CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Google Sheet: ${response.status}`);
  }

  const csvText = await response.text();
  const lines = csvText.trim().split('\n');

  // Saltar header (primera línea)
  const rows: GoogleSheetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.split(',');

    if (columns.length >= 4 && columns[2]) {
      rows.push({
        priority: columns[0],
        date: columns[1],
        url: columns[2],
        authorUrl: columns[3]
      });
    }
  }

  console.log(`📊 Found ${rows.length} rows in Google Sheet`);
  return rows;
}

// ============================================
// Main Handler
// ============================================
serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }

  try {
    console.log('🚀 Starting Google Sheets news import...');

    // Conectar a Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch CSV from Google Sheets
    const rows = await fetchGoogleSheetCSV();

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Procesar cada URL
    for (const row of rows) {
      try {
        const url = row.url.trim();

        // Verificar si ya existe (por source_url)
        const { data: existing } = await supabase
          .from('news_articles')
          .select('id')
          .eq('source_url', url)
          .single();

        if (existing) {
          console.log(`⏭️  Skipping (already exists): ${url}`);
          skipped++;
          continue;
        }

        // Scrapear contenido
        const scraped = await scrapeArticleContent(url);

        if (!scraped.title || !scraped.content) {
          console.log(`❌ Failed to scrape content: ${url}`);
          errors++;
          continue;
        }

        // Parsear fecha
        const publishedAt = parseCSVDate(row.date);

        // Insertar en la base de datos
        const { error } = await supabase
          .from('news_articles')
          .insert({
            title: scraped.title,
            content: scraped.content,
            source_url: url,
            source_name: extractSourceName(url),
            featured_image_url: scraped.featuredImage,
            published_at: publishedAt.toISOString(),
            author_name: scraped.author,
            slug: `${slugify(scraped.title)}-${Date.now()}`,
            status: 'published' // IMPORTANTE: Marcar como publicado para que aparezca en la web
          });

        if (error) {
          console.error(`❌ Error inserting article: ${error.message}`);
          errors++;
        } else {
          console.log(`✅ Imported: ${scraped.title.substring(0, 50)}...`);
          imported++;
        }

        // Pequeño delay para no saturar
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Error processing row:`, error);
        errors++;
      }
    }

    const summary = {
      total: rows.length,
      imported,
      skipped,
      errors
    };

    console.log('📊 Import complete:', summary);

    return new Response(
      JSON.stringify(summary),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    console.error('❌ Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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
