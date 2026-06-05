/**
 * Finnhub REST API Service (usando fetch directo - más simple y confiable)
 * Documentación: https://finnhub.io/docs/api
 */

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'demo'
const BASE_URL = 'https://finnhub.io/api/v1'

export interface FinnhubETFProfile {
  symbol: string
  name: string
  aum: number
  expenseRatio: number
  nav: number
  inceptionDate: string
  domicile: string
  assetClass: string
  trackingIndex: string
  isLeveraged: boolean
  isInverse: boolean
}

export interface FinnhubETFHolding {
  symbol: string
  name: string
  isin: string
  percent: number
}

/**
 * Realiza una llamada a la API de Finnhub
 */
async function finnhubFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  try {
    const url = new URL(`${BASE_URL}/${endpoint}`)
    url.searchParams.append('token', FINNHUB_API_KEY)

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    console.log(`   Fetching: ${endpoint} (symbol: ${params.symbol || 'N/A'})`)

    const response = await fetch(url.toString())

    if (!response.ok) {
      console.error(`   HTTP ${response.status}: ${response.statusText}`)
      return null
    }

    const data = await response.json()

    // Finnhub retorna {} vacío si no encuentra el símbolo
    if (Object.keys(data).length === 0) {
      console.warn(`   No data found`)
      return null
    }

    return data as T
  } catch (error) {
    console.error(`   Error fetching ${endpoint}:`, error)
    return null
  }
}

/**
 * Obtiene perfil de un ETF
 * Endpoint: /etf/profile
 */
export async function getETFProfile(symbol: string): Promise<FinnhubETFProfile | null> {
  const data = await finnhubFetch<any>('etf/profile', { symbol: symbol.toUpperCase() })

  if (!data) return null

  return {
    symbol: data.symbol || symbol,
    name: data.name || '',
    aum: data.aum || 0,
    expenseRatio: data.expenseRatio || 0,
    nav: data.nav || 0,
    inceptionDate: data.inceptionDate || '',
    domicile: data.domicile || '',
    assetClass: data.assetClass || 'equity',
    trackingIndex: data.trackingIndex || '',
    isLeveraged: data.isLeveraged || false,
    isInverse: data.isInverse || false
  }
}

/**
 * Obtiene holdings de un ETF
 * Endpoint: /etf/holdings
 */
export async function getETFHoldings(symbol: string): Promise<FinnhubETFHolding[]> {
  const data = await finnhubFetch<any>('etf/holdings', { symbol: symbol.toUpperCase() })

  if (!data || !data.holdings) return []

  return data.holdings.slice(0, 10).map((h: any) => ({
    symbol: h.symbol || '',
    name: h.name || '',
    isin: h.isin || '',
    percent: h.percent || 0
  }))
}

/**
 * Obtiene cotización actual
 * Endpoint: /quote
 */
export async function getQuote(symbol: string): Promise<{ price: number; change: number } | null> {
  const data = await finnhubFetch<any>('quote', { symbol: symbol.toUpperCase() })

  if (!data || !data.c) return null

  return {
    price: data.c || 0,
    change: data.d || 0
  }
}

/**
 * Obtiene datos completos de un ETF
 */
export async function getCompleteETFData(symbol: string) {
  console.log(`\n🔍 Obteniendo datos de ${symbol}...`)

  const [profile, holdings, quote] = await Promise.all([
    getETFProfile(symbol),
    getETFHoldings(symbol),
    getQuote(symbol)
  ])

  if (!profile) {
    console.log(`   ⚠️  No se encontró perfil`)
    return null
  }

  // Actualizar NAV con cotización si está disponible
  if (quote && quote.price > 0) {
    profile.nav = quote.price
  }

  return {
    profile,
    holdings,
    quote
  }
}

/**
 * Calcula rendimientos mock basados en AUM y TER
 */
export function calculateMockReturns(aum: number, expenseRatio: number) {
  const baseReturn = 10 - (expenseRatio * 2)
  const seed = (aum * expenseRatio) % 100

  return {
    return1W: baseReturn * 0.05 + ((seed % 10) - 5) * 0.5,
    return1M: baseReturn * 0.2 + ((seed % 20) - 10) * 0.8,
    return1Y: baseReturn + ((seed % 30) - 15) * 1.5,
    return3Y: baseReturn * 2.8 + ((seed % 40) - 20) * 2,
    volatility1Y: 12 + (seed % 6)
  }
}

/**
 * Lista de ETFs europeos populares
 */
export const POPULAR_EUROPEAN_ETFS = [
  'SWDA.L',    // iShares Core MSCI World (London)
  'IWDA.AS',   // iShares Core MSCI World (Amsterdam)
  'CSPX.L',    // iShares Core S&P 500 (London)
  'EQQQ.L',    // iShares NASDAQ 100 (London)
  'VWRL.L',    // Vanguard FTSE All-World (London)
  'VUSA.L',    // Vanguard S&P 500 (London)
  'VEUR.AS',   // Vanguard FTSE Developed Europe (Amsterdam)
  'XMWO.L',    // Xtrackers MSCI World (London)
  'CW8.PA',    // Amundi MSCI World (Paris)
  'ZPRF.SW',   // SPDR Portfolio Total Stock Market (Swiss)
]
