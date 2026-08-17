// ============================================
// API Admin - Actualización Automática de Datos de ETFs
// ============================================
// Descripción: Actualiza datos de mercado de ETFs desde Yahoo Finance
// Frecuencia: Semanal (viernes 22:00 UTC - después de cierre de mercados)
// Uso: Ejecutado automáticamente por Vercel Cron Job
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, handleAuthError } from '@/lib/auth/check-admin';
import { successResponse } from '@/lib/auth/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutos

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface YahooFinanceData {
  return_1y: number | null;
  sharpe_ratio: number | null;
  current_price: number | null;
}

// Función para calcular Sharpe Ratio
function calculateSharpeRatio(prices: number[], riskFreeRate: number = 0.02): number | null {
  if (!prices || prices.length < 2) return null;

  // Calcular retornos diarios
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] && prices[i - 1]) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }

  if (returns.length === 0) return null;

  // Calcular promedio y desviación estándar
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return null;

  // Sharpe Ratio = (Retorno - Tasa Libre de Riesgo) / Volatilidad
  // Anualizamos (252 días de trading al año)
  const annualizedReturn = avgReturn * 252;
  const annualizedVolatility = stdDev * Math.sqrt(252);

  return (annualizedReturn - riskFreeRate) / annualizedVolatility;
}

// Función para obtener datos de Yahoo Finance
async function fetchYahooFinanceData(ticker: string): Promise<YahooFinanceData> {
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1y`;

    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`[Yahoo Finance] Error fetching ${ticker}: ${response.status}`);
      return { return_1y: null, sharpe_ratio: null, current_price: null };
    }

    const data = await response.json();

    if (!data.chart?.result?.[0]?.indicators?.quote?.[0]?.close) {
      console.error(`[Yahoo Finance] No price data for ${ticker}`);
      return { return_1y: null, sharpe_ratio: null, current_price: null };
    }

    const prices = data.chart.result[0].indicators.quote[0].close.filter((p: any) => p !== null);

    if (prices.length < 252) {
      console.warn(`[Yahoo Finance] ${ticker} has only ${prices.length} days of data (less than 1 year)`);
    }

    if (prices.length < 2) {
      return { return_1y: null, sharpe_ratio: null, current_price: null };
    }

    // Calcular Return 1Y
    const currentPrice = prices[prices.length - 1];
    const priceOneYearAgo = prices[0];
    const return1y = ((currentPrice - priceOneYearAgo) / priceOneYearAgo) * 100;

    // Calcular Sharpe Ratio
    const sharpeRatio = calculateSharpeRatio(prices);

    return {
      return_1y: return1y,
      sharpe_ratio: sharpeRatio,
      current_price: currentPrice
    };

  } catch (error: any) {
    console.error(`[Yahoo Finance] Error fetching ${ticker}:`, error.message);
    return { return_1y: null, sharpe_ratio: null, current_price: null };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y rol de admin
    // Nota: Este endpoint también es llamado por Vercel Cron, que debe configurar
    // un header de autenticación especial o usar un token en el request
    await requireAdmin();

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    console.log('[Update ETF Data] Starting automatic weekly update...');

    // Obtener todos los ETFs con yahoo_ticker
    const { data: etfs, error: fetchError } = await supabase
      .from('etfs')
      .select('id, isin, name, yahoo_ticker')
      .not('yahoo_ticker', 'is', null);

    if (fetchError) {
      console.error('[Update ETF Data] Error fetching ETFs:', fetchError);
      return NextResponse.json(
        { error: 'Error fetching ETFs', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!etfs || etfs.length === 0) {
      return NextResponse.json({
        message: 'No ETFs found with yahoo_ticker',
        updated: 0
      });
    }

    console.log(`[Update ETF Data] Found ${etfs.length} ETFs with tickers`);

    let updated = 0;
    let failed = 0;
    const results: any[] = [];

    // Actualizar datos de cada ETF (con delay para evitar rate limiting)
    for (const etf of etfs) {
      console.log(`[Update ETF Data] Processing ${etf.yahoo_ticker} (${etf.name})...`);

      const yahooData = await fetchYahooFinanceData(etf.yahoo_ticker);

      if (yahooData.return_1y !== null || yahooData.sharpe_ratio !== null) {
        const { error: updateError }: any = await (supabase as any)
          .from('etfs')
          .update({
            return_1y: yahooData.return_1y,
            sharpe_ratio: yahooData.sharpe_ratio,
            updated_at: new Date().toISOString()
          })
          .eq('id' as any, etf.id as any);

        if (updateError) {
          console.error(`[Update ETF Data] Error updating ${etf.yahoo_ticker}:`, updateError);
          failed++;
          results.push({
            isin: etf.isin,
            ticker: etf.yahoo_ticker,
            status: 'error',
            error: updateError.message
          });
        } else {
          console.log(`[Update ETF Data] ✓ Updated ${etf.yahoo_ticker}: Return=${yahooData.return_1y?.toFixed(2)}%, Sharpe=${yahooData.sharpe_ratio?.toFixed(2)}`);
          updated++;
          results.push({
            isin: etf.isin,
            ticker: etf.yahoo_ticker,
            status: 'updated',
            return_1y: yahooData.return_1y,
            sharpe_ratio: yahooData.sharpe_ratio
          });
        }
      } else {
        console.warn(`[Update ETF Data] No data available for ${etf.yahoo_ticker}`);
        failed++;
        results.push({
          isin: etf.isin,
          ticker: etf.yahoo_ticker,
          status: 'no_data'
        });
      }

      // Delay de 1 segundo entre requests para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`[Update ETF Data] Completed: ${updated} updated, ${failed} failed`);

    return successResponse({
      total: etfs.length,
      updated,
      failed,
      timestamp: new Date().toISOString(),
      results: results.slice(0, 50) // Limitar resultados a 50 para no saturar respuesta
    }, 'ETF data update completed');

  } catch (error: any) {
    console.error('[Update ETF Data] Fatal error:', error);
    return handleAuthError(error);
  }
}
