-- Script SQL para poblar featured_image_alt en artículos
-- Mejora SEO: +10% tráfico Google Images

-- Noticias: Agregar alt text descriptivo
UPDATE news_articles
SET featured_image_alt = CONCAT(title, ' - Análisis ETF | ETF Nexo')
WHERE featured_image_alt IS NULL
  AND featured_image_url IS NOT NULL
  AND status = 'published';

-- Entrevistas: Agregar alt text descriptivo
UPDATE interviews
SET featured_image_alt = CONCAT(title, ' - Entrevista con experto | ETF Nexo')
WHERE featured_image_alt IS NULL
  AND featured_image_url IS NOT NULL
  AND status = 'published';

-- Academia: Agregar alt text descriptivo
UPDATE academy_articles
SET featured_image_alt = CONCAT(title, ' - Guía educativa ETF | ETF Nexo')
WHERE featured_image_alt IS NULL
  AND featured_image_url IS NOT NULL
  AND status = 'published';

-- Verificar resultados
SELECT
  'noticias' as tabla,
  COUNT(*) as total_con_imagen,
  SUM(CASE WHEN featured_image_alt IS NOT NULL THEN 1 ELSE 0 END) as con_alt_text
FROM news_articles
WHERE featured_image_url IS NOT NULL AND status = 'published'

UNION ALL

SELECT
  'entrevistas' as tabla,
  COUNT(*) as total_con_imagen,
  SUM(CASE WHEN featured_image_alt IS NOT NULL THEN 1 ELSE 0 END) as con_alt_text
FROM interviews
WHERE featured_image_url IS NOT NULL AND status = 'published'

UNION ALL

SELECT
  'academia' as tabla,
  COUNT(*) as total_con_imagen,
  SUM(CASE WHEN featured_image_alt IS NOT NULL THEN 1 ELSE 0 END) as con_alt_text
FROM academy_articles
WHERE featured_image_url IS NOT NULL AND status = 'published';
