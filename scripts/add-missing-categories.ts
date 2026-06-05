import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws as any }
  }
);

const bondETFs = [
  {
    isin: 'IE00B4WXJJ64',
    name: 'iShares Core € Corp Bond',
    yahoo_ticker: 'IEAC.L',
    category: 'bond',
    ter: 0.0020,
    aum_millions: 12500,
    return_1y: 4.2,
    sharpe_ratio: 0.85,
    benchmark_index: 'Bloomberg Euro Corporate Bond Index',
    domicile: 'IE',
    currency: 'EUR',
    number_of_holdings: 2500
  },
  {
    isin: 'IE00B3F81R35',
    name: 'iShares Core US Treasury Bond',
    yahoo_ticker: 'CSBGU.L',
    category: 'bond',
    ter: 0.0007,
    aum_millions: 8900,
    return_1y: 3.8,
    sharpe_ratio: 0.72,
    benchmark_index: 'ICE US Treasury Core Bond Index',
    domicile: 'IE',
    currency: 'USD',
    number_of_holdings: 150
  },
  {
    isin: 'IE00B1FZS798',
    name: 'iShares Euro Government Bond',
    yahoo_ticker: 'IEAG.L',
    category: 'bond',
    ter: 0.0020,
    aum_millions: 15600,
    return_1y: 5.1,
    sharpe_ratio: 0.91,
    benchmark_index: 'Bloomberg Euro Government Bond Index',
    domicile: 'IE',
    currency: 'EUR',
    number_of_holdings: 450
  }
];

const commodityETFs = [
  {
    isin: 'IE00B579F325',
    name: 'iShares Physical Gold ETC',
    yahoo_ticker: 'SGLN.L',
    category: 'commodity',
    ter: 0.0012,
    aum_millions: 14200,
    return_1y: 28.5,
    sharpe_ratio: 1.12,
    benchmark_index: 'LBMA Gold Price',
    domicile: 'IE',
    currency: 'USD',
    number_of_holdings: 1
  },
  {
    isin: 'IE00B6R52259',
    name: 'iShares Diversified Commodity',
    yahoo_ticker: 'ICOM.L',
    category: 'commodity',
    ter: 0.0019,
    aum_millions: 3400,
    return_1y: 12.3,
    sharpe_ratio: 0.65,
    benchmark_index: 'Bloomberg Commodity Index',
    domicile: 'IE',
    currency: 'USD',
    number_of_holdings: 20
  }
];

async function addETFs() {
  console.log('Adding bond ETFs...');
  for (const etf of bondETFs) {
    const { error } = await supabase.from('etfs').insert(etf);
    if (error) {
      console.error(`Error adding ${etf.name}:`, error.message);
    } else {
      console.log(`✅ Added ${etf.name}`);
    }
  }

  console.log('\nAdding commodity ETFs...');
  for (const etf of commodityETFs) {
    const { error } = await supabase.from('etfs').insert(etf);
    if (error) {
      console.error(`Error adding ${etf.name}:`, error.message);
    } else {
      console.log(`✅ Added ${etf.name}`);
    }
  }

  // Verify
  const { data: all } = await supabase.from('etfs').select('category');
  const categoryCount = all?.reduce((acc: any, etf: any) => {
    acc[etf.category] = (acc[etf.category] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📊 Category distribution:');
  console.log(JSON.stringify(categoryCount, null, 2));
}

addETFs().catch(console.error);
