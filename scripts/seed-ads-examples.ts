// ============================================
// Script para generar ads de ejemplo
// ============================================
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Cargar variables de entorno
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  },
  realtime: {
    transport: undefined as any
  },
  global: {
    fetch
  }
});

// ============================================
// Datos de Ejemplo - Advertisers
// ============================================
const advertisers = [
  {
    name: 'BlackRock',
    email: 'ads@blackrock.com',
    website: 'https://www.blackrock.com/es',
    status: 'active'
  },
  {
    name: 'Vanguard',
    email: 'marketing@vanguard.com',
    website: 'https://www.vanguard.es',
    status: 'active'
  },
  {
    name: 'Interactive Brokers',
    email: 'ads@interactivebrokers.com',
    website: 'https://www.interactivebrokers.com',
    status: 'active'
  },
  {
    name: 'DeGiro',
    email: 'marketing@degiro.es',
    website: 'https://www.degiro.es',
    status: 'active'
  },
  {
    name: 'MSCI',
    email: 'info@msci.com',
    website: 'https://www.msci.com',
    status: 'active'
  }
];

// ============================================
// Función principal
// ============================================
async function seedAds() {
  console.log('🌱 Iniciando seeding de ads de ejemplo...\n');

  try {
    // 1. Insertar Advertisers
    console.log('📊 Insertando advertisers...');
    const { data: insertedAdvertisers, error: advertiserError } = await supabase
      .from('advertisers')
      .insert(advertisers)
      .select();

    if (advertiserError) {
      console.error('❌ Error insertando advertisers:', advertiserError);
      process.exit(1);
    }

    console.log(`✅ ${insertedAdvertisers?.length} advertisers insertados\n`);

    // 2. Crear ads para cada advertiser
    console.log('📝 Creando ads...');

    const ads = [];

    // BlackRock - Image Banner (sidebar_top)
    ads.push({
      advertiser_id: insertedAdvertisers![0].id,
      name: 'BlackRock iShares - Banner Principal',
      type: 'image_banner',
      image_url: 'https://placehold.co/300x250/3B82F6/FFFFFF?text=BlackRock+iShares%0AInvierte+con+confianza',
      image_alt: 'BlackRock iShares - Invierte con confianza',
      link_url: 'https://www.blackrock.com/es/productos/239726/',
      target: '_blank',
      placement: 'sidebar_top',
      priority: 10,
      status: 'active'
    });

    // Vanguard - Text Banner (sidebar_bottom)
    ads.push({
      advertiser_id: insertedAdvertisers![1].id,
      name: 'Vanguard - Comisiones Bajas',
      type: 'text_banner',
      title: 'Vanguard ETFs',
      description: 'Comisiones bajas, rendimientos sólidos. Invierte en fondos indexados con Vanguard.',
      cta_text: 'Descubre más',
      link_url: 'https://www.vanguard.es',
      target: '_blank',
      placement: 'sidebar_bottom',
      priority: 9,
      status: 'active'
    });

    // Interactive Brokers - Text Banner (article_top)
    ads.push({
      advertiser_id: insertedAdvertisers![2].id,
      name: 'Interactive Brokers - Sin Comisiones',
      type: 'text_banner',
      title: 'Trading de ETFs sin comisiones',
      description: 'Accede a más de 7,000 ETFs sin comisiones de trading. Abre tu cuenta en minutos.',
      cta_text: 'Abrir cuenta',
      link_url: 'https://www.interactivebrokers.com',
      target: '_blank',
      placement: 'article_top',
      priority: 8,
      status: 'active'
    });

    // DeGiro - Image Banner (article_mid)
    ads.push({
      advertiser_id: insertedAdvertisers![3].id,
      name: 'DeGiro - Banner Artículo',
      type: 'image_banner',
      image_url: 'https://placehold.co/600x150/10B981/FFFFFF?text=DeGiro+-+Invierte+desde+%E2%82%AC0.50',
      image_alt: 'DeGiro - Comisiones desde €0.50',
      link_url: 'https://www.degiro.es',
      target: '_blank',
      placement: 'article_mid',
      priority: 7,
      status: 'active'
    });

    // MSCI - Text Banner (feed_inline)
    ads.push({
      advertiser_id: insertedAdvertisers![4].id,
      name: 'MSCI - Índices Globales',
      type: 'text_banner',
      title: 'MSCI World Index',
      description: 'Sigue el rendimiento de los mercados globales con MSCI. Accede a datos premium.',
      cta_text: 'Ver índices',
      link_url: 'https://www.msci.com',
      target: '_blank',
      placement: 'feed_inline',
      priority: 6,
      status: 'active'
    });

    // BlackRock - Text Banner (article_bottom)
    ads.push({
      advertiser_id: insertedAdvertisers![0].id,
      name: 'BlackRock - ESG Investing',
      type: 'text_banner',
      title: 'Invierte en el futuro sostenible',
      description: 'ETFs ESG de BlackRock. Combina rendimiento con responsabilidad ambiental.',
      cta_text: 'Conoce más',
      link_url: 'https://www.blackrock.com/es/soluciones/inversion-sostenible',
      target: '_blank',
      placement: 'article_bottom',
      priority: 5,
      status: 'active'
    });

    // Interactive Brokers - Image Banner (sidebar_top)
    ads.push({
      advertiser_id: insertedAdvertisers![2].id,
      name: 'IBKR - Banner Sidebar',
      type: 'image_banner',
      image_url: 'https://placehold.co/300x250/F59E0B/FFFFFF?text=Interactive+Brokers%0APlataforma+profesional',
      image_alt: 'Interactive Brokers - Plataforma profesional',
      link_url: 'https://www.interactivebrokers.com/es/trading/platforms.php',
      target: '_blank',
      placement: 'sidebar_top',
      priority: 8,
      max_impressions: 10000,
      status: 'active'
    });

    // DeGiro - Text Banner (sidebar_bottom)
    ads.push({
      advertiser_id: insertedAdvertisers![3].id,
      name: 'DeGiro - Cuenta Demo',
      type: 'text_banner',
      title: 'Prueba DeGiro gratis',
      description: 'Cuenta demo con €50,000 virtuales. Sin compromiso.',
      cta_text: 'Probar ahora',
      link_url: 'https://www.degiro.es/cuenta-demo',
      target: '_blank',
      placement: 'sidebar_bottom',
      priority: 7,
      status: 'active'
    });

    const { data: insertedAds, error: adsError } = await supabase
      .from('ads')
      .insert(ads)
      .select();

    if (adsError) {
      console.error('❌ Error insertando ads:', adsError);
      process.exit(1);
    }

    console.log(`✅ ${insertedAds?.length} ads insertados\n`);

    // Resumen
    console.log('✅ Seeding completado exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - Advertisers: ${insertedAdvertisers?.length}`);
    console.log(`   - Ads: ${insertedAds?.length}\n`);

    console.log('🔗 Prueba los ads en:');
    console.log('   - GET /api/ads/active?placement=sidebar_top');
    console.log('   - GET /api/ads/active?placement=article_top');
    console.log('   - GET /api/admin/ads\n');

  } catch (error: any) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

// Ejecutar
seedAds();
