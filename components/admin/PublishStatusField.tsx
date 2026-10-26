'use client';

/**
 * Selector de estado de publicación compartido por los formularios de
 * noticias, academia y entrevistas. Con "Programado" muestra la fecha/hora
 * (hora local del navegador) en la que el contenido se publicará solo.
 */

import { CONTENT_STATUSES, CONTENT_STATUS_LABELS, type ContentStatus } from '@/lib/content/publication';

interface PublishStatusFieldProps {
  status: ContentStatus;
  onStatusChange: (status: ContentStatus) => void;
  scheduledAt: string; // valor de datetime-local
  onScheduledAtChange: (value: string) => void;
}

export default function PublishStatusField({
  status,
  onStatusChange,
  scheduledAt,
  onScheduledAtChange,
}: PublishStatusFieldProps) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <>
      <div className="admin-form-group">
        <label htmlFor="status" className="admin-form-label">
          Estado
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as ContentStatus)}
          className="admin-form-select"
        >
          {CONTENT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {CONTENT_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {status === 'scheduled' && (
        <div className="admin-form-group">
          <label htmlFor="scheduled_at" className="admin-form-label admin-form-label--required">
            Publicar el
          </label>
          <input
            id="scheduled_at"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => onScheduledAtChange(e.target.value)}
            className="admin-form-input"
            required
          />
          <p className="admin-form-hint">
            Se publicará automáticamente a esa hora ({timeZone}).
          </p>
        </div>
      )}
    </>
  );
}
