-- ============================================
-- Actualizar valores permitidos de placement
-- ============================================
-- Problema: Las ubicaciones en el formulario no coinciden con las usadas en el sitio
-- Solución: Actualizar constraint CHECK para incluir todas las ubicaciones reales

-- 1. Eliminar constraint antiguo
ALTER TABLE ads DROP CONSTRAINT IF EXISTS ads_placement_check;

-- 2. Crear nuevo constraint con valores correctos
ALTER TABLE ads ADD CONSTRAINT ads_placement_check CHECK (placement IN (
  -- Home
  'home_top',
  'home_news_sidebar',
  'home_after_ranking',

  -- Artículos
  'article_top',
  'article_mid',
  'article_bottom',

  -- Sidebar
  'sidebar_top',
  'sidebar_mid',
  'sidebar_bottom',

  -- Global
  'header',
  'footer',
  'feed_inline'
));

-- Verificar constraint
SELECT
  'Constraint actualizado correctamente' as mensaje,
  conname as nombre_constraint,
  pg_get_constraintdef(oid) as definicion
FROM pg_constraint
WHERE conname = 'ads_placement_check';

-- Mostrar ubicaciones únicas actuales en la tabla
SELECT
  'Ubicaciones en uso:' as info,
  placement,
  COUNT(*) as total_ads
FROM ads
GROUP BY placement
ORDER BY total_ads DESC;
