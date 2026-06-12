// ============================================
// ETF Nexo - Google Sheets News Importer (Next.js API Route)
// ============================================
// Descripción: Importa noticias desde Google Sheets público
// URL: POST /api/admin/import-gsheets-news
// ============================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { JSDOM } from 'jsdom';

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

function extractSourceName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const domain = hostname.replace('www.', '').split('.')[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    return 'Fuente Externa';
  }
}

function parseCSVDate(dateStr: string): Date {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date();
}

// ============================================
// Content Scraper
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
    console.log(`🔍 Scraping: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-ES,es;q=0.9',
      },
    });

    if (!response.ok) {
      console.error(`❌ Failed (${response.status}): ${url}`);
      return defaultResult;
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Extraer título
    let title = '';
    const titleTag = doc.querySelector('h1, .article-title, .post-title, [itemprop="headline"]');
    if (titleTag) {
      title = titleTag.textContent?.trim() || '';
    }
    if (!title) {
      const ogTitle = doc.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        title = ogTitle.getAttribute('content') || '';
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
      ];

      for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          content = cleanArticleContent(element);
          if (content.length > 300) break;
        }
      }
    }

    // Fallback
    if (!content || content.length < 300) {
      const paragraphs = Array.from(doc.querySelectorAll('p'));
      const text = paragraphs
        .map(p => p.textContent || '')
        .filter(t => t.length > 100)
        .join('\n\n');

      content = text
        .split('\n\n')
        .map(p => `<p>${p.trim()}</p>`)
        .join('\n');
    }

    // Extraer imagen
    let featuredImage: string | null = null;
    const ogImage = doc.querySelector('meta[property="og:image"]');
    if (ogImage) {
      featuredImage = ogImage.getAttribute('content');
    }
    if (!featuredImage) {
      const twitterImage = doc.querySelector('meta[name="twitter:image"]');
      if (twitterImage) {
        featuredImage = twitterImage.getAttribute('content');
      }
    }

    // Extraer autor
    let author: string | null = null;
    const authorMeta = doc.querySelector('meta[name="author"]');
    if (authorMeta) {
      author = authorMeta.getAttribute('content');
    }

    console.log(`✅ Scraped: ${title.substring(0, 50)}...`);

    return {
      title,
      content,
      featuredImage,
      author,
      finalUrl: response.url
    };
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error);
    return defaultResult;
  }
}

function cleanArticleContent(element: Element): string {
  const unwantedSelectors = [
    'script', 'style', 'nav', 'aside', 'form', 'iframe',
    '.sidebar', '.related-posts', '.comments', '.ad'
  ];

  const clone = element.cloneNode(true) as Element;
  unwantedSelectors.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });

  const paragraphs = Array.from(clone.querySelectorAll('p, h2, h3, li'));
  return paragraphs
    .map(p => {
      const text = p.textContent?.trim() || '';
      if (!text || text.length < 20) return '';
      const tag = p.tagName.toLowerCase();
      return tag.startsWith('h') || tag === 'li' ? `<${tag}>${text}</${tag}>` : `<p>${text}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

// ============================================
// CSV Parser
// ============================================
async function fetchGoogleSheetCSV(): Promise<GoogleSheetRow[]> {
  console.log('📥 Fetching Google Sheet...');

  const response = await fetch(GSHEET_CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const csvText = await response.text();
  const lines = csvText.trim().split('\n');
  const rows: GoogleSheetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(',');
    if (columns.length >= 4 && columns[2]) {
      rows.push({
        priority: columns[0],
        date: columns[1],
        url: columns[2],
        authorUrl: columns[3]
      });
    }
  }

  console.log(`📊 Found ${rows.length} rows`);
  return rows;
}

// ============================================
// API Handler
// ============================================
export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Starting import...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const rows = await fetchGoogleSheetCSV();

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of rows) {
      try {
        const url = row.url.trim();

        // Check if exists
        const { data: existing } = await supabase
          .from('news_articles')
          .select('id')
          .eq('source_url', url)
          .single();

        if (existing) {
          console.log(`⏭️  Skip: ${url}`);
          skipped++;
          continue;
        }

        // Scrape
        const scraped = await scrapeArticleContent(url);

        if (!scraped.title || !scraped.content) {
          console.log(`❌ No content: ${url}`);
          errors++;
          continue;
        }

        // Insert
        const { error } = await supabase
          .from('news_articles')
          .insert({
            title: scraped.title,
            content: scraped.content,
            source_url: url,
            source_name: extractSourceName(url),
            featured_image_url: scraped.featuredImage,
            published_at: parseCSVDate(row.date).toISOString(),
            author_name: scraped.author,
            slug: `${slugify(scraped.title)}-${Date.now()}`
          });

        if (error) {
          console.error(`❌ Insert error: ${error.message}`);
          errors++;
        } else {
          console.log(`✅ Imported: ${scraped.title.substring(0, 50)}...`);
          imported++;
        }

        // Delay
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Row error:`, error);
        errors++;
      }
    }

    const summary = {
      total: rows.length,
      imported,
      skipped,
      errors
    };

    console.log('📊 Complete:', summary);

    return NextResponse.json(summary);

  } catch (error: any) {
    console.error('❌ Fatal:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
