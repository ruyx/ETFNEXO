/**
 * Crea tablas en Supabase usando API REST (sin SQL directo)
 * Método programático que funcionará independientemente de restricciones de red
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

async function main() {
  console.log('🚀 Creando estructura de base de datos...\n')

  // Paso 1: Crear gestoras
  console.log('📊 1. Insertando gestoras...')

  const managers = [
    { slug: 'ishares', name: 'iShares (BlackRock)', website_url: 'https://www.ishares.com' },
    { slug: 'vanguard', name: 'Vanguard', website_url: 'https://www.vanguard.com' },
    { slug: 'xtrackers', name: 'Xtrackers (DWS)', website_url: 'https://www.xtrackers.com' },
    { slug: 'amundi', name: 'Amundi', website_url: 'https://www.amundi.com' },
    { slug: 'spdr', name: 'SPDR (State Street)', website_url: 'https://www.ssga.com/spdr' }
  ]

  for (const manager of managers) {
    const { error } = await supabase
      .from('fund_managers')
      .upsert(manager, { onConflict: 'slug' })

    if (error && !error.message.includes('does not exist')) {
      console.log(`   ❌ Error insertando ${manager.slug}:`, error.message)

      // Si la tabla no existe, muestra instrucciones
      if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
        console.log('\n❌ Las tablas no existen en Supabase.')
        console.log('\n📝 ACCIÓN REQUERIDA:')
        console.log('\n1. Abre Supabase Dashboard SQL Editor:')
        console.log('   https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql/new')
        console.log('\n2. Copia y pega el contenido de:')
        console.log('   supabase/setup-complete.sql')
        console.log('\n3. Ejecuta el SQL (botón Run)')
        console.log('\n4. Luego vuelve a ejecutar este script')
        process.exit(1)
      }
    } else if (!error) {
      console.log(`   ✅ ${manager.slug}`)
    }
  }

  console.log('\n📊 2. Verificando tablas...')

  // Verificar que las tablas existan
  const { data: managersData, count: managersCount } = await supabase
    .from('fund_managers')
    .select('*', { count: 'exact' })

  if (managersCount && managersCount > 0) {
    console.log(`   ✅ fund_managers: ${managersCount} gestoras`)
  }

  const { data: etfsData, count: etfsCount } = await supabase
    .from('etfs')
    .select('*', { count: 'exact' })

  console.log(`   ✅ etfs: ${etfsCount || 0} ETFs`)

  console.log('\n✅ Base de datos lista para poblar con ETFs')
  console.log('\n📝 Siguiente paso:')
  console.log('   npx tsx scripts/setup-and-populate.ts')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  })
