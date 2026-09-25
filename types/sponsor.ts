/**
 * Sponsor Types - Sistema de patrocinio (Repeater/Array)
 * Usado en news_articles, interviews y academy_articles
 */

export interface Sponsor {
  company_name: string;
  logo_url: string;
  website_url: string;
}

/**
 * Validar que un sponsor individual es válido
 */
export function validateSponsor(sponsor: Partial<Sponsor>): boolean {
  // El nombre de la empresa es obligatorio
  return !!(sponsor.company_name && sponsor.company_name.trim().length > 0);
}

/**
 * Validar array completo de sponsors
 */
export function validateSponsors(sponsors: Partial<Sponsor>[]): boolean {
  if (!sponsors || sponsors.length === 0) {
    return true; // Array vacío es válido (sin sponsors)
  }

  // Todos los sponsors deben tener al menos company_name
  return sponsors.every(validateSponsor);
}

/**
 * Validar URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || url.trim().length === 0) {
    return true; // URLs vacías son válidas (campos opcionales)
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Crear sponsor vacío (para agregar al repeater)
 */
export function createEmptySponsor(): Sponsor {
  return {
    company_name: '',
    logo_url: '',
    website_url: ''
  };
}
