/**
 * Estados de publicación de noticias, academia y entrevistas.
 *
 * 'scheduled' guarda en published_at la fecha futura de publicación; el cron
 * publish_scheduled_content() (pg_cron, cada minuto) lo pasa a 'published'
 * cuando llega la hora. Las páginas públicas solo leen status = 'published',
 * así que un contenido programado no es visible antes de tiempo.
 */

export const CONTENT_STATUSES = ['draft', 'scheduled', 'published', 'archived'] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'Borrador',
  scheduled: 'Programado',
  published: 'Publicado',
  archived: 'Archivado',
};

// Margen mínimo para programar: el cron corre cada minuto
const MIN_SCHEDULE_LEAD_MS = 60 * 1000;

export function isContentStatus(value: unknown): value is ContentStatus {
  return typeof value === 'string' && (CONTENT_STATUSES as readonly string[]).includes(value);
}

type PublicationResult =
  | { ok: true; status: ContentStatus; published_at: string | null }
  | { ok: false; error: string };

/**
 * Calcula status + published_at a guardar.
 * - published: conserva la fecha original si ya estaba publicado (editar no
 *   lo vuelve a fechar), si no, ahora.
 * - scheduled: exige scheduled_at válido y al menos 1 minuto en el futuro,
 *   salvo que se edite un programado manteniendo su fecha.
 * - draft / archived: sin fecha de publicación.
 */
export function resolvePublication(
  input: { status: unknown; scheduled_at?: unknown },
  current?: { status?: string | null; published_at?: string | null } | null,
  now: Date = new Date()
): PublicationResult {
  const { status } = input;
  if (!isContentStatus(status)) {
    return { ok: false, error: 'Estado de publicación no válido' };
  }

  if (status === 'published') {
    const keepDate = current?.status === 'published' && current.published_at;
    return { ok: true, status, published_at: keepDate ? current.published_at! : now.toISOString() };
  }

  if (status === 'scheduled') {
    const date = typeof input.scheduled_at === 'string' ? new Date(input.scheduled_at) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return { ok: false, error: 'Indica la fecha y hora de publicación' };
    }
    // Editar un programado sin tocar su fecha siempre se permite, aunque ya
    // esté a punto de salir (el cron lo publicará en su próxima pasada)
    const keepsSameDate = current?.status === 'scheduled'
      && !!current.published_at
      && new Date(current.published_at).getTime() === date.getTime();
    if (!keepsSameDate && date.getTime() - now.getTime() < MIN_SCHEDULE_LEAD_MS) {
      return { ok: false, error: 'La fecha programada debe ser al menos 1 minuto en el futuro' };
    }
    return { ok: true, status, published_at: date.toISOString() };
  }

  return { ok: true, status, published_at: null };
}

/** ISO → valor de <input type="datetime-local"> en la hora local del navegador */
export function toLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Valor de <input type="datetime-local"> (hora local) → ISO UTC */
export function fromLocalInputValue(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function formatPublicationDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}
