import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: fetch },
  realtime: { transport: ws as any }
});

async function checkETF() {
  // ETF que debería tener datos (del script de actualización)
  const isin = 'IE00B4L5Y983'; // iShares Core MSCI World

  const { data, error } = await supabase
    .from('etfs')
    .select('isin, name, ter, return_1y, aum_millions, sharpe_ratio, category')
    .eq('isin', isin)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('ETF encontrado:');
  console.log(JSON.stringify(data, null, 2));

  // Verificar cuántos ETFs tienen datos
  const { count: total } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true });

  const { count: withTER } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true })
    .not('ter', 'is', null);

  const { count: withReturn } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true })
    .not('return_1y', 'is', null);

  const { count: withAUM } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true })
    .not('aum_millions', 'is', null);

  console.log('\n📊 ESTADÍSTICAS DE DATOS:');
  console.log(`Total ETFs: ${total}`);
  console.log(`Con TER: ${withTER} (${((withTER || 0) / (total || 1) * 100).toFixed(1)}%)`);
  console.log(`Con Return 1Y: ${withReturn} (${((withReturn || 0) / (total || 1) * 100).toFixed(1)}%)`);
  console.log(`Con AUM: ${withAUM} (${((withAUM || 0) / (total || 1) * 100).toFixed(1)}%)`);
}

checkETF();
