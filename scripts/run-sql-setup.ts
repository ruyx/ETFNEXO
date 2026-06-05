/**
 * Ejecuta setup SQL completo usando API de Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import ws from 'ws'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno SUPABASE')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: fetch },
  realtime: { transport: ws as any }
})

async function runSQL(sql: string) {
  // Separar comandos SQL individuales
  const commands = sql
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

  console.log(`📄 Ejecutando ${commands.length} comandos SQL...\n`)

  let successCount = 0
  let errorCount = 0

  for (const [index, command] of commands.entries()) {
    try {
      // Saltar comentarios y líneas vacías
      if (command.startsWith('--') || command.length < 10) {
        continue
      }

      const commandPreview = command.substring(0, 60).replace(/\n/g, ' ') + '...'
      console.log(`${index + 1}. ${commandPreview}`)

      const { data, error } = await supabase.rpc('exec_sql', { sql: command })

      if (error) {
        // Algunos errores son esperables (ej: "already exists")
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  Ya existe (skipping)`)
        } else {
          console.error(`   ❌ Error:`, error.message)
          errorCount++
        }
      } else {
        console.log(`   ✅ OK`)
        successCount++
      }

      // Pequeño delay para no saturar
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error: any) {
      console.error(`   ❌ Exception:`, error.message)
      errorCount++
    }
  }

  return { successCount, errorCount, totalCount: commands.length }
}

async function main() {
  console.log('🚀 Ejecutando setup SQL completo en Supabase...\n')

  // Leer archivo SQL
  const sqlFilePath = 'supabase/setup-complete.sql'
  console.log(`📖 Leyendo: ${sqlFilePath}\n`)

  const sql = readFileSync(sqlFilePath, 'utf-8')

  // Ejecutar SQL
  const result = await runSQL(sql)

  // Resumen
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMEN')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Comandos exitosos: ${result.successCount}`)
  console.log(`❌ Errores: ${result.errorCount}`)
  console.log(`📝 Total procesados: ${result.totalCount}`)

  // Verificar tablas creadas
  console.log('\n🔍 Verificando tablas creadas...')

  const { data: tables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', ['etfs', 'fund_managers', 'user_ratings', 'weekly_rankings'])

  if (tables && tables.length > 0) {
    console.log(`✅ Tablas encontradas: ${tables.map((t: any) => t.table_name).join(', ')}`)
  } else {
    console.log('⚠️  No se encontraron tablas (puede ser que ya existieran)')
  }

  // Verificar gestoras
  const { data: managers, count } = await supabase
    .from('fund_managers')
    .select('slug', { count: 'exact' })

  console.log(`\n📊 Gestoras en DB: ${count || 0}`)
  if (managers && managers.length > 0) {
    console.log(`   ${managers.map((m: any) => m.slug).join(', ')}`)
  }
}

main()
  .then(() => {
    console.log('\n✅ Setup SQL completado')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
