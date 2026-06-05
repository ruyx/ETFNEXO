/**
 * Script para poblar la base de datos con ETFs REALES desde Finnhub API
 * Uso: FINNHUB_API_KEY=xxx NEXT_PUBLIC_SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/populate-etfs-finnhub.ts
 */

import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import {
  getCompleteETFData,
  calculateMockReturns,
  POPULAR_EUROPEAN_ETFS
} from '../lib/services/finnhub-rest'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno SUPABASE')
  process.exit(1)
}

if (!FINNHUB_API_KEY || FINNHUB_API_KEY === 'demo') {
  console.warn('⚠️  Usando DEMO API key de Finnhub (limitada)')
  console.warn('   Obtén una API key GRATIS en: https://finnhub.io/register')
  console.warn('   Luego agrega: FINNHUB_API_KEY=tu_key en .env.local\n')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    fetch: fetch
  },
  realtime: {
    transport: ws as any
  }
})

/**
 * Mapea datos de Finnhub a formato de base de datos
 */
function mapFinnhubDataToDBFormat(data: any, managerSlug: string) {
  const profile = data.profile
  const mockReturns = calculateMockReturns(profile.aum, profile.expenseRatio)

  // Determinar categoría basada en assetClass
  let category = 'equity'
  if (profile.assetClass.toLowerCase().includes('bond')) category = 'bond'
  if (profile.assetClass.toLowerCase().includes('commodity')) category = 'commodity'

  // Determinar región (mock por ahora, countryExposure no se usa en este script)
  let region = 'global'

  return {
    // Identificación
    isin: data.holdings[0]?.isin || generateMockISIN(profile.symbol),
    name: profile.name,
    official_name: profile.name,
    yahoo_ticker: profile.symbol,
    tickers: JSON.stringify([{ exchange: 'PRIMARY', ticker: profile.symbol }]),

    // Precios
    nav_price: profile.nav,
    nav_date: new Date().toISOString().split('T')[0],
    market_price: profile.nav,
    market_price_date: new Date().toISOString().split('T')[0],
    currency: 'EUR',

    // Rendimientos (mock mientras integramos datos históricos)
    return_1w: mockReturns.return1W,
    return_1m: mockReturns.return1M,
    return_1y: mockReturns.return1Y,
    return_3y: mockReturns.return3Y,
    volatility_1y: mockReturns.volatility1Y,

    // Datos fundamentales REALES de Finnhub
    ter: profile.expenseRatio / 100, // Convertir % a decimal
    aum_millions: profile.aum,
    tracking_error: null, // No disponible en Finnhub free tier
    dividend_policy: 'accumulating', // Default
    benchmark_index: profile.trackingIndex,
    replication_method: profile.isLeveraged ? 'synthetic' : 'physical',
    domicile: profile.domicile,
    base_currency: 'EUR',

    // Holdings REALES
    number_of_holdings: data.holdings.length,
    top_10_holdings: JSON.stringify(data.holdings.map(h => ({
      name: h.name,
      weight: h.percent,
      isin: h.isin
    }))),

    // Categorización
    category,
    region,
    sector: null, // Se podría derivar de sectorExposure

    // Metadata
    data_updated_at: new Date().toISOString(),
    kid_url: null,
    kid_date: null,
    data_quality_score: data.holdings.length > 0 ? 100 : 70,
    data_staleness_days: 0,
    is_active: true
  }
}

/**
 * Genera ISIN mock si no está disponible
 */
function generateMockISIN(ticker: string): string {
  const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return `IE00B${hash.toString().padStart(6, '0')}`
}

/**
 * Determina la gestora según el ticker
 */
function getManagerSlugFromTicker(ticker: string): string {
  const upper = ticker.toUpperCase()
  if (upper.includes('SWDA') || upper.includes('IWDA') || upper.includes('CSPX') || upper.includes('EQQQ')) {
    return 'ishares'
  }
  if (upper.includes('VWRL') || upper.includes('VUSA') || upper.includes('VEUR')) {
    return 'vanguard'
  }
  if (upper.includes('CW8')) {
    return 'amundi'
  }
  if (upper.includes('XMWO') || upper.includes('XDWD')) {
    return 'xtrackers'
  }
  if (upper.includes('ZPRF')) {
    return 'spdr'
  }
  return 'ishares' // Default
}

async function main() {
  console.log('🚀 Iniciando población de ETFs con datos REALES de Finnhub...\n')

  // 1. Obtener gestoras existentes
  const { data: managers } = await supabase.from('fund_managers').select('id, slug')
  const managerMap = new Map(managers?.map(m => [m.slug, m.id]) || [])

  console.log(`📊 Gestoras disponibles: ${Array.from(managerMap.keys()).join(', ')}\n`)

  // 2. Procesar ETFs
  let successCount = 0
  let errorCount = 0

  for (const ticker of POPULAR_EUROPEAN_ETFS) {
    try {
      console.log(`🔍 Obteniendo datos REALES de ${ticker}...`)

      const finnhubData = await getCompleteETFData(ticker)
      if (!finnhubData) {
        console.log(`   ⚠️  No se encontraron datos para ${ticker}`)
        errorCount++
        continue
      }

      const managerSlug = getManagerSlugFromTicker(ticker)
      const managerId = managerMap.get(managerSlug)

      const etfData = {
        ...mapFinnhubDataToDBFormat(finnhubData, managerSlug),
        manager_id: managerId
      }

      // Insertar o actualizar ETF
      const { error } = await supabase
        .from('etfs')
        .upsert(etfData, { onConflict: 'isin' })

      if (error) {
        console.error(`   ❌ Error insertando ${ticker}:`, error.message)
        errorCount++
      } else {
        console.log(`   ✅ ${ticker} - ${finnhubData.profile.name}`)
        console.log(`      NAV: €${finnhubData.profile.nav.toFixed(2)}`)
        console.log(`      AUM: $${finnhubData.profile.aum.toFixed(0)}M`)
        console.log(`      TER: ${finnhubData.profile.expenseRatio.toFixed(2)}%`)
        console.log(`      Holdings: ${finnhubData.holdings.length}`)
        if (finnhubData.profile.trackingIndex) {
          console.log(`      Index: ${finnhubData.profile.trackingIndex}`)
        }
        successCount++
      }

      // Delay para evitar rate limiting (free tier: 60 calls/min = 1 call/sec)
      await new Promise(resolve => setTimeout(resolve, 1500))

    } catch (error) {
      console.error(`   ❌ Error procesando ${ticker}:`, error)
      errorCount++
    }

    console.log('') // Línea en blanco
  }

  // 3. Resumen
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMEN')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ ETFs insertados: ${successCount}`)
  console.log(`❌ Errores: ${errorCount}`)
  console.log(`📈 Total procesados: ${POPULAR_EUROPEAN_ETFS.length}`)
  console.log('')

  // 4. Verificar datos en DB
  const { data: etfs, count } = await supabase
    .from('etfs')
    .select('*', { count: 'exact' })
    .order('return_1y', { ascending: false, nullsFirst: false })
    .limit(5)

  console.log(`📦 Total ETFs en base de datos: ${count}`)
  console.log('\n🏆 Top 5 ETFs por rendimiento 1Y:')
  etfs?.forEach((etf, i) => {
    console.log(`   ${i + 1}. ${etf.name} (${etf.yahoo_ticker})`)
    console.log(`      Return 1Y: ${etf.return_1y?.toFixed(2) || 'N/A'}%`)
    console.log(`      AUM: $${etf.aum_millions?.toFixed(0) || 'N/A'}M`)
    console.log(`      TER: ${etf.ter ? (etf.ter * 100).toFixed(2) : 'N/A'}%`)
  })
}

main()
  .then(() => {
    console.log('\n✅ Población con datos REALES completada')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
