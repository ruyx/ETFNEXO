/**
 * Script para poblar la base de datos con ETFs reales desde Yahoo Finance
 * Uso: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/populate-etfs.ts
 */

import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import {
  getCompleteETFData,
  POPULAR_EUROPEAN_ETFS,
  type YahooETFData
} from '../lib/services/yahoo-finance'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
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
 * Mapea datos de Yahoo Finance a formato de base de datos
 */
function mapYahooDataToDBFormat(data: YahooETFData, managerSlug: string) {
  return {
    // Identificación
    isin: generateMockISIN(data.symbol), // TODO: obtener ISIN real
    name: data.name,
    yahoo_ticker: data.symbol,

    // Precios
    nav_price: data.currentPrice,
    nav_date: new Date().toISOString().split('T')[0], // Hoy
    currency: data.currency,

    // Rendimientos
    return_1w: data.return1W,
    return_1m: data.return1M,
    return_ytd: data.returnYTD,
    return_1y: data.return1Y,
    return_3y: data.return3Y,
    return_5y: data.return5Y,

    // Volatilidad y riesgo
    volatility_1y: data.volatility1Y,
    volume_avg: data.avgVolume,

    // Metadata
    data_updated_at: new Date().toISOString(),

    // Campos adicionales (v1.1)
    // aum_millions: data.marketCap ? data.marketCap / 1_000_000 : null,
    // sharpe_ratio: data.sharpeRatio,
  }
}

/**
 * Genera ISIN mock (en producción, se obtendría de la API real)
 */
function generateMockISIN(ticker: string): string {
  // IE00 + hash del ticker (mock)
  const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return `IE00B${hash.toString().padStart(6, '0')}`
}

/**
 * Determina la gestora según el ticker
 */
function getManagerSlugFromTicker(ticker: string): string {
  if (ticker.startsWith('IWDA') || ticker.startsWith('EUNL') || ticker.startsWith('IS')) {
    return 'ishares'
  }
  if (ticker.startsWith('VW') || ticker.startsWith('VUSA') || ticker.startsWith('VEUR')) {
    return 'vanguard'
  }
  if (ticker.startsWith('CW') || ticker.startsWith('PA')) {
    return 'amundi'
  }
  if (ticker.startsWith('XM') || ticker.startsWith('XDEM')) {
    return 'xtrackers'
  }
  if (ticker.startsWith('ZPRX')) {
    return 'spdr'
  }
  return 'ishares' // Default
}

async function main() {
  console.log('🚀 Iniciando población de ETFs con datos reales de Yahoo Finance...\n')

  // 1. Obtener gestoras existentes
  const { data: managers } = await supabase.from('fund_managers').select('id, slug')
  const managerMap = new Map(managers?.map(m => [m.slug, m.id]) || [])

  console.log(`📊 Gestoras disponibles: ${Array.from(managerMap.keys()).join(', ')}\n`)

  // 2. Procesar ETFs
  let successCount = 0
  let errorCount = 0

  for (const ticker of POPULAR_EUROPEAN_ETFS) {
    try {
      console.log(`🔍 Obteniendo datos de ${ticker}...`)

      const yahooData = await getCompleteETFData(ticker)
      if (!yahooData) {
        console.log(`   ⚠️  No se encontraron datos para ${ticker}`)
        errorCount++
        continue
      }

      const managerSlug = getManagerSlugFromTicker(ticker)
      const managerId = managerMap.get(managerSlug)

      const etfData = {
        ...mapYahooDataToDBFormat(yahooData, managerSlug),
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
        console.log(`   ✅ ${ticker} - ${yahooData.name}`)
        console.log(`      Precio: €${yahooData.currentPrice.toFixed(2)}`)
        if (yahooData.return1Y) {
          console.log(`      Return 1Y: ${yahooData.return1Y.toFixed(2)}%`)
        }
        if (yahooData.volatility1Y) {
          console.log(`      Volatilidad: ${yahooData.volatility1Y.toFixed(2)}%`)
        }
        if (yahooData.sharpeRatio) {
          console.log(`      Sharpe Ratio: ${yahooData.sharpeRatio.toFixed(2)}`)
        }
        successCount++
      }

      // Delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))

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
  })
}

main()
  .then(() => {
    console.log('\n✅ Población completada exitosamente')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
