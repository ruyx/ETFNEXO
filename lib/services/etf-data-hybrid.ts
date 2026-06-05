/**
 * ETF Data Hybrid Service
 * Combina Finnhub (fundamentales) + Yahoo Finance (precios/rendimientos)
 *
 * ESTRATEGIA:
 * - Finnhub: AUM, TER, Holdings, Sector/Country exposure
 * - Yahoo Finance: Precios históricos, Rendimientos, Volatilidad, Sharpe Ratio
 */

import { getCompleteETFData as getFinnhubData, type FinnhubETFData } from './finnhub'
import { getCompleteETFData as getYahooData, type YahooETFData } from './yahoo-finance'

export interface HybridETFData {
  // Identificación
  symbol: string
  name: string
  isin?: string

  // PRECIOS (Yahoo Finance - GRATIS)
  currentPrice: number
  currency: string

  // RENDIMIENTOS (Yahoo Finance - calculados)
  return1W?: number
  return1M?: number
  returnYTD?: number
  return1Y?: number
  return3Y?: number
  return5Y?: number

  // VOLATILIDAD Y RIESGO (Yahoo Finance - calculados)
  volatility1Y?: number
  sharpeRatio?: number

  // FUNDAMENTALES (Finnhub - API key requerida)
  aum?: number              // Assets Under Management
  expenseRatio?: number     // TER
  nav?: number              // Net Asset Value

  // HOLDINGS (Finnhub)
  topHoldings?: Array<{
    name: string
    isin: string
    percent: number
  }>
  numberOfHoldings?: number

  // EXPOSURES (Finnhub)
  sectorExposure?: Record<string, number>
  countryExposure?: Record<string, number>

  // METADATA (Finnhub)
  trackingIndex?: string
  domicile?: string
  assetClass?: string
  replicationMethod?: string

  // Fuentes de datos
  dataSource: {
    prices: 'yahoo' | 'finnhub'
    fundamentals: 'finnhub' | 'yahoo' | 'none'
  }

  lastUpdate: Date
}

/**
 * Obtiene datos completos de un ETF combinando Finnhub + Yahoo Finance
 *
 * @param symbol - Ticker del ETF (ej: IWDA.AS, VWRL.L)
 * @param options - Opciones de obtención
 */
export async function getHybridETFData(
  symbol: string,
  options: {
    includeFinnhub?: boolean  // Default: true si FINNHUB_API_KEY está configurada
    includeYahoo?: boolean    // Default: true siempre (es gratis)
  } = {}
): Promise<HybridETFData | null> {
  const hasFinnhubKey = process.env.FINNHUB_API_KEY && process.env.FINNHUB_API_KEY !== 'demo'

  const includeFinnhub = options.includeFinnhub ?? hasFinnhubKey
  const includeYahoo = options.includeYahoo ?? true

  try {
    // Ejecutar en paralelo para máxima velocidad
    const [finnhubData, yahooData] = await Promise.all([
      includeFinnhub ? getFinnhubData(symbol) : Promise.resolve(null),
      includeYahoo ? getYahooData(symbol) : Promise.resolve(null)
    ])

    // Si no tenemos datos de ninguna fuente, retornar null
    if (!finnhubData && !yahooData) {
      console.warn(`No se pudieron obtener datos de ${symbol} desde ninguna fuente`)
      return null
    }

    // Construir datos híbridos
    const hybrid: HybridETFData = {
      // Identificación (priorizar Finnhub para nombre oficial)
      symbol,
      name: finnhubData?.profile.name || yahooData?.name || symbol,
      isin: finnhubData?.holdings[0]?.isin,

      // PRECIOS (Yahoo Finance - siempre preferido para esto)
      currentPrice: yahooData?.currentPrice || finnhubData?.profile.nav || 0,
      currency: yahooData?.currency || 'EUR',

      // RENDIMIENTOS (Yahoo Finance)
      return1W: yahooData?.return1W,
      return1M: yahooData?.return1M,
      returnYTD: yahooData?.returnYTD,
      return1Y: yahooData?.return1Y,
      return3Y: yahooData?.return3Y,
      return5Y: yahooData?.return5Y,

      // VOLATILIDAD (Yahoo Finance)
      volatility1Y: yahooData?.volatility1Y,
      sharpeRatio: yahooData?.sharpeRatio,

      // FUNDAMENTALES (Finnhub)
      aum: finnhubData?.profile.aum,
      expenseRatio: finnhubData?.profile.expenseRatio,
      nav: finnhubData?.profile.nav,

      // HOLDINGS (Finnhub)
      topHoldings: finnhubData?.holdings.slice(0, 10).map(h => ({
        name: h.name,
        isin: h.isin,
        percent: h.percent
      })),
      numberOfHoldings: finnhubData?.holdings.length,

      // EXPOSURES (Finnhub)
      sectorExposure: finnhubData?.sectorExposure,
      countryExposure: finnhubData?.countryExposure,

      // METADATA (Finnhub)
      trackingIndex: finnhubData?.profile.trackingIndex,
      domicile: finnhubData?.profile.domicile,
      assetClass: finnhubData?.profile.assetClass,
      replicationMethod: finnhubData?.profile.isLeveraged ? 'synthetic' : 'physical',

      // Fuentes
      dataSource: {
        prices: yahooData ? 'yahoo' : 'finnhub',
        fundamentals: finnhubData ? 'finnhub' : 'none'
      },

      lastUpdate: new Date()
    }

    return hybrid
  } catch (error) {
    console.error(`Error obteniendo datos híbridos de ${symbol}:`, error)
    return null
  }
}

/**
 * Obtiene datos de múltiples ETFs en paralelo
 */
export async function getMultipleHybridETFData(
  symbols: string[],
  options: {
    includeFinnhub?: boolean
    includeYahoo?: boolean
    delayMs?: number  // Delay entre llamadas para evitar rate limits
  } = {}
): Promise<Map<string, HybridETFData>> {
  const results = new Map<string, HybridETFData>()
  const delayMs = options.delayMs || 500 // Default 500ms entre llamadas

  for (const symbol of symbols) {
    try {
      const data = await getHybridETFData(symbol, options)
      if (data) {
        results.set(symbol, data)
        console.log(`✅ ${symbol} - Datos híbridos obtenidos`)
      } else {
        console.warn(`⚠️  ${symbol} - No se pudieron obtener datos`)
      }

      // Delay para evitar rate limits
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    } catch (error) {
      console.error(`❌ ${symbol} - Error:`, error)
    }
  }

  return results
}

/**
 * Calcula score de calidad de datos (0-100)
 */
export function calculateDataQualityScore(data: HybridETFData): number {
  let score = 0

  // Precios y rendimientos (40 puntos)
  if (data.currentPrice > 0) score += 10
  if (data.return1Y !== undefined) score += 10
  if (data.return1M !== undefined) score += 10
  if (data.volatility1Y !== undefined) score += 10

  // Fundamentales (40 puntos)
  if (data.aum !== undefined && data.aum > 0) score += 15
  if (data.expenseRatio !== undefined) score += 15
  if (data.topHoldings && data.topHoldings.length > 0) score += 10

  // Metadata (20 puntos)
  if (data.trackingIndex) score += 10
  if (data.domicile) score += 5
  if (data.assetClass) score += 5

  return Math.min(100, score)
}
