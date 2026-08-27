/**
 * Script para crear banners de publicidad de prueba
 * Ejecutar: node scripts/create-test-ads.js
 */

const testAds = [
  {
    name: 'Banner Test - Home Superior 728x90',
    placement: 'home_top',
    type: 'image_banner',
    status: 'active',
    priority: 10,
    image_url: 'https://placehold.co/728x90/2563EB/FFFFFF?text=ETF+NEXO+|+Banner+728x90',
    image_alt: 'Banner de prueba 728x90',
    link_url: 'https://etfnexo.com',
    target: '_blank',
    size: '728x90'
  },
  {
    name: 'Banner Test - Home Superior 970x90',
    placement: 'home_top',
    type: 'image_banner',
    status: 'active',
    priority: 9,
    image_url: 'https://placehold.co/970x90/10B981/FFFFFF?text=ETF+NEXO+|+Banner+970x90',
    image_alt: 'Banner de prueba 970x90',
    link_url: 'https://etfnexo.com',
    target: '_blank',
    size: '970x90'
  },
  {
    name: 'Banner Test - Sidebar 300x250',
    placement: 'home_news_sidebar',
    type: 'image_banner',
    status: 'active',
    priority: 10,
    image_url: 'https://placehold.co/300x250/F59E0B/000000?text=ETF+NEXO+Sidebar+300x250',
    image_alt: 'Banner de prueba sidebar 300x250',
    link_url: 'https://etfnexo.com',
    target: '_blank',
    size: '300x250'
  },
  {
    name: 'Banner Test - Sidebar 336x280',
    placement: 'home_news_sidebar',
    type: 'image_banner',
    status: 'active',
    priority: 9,
    image_url: 'https://placehold.co/336x280/EF4444/FFFFFF?text=ETF+NEXO+Sidebar+336x280',
    image_alt: 'Banner de prueba sidebar 336x280',
    link_url: 'https://etfnexo.com',
    target: '_blank',
    size: '336x280'
  }
];

async function createTestAds() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  console.log('🚀 Creando banners de prueba...\n');

  for (const ad of testAds) {
    try {
      const response = await fetch(`${baseUrl}/api/admin/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ad)
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Creado: ${ad.name} (${ad.size})`);
      } else {
        console.error(`❌ Error creando ${ad.name}:`, result.error);
      }
    } catch (error) {
      console.error(`❌ Error creando ${ad.name}:`, error.message);
    }
  }

  console.log('\n✨ Proceso completado!');
}

createTestAds().catch(console.error);
