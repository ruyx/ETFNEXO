/**
 * Finnhub API Integration Service
 * Obtiene datos REALES de ETFs desde Finnhub.io
 *
 * Documentación: https://finnhub.io/docs/api
 * Registro (FREE): https://finnhub.io/register
 */

const finnhub = require('finnhub')

const api_key = finnhub.ApiClient.instance.authentications['api_key']
api_key.apiKey = process.env.FINNHUB_API_KEY || 'demo'

const finnhubClient = new finnhub.DefaultApi()

export interface FinnhubETFProfile {
  symbol: string
  name: string

  // Datos fundamentales
  aum: number              // Assets Under Management (millones)
  expenseRatio: number     // TER en %
  nav: number              // Net Asset Value

  // Metadata
  inceptionDate: string
  domicile: string         // País de registro (IE, LU, etc.)
  assetClass: string       // Equity, Bond, Commodity, etc.
  trackingIndex: string    // Índice que replica

  // Características
  isLeveraged: boolean
  isInverse: boolean
  leverageFactor: number
}

export interface FinnhubETFHolding {
  symbol: string
  name: string
  isin: string
  percent: number          // Porcentaje del portafolio
  share: number            // Número de acciones
  value: number            // Valor de mercado
}

export interface FinnhubETFData {
  profile: FinnhubETFProfile
  holdings: FinnhubETFHolding[]
  sectorExposure: Record<string, number>
  countryExposure: Record<string, number>
  lastUpdate: Date
}

/**
 * Obtiene perfil completo de un ETF
 */
export async function getETFProfile(symbol: string): Promise<FinnhubETFProfile | null> {
  return new Promise((resolve, reject) => {
    finnhubClient.etfsProfile(symbol, (error: any, data: any) => {
      if (error) {
        console.error(`Error obteniendo perfil de ${symbol}:`, error)
        resolve(null)
        return
      }

      if (!data || Object.keys(data).length === 0) {
        console.warn(`No se encontró perfil para ${symbol}`)
        resolve(null)
        return
      }

      resolve({
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
        isInverse: data.isInverse || false,
        leverageFactor: data.leverageFactor || 1.0
      })
    })
  })
}

/**
 * Obtiene holdings (participaciones) de un ETF
 */
export async function getETFHoldings(symbol: string): Promise<FinnhubETFHolding[]> {
  return new Promise((resolve, reject) => {
    finnhubClient.etfsHoldings(symbol, (error: any, data: any) => {
      if (error) {
        console.error(`Error obteniendo holdings de ${symbol}:`, error)
        resolve([])
        return
      }

      if (!data || !data.holdings || data.holdings.length === 0) {
        console.warn(`No se encontraron holdings para ${symbol}`)
        resolve([])
        return
      }

      const holdings = data.holdings.slice(0, 10).map((h: any) => ({
        symbol: h.symbol || '',
        name: h.name || '',
        isin: h.isin || '',
        percent: h.percent || 0,
        share: h.share || 0,
        value: h.value || 0
      }))

      resolve(holdings)
    })
  })
}

/**
 * Obtiene exposición sectorial de un ETF
 */
export async function getETFSectorExposure(symbol: string): Promise<Record<string, number>> {
  return new Promise((resolve, reject) => {
    finnhubClient.etfsSectorExposure(symbol, (error: any, data: any) => {
      if (error) {
        console.error(`Error obteniendo sector exposure de ${symbol}:`, error)
        resolve({})
        return
      }

      if (!data || !data.sectorExposure) {
        resolve({})
        return
      }

      // Convertir array a objeto { sector: percentage }
      const sectors: Record<string, number> = {}
      data.sectorExposure.forEach((item: any) => {
        if (item.sector && item.exposure !== undefined) {
          sectors[item.sector] = item.exposure
        }
      })

      resolve(sectors)
    })
  })
}

/**
 * Obtiene exposición geográfica de un ETF
 */
export async function getETFCountryExposure(symbol: string): Promise<Record<string, number>> {
  return new Promise((resolve, reject) => {
    finnhubClient.etfsCountryExposure(symbol, (error: any, data: any) => {
      if (error) {
        console.error(`Error obteniendo country exposure de ${symbol}:`, error)
        resolve({})
        return
      }

      if (!data || !data.countryExposure) {
        resolve({})
        return
      }

      // Convertir array a objeto { country: percentage }
      const countries: Record<string, number> = {}
      data.countryExposure.forEach((item: any) => {
        if (item.country && item.exposure !== undefined) {
          countries[item.country] = item.exposure
        }
      })

      resolve(countries)
    })
  })
}

/**
 * Obtiene cotización actual de un ETF (precio de mercado)
 */
export async function getETFQuote(symbol: string): Promise<{ price: number; change: number; changePercent: number } | null> {
  return new Promise((resolve, reject) => {
    finnhubClient.quote(symbol, (error: any, data: any) => {
      if (error) {
        console.error(`Error obteniendo quote de ${symbol}:`, error)
        resolve(null)
        return
      }

      if (!data || !data.c) {
        resolve(null)
        return
      }

      resolve({
        price: data.c || 0,        // Current price
        change: data.d || 0,        // Change
        changePercent: data.dp || 0 // Percent change
      })
    })
  })
}

/**
 * Obtiene datos completos de un ETF (perfil + holdings + exposures + quote)
 */
export async function getCompleteETFData(symbol: string): Promise<FinnhubETFData | null> {
  try {
    const [profile, holdings, sectorExposure, countryExposure, quote] = await Promise.all([
      getETFProfile(symbol),
      getETFHoldings(symbol),
      getETFSectorExposure(symbol),
      getETFCountryExposure(symbol),
      getETFQuote(symbol)
    ])

    if (!profile) {
      console.warn(`No se pudo obtener perfil completo de ${symbol}`)
      return null
    }

    // Actualizar NAV con precio de mercado si está disponible
    if (quote && quote.price > 0) {
      profile.nav = quote.price
    }

    return {
      profile,
      holdings,
      sectorExposure,
      countryExposure,
      lastUpdate: new Date()
    }
  } catch (error) {
    console.error(`Error obteniendo datos completos de ${symbol}:`, error)
    return null
  }
}

/**
 * Lista de ETFs europeos populares (tickers de Yahoo Finance que también están en Finnhub)
 * Nota: Finnhub usa símbolos diferentes, hay que mapear
 */
export const POPULAR_EUROPEAN_ETFS = [
  // iShares (símbolos europeos)
  'SWDA.L',    // iShares Core MSCI World (London Stock Exchange)
  'IWDA.AS',   // iShares Core MSCI World (Amsterdam)
  'CSPX.L',    // iShares Core S&P 500 (London)
  'EQQQ.L',    // iShares NASDAQ 100 (London)
  'IEMA.AS',   // iShares MSCI EM (Amsterdam)

  // Vanguard
  'VWRL.L',    // Vanguard FTSE All-World (London)
  'VUSA.L',    // Vanguard S&P 500 (London)
  'VEUR.AS',   // Vanguard FTSE Developed Europe (Amsterdam)

  // Xtrackers
  'XMWO.L',    // Xtrackers MSCI World (London)
  'XDWD.L',    // Xtrackers MSCI World (London)

  // Amundi
  'CW8.PA',    // Amundi MSCI World (Paris)

  // SPDR
  'ZPRF.SW',   // SPDR Portfolio Total Stock Market (Swiss)
]

/**
 * Calcula rendimiento de un ETF basado en datos históricos
 * Nota: Finnhub free tier no incluye históricos completos,
 * solo datos actuales. Para rendimientos, usar Yahoo Finance o mock data.
 */
export function calculateMockReturns(aum: number, expenseRatio: number) {
  // Mock basado en AUM y expense ratio (mientras integramos datos históricos reales)
  const baseReturn = 10 - (expenseRatio * 2) // ETFs más caros rinden menos
  const aumFactor = Math.log10(aum) / 5      // ETFs más grandes = más estables

  return {
    return1W: baseReturn * 0.05 + (Math.random() - 0.5) * 2,
    return1M: baseReturn * 0.2 + (Math.random() - 0.5) * 4,
    return1Y: baseReturn + (Math.random() - 0.5) * 8,
    return3Y: baseReturn * 2.8 + (Math.random() - 0.5) * 10,
    volatility1Y: 12 + (Math.random() * 6)
  }
}
