/**
 * Autores externos: entidades que nos envían noticias y las firman.
 * Validación compartida entre el formulario y la API.
 */

export interface ExternalAuthor {
  id: string;
  name: string;
  email: string | null;
  position: string | null;
  company: string | null;
  linkedin_url: string | null;
  website_url: string | null;
}

export type ExternalAuthorInput = Omit<ExternalAuthor, 'id'>;

export const EMPTY_EXTERNAL_AUTHOR: ExternalAuthorInput = {
  name: '',
  email: null,
  position: null,
  company: null,
  linkedin_url: null,
  website_url: null,
};

const MAX_TEXT = 120;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Result = { ok: true; value: ExternalAuthorInput } | { ok: false; error: string };

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Solo http(s): evita enlaces javascript: u otros esquemas en la firma pública. */
function cleanUrl(value: unknown): string | null | false {
  const text = cleanText(value);
  if (!text) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    return url.toString();
  } catch {
    return false;
  }
}

export function validateExternalAuthor(input: unknown): Result {
  const raw = (input ?? {}) as Record<string, unknown>;

  const name = cleanText(raw.name);
  if (!name || name.length < 2) return { ok: false, error: 'El nombre del autor externo es obligatorio.' };
  if (name.length > MAX_TEXT) return { ok: false, error: 'El nombre es demasiado largo.' };

  const email = cleanText(raw.email);
  if (email && !EMAIL_PATTERN.test(email)) return { ok: false, error: 'El correo del autor externo no es válido.' };

  const position = cleanText(raw.position);
  const company = cleanText(raw.company);
  if ((position?.length ?? 0) > MAX_TEXT || (company?.length ?? 0) > MAX_TEXT) {
    return { ok: false, error: 'El cargo o la empresa son demasiado largos.' };
  }

  const linkedin = cleanUrl(raw.linkedin_url);
  if (linkedin === false) return { ok: false, error: 'El enlace de LinkedIn no es válido.' };
  const website = cleanUrl(raw.website_url);
  if (website === false) return { ok: false, error: 'El enlace de la web no es válido.' };

  return {
    ok: true,
    value: {
      name,
      email: email ? email.toLowerCase() : null,
      position,
      company,
      linkedin_url: linkedin,
      website_url: website,
    },
  };
}

/** «Cargo · Empresa», o lo que haya de los dos. */
export function externalAuthorTagline(author: Pick<ExternalAuthor, 'position' | 'company'>): string | null {
  const parts = [author.position, author.company].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : null;
}
