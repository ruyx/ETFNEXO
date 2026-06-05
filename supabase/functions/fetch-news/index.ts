// ============================================
// ETF Nexo - News Fetcher Edge Function
// ============================================
// Descripción: Obtiene noticias de Google News RSS y otras fuentes
// Ejecutar: curl -X POST https://<project-ref>.supabase.co/functions/v1/fetch-news
// Cron: Configurar en Supabase Dashboard

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
// Lista de palabras clave relacionadas con crypto a EXCLUIR
const CRYPTO_KEYWORDS = [
  'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'criptomoneda', 'criptomonedas',
  'blockchain', 'cripto', 'criptodivisa', 'altcoin', 'defi', 'nft',
  'binance', 'coinbase', 'solana', 'cardano', 'ripple', 'xrp',
  'dogecoin', 'doge', 'shiba', 'token', 'web3', 'metaverse', 'metaverso',
  'stablecoin', 'usdt', 'usdc', 'mining', 'minería', 'wallet', 'monedero digital'
];

// Función para verificar si un artículo contiene keywords de crypto
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
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Multiple hyphens to single
    .substring(0, 100); // Max length
}

function extractExcerpt(html: string, maxLength = 200): string {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, '');
  // Truncate
  return text.length > maxLength
    ? text.substring(0, maxLength) + '...'
    : text;
}

// ============================================
// Parser de RSS a JSON
// ============================================
async function parseRSS(url: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ETFNexo-NewsBot/1.0'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return [];
    }

    const xmlText = await response.text();

    // Simple XML parsing usando regex (suficiente para RSS)
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
    errors: 0
  };

  // Obtener categorías de la base de datos
  const { data: categories } = await supabaseClient
    .from('news_categories')
    .select('id, slug');

  const categoryMap = new Map(categories?.map((c: any) => [c.slug, c.id]) || []);

  // Procesar cada fuente
  for (const source of NEWS_SOURCES) {
    console.log(`Fetching from: ${source.name}`);

    const items = await parseRSS(source.url);
    results.total += items.length;

    for (const item of items) {
      try {
        // FILTRO 1: Excluir artículos con keywords de crypto
        if (containsCryptoKeywords(item.title) || containsCryptoKeywords(item.description)) {
          results.filteredCrypto++;
          console.log(`✗ Filtered (crypto): ${item.title.substring(0, 50)}...`);
          continue;
        }

        // FILTRO 2: Verificar si ya existe (por source_url)
        const { data: existing } = await supabaseClient
          .from('news_articles')
          .select('id')
          .eq('source_url', item.link)
          .single();

        if (existing) {
          results.skipped++;
          continue;
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

        // Preparar artículo
        const article = {
          title: item.title,
          slug: slug,
          excerpt: extractExcerpt(item.description),
          content: item.description, // Placeholder - idealmente scrapeamos el artículo completo
          category_id: categoryMap.get(source.category) || null,
          source_name: source.name,
          source_url: item.link,
          source_published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          status: 'draft', // Review manual antes de publicar
          published_at: null,
          author_name: 'Redacción ETF Nexo'
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
          console.log(`✓ Inserted: ${item.title.substring(0, 50)}...`);
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
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      });
    }

    // Verificar que sea POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear cliente de Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting news fetch...');
    const results = await processNews(supabaseClient);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'News fetch completed',
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
