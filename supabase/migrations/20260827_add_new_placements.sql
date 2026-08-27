-- Agregar nuevas ubicaciones de anuncios: home_top y home_news_sidebar
-- Estos son placements específicos para la página principal

-- Eliminar el constraint anterior
ALTER TABLE public.ads
DROP CONSTRAINT IF EXISTS ads_placement_check;

-- Agregar el nuevo constraint con los placements adicionales
ALTER TABLE public.ads
ADD CONSTRAINT ads_placement_check
CHECK (placement IN (
  -- Ubicaciones originales
  'sidebar_top', 'sidebar_bottom',
  'article_top', 'article_mid', 'article_bottom',
  'feed_inline',
  'header', 'footer',
  -- Nuevas ubicaciones para home
  'home_top',
  'home_news_sidebar'
));
