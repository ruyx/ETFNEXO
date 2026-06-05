/**
 * Script para ejecutar migraciones de Supabase directamente
 * Usa el service role key para ejecutar SQL con privilegios admin
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration(migrationFile: string) {
  console.log(`\n📄 Ejecutando migración: ${migrationFile}`)

  try {
    const sqlPath = join(process.cwd(), 'supabase', 'migrations', migrationFile)
    const sql = readFileSync(sqlPath, 'utf-8')

    // Ejecutar SQL directamente usando rpc
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error(`❌ Error en migración ${migrationFile}:`, error)
      throw error
    }

    console.log(`✅ Migración ${migrationFile} completada`)
    return true
  } catch (error) {
    console.error(`❌ Error ejecutando migración ${migrationFile}:`, error)
    return false
  }
}

async function main() {
  console.log('🚀 Iniciando migraciones de Supabase...')
  console.log(`📍 URL: ${SUPABASE_URL}`)

  const migrations = [
    '20260603000001_create_initial_schema.sql',
    '20260603000002_add_complete_etf_fields.sql'
  ]

  for (const migration of migrations) {
    const success = await runMigration(migration)
    if (!success) {
      console.error('❌ Migraciones detenidas por error')
      process.exit(1)
    }
  }

  console.log('\n✅ Todas las migraciones completadas exitosamente')

  // Verificar tablas creadas
  const { data: tables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name')

  if (!error && tables) {
    console.log('\n📊 Tablas en la base de datos:')
    tables.forEach(t => console.log(`   - ${t.table_name}`))
  }
}

main().catch(console.error)
