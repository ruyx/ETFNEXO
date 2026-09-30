/**
 * Advanced Natural Language Query Parser
 *
 * Parser mejorado con soporte para:
 * - Queries multi-criterio complejas
 * - Sinónimos y variaciones
 * - Detección de intención
 * - Normalización de valores
 * - Manejo de ambigüedad
 */

import type { SearchFilters } from '../types';

/**
 * Diccionario de sinónimos para reconocimiento robusto
 */
const SYNONYMS = {
  region: {
    europe: ['europa', 'european', 'europeo', 'eu', 'eurozona'],
    usa: ['usa', 'eeuu', 'estados unidos', 'america', 'american', 'us', 'norte america'],
    emerging: ['emergent', 'emerging', 'emergentes', 'em', 'mercados emergentes'],
    asia: ['asia', 'asiatic', 'asian', 'asiatico', 'pacifico'],
    global: ['global', 'mundial', 'world', 'msci world', 'all-world'],
    japan: ['japon', 'japan', 'japones', 'japanese'],
    uk: ['reino unido', 'uk', 'gran bretaña', 'britain'],
  },
  sector: {
    technology: ['tech', 'tecnologia', 'tecnolog', 'it', 'software', 'informatica'],
    healthcare: ['salud', 'health', 'healthcare', 'farmaceutic', 'pharma', 'biotech'],
    esg: ['sostenible', 'esg', 'sustain', 'verde', 'green', 'responsable', 'sri'],
    financials: ['financ', 'bank', 'financier', 'banca'],
    energy: ['energia', 'energy', 'petroleo', 'oil', 'renovables'],
    consumer: ['consumo', 'consumer', 'retail', 'bienes de consumo'],
    realestate: ['inmobiliario', 'real estate', 'reit', 'propiedades'],
    industrials: ['industrial', 'manufactura', 'engineering'],
    materials: ['materiales', 'materials', 'mineria', 'mining'],
  },
  quality: {
    best: ['mejor', 'mejores', 'best', 'top', 'excelent', 'alta calidad', 'premium'],
    good: ['buen', 'bueno', 'good', 'calidad', 'quality'],
    cheap: ['barato', 'cheap', 'economico', 'low cost', 'bajo coste'],
    large: ['grande', 'large', 'liquido', 'liquid', 'popular'],
    small: ['pequeño', 'small', 'niche'],
  },
};

/**
 * Parser avanzado con soporte para queries complejas
 */
export function parseAdvancedQuery(query: string): SearchFilters {
  const filters: SearchFilters = {};
  const normalizedQuery = query.toLowerCase().trim();

  // 1. Detectar región (con sinónimos)
  filters.region = detectRegion(normalizedQuery);

  // 2. Detectar sector (con sinónimos)
  filters.sector = detectSector(normalizedQuery);

  // 3. Parsear TER con múltiples formatos
  filters.maxTER = parseTER(normalizedQuery);

  // 4. Parsear AUM con unidades flexibles
  filters.minAUM = parseAUM(normalizedQuery);

  // 5. Parsear Score con variaciones
  filters.minScore = parseScore(normalizedQuery);

  // 6. Detectar tipo de réplica
  filters.replicationType = detectReplicationType(normalizedQuery);

  return filters;
}

/**
 * Detecta región usando diccionario de sinónimos
 */
function detectRegion(query: string): string | undefined {
  for (const [region, synonyms] of Object.entries(SYNONYMS.region)) {
    if (synonyms.some((syn) => query.includes(syn))) {
      // Mapear a nombre canónico
      const regionMap: Record<string, string> = {
        europe: 'Europe',
        usa: 'USA',
        emerging: 'Emerging Markets',
        asia: 'Asia',
        global: 'Global',
        japan: 'Japan',
        uk: 'United Kingdom',
      };
      return regionMap[region];
    }
  }
  return undefined;
}

/**
 * Detecta sector usando diccionario de sinónimos
 */
function detectSector(query: string): string | undefined {
  for (const [sector, synonyms] of Object.entries(SYNONYMS.sector)) {
    if (synonyms.some((syn) => query.includes(syn))) {
      // Mapear a nombre canónico
      const sectorMap: Record<string, string> = {
        technology: 'Technology',
        healthcare: 'Healthcare',
        esg: 'ESG',
        financials: 'Financials',
        energy: 'Energy',
        consumer: 'Consumer',
        realestate: 'Real Estate',
        industrials: 'Industrials',
        materials: 'Materials',
      };
      return sectorMap[sector];
    }
  }
  return undefined;
}

/**
 * Parsea TER con múltiples formatos y contexto
 */
function parseTER(query: string): number | undefined {
  // Patrones más flexibles
  const patterns = [
    // "TER < 0.3%", "TER menor a 0.5%"
    /ter\s*(?:[<≤]|menor(?:\s+(?:a|de|que))?)\s*([\d.]+)%?/i,
    // "gastos < 0.3%", "costes bajos"
    /(?:gastos?|costes?)\s*(?:[<≤]|menor(?:es)?(?:\s+(?:a|de|que))?)\s*([\d.]+)%?/i,
    // "TER máximo 0.3%"
    /ter\s*(?:maximo|max)\s*([\d.]+)%?/i,
    // "con TER de 0.3%"
    /con\s+ter\s+de\s*([\d.]+)%?/i,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      // Normalizar: si es > 1, asumir que está en porcentaje
      return value > 1 ? value / 100 : value / 100;
    }
  }

  // Palabras clave cualitativas
  const qualitativeKeywords = ['barato', 'cheap', 'economico', 'low cost', 'bajo coste', 'gastos bajos'];
  if (qualitativeKeywords.some((kw) => query.includes(kw))) {
    return 0.003; // 0.3%
  }

  const veryLowCostKeywords = ['muy barato', 'ultra barato', 'super cheap'];
  if (veryLowCostKeywords.some((kw) => query.includes(kw))) {
    return 0.002; // 0.2%
  }

  return undefined;
}

/**
 * Parsea AUM con unidades flexibles y contexto
 */
function parseAUM(query: string): number | undefined {
  // Patrones con unidades
  const patterns = [
    // "AUM > 500M", "AUM mayor a 1B"
    /aum\s*(?:[>≥]|mayor(?:\s+(?:a|de|que))?)\s*([€$£])?\s*([\d.]+)\s*(m|b|mil(?:lones)?|bill(?:ion)?)/i,
    // "activos > 500M"
    /activos?\s*(?:bajo\s+)?(?:gestion|gestionados)?\s*(?:[>≥]|mayor(?:es)?(?:\s+(?:a|de|que))?)\s*([€$£])?\s*([\d.]+)\s*(m|b|mil(?:lones)?|bill(?:ion)?)/i,
    // "más de 500 millones"
    /mas\s+de\s+([€$£])?\s*([\d.]+)\s*(m|b|mil(?:lones)?|bill(?:ion)?)/i,
    // "AUM mínimo 500M"
    /aum\s*(?:minimo|min)\s*([€$£])?\s*([\d.]+)\s*(m|b)/i,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      const value = parseFloat(match[2]);
      const unit = match[3]?.toLowerCase();

      if (unit?.startsWith('b')) {
        return value * 1_000_000_000; // Billions
      } else if (unit?.startsWith('m') || unit?.includes('mil')) {
        return value * 1_000_000; // Millions
      } else {
        // Sin unidad clara, asumir millions si < 1000
        return value < 1000 ? value * 1_000_000 : value;
      }
    }
  }

  // Palabras clave cualitativas
  const largeKeywords = ['grande', 'large', 'liquido', 'liquid', 'popular', 'conocido'];
  if (largeKeywords.some((kw) => query.includes(kw))) {
    return 500_000_000; // 500M
  }

  const veryLargeKeywords = ['muy grande', 'enorme', 'gigante'];
  if (veryLargeKeywords.some((kw) => query.includes(kw))) {
    return 5_000_000_000; // 5B
  }

  return undefined;
}

/**
 * Parsea Score con variaciones
 */
function parseScore(query: string): number | undefined {
  // Patrones numéricos
  const patterns = [
    /(?:score|puntuacion|calificacion)\s*(?:[>≥]|mayor(?:\s+(?:a|de|que))?)\s*([\d.]+)/i,
    /(?:score|rating)\s*(?:minimo|min)\s*([\d.]+)/i,
    /con\s+(?:score|rating)\s+de\s*(?:al menos\s+)?([\d.]+)/i,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      // Si es > 10, normalizar (asumir escala 0-100)
      return value > 10 ? value / 10 : value;
    }
  }

  // Palabras clave cualitativas
  const bestKeywords = ['mejor', 'mejores', 'best', 'top', 'excelent', 'alta calidad', 'premium'];
  if (bestKeywords.some((kw) => query.includes(kw))) {
    return 8.0;
  }

  const goodKeywords = ['buen', 'bueno', 'good', 'calidad'];
  if (goodKeywords.some((kw) => query.includes(kw)) && !query.includes('alta')) {
    return 7.0;
  }

  return undefined;
}

/**
 * Detecta tipo de réplica
 */
function detectReplicationType(query: string): 'physical' | 'synthetic' | undefined {
  const physicalKeywords = ['fisica', 'physical', 'fisico', 'directa', 'completa'];
  const syntheticKeywords = ['sintetica', 'synthetic', 'swap', 'derivados'];

  if (physicalKeywords.some((kw) => query.includes(kw))) {
    return 'physical';
  }

  if (syntheticKeywords.some((kw) => query.includes(kw))) {
    return 'synthetic';
  }

  return undefined;
}

/**
 * Valida coherencia de filtros y sugiere correcciones
 */
export function validateAndNormalizeFilters(filters: SearchFilters): {
  filters: SearchFilters;
  warnings: string[];
} {
  const warnings: string[] = [];
  const normalized = { ...filters };

  // Validar TER razonable
  if (normalized.maxTER !== undefined) {
    if (normalized.maxTER < 0) {
      warnings.push('TER no puede ser negativo, ignorando filtro');
      delete normalized.maxTER;
    } else if (normalized.maxTER > 0.05) {
      warnings.push('TER muy alto (>5%), puede limitar resultados');
    }
  }

  // Validar AUM razonable
  if (normalized.minAUM !== undefined) {
    if (normalized.minAUM < 0) {
      warnings.push('AUM no puede ser negativo, ignorando filtro');
      delete normalized.minAUM;
    } else if (normalized.minAUM > 100_000_000_000) {
      warnings.push('AUM muy alto (>€100B), puede no haber resultados');
    }
  }

  // Validar Score en rango
  if (normalized.minScore !== undefined) {
    if (normalized.minScore < 0 || normalized.minScore > 10) {
      warnings.push('Score debe estar entre 0 y 10, normalizando');
      normalized.minScore = Math.max(0, Math.min(10, normalized.minScore));
    }
  }

  return { filters: normalized, warnings };
}

/**
 * Genera descripción legible mejorada de filtros
 */
export function describeFiltersAdvanced(filters: SearchFilters): string {
  const parts: string[] = [];

  if (filters.region) {
    parts.push(`📍 ${filters.region}`);
  }

  if (filters.sector) {
    parts.push(`🏭 ${filters.sector}`);
  }

  if (filters.maxTER !== undefined) {
    parts.push(`💰 TER ≤ ${(filters.maxTER * 100).toFixed(2)}%`);
  }

  if (filters.minAUM !== undefined) {
    const aumB = filters.minAUM / 1_000_000_000;
    const aumM = filters.minAUM / 1_000_000;
    parts.push(`📊 AUM ≥ ${aumB >= 1 ? `€${aumB.toFixed(1)}B` : `€${aumM.toFixed(0)}M`}`);
  }

  if (filters.minScore !== undefined) {
    parts.push(`⭐ Score ≥ ${filters.minScore.toFixed(1)}`);
  }

  if (filters.replicationType) {
    const replicaLabel = filters.replicationType === 'physical' ? 'Física' : 'Sintética';
    parts.push(`🔄 Réplica ${replicaLabel}`);
  }

  return parts.length > 0 ? parts.join(' • ') : 'sin filtros';
}

/**
 * Extrae intención de la query (para futuras features)
 */
export function detectIntent(query: string): 'search' | 'compare' | 'analyze' | 'explain' | 'recommend' {
  const normalizedQuery = query.toLowerCase();

  // Compare
  if (/compar|vs|versus|frente a/i.test(normalizedQuery)) {
    return 'compare';
  }

  // Analyze
  if (/analiz|evalua|revisa|mi cartera/i.test(normalizedQuery)) {
    return 'analyze';
  }

  // Explain
  if (/que es|explica|define|significa/i.test(normalizedQuery)) {
    return 'explain';
  }

  // Recommend
  if (/recomiend|sugiere|aconseja|cual.*mejor/i.test(normalizedQuery)) {
    return 'recommend';
  }

  // Default: search
  return 'search';
}
