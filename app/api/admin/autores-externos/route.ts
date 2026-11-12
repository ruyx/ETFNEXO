/**
 * API Admin - Autores externos de noticias
 * GET:  lista de autores externos
 * POST: crea un autor externo
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { denyUnlessRole } from '@/lib/auth/check-admin';
import { validateExternalAuthor } from '@/lib/content/external-author';

const COLUMNS = 'id, name, email, position, company, linkedin_url, website_url';

export async function GET() {
  const denied = await denyUnlessRole(['admin', 'redactor']);
  if (denied) return denied;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('external_authors' as any)
    .select(COLUMNS)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error listing external authors:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los autores externos' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: { authors: data ?? [] } });
}

export async function POST(request: NextRequest) {
  const denied = await denyUnlessRole(['admin', 'redactor']);
  if (denied) return denied;

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
    .insert(result.value as any)
    .select(COLUMNS)
    .single();

  if (error || !data) {
    console.error('Error creating external author:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo guardar el autor externo' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: { author: data } }, { status: 201 });
}
