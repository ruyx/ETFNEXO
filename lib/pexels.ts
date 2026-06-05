// Pexels API Service
// Documentación: https://www.pexels.com/api/documentation/

const PEXELS_API_KEY = process.env.PEXELS_API_KEY!;
const PEXELS_API_URL = 'https://api.pexels.com/v1';

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

export interface PexelsSearchResponse {
  photos: PexelsPhoto[];
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
}

/**
 * Buscar fotos en Pexels por query
 */
export async function searchPhotos(
  query: string,
  page: number = 1,
  perPage: number = 15
): Promise<PexelsSearchResponse> {
  const response = await fetch(
    `${PEXELS_API_URL}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
    {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtener foto por ID
 */
export async function getPhotoById(id: number): Promise<PexelsPhoto> {
  const response = await fetch(`${PEXELS_API_URL}/photos/${id}`, {
    headers: {
      Authorization: PEXELS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtener fotos curadas (editorial quality)
 */
export async function getCuratedPhotos(
  page: number = 1,
  perPage: number = 15
): Promise<PexelsSearchResponse> {
  const response = await fetch(
    `${PEXELS_API_URL}/curated?page=${page}&per_page=${perPage}`,
    {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Mapeo de categorías de noticias a queries de Pexels
 */
const CATEGORY_TO_QUERY_MAP: Record<string, string[]> = {
  etfs: [
    'stock market chart',
    'financial trading',
    'stock exchange',
    'investment graph',
    'business finance'
  ],
  gestoras: [
    'business meeting',
    'office professional',
    'corporate team',
    'business handshake',
    'financial advisor'
  ],
  mercados: [
    'world economy',
    'global business',
    'stock market trading',
    'financial charts',
    'market analysis'
  ],
  regulacion: [
    'legal documents',
    'business law',
    'corporate compliance',
    'regulatory',
    'government building'
  ],
  educacion: [
    'learning finance',
    'business education',
    'financial literacy',
    'studying economics',
    'teaching investment'
  ],
  opinion: [
    'business thinking',
    'financial analysis',
    'expert opinion',
    'business strategy',
    'professional insight'
  ],
};

/**
 * Obtener imagen relevante según categoría de noticia
 */
export async function getRelevantPhotoForCategory(
  categorySlug: string
): Promise<PexelsPhoto | null> {
  const queries = CATEGORY_TO_QUERY_MAP[categorySlug] || ['finance', 'investment'];
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];

  try {
    const result = await searchPhotos(randomQuery, 1, 10);
    if (result.photos.length > 0) {
      // Devolver una foto aleatoria de los primeros 10 resultados
      const randomIndex = Math.floor(Math.random() * result.photos.length);
      return result.photos[randomIndex];
    }
    return null;
  } catch (error) {
    console.error('Error fetching Pexels photo:', error);
    return null;
  }
}

/**
 * Obtener imágenes para un artículo basándose en keywords
 */
export async function getPhotosForArticle(
  title: string,
  categorySlug: string,
  count: number = 3
): Promise<PexelsPhoto[]> {
  // Extraer keywords del título
  const keywords = extractKeywords(title);
  const searchQuery = keywords.length > 0
    ? keywords.join(' ')
    : CATEGORY_TO_QUERY_MAP[categorySlug]?.[0] || 'finance';

  try {
    const result = await searchPhotos(searchQuery, 1, count);
    return result.photos;
  } catch (error) {
    console.error('Error fetching photos for article:', error);
    // Fallback: usar foto genérica de la categoría
    const fallback = await getRelevantPhotoForCategory(categorySlug);
    return fallback ? [fallback] : [];
  }
}

/**
 * Extraer keywords relevantes de un título
 */
function extractKeywords(title: string): string[] {
  // Palabras a ignorar (stopwords en español)
  const stopwords = ['el', 'la', 'de', 'en', 'un', 'una', 'por', 'para', 'con', 'los', 'las', 'del', 'al', 'y', 'o', 'que'];

  const words = title.toLowerCase()
    .replace(/[^\wáéíóúñü\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopwords.includes(word));

  return words.slice(0, 3); // Máximo 3 keywords
}

/**
 * Formatear atribución de Pexels (requerido por términos de uso)
 */
export function formatPexelsAttribution(photo: PexelsPhoto): string {
  return `Foto de ${photo.photographer} en Pexels`;
}
