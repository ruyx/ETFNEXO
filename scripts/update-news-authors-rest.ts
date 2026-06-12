// ============================================
// Script para actualizar autores de noticias existentes (REST API)
// ============================================
// Descripción: Lee el Google Sheet y actualiza los autores
//              de las noticias que ya están en la BD usando REST API
// Uso: npx tsx scripts/update-news-authors-rest.ts
// ============================================

import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
try {
  const envPath = join(process.cwd(), '.env.local');
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
  console.log('✅ Environment variables loaded from .env.local\n');
} catch (error) {
  console.warn('⚠️  Could not load .env.local, using environment variables\n');
}

const GSHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vStrEBHOhxe_R-p_bbPXzglHsBWHDnCbScB30VGumBKYg2hhFN5cG6OYlQ5PjlZHPXRlGoL1Grl4CTq/pub?output=csv';

interface SheetRow {
  url: string;
  author: string;
}

async function fetchGoogleSheet(): Promise<SheetRow[]> {
  console.log('📥 Fetching Google Sheet...');

  const response = await fetch(GSHEET_CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status}`);
  }

  const csvText = await response.text();
  const lines = csvText.trim().split('\n');
  const rows: SheetRow[] = [];

  // Skip header (line 0)
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(',');

    if (columns.length >= 4 && columns[2] && columns[3]) {
      const url = columns[2].trim();
      const author = columns[3].trim();

      if (url && author) {
        rows.push({ url, author });
      }
    }
  }

  console.log(`📊 Found ${rows.length} rows with authors in sheet\n`);
  return rows;
}

async function updateNewsAuthors() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    // Fetch sheet data
    const sheetRows = await fetchGoogleSheet();

    let updated = 0;
    let notFound = 0;
    let errors = 0;

    console.log('🔄 Updating authors...\n');

    for (const row of sheetRows) {
      try {
        // Find the article by URL using REST API
        const findUrl = `${supabaseUrl}/rest/v1/news_articles?source_url=eq.${encodeURIComponent(row.url)}&select=id,title,author_name`;
        const findResponse = await fetch(findUrl, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!findResponse.ok) {
          console.error(`❌ Error fetching article: ${findResponse.status}`);
          errors++;
          continue;
        }

        const articles = await findResponse.json();

        if (!articles || articles.length === 0) {
          console.log(`⏭️  Not found: ${row.url.substring(0, 60)}...`);
          notFound++;
          continue;
        }

        const article = articles[0];

        // Update author using REST API
        const updateUrl = `${supabaseUrl}/rest/v1/news_articles?id=eq.${article.id}`;
        const updateResponse = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ author_name: row.author })
        });

        if (!updateResponse.ok) {
          console.error(`❌ Error updating ${article.title}: ${updateResponse.status}`);
          errors++;
        } else {
          console.log(`✅ Updated: "${article.title.substring(0, 50)}..." → ${row.author}`);
          updated++;
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error processing ${row.url}:`, error);
        errors++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Updated: ${updated}`);
    console.log(`   Not found: ${notFound}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total rows: ${sheetRows.length}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
updateNewsAuthors();
