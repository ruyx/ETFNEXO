-- ============================================
-- Ads de Ejemplo para ETF Nexo
-- ============================================
-- Copiar y pegar en Supabase SQL Editor
-- Fecha: 2026-06-15

-- ============================================
-- 1. CREAR ADVERTISERS
-- ============================================

INSERT INTO public.advertisers (name, email, website, status)
VALUES
  ('BlackRock', 'ads@blackrock.com', 'https://www.blackrock.com/es', 'active'),
  ('Vanguard', 'marketing@vanguard.com', 'https://www.vanguard.es', 'active'),
  ('Interactive Brokers', 'ads@interactivebrokers.com', 'https://www.interactivebrokers.com', 'active'),
  ('DeGiro', 'marketing@degiro.es', 'https://www.degiro.es', 'active'),
  ('MSCI', 'info@msci.com', 'https://www.msci.com', 'active')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. CREAR ADS
-- ============================================

-- BlackRock - Image Banner (sidebar_top)
INSERT INTO public.ads (
  advertiser_id,
  name,
  type,
  placement,
  status,
  priority,
  image_url,
  image_alt,
  link_url,
  target
)
SELECT
  a.id,
  'BlackRock iShares - Banner Principal',
  'image_banner',
  'sidebar_top',
  'active',
  10,
  'https://placehold.co/300x250/3B82F6/FFFFFF?text=BlackRock+iShares%0AInvierte+con+confianza',
  'BlackRock iShares - Invierte con confianza',
  'https://www.blackrock.com/es/productos/239726/',
  '_blank'
FROM advertisers a
WHERE a.name = 'BlackRock'
ON CONFLICT DO NOTHING;

-- Vanguard - Text Banner (sidebar_bottom)
INSERT INTO public.ads (
  advertiser_id,
  name,
  type,
  placement,
  status,
  priority,
  title,
  description,
  cta_text,
  link_url,
  target
)
SELECT
  a.id,
  'Vanguard - Comisiones Bajas',
  'text_banner',
  'sidebar_bottom',
  'active',
  9,
  'Vanguard ETFs',
  'Comisiones bajas, rendimientos sólidos. Invierte en fondos indexados con Vanguard.',
  'Descubre más',
  'https://www.vanguard.es',
  '_blank'
FROM advertisers a
WHERE a.name = 'Vanguard'
ON CONFLICT DO NOTHING;

-- Interactive Brokers - Text Banner (article_top)
INSERT INTO public.ads (
  advertiser_id,
  name,
  type,
  placement,
  status,
  priority,
  title,
  description,
  cta_text,
  link_url,
  target
)
SELECT
  a.id,
  'Interactive Brokers - Sin Comisiones',
  'text_banner',
  'article_top',
  'active',
  8,
  'Trading de ETFs sin comisiones',
  'Accede a más de 7,000 ETFs sin comisiones de trading. Abre tu cuenta en minutos.',
  'Abrir cuenta',
  'https://www.interactivebrokers.com',
  '_blank'
FROM advertisers a
WHERE a.name = 'Interactive Brokers'
ON CONFLICT DO NOTHING;

-- DeGiro - Image Banner (article_mid)
INSERT INTO public.ads (
  advertiser_id,
  name,
  type,
  placement,
  status,
  priority,
  image_url,
  image_alt,
  link_url,
  target
)
SELECT
  a.id,
  'DeGiro - Banner Artículo',
  'image_banner',
  'article_mid',
  'active',
  7,
  'https://placehold.co/600x150/10B981/FFFFFF?text=DeGiro+-+Invierte+desde+%E2%82%AC0.50',
  'DeGiro - Comisiones desde €0.50',
  'https://www.degiro.es',
  '_blank'
FROM advertisers a
WHERE a.name = 'DeGiro'
ON CONFLICT DO NOTHING;

-- MSCI - Text Banner (feed_inline)
INSERT INTO public.ads (
  advertiser_id,
  name,
  type,
  placement,
  status,
  priority,
  title,
  description,
  cta_text,
  link_url,
  target
)
SELECT
  a.id,
  'MSCI - Índices Globales',
  'text_banner',
  'feed_inline',
  'active',
  6,
  'MSCI World Index',
  'Sigue el rendimiento de los mercados globales con MSCI. Accede a datos premium.',
  'Ver índices',
  'https://www.msci.com',
  '_blank'
FROM advertisers a
WHERE a.name = 'MSCI'
ON CONFLICT DO NOTHING;

-- BlackRock - Text Banner (article_bottom)
INSERT INTO public.ads (
  advertiser_id,
  name,
  type,
  placement,
  status,
  priority,
  title,
  description,
  cta_text,
  link_url,
  target
)
SELECT
  a.id,
  'BlackRock - ESG Investing',
  'text_banner',
  'article_bottom',
  'active',
  5,
  'Invierte en el futuro sostenible',
  'ETFs ESG de BlackRock. Combina rendimiento con responsabilidad ambiental.',
  'Conoce más',
  'https://www.blackrock.com/es/soluciones/inversion-sostenible',
  '_blank'
FROM advertisers a
WHERE a.name = 'BlackRock'
ON CONFLICT DO NOTHING;

-- Interactive Brokers - Image Banner (sidebar_top) con límites
INSERT INTO public.ads (
  advertiser_id,
  name,
  type,
  placement,
  status,
  priority,
  max_impressions,
  image_url,
  image_alt,
  link_url,
  target
)
SELECT
  a.id,
  'IBKR - Banner Sidebar',
  'image_banner',
  'sidebar_top',
  'active',
  8,
  10000,
  'https://placehold.co/300x250/F59E0B/FFFFFF?text=Interactive+Brokers%0APlataforma+profesional',
  'Interactive Brokers - Plataforma profesional',
  'https://www.interactivebrokers.com/es/trading/platforms.php',
  '_blank'
FROM advertisers a
WHERE a.name = 'Interactive Brokers'
ON CONFLICT DO NOTHING;

-- DeGiro - Text Banner (sidebar_bottom)
INSERT INTO public.ads (
  advertiser_id,
  name,
  type,
  placement,
  status,
  priority,
  title,
  description,
  cta_text,
  link_url,
  target
)
SELECT
  a.id,
  'DeGiro - Cuenta Demo',
  'text_banner',
  'sidebar_bottom',
  'active',
  7,
  'Prueba DeGiro gratis',
  'Cuenta demo con €50,000 virtuales. Sin compromiso.',
  'Probar ahora',
  'https://www.degiro.es/cuenta-demo',
  '_blank'
FROM advertisers a
WHERE a.name = 'DeGiro'
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. VERIFICAR RESULTADOS
-- ============================================

-- Ver todos los advertisers creados
SELECT * FROM public.advertisers;

-- Ver todos los ads creados con nombre del advertiser
SELECT
  a.id,
  a.name as ad_name,
  a.type,
  a.placement,
  a.priority,
  a.status,
  adv.name as advertiser_name
FROM public.ads a
JOIN public.advertisers adv ON a.advertiser_id = adv.id
ORDER BY a.placement, a.priority DESC;

-- ============================================
-- 4. QUERIES ÚTILES PARA TESTING
-- ============================================

-- Ver ads activos por placement
SELECT
  placement,
  COUNT(*) as total_ads,
  array_agg(name ORDER BY priority DESC) as ad_names
FROM public.ads
WHERE status = 'active'
GROUP BY placement;

-- Simular selección de ad (igual que la API)
SELECT
  id,
  name,
  type,
  placement,
  priority,
  image_url,
  title,
  description
FROM public.ads
WHERE
  status = 'active'
  AND placement = 'article_top' -- Cambiar placement según necesites
  AND (start_date IS NULL OR start_date <= CURRENT_DATE)
  AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  AND (max_impressions IS NULL OR
       (SELECT COUNT(*) FROM ad_impressions WHERE ad_id = ads.id) < max_impressions)
  AND (max_clicks IS NULL OR
       (SELECT COUNT(*) FROM ad_clicks WHERE ad_id = ads.id) < max_clicks)
ORDER BY priority DESC, RANDOM()
LIMIT 1;

-- ============================================
-- 5. LIMPIAR (si necesitas empezar de nuevo)
-- ============================================

-- PRECAUCIÓN: Esto eliminará TODOS los ads y advertisers
-- Descomentar solo si estás seguro

/*
DELETE FROM public.ad_clicks;
DELETE FROM public.ad_impressions;
DELETE FROM public.ads;
DELETE FROM public.advertisers;
*/
