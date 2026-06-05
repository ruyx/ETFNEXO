/**
 * Aplica migraciones directamente a Supabase usando service role key
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
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

async function applyMigration(filepath: string) {
  console.log(`\n📄 Aplicando migración: ${filepath}`)

  const sql = readFileSync(filepath, 'utf-8')

  const { error } = await supabase.rpc('exec_sql', { sql })

  if (error) {
    console.error(`   ❌ Error:`, error.message)
    return false
  }

  console.log(`   ✅ Migración aplicada exitosamente`)
  return true
}

async function main() {
  console.log('🚀 Aplicando migraciones a Supabase...\n')

  const migrations = [
    'supabase/migrations/20260603000002_add_complete_etf_fields.sql'
  ]

  let success = 0
  let failed = 0

  for (const migration of migrations) {
    const result = await applyMigration(migration)
    if (result) {
      success++
    } else {
      failed++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMEN')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Migraciones aplicadas: ${success}`)
  console.log(`❌ Errores: ${failed}`)
}

main()
  .then(() => {
    console.log('\n✅ Proceso completado')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
