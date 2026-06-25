/**
 * Script para actualizar datos de mercado de ETFs desde Yahoo Finance
 * Procesa en lotes para evitar timeouts
 */
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: fetch },
  realtime: { transport: ws as any }
})

interface YahooQuote {
  regularMarketPrice?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  regularMarketChangePercent?: number
}

interface YahooHistoricalQuote {
  close: number
}

async function fetchYahooQuote(ticker: string): Promise<YahooQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.quoteResponse?.result?.[0]) {
      return data.quoteResponse.result[0]
    }
    return null
  } catch (error) {
    return null
  }
}

async function fetchYahooHistoricalData(ticker: string, period: string = '1y'): Promise<YahooHistoricalQuote[]> {
  try {
    const endDate = Math.floor(Date.now() / 1000)
    const startDate = period === '1y' ? endDate - (365 * 24 * 60 * 60) : endDate - (3 * 365 * 24 * 60 * 60)

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${startDate}&period2=${endDate}&interval=1d`
    const response = await fetch(url)
    const data = await response.json()

    if (data.chart?.result?.[0]?.indicators?.quote?.[0]?.close) {
      const closes = data.chart.result[0].indicators.quote[0].close
      return closes.filter((c: number | null) => c !== null).map((close: number) => ({ close }))
    }
    return []
  } catch (error) {
    return []
  }
}

function calculateReturn(historicalData: YahooHistoricalQuote[]): number | null {
  if (historicalData.length < 2) return null

  const firstPrice = historicalData[0].close
  const lastPrice = historicalData[historicalData.length - 1].close

  return ((lastPrice - firstPrice) / firstPrice) * 100
}

function calculateSharpeRatio(historicalData: YahooHistoricalQuote[], riskFreeRate: number = 0.04): number | null {
  if (historicalData.length < 30) return null

  const dailyReturns: number[] = []
  for (let i = 1; i < historicalData.length; i++) {
    const dailyReturn = (historicalData[i].close - historicalData[i - 1].close) / historicalData[i - 1].close
    dailyReturns.push(dailyReturn)
  }

  if (dailyReturns.length === 0) return null

  const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length
  const stdDev = Math.sqrt(
    dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgDailyReturn, 2), 0) / dailyReturns.length
  )

  if (stdDev === 0) return null

  const annualizedReturn = avgDailyReturn * 252
  const annualizedStdDev = stdDev * Math.sqrt(252)

  return (annualizedReturn - riskFreeRate) / annualizedStdDev
}

async function updateETFMarketData() {
  console.log('🔄 Iniciando actualización de datos de mercado desde Yahoo Finance...\n')

  // Obtener ETFs con yahoo_ticker válido
  const { data: etfs, error } = await supabase
    .from('etfs')
    .select('id, isin, name, yahoo_ticker')
    .not('yahoo_ticker', 'is', null)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('❌ Error al obtener ETFs:', error)
    process.exit(1)
  }

  console.log(`📊 Total de ETFs a actualizar: ${etfs.length}\n`)
  console.log('='.repeat(100))

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < etfs.length; i++) {
    const etf = etfs[i]
    const progress = `[${i + 1}/${etfs.length}]`

    try {
      // Obtener datos de Yahoo Finance
      const quote = await fetchYahooQuote(etf.yahoo_ticker)
      const historicalData = await fetchYahooHistoricalData(etf.yahoo_ticker, '1y')

      if (!quote && historicalData.length === 0) {
        console.log(`${progress} ⚠️  ${etf.isin.padEnd(15)} ${etf.name.slice(0, 40).padEnd(42)} - Sin datos en Yahoo Finance`)
        errorCount++
        continue
      }

      const return1y = calculateReturn(historicalData)
      const sharpeRatio = calculateSharpeRatio(historicalData)

      // Actualizar en la base de datos
      const { error: updateError } = await supabase
        .from('etfs')
        .update({
          return_1y: return1y,
          sharpe_ratio: sharpeRatio,
          updated_at: new Date().toISOString()
        })
        .eq('id', etf.id)

      if (updateError) {
        console.log(`${progress} ❌ ${etf.isin.padEnd(15)} ${etf.name.slice(0, 40).padEnd(42)} - Error: ${updateError.message}`)
        errorCount++
      } else {
        const ret1yStr = return1y !== null ? `${return1y.toFixed(2)}%` : 'N/A'
        const sharpeStr = sharpeRatio !== null ? sharpeRatio.toFixed(2) : 'N/A'
        console.log(`${progress} ✅ ${etf.isin.padEnd(15)} ${etf.name.slice(0, 40).padEnd(42)} - Ret 1Y: ${ret1yStr.padEnd(10)} Sharpe: ${sharpeStr}`)
        successCount++
      }

      // Rate limiting: esperar 100ms entre cada petición
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error) {
      console.log(`${progress} ❌ ${etf.isin.padEnd(15)} ${etf.name.slice(0, 40).padEnd(42)} - Error: ${error}`)
      errorCount++
    }
  }

  console.log('='.repeat(100))
  console.log(`\n✅ Actualización completada:`)
  console.log(`   - ETFs actualizados con éxito: ${successCount}`)
  console.log(`   - ETFs con errores: ${errorCount}`)
  console.log(`   - Total procesados: ${etfs.length}`)

  process.exit(0)
}

updateETFMarketData()
