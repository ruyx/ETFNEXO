import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws }
  }
);

async function check() {
  // Check a few specific ISINs from the CSV
  const { data, error } = await supabase
    .from('etfs')
    .select(`
      isin, name, ter, aum_millions, return_1y, manager_id,
      fund_managers!manager_id (name)
    `)
    .in('isin', [
      'IE00056AT4A2', // First ETF in CSV
      'IE00B4L5Y983', // iShares Core MSCI World
      'IE00BYVQ9F29'  // NASDAQ 100
    ]);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('ETFs from import:');
  data?.forEach(etf => {
    console.log(`\n${etf.name} (${etf.isin}):`);
    console.log(`  Manager ID: ${etf.manager_id || 'NULL'}`);
    console.log(`  Manager Name: ${etf.fund_managers?.name || 'NULL'}`);
    console.log(`  TER: ${etf.ter !== null ? etf.ter.toFixed(4) : 'NULL'}`);
    console.log(`  AUM: ${etf.aum_millions !== null ? etf.aum_millions.toFixed(0) + 'M' : 'NULL'}`);
    console.log(`  Return 1Y: ${etf.return_1y !== null ? etf.return_1y.toFixed(2) + '%' : 'NULL'}`);
  });
}

check();
