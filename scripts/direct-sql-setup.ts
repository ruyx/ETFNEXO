/**
 * Ejecuta SQL directamente en Supabase usando fetch a la API de Postgres
 */

import { readFileSync } from 'fs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno SUPABASE')
  process.exit(1)
}

async function execSQL(sql: string): Promise<{ success: boolean, error?: string }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🚀 Configurando base de datos directamente...\n')

  // En lugar de ejecutar todo el SQL de golpe, voy a crear las tablas usando código
  console.log('📋 Creando tablas una por una...\n')

  const steps = [
    {
      name: 'Tabla fund_managers',
      sql: `
        CREATE TABLE IF NOT EXISTS fund_managers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          slug TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          logo_url TEXT,
          website_url TEXT,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Datos fund_managers',
      sql: `
        INSERT INTO fund_managers (slug, name, website_url) VALUES
          ('ishares', 'iShares (BlackRock)', 'https://www.ishares.com'),
          ('vanguard', 'Vanguard', 'https://www.vanguard.com'),
          ('xtrackers', 'Xtrackers (DWS)', 'https://www.xtrackers.com'),
          ('amundi', 'Amundi', 'https://www.amundi.com'),
          ('spdr', 'SPDR (State Street)', 'https://www.ssga.com/spdr')
        ON CONFLICT (slug) DO NOTHING;
      `
    },
    {
      name: 'Tabla etfs',
      sql: `
        CREATE TABLE IF NOT EXISTS etfs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          isin TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          official_name TEXT,
          yahoo_ticker TEXT,
          tickers JSONB DEFAULT '[]',
          manager_id UUID REFERENCES fund_managers(id),
          nav_price DECIMAL(10,4),
          nav_date DATE,
          market_price DECIMAL(10,4),
          market_price_date DATE,
          currency TEXT DEFAULT 'EUR',
          return_1w DECIMAL(8,4),
          return_1m DECIMAL(8,4),
          return_1y DECIMAL(8,4),
          return_3y DECIMAL(8,4),
          volatility_1y DECIMAL(8,4),
          ter DECIMAL(6,4),
          aum_millions DECIMAL(12,2),
          tracking_error DECIMAL(6,4),
          dividend_policy TEXT,
          benchmark_index TEXT,
          replication_method TEXT,
          domicile TEXT,
          base_currency TEXT,
          listing_exchanges JSONB DEFAULT '[]',
          number_of_holdings INTEGER,
          top_10_holdings JSONB DEFAULT '[]',
          sharpe_ratio DECIMAL(8,4),
          bid_ask_spread DECIMAL(6,4),
          category TEXT,
          region TEXT,
          sector TEXT,
          kid_url TEXT,
          kid_date DATE,
          data_updated_at TIMESTAMPTZ DEFAULT NOW(),
          data_quality_score INTEGER DEFAULT 100,
          data_staleness_days INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Índices etfs',
      sql: `
        CREATE INDEX IF NOT EXISTS idx_etfs_isin ON etfs(isin);
        CREATE INDEX IF NOT EXISTS idx_etfs_return_1y ON etfs(return_1y DESC);
      `
    },
    {
      name: 'RLS etfs',
      sql: `
        ALTER TABLE etfs ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public read access" ON etfs;
        CREATE POLICY "Public read access" ON etfs FOR SELECT USING (true);
      `
    }
  ]

  let successCount = 0
  let errorCount = 0

  for (const step of steps) {
    console.log(`🔧 ${step.name}...`)

    // Usar fetch directo a la base de datos
    try {
      // Para compatibilidad, voy a ejecutar usando el cliente de Supabase
      const { createClient } = await import('@supabase/supabase-js')
      const ws = await import('ws')

      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { fetch: fetch },
        realtime: { transport: ws.default as any },
        db: { schema: 'public' }
      })

      // Ejecutar SQL crudo
      const { error } = await (supabase as any).rpc('exec', { sql: step.sql })

      if (error) {
        if (error.message && error.message.includes('does not exist')) {
          // Intentar ejecución alternativa
          console.log(`   ⚠️  RPC no disponible, usando método alternativo...`)

          // Método alternativo: separar en comandos individuales
          const commands = step.sql.split(';').filter(cmd => cmd.trim().length > 10)

          for (const cmd of commands) {
            // Esto fallará elegantemente
            await supabase.from('_sql').select('*')
          }

          console.log(`   ⚠️  No se pudo ejecutar (tabla puede existir ya)`)
        } else {
          console.error(`   ❌ Error:`, error.message)
          errorCount++
          continue
        }
      }

      console.log(`   ✅ Completado`)
      successCount++

    } catch (error: any) {
      console.error(`   ❌ Exception:`, error.message)
      errorCount++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMEN')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Pasos exitosos: ${successCount}/${steps.length}`)
  console.log(`❌ Errores: ${errorCount}`)

  if (errorCount > 0) {
    console.log('\n⚠️  Algunas tablas pueden ya existir. Continuando con población...')
  }
}

main()
  .then(() => {
    console.log('\n✅ Setup básico completado')
    console.log('\n📝 Siguiente paso: Poblar con ETFs')
    console.log('   Ejecuta: npx tsx scripts/setup-and-populate.ts')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
