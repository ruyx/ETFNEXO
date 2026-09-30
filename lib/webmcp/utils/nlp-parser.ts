/**
 * Natural Language Query Parser
 *
 * Convierte queries en lenguaje natural a filtros SQL para búsqueda de ETFs
 * Versión MVP: Regex-based parser (mejorar en Fase 3 con Transformers.js)
 */

import type { SearchFilters } from '../types';

/**
 * Parsea una query en lenguaje natural y extrae filtros estructurados
 *
 * Ejemplos:
 * - "ETFs de tecnología europea con TER menor a 0.3%" → {sector: "Technology", region: "Europe", maxTER: 0.003}
 * - "ETFs sostenibles de emergentes con AUM > 500M" → {sector: "ESG", region: "Emerging", minAUM: 500000000}
 * - "ETFs baratos de USA" → {region: "USA", maxTER: 0.005}
 */
export function parseNaturalQuery(query: string): SearchFilters {
  const filters: SearchFilters = {};
  const normalizedQuery = query.toLowerCase();

  // REGIÓN
  if (/europa|european?|europ[ea]/i.test(normalizedQuery)) {
    filters.region = 'Europe';
  } else if (/usa|america|estados unidos|eeuu|us\b/i.test(normalizedQuery)) {
    filters.region = 'USA';
  } else if (/emergent|emerging|em\b/i.test(normalizedQuery)) {
    filters.region = 'Emerging Markets';
  } else if (/asia|asiatic|asian/i.test(normalizedQuery)) {
    filters.region = 'Asia';
  } else if (/global|mundial|world/i.test(normalizedQuery)) {
    filters.region = 'Global';
  }

  // SECTOR
  if (/tech|tecnolog[íi]a/i.test(normalizedQuery)) {
    filters.sector = 'Technology';
  } else if (/salud|health|healthcare|farmac[ée]utic/i.test(normalizedQuery)) {
    filters.sector = 'Healthcare';
  } else if (/sostenible|esg|sustain|verde|green/i.test(normalizedQuery)) {
    filters.sector = 'ESG';
  } else if (/financ|bank|financier/i.test(normalizedQuery)) {
    filters.sector = 'Financials';
  } else if (/energ[íi]a|energy/i.test(normalizedQuery)) {
    filters.sector = 'Energy';
  } else if (/consumo|consumer|retail/i.test(normalizedQuery)) {
    filters.sector = 'Consumer';
  } else if (/inmobiliario|real estate|reit/i.test(normalizedQuery)) {
    filters.sector = 'Real Estate';
  }

  // TER (Total Expense Ratio)
  // Patrones: "TER < 0.3%", "TER menor a 0.5%", "gastos bajos", "barato"
  const terPatterns = [
    /ter\s*[<≤]\s*([\d.]+)%?/i,
    /ter\s*menor\s*(?:a|de|que)\s*([\d.]+)%?/i,
    /gastos?\s*[<≤]\s*([\d.]+)%?/i,
    /gastos?\s*menor(?:es)?\s*(?:a|de|que)\s*([\d.]+)%?/i,
  ];

  for (const pattern of terPatterns) {
    const match = normalizedQuery.match(pattern);
    if (match) {
      // Convertir porcentaje a decimal (0.3% → 0.003)
      filters.maxTER = parseFloat(match[1]) / 100;
      break;
    }
  }

  // Si dice "barato" o "bajo coste" sin número específico, asumir TER < 0.3%
  if (!filters.maxTER && /barato|bajo\s*cost|econ[óo]mic|cheap|low cost/i.test(normalizedQuery)) {
    filters.maxTER = 0.003; // 0.3%
  }

  // AUM (Assets Under Management)
  // Patrones: "AUM > 500M", "más de 1B de activos", "grande"
  const aumPatterns = [
    /aum\s*[>≥]\s*([€$£])?\s*([\d.]+)\s*(m|b|mil|millones|billion)?/i,
    /activos?\s*(?:bajo|under)\s*(?:gesti[óo]n)?\s*[>≥]\s*([€$£])?\s*([\d.]+)\s*(m|b)?/i,
    /m[áa]s\s*de\s*([€$£])?\s*([\d.]+)\s*(m|b|mil|millones|billion)/i,
  ];

  for (const pattern of aumPatterns) {
    const match = normalizedQuery.match(pattern);
    if (match) {
      const value = parseFloat(match[2]);
      const unit = match[3]?.toLowerCase();

      if (unit === 'b' || unit === 'billion') {
        filters.minAUM = value * 1_000_000_000; // Billions
      } else if (unit === 'm' || unit === 'mil' || unit === 'millones') {
        filters.minAUM = value * 1_000_000; // Millions
      } else {
        // Sin unidad, asumir millions
        filters.minAUM = value * 1_000_000;
      }
      break;
    }
  }

  // Si dice "grande" o "liquid" sin número, asumir AUM > 500M
  if (!filters.minAUM && /grande|liquid|popular|conocido/i.test(normalizedQuery)) {
    filters.minAUM = 500_000_000; // 500M
  }

  // ETFNexo Score
  // Patrones: "score > 8", "alta calificación", "mejores"
  const scorePatterns = [
    /score\s*[>≥]\s*([\d.]+)/i,
    /calificaci[óo]n\s*[>≥]\s*([\d.]+)/i,
    /puntuaci[óo]n\s*[>≥]\s*([\d.]+)/i,
  ];

  for (const pattern of scorePatterns) {
    const match = normalizedQuery.match(pattern);
    if (match) {
      filters.minScore = parseFloat(match[1]);
      break;
    }
  }

  // Si dice "mejores" o "top" sin número, asumir score > 8
  if (!filters.minScore && /mejor(?:es)?|top|excelent|alta\s*calidad/i.test(normalizedQuery)) {
    filters.minScore = 8.0;
  }

  // Tipo de Réplica
  if (/f[íi]sica|physical|f[íi]sico/i.test(normalizedQuery)) {
    filters.replicationType = 'physical';
  } else if (/sint[ée]tica|synthetic|swap/i.test(normalizedQuery)) {
    filters.replicationType = 'synthetic';
  }

  return filters;
}

/**
 * Genera una descripción legible de los filtros aplicados
 */
export function describeFilters(filters: SearchFilters): string {
  const parts: string[] = [];

  if (filters.region) {
    parts.push(`región ${filters.region}`);
  }

  if (filters.sector) {
    parts.push(`sector ${filters.sector}`);
  }

  if (filters.maxTER !== undefined) {
    parts.push(`TER ≤ ${(filters.maxTER * 100).toFixed(2)}%`);
  }

  if (filters.minAUM !== undefined) {
    const aumB = filters.minAUM / 1_000_000_000;
    const aumM = filters.minAUM / 1_000_000;
    parts.push(`AUM ≥ ${aumB >= 1 ? `€${aumB.toFixed(1)}B` : `€${aumM.toFixed(0)}M`}`);
  }

  if (filters.minScore !== undefined) {
    parts.push(`ETFNexo Score ≥ ${filters.minScore}`);
  }

  if (filters.replicationType) {
    parts.push(`réplica ${filters.replicationType === 'physical' ? 'física' : 'sintética'}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'sin filtros';
}

/**
 * Valida que los filtros sean coherentes
 */
export function validateFilters(filters: SearchFilters): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (filters.maxTER !== undefined && (filters.maxTER < 0 || filters.maxTER > 0.05)) {
    errors.push('TER debe estar entre 0% y 5%');
  }

  if (filters.minAUM !== undefined && filters.minAUM < 0) {
    errors.push('AUM debe ser positivo');
  }

  if (filters.minScore !== undefined && (filters.minScore < 0 || filters.minScore > 10)) {
    errors.push('ETFNexo Score debe estar entre 0 y 10');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
