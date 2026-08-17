-- ============================================
-- Actualizar vista news_articles_with_metadata
-- Para incluir el campo FAQ
-- ============================================

-- Primero eliminar la vista existente
DROP VIEW IF EXISTS news_articles_with_metadata;

-- Recrear la vista con el campo FAQ
CREATE VIEW news_articles_with_metadata AS
SELECT
  a.*,
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug
      )
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'::json
  ) as tags,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', e.id,
        'isin', e.isin,
        'name', e.name
      )
    ) FILTER (WHERE e.id IS NOT NULL),
    '[]'::json
  ) as related_etfs
FROM news_articles a
LEFT JOIN news_categories c ON a.category_id = c.id
LEFT JOIN news_article_tags nat ON a.id = nat.article_id
LEFT JOIN news_tags t ON nat.tag_id = t.id
LEFT JOIN news_related_etfs nre ON a.id = nre.article_id
LEFT JOIN etfs e ON nre.etf_id = e.id
GROUP BY a.id, c.id;

-- Comentario
COMMENT ON VIEW news_articles_with_metadata IS 'Vista completa de artículos con categorías, tags, ETFs relacionados y FAQs';
