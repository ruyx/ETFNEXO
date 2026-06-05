/**
 * Script de prueba para Yahoo Finance
 * Verifica que podemos obtener datos GRATIS sin API key
 */

import { getCompleteETFData } from '../lib/services/yahoo-finance'

async function testYahooFinance() {
  console.log('🧪 Probando Yahoo Finance API (GRATIS sin API key)...\n')

  const testTickers = [
    'IWDA.AS',   // iShares Core MSCI World (Amsterdam)
    'VWRL.L',    // Vanguard FTSE All-World (London)
    'SPY',       // SPDR S&P 500 (US - para comparar)
  ]

  for (const ticker of testTickers) {
    try {
      console.log(`🔍 Probando ${ticker}...`)

      const data = await getCompleteETFData(ticker)

      if (!data) {
        console.log(`   ❌ No se pudieron obtener datos\n`)
        continue
      }

      console.log(`   ✅ ${data.name}`)
      console.log(`      Precio actual: ${data.currentPrice.toFixed(2)} ${data.currency}`)

      if (data.return1W !== undefined) {
        console.log(`      Return 1W: ${data.return1W.toFixed(2)}%`)
      }
      if (data.return1M !== undefined) {
        console.log(`      Return 1M: ${data.return1M.toFixed(2)}%`)
      }
      if (data.return1Y !== undefined) {
        console.log(`      Return 1Y: ${data.return1Y.toFixed(2)}%`)
      }
      if (data.volatility1Y !== undefined) {
        console.log(`      Volatilidad 1Y: ${data.volatility1Y.toFixed(2)}%`)
      }
      if (data.sharpeRatio !== undefined) {
        console.log(`      Sharpe Ratio: ${data.sharpeRatio.toFixed(2)}`)
      }

      console.log('') // Línea en blanco

      // Delay de 1 segundo entre llamadas
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error(`   ❌ Error con ${ticker}:`, error)
      console.log('')
    }
  }

  console.log('✅ Prueba completada')
}

testYahooFinance()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
