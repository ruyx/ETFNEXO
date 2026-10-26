-- ============================================
-- Auditoría del sistema de anuncios (26 oct 2026)
-- ============================================
-- 1. Columnas de viewability: la migración 20260928104101 no llegó a
--    producción y TODAS las impresiones fallaban con 500
--    ("Could not find the 'viewability_ratio' column").
-- 2. Nueva ubicación section_top (banda bajo el hero de las secciones).
-- 3. Las impresiones y clics solo se registran vía API (service role):
--    se retira el INSERT anónimo directo, que permitía inflar métricas
--    con la clave pública saltándose los filtros de la API.
-- Idempotente: se puede ejecutar varias veces.

-- 1. Viewability
ALTER TABLE ad_impressions
  ADD COLUMN IF NOT EXISTS viewable BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS viewability_ratio DECIMAL(3, 2) DEFAULT 0.00;

CREATE INDEX IF NOT EXISTS idx_ad_impressions_viewable
  ON ad_impressions(ad_id, viewable, created_at DESC);

-- 2. Ubicaciones (debe coincidir con lib/ads/placements.ts)
ALTER TABLE ads DROP CONSTRAINT IF EXISTS ads_placement_check;
ALTER TABLE ads ADD CONSTRAINT ads_placement_check CHECK (placement IN (
  'home_top', 'home_news_sidebar', 'home_after_ranking',
  'section_top',
  'article_top', 'article_mid', 'article_bottom',
  'sidebar_top', 'sidebar_mid', 'sidebar_bottom',
  'header', 'footer', 'feed_inline'
));

-- 3. Sin escritura anónima directa en las tablas de tracking
DROP POLICY IF EXISTS "Cualquiera puede registrar impresiones" ON ad_impressions;
DROP POLICY IF EXISTS "Cualquiera puede registrar clics" ON ad_clicks;

-- Deduplicación de clics por IP (consulta de /api/ads/click)
CREATE INDEX IF NOT EXISTS idx_ad_clicks_dedupe
  ON ad_clicks(ad_id, ip_address, created_at DESC);

-- Que PostgREST vea las columnas nuevas sin esperar
NOTIFY pgrst, 'reload schema';
