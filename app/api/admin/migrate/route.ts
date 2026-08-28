import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  try {
    const supabase = createAdminClient();

    // Agregar columna excerpt
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE interviews ADD COLUMN IF NOT EXISTS excerpt TEXT;'
    });

    if (alterError && !alterError.message?.includes('already exists')) {
      throw alterError;
    }

    // Actualizar vista
    const { error: viewError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW interviews_with_metadata AS
        SELECT
          i.id,
          i.title,
          i.slug,
          i.description,
          i.excerpt,
          i.youtube_video_id,
          i.video_provider,
          i.custom_iframe_code,
          i.category_id,
          i.status,
          i.published_at,
          i.views_count,
          i.key_points,
          i.meta_title,
          i.meta_description,
          i.created_at,
          i.updated_at,
          c.name as category_name,
          c.slug as category_slug,
          c.color_hex as category_color
        FROM interviews i
        LEFT JOIN interview_categories c ON i.category_id = c.id;
      `
    });

    if (viewError) {
      throw viewError;
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully'
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
