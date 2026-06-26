import { createClient } from 'pexels';

/**
 * Cliente de Pexels para buscar imágenes de stock
 *
 * API Key: Obtener de https://www.pexels.com/api/
 * Límites: 200 requests/hora para free tier
 */

export interface PexelsImageResult {
  url: string;
  photographer: string;
  photographer_url: string;
  alt: string;
}

/**
 * Buscar imagen relevante en Pexels basándose en query
 */
export async function searchPexelsImage(
  query: string,
  apiKey: string
): Promise<PexelsImageResult | null> {
  try {
    const client = createClient(apiKey);

    // Limpiar query (remover caracteres especiales, limitar longitud)
    const cleanQuery = query
      .replace(/[^\w\s]/g, ' ')
      .trim()
      .substring(0, 100);

    // Buscar en Pexels
    const result = await client.photos.search({
      query: cleanQuery,
      per_page: 1,
      orientation: 'landscape', // Mejor para featured images
      locale: 'es-ES' // Priorizar contenido en español
    });

    if ('photos' in result && result.photos.length > 0) {
      const photo = result.photos[0];

      return {
        url: photo.src.large2x, // Imagen de alta calidad
        photographer: photo.photographer,
        photographer_url: photo.photographer_url,
        alt: photo.alt || cleanQuery
      };
    }

    return null;
  } catch (error) {
    console.error('[Pexels] Error searching image:', error);
    return null;
  }
}

/**
 * Generar query de búsqueda inteligente basado en título y categoría
 */
export function generateSearchQuery(title: string, category?: string): string {
  // Extraer keywords relevantes del título
  const financialKeywords = [
    'ETF', 'inversión', 'bolsa', 'finanzas', 'trading',
    'mercado', 'acciones', 'fondos', 'portfolio', 'criptomonedas',
    'bitcoin', 'oro', 'plata', 'semiconductores', 'tecnología'
  ];

  // Buscar keywords en el título
  const foundKeywords = financialKeywords.filter(keyword =>
    title.toLowerCase().includes(keyword.toLowerCase())
  );

  if (foundKeywords.length > 0) {
    // Si encontramos keywords específicos, usarlos
    return foundKeywords.slice(0, 2).join(' ');
  }

  if (category) {
    // Usar categoría si está disponible
    return category;
  }

  // Fallback genérico financiero
  return 'financial investment stock market';
}

/**
 * Verificar si una URL de imagen es accesible (no 404)
 */
export async function checkImageUrl(url: string | null): Promise<boolean> {
  if (!url) return false;

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 segundos timeout
    });

    return response.ok;
  } catch (error) {
    console.error(`[Image Check] Failed for ${url}:`, error);
    return false;
  }
}
