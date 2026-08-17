import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createAdminClient();

    // Recreate the view with agent fields
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        DROP VIEW IF EXISTS news_articles_with_metadata CASCADE;

        CREATE VIEW news_articles_with_metadata AS
        SELECT
          a.*,
          c.name as category_name,
          c.slug as category_slug,
          c.color_hex as category_color,
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
                'ticker', e.ticker,
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
      `
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'View recreated successfully' });
  } catch (error: any) {
    console.error('Error recreating view:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
