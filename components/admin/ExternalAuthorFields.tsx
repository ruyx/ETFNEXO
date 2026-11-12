'use client';

import {
  EMPTY_EXTERNAL_AUTHOR,
  type ExternalAuthor,
  type ExternalAuthorInput,
  validateExternalAuthor,
} from '@/lib/content/external-author';

export const NEW_EXTERNAL_AUTHOR = 'new';

interface ExternalAuthorFieldsProps {
  authors: ExternalAuthor[];
  loading: boolean;
  /** '' (sin elegir), NEW_EXTERNAL_AUTHOR o el id de un autor guardado */
  selectedId: string;
  draft: ExternalAuthorInput;
  onSelect: (id: string, draft: ExternalAuthorInput) => void;
  onDraftChange: (draft: ExternalAuthorInput) => void;
}

type TextField = keyof ExternalAuthorInput;

const FIELDS: { key: TextField; label: string; type: string; placeholder: string; required?: boolean }[] = [
  { key: 'name', label: 'Nombre', type: 'text', placeholder: 'Nombre y apellidos', required: true },
  { key: 'email', label: 'Correo', type: 'email', placeholder: 'nombre@empresa.com' },
  { key: 'position', label: 'Cargo', type: 'text', placeholder: 'Director de inversiones' },
  { key: 'company', label: 'Empresa', type: 'text', placeholder: 'Entidad que envía la noticia' },
  { key: 'linkedin_url', label: 'LinkedIn', type: 'text', placeholder: 'https://www.linkedin.com/in/...' },
  { key: 'website_url', label: 'Web', type: 'text', placeholder: 'https://...' },
];

export function toExternalAuthorInput(author: ExternalAuthor): ExternalAuthorInput {
  const { id: _id, ...input } = author;
  return input;
}

async function readApiError(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    return body?.error || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Deja el autor externo guardado antes de guardar la noticia: lo crea si es
 * nuevo, lo actualiza si se han cambiado sus datos o lo devuelve tal cual.
 * Lanza un Error con un mensaje listo para mostrar.
 */
export async function saveExternalAuthor(
  selectedId: string,
  draft: ExternalAuthorInput,
  authors: ExternalAuthor[]
): Promise<ExternalAuthor> {
  const result = validateExternalAuthor(draft);
  if (!result.ok) throw new Error(result.error);

  const existing = authors.find((author) => author.id === selectedId);
  if (existing) {
    const stored = validateExternalAuthor(toExternalAuthorInput(existing));
    const unchanged = stored.ok && JSON.stringify(stored.value) === JSON.stringify(result.value);
    if (unchanged) return existing;
  } else if (selectedId !== NEW_EXTERNAL_AUTHOR) {
    throw new Error('Selecciona un autor externo.');
  }

  const response = await fetch(
    existing ? `/api/admin/autores-externos/${existing.id}` : '/api/admin/autores-externos',
    {
      method: existing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.value),
    }
  );

  if (!response.ok) {
    throw new Error(await readApiError(response, 'No se pudo guardar el autor externo'));
  }

  const body = await response.json();
  return body.data.author as ExternalAuthor;
}

/** Selector de autor externo guardado o alta de uno nuevo. */
export default function ExternalAuthorFields({
  authors,
  loading,
  selectedId,
  draft,
  onSelect,
  onDraftChange,
}: ExternalAuthorFieldsProps) {
  const handleSelect = (id: string) => {
    const existing = authors.find((author) => author.id === id);
    onSelect(id, existing ? toExternalAuthorInput(existing) : { ...EMPTY_EXTERNAL_AUTHOR });
  };

  const updateField = (key: TextField, value: string) => {
    onDraftChange({ ...draft, [key]: value });
  };

  return (
    <>
      <div className="admin-form-group">
        <label htmlFor="external_author_selector" className="admin-form-label admin-form-label--required">
          Autor externo
        </label>
        {loading ? (
          <div className="admin-form-help">Cargando autores externos...</div>
        ) : (
          <select
            id="external_author_selector"
            value={selectedId}
            onChange={(e) => handleSelect(e.target.value)}
            className="admin-form-select"
            required
          >
            <option value="">Selecciona un autor externo</option>
            <option value={NEW_EXTERNAL_AUTHOR}>+ Nuevo autor externo</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.company ? `${author.name} (${author.company})` : author.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedId !== '' && (
        <>
          {FIELDS.map((field) => (
            <div className="admin-form-group" key={field.key}>
              <label
                htmlFor={`external_author_${field.key}`}
                className={`admin-form-label${field.required ? ' admin-form-label--required' : ''}`}
              >
                {field.label}
              </label>
              <input
                id={`external_author_${field.key}`}
                type={field.type}
                inputMode={field.key.endsWith('_url') ? 'url' : field.type === 'email' ? 'email' : undefined}
                value={draft[field.key] ?? ''}
                onChange={(e) => updateField(field.key, e.target.value)}
                className="admin-form-input"
                placeholder={field.placeholder}
                required={field.required}
              />
            </div>
          ))}
          <p className="admin-form-help">
            El correo es solo de contacto interno y no se muestra en la web.
            {selectedId !== NEW_EXTERNAL_AUTHOR && ' Los cambios se aplican a todas las noticias de este autor.'}
          </p>
        </>
      )}
    </>
  );
}
