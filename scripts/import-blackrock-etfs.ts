/**
 * Script para importar ETFs de BlackRock desde CSV descargado de Google Sheets
 *
 * Pasos previos:
 * 1. Abrir https://docs.google.com/spreadsheets/d/1vmecsyl8tK1N8hjFGTsbbQY8jrknPLEd/edit
 * 2. File -> Download -> Comma Separated Values (.csv)
 * 3. Guardar como /tmp/blackrock-etfs.csv
 *
 * Uso:
 * NEXT_PUBLIC_SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx \
 * npx tsx scripts/import-blackrock-etfs.ts [ruta-al-csv]
 *
 * Ejemplo:
 * npx tsx scripts/import-blackrock-etfs.ts /tmp/blackrock-etfs.csv
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import ws from 'ws'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno SUPABASE')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: fetch },
  realtime: { transport: ws as any }
})

// Mapping de categorías de Asset Class a nuestro enum
const ASSET_CLASS_MAPPING: Record<string, 'equity' | 'bond' | 'commodity'> = {
  'Equity': 'equity',
  'Renta variable': 'equity',
  'Fixed Income': 'bond',
  'Renta fija': 'bond',
  'Commodities': 'commodity',
  'Materias primas': 'commodity',
  'Cash': 'bond', // Lo tratamos como bond por defecto
  'Alternatives': 'equity', // Lo tratamos como equity por defecto
  'Multi-Asset': 'equity'
}

// Mapping de regiones
const REGION_MAPPING: Record<string, 'global' | 'us' | 'europe' | 'emerging' | 'asia' | 'latin_america'> = {
  'Global': 'global',
  'World': 'global',
  'North America': 'us',
  'United States': 'us',
  'U.S.': 'us',
  'US': 'us',
  'Europe': 'europe',
  'Emerging Markets': 'emerging',
  'Asia Pacific': 'asia',
  'Latin America': 'latin_america',
  'Japan': 'asia',
  'China': 'asia'
}

interface CSVRow {
  Ticker: string
  Nombre: string
  ISIN: string
  Domicilio: string
  Divisa: string
  'Total Expense Ratio': string
  'Fecha de lanzamiento': string
  '1Y (%)': string
  '3Y (%)': string
  '5Y (%)': string
  '10Y (%)': string
  'Asset Class': string
  'Sub Asset Class': string
  'Región': string
  'Net Assets': string
  [key: string]: string
}

function parseCSV(content: string): CSVRow[] {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length === 0) {
    throw new Error('CSV vacío')
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows: CSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0) continue

    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    rows.push(row)
  }

  return rows
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''))
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim().replace(/^"|"$/g, ''))
  return result
}

function parsePercentage(value: string): number | null {
  if (!value || value === '-' || value === 'N/A') return null

  // Remover caracteres no numéricos excepto punto, coma y signo negativo
  const cleaned = value.replace(/[^\d.,-]/g, '')

  // Convertir coma europea a punto
  const normalized = cleaned.replace(',', '.')

  const parsed = parseFloat(normalized)
  return isNaN(parsed) ? null : parsed
}

function parseAUM(value: string): number | null {
  if (!value || value === '-' || value === 'N/A') return null

  // Remover todo excepto números, punto y coma
  const cleaned = value.replace(/[^\d.,]/g, '')
  const normalized = cleaned.replace(',', '')

  const parsed = parseFloat(normalized)
  return isNaN(parsed) ? null : parsed
}

function mapCategory(assetClass: string): 'equity' | 'bond' | 'commodity' {
  const mapped = ASSET_CLASS_MAPPING[assetClass]
  if (mapped) return mapped

  // Intento heurístico basado en palabras clave
  const lower = assetClass.toLowerCase()
  if (lower.includes('equity') || lower.includes('stock') || lower.includes('renta variable')) {
    return 'equity'
  }
  if (lower.includes('bond') || lower.includes('fixed') || lower.includes('renta fija')) {
    return 'bond'
  }
  if (lower.includes('commodity') || lower.includes('gold') || lower.includes('oil')) {
    return 'commodity'
  }

  return 'equity' // Default
}

function mapRegion(region: string): 'global' | 'us' | 'europe' | 'emerging' | 'asia' | 'latin_america' {
  const mapped = REGION_MAPPING[region]
  if (mapped) return mapped

  // Intento heurístico
  const lower = region.toLowerCase()
  if (lower.includes('global') || lower.includes('world')) return 'global'
  if (lower.includes('us') || lower.includes('america') || lower.includes('norte')) return 'us'
  if (lower.includes('europ')) return 'europe'
  if (lower.includes('emerg')) return 'emerging'
  if (lower.includes('asia') || lower.includes('pacific')) return 'asia'
  if (lower.includes('latin')) return 'latin_america'

  return 'global' // Default
}

function formatYahooTicker(ticker: string): string {
  if (!ticker) return ''

  // Si el ticker ya tiene sufijo de mercado, devolverlo tal cual
  if (ticker.includes('.')) return ticker

  // Para ETFs de BlackRock/iShares, asumimos London Stock Exchange por defecto
  // El usuario puede ajustar manualmente después si es necesario
  return `${ticker}.L`
}

async function importETFs(csvPath: string) {
  console.log('📄 Leyendo archivo CSV:', csvPath)

  const csvContent = readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(csvContent)

  console.log(`✅ CSV parseado: ${rows.length} filas\n`)

  // Obtener BlackRock manager_id
  console.log('🔍 Buscando manager BlackRock en la base de datos...')
  const { data: managers } = await supabase
    .from('managers')
    .select('id, name')
    .ilike('name', '%blackrock%')
    .limit(1)

  let managerId: string | null = null

  if (managers && managers.length > 0) {
    managerId = managers[0].id
    console.log(`✅ Manager encontrado: ${managers[0].name} (${managerId})\n`)
  } else {
    console.log('⚠️  Manager BlackRock no encontrado. Se creará sin manager_id\n')
  }

  let imported = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const row of rows) {
    try {
      // Validar datos mínimos requeridos
      if (!row.ISIN || !row.Nombre) {
        skipped++
        continue
      }

      // Preparar datos para insertar
      const etfData = {
        isin: row.ISIN,
        name: row.Nombre,
        official_name: row.Nombre, // Usamos el mismo nombre por ahora
        manager_id: managerId,
        category: mapCategory(row['Asset Class'] || 'Equity'),
        region: mapRegion(row['Región'] || 'Global'),
        sector: row['Sub Asset Class'] || null,
        domicile: row.Domicilio || 'IE', // Irlanda por defecto para iShares
        currency: (row.Divisa || 'USD').toUpperCase().slice(0, 3) as 'EUR' | 'USD' | 'GBP',
        ter: parsePercentage(row['Total Expense Ratio']),
        aum_millions: parseAUM(row['Net Assets']),
        yahoo_ticker: formatYahooTicker(row.Ticker),
        return_1y: parsePercentage(row['1Y (%)']),
        return_3y: parsePercentage(row['3Y (%)']),
        return_5y: parsePercentage(row['5Y (%)']),
        replication_method: 'physical' as const, // Asumimos physical para iShares
        dividend_policy: 'accumulating' as const // Asumimos accumulating por defecto
      }

      // Intentar insertar (upsert en caso de conflicto)
      const { error } = await supabase
        .from('etfs')
        .upsert(etfData, {
          onConflict: 'isin',
          ignoreDuplicates: false
        })

      if (error) {
        console.error(`❌ Error al importar ${row.ISIN} (${row.Nombre}):`, error.message)
        errors++
      } else {
        // Verificar si fue insert o update
        const { data: existing } = await supabase
          .from('etfs')
          .select('created_at, updated_at')
          .eq('isin', row.ISIN)
          .single()

        if (existing && existing.created_at !== existing.updated_at) {
          updated++
          console.log(`🔄 Actualizado: ${row.Nombre} (${row.ISIN})`)
        } else {
          imported++
          console.log(`✅ Importado: ${row.Nombre} (${row.ISIN})`)
        }
      }

      // Delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (err: any) {
      console.error(`❌ Error procesando fila:`, err.message)
      errors++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE IMPORTACIÓN')
  console.log('='.repeat(60))
  console.log(`✅ Nuevos ETFs importados: ${imported}`)
  console.log(`🔄 ETFs actualizados:      ${updated}`)
  console.log(`⏭️  Filas omitidas:        ${skipped}`)
  console.log(`❌ Errores:                ${errors}`)
  console.log(`📈 Total procesado:        ${imported + updated + skipped + errors}`)
  console.log('='.repeat(60))

  // Verificar total en base de datos
  const { count } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true })

  console.log(`\n📊 Total de ETFs en base de datos: ${count}`)
}

// Main
const csvPath = process.argv[2] || '/tmp/blackrock-etfs.csv'

console.log('🚀 Iniciando importación de ETFs de BlackRock...\n')
console.log('Archivo CSV:', csvPath)
console.log('')

importETFs(csvPath)
  .then(() => {
    console.log('\n✅ Importación completada exitosamente')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Error fatal:', err)
    process.exit(1)
  })
