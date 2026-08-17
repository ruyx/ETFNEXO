-- ============================================
-- Actualizar vista para incluir información del autor (agente de IA)
-- ============================================

DROP VIEW IF EXISTS news_articles_with_metadata;

CREATE VIEW news_articles_with_metadata AS
SELECT
  a.*,
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color,
  -- Información del agente de IA si existe
  ag.display_name as agent_name,
  ag.slug as agent_slug,
  ag.avatar_url as agent_avatar,
  ag.bio as agent_bio,
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
LEFT JOIN ai_agents ag ON a.author_id = ag.id
LEFT JOIN news_article_tags nat ON a.id = nat.article_id
LEFT JOIN news_tags t ON nat.tag_id = t.id
LEFT JOIN news_related_etfs nre ON a.id = nre.article_id
LEFT JOIN etfs e ON nre.etf_id = e.id
GROUP BY a.id, c.id, ag.id;

COMMENT ON VIEW news_articles_with_metadata IS 'Vista de artículos con categoría, tags, ETFs relacionados, y autor (agente de IA)';
