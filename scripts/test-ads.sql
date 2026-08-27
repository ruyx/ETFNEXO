-- Script para crear banners de publicidad de prueba
-- Copiar y pegar en Supabase SQL Editor

-- Banner 1: Home Top - Leaderboard 728x90
INSERT INTO public.ads (
  name,
  placement,
  type,
  status,
  priority,
  image_url,
  image_alt,
  link_url,
  target,
  size
) VALUES (
  'Banner Test - Home Superior 728x90',
  'home_top',
  'image_banner',
  'active',
  10,
  'https://placehold.co/728x90/2563EB/FFFFFF?text=ETF+NEXO+|+Banner+728x90',
  'Banner de prueba 728x90',
  'https://etfnexo.com',
  '_blank',
  '728x90'
);

-- Banner 2: Home Top - Large Leaderboard 970x90
INSERT INTO public.ads (
  name,
  placement,
  type,
  status,
  priority,
  image_url,
  image_alt,
  link_url,
  target,
  size
) VALUES (
  'Banner Test - Home Superior 970x90',
  'home_top',
  'image_banner',
  'active',
  9,
  'https://placehold.co/970x90/10B981/FFFFFF?text=ETF+NEXO+|+Banner+970x90',
  'Banner de prueba 970x90',
  'https://etfnexo.com',
  '_blank',
  '970x90'
);

-- Banner 3: Sidebar - Medium Rectangle 300x250
INSERT INTO public.ads (
  name,
  placement,
  type,
  status,
  priority,
  image_url,
  image_alt,
  link_url,
  target,
  size
) VALUES (
  'Banner Test - Sidebar 300x250',
  'home_news_sidebar',
  'image_banner',
  'active',
  10,
  'https://placehold.co/300x250/F59E0B/000000?text=ETF+NEXO+Sidebar+300x250',
  'Banner de prueba sidebar 300x250',
  'https://etfnexo.com',
  '_blank',
  '300x250'
);

-- Banner 4: Sidebar - Large Rectangle 336x280
INSERT INTO public.ads (
  name,
  placement,
  type,
  status,
  priority,
  image_url,
  image_alt,
  link_url,
  target,
  size
) VALUES (
  'Banner Test - Sidebar 336x280',
  'home_news_sidebar',
  'image_banner',
  'active',
  9,
  'https://placehold.co/336x280/EF4444/FFFFFF?text=ETF+NEXO+Sidebar+336x280',
  'Banner de prueba sidebar 336x280',
  'https://etfnexo.com',
  '_blank',
  '336x280'
);

-- Verificar que se crearon correctamente
SELECT id, name, placement, size, status FROM public.ads WHERE name LIKE 'Banner Test%' ORDER BY placement, priority DESC;
