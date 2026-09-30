/**
 * Analyze Portfolio Tool - WebMCP
 *
 * Analiza una cartera de ETFs y genera métricas agregadas + recomendaciones
 * Ejemplo: User lista sus ETFs → AI genera análisis completo de diversificación
 */

import { createClient } from '@/lib/supabase/client';
import type { Tool } from '../types';

export interface AnalyzePortfolioArgs {
  tickers: string[];
  weights?: number[];
}

export interface PortfolioMetrics {
  totalETFs: number;
  averageTER: number;
  totalAUM: number;
  averageScore: number;
  regionExposure: Record<string, number>;
  sectorExposure: Record<string, number>;
  replicationMix: {
    physical: number;
    synthetic: number;
    unknown: number;
  };
}

export interface PortfolioRecommendation {
  type: 'warning' | 'suggestion' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedETFs?: string[];
}

export interface AnalyzePortfolioResult {
  metrics: PortfolioMetrics;
  recommendations: PortfolioRecommendation[];
  etfs: Array<{
    ticker: string;
    name: string;
    weight: number;
    ter: number;
    score: number;
    region?: string;
    sector?: string;
  }>;
}

export const analyzePortfolioTool: Tool<AnalyzePortfolioArgs, AnalyzePortfolioResult> = {
  name: 'analyze-portfolio',
  description:
    'Analiza una cartera de ETFs y genera métricas de diversificación, costes, calidad y recomendaciones de optimización. Útil para usuarios que quieren evaluar su cartera actual o comparar diferentes asignaciones.',
  requiresAuth: false,
  inputSchema: {
    type: 'object',
    properties: {
      tickers: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 20,
        description:
          'Lista de tickers de ETFs en la cartera. Ejemplo: ["IWDA.AS", "VWCE.DE", "CSPX.L"]. Máximo 20 ETFs.',
      },
      weights: {
        type: 'array',
        items: { type: 'number', minimum: 0, maximum: 1 },
        description:
          'Pesos de cada ETF (suma debe ser ~1.0). Si no se provee, se asume equiponderado. Ejemplo: [0.6, 0.3, 0.1]',
      },
    },
    required: ['tickers'],
  },

  async execute({ tickers, weights }) {
    console.log('[WebMCP] analyze-portfolio invoked:', { tickers, weights });

    // Emit evento de inicio
    window.dispatchEvent(
      new CustomEvent('webmcp:tool-invoked', {
        detail: { toolName: 'analyze-portfolio', args: { tickers, weights }, timestamp: Date.now() },
      })
    );

    const startTime = Date.now();

    try {
      // 1. Validar inputs
      if (tickers.length === 0) {
        throw new Error('La cartera debe contener al menos 1 ETF');
      }

      if (tickers.length > 20) {
        throw new Error('Máximo 20 ETFs permitidos en la cartera');
      }

      // Si no hay weights, asumir equiponderado
      const portfolioWeights =
        weights && weights.length === tickers.length
          ? weights
          : tickers.map(() => 1 / tickers.length);

      // Validar que weights suman ~1.0 (tolerancia ±0.05)
      const sumWeights = portfolioWeights.reduce((sum, w) => sum + w, 0);
      if (Math.abs(sumWeights - 1.0) > 0.05) {
        throw new Error(`Los pesos deben sumar ~1.0 (actual: ${sumWeights.toFixed(2)})`);
      }

      // 2. Fetch ETFs data de Supabase
      const supabase = createClient();
      const { data: etfsData, error } = await supabase
        .from('etfs')
        .select('isin, name, ter, aum_millions, average_rating, region, sector, replication_method, yahoo_ticker')
        .or(
          tickers
            .map((t) => `yahoo_ticker.eq.${t},isin.eq.${t}`)
            .join(',')
        );

      if (error) {
        console.error('[WebMCP] Error fetching ETFs:', error);
        throw new Error(`Error buscando ETFs: ${error.message}`);
      }

      if (!etfsData || etfsData.length === 0) {
        throw new Error('No se encontraron ETFs con los tickers proporcionados');
      }

      // 3. Mapear ETFs encontrados con sus weights
      const etfsMap = new Map(
        etfsData.map((etf) => [etf.yahoo_ticker || etf.isin, etf])
      );

      const portfolioETFs = tickers
        .map((ticker, index) => {
          const etf = etfsMap.get(ticker);
          if (!etf) {
            console.warn(`[WebMCP] ETF not found: ${ticker}`);
            return null;
          }
          return {
            ticker: etf.yahoo_ticker || etf.isin,
            name: etf.name,
            weight: portfolioWeights[index],
            ter: etf.ter || 0,
            score: etf.average_rating || 0,
            aum: (etf.aum_millions || 0) * 1_000_000,
            region: etf.region || 'Unknown',
            sector: etf.sector || 'Unknown',
            replicationMethod: etf.replication_method || 'Unknown',
          };
        })
        .filter((etf) => etf !== null);

      if (portfolioETFs.length === 0) {
        throw new Error('No se encontraron ETFs válidos en la cartera');
      }

      // 4. Calcular métricas agregadas
      const metrics = calculatePortfolioMetrics(portfolioETFs);

      // 5. Generar recomendaciones
      const recommendations = generateRecommendations(portfolioETFs, metrics);

      // 6. Preparar resultado
      const result: AnalyzePortfolioResult = {
        metrics,
        recommendations,
        etfs: portfolioETFs.map((etf) => ({
          ticker: etf.ticker,
          name: etf.name,
          weight: etf.weight,
          ter: etf.ter,
          score: etf.score,
          region: etf.region !== 'Unknown' ? etf.region : undefined,
          sector: etf.sector !== 'Unknown' ? etf.sector : undefined,
        })),
      };

      // 7. Actualizar UI vía evento
      window.dispatchEvent(
        new CustomEvent('webmcp:portfolio-analyzed', {
          detail: {
            metrics,
            recommendations,
            etfs: result.etfs,
          },
        })
      );

      const duration = Date.now() - startTime;
      console.log(`[WebMCP] analyze-portfolio completed in ${duration}ms`);

      // Emit evento de finalización
      window.dispatchEvent(
        new CustomEvent('webmcp:tool-completed', {
          detail: { toolName: 'analyze-portfolio', result, duration },
        })
      );

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('[WebMCP] analyze-portfolio error:', error);

      // Emit evento de error
      window.dispatchEvent(
        new CustomEvent('webmcp:tool-error', {
          detail: { toolName: 'analyze-portfolio', error: error.message },
        })
      );

      throw error;
    }
  },
};

/**
 * Calcula métricas agregadas de la cartera
 */
function calculatePortfolioMetrics(
  etfs: Array<{
    weight: number;
    ter: number;
    score: number;
    aum: number;
    region: string;
    sector: string;
    replicationMethod: string;
  }>
): PortfolioMetrics {
  // TER promedio ponderado
  const averageTER = etfs.reduce((sum, etf) => sum + etf.ter * etf.weight, 0);

  // Score promedio ponderado
  const averageScore = etfs.reduce((sum, etf) => sum + etf.score * etf.weight, 0);

  // AUM total
  const totalAUM = etfs.reduce((sum, etf) => sum + etf.aum, 0);

  // Exposición por región (ponderada)
  const regionExposure: Record<string, number> = {};
  etfs.forEach((etf) => {
    if (etf.region && etf.region !== 'Unknown') {
      regionExposure[etf.region] = (regionExposure[etf.region] || 0) + etf.weight;
    }
  });

  // Exposición por sector (ponderada)
  const sectorExposure: Record<string, number> = {};
  etfs.forEach((etf) => {
    if (etf.sector && etf.sector !== 'Unknown') {
      sectorExposure[etf.sector] = (sectorExposure[etf.sector] || 0) + etf.weight;
    }
  });

  // Mix de réplica
  const replicationMix = {
    physical: 0,
    synthetic: 0,
    unknown: 0,
  };

  etfs.forEach((etf) => {
    const method = etf.replicationMethod.toLowerCase();
    if (method.includes('physical') || method.includes('física')) {
      replicationMix.physical += etf.weight;
    } else if (method.includes('synthetic') || method.includes('sintética')) {
      replicationMix.synthetic += etf.weight;
    } else {
      replicationMix.unknown += etf.weight;
    }
  });

  return {
    totalETFs: etfs.length,
    averageTER,
    totalAUM,
    averageScore,
    regionExposure,
    sectorExposure,
    replicationMix,
  };
}

/**
 * Genera recomendaciones basadas en métricas
 */
function generateRecommendations(
  etfs: Array<{
    ticker: string;
    weight: number;
    ter: number;
    score: number;
    region: string;
    sector: string;
  }>,
  metrics: PortfolioMetrics
): PortfolioRecommendation[] {
  const recommendations: PortfolioRecommendation[] = [];

  // 1. TER alto (>0.5%)
  if (metrics.averageTER > 0.005) {
    const highTERETFs = etfs.filter((etf) => etf.ter > 0.005);
    recommendations.push({
      type: 'warning',
      priority: 'high',
      title: 'TER promedio alto',
      description: `Tu cartera tiene un TER promedio de ${(metrics.averageTER * 100).toFixed(2)}%, superior al 0.5% recomendado. Considera reemplazar ETFs con TER alto por alternativas más económicas.`,
      affectedETFs: highTERETFs.map((etf) => etf.ticker),
    });
  }

  // 2. Baja diversificación geográfica
  const regionCount = Object.keys(metrics.regionExposure).length;
  if (regionCount === 1) {
    recommendations.push({
      type: 'suggestion',
      priority: 'high',
      title: 'Concentración geográfica',
      description: `Tu cartera está 100% concentrada en ${Object.keys(metrics.regionExposure)[0]}. Considera agregar exposición a otras regiones para mejorar diversificación.`,
    });
  }

  // 3. Sobreexposición a un sector (>40%)
  const maxSectorExposure = Math.max(...Object.values(metrics.sectorExposure));
  if (maxSectorExposure > 0.4) {
    const dominantSector = Object.entries(metrics.sectorExposure).find(
      ([_, weight]) => weight === maxSectorExposure
    )?.[0];
    recommendations.push({
      type: 'warning',
      priority: 'medium',
      title: 'Sobreexposición sectorial',
      description: `${(maxSectorExposure * 100).toFixed(0)}% de tu cartera está en ${dominantSector}. Considera reducir exposición agregando ETFs de otros sectores.`,
    });
  }

  // 4. ETFs con score bajo (<6.0)
  const lowScoreETFs = etfs.filter((etf) => etf.score < 6.0 && etf.score > 0);
  if (lowScoreETFs.length > 0) {
    recommendations.push({
      type: 'suggestion',
      priority: 'medium',
      title: 'ETFs con calificación baja',
      description: `${lowScoreETFs.length} ETF(s) tienen ETFNexo Score inferior a 6.0. Considera reemplazarlos por alternativas de mayor calidad.`,
      affectedETFs: lowScoreETFs.map((etf) => etf.ticker),
    });
  }

  // 5. Cartera bien diversificada (elogio)
  if (regionCount >= 3 && maxSectorExposure <= 0.3 && metrics.averageTER <= 0.003) {
    recommendations.push({
      type: 'optimization',
      priority: 'low',
      title: 'Cartera bien optimizada',
      description: `Tu cartera muestra excelente diversificación (${regionCount} regiones), bajo TER (${(metrics.averageTER * 100).toFixed(2)}%) y buena distribución sectorial. ¡Bien hecho!`,
    });
  }

  // 6. Demasiados ETFs (>10)
  if (etfs.length > 10) {
    recommendations.push({
      type: 'suggestion',
      priority: 'low',
      title: 'Simplificación posible',
      description: `Tu cartera tiene ${etfs.length} ETFs. Considera consolidar en 5-8 ETFs core para simplificar gestión sin perder diversificación.`,
    });
  }

  return recommendations;
}
