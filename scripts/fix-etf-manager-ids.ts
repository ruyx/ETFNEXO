import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: fetch },
  realtime: { transport: ws as any }
});

async function fixManagerIds() {
  console.log('🔍 Verificando manager_id en ETFs...\n');

  // 1. Obtener todas las gestoras
  const { data: managers, error: managersError } = await supabase
    .from('fund_managers')
    .select('id, name');

  if (managersError) {
    console.error('Error obteniendo gestoras:', managersError);
    return;
  }

  console.log(`📊 Gestoras disponibles: ${managers.length}`);
  managers.forEach(m => console.log(`  - ${m.name}`));
  console.log('');

  // 2. Obtener todos los ETFs sin manager_id
  const { data: etfsWithoutManager, error: etfsError } = await supabase
    .from('etfs')
    .select('isin, name, manager_id')
    .is('manager_id', null)
    .limit(10);

  if (etfsError) {
    console.error('Error obteniendo ETFs:', etfsError);
    return;
  }

  console.log(`⚠️  ETFs sin manager_id: ${etfsWithoutManager.length}\n`);

  if (etfsWithoutManager.length > 0) {
    console.log('Ejemplos de ETFs sin gestora:');
    etfsWithoutManager.slice(0, 5).forEach(etf => {
      console.log(`  - ${etf.isin}: ${etf.name}`);
    });
    console.log('');
  }

  // 3. Intentar asignar manager_id basándose en el nombre del ETF
  console.log('🔧 Intentando asignar gestoras automáticamente...\n');

  // Mapeo de nombres comunes en ETFs
  const managerPatterns: Record<string, string[]> = {
    'iShares': ['ishares'],
    'Vanguard': ['vanguard'],
    'Amundi': ['amundi'],
    'Xtrackers': ['xtrackers'],
    'Invesco': ['invesco'],
    'WisdomTree': ['wisdomtree'],
    'SPDR': ['spdr', 'state street'],
    'HSBC': ['hsbc']
  };

  let fixed = 0;

  for (const [managerName, patterns] of Object.entries(managerPatterns)) {
    const manager = managers.find(m => m.name === managerName);
    if (!manager) continue;

    for (const pattern of patterns) {
      const { data: matchingETFs } = await supabase
        .from('etfs')
        .select('isin, name')
        .is('manager_id', null)
        .ilike('name', `%${pattern}%`);

      if (matchingETFs && matchingETFs.length > 0) {
        console.log(`📌 Asignando gestora "${managerName}" a ${matchingETFs.length} ETFs con patrón "${pattern}"...`);

        const { error: updateError } = await supabase
          .from('etfs')
          .update({ manager_id: manager.id })
          .is('manager_id', null)
          .ilike('name', `%${pattern}%`);

        if (updateError) {
          console.error(`   ❌ Error: ${updateError.message}`);
        } else {
          console.log(`   ✅ Actualizados correctamente`);
          fixed += matchingETFs.length;
        }
      }
    }
  }

  console.log(`\n✨ Total de ETFs asignados: ${fixed}`);

  // 4. Verificar estado final
  const { count: totalETFs } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true });

  const { count: withManager } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true })
    .not('manager_id', 'is', null);

  console.log('\n📈 ESTADO FINAL:');
  console.log(`Total ETFs: ${totalETFs}`);
  console.log(`Con gestora: ${withManager} (${((withManager || 0) / (totalETFs || 1) * 100).toFixed(1)}%)`);
  console.log(`Sin gestora: ${(totalETFs || 0) - (withManager || 0)} (${(((totalETFs || 0) - (withManager || 0)) / (totalETFs || 1) * 100).toFixed(1)}%)`);
}

fixManagerIds();
