/**
 * API Admin - Autor externo
 * PUT: actualiza los datos del autor (se reflejan en todas sus noticias)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { denyUnlessRole } from '@/lib/auth/check-admin';
import { validateExternalAuthor } from '@/lib/content/external-author';

const COLUMNS = 'id, name, email, position, company, linkedin_url, website_url';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = await denyUnlessRole(['admin', 'redactor']);
  if (denied) return denied;

  if (!UUID_PATTERN.test(params.id)) {
    return NextResponse.json({ success: false, error: 'Autor no válido' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Petición no válida' }, { status: 400 });
  }

  const result = validateExternalAuthor(body);
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('external_authors' as any)
    .update(result.value as any)
    .eq('id' as any, params.id as any)
    .select(COLUMNS)
    .single();

  if (error || !data) {
    console.error('Error updating external author:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo actualizar el autor externo' },
      { status: error?.code === 'PGRST116' ? 404 : 500 }
    );
  }

  // La firma denormalizada de sus noticias sigue al nombre y al correo
  const { error: syncError } = await supabase
    .from('news_articles')
    .update({ author_name: (data as any).name, author_email: (data as any).email } as any)
    .eq('external_author_id' as any, params.id as any);

  if (syncError) {
    console.error('Error syncing external author byline:', syncError);
  }

  return NextResponse.json({ success: true, data: { author: data } });
}
