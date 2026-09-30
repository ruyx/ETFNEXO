/**
 * Compare ETFs Tool - WebMCP
 *
 * Compara múltiples ETFs lado a lado con métricas clave
 * Ejemplo: "Compara IWDA.AS vs VWCE.DE vs CSPX.L"
 */

import { createClient } from '@/lib/supabase/client';
import type { Tool } from '../types';

export interface CompareETFsArgs {
  tickers: string[];
  metrics?: string[];
}

export interface ETFComparison {
  ticker: string;
  name: string;
  ter: number;
  aum: number;
  score: number;
  region?: string;
  sector?: string;
  replicationMethod?: string;
  inceptionDate?: string;
}

export interface ComparisonWinners {
  lowestTER?: string;
  highestScore?: string;
  largestAUM?: string;
  bestReplication?: string;
}

export interface CompareETFsResult {
  etfs: ETFComparison[];
  winners: ComparisonWinners;
  summary: string;
}

export const compareETFsTool: Tool<CompareETFsArgs, CompareETFsResult> = {
  name: 'compare-etfs',
  description:
    'Compara múltiples ETFs lado a lado con métricas clave y determina "ganadores" por cada métrica. Útil para decisiones de inversión comparando alternativas.',
  requiresAuth: false,
  inputSchema: {
    type: 'object',
    properties: {
      tickers: {
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
        maxItems: 5,
        description:
          'Lista de tickers de ETFs a comparar. Mínimo 2, máximo 5. Ejemplo: ["IWDA.AS", "VWCE.DE", "CSPX.L"]',
      },
      metrics: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['ter', 'score', 'aum', 'region', 'sector', 'replication'],
        },
        description:
          'Métricas a comparar. Si no se provee, se usan métricas por defecto: ["ter", "score", "aum"]',
      },
    },
    required: ['tickers'],
  },

  async execute({ tickers, metrics = ['ter', 'score', 'aum'] }) {
    console.log('[WebMCP] compare-etfs invoked:', { tickers, metrics });

    // Emit evento de inicio
    window.dispatchEvent(
      new CustomEvent('webmcp:tool-invoked', {
        detail: { toolName: 'compare-etfs', args: { tickers, metrics }, timestamp: Date.now() },
      })
    );

    const startTime = Date.now();

    try {
      // 1. Validar inputs
      if (tickers.length < 2) {
        throw new Error('Debes comparar al menos 2 ETFs');
      }

      if (tickers.length > 5) {
        throw new Error('Máximo 5 ETFs permitidos en la comparación');
      }

      // 2. Fetch ETFs data de Supabase
      const supabase = createClient();
      const { data: etfsData, error } = await supabase
        .from('etfs')
        .select(
          'isin, name, ter, aum_millions, average_rating, region, sector, replication_method, yahoo_ticker'
        )
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

      // 3. Mapear ETFs encontrados
      const etfsMap = new Map(
        etfsData.map((etf) => [etf.yahoo_ticker || etf.isin, etf])
      );

      const comparisonETFs = tickers
        .map((ticker) => {
          const etf = etfsMap.get(ticker);
          if (!etf) {
            console.warn(`[WebMCP] ETF not found: ${ticker}`);
            return null;
          }
          return {
            ticker: etf.yahoo_ticker || etf.isin,
            name: etf.name,
            ter: etf.ter || 0,
            aum: (etf.aum_millions || 0) * 1_000_000,
            score: etf.average_rating || 0,
            region: etf.region || undefined,
            sector: etf.sector || undefined,
            replicationMethod: etf.replication_method || undefined,
          } as ETFComparison;
        })
        .filter((etf): etf is ETFComparison => etf !== null);

      if (comparisonETFs.length < 2) {
        throw new Error('Se necesitan al menos 2 ETFs válidos para comparar');
      }

      // 4. Calcular "ganadores" por métrica
      const winners = calculateWinners(comparisonETFs);

      // 5. Generar resumen comparativo
      const summary = generateComparativeSummary(comparisonETFs, winners);

      // 6. Preparar resultado
      const result: CompareETFsResult = {
        etfs: comparisonETFs,
        winners,
        summary,
      };

      // 7. Actualizar UI vía evento
      window.dispatchEvent(
        new CustomEvent('webmcp:etfs-compared', {
          detail: {
            etfs: comparisonETFs,
            winners,
            summary,
          },
        })
      );

      const duration = Date.now() - startTime;
      console.log(`[WebMCP] compare-etfs completed in ${duration}ms`);

      // Emit evento de finalización
      window.dispatchEvent(
        new CustomEvent('webmcp:tool-completed', {
          detail: { toolName: 'compare-etfs', result, duration },
        })
      );

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('[WebMCP] compare-etfs error:', error);

      // Emit evento de error
      window.dispatchEvent(
        new CustomEvent('webmcp:tool-error', {
          detail: { toolName: 'compare-etfs', error: error.message },
        })
      );

      throw error;
    }
  },
};

/**
 * Calcula "ganadores" por cada métrica
 */
function calculateWinners(etfs: ETFComparison[]): ComparisonWinners {
  const winners: ComparisonWinners = {};

  // Menor TER (mejor)
  const lowestTERETF = etfs.reduce((min, etf) =>
    (etf.ter > 0 && etf.ter < min.ter) || min.ter === 0 ? etf : min
  );
  if (lowestTERETF.ter > 0) {
    winners.lowestTER = lowestTERETF.ticker;
  }

  // Mayor Score (mejor)
  const highestScoreETF = etfs.reduce((max, etf) =>
    etf.score > max.score ? etf : max
  );
  if (highestScoreETF.score > 0) {
    winners.highestScore = highestScoreETF.ticker;
  }

  // Mayor AUM (generalmente mejor por liquidez)
  const largestAUMETF = etfs.reduce((max, etf) =>
    etf.aum > max.aum ? etf : max
  );
  if (largestAUMETF.aum > 0) {
    winners.largestAUM = largestAUMETF.ticker;
  }

  // Mejor réplica (física > sintética)
  const physicalETFs = etfs.filter(
    (etf) =>
      etf.replicationMethod &&
      (etf.replicationMethod.toLowerCase().includes('physical') ||
        etf.replicationMethod.toLowerCase().includes('física'))
  );
  if (physicalETFs.length > 0) {
    // Prefer physical con mejor score
    const bestPhysical = physicalETFs.reduce((max, etf) =>
      etf.score > max.score ? etf : max
    );
    winners.bestReplication = bestPhysical.ticker;
  }

  return winners;
}

/**
 * Genera resumen comparativo en texto
 */
function generateComparativeSummary(
  etfs: ETFComparison[],
  winners: ComparisonWinners
): string {
  const lines: string[] = [];

  lines.push(`Comparación de ${etfs.length} ETFs:`);
  lines.push('');

  // Ganadores
  if (winners.lowestTER) {
    const etf = etfs.find((e) => e.ticker === winners.lowestTER);
    if (etf) {
      lines.push(`🏆 Mejor TER: ${winners.lowestTER} (${(etf.ter * 100).toFixed(2)}%)`);
    }
  }

  if (winners.highestScore) {
    const etf = etfs.find((e) => e.ticker === winners.highestScore);
    if (etf) {
      lines.push(`🏆 Mejor Score: ${winners.highestScore} (${etf.score.toFixed(1)}/10)`);
    }
  }

  if (winners.largestAUM) {
    const etf = etfs.find((e) => e.ticker === winners.largestAUM);
    if (etf) {
      const aumB = etf.aum / 1_000_000_000;
      lines.push(`🏆 Mayor AUM: ${winners.largestAUM} (€${aumB.toFixed(1)}B)`);
    }
  }

  if (winners.bestReplication) {
    lines.push(`🏆 Mejor Réplica: ${winners.bestReplication} (física)`);
  }

  // Recomendación general
  lines.push('');
  const overallWinner = determineOverallWinner(etfs, winners);
  if (overallWinner) {
    lines.push(`💡 Recomendación: ${overallWinner.ticker} destaca por equilibrio entre costes, calidad y liquidez.`);
  }

  return lines.join('\n');
}

/**
 * Determina "ganador" global basado en múltiples métricas
 */
function determineOverallWinner(
  etfs: ETFComparison[],
  winners: ComparisonWinners
): ETFComparison | null {
  // Score ponderado simple:
  // +3 puntos por ser ganador en TER
  // +3 puntos por ser ganador en Score
  // +2 puntos por ser ganador en AUM
  // +1 punto por ser ganador en replicación

  const scores = new Map<string, number>();

  etfs.forEach((etf) => {
    let score = 0;
    if (etf.ticker === winners.lowestTER) score += 3;
    if (etf.ticker === winners.highestScore) score += 3;
    if (etf.ticker === winners.largestAUM) score += 2;
    if (etf.ticker === winners.bestReplication) score += 1;
    scores.set(etf.ticker, score);
  });

  // Encontrar máximo score
  let maxScore = 0;
  let winnerTicker = '';

  scores.forEach((score, ticker) => {
    if (score > maxScore) {
      maxScore = score;
      winnerTicker = ticker;
    }
  });

  return etfs.find((etf) => etf.ticker === winnerTicker) || null;
}
