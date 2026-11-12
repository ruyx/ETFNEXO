/**
 * Enlaces de "Ver" del panel de administración.
 *
 * Las páginas públicas solo muestran contenido publicado. Para revisar un
 * borrador o una publicación programada, el enlace pasa por /api/preview,
 * que comprueba el rol de editor y activa el modo borrador de Next.js.
 *
 * Sin dependencias de servidor: se usa también en componentes de cliente.
 */

import type { ContentStatus } from '@/lib/content/publication';

export const PREVIEW_SECTIONS = ['noticias', 'academia', 'entrevistas'] as const;

export type PreviewSection = (typeof PREVIEW_SECTIONS)[number];

export function isPreviewSection(value: unknown): value is PreviewSection {
  return typeof value === 'string' && (PREVIEW_SECTIONS as readonly string[]).includes(value);
}

/** Ruta pública del contenido. */
export function publicContentPath(section: PreviewSection, slug: string): string {
  return `/${section}/${encodeURIComponent(slug)}`;
}

/** URL del botón "Ver": pública si está publicado, vista previa si no. */
export function contentViewHref(section: PreviewSection, slug: string, status: ContentStatus): string {
  if (status === 'published') return publicContentPath(section, slug);
  const params = new URLSearchParams({ section, slug });
  return `/api/preview?${params.toString()}`;
}
