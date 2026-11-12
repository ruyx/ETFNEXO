import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { denyUnlessRole } from '@/lib/auth/check-admin';
import { isPreviewSection, publicContentPath } from '@/lib/content/preview';

export const dynamic = 'force-dynamic';

// El slug va codificado en una ruta fija; solo se descartan valores absurdos
const SLUG_PATTERN = /^[^/\\?#\s]{1,300}$/;

/**
 * GET /api/preview?section=noticias&slug=mi-articulo
 *   Activa el modo borrador (solo editores) y abre el contenido aunque no
 *   esté publicado.
 * GET /api/preview?exit=1&section=noticias&slug=mi-articulo
 *   Desactiva el modo borrador y vuelve a la página pública.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const section = searchParams.get('section');
  const slug = searchParams.get('slug') ?? '';

  // Solo se redirige a rutas internas conocidas (evita redirecciones abiertas)
  if (!isPreviewSection(section) || !SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ error: 'Parámetros de vista previa no válidos' }, { status: 400 });
  }

  const target = new URL(publicContentPath(section, slug), request.url);

  if (searchParams.get('exit') === '1') {
    draftMode().disable();
    return NextResponse.redirect(target);
  }

  const denied = await denyUnlessRole(['admin', 'redactor']);
  if (denied) return denied;

  draftMode().enable();
  return NextResponse.redirect(target);
}
