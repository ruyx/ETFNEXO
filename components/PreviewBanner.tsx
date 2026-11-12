import type { PreviewSection } from '@/lib/content/preview';
import { CONTENT_STATUS_LABELS, isContentStatus } from '@/lib/content/publication';

interface PreviewBannerProps {
  section: PreviewSection;
  slug: string;
  status: string;
}

/** Aviso visible solo en modo borrador: el contenido aún no es público. */
export default function PreviewBanner({ section, slug, status }: PreviewBannerProps) {
  const label = isContentStatus(status) ? CONTENT_STATUS_LABELS[status] : status;
  const exitParams = new URLSearchParams({ exit: '1', section, slug });

  return (
    <div className="preview-banner" role="status">
      <span className="preview-banner__text">
        Vista previa{status !== 'published' && <> · <strong>{label}</strong>: este contenido aún no es público</>}
      </span>
      <a className="preview-banner__exit" href={`/api/preview?${exitParams.toString()}`}>
        Salir de la vista previa
      </a>
    </div>
  );
}
