import { createAdminClient } from '../lib/supabase/admin';
import { checkImageUrl, searchPexelsImage, generateSearchQuery } from '../lib/pexels-client';

/**
 * Script para reemplazar imágenes 404 o faltantes con imágenes de Pexels
 *
 * Uso:
 * PEXELS_API_KEY=tu_api_key npx tsx scripts/fix-article-images.ts
 * PEXELS_API_KEY=tu_api_key npx tsx scripts/fix-article-images.ts --dry-run
 * PEXELS_API_KEY=tu_api_key npx tsx scripts/fix-article-images.ts --limit 10
 */

interface Article {
  id: number;
  slug: string;
  title: string;
  featured_image_url: string | null;
  category_name?: string;
}

interface Stats {
  total: number;
  checked: number;
  broken: number;
  fixed: number;
  failed: number;
  skipped: number;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;

  // Verificar API key
  const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
  if (!PEXELS_API_KEY) {
    console.error('❌ Error: PEXELS_API_KEY no configurado');
    console.log('\nObtén tu API key gratis en: https://www.pexels.com/api/');
    console.log('Luego ejecuta:');
    console.log('  PEXELS_API_KEY=tu_api_key npx tsx scripts/fix-article-images.ts');
    process.exit(1);
  }

  console.log('🖼️  Sistema de reemplazo de imágenes con Pexels\n');
  console.log(`Modo: ${dryRun ? '🔍 DRY RUN (sin cambios)' : '✍️  ACTUALIZACIÓN'}`);
  if (limit) {
    console.log(`Límite: ${limit} artículos`);
  }
  console.log('');

  const supabase = createAdminClient();
  const stats: Stats = {
    total: 0,
    checked: 0,
    broken: 0,
    fixed: 0,
    failed: 0,
    skipped: 0
  };

  // 1. Obtener artículos publicados
  console.log('📥 Obteniendo artículos...');

  let query = supabase
    .from('news_articles_with_metadata')
    .select('id, slug, title, featured_image_url, category_name')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: articles, error } = await query;

  if (error) {
    console.error('❌ Error obteniendo artículos:', error);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('ℹ️  No hay artículos para procesar');
    return;
  }

  stats.total = articles.length;
  console.log(`✅ ${stats.total} artículos obtenidos\n`);

  // 2. Procesar cada artículo
  for (const article of articles as Article[]) {
    stats.checked++;

    console.log(`[${stats.checked}/${stats.total}] ${article.title}`);

    // Verificar si necesita imagen
    let needsImage = false;

    if (!article.featured_image_url) {
      console.log('  ⚠️  Sin imagen');
      needsImage = true;
    } else {
      // Verificar si la imagen existe
      const imageWorks = await checkImageUrl(article.featured_image_url);

      if (!imageWorks) {
        console.log('  ❌ Imagen 404:', article.featured_image_url);
        stats.broken++;
        needsImage = true;
      } else {
        console.log('  ✅ Imagen OK');
        stats.skipped++;
      }
    }

    // Si necesita imagen, buscar en Pexels
    if (needsImage) {
      const searchQuery = generateSearchQuery(article.title, article.category_name);
      console.log(`  🔍 Buscando en Pexels: "${searchQuery}"`);

      const pexelsImage = await searchPexelsImage(searchQuery, PEXELS_API_KEY);

      if (pexelsImage) {
        console.log(`  📸 Encontrada: ${pexelsImage.url}`);
        console.log(`  👤 Fotógrafo: ${pexelsImage.photographer}`);

        if (!dryRun) {
          // Actualizar en base de datos
          const { error: updateError } = await supabase
            .from('news_articles')
            .update({
              featured_image_url: pexelsImage.url
              // Atribución: Photo by ${pexelsImage.photographer} on Pexels
            })
            .eq('id', article.id);

          if (updateError) {
            console.log(`  ❌ Error actualizando: ${updateError.message}`);
            stats.failed++;
          } else {
            console.log('  ✅ Imagen actualizada en BD');
            stats.fixed++;
          }
        } else {
          console.log('  ✅ Imagen encontrada (DRY RUN - no actualizada)');
          stats.fixed++;
        }
      } else {
        console.log('  ⚠️  No se encontró imagen en Pexels');
        stats.failed++;
      }
    }

    console.log('');

    // Rate limiting: Pexels free tier = 200 requests/hora
    // Esperar 20ms entre requests (3 requests/segundo = 180/minuto = 10,800/hora)
    await new Promise(resolve => setTimeout(resolve, 20));
  }

  // 3. Resumen final
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESUMEN FINAL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total artículos:     ${stats.total}`);
  console.log(`Artículos revisados: ${stats.checked}`);
  console.log(`Imágenes rotas:      ${stats.broken}`);
  console.log(`Imágenes OK:         ${stats.skipped}`);
  console.log(`Imágenes reparadas:  ${stats.fixed}`);
  console.log(`Errores:             ${stats.failed}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (dryRun && stats.fixed > 0) {
    console.log('\n💡 Ejecuta sin --dry-run para aplicar los cambios');
  }
}

main().catch(console.error);
