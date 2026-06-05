/**
 * Yahoo Finance Integration Service
 * Obtiene datos en vivo de ETFs desde Yahoo Finance
 *
 * IMPORTANTE: Yahoo Finance es GRATIS y no requiere API key
 * Usamos esto para precios y rendimientos históricos
 */

import yahooFinance from 'yahoo-finance2'

export interface YahooETFData {
  symbol: string
  name: string

  // Precios
  currentPrice: number
  currency: string

  // Rendimientos
  return1W?: number
  return1M?: number
  returnYTD?: number
  return1Y?: number
  return3Y?: number
  return5Y?: number

  // Volatilidad y riesgo
  volatility1Y?: number
  sharpeRatio?: number

  // Liquidez
  avgVolume?: number
  marketCap?: number

  // Metadata
  lastUpdate: Date
}

/**
 * Obtiene datos de cotización en tiempo real de un ETF
 */
export async function getETFQuote(symbol: string): Promise<YahooETFData | null> {
  try {
    const quote = await yahooFinance.quote(symbol)

    if (!quote) {
      console.warn(`No se encontró quote para ${symbol}`)
      return null
    }

    return {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName || symbol,
      currentPrice: quote.regularMarketPrice || 0,
      currency: quote.currency || 'EUR',
      avgVolume: (quote as any).averageVolume || undefined,
      marketCap: (quote as any).marketCap || undefined,
      lastUpdate: new Date()
    }
  } catch (error) {
    console.error(`Error obteniendo quote de ${symbol}:`, error)
    return null
  }
}

/**
 * Obtiene datos históricos de un ETF para calcular rendimientos
 */
export async function getETFHistoricalData(
  symbol: string,
  period: '1mo' | '3mo' | '1y' | '3y' | '5y' = '1y'
) {
  try {
    const queryOptions = { period1: getPeriodStartDate(period), interval: '1d' as const }
    const history = await yahooFinance.historical(symbol, queryOptions)

    return history
  } catch (error) {
    console.error(`Error obteniendo histórico de ${symbol}:`, error)
    return []
  }
}

/**
 * Calcula rendimiento porcentual entre dos precios
 */
function calculateReturn(priceStart: number, priceEnd: number): number {
  if (priceStart === 0) return 0
  return ((priceEnd - priceStart) / priceStart) * 100
}

/**
 * Calcula volatilidad anualizada (desviación estándar)
 */
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0

  // Calcular retornos diarios
  const returns = []
  for (let i = 1; i < prices.length; i++) {
    const dailyReturn = (prices[i] - prices[i - 1]) / prices[i - 1]
    returns.push(dailyReturn)
  }

  // Calcular media
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length

  // Calcular desviación estándar
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
  const dailyStdDev = Math.sqrt(variance)

  // Anualizar (252 días de trading)
  const annualizedVol = dailyStdDev * Math.sqrt(252) * 100

  return annualizedVol
}

/**
 * Calcula Sharpe Ratio (asume risk-free rate = 0 para simplicidad)
 */
function calculateSharpeRatio(avgReturn: number, volatility: number): number {
  if (volatility === 0) return 0
  // Sharpe = (Return - Risk Free Rate) / Volatility
  // Asumimos risk-free rate = 0 para simplicidad
  return avgReturn / volatility
}

/**
 * Obtiene datos completos de un ETF incluyendo rendimientos calculados
 */
export async function getCompleteETFData(symbol: string): Promise<YahooETFData | null> {
  try {
    // 1. Obtener quote actual
    const quote = await getETFQuote(symbol)
    if (!quote) return null

    // 2. Obtener históricos para calcular rendimientos
    const [hist1M, hist1Y] = await Promise.all([
      getETFHistoricalData(symbol, '1mo'),
      getETFHistoricalData(symbol, '1y')
    ])

    const currentPrice = quote.currentPrice

    // Calcular return 1M
    if (hist1M.length > 0) {
      const price1MontAgo = hist1M[0].close
      quote.return1M = calculateReturn(price1MontAgo, currentPrice)
    }

    // Calcular return 1Y y volatilidad
    if (hist1Y.length > 0) {
      const price1YearAgo = hist1Y[0].close
      quote.return1Y = calculateReturn(price1YearAgo, currentPrice)

      // Calcular volatilidad de los últimos 12 meses
      const prices = hist1Y.map(d => d.close)
      quote.volatility1Y = calculateVolatility(prices)

      // Calcular Sharpe Ratio
      if (quote.return1Y && quote.volatility1Y) {
        quote.sharpeRatio = calculateSharpeRatio(quote.return1Y, quote.volatility1Y)
      }
    }

    // Return 1W (última semana ~ 5 días trading)
    const hist1W = hist1Y.slice(-5)
    if (hist1W.length > 0) {
      quote.return1W = calculateReturn(hist1W[0].close, currentPrice)
    }

    return quote
  } catch (error) {
    console.error(`Error obteniendo datos completos de ${symbol}:`, error)
    return null
  }
}

/**
 * Lista de ETFs europeos populares (top ~50)
 */
export const POPULAR_EUROPEAN_ETFS = [
  // iShares (BlackRock)
  'IWDA.AS',    // iShares Core MSCI World UCITS ETF
  'EUNL.DE',    // iShares Core MSCI World UCITS ETF (EUR)
  'IS3N.DE',    // iShares Core MSCI World UCITS ETF (Acc)
  'CSSX5E.SW',  // iShares Core S&P 500 UCITS ETF
  'IQQH.DE',    // iShares MSCI EM UCITS ETF

  // Vanguard
  'VWCE.DE',    // Vanguard FTSE All-World UCITS ETF
  'VUSA.L',     // Vanguard S&P 500 UCITS ETF
  'VEUR.AS',    // Vanguard FTSE Developed Europe UCITS ETF

  // Amundi
  'CW8.PA',     // Amundi MSCI World UCITS ETF
  'PAEEM.PA',   // Amundi MSCI Emerging Markets UCITS ETF

  // Xtrackers (DWS)
  'XMWO.DE',    // Xtrackers MSCI World UCITS ETF
  'XDEM.DE',    // Xtrackers MSCI Emerging Markets UCITS ETF

  // SPDR
  'ZPRX.SW',    // SPDR S&P 500 UCITS ETF

  // Add more as needed...
]

/**
 * Helper: Obtiene fecha de inicio según periodo
 */
function getPeriodStartDate(period: '1mo' | '3mo' | '1y' | '3y' | '5y'): Date {
  const now = new Date()
  const date = new Date(now)

  switch (period) {
    case '1mo':
      date.setMonth(date.getMonth() - 1)
      break
    case '3mo':
      date.setMonth(date.getMonth() - 3)
      break
    case '1y':
      date.setFullYear(date.getFullYear() - 1)
      break
    case '3y':
      date.setFullYear(date.getFullYear() - 3)
      break
    case '5y':
      date.setFullYear(date.getFullYear() - 5)
      break
  }

  return date
}
