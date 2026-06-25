import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: fetch },
  realtime: { transport: ws as any }
});

async function checkETFData() {
  const { data: etfs, error } = await supabase
    .from('etfs')
    .select('id, isin, name, yahoo_ticker, category, issuer_name, return_1y, ter, aum_millions, etfnexo_score')
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('📊 Primeros 10 ETFs en la base de datos:\n');
  etfs?.forEach((etf, i) => {
    console.log(`[${i + 1}] ${etf.name}`);
    console.log(`   ISIN: ${etf.isin}`);
    console.log(`   Ticker: ${etf.yahoo_ticker || 'N/A'}`);
    console.log(`   Gestora: ${etf.issuer_name || 'N/A'}`);
    console.log(`   Categoría: ${etf.category || 'N/A'}`);
    console.log(`   Ret 1Y: ${etf.return_1y !== null ? etf.return_1y.toFixed(2) + '%' : 'N/A'}`);
    console.log(`   TER: ${etf.ter !== null ? etf.ter.toFixed(2) + '%' : 'N/A'}`);
    console.log(`   AUM: ${etf.aum_millions !== null ? etf.aum_millions.toFixed(0) + 'M' : 'N/A'}`);
    console.log(`   Score: ${etf.etfnexo_score !== null ? etf.etfnexo_score.toFixed(1) : 'N/A'}`);
    console.log('');
  });

  // Estadísticas
  const { count: total } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true });

  const { count: withIssuer } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true })
    .not('issuer_name', 'is', null);

  const { count: withCategory } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true })
    .not('category', 'is', null);

  const { count: withReturn } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true })
    .not('return_1y', 'is', null);

  const { count: withTER } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true })
    .not('ter', 'is', null);

  const { count: withAUM } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true })
    .not('aum_millions', 'is', null);

  console.log('📈 ESTADÍSTICAS:');
  console.log(`Total ETFs: ${total}`);
  console.log(`Con gestora (issuer_name): ${withIssuer} (${((withIssuer || 0 / (total || 1)) * 100).toFixed(1)}%)`);
  console.log(`Con categoría: ${withCategory} (${((withCategory || 0 / (total || 1)) * 100).toFixed(1)}%)`);
  console.log(`Con return_1y: ${withReturn} (${((withReturn || 0 / (total || 1)) * 100).toFixed(1)}%)`);
  console.log(`Con TER: ${withTER} (${((withTER || 0 / (total || 1)) * 100).toFixed(1)}%)`);
  console.log(`Con AUM: ${withAUM} (${((withAUM || 0 / (total || 1)) * 100).toFixed(1)}%)`);
}

checkETFData();
