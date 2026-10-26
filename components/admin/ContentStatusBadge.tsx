/**
 * Badge de estado para las tarjetas del admin (noticias, academia, entrevistas).
 * Los programados muestran cuándo se publicarán.
 */

import { CONTENT_STATUS_LABELS, formatPublicationDate, isContentStatus } from '@/lib/content/publication';

interface ContentStatusBadgeProps {
  status: string;
  publishedAt?: string | null;
}

export default function ContentStatusBadge({ status, publishedAt }: ContentStatusBadgeProps) {
  if (!isContentStatus(status)) return null;

  const label = status === 'scheduled' && publishedAt
    ? `${CONTENT_STATUS_LABELS.scheduled} · ${formatPublicationDate(publishedAt)}`
    : CONTENT_STATUS_LABELS[status];

  return <span className={`status-badge status-badge--${status}`}>{label}</span>;
}
