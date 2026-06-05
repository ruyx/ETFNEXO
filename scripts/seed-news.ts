#!/usr/bin/env tsx
/**
 * Script para poblar la base de datos con noticias de ejemplo
 * Usa la API de Pexels para obtener imágenes profesionales
 *
 * Uso: npx tsx scripts/seed-news.ts
 */

import { createClient } from '@supabase/supabase-js';
import { getRelevantPhotoForCategory, formatPexelsAttribution } from '../lib/pexels';
import WebSocket from 'ws';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    transport: WebSocket as any
  },
  global: {
    headers: {
      'x-application-name': 'etf-nexo-seed'
    }
  }
});

// Función para generar slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Noticias de ejemplo por categoría
const SAMPLE_NEWS = [
  {
    category: 'etfs',
    title: 'iShares lanza nuevo ETF de IA generativa en Europa',
    excerpt: 'BlackRock expande su oferta de ETFs temáticos con un fondo centrado en empresas líderes en inteligencia artificial generativa.',
    content: `BlackRock ha anunciado el lanzamiento de iShares AI Generative UCITS ETF, un nuevo fondo que busca capitalizar el crecimiento explosivo del sector de IA generativa.

El ETF incluirá empresas como NVIDIA, Microsoft, Alphabet y otras compañías posicionadas para beneficiarse del boom de la IA. Con un TER competitivo del 0.40%, el fondo replica un índice ponderado por capitalización bursátil.

"La IA generativa está transformando todas las industrias", comentó Rachel Lord, responsable de iShares para EMEA. "Este ETF permite a los inversores acceder de forma diversificada a esta megatendencia."

El fondo cotizará en las principales bolsas europeas incluyendo Xetra, Euronext y la Bolsa de Londres.`,
  },
  {
    category: 'gestoras',
    title: 'Vanguard supera los $8 billones en activos bajo gestión',
    excerpt: 'La gestora estadounidense alcanza un hito histórico impulsada por flujos récord hacia fondos indexados.',
    content: `Vanguard Group ha reportado activos bajo gestión superiores a $8 billones de dólares, consolidándose como una de las gestoras más grandes del mundo.

El crecimiento ha sido impulsado principalmente por ETFs de bajo coste, con su familia de fondos indexados S&P 500 y Total Stock Market liderando las entradas de capital.

Los inversores continúan favoreciendo productos pasivos debido a sus comisiones ultrabajas y rendimientos consistentes que igualan al mercado. Vanguard mantiene su posición como líder en productos de bajo TER, con varios ETFs por debajo del 0.10% anual.`,
  },
  {
    category: 'mercados',
    title: 'Los ETFs de renta fija europea captan €12.000M en el primer trimestre',
    excerpt: 'Inversores buscan refugio en bonos ante volatilidad de mercados de renta variable.',
    content: `Los ETFs de renta fija europea han experimentado entradas netas de €12.000 millones durante el primer trimestre, marcando el mejor inicio de año desde 2020.

El aumento del interés se debe a:
- Normalización de tipos de interés del BCE
- Mayor volatilidad en renta variable
- Yields atractivos en deuda corporativa investment grade

Los ETFs de bonos gubernamentales alemanes y franceses han sido los más populares, seguidos por fondos de deuda corporativa europea de alta calidad. Los ETFs de bonos verdes también han mostrado flujos positivos, reflejando el creciente interés en inversión sostenible.`,
  },
  {
    category: 'regulacion',
    title: 'ESMA propone nuevas reglas de transparencia para ETFs ESG',
    excerpt: 'El regulador europeo busca combatir el greenwashing con requisitos más estrictos de divulgación.',
    content: `La Autoridad Europea de Valores y Mercados (ESMA) ha publicado nuevas directrices para mejorar la transparencia de los ETFs que se comercializan como ESG (Environmental, Social, Governance).

Las medidas incluyen:
- Divulgación obligatoria de metodologías de screening ESG
- Reportes trimestrales de holdings y métricas de sostenibilidad
- Prohibición de términos como "verde" o "sostenible" sin evidencia cuantificable
- Auditorías independientes anuales

Los gestores tendrán 12 meses para adaptarse a las nuevas regulaciones. Se espera que estas medidas reduzcan significativamente el greenwashing en la industria.`,
  },
  {
    category: 'educacion',
    title: 'Guía completa: Cómo elegir tu primer ETF',
    excerpt: 'Los 5 factores clave que todo inversor principiante debe considerar antes de invertir en ETFs.',
    content: `Invertir en ETFs puede parecer intimidante al principio. Esta guía te ayudará a tomar decisiones informadas.

**1. Define tu objetivo de inversión**
¿Buscas crecimiento a largo plazo, ingresos por dividendos o preservación de capital?

**2. Evalúa el TER (Total Expense Ratio)**
Comisiones anuales entre 0.05% y 0.75% pueden marcar gran diferencia a largo plazo.

**3. Verifica la liquidez**
Busca ETFs con AUM superior a €100M y volumen diario significativo.

**4. Revisa el tracking error**
Un buen ETF replica su índice con desviación mínima (< 0.5% anual).

**5. Considera la fiscalidad**
ETFs de acumulación vs distribución tienen implicaciones fiscales diferentes en España.

Recuerda: La diversificación es clave. Un ETF global (MSCI World o FTSE All-World) puede ser un excelente punto de partida.`,
  },
  {
    category: 'opinion',
    title: 'Por qué los ETFs temáticos pueden ser una trampa para inversores',
    excerpt: 'Análisis crítico de la moda de los ETFs especializados y sus riesgos ocultos.',
    content: `Los ETFs temáticos (IA, blockchain, metaverso, etc.) están en auge, pero ¿son realmente buenas inversiones?

**Problemas principales:**

1. **Alto TER**: Muchos cobran 0.60%-0.85% vs 0.10%-0.20% de ETFs tradicionales
2. **Concentración extrema**: 10-15 holdings crean riesgo no diversificable
3. **Timing de mercado**: Suelen lanzarse en picos de hype
4. **Tracking error elevado**: Metodologías opacas generan desviaciones

**Datos históricos:**
ETFs de cannabis lanzados en 2019: -70% desde máximos
ETFs de blockchain 2021: -65% desde máximos
ETFs de impresión 3D 2014: -80% desde máximos

**Alternativa:**
Un ETF amplio del S&P 500 o MSCI World ya te da exposición a todas las tendencias importantes sin apostar todo a una carta.

La diversificación aburrida suele ganar a largo plazo.`,
  },
];

async function seedNews() {
  console.log('🌱 Iniciando seed de noticias con imágenes de Pexels...\n');

  // 1. Obtener categorías
  const { data: categories, error: catError } = await supabase
    .from('news_categories')
    .select('*');

  if (catError) {
    console.error('❌ Error al obtener categorías:', catError);
    return;
  }

  const categoryMap = new Map(categories?.map(cat => [cat.slug, cat.id]) || []);

  // 2. Crear noticias con imágenes
  for (const news of SAMPLE_NEWS) {
    const categoryId = categoryMap.get(news.category);
    if (!categoryId) {
      console.warn(`⚠️  Categoría '${news.category}' no encontrada, saltando...`);
      continue;
    }

    try {
      console.log(`📰 Creando: "${news.title}"`);

      // Obtener imagen relevante de Pexels
      console.log(`   🖼️  Buscando imagen en Pexels...`);
      const photo = await getRelevantPhotoForCategory(news.category);

      const slug = generateSlug(news.title);

      const { data, error } = await supabase
        .from('news_articles')
        .insert({
          title: news.title,
          slug,
          excerpt: news.excerpt,
          content: news.content,
          category_id: categoryId,
          status: 'published',
          published_at: new Date().toISOString(),
          featured_image_url: photo?.src.large || null,
          featured_image_alt: photo ? formatPexelsAttribution(photo) : null,
          source_name: 'Manual',
          author_name: 'Redacción ETF Nexo',
        })
        .select();

      if (error) {
        console.error(`   ❌ Error:`, error.message);
      } else {
        console.log(`   ✅ Creada exitosamente`);
        if (photo) {
          console.log(`   📸 Imagen: ${photo.photographer} (${photo.src.medium})`);
        }
      }
    } catch (err: any) {
      console.error(`   ❌ Error inesperado:`, err.message);
    }

    // Pequeña pausa para no saturar la API de Pexels
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ Seed completado!');
  console.log('👉 Visita http://localhost:3000 para ver las noticias');
}

// Ejecutar
seedNews()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
