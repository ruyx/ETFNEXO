/**
 * Sponsor Types - Sistema de patrocinio
 * Usado en news_articles e interviews
 */

export interface SponsorData {
  sponsor_enabled: boolean;
  sponsor_company_name: string | null;
  sponsor_logo_url: string | null;
  sponsor_website_url: string | null;
}

export interface SponsorFormData {
  sponsor_enabled: boolean;
  sponsor_company_name: string;
  sponsor_logo_url: string;
  sponsor_website_url: string;
}

/**
 * Validar que los datos de sponsor son válidos
 */
export function validateSponsorData(data: Partial<SponsorFormData>): boolean {
  if (!data.sponsor_enabled) {
    return true; // No sponsor, siempre válido
  }

  // Si sponsor está habilitado, debe tener al menos el nombre de la empresa
  return !!(data.sponsor_company_name && data.sponsor_company_name.trim().length > 0);
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
